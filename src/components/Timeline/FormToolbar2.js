import React, { useState } from 'react';
import { useRecoilValue } from 'recoil';
import PropTypes from 'prop-types';
import { AppBar, Box, Chip, Container, Stack, Toolbar } from '@mui/material';
import { ChangeCircle, ViewModule } from '@mui/icons-material';
import {
	currentUserState,
	navBarHeightState,
	appMaxWidthState,
	formMaxWidthState,
	tabBarHeightState,
} from '../../recoil/atoms';
import TimeLineContent from './TimeLineContent';

const TimelineToolbar = ({
	id,
	viewingInTab,
	open,
	setOpen,
	CustomFormActions,
	renderInModal,
}) => {
	const currentUser = useRecoilValue(currentUserState);
	const navBarHeight = useRecoilValue(navBarHeightState);
	const tabBarHeight = useRecoilValue(tabBarHeightState);
	const appWidth = useRecoilValue(appMaxWidthState);
	const formWidth = useRecoilValue(formMaxWidthState);
	if (!id) {
		return <Box></Box>;
	}

	return (
		<>
			<Container
				maxWidth='xl'
				disableGutters
				sx={{ maxWidth: { xs: formWidth },}}>
				<AppBar
					color='inherit'
					//color={viewingInTab ? 'transparent' : 'inherit'}
					position='relative'
					elevation={4}>
					<Toolbar
						sx={{
							px: { xs: 1 },
							justifyContent: 'space-between',
						}}>
						<Box>
							<Chip
								sx={{ mr: 1 }}
								label='Overview'
								variant={open ? 'outlined' : 'filled'}
								color={open ? 'default' : 'primary'}
								onClick={() => setOpen(false)}
								icon={<ViewModule />}
							/>
							<Chip
								label='Changelog'
								variant={open ? 'filled' : 'outlined'}
								color={open ? 'primary' : 'default'}
								onClick={() => setOpen(true)}
								icon={<ChangeCircle />}
							/>
						</Box>
						<Box>{CustomFormActions ? CustomFormActions : null}</Box>
					</Toolbar>
				</AppBar>
			</Container>
			<Box sx={{ display: open ? 'block' : 'none' }}>
				<Box
					sx={{
						height: renderInModal ? '100%' : `calc(100vh - ${navBarHeight * 2}px - 51px${
							currentUser.Enable_Autosave === true ||
							currentUser.Enable_Autosave === 'true'
								? ''
								: ' - 51px'
						}${viewingInTab ? '' : ' - 51px'} - 16px)`, //window.innerHeight - navBar - formToolbar - bottomBar
						overflowY: 'auto',
						backgroundColor: 'background.default',
					}}>
					<Container
						maxWidth='xl'
						sx={{
							maxWidth: { xs: formWidth },
						}}>
						{open ? <TimeLineContent id={id} /> : null}
					</Container>
				</Box>
			</Box>

			{/* <Backdrop
				open={open}
				sx={{
					bgcolor: 'background.paper',
					top: 102,
          width: '90%',
          maxWidth: 1800,
          right: 0,
					height: '100%',
					zIndex: (theme) => theme.zIndex.drawer + 1,
					alignItems: 'flex-start',
				}}>
				
			</Backdrop> */}
		</>
	);
};

TimelineToolbar.propTypes = {
	id: PropTypes.string,
	open: PropTypes.bool,
	setOpen: PropTypes.func,
	viewingInTab: PropTypes.bool,
};

export default TimelineToolbar;
