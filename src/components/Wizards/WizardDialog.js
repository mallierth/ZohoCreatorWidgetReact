import React from 'react';
import PropTypes from 'prop-types';
//import { useRecoilValue } from 'recoil';
import {
	AppBar,
	Dialog,
	DialogContent,
	IconButton,
	Paper,
	Toolbar,
} from '@mui/material';
import { Close } from '@mui/icons-material';
import { createTheme, ThemeProvider, useTheme } from '@mui/material/styles';
import useMediaQuery from '@mui/material/useMediaQuery';
import WizardStepper from './WizardStepper';
import Draggable from 'react-draggable';
//import { formMaxWidthState } from '../../recoil/atoms';

const PaperComponent = (props) => {
	return (
		<Draggable
			handle='#draggable-dialog-title'
			cancel={'[class*="MuiDialogContent-root"]'}>
			<Paper {...props} />
		</Draggable>
	);
};

const WizardDialog = ({
	title,
	open,
	onClose,
	maxWidth,
	children,
	activeStep,
	setActiveStep,
	steps,
	overrideDisableBack,
	overrideDisableNext,
	overrideDisableFinish,
	hideNavigation,
	onClickFinish,
	hideContentPaperBackground,
}) => {
	//const formMaxWidth = useRecoilValue(formMaxWidthState);
	const theme = useTheme();
	const desktopMode = useMediaQuery(theme.breakpoints.up('sm'));

	return (
		<Dialog
			fullScreen={!desktopMode}
			maxWidth={maxWidth}
			open={open}
			onClose={onClose}
			PaperComponent={desktopMode ? PaperComponent : Paper}>
			<AppBar
				color={'primary'}
				enableColorOnDark
				position='relative'
				sx={{ cursor: desktopMode ? 'move' : 'auto' }}
				id='draggable-dialog-title'>
				<Toolbar
					sx={{
						minHeight: { xs: 51 },
						px: { xs: 1 },
						justifyContent: 'space-between',
					}}>
					{title}
					<ThemeProvider
						theme={createTheme({
							palette: {
								mode: 'light',
								primary: theme.palette.primary,
								secondary: theme.palette.secondary,
							},
						})}>
						<IconButton onClick={onClose}>
							<Close />
						</IconButton>
					</ThemeProvider>
				</Toolbar>
			</AppBar>
			<WizardStepper
				activeStep={activeStep}
				setActiveStep={setActiveStep}
				steps={steps}
				overrideDisableBack={overrideDisableBack}
				overrideDisableNext={overrideDisableNext}
				overrideDisableFinish={overrideDisableFinish}
				hideNavigation={hideNavigation}
				onClickFinish={onClickFinish}
				hideContentPaperBackground={hideContentPaperBackground}>
				{children}
			</WizardStepper>
		</Dialog>
	);
};

WizardDialog.propTypes = {
	title: PropTypes.oneOfType([PropTypes.string, PropTypes.object]),
	open: PropTypes.bool,
	onClose: PropTypes.func.isRequired,
	maxWidth: PropTypes.string,
	children: PropTypes.oneOfType([PropTypes.array]),

	//Stepper portion
	steps: PropTypes.array.isRequired,
	activeStep: PropTypes.number.isRequired,
	setActiveStep: PropTypes.func.isRequired,
	hideNavigation: PropTypes.bool,
	overrideDisableBack: PropTypes.bool,
	overrideDisableNext: PropTypes.bool,
	overrideDisableFinish: PropTypes.bool,
	onClickFinish: PropTypes.func.isRequired,
	hideContentPaperBackground: PropTypes.bool,
};

WizardDialog.defaultProps = {
	maxWidth: 'xl',

	steps: [],
};

export default WizardDialog;
