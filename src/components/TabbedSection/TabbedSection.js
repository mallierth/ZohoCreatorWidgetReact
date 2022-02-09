import React from 'react';
import PropTypes from 'prop-types';
import { Box, Card, CardContent } from '@mui/material';

const TabbedSection = ({ children }) => {
	return (
		<Card raised sx={{ mt: 1 }} elevation={4}>
			<Box>{children}</Box>
		</Card>
	);
};

TabbedSection.propTypes = {
	children: PropTypes.oneOfType([PropTypes.object, PropTypes.array]),
};

export default TabbedSection;
