import React from 'react';
import PropTypes from 'prop-types';
import Stepper from '@mui/material/Stepper';
import Step from '@mui/material/Step';
import StepLabel from '@mui/material/StepLabel';
import { styled } from '@mui/material/styles';
import { Box, Typography } from '@mui/material';
import StepConnector, {
	stepConnectorClasses,
} from '@mui/material/StepConnector';
import { useTheme } from '@mui/material/styles';
import useMediaQuery from '@mui/material/useMediaQuery';

/*
const CustomStepConnector = styled(StepConnector)(({ theme }) => ({
	[`&.${stepConnectorClasses.alternativeLabel}`]: {
		top: 10,
		left: 'calc(-50% + 16px)',
		right: 'calc(50% + 16px)',
	},
	[`&.${stepConnectorClasses.active}`]: {
		[`& .${stepConnectorClasses.line}`]: {
			borderColor: theme.palette.primary.main,
		},
	},
	[`&.${stepConnectorClasses.completed}`]: {
		[`& .${stepConnectorClasses.line}`]: {
			borderColor: theme.palette.primary.light,
		},
	},
	[`& .${stepConnectorClasses.line}`]: {
		borderColor:
			theme.palette.mode === 'dark'
				? theme.palette.grey[800]
				: theme.palette.grey[400],
		borderTopWidth: 3,
		borderRadius: 1,
	},
}));
*/

//connector={<CustomStepConnector />}

const StatusGraphic = ({ statuses, value, onChange, disabled }) => {
	const theme = useTheme();
	const desktopMode = useMediaQuery(theme.breakpoints.up('sm'));
	const _disabled = disabled && disabled(value);

	return (
		<Box sx={{ py: 2 }}>
			<Stepper
				alternativeLabel={desktopMode}
				activeStep={
					statuses && value && statuses.includes(value)
						? statuses.indexOf(value)
						: -1
				}
				orientation={desktopMode ? 'horizontal' : 'vertical'}>
				{statuses.map((status) => (
					<Step
						key={status}
						onClick={() => onChange(status)}
						sx={{
							'& :hover': {
								'& .MuiStepLabel-label': {
									color: 'primary.main',
									cursor: 'pointer!important',
								},
								'& .MuiSvgIcon-root': {
									color: 'primary.main',
									cursor: 'pointer!important',
								},
							},
							pointerEvents: status === value || _disabled ? 'none' : 'auto',
						}}>
						<StepLabel>{status}</StepLabel>
					</Step>
				))}
			</Stepper>
		</Box>
	);
};

StatusGraphic.propTypes = {
	statuses: PropTypes.array.isRequired,
	value: PropTypes.string,
	onChange: PropTypes.func,
	disabled: PropTypes.func,
};

StatusGraphic.defaultProps = {
	statuses: [],
};

export default StatusGraphic;
