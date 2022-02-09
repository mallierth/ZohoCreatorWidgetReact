import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import {
	Box,
	Button,
	Dialog,
	DialogActions,
	DialogContent,
	DialogTitle,
	Fade,
	IconButton,
	Toolbar,
	Typography,
} from '@mui/material';
import { Close, DoneAll } from '@mui/icons-material';
import RenderPopup from './RenderPopup';
import { LoadingButton } from '@mui/lab';

const TransitionFade = React.forwardRef(function TransitionFade(props, ref) {
	return <Fade ref={ref} {...props} />;
});

const ConfirmationDialog = ({
	open,
	title,
	children,
	onBack,
	onConfirm,
	confirmButtonColor,
	confirmButtonVariant,
	confirmButtonText,
	disableConfirmationButton,
	payload,
	loading,
}) => {
	
	return (
		<RenderPopup
			title={title}
			open={open}
			onClose={onBack}
			moveableModal
			color='default'>
			<Box
				sx={{
					borderColor: `${confirmButtonColor}.main`,
					borderLeft: (theme) => (theme.palette.mode === 'dark' ? 2 : null),
					borderRight: (theme) => (theme.palette.mode === 'dark' ? 2 : null),
					borderBottom: (theme) => (theme.palette.mode === 'dark' ? 2 : null),
				}}>
				<Box sx={{ maxHeight: '80vh', overflowY: 'auto', }}>{children}</Box>
				<DialogActions sx={{ bgcolor: theme => theme.palette.mode === 'dark' ? 'background.paper' : '#eee' }}>
					<Button color='inherit' onClick={onBack} sx={{ mr: 2 }}>
						Close
					</Button>
					<LoadingButton
						loading={loading}
						loadingPosition='end'
						endIcon={<DoneAll />}
						disabled={disableConfirmationButton}
						onClick={() => onConfirm(payload)}
						color={confirmButtonColor}
						variant={confirmButtonVariant}>
						{confirmButtonText}
					</LoadingButton>
				</DialogActions>
			</Box>
		</RenderPopup>
	);
};

ConfirmationDialog.propTypes = {
	open: PropTypes.bool,
	title: PropTypes.string,
	children: PropTypes.oneOfType([PropTypes.object, PropTypes.array]),
	onBack: PropTypes.func,
	onConfirm: PropTypes.func,
	confirmButtonColor: PropTypes.oneOf([
		'inherit',
		'primary',
		'secondary',
		'success',
		'error',
		'info',
		'warning',
	]),
	confirmButtonVariant: PropTypes.oneOf(['contained', 'outlined', 'text']),
	confirmButtonText: PropTypes.string,
	disableConfirmationButton: PropTypes.bool,
	payload: PropTypes.any,
	loading: PropTypes.bool,
};

ConfirmationDialog.defaultProps = {
	confirmButtonColor: 'primary',
	confirmButtonVariant: 'contained',
	confirmButtonText: 'Confirm',
	payload: null,
};

export default ConfirmationDialog;
