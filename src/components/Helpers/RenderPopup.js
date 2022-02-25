import React from 'react';
import PropTypes from 'prop-types';
import { useRecoilValue } from 'recoil';
import {
	AppBar,
	Box,
	Dialog,
	Drawer,
	Fade,
	IconButton,
	Paper,
	Slide,
	Toolbar,
	Typography,
} from '@mui/material';
import { Close } from '@mui/icons-material';
import { createTheme, ThemeProvider, useTheme } from '@mui/material/styles';
import useMediaQuery from '@mui/material/useMediaQuery';
import {
	sidenavOpenState,
	navBarHeightState,
	formMaxWidthState,
	tabBarHeightState,
} from '../../recoil/atoms';
import Draggable from 'react-draggable';

const widthAdjustment = 150;

const PaperComponent = (props) => {
	return (
		<Draggable
			handle='#draggable-dialog-title'
			cancel={'[class*="MuiDialogContent-root"]'}>
			<Paper {...props} />
		</Draggable>
	);
};

const RenderPopup = ({
	title,
	open,
	onClose,
	maxWidth,
	overrideDialogZindex,
	children,
	moveableModal,
	color,
}) => {
	const sidenavOpen = useRecoilValue(sidenavOpenState);
	const navBarHeight = useRecoilValue(navBarHeightState);
	const tabBarHeight = useRecoilValue(tabBarHeightState);
	const formMaxWidth = useRecoilValue(formMaxWidthState);
	const theme = useTheme();
	const desktopMode = useMediaQuery(theme.breakpoints.up('sm'));

	if (moveableModal) {
		return (
			<Dialog
				fullScreen={!desktopMode}
				maxWidth={'xl'}
				fullWidth
				open={open}
				onClose={onClose}
				PaperComponent={desktopMode ? PaperComponent : Paper}>
				<AppBar
					color={color}
					enableColorOnDark
					position='relative'
					sx={{ cursor: desktopMode ? 'move' : 'auto' }}
					id='draggable-dialog-title'>
					<Toolbar
						sx={{
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
				{children}
			</Dialog>
		);
	}

	// return (
	// 	<Fade in={open} mountOnEnter unmountOnExit>
	// 		<Box
	// 			onClick={(e) => {
	// 				e.stopPropagation();
	// 				onClose();
	// 			}}
	// 			sx={{
	// 				zIndex: 500,
	// 				position: 'fixed',
	// 				top: navBarHeight + tabBarHeight - 1,
	// 				right: 0,
	// 				height: `calc(100vh - ${navBarHeight}px - ${tabBarHeight}px + 1px)`,
	// 				width: 'calc(100% - 50px)',
	// 				backgroundColor: (theme) =>
	// 					theme.palette.mode === 'dark'
	// 						? 'rgba(0, 0, 0, 0.75)'
	// 						: 'rgba(0, 0, 0, 0.25)',
	// 			}}>
	// 			<Slide direction='left' in={open} mountOnEnter unmountOnExit>
	// 				<Box
	// 					onClick={(e) => e.stopPropagation()}
	// 					sx={{
	// 						position: 'fixed',
	// 						top: navBarHeight + tabBarHeight - 1,
	// 						right: 0,
	// 						height: `calc(100vh - ${navBarHeight}px - ${tabBarHeight}px + 1px)`,
	// 						width: `${formMaxWidth}px`,
	// 						maxWidth: maxWidth ? maxWidth : formMaxWidth,
	// 						backgroundColor: 'background.default',
	// 					}}>
	// 					<AppBar color='default' enableColorOnDark position='relative'>
	// 						<Toolbar
	// 							color='inherit'
	// 							sx={{
	// 								px: { xs: 1 },
	// 								justifyContent: 'space-between',
	// 							}}>
	// 							{title ? title : <Box></Box>}
	// 							<IconButton onClick={onClose} color='inherit'>
	// 								<Close />
	// 							</IconButton>
	// 						</Toolbar>
	// 					</AppBar>
	// 					{children}
	// 				</Box>
	// 			</Slide>
	// 		</Box>
	// 	</Fade>
	// );

	return (
		<>
			{desktopMode ? (
				<Drawer
					//disableEnforceFocus
					disablePortal
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
							width: `calc(100vw - ${sidenavOpen ? '256px' : '0px'} - ${widthAdjustment}px)`,
							height: (theme) =>
								`calc(100vh - ${theme.mixins.toolbar.minHeight * 2}px - 16px)`,
						},
						zIndex: (theme) =>
							overrideDialogZindex
								? theme.zIndex.modal + 1
								: theme.zIndex.drawer,
					}}
					anchor={'right'}
					open={open}
					onClose={onClose}>
					<AppBar color={'primary'} enableColorOnDark position='relative'>
						<Toolbar
							sx={{
								minHeight: { xs: navBarHeight },
								px: { xs: 1 },
								justifyContent: 'space-between',
							}}>
							{title ? title : <Box></Box>}
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
					{children}
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
					{children}
				</Dialog>
			)}
		</>
	);
};

RenderPopup.propTypes = {
	color: PropTypes.oneOf([
		'default',
		'inherit',
		'primary',
		'secondary',
		'transparent',
	]),
	title: PropTypes.oneOfType([PropTypes.string, PropTypes.object]),
	open: PropTypes.bool,
	onClose: PropTypes.func.isRequired,
	maxWidth: PropTypes.number,
	overrideDialogZindex: PropTypes.bool,
	children: PropTypes.oneOfType([PropTypes.object, PropTypes.array]),
	moveableModal: PropTypes.bool,
};

RenderPopup.defaultProps = {
	color: 'primary',
};

export default RenderPopup;
