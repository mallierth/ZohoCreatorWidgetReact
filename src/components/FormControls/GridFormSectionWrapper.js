import React from 'react';
import { Box, Grid } from '@mui/material';

const GridFormSectionWrapper = ({ children, ...others }) => {
    //Defauly to 2 columns wide and x gutter 3
    return (
        <Box sx={{ pr: { xs: 2, md: 0 } }}>
            <Grid container rowSpacing={{ xs: 4, md: 4 }} columnSpacing={4} {...others}>
                {children}
            </Grid>
        </Box>
    )
}
export default GridFormSectionWrapper;