import React from 'react';
import PropTypes from 'prop-types';
import { Box } from '@mui/material';

const WizardStep = ({ disablePadding, children }) => {
	return (
		<Box>
			<Box sx={{ p: disablePadding ? 0 : 1 }}>{children}</Box>
		</Box>
	);
};

WizardStep.propTypes = {
	title: PropTypes.string.isRequired, //! Used in WizardStepper
	disablePadding: PropTypes.bool,
	children: PropTypes.oneOfType([PropTypes.string, PropTypes.object, PropTypes.array]),
};

export default WizardStep;
