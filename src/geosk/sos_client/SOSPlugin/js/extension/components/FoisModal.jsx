/*
 * Copyright 2022, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
import React, { forwardRef, useEffect, memo } from 'react';
import Message from '@mapstore/framework/components/I18N/Message';
import { Glyphicon } from 'react-bootstrap';
import { Rnd } from "react-rnd";
import Spinner from './Spinner';
import Button from './Button.jsx';


const FoisModal = forwardRef((props, ref) => {
    const { loading, fois, lat, lng, iframeSrc, supportedOrigin, modalIsOpen, setModalIsOpen, modalTitle } = props;

    const closeModal = () => setModalIsOpen(false)

    useEffect(() => {
        if (fois) {
            !modalIsOpen && setModalIsOpen(true)
            const payload = {
                payload: {...fois},
                clickCoordinates: { lat, lng }
            };
            ref?.current?.contentWindow.postMessage(
                payload,
                supportedOrigin
            )
        }
    }, [fois]);

    return (
        <div className="geosk-GFI-viewer-wrapper">
            <Rnd
                style={{display: modalIsOpen ? 'inline-block' : 'none', border: '1px solid #eee'}}
                default={{
                    x: 50,
                    y: 100,
                    width: 800,
                    height: 400,
                }}
                minWidth={500}
                minHeight={190}
                bounds="#page-map-viewer"
            >
                <div
                    className="flexible-modal-drag-area"
                >
                    <div className='flexible-modal-title'>
                        {modalTitle ? <span>{modalTitle}</span> : <Message msgId="geoskViewer.modalTitle" />}
                        {loading && <Spinner />}
                    </div>
                    <Button
                        className="square-button"
                        variant="primary"
                        onClick={closeModal}
                    >
                        <Glyphicon glyph="1-close" />
                    </Button>
                </div>
                    <iframe ref={ref} src={iframeSrc} />
            </Rnd>
        </div>
    );
});

export default memo(FoisModal);
