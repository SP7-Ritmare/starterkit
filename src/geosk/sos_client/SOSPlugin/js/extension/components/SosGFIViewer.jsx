/*
 * Copyright 2022, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
import React from 'react';
import FoisModal from './FoisModal';

const SosGFIViewer = ({ lat, lng, iframeSrc, loading, fois, supportedOrigin, modalIsOpen, onOpenCloseModal, modalTitle }) => {
    const iframe = React.createRef();

    return (<FoisModal
        lat={lat} lng={lng}
        iframeSrc={iframeSrc}
        loading={loading}
        fois={fois}
        ref={iframe}
        supportedOrigin={supportedOrigin}
        modalIsOpen={modalIsOpen}
        setModalIsOpen={onOpenCloseModal}
        modalTitle={modalTitle}
    />);
};

export default SosGFIViewer;
