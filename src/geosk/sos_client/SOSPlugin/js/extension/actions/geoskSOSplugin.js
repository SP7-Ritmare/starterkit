/*
 * Copyright 2022, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

/**
 * Get slope angle from DEM inside getFeatureInfo on map click
 */
export const SET_COORDINATES = 'GEOSK:SET_COORDINATES';
export const SET_FOIS_RESPONSE = 'GEOSK:SET_FOIS_RESPONSE';
export const QUERY_COMPLETE = 'GEOSK:QUERY_COMPLETE';
export const QUERY_BEGAN = 'GEOSK:QUERY_BEGAN';
export const OPEN_CLOSE_MODAL = 'GEOSK:OPEN_CLOSE_MODAL';
export const SET_BASE_PATH = 'GEOSK:SET_BASE_PATH';

export const setCoordinates = (latlng) => {
    return {
        type: SET_COORDINATES,
        coordinates: latlng
    };
};

export const setFois = (fois) => {
    return {
        type: SET_FOIS_RESPONSE,
        fois
    };
};

export const queryComplete = () => {
    return {
        type: QUERY_COMPLETE
    };
};

export const queryBegan = () => {
    return {
        type: QUERY_BEGAN
    };
};

export const openCloseModal = (state) => {
    return {
        type: OPEN_CLOSE_MODAL,
        modalState: state
    };
};

export const setBasePath = (url) => {
    return {
        type: SET_BASE_PATH,
        url
    }
}