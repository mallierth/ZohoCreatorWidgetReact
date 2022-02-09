import React, { useEffect, useState } from 'react';
import { useRecoilState, useRecoilValue } from 'recoil';
import Button from '@mui/material/Button';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import {
	Dialog,
	IconButton,
	Slide,
	Slider,
	Stack,
	Toolbar,
	Typography,
} from '@mui/material';
import { Close } from '@mui/icons-material';
import GenericSave from '../Helpers/GenericSave';
import {
	currentUserState,
	navBarHeightState,
} from '../../recoil/atoms';
import RenderForm from '../Helpers/RenderForm';

const Transition = React.forwardRef(function Transition(props, ref) {
	return <Slide direction='up' ref={ref} {...props} />;
});

const Settings = ({ open, setOpen }) => {
	const currentUser = useRecoilValue(currentUserState);
	const navBarHeight = useRecoilValue(navBarHeightState);
	return (
		<Dialog
			fullScreen
			open={open}
			onClose={() => setOpen(false)}
			TransitionComponent={Transition}>
			<DialogTitle
				sx={{
					display: 'flex',
					alignItems: 'center',
					justifyContent: 'space-between',
				}}>
				Help Docs
				<IconButton
					aria-label='close'
					onClick={() => setOpen(false)}
					size='large'>
					<Close />
				</IconButton>
			</DialogTitle>
			<DialogContent dividers>
				<RenderForm id={currentUser.ID} formName={'Employee'} mySettingsModal maxHeight={window.innerHeight - navBarHeight} />
			</DialogContent>
			<DialogActions>
				<Button onClick={() => setOpen(false)} color='primary'>
					Close
				</Button>
			</DialogActions>
		</Dialog>
	);
};

export default Settings;
