/*
 * Copyright 2022, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import React, { forwardRef, useState } from 'react';
import Message from '@mapstore/framework/components/I18N/Message';
import { Glyphicon } from 'react-bootstrap';
import Button from '@js/extension/components/Button';
import FaIcon from '@js/extension/components/FaIcon';
import ALink from '@js/extension/components/ALink';

const ResourceCard = forwardRef(
    ({ data, layoutCardsStyle, readOnly, onClick, loading }, ref) => {
        const [res] = useState(data);
        const [imgError, setImgError] = useState(false);

        function handleClick() {
            onClick(data);
        }
        const imgClassName =
            layoutCardsStyle === 'list' ? 'card-img-left' : 'card-img-top';
        return (
            <div
                ref={ref}
                onClick={handleClick}
                className={`geosk-resource-card${
                    readOnly ? ' read-only' : ''
                } geosk-card-type-${layoutCardsStyle} ${
                    layoutCardsStyle === 'list' ? 'rounded-0' : ''
                }`}
            >
                <div className={`card-resource-${layoutCardsStyle}`}>
                    {imgError ? (
                        <div
                            className={`${imgClassName} card-img-placeholder`}
                        />
                    ) : (
                        <img
                            className={imgClassName}
                            src={res.thumbnail_url}
                            onError={() => setImgError(true)}
                        />
                    )}
                    <div className="geosk-resource-card-body-wrapper">
                        <div className="card-body">
                            <div className="card-title">
                                <div>
                                    {!loading && (
                                        <>
                                            <ALink
                                                readOnly={readOnly}
                                                href={res.sosUrl}
                                            >
                                                <FaIcon name="icon" />
                                            </ALink>
                                        </>
                                    )}
                                    <ALink
                                        className="geosk-card-title"
                                        readOnly={readOnly}
                                        href={res.sosUrl}
                                    >
                                        {res.title}
                                    </ALink>
                                    {res.sensorId && <hr />}
                                </div>
                                <div className="geosk-sensor-add">
                                    <Button variant="primary" size="sm">
                                        <Glyphicon glyph="plus" />
                                    </Button>
                                </div>
                            </div>
                            <p className="card-text geosk-card-description">
                                {res.sensorId}
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        );
    }
);

ResourceCard.defaultProps = {
    links: [],
    onClick: () => {},
    loading: false
};

export default ResourceCard;
