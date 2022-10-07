/*
 * Copyright 2022, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import url from 'url';
import turfBbox from '@turf/bbox';
import uuid from 'uuid';
import { getConfigProp } from '@mapstore/framework/utils/ConfigUtils';

function getExtentFromResource({ ll_bbox_polygon: llBboxPolygon }) {
    if (!llBboxPolygon) {
        return null;
    }
    const extent = turfBbox({
        type: 'Feature',
        properties: {},
        geometry: llBboxPolygon
    });
    const [minx, miny, maxx, maxy] = extent;
    const bbox = {
        crs: 'EPSG:4326',
        bounds: { minx, miny, maxx, maxy }
    };
    return bbox;
}

export const GXP_PTYPES = {
    AUTO: 'gxp_wmscsource',
    OWS: 'gxp_wmscsource',
    WMS: 'gxp_wmscsource',
    WFS: 'gxp_wmscsource',
    WCS: 'gxp_wmscsource',
    REST_MAP: 'gxp_arcrestsource',
    REST_IMG: 'gxp_arcrestsource',
    HGL: 'gxp_hglsource',
    GN_WMS: 'gxp_geonodecataloguesource'
};

/**
 * convert sos layer configuration to a mapstore layer object
 * @param {object} resource SOS layer resource
 * @return {object}
 */

export const resourceToLayerConfig = (resource) => {
    const {
        alternate,
        links = [],
        featureinfo_custom_template: template,
        title,
        perms,
        pk,
        has_time: hasTime,
        default_style: defaultStyle,
        ptype
    } = resource;

    const bbox = getExtentFromResource(resource);
    const defaultStyleParams = defaultStyle && {
        defaultStyle: {
            title: defaultStyle.sld_title,
            name: defaultStyle.workspace
                ? `${defaultStyle.workspace}:${defaultStyle.name}`
                : defaultStyle.name
        }
    };

    const extendedParams = {
        pk,
        mapLayer: {
            dataset: resource
        },
        isSOSLayer: true,
        ...defaultStyleParams
    };

    switch (ptype) {
        case GXP_PTYPES.REST_MAP:
        case GXP_PTYPES.REST_IMG: {
            const { url: arcgisUrl } =
                links.find(
                    ({ mime, link_type: linkType }) =>
                        mime === 'text/html' && linkType === 'image'
                ) || {};
            return {
                perms,
                id: `SOS:${uuid()}`,
                pk,
                type: 'arcgis',
                name: alternate.replace('remoteWorkspace:', ''),
                url: arcgisUrl,
                ...(bbox && { bbox }),
                title,
                visibility: true,
                extendedParams
            };
        }
        default:
            const { url: wfsUrl } =
                links.find(
                    ({ link_type: linkType }) => linkType === 'OGC:WFS'
                ) || {};
            const { url: wmsUrl } =
                links.find(
                    ({ link_type: linkType }) => linkType === 'OGC:WMS'
                ) || {};
            const { url: wmtsUrl } =
                links.find(
                    ({ link_type: linkType }) => linkType === 'OGC:WMTS'
                ) || {};

            const dimensions = [
                ...(hasTime
                    ? [
                          {
                              name: 'time',
                              source: {
                                  type: 'multidim-extension',
                                  url:
                                      wmtsUrl ||
                                      (wmsUrl || '').split('/geoserver/')[0] +
                                          '/geoserver/gwc/service/wmts'
                              }
                          }
                      ]
                    : [])
            ];

            const params = wmsUrl && url.parse(wmsUrl, true).query;
            const { defaultLayerFormat = 'image/png', defaultTileSize = 512 } =
                getConfigProp('geoNodeSettings') || {};
            return {
                perms,
                id: `SOS:${uuid()}`,
                pk,
                type: 'wms',
                name: alternate,
                url: wmsUrl || '',
                format: defaultLayerFormat,
                ...(wfsUrl && {
                    search: {
                        type: 'wfs',
                        url: wfsUrl
                    }
                }),
                ...(bbox && { bbox }),
                ...(template && {
                    featureInfo: {
                        format: 'TEMPLATE',
                        template
                    }
                }),
                style: defaultStyleParams?.defaultStyle?.name || '',
                title,
                tileSize: defaultTileSize,
                visibility: true,
                ...(params && { params }),
                ...(dimensions.length > 0 && { dimensions }),
                extendedParams
            };
    }
};
