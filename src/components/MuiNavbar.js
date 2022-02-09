import React, { useState } from 'react';
import { useRecoilState, useRecoilValue } from 'recoil';
import { styled, useTheme } from '@mui/material/styles';
import { AppBar, Box, Breadcrumbs, Container, Link } from '@mui/material';
import Toolbar from '@mui/material/Toolbar';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import Badge from '@mui/material/Badge';
import MenuItem from '@mui/material/MenuItem';
import Menu from '@mui/material/Menu';
import MenuIcon from '@mui/icons-material/Menu';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import { Slide, Stack, Tooltip } from '@mui/material';
import {
	AddComment,
	Help,
	MenuOpen,
	MoreVert,
	Notifications,
	Palette,
	Settings,
} from '@mui/icons-material';
import { autoHideNavigationState } from '../recoil/selectors';
import HelpDocs from './HelpDocs/HelpDocs';
import {
	appBreadcrumbState,
	appMaxWidthState,
	currentUserState,
	formMaxWidthState,
	navBarHeightState,
	sideNavEnabledState,
} from '../recoil/atoms';
import { TransitionGroup } from 'react-transition-group';
import RenderPopup from './Helpers/RenderPopup';
import RenderForm from './Helpers/RenderForm';
import { focusPop } from './Helpers/animations';
import ResponsiveDialog from './Modals/ResponsiveDialog';
import { ToolbarTitle } from './CustomDataTable/CustomDataTable';

const sx = {
	grow: { flexGrow: 1 },
	sectionDesktop: { display: { xs: 'none', md: 'flex' } },
	sectionMobile: { display: { xs: 'flex', md: 'none' } },
};

const drawerWidth = 240;

const CustomToolbarWrapper = styled(Box, {
	shouldForwardProp: (prop) => prop !== 'open',
})(({ theme, open, autoHideNavigation }) => ({
	transition: theme.transitions.create(['width', 'margin'], {
		easing: theme.transitions.easing.sharp,
		duration: theme.transitions.duration.leavingScreen,
	}),
	...(open && {
		[theme.breakpoints.up('sm')]: {
			marginLeft: `${
				drawerWidth - parseInt(autoHideNavigation ? 0 : parseInt(56))
			}px`, //Icon is 8px> 40px> 8px
		},
		marginLeft: `0px`,
		width: `calc(100% - ${drawerWidth}px)`,
		transition: theme.transitions.create(['width', 'margin'], {
			easing: theme.transitions.easing.sharp,
			duration: theme.transitions.duration.enteringScreen,
		}),
	}),
}));

const RotatingButton = styled(IconButton, {
	shouldForwardProp: (prop) => prop !== 'open',
})(({ theme, open }) => ({
	//zIndex: theme.zIndex.drawer, //removed +1
	transition: theme.transitions.create('transform', {
		easing: theme.transitions.easing.sharp,
		duration: theme.transitions.duration.leavingScreen,
	}),
	transform: 'scaleX(-1)',
	...(open && {
		transform: 'scaleX(1)',
		transition: theme.transitions.create('transform', {
			easing: theme.transitions.easing.sharp,
			duration: theme.transitions.duration.enteringScreen,
		}),
	}),
}));

