/*
 * Copyright 2022, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { Observable } from 'rxjs';
import { CLICK_ON_MAP } from '@mapstore/framework/actions/map';
import axios from '@mapstore/framework/libs/ajax';
import { setControlProperty } from '@mapstore/framework/actions/controls';
import { setCoordinates, setFois, queryComplete, queryBegan, openCloseModal } from '@js/extension/actions/geoskSOSplugin';
import { error as errorNotification } from '@mapstore/framework/actions/notifications';
import { INFO_FORMATS } from '@mapstore/framework/utils/featureInfoUtils';
import { layersSelector } from '@mapstore/framework/selectors/layers';
import {
    reproject,
    getProjectedBBox
} from '@mapstore/framework/utils/CoordinatesUtils';
import { mapSelector } from '@mapstore/framework/selectors/map';
import { isNil } from 'lodash';
import { getFOIs } from '../api';

export const closeSensorCatalogOnMapClick = (action$, store) =>
    action$
        .ofType(CLICK_ON_MAP)
        .filter(() => store.getState().controls?.SOSPlugin?.enabled === true)
        .switchMap(() =>
            Observable.of(setControlProperty('SOSPlugin', 'enabled', false))
        );

export const getFOIsFromFeatureInfo = (action$, { getState = () => { } }) =>
    action$
        .ofType(CLICK_ON_MAP)
        .filter(() => {
            const sosLayerAvailable = layersSelector(getState())?.filter(layer => layer.group !== 'background' && layer.featureInfo?.viewer?.type === 'SosGFIViewer')?.map(layer => layer.name) || [];

            const user = getState()?.security?.user;

            return user && sosLayerAvailable.length > 0;
        })
        .switchMap(({ point }) => {
            const state = getState();
            const latlng = point.latlng;

            const map = mapSelector(state);

            const heightBBox = 101;
            const widthBBox = 101;
            const size = [heightBBox, widthBBox];
            const rotation = 0;
            const resolution = isNil(map.resolution)
                ? getCurrentResolution(Math.ceil(map.zoom), 0, 21, 96)
                : map.resolution;
            let wrongLng = point.latlng.lng;
            let lngCorrected =
                wrongLng - 360 * Math.floor(wrongLng / 360 + 0.5);
            const center = { x: lngCorrected, y: point.latlng.lat };
            let centerProjected = reproject(
                center,
                'EPSG:4326',
                map.projection
            );
            let bounds = getProjectedBBox(
                centerProjected,
                resolution,
                rotation,
                size,
                null
            );

            const layers = layersSelector(state)?.filter(layer => layer.group !== 'background' && layer.featureInfo?.viewer?.type === 'SosGFIViewer')?.map(layer => layer.name)
 
            const basePath = state.geoskSOSPlugin.basePath || '/geoserver/ows';

            return Observable.defer(() => axios.get(basePath, {
                params: {
                    service: 'WMS',
                    version: '1.1.1',
                    request: 'GetFeatureInfo',
                    exceptions: INFO_FORMATS.JSON,
                    layers: layers.join(','),
                    height: 101,
                    width: 101,
                    srs: map.projection,
                    bbox:
                        bounds.minx +
                        ',' +
                        bounds.miny +
                        ',' +
                        bounds.maxx +
                        ',' +
                        bounds.maxy,
                    feature_count: 10,
                    info_format: INFO_FORMATS.JSON,
                    query_layers: layers.join(','),
                    styles: '',
                    x:
                        widthBBox % 2 === 1
                            ? Math.ceil(widthBBox / 2)
                            : widthBBox / 2,
                    y:
                        widthBBox % 2 === 1
                            ? Math.ceil(widthBBox / 2)
                            : widthBBox / 2,
                    access_token: state.security.token
                }
            }
            )
                .then(data => data.data))
                .switchMap((res) => {
                    const id = [];
                    const sensor_id = [];
                    res.features?.forEach(({ properties }) => {
                        id.push(properties.id);
                        sensor_id.push(properties.resource_id);
                    })

                    return (id.length > 0 &&
                        sensor_id.length > 0) ? Observable.defer(() => getFOIs({ id, sensor_id }))
                            .switchMap((responseData) => {
                                return Observable.of(
                                    setCoordinates(latlng),
                                    setFois(responseData),
                                    queryComplete()
                                )
                            }) : res.exceptions
                        ? Observable.of(
                            errorNotification({
                                title: 'geoskViewer.error',
                                message: 'geoskViewer.noFOIsForLayer'
                            }),
                            queryComplete()
                        )
                        : Observable.of(
                            setCoordinates(latlng),
                            queryComplete(),
                            errorNotification({
                                title: 'geoskViewer.noFeaturesFound',
                                message: 'geoskViewer.noSOSInfo'
                            })
                        );
                })
                .catch((error) =>
                    Observable.of(
                        errorNotification({
                            title: 'geoskViewer.error',
                            message:
                                error?.data?.detail ||
                                error?.originalError?.message ||
                                error?.message ||
                                'geoskViewer.actionFailed'
                        }),
                        queryComplete()
                    )
                ).startWith(queryBegan(), openCloseModal(true))
        });

export default {
    closeSensorCatalogOnMapClick,
    getFOIsFromFeatureInfo
};