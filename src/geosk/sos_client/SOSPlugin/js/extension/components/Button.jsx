/*
 * Copyright 2022, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import React, { forwardRef } from 'react';
import { Button as ButtonRB } from 'react-bootstrap';

const Button = forwardRef(({ children, variant, size, ...props }, ref) => {
    return (
        <ButtonRB {...props} ref={ref} bsStyle={variant} bsSize={size}>
            {children}
        </ButtonRB>
    );
});

export default Button;
