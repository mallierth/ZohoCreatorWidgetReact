import React from 'react';
import { Box } from '@mui/material';

/*
const useStyles = makeStyles((theme) => ({
    root: 
}))
*/
const PageWrapper = (props) => {
    //const classes = useStyles();
    return (
        <Box sx={{ mx: 2, pb: 2, position: 'relative', top: props.top }}>
            { props.children }
        </Box>
    )
}

export default PageWrapper;