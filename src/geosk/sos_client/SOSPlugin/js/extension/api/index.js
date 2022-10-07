/*
 * Copyright 2022, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import axios from '@mapstore/framework/libs/ajax';
import { setConfigProp } from '@mapstore/framework/utils/ConfigUtils';

setConfigProp('proxyUrl', {
    url: 'proxy/?url=',
    useCORS: ['/api/v2/sos'],
    autoDetectCORS: true
});

export const getAllSensors = (params = {}) => {
    return axios
        .get('/api/v2/sos/sensors', { params: { ...params } })
        .then(({ data }) => data);
};

export const getSOSServices = (params = {}) => {
    return axios
        .get('/api/v2/sos/sos_service', { params: { ...params } })
        .then(({ data }) => data);
};

export const getObservableProperties = (params = {}) => {
    return axios
        .get('/api/v2/sos/observable_properties', { params: { ...params } })
        .then(({ data }) => data);
};

export const getFOIs = (params = {}) => {
    return axios
        .get(`/api/v2/sos/fois`, { params: { ...params } })
        .then(({ data }) => data);
};
