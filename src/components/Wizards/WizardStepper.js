//import { useWhyDidYouUpdate } from 'use-why-did-you-update';
import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import {
	Box,
	Button,
	Divider,
	Grid,
	MobileStepper,
	Paper,
	Step,
	StepLabel,
	Stepper,
} from '@mui/material';
import {
	DoneAll,
	KeyboardArrowLeft,
	KeyboardArrowRight,
} from '@mui/icons-material';
import {
	LoadingButton,
} from '@mui/lab';
import { useTheme } from '@mui/material/styles';
import useMediaQuery from '@mui/material/useMediaQuery';
import { childrenCount } from '../Helpers/functions';

const WizardStepper = ({
	children,
	activeStep,
	setActiveStep,
	overrideDisableBack,
	overrideDisableNext,
	overrideDisableFinish,
	hideNavigation,
	onClickFinish,
	hideContentPaperBackground,
}) => {
	const theme = useTheme();
	const desktopMode = useMediaQuery(theme.breakpoints.up('sm'));
	const maxSteps = childrenCount(children);
	const [loading, setLoading] = useState(false);

	const [contentHeight, setContentHeight] = useState(
		desktopMode ? 'auto' : window.innerHeight - 51 - 4 - 52 - 8
	);

	useEffect(() => {
		setContentHeight(
			desktopMode ? 'auto' : window.innerHeight - 51 - 4 - 52 - 8
		); //Subtract out navbar, pt mobileStepper 0.5, mobileStepper, pb mobileStepper 1
	}, [desktopMode]);

	const handleNext = () => {
		//setActiveStep((prevActiveStep) => prevActiveStep + 1);
		setActiveStep(activeStep + 1);
	};

	const handleBack = () => {
		//setActiveStep((prevActiveStep) => prevActiveStep - 1);
		setActiveStep(activeStep - 1);
	};

	return (
		<Box
			sx={{
				minWidth: { xs: null, sm: 650 },
				borderColor: 'primary.main',
				borderLeft: (theme) =>
					theme.palette.mode === 'dark' && desktopMode ? 2 : null,
				borderRight: (theme) =>
					theme.palette.mode === 'dark' && desktopMode ? 2 : null,
				borderBottom: (theme) =>
					theme.palette.mode === 'dark' && desktopMode ? 2 : null,
			}}>
			<Box
				sx={{
					backgroundColor: 'background.default',
					width: '100%',
				}}>
				{!hideNavigation && desktopMode ? (
					<Stepper activeStep={activeStep} alternativeLabel sx={{ p: 1 }}>
						{React.Children.map(React.Children.toArray(children), (child) => (
							<Step key={child.props.title}>
								<StepLabel>{child.props.title}</StepLabel>
							</Step>
						))}
					</Stepper>
				) : <Box sx={{ pt: 1 }}></Box>}
				<Box
					sx={{
						pb: 0.5,
						px: 1,
						pt: desktopMode ? 0 : 1,
						overflowY: 'auto',
						maxHeight: desktopMode ? window.innerHeight - 300 : contentHeight,
						minHeight: desktopMode ? null : contentHeight,
					}}>
					{hideContentPaperBackground ? (
						<Box>
							{children.map((child, index) =>
								index === activeStep ? child : null
							)}
						</Box>
					) : (
						<Paper elevation={3}>
							{children.map((child, index) =>
								index === activeStep ? child : null
							)}
						</Paper>
					)}
				</Box>
			</Box>
			<Box
				sx={{
					backgroundColor: 'background.default',
					display: 'flex',
					pt: 0.5,
					px: 1,
					pb: 1,
				}}>
				<MobileStepper
					sx={{ flex: 'auto', backgroundColor: 'background.paper', visibility : hideNavigation ? 'hidden' : 'visible' }}
					position='static'
					square={false}
					elevation={3}
					steps={maxSteps}
					activeStep={activeStep}
					nextButton={
						<Button
							size={desktopMode ? 'small' : 'medium'}
							onClick={handleNext}
							disabled={activeStep === maxSteps - 1 || loading || overrideDisableNext}>
							Next
							<KeyboardArrowRight />
						</Button>
					}
					backButton={
						<Button
							size={desktopMode ? 'small' : 'medium'}
							onClick={handleBack}
							disabled={activeStep === 0 || loading || overrideDisableBack}>
							<KeyboardArrowLeft />
							Back
						</Button>
					}
				/>
				<LoadingButton
					sx={{ ml: 1 }}
					variant='contained'
					endIcon={<DoneAll />}
					loading={loading}
					loadingPosition='end'
					size={desktopMode ? 'small' : 'medium'}
					disabled={activeStep !== maxSteps - 1 || overrideDisableFinish}
					onClick={() => {
						setLoading(true);
						onClickFinish();
					}}>
					Finish
				</LoadingButton>
			</Box>
		</Box>
	);
};

WizardStepper.propTypes = {
	children: PropTypes.array,
	steps: PropTypes.array.isRequired,
	activeStep: PropTypes.number,
	setActiveStep: PropTypes.func,
	//setActiveStep: PropTypes.number,
	hideNavigation: PropTypes.bool,
	overrideDisableBack: PropTypes.bool,
	overrideDisableNext: PropTypes.bool,
	overrideDisableFinish: PropTypes.bool,
	onClickFinish: PropTypes.func.isRequired,
	hideContentPaperBackground: PropTypes.bool,
};

WizardStepper.defaultProps = {
	steps: [],
	activeStep: 0,
};

export default WizardStepper;
