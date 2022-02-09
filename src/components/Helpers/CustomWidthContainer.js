import React from 'react';
import Container from '@mui/material/Container';

const CustomWidthContainer = ({children, ...others}) => {
    return (
        <Container maxWidth='xl' sx={{ maxWidth: '1800px' }}>
            {children}
        </Container>
    )
}

export default CustomWidthContainer;