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
	Compress,
	Delete,
	Edit,
	Expand,
	FileCopy,
	FileDownload,
	FilterAlt,
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
					<Icon />
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
	onClick: PropTypes.func.isRequired,
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
	hidden,

	size,
	color,

	//Views
	onClickViews,
	hideViews,
	disableViews,
	hasActiveView,

	//Filters
	onClickFilters,
	hideFilters,
	disableFilters,

	//Add
	onClickAdd,
	hideAdd, //default shown
	disableAdd,

	//Edit
	onClickEdit,
	hideEdit, //default shown
	disableEdit,

	//Mass Update
	onClickMassUpdate,
	hideMassUpdate, //default shown
	disableMassUpdate,

	//Delete
	onClickDelete,
	hideDelete, //default shown
	disableDelete,

	//Export
	onClickExport,
	hideExport, //default shown
	disableExport,

	//Duplicate
	onClickDuplicate,
	showDuplicate, //default hidden
	disableDuplicate,
}) => {
	//<Box sx={{ visibility: hidden ? 'hidden' : 'visible' }}>
	return (
		<Box sx={{ display: hidden ? 'none' : 'block' }}>
			{!mobileMode ? (
				<Stack direction='row' spacing={2}>
					{/* Views */}
					{!hideViews ? (
						<TableActionButton
							tooltip='Saved Views'
							disabled={disableViews}
							onClick={onClickViews}
							Icon={TableView}
							color={color}
							size={size}
							badgeContent={hasActiveView ? ' ' : ''}
						/>
					) : null}

					{/* Filter */}
					{!hideFilters ? (
						<TableActionButton
							tooltip='Customize Active Filters'
							disabled={disableFilters}
							onClick={onClickFilters}
							Icon={FilterAlt}
							color={color}
							size={size}
						/>
					) : null}

					{/* Edit */}
					{!hideEdit ? (
						<TableActionButton
							tooltip='Edit'
							disabled={disableEdit}
							onClick={onClickEdit}
							Icon={Edit}
							color={color}
							size={size}
						/>
					) : null}

					{/* Mass Update */}
					{!hideMassUpdate ? (
						<TableActionButton
							tooltip='Mass Update'
							disabled={disableMassUpdate}
							onClick={onClickMassUpdate}
							Icon={Build}
							color={color}
							size={size}
						/>
					) : null}

					{/* Duplicate */}
					{showDuplicate ? (
						<TableActionButton
							tooltip='Duplicate'
							disabled={disableDuplicate}
							onClick={onClickDuplicate}
							Icon={FileCopy}
							color={color}
							size={size}
						/>
					) : null}

					{/* Delete */}
					{!hideDelete ? (
						<TableActionButton
							tooltip='Delete'
							disabled={disableDelete}
							onClick={onClickDelete}
							Icon={Delete}
							color={color}
							size={size}
						/>
					) : null}

					{/* Export */}
					{!hideExport ? (
						<TableActionButton
							tooltip={`Export ${
								numSelected > 0 ? 'Selected Rows ' : ''
							}to Excel (.xlsx)`}
							disabled={disableExport}
							onClick={onClickExport}
							Icon={FileDownload}
							color={color}
							size={size}
						/>
					) : null}

					{/* Add */}
					{!hideAdd ? (
						<TableActionButton
							tooltip='Add New'
							disabled={disableAdd}
							onClick={() => onClickAdd(false)}
							Icon={Add}
							color={color}
							size={size}
							enableContextMenu
							contextOptions={[
								<MenuItem key={1} onClick={() => onClickAdd(true)}>
									{`Add Record in New Tab`}
								</MenuItem>,
							]}
						/>
					) : null}
				</Stack>
			) : null}
		</Box>
	);
};

TableActions.propTypes = {
	mobileMode: PropTypes.bool,
	numSelected: PropTypes.number,
	hidden: PropTypes.bool,
	size: PropTypes.oneOf(['small', 'medium', 'large']),
	color: PropTypes.string,

	//Views
	onClickViews: PropTypes.func,
	hideViews: PropTypes.bool,
	disableViews: PropTypes.bool,
	hasActiveView: PropTypes.bool,

	//Filters
	onClickFilters: PropTypes.func,
	hideFilters: PropTypes.bool,
	disableFilters: PropTypes.bool,

	//Add
	onClickAdd: PropTypes.func,
	hideAdd: PropTypes.bool, //default shown
	disableAdd: PropTypes.bool,

	//Edit
	onClickEdit: PropTypes.func,
	hideEdit: PropTypes.bool, //default shown
	disableEdit: PropTypes.bool,

	//Mass Update
	onClickMassUpdate: PropTypes.func,
	hideMassUpdate: PropTypes.bool, //default shown
	disableMassUpdate: PropTypes.bool,

	//Delete
	onClickDelete: PropTypes.func,
	hideDelete: PropTypes.bool, //default shown
	disableDelete: PropTypes.bool,

	//Export
	onClickExport: PropTypes.func,
	hideExport: PropTypes.bool, //default shown
	disableExport: PropTypes.bool,

	//Duplicate
	onClickDuplicate: PropTypes.func,
	showDuplicate: PropTypes.bool, //default hidden
	disableDuplicate: PropTypes.bool,
};

export default React.memo(TableActions);
