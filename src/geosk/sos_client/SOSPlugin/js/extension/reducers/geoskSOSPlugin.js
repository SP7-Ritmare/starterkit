/*
 * Copyright 2022, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { SET_COORDINATES, SET_FOIS_RESPONSE, QUERY_COMPLETE, QUERY_BEGAN, OPEN_CLOSE_MODAL, SET_BASE_PATH } from '@js/extension/actions/geoskSOSplugin';

const defaultState = { latlng: { lat: 0, lng: 0 }, loading: false, fois: null, modalIsOpen: false, basePath: '/geoserver/ows' };

const geoskSOSPlugin = (state = defaultState, action) => {
    switch (action.type) {
        case SET_COORDINATES: {
            const point = action.coordinates;
            const lat = Math.round(point.lat * 100000) / 100000;
            const lng = Math.round(point.lng * 100000) / 100000;

            return {
                ...state,
                latlng: { lat, lng }
            };
        }
            
        case SET_FOIS_RESPONSE: {
            const { fois } = action;
            return {
                ...state,
                fois
            }
        }
            
        case QUERY_BEGAN: {
            return {
                ...state,
                loading: true,
            };
        }
            
        case QUERY_COMPLETE: {
            return {
                ...state,
                loading: false,
            };
        }
            
        case OPEN_CLOSE_MODAL: {
            return {
                ...state,
                modalIsOpen: action.modalState,
            };
        }
            
        case SET_BASE_PATH: {
            return {
                ...state,
                basePath: action.url
            }
        }

        default:
            return state;
    }
};

export default geoskSOSPlugin;
