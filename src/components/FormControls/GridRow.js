import { Grid } from '@mui/material';
import React from 'react';

const GridRow = ({children, ...others}) => {
    return <Grid item xs={12} {...others}>{children}</Grid>;
}

export default GridRow;