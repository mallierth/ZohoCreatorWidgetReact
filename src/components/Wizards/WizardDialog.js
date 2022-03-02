import React from 'react';
import PropTypes from 'prop-types';
import { useRecoilValue } from 'recoil';
import {
	AppBar,
	Dialog,
	DialogContent,
	Drawer,
	IconButton,
	Paper,
	Toolbar,
} from '@mui/material';
import { Close } from '@mui/icons-material';
import { createTheme, ThemeProvider, useTheme } from '@mui/material/styles';
import useMediaQuery from '@mui/material/useMediaQuery';
import {
	sidenavOpenState,
	navBarHeightState,
	formMaxWidthState,
} from '../../recoil/atoms';
import WizardStepper from './WizardStepper';
import Draggable from 'react-draggable';

const widthAdjustment = 150;

//import { formMaxWidthState } from '../../recoil/atoms';

// const PaperComponent = (props) => {
// 	return (
// 		<Draggable
// 			handle='#draggable-dialog-title'
// 			cancel={'[class*="MuiDialogContent-root"]'}>
// 			<Paper {...props} />
// 		</Draggable>
// 	);
// };

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
	overrideDialogZindex,
}) => {
	//const formMaxWidth = useRecoilValue(formMaxWidthState);
	const theme = useTheme();
	const desktopMode = useMediaQuery(theme.breakpoints.up('sm'));
	const sidenavOpen = useRecoilValue(sidenavOpenState);
	const navBarHeight = useRecoilValue(navBarHeightState);
	const formMaxWidth = useRecoilValue(formMaxWidthState);
	return (
		<>
			{desktopMode ? (
				<Drawer
					//disableEnforceFocus
					//disablePortal
					sx={{
						position: 'initial',

						'& .MuiBackdrop-root': {
							top: '110px',
							left: sidenavOpen ? '248px' : '8px', //
							bottom: '8px',
							right: '8px',
							zIndex: (theme) =>
								overrideDialogZindex
									? theme.zIndex.modal
									: theme.zIndex.drawer - 1,
							backgroundColor: (theme) =>
								theme.palette.mode === 'dark'
									? 'rgba(255,255,255,0.25)'
									: 'rgba(0,0,0,0.5)',
						},
						'& > .MuiPaper-root': {
							top: '110px',
							right: '8px',
							maxWidth: maxWidth ? maxWidth : formMaxWidth,
							width: `calc(100vw - ${
								sidenavOpen ? '256px' : '0px'
							} - ${widthAdjustment}px)`,
							height: (theme) =>
								`calc(100vh - ${theme.mixins.toolbar.minHeight * 2}px - 16px)`,
							zIndex: (theme) =>
								overrideDialogZindex
									? theme.zIndex.modal + 1
									: theme.zIndex.drawer,
						},
						zIndex: (theme) =>
							overrideDialogZindex
								? theme.zIndex.modal
								: theme.zIndex.drawer - 1,
					}}
					anchor={'right'}
					open={open}
					onClose={onClose}>
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
				</Drawer>
			) : (
				<Dialog fullScreen open={open} onClose={onClose}>
					<AppBar color={'primary'} enableColorOnDark position='relative'>
						<Toolbar
							sx={{
								minHeight: { xs: navBarHeight },
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
			)}
		</>
		// <Dialog
		// 	fullScreen={!desktopMode}
		// 	maxWidth={maxWidth}
		// 	fullWidth
		// 	open={open}
		// 	onClose={onClose}
		// 	PaperComponent={desktopMode ? PaperComponent : Paper}>
		// 	<AppBar
		// 		color={'primary'}
		// 		enableColorOnDark
		// 		position='relative'
		// 		sx={{ cursor: desktopMode ? 'move' : 'auto' }}
		// 		id='draggable-dialog-title'>
		// 		<Toolbar
		// 			sx={{
		// 				minHeight: { xs: 51 },
		// 				px: { xs: 1 },
		// 				justifyContent: 'space-between',
		// 			}}>
		// 			{title}
		// 			<ThemeProvider
		// 				theme={createTheme({
		// 					palette: {
		// 						mode: 'light',
		// 						primary: theme.palette.primary,
		// 						secondary: theme.palette.secondary,
		// 					},
		// 				})}>
		// 				<IconButton onClick={onClose}>
		// 					<Close />
		// 				</IconButton>
		// 			</ThemeProvider>
		// 		</Toolbar>
		// 	</AppBar>
		// 	<WizardStepper
		// 		activeStep={activeStep}
		// 		setActiveStep={setActiveStep}
		// 		steps={steps}
		// 		overrideDisableBack={overrideDisableBack}
		// 		overrideDisableNext={overrideDisableNext}
		// 		overrideDisableFinish={overrideDisableFinish}
		// 		hideNavigation={hideNavigation}
		// 		onClickFinish={onClickFinish}
		// 		hideContentPaperBackground={hideContentPaperBackground}>
		// 		{children}
		// 	</WizardStepper>
		// </Dialog>
	);
};

WizardDialog.propTypes = {
	title: PropTypes.oneOfType([PropTypes.string, PropTypes.object]),
	open: PropTypes.bool,
	onClose: PropTypes.func.isRequired,
	maxWidth: PropTypes.string,
	children: PropTypes.oneOfType([PropTypes.array]),
	overrideDialogZindex: PropTypes.bool,
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
