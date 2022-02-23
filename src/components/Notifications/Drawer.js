import * as React from 'react';
import PropTypes from 'prop-types';
import { Box, Drawer, Stack } from '@mui/material';

const NotificationsDrawer = ({ open, onClose, children }) => {
	const toggleDrawer = (event) => {
		if (
			event.type === 'keydown' &&
			(event.key === 'Tab' || event.key === 'Shift')
		) {
			return;
		}

		if (open) onClose();
	};

	return (
		<Drawer anchor={'right'} open={open} onClose={onClose}>
			<Box sx={{ width: 400 }} role='presentation'>
				{children}
			</Box>
		</Drawer>
	);
};

NotificationsDrawer.propTypes = {
	open: PropTypes.bool,
	onClose: PropTypes.func,
	children: PropTypes.node,
};

export default NotificationsDrawer;
