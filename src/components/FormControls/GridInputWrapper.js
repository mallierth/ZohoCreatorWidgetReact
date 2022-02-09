import React from 'react';
import PropTypes from 'prop-types';
import { Grid } from '@mui/material';

const GridInputWrapper = ({ children, xs, md, massUpdating, hidden, sx, ...others }) => {
	return (
		<Grid item xs={xs} md={massUpdating ? 12 : md} sx={{ ...sx, display: hidden ? 'none' : 'block' }} {...others}>
			{children}
		</Grid>
	);
};

GridInputWrapper.propTypes = {
	children: PropTypes.oneOfType([PropTypes.object, PropTypes.array]),
	xs: PropTypes.number,
	md: PropTypes.number,
	massUpdating: PropTypes.bool,
    hidden: PropTypes.bool,
    sx: PropTypes.object,
};

GridInputWrapper.defaultProps = {
	xs: 12,
	md: 6,
	massUpdating: false,
    hidden: false,
    sx: {},
};

export default GridInputWrapper;
