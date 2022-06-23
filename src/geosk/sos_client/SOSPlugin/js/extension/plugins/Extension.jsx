/*
 * Copyright 2022, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import React, { useState, useEffect, useRef } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { createSelector } from 'reselect';
import Message from '@mapstore/framework/components/I18N/Message';
import Button from '@js/extension/components/Button';
import { FormControl as FormControlRB, Glyphicon } from 'react-bootstrap';
import FaIcon from '@js/extension/components/FaIcon';
import localizedProps from '@mapstore/framework/components/misc/enhancers/localizedProps';
import {
    getAllSensors,
    getSOSServices,
    getObservableProperties
} from '@js/extension/api';
import Loader from '@mapstore/framework/components/misc/Loader';
import useInfiniteScroll from '@js/extension/hooks/UseInfiniteScroll';
import { addLayer } from '@mapstore/framework/actions/layers';
import { zoomToExtent } from '@mapstore/framework/actions/map';
import ResourceCard from '@js/extension/components/ResourceCard';
import { resourceToLayerConfig } from '@js/extension/utils/resourceUtils';
import { setControlProperty } from '@mapstore/framework/actions/controls';
import { isLoggedIn } from '@mapstore/framework/selectors/security';
import {
    closeSensorCatalogOnMapClick,
    getFOIsFromFeatureInfo
} from '@js/extension/epics/SOSPlugin';
import geoskSOSPlugin from '@js/extension/reducers/geoskSOSPlugin';
import SosGFIViewer from '@js/extension/components/SosGFIViewer';
import { error as errorNotification } from '@mapstore/framework/actions/notifications';
import { openCloseModal, setBasePath } from '@js/extension/actions/geoskSOSPlugin';
import '@js/extension/assets/style.css';

const FormControl = localizedProps('placeholder')(FormControlRB);

function InputControl({ onChange, value, ...props }) {
    return (
        <FormControl
            type="text"
            {...props}
            value={value}
            onChange={(event) => onChange(event.target.value)}
        />
    );
}

function Extension({
    request,
    page_size,
    onAdd,
    onClose,
    onZoomTo,
    placeholderId
}) {
    const [loading, setLoading] = useState(false);
    const [sensorList, setSensorList] = useState([]);
    const [sosServices, setSosServices] = useState([]);
    const [observableProperties, setObservableProperties] = useState([]);
    const [queryParams, setQueryParams] = useState({
        observable_property: '',
        sensor_title: ''
    });
    const [totalResults, setTotalResults] = useState(0);

    const { observable_property, sensor_title } = queryParams;

    const scrollContainer = useRef();
    const [page, setPage] = useState(1);
    const [isNextPageAvailable, setIsNextPageAvailable] = useState(false);
    const [q, setQ] = useState('');
    const isMounted = useRef();

    function initExtension() {
        setLoading(true);
        setPage(1);
        updateRequest.current({ page: 1, page_size: 7, reset: true });

        getObservableProperties().then((props) =>
            setObservableProperties(props.layers)
        );
        getSOSServices().then((props) => setSosServices(props.services));

        return () => setSensorList([]);
    }

    useEffect(initExtension, []);

    useInfiniteScroll({
        scrollContainer: scrollContainer.current,
        shouldScroll: () => !loading && isNextPageAvailable,
        onLoad: () => {
            setPage(page + 1);
        }
    });

    const updateRequest = useRef();
    updateRequest.current = (options) => {
        if (!loading && request) {
            if (scrollContainer.current && options.reset) {
                scrollContainer.current.scrollTop = 0;
            }

            setLoading(true);
            request({
                ...(q.length > 0 && { sensor_name: q }),
                ...(observable_property.length > 0 && { observable_property }),
                ...(sensor_title.length > 0 && { sensor_title }),
                page: options.page,
                page_size: options.page_size
            })
                .then((response) => {
                    if (isMounted.current) {
                        const newEntries = response.layers;
                        setSensorList(
                            options.page === 1
                                ? newEntries
                                : [...sensorList, ...newEntries]
                        );
                        setLoading(false);
                        setTotalResults(response.total);
                        const nextPageAvailable =
                            response.total > sensorList.length;
                        setIsNextPageAvailable(nextPageAvailable);
                    }
                })
                .catch(() => {
                    if (isMounted.current) {
                        setLoading(false);
                    }
                    setIsNextPageAvailable(false);
                });
        }
    };

    function setMounted() {
        isMounted.current = true;
        return () => {
            isMounted.current = false;
        };
    }

    useEffect(setMounted, []);

    function paginate() {
        if (page > 1) {
            totalResults > sensorList.length
                ? updateRequest.current({ page, page_size: 7 })
                : setIsNextPageAvailable(false);
        }
    }

    useEffect(paginate, [page]);

    function handleSelectResource(entry) {
        const layer = resourceToLayerConfig(entry);
        layer.featureInfo = {
            ...layer.featureInfo,
            viewer: { type: 'SosGFIViewer' },
            format: 'PROPERTIES'
        };
        onAdd(layer);
        const { minx, miny, maxx, maxy } = layer?.bbox?.bounds || {};
        const extent = layer?.bbox?.bounds && [minx, miny, maxx, maxy];
        if (extent) {
            onZoomTo(extent, layer?.bbox?.crs);
        }
    }

    const handleFilter = (name) => (event) => {
        const value = event.target.value;

        setQueryParams({ ...queryParams, [name]: value });
    };

    useEffect(() => {
        observable_property.length > 0 &&
            getSOSServices({ observable_property }).then((props) =>
                setSosServices(props.services)
            );

        sensor_title.length > 0 &&
            getObservableProperties({ sos_url: sensor_title }).then((props) =>
                setObservableProperties(props.layers)
            );
    }, [queryParams]);

    const submitSearch = (event) => {
        event.preventDefault();
        setLoading(true);
        getAllSensors({
            ...(q.length > 0 && { sensor_name: q }),
            ...(observable_property.length > 0 && { observable_property }),
            ...(sensor_title.length > 0 && { sensor_title })
        })
            .then((response) => {
                setSensorList(response.layers);
                return setLoading(false);
            })
            .catch(() => {
                setSensorList([]);
                return setLoading(false);
            });
    };

    return (
        <div className="extension">
            <div className="geosk-extension-head">
                <div>
                    <Glyphicon glyph="folder-open" />
                </div>
                <div className="geosk-sensors-catalog-title">
                    <h4>
                        <Message msgId="geoskViewer.sensorCatalogue" />
                    </h4>
                </div>
                <div>
                    <Button
                        className="square-button"
                        style={{ background: 'transparent', color: '#fff' }}
                        onClick={onClose}
                    >
                        <Glyphicon glyph="1-close" />
                    </Button>
                </div>
            </div>
            <div className="geosk-extension-body">
                <div className="geosk-filters">
                    <div className="geosk-sensors-catalog-filter input-group">
                        <InputControl
                            className="form-control"
                            placeholder={placeholderId}
                            value={q}
                            onChange={(value) => setQ(value)}
                        />
                        {!loading ? (
                            <span className="input-group-btn">
                                <Button
                                    className="btn-sk"
                                    onClick={() => setQ('')}
                                >
                                    <FaIcon name="times" />
                                </Button>
                            </span>
                        ) : (
                            <Loader size={2} />
                        )}
                    </div>
                    <div className="form-group">
                        <select
                            className="form-control"
                            onChange={handleFilter('observable_property')}
                        >
                            <option value="">
                                Choose an Observable Property
                            </option>
                            {observableProperties?.length > 0 &&
                                observableProperties?.map((property) => (
                                    <option
                                        key={property.sensor_name}
                                        value={property.definition}
                                    >
                                        {property.property_label}
                                    </option>
                                ))}
                        </select>
                    </div>
                    <div className="form-group">
                        <select
                            className="form-control"
                            onChange={handleFilter('sensor_title')}
                        >
                            <option value="">Choose a SOS Service</option>
                            {sosServices?.length > 0 &&
                                sosServices?.map((service) => (
                                    <option
                                        key={service.id}
                                        value={service.online_resource}
                                    >
                                        {service.title}
                                    </option>
                                ))}
                        </select>
                    </div>
                    <div>
                        <Button
                            variant="primary"
                            size="sm"
                            type="submit"
                            onClick={submitSearch}
                        >
                            <Message msgId="geoskViewer.search" />
                        </Button>
                    </div>
                </div>
                <div
                    ref={scrollContainer}
                    className="geosk-sensors-catalog-body"
                >
                    <ul className="geosk-sensors-catalog-list">
                        {sensorList?.map((entry) => {
                            return (
                                <li key={entry.pk}>
                                    <ResourceCard
                                        data={entry}
                                        readOnly
                                        layoutCardsStyle="list"
                                        onClick={() =>
                                            handleSelectResource(entry)
                                        }
                                    />
                                </li>
                            );
                        })}
                        {sensorList?.length === 0 && !loading && (
                            <div className="geosk-sensors-catalog-alert">
                                <Message msgId="geoskViewer.sosCatalogEntriesNoResults" />
                            </div>
                        )}
                    </ul>
                </div>
                {loading && sensorList?.length === 0 && (
                    <div
                        style={{
                            position: 'absolute',
                            top: 0,
                            left: 0,
                            width: '100%',
                            height: '100%',
                            backgroundColor: 'rgba(255, 255, 255, 0.8)',
                            zIndex: 2,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                        }}
                    >
                        <Loader size={70} />
                    </div>
                )}
            </div>
        </div>
    );
}

Extension.propTypes = {
    request: PropTypes.func,
    page_size: PropTypes.number,
    onAdd: PropTypes.func,
    placeholderId: PropTypes.string,
    onClose: PropTypes.func,
    onZoomTo: PropTypes.func
};

Extension.defaultProps = {
    request: getAllSensors,
    page_size: 4,
    onAdd: () => {},
    placeholderId: 'geoskViewer.SearchSensors',
    onZoomTo: () => {},
    onClose: () => {}
};

const SOSCatalog = ({
    enabled,
    lat,
    lng,
    iframeSrc,
    supportedOrigin,
    loading,
    fois,
    modalIsOpen,
    onOpenCloseModal,
    modalTitle,
    onSetBasePath,
    basePath,
    ...props
}) => {

    useEffect(() => {
        onSetBasePath(basePath)
    }, [basePath])

    return (
        <div>
            {enabled && <Extension {...props} />}
            <SosGFIViewer
                lat={lat}
                lng={lng}
                iframeSrc={iframeSrc}
                supportedOrigin={supportedOrigin}
                loading={loading}
                fois={fois}
                modalIsOpen={modalIsOpen}
                onOpenCloseModal={onOpenCloseModal}
                modalTitle={modalTitle}
            />
        </div>
    );
};

const ConnectedExtension = connect(
    createSelector(
        [
            (state) => state.controls?.SOSPlugin?.enabled || false,
            (state) =>
                state.geoskSOSPlugin?.latlng?.lat ||
                state.clickPoint?.latlng?.lat ||
                0,
            (state) =>
                state.geoskSOSPlugin?.latlng?.lng ||
                state.clickPoint?.latlng?.lng ||
                0,
            (state) => state.geoskSOSPlugin?.loading || false,
            (state) => state.geoskSOSPlugin?.fois || null,
            (state) => state.geoskSOSPlugin?.modalIsOpen || false
        ],
        (enabled, lat, lng, loading, fois, modalIsOpen) => ({
            enabled,
            lat,
            lng,
            loading,
            fois,
            modalIsOpen,
        })
    ),
    {
        onAdd: addLayer,
        onClose: setControlProperty.bind(null, 'SOSPlugin', 'enabled', false),
        onZoomTo: zoomToExtent,
        onError: errorNotification,
        onOpenCloseModal: openCloseModal,
        onSetBasePath: setBasePath
    }
)(SOSCatalog);

export default {
    name: __MAPSTORE_EXTENSION_CONFIG__.name,
    component: ConnectedExtension,
    reducers: { geoskSOSPlugin },
    epics: {
        closeSensorCatalogOnMapClick,
        getFOIsFromFeatureInfo,
    },
    containers: {
        BurgerMenu: {
            name: 'SOSPlugin',
            position: 40,
            text: <Message msgId="geoskViewer.sensorCatalogue" />,
            icon: <Glyphicon glyph="folder-open" />,
            action: setControlProperty.bind(null, 'SOSPlugin', 'enabled', true),
            selector: createSelector(isLoggedIn, (loggedIn) => ({
                style: loggedIn ? {} : { display: 'none' }
            }))
        }
    }
};
