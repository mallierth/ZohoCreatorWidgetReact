import * as React from 'react';
import PropTypes from 'prop-types';
import Box from '@mui/material/Box';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import IconButton from '@mui/material/IconButton';
import useMediaQuery from '@mui/material/useMediaQuery';
import { useTheme } from '@mui/material/styles';
import CloseIcon from '@mui/icons-material/Close';
import Slide from '@mui/material/Slide';
import Fade from '@mui/material/Fade';
import Paper from '@mui/material/Paper';
import Draggable from 'react-draggable';

const PaperComponent = (props) => {
	return (
		<Draggable
			handle='#draggable-dialog-title'
			cancel={'[class*="MuiDialogContent-root"]'}>
			<Paper {...props} />
		</Draggable>
	);
};

const Slider = React.forwardRef(function Transition(props, ref) {
	return <Slide direction='up' ref={ref} {...props} />;
});

const Fader = React.forwardRef(function Transition(props, ref) {
	return <Fade ref={ref} {...props} />;
});

const ResponsiveDialog = ({
	open,
	onClose,
	title,
	children,
	buttons,
	fullWidth,
	maxWidth,
	hideDividers,
	hideBackdrop,
	disableContentPadding,
	color,
	...others
}) => {
	const theme = useTheme();
	const fullScreen = useMediaQuery(
		theme.breakpoints.down(maxWidth ? maxWidth : 'md')
	);

	return (
		<Dialog
			{...others}
			fullWidth={fullWidth}
			maxWidth={maxWidth}
			fullScreen={fullScreen}
			TransitionComponent={fullScreen ? Slider : Fader}
			PaperComponent={fullScreen ? Paper : PaperComponent}
			open={open}
			onClose={onClose}
			hideBackdrop={hideBackdrop}>
			<Box
				id='draggable-dialog-title'
				sx={{ cursor: fullScreen ? 'auto' : 'move' }}>
				<DialogTitle
					sx={{
						display: 'flex',
						justifyContent: 'space-between',
						alignItems: 'center',
						backgroundColor: color === 'default' ? '' : `${color}.main`,
					}}>
					{title ? title : <Box></Box>}
					{onClose ? (
						<IconButton onClick={onClose} color='inherit'>
							<CloseIcon />
						</IconButton>
					) : null}
				</DialogTitle>
			</Box>
			<DialogContent dividers={!hideDividers} sx={{ p: disableContentPadding ? 0 : '', }}>{children}</DialogContent>
			{buttons ? <DialogActions>{buttons}</DialogActions> : null}
		</Dialog>
	);
};

ResponsiveDialog.propTypes = {
	open: PropTypes.bool,
	setOpen: PropTypes.func,
	onClose: PropTypes.func,
	title: PropTypes.oneOfType([PropTypes.string, PropTypes.object]),
	children: PropTypes.any,
	buttons: PropTypes.oneOfType([PropTypes.object, PropTypes.array]),
	fullWidth: PropTypes.bool,
	maxWidth: PropTypes.oneOf(['xs', 'sm', 'md', 'lg', 'xl', false]),
	hideDividers: PropTypes.bool,
	hideBackdrop: PropTypes.bool,
	disableContentPadding: PropTypes.bool,
	color: PropTypes.oneOf(['primary', 'secondary', 'success', 'info', 'warning', 'error', 'default', ]),
};

ResponsiveDialog.defaultProps = {
	fullWidth: true,
	maxWidth: 'lg',
	color: 'default',
};

export default ResponsiveDialog;
