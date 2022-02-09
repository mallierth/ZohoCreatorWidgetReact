import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import {} from '../Helpers/functions';
import {
	Button,
	Divider,
	IconButton,
	ListItemIcon,
	ListItemText,
	Menu,
	MenuItem,
	Tooltip,
} from '@mui/material';
import { ExpandMore, MoreVert } from '@mui/icons-material';
import { useTheme } from '@mui/material/styles';
import useMediaQuery from '@mui/material/useMediaQuery';

const CustomFormActions = ({ options }) => {
	const theme = useTheme();
	const desktopMode = useMediaQuery(theme.breakpoints.up('sm'));
	const [anchorEl, setAnchorEl] = useState(null);
	const [open, setOpen] = useState(false);

	const hasFormOptions = Boolean(
		options?.filter((op) => op.type === 'form' && !op.hidden).length > 0
	);
	const hasGeneralOptions = Boolean(
		options?.filter((op) => op.type === 'general' && !op.hidden).length > 0
	);
	const hasVoidOptions = Boolean(
		options?.filter((op) => op.type === 'void' && !op.hidden).length > 0
	);

	const onClose = () => {
		setAnchorEl(null);
		setOpen(false);
	};

	const onOpen = (e) => {
		setAnchorEl(e.currentTarget);
		setOpen(true);
	};

	useEffect(() => {
		desktopMode ? onClose() : null;
	}, [desktopMode]);

	return (
		<>
			{desktopMode ? (
				<Button onClick={onOpen} startIcon={<ExpandMore />}>
					Actions
				</Button>
			) : (
				<Tooltip arrow title={'Actions'}>
					<IconButton onClick={onOpen} color='inherit' size='small'>
						<MoreVert />
					</IconButton>
				</Tooltip>
			)}

			<Menu anchorEl={anchorEl} open={open} onClose={onClose}>
				{/* Record Specific Options */}
				{hasFormOptions
					? options
							.filter(({ type, hidden }) => type === 'form' && !hidden)
							.map(({ label, onClick, Icon, disabled }) => (
								<MenuItem
									key={label}
									onClick={() => {
										onClick();
										onClose();
									}}
									disabled={Boolean(disabled)}>
									{Icon ? (
										<ListItemIcon>
											<Icon color='info' fontSize='small' />
										</ListItemIcon>
									) : null}
									<ListItemText>{label}</ListItemText>
								</MenuItem>
							))
					: null}

				{hasGeneralOptions ? <Divider /> : null}

				{/* General Options */}
				{hasGeneralOptions
					? options
							.filter(({ type, hidden }) => type === 'general' && !hidden)
							.map(({ label, onClick, Icon, disabled }) => (
								<MenuItem
									key={label}
									onClick={() => {
										onClick();
										onClose();
									}}
									disabled={Boolean(disabled)}>
									{Icon ? (
										<ListItemIcon>
											<Icon color='success' fontSize='small' />
										</ListItemIcon>
									) : null}
									<ListItemText>{label}</ListItemText>
								</MenuItem>
							))
					: null}
				{hasVoidOptions ? <Divider /> : null}

				{/* Void/Delete Options */}
				{hasVoidOptions
					? options
							.filter(({ type, hidden }) => type === 'void' && !hidden)
							.map(({ label, onClick, Icon, disabled }) => (
								<MenuItem
									key={label}
									onClick={() => {
										onClick();
										onClose();
									}}
									disabled={Boolean(disabled)}>
									{Icon ? (
										<ListItemIcon>
											<Icon color='error' fontSize='small' />
										</ListItemIcon>
									) : null}
									<ListItemText>{label}</ListItemText>
								</MenuItem>
							))
					: null}
			</Menu>
		</>
	);
};

CustomFormActions.propTypes = {
	options: PropTypes.arrayOf(
		PropTypes.shape({
			type: PropTypes.oneOf(['form', 'general', 'void']),
			label: PropTypes.string.isRequired,
			onClick: PropTypes.func.isRequired,
			Icon: PropTypes.object,
			disabled: PropTypes.bool,
			hidden: PropTypes.bool,
		})
	).isRequired,
};

export default CustomFormActions;
