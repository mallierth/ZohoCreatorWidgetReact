import React, { useRef } from 'react';
import PropTypes from 'prop-types';
import { AppBar, Box, Fade, IconButton, Slide, Toolbar } from '@mui/material';
import { Close } from '@mui/icons-material';
import { omit } from 'lodash-es';
const CustomDataGridOverlayDialog = ({
	open,
	onClose,
	edge,
	width,
	title,
	color,
	children,
	top,
	WrapperProps,
}) => {
	const containerRef = useRef(null);

	return (
		<Fade in={open} container={containerRef.current}>
			<Box
				{...omit(WrapperProps, 'sx')}
				sx={{
					position: 'absolute',
					top,
					left: 0,
					my: 1,
					height: '100%',
					width: '100%',
					zIndex: 10,
					overflow: 'hidden',
					backgroundColor: (theme) =>
						theme.palette.mode === 'dark'
							? 'rgba(255,255,255,0.25)'
							: 'rgba(0,0,0,0.5)',
					display: 'flex',
					justifyContent: `flex-${edge}`, //start or end for left or right
					...WrapperProps.sx,
				}}
				onClick={onClose}
				ref={containerRef}>
				<Slide
					in={open}
					direction={edge === 'start' ? 'right' : 'left'}
					container={containerRef.current}
					mountOnEnter
					unmountOnExit>
					<Box
						sx={{
							height: '100%',
							width,
							backgroundColor: 'background.default',
						}}
						onClick={(e) => e.stopPropagation()}>
						<AppBar color={color} position='relative' enableColorOnDark>
							<Toolbar
								sx={{
									px: { xs: 1 },
									justifyContent: 'space-between',
								}}>
								{title ? title : <Box></Box>}
								<IconButton onClick={onClose} color='inherit'>
									<Close />
								</IconButton>
							</Toolbar>
						</AppBar>
						{children}
					</Box>
				</Slide>
			</Box>
		</Fade>
	);
};
CustomDataGridOverlayDialog.propTypes = {
	open: PropTypes.bool,
	onClose: PropTypes.func.isRequired,
	edge: PropTypes.oneOf(['start', 'end']),
	width: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
	title: PropTypes.oneOfType([PropTypes.object, PropTypes.string]).isRequired,
	children: PropTypes.oneOfType([PropTypes.object, PropTypes.array]).isRequired,
	color: PropTypes.oneOf(['default', 'inherit', 'primary', 'secondary', 'transparent']),
	top: PropTypes.number,
	WrapperProps: PropTypes.object,
};
CustomDataGridOverlayDialog.defaultProps = {
	edge: 'end',
	width: '60%',
	color: 'primary',
	top: 0,
	WrapperProps: {},
};

export default CustomDataGridOverlayDialog;
