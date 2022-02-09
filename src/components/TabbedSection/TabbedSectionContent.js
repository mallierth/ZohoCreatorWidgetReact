import React from 'react';
import PropTypes from 'prop-types';
import Box from '@mui/material/Box';

const TabbedSectionContent = ({ children, sx }) => {
	return (
		<Box sx={{ ...sx }}>
			{children}
		</Box>
	);
};

TabbedSectionContent.propTypes = {
	children: PropTypes.oneOfType([
		PropTypes.string,
		PropTypes.object,
		PropTypes.array,
	]),
	sx: PropTypes.object,
};

TabbedSectionContent.defaultProps = {
	sx: {},
}

export default TabbedSectionContent;
