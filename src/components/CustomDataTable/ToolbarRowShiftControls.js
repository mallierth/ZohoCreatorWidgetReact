import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { useWhyDidYouUpdate } from 'use-why-did-you-update';
import {
	Box,
	Button,
	ButtonGroup,
	CircularProgress,
	Dialog,
	DialogActions,
	DialogTitle,
	Divider,
	IconButton,
	InputAdornment,
	Grid,
	ListItemIcon,
	ListItemText,
	Menu,
	MenuItem,
	Paper,
	Stack,
	TextField,
	Tooltip,
} from '@mui/material';
import {
	Add,
	AddComment,
	ArrowDownward,
	ArrowUpward,
	Badge,
	Build,
	ChevronLeft,
	ChevronRight,
	Compress,
	Delete,
	Edit,
	Expand,
	FileCopy,
	FileDownload,
	FilterAlt,
	FirstPage,
	LastPage,
	MoreVert,
	Search,
	TableView,
	VerticalAlignBottom,
	VerticalAlignTop,
} from '@mui/icons-material';
import { useDebounce } from '../Helpers/CustomHooks';
import { createTheme, ThemeProvider, useTheme } from '@mui/material/styles';
import useMediaQuery from '@mui/material/useMediaQuery';
import DuplicateRecordDialog from '../Modals/DuplicateRecordDialog';
import { getReferenceFormType } from '../Helpers/functions';
import DatabaseDefaultIcon from '../Helpers/DatabaseDefaultIcon';
import LookupField2 from '../FormControls/LookupField2';

const TableActionButton = ({
	tooltip,
	Icon,
	disabled,
	onClick,
	color,
	size,
	enableContextMenu,
	contextOptions,
}) => {
	const [contextMenu, setContextMenu] = useState(null);

	return (
		<Tooltip arrow title={tooltip}>
			<span>
				<IconButton
					disabled={disabled}
					onClick={onClick}
					sx={{ color }}
					size={size}
					onContextMenu={(e) => {
						if (enableContextMenu) {
							e.preventDefault();
							setContextMenu(
								contextMenu === null
									? {
											mouseX: e.clientX + 2,
											mouseY: e.clientY + 4,
									  }
									: null
							);
						}
					}}>
					{Icon}
				</IconButton>

				{enableContextMenu ? (
					<Menu
						open={contextMenu !== null}
						onClose={() => setContextMenu(null)}
						anchorReference='anchorPosition'
						anchorPosition={
							contextMenu !== null
								? { top: contextMenu.mouseY, left: contextMenu.mouseX }
								: undefined
						}>
						{contextOptions.map((option) => option)}
					</Menu>
				) : null}
			</span>
		</Tooltip>
	);
};

TableActionButton.propTypes = {
	tooltip: PropTypes.string,
	Icon: PropTypes.object.isRequired,
	disabled: PropTypes.bool,
	onClick: PropTypes.func,
	color: PropTypes.string.isRequired,
	size: PropTypes.oneOf(['small', 'medium', 'large']),
	enableContextMenu: PropTypes.bool,
	contextOptions: PropTypes.array,
};

TableActionButton.defaultProps = {
	badgeContent: '',
};

const TableActions = ({
	mobileMode,
	numSelected,
	show,
	disabled,

	size,
	color,

	onShiftTop,
	hideShiftTop,
	disableShiftTop,

	onShiftUp,
	hideShiftUp,
	disableShiftUp,

	onShiftDown,
	hideShiftDown,
	disableShiftDown,

	onShiftBottom,
	hideShiftBottom,
	disableShiftBottom,
}) => {
	return (
		<Box sx={{ display: show ? 'block' : 'none' }}>
			{!mobileMode ? (
				<Stack direction='row' spacing={2}>
					{/* Top */}
					{!hideShiftTop ? (
						<TableActionButton
							tooltip='Shift to Top'
							disabled={disableShiftTop || disabled}
							onClick={onShiftTop}
							Icon={<FirstPage sx={{ transform: 'rotate(90deg)' }} />}
							color={color}
							size={size}
						/>
					) : null}

					{/* Up */}
					{!hideShiftUp ? (
						<TableActionButton
							tooltip='Shift Up One Row'
							disabled={disableShiftUp || disabled}
							onClick={onShiftUp}
							Icon={<ChevronLeft sx={{ transform: 'rotate(90deg)' }} />}
							color={color}
							size={size}
						/>
					) : null}

					{/* Down */}
					{!hideShiftDown ? (
						<TableActionButton
							tooltip='Shift Down One Row'
							disabled={disableShiftDown || disabled}
							onClick={onShiftDown}
							Icon={<ChevronRight sx={{ transform: 'rotate(90deg)' }} />}
							color={color}
							size={size}
						/>
					) : null}

					{/* Bottom */}
					{!hideShiftBottom ? (
						<TableActionButton
							tooltip='Shift to Bottom'
							disabled={disableShiftBottom || disabled}
							onClick={onShiftBottom}
							Icon={<LastPage sx={{ transform: 'rotate(90deg)' }} />}
							color={color}
							size={size}
						/>
					) : null}

					<Divider orientation='vertical' flexItem />
				</Stack>
			) : null}
		</Box>
	);
};

TableActions.propTypes = {
	mobileMode: PropTypes.bool,
	numSelected: PropTypes.number,
	show: PropTypes.bool,
	size: PropTypes.oneOf(['small', 'medium', 'large']),
	color: PropTypes.string,

	disabled: PropTypes.bool, //global disable

	onShiftTop: PropTypes.func,
	hideShiftTop: PropTypes.bool,
	disableShiftTop: PropTypes.bool,

	onShiftUp: PropTypes.func,
	hideShiftUp: PropTypes.bool,
	disableShiftUp: PropTypes.bool,

	onShiftDown: PropTypes.func,
	hideShiftDown: PropTypes.bool,
	disableShiftDown: PropTypes.bool,

	onShiftBottom: PropTypes.func,
	hideShiftBottom: PropTypes.bool,
	disableShiftBottom: PropTypes.bool,
};

export default React.memo(TableActions);