const MuiNavbar = ({ open, handleDrawerOpen, handleDrawerToggle }) => {
	const navBarHeight = useRecoilValue(navBarHeightState);
	const autoHideNavigation = useRecoilValue(autoHideNavigationState);
	const [mobileMoreAnchorEl, setMobileMoreAnchorEl] = React.useState(null);

	const isMobileMenuOpen = Boolean(mobileMoreAnchorEl);
	const [employeeSettingsModal, setEmployeeSettingsModal] = useState(false);
	const [helpDocsModal, setHelpDocsModal] = useState(false);
	const currentUser = useRecoilValue(currentUserState);
	const formMaxWidth = useRecoilValue(formMaxWidthState);
	const appMaxWidth = useRecoilValue(appMaxWidthState);
	const sideNavEnabled = useRecoilValue(sideNavEnabledState);

	const handleMobileMenuClose = () => {
		setMobileMoreAnchorEl(null);
	};

	const handleMobileMenuOpen = (event) => {
		setMobileMoreAnchorEl(event.currentTarget);
	};

	const renderMobileMenu = (
		<Menu
			anchorEl={mobileMoreAnchorEl}
			anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
			keepMounted
			transformOrigin={{ vertical: 'top', horizontal: 'right' }}
			open={isMobileMenuOpen}
			onClose={handleMobileMenuClose}>
			{/* <MenuItem>
				<IconButton color='inherit' sx={{ pr: 2 }} size='large'>
					<AddComment />
				</IconButton>
				<Typography>Internal Feedback</Typography>
			</MenuItem>
			<MenuItem>
				<IconButton color='inherit' sx={{ pr: 2 }} size='large'>
					<Badge badgeContent={11} color='secondary'>
						<Notifications />
					</Badge>
				</IconButton>
				<Typography>Notifications</Typography>
			</MenuItem> */}
			<MenuItem onClick={(e) => setHelpDocsModal(true)}>
				<IconButton color='inherit' sx={{ pr: 2 }} size='large'>
					<Help />
				</IconButton>
				<Typography>Help Docs</Typography>
			</MenuItem>
			<MenuItem onClick={(e) => setEmployeeSettingsModal(true)}>
				<IconButton color='inherit' sx={{ pr: 2 }} size='large'>
					<Settings />
				</IconButton>
				<Typography>Settings</Typography>
			</MenuItem>
		</Menu>
	);

	return (
		<>
			<Slide
				in
				direction='down'
				style={{ transitionDelay: '200ms' }}
				timeout={500}>
				<AppBar
					enableColorOnDark
					sx={{ zIndex: (theme) => theme.zIndex.drawer }}>
					<Container
						maxWidth={sideNavEnabled ? false : 'xl'}
						disableGutters={sideNavEnabled}
						sx={{ maxWidth: sideNavEnabled ? null : { xs: appMaxWidth } }}>
						<Toolbar sx={{ minHeight: { xs: navBarHeight }, px: { xs: 1 } }}>
							{!autoHideNavigation ? (
								<RotatingButton
									onClick={handleDrawerToggle}
									color='inherit'
									sx={{ mr: 1 }}
									open={open}>
									<MenuOpen />
								</RotatingButton>
							) : null}
							<CustomToolbarWrapper
								open={open}
								sx={{ display: 'flex', flex: 'auto', alignItems: 'center', }}
								autoHideNavigation={autoHideNavigation}>
								{/* <Box
									component='img'
									src='./VisionPoint_Logo_color.png'
									sx={{ maxHeight: navBarHeight }}
								/> */}

								<Typography variant="button">AV Professional Services</Typography>

								<Box sx={{ flexGrow: 1 }} />

								<Box sx={sx.sectionDesktop}>
									<Stack spacing={2} direction='row'>
										{/* <Slide
											in
											direction='down'
											style={{ transitionDelay: '600ms' }}
											timeout={200}>
											<IconButton color='inherit' size='large'>
												<AddComment />
											</IconButton>
										</Slide> */}
										{/* <Slide
											in
											direction='down'
											style={{ transitionDelay: '600ms' }}
											timeout={400}>
											<IconButton color='inherit' size='large'>
												<Badge badgeContent={17} color='secondary'>
													<Notifications />
												</Badge>
											</IconButton>
										</Slide> */}

										<Slide
											in
											direction='down'
											style={{ transitionDelay: '600ms' }}
											timeout={800}>
											<Tooltip title='Help Documentation'>
												<IconButton
													color='inherit'
													onClick={() => setHelpDocsModal(true)}
													size='large'>
													<Help />
												</IconButton>
											</Tooltip>
										</Slide>
										<Slide
											in
											direction='down'
											style={{ transitionDelay: '600ms' }}
											timeout={1600}>
											<Tooltip title='Personal Application Settings'>
												<IconButton
													color='inherit'
													onClick={() => setEmployeeSettingsModal(true)}
													size='large'>
													<Settings />
												</IconButton>
											</Tooltip>
										</Slide>
									</Stack>
								</Box>

								<Box sx={sx.sectionMobile}>
									<IconButton
										onClick={handleMobileMenuOpen}
										color='inherit'
										size='large'>
										<MoreVert />
									</IconButton>
								</Box>
							</CustomToolbarWrapper>
						</Toolbar>
					</Container>
				</AppBar>
			</Slide>
			{renderMobileMenu}

			{/* <RenderPopup
				title={`Personal Application Settings`}
				maxWidth={formMaxWidth}
				open={employeeSettingsModal}
				onClose={() => setEmployeeSettingsModal(false)}>
				<RenderForm
					id={currentUser.ID}
					formName={'Employee'}
					maxHeight={window.innerHeight - navBarHeight}
				/>
			</RenderPopup> */}

			<ResponsiveDialog
				size='xl'
				hideBackdrop
				disableContentPadding
				hideDividers
				title='My Settings'
				open={employeeSettingsModal}
				onClose={() => setEmployeeSettingsModal(false)}
				color='secondary'>
				<RenderForm
					id={currentUser.ID}
					formName={'Employee'}
					maxHeight={window.innerHeight - navBarHeight}
					mySettingsModal
				/>
			</ResponsiveDialog>

			<HelpDocs open={helpDocsModal} onClose={() => setHelpDocsModal(false)} />
		</>
	);
};

export default MuiNavbar;
