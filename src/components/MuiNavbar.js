import React, { useEffect, useState } from 'react';
import { useRecoilState, useRecoilValue } from 'recoil';
import { v4 as uuidv4 } from 'uuid';
import { styled, useTheme } from '@mui/material/styles';
import { keyframes } from '@mui/system';
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
import { Collapse, Paper, Slide, Stack, Tooltip } from '@mui/material';
import {
	AddComment,
	Help,
	MenuOpen,
	MoreVert,
	Notifications,
	NotificationsActive,
	Palette,
	Settings,
} from '@mui/icons-material';
import {
	autoHideNavigationState,
	currentUserIsAdminState,
} from '../recoil/selectors';
import HelpDocs from './HelpDocs/HelpDocs';
import {
	applicationTabsState,
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
import { getAllRecords } from '../apis/ZohoCreator';
import NotificationsDrawer from './Notifications/Drawer';
import NotificationsCard from './Notifications/Card';
import dayjs from 'dayjs';
import ReactTimeAgo from 'react-time-ago';
import { useFormData } from './Helpers/CustomHooks';

const sx = {
	grow: { flexGrow: 1 },
	sectionDesktop: { display: { xs: 'none', md: 'flex' } },
	sectionMobile: { display: { xs: 'flex', md: 'none' } },
};

const ring = keyframes`
	0% { transform: rotate(0); }
	1% { transform: rotate(30deg); }
	3% { transform: rotate(-28deg); }
	5% { transform: rotate(34deg); }
	7% { transform: rotate(-32deg); }
	9% { transform: rotate(30deg); }
	11% { transform: rotate(-28deg); }
	13% { transform: rotate(26deg); }
	15% { transform: rotate(-24deg); }
	17% { transform: rotate(22deg); }
	19% { transform: rotate(-20deg); }
	21% { transform: rotate(18deg); }
	23% { transform: rotate(-16deg); }
	25% { transform: rotate(14deg); }
	27% { transform: rotate(-12deg); }
	29% { transform: rotate(10deg); }
	31% { transform: rotate(-8deg); }
	33% { transform: rotate(6deg); }
	35% { transform: rotate(-4deg); }
	37% { transform: rotate(2deg); }
	39% { transform: rotate(-1deg); }
	41% { transform: rotate(1deg); }
  
	43% { transform: rotate(0); }
	100% { transform: rotate(0); }
`;

const INTERVAL_DURATION = 1000 * 60 * 1; //1000ms * 60s/minute * n desired minutes (5 minutes)
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
	const [applicationTabs, setApplicationTabs] =
		useRecoilState(applicationTabsState);
	const navBarHeight = useRecoilValue(navBarHeightState);
	const autoHideNavigation = useRecoilValue(autoHideNavigationState);
	const [mobileMoreAnchorEl, setMobileMoreAnchorEl] = React.useState(null);

	const isMobileMenuOpen = Boolean(mobileMoreAnchorEl);
	const [employeeSettingsModal, setEmployeeSettingsModal] = useState(false);
	const [helpDocsModal, setHelpDocsModal] = useState(false);
	const currentUser = useRecoilValue(currentUserState);
	const currentUserIsAdmin = useRecoilValue(currentUserIsAdminState);
	const formMaxWidth = useRecoilValue(formMaxWidthState);
	const appMaxWidth = useRecoilValue(appMaxWidthState);
	const sideNavEnabled = useRecoilValue(sideNavEnabledState);
	const [notifications, setNotifications] = useState([]);
	const notificationCount = notifications.filter(
		(notification) =>
			notification.Read === false || notification.Read === 'false'
	).length;
	const [notificationsOpen, setNotificationsOpen] = useState(false);
	const [, , updateRecord, ,] = useFormData();

	useEffect(() => {
		(async () => {
			const response = await getAllRecords(
				'Notifications',
				`Master==false && Employee==${currentUser.ID} && Hidden==false}`
			);
			if (response) {
				setNotifications(response);
			}
		})();
	}, []);

	useEffect(() => {
		const interval = setInterval(() => {
			(async () => {
				//!Hidden_By.contains(${currentUser.ID}) ||
				const response = await getAllRecords(
					'Notifications',
					`Master==false && Employee==${currentUser.ID} && Hidden==false}`
				);
				if (response) {
					setNotifications(response);
				}
			})();
		}, INTERVAL_DURATION);

		return () => clearInterval(interval); // This represents the unmount function, in which you need to clear your interval to prevent memory leaks.
	}, []);

	// useEffect(() => {
	// 	if (notifications.length > 0) {
	// 		console.log('useEffect notifications', notifications);
	// 	}
	// }, [notifications]);

	const handleMobileMenuClose = () => {
		setMobileMoreAnchorEl(null);
	};

	const handleMobileMenuOpen = (event) => {
		setMobileMoreAnchorEl(event.currentTarget);
	};

	const readNotification = (notification) => {
		if (notification.Read === false || notification.Read === 'false') {
			notification.Read = true;
			updateRecord('Notifications', notification.ID, notification, () => {
				return notification;
			});
		}

		return notification;
	};

	const unreadNotification = (notification) => {
		if (notification.Read === true || notification.Read === 'true') {
			notification.Read = false;
			updateRecord('Notifications', notification.ID, notification, () => {
				return notification;
			});
		}

		return notification;
	};

	const hideNotification = (notification) => {
		if (notification.Hidden === false || notification.Hidden === 'false') {
			notification.Read = true;
			notification.Hidden = true;
			updateRecord('Notifications', notification.ID, notification);
		}
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
			</MenuItem> */}
			{currentUserIsAdmin ? (
				<MenuItem>
					<IconButton
						color='inherit'
						sx={{
							pr: 2,
						}}
						size='large'
						onClick={() => setNotificationsOpen(true)}>
						<Badge badgeContent={notificationCount} color='error'>
							{notificationCount > 0 ? (
								<NotificationsActive
									sx={{
										animation: `${ring} 4s .7s ease-in-out infinite`,
									}}
								/>
							) : (
								<Notifications />
							)}
						</Badge>
					</IconButton>
					<Typography>Notifications</Typography>
				</MenuItem>
			) : null}
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
								sx={{ display: 'flex', flex: 'auto', alignItems: 'center' }}
								autoHideNavigation={autoHideNavigation}>
								{/* <Box
									component='img'
									src='./VisionPoint_Logo_color.png'
									sx={{ maxHeight: navBarHeight }}
								/> */}

								<Typography variant='button'>
									AV Professional Services
								</Typography>

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
										{currentUserIsAdmin ? (
											<Slide
												in
												direction='down'
												style={{ transitionDelay: '600ms' }}
												timeout={400}>
												<IconButton
													color='inherit'
													size='large'
													onClick={() => setNotificationsOpen(true)}>
													<Badge badgeContent={notificationCount} color='error'>
														{notificationCount > 0 ? (
															<NotificationsActive
																sx={{
																	animation: `${ring} 4s .7s ease-in-out infinite`,
																}}
															/>
														) : (
															<Notifications />
														)}
													</Badge>
												</IconButton>
											</Slide>
										) : null}

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

			<NotificationsDrawer
				open={notificationsOpen}
				onClose={() => setNotificationsOpen(false)}>
				<Typography textAlign={'center'} sx={{ my: 1 }}>
					Notifications
				</Typography>
				{notifications.length > 0 ? (
					<>
						<TransitionGroup>
							{/* Unread */}
							{notifications
								.filter(
									(notification) =>
										notification.Read === false || notification.Read === 'false'
								)
								.map((notification) => (
									<Collapse key={notification.ID}>
										<NotificationsCard
											author={notification.Author}
											title={notification.Title}
											//subtitle={dayjs(notification.Added_Time).format('l LT')}
											timestamp={
												<ReactTimeAgo
													date={new Date(notification.Added_Time)}
													locale='en-US'
												/>
											}
											timestampTooltip={dayjs(notification.Added_Time).format(
												'LLLL'
											)}
											content={notification.Content}
											read={false}
											variant={
												notification.High_Importance === true ||
												notification.High_Importance === 'true'
													? 'error'
													: null
											}
											onRead={() =>
												setNotifications((oldNotifications) =>
													oldNotifications.map((old) =>
														old.ID === notification.ID
															? { ...readNotification(notification) }
															: old
													)
												)
											}
											onHide={() =>
												setNotifications((oldNotifications) => {
													hideNotification(notification);
													return oldNotifications.filter(
														(old) => old.ID !== notification.ID
													);
												})
											}
											highImportance={
												notification.High_Importance === true ||
												notification.High_Importance === 'true'
											}
											applicationTabData={
												notification.Application_Tab_Data &&
												typeof notification.Application_Tab_Data === 'string'
													? JSON.parse(notification.Application_Tab_Data)
													: notification.Application_Tab_Data
													? notification.Application_Tab_Data
													: []
											}
											onAction={(tab) => {
												setApplicationTabs((old) => [
													...old.map((o) => ({ ...o, active: false })),
													...{
														...tab,
														uuid: uuidv4(),
														active: true,
													},
												]);
											}}
										/>
									</Collapse>
								))}
						</TransitionGroup>
						<TransitionGroup>
							{/* Read */}
							{notifications
								.filter(
									(notification) =>
										notification.Read === true || notification.Read === 'true'
								)
								.map((notification) => (
									<Collapse key={notification.ID}>
										<NotificationsCard
											author={notification.Author}
											title={notification.Title}
											//subtitle={dayjs(notification.Added_Time).format('l LT')}
											timestamp={
												<ReactTimeAgo
													date={new Date(notification.Added_Time)}
													locale='en-US'
												/>
											}
											timestampTooltip={dayjs(notification.Added_Time).format(
												'LLLL'
											)}
											content={notification.Content}
											read={true}
											variant={
												notification.High_Importance === true ||
												notification.High_Importance === 'true'
													? 'error'
													: null
											}
											onRead={() =>
												setNotifications((oldNotifications) =>
													oldNotifications.map((old) =>
														old.ID === notification.ID
															? { ...unreadNotification(notification) }
															: old
													)
												)
											}
											onHide={() =>
												setNotifications((oldNotifications) => {
													hideNotification(notification);
													return oldNotifications.filter(
														(old) => old.ID !== notification.ID
													);
												})
											}
											highImportance={
												notification.High_Importance === true ||
												notification.High_Importance === 'true'
											}
											applicationTabData={
												notification.Application_Tab_Data &&
												typeof notification.Application_Tab_Data === 'string'
													? JSON.parse(notification.Application_Tab_Data)
													: notification.Application_Tab_Data
													? notification.Application_Tab_Data
													: []
											}
											onAction={(tab) => {
												setApplicationTabs((old) => [
													...old.map((o) => ({ ...o, active: false })),
													...{
														...tab,
														uuid: uuidv4(),
														active: true,
													},
												]);
											}}
										/>
									</Collapse>
								))}
						</TransitionGroup>
					</>
				) : (
					<Paper
						sx={{
							display: 'flex',
							alignItems: 'center',
							justifyContent: 'center',
							py: 8,
							mx: 4,
						}}>
						No active notifications!
					</Paper>
				)}
			</NotificationsDrawer>
		</>
	);
};

export default MuiNavbar;
