import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { Alert, AlertTitle, Snackbar } from '@mui/material';

const ToastMessage = ({
	data,
	autoHideDuration,
	variant,
	anchorOrigin,
	defaultLocation,
}) => {
	const [open, setOpen] = useState(false);

	useEffect(() => {
		if (data.message) setOpen(true);
	}, [data]);

	const onClose = (e, reason) => {
		if (reason === 'clickaway') {
			return;
		}

		setOpen(false);
	};

	return (
		<>
			{defaultLocation ? (
				<Snackbar
					anchorOrigin={anchorOrigin}
					open={open}
					autoHideDuration={autoHideDuration}
					onClose={onClose}>
					<Alert
						onClose={onClose}
						severity={data.severity ? data.severity : 'info'}
						variant={variant}
						sx={{
							width: '100%',
							backgroundColor: data.color ? data.color : null,
						}}>
						{data.title ? <AlertTitle>{data.title}</AlertTitle> : null}
						{data.message}
					</Alert>
				</Snackbar>
			) : (
				<div style={{ willChange: 'transform', zIndex: 1301 }}>
					<Snackbar
						anchorOrigin={anchorOrigin}
						open={open}
						autoHideDuration={autoHideDuration}
						onClose={onClose}>
						<Alert
							onClose={onClose}
							severity={data.severity ? data.severity : 'info'}
							variant={variant}
							sx={{
								width: '100%',
								backgroundColor: data.color ? data.color : null,
							}}>
							{data.title ? <AlertTitle>{data.title}</AlertTitle> : null}
							{data.message}
						</Alert>
					</Snackbar>
				</div>
			)}
		</>
	);
};

ToastMessage.propTypes = {
	data: PropTypes.shape({
		title: PropTypes.string,
		message: PropTypes.string,
		severity: PropTypes.oneOf(['error', 'info', 'success', 'warning']),
		color: PropTypes.string,
	}),
	anchorOrigin: PropTypes.shape({
		vertical: PropTypes.oneOf(['top', 'bottom']),
		horizontal: PropTypes.oneOf(['left', 'center', 'right']),
	}),
	variant: PropTypes.oneOf(['filled', 'outlined', 'standard']),
	autoHideDuration: PropTypes.number,
	defaultLocation: PropTypes.bool,
};

ToastMessage.defaultProps = {
	data: {},
	autoHideDuration: 5000, //5 seconds
	variant: 'filled',
	anchorOrigin: { vertical: 'bottom', horizontal: 'left' },
};

export default ToastMessage;
