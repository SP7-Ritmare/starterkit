/*
 * Copyright 2022, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import React from 'react';

function Spinner() {
    return (
        <>
            <div className="spinning" role="status">
                <span className="sr-only">Loading...</span>
            </div>
        </>
    );
}

export default Spinner;