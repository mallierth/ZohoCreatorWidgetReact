import React from 'react';
import PropTypes from 'prop-types';
import { omit } from 'lodash';
import { Box, Paper } from '@mui/material';
import ToolbarSearch from './ToolbarSearch';
import ToolbarRowShiftControls from './ToolbarRowShiftControls';
import ToolbarRowGroupControls from './ToolbarRowGroupControls';
import ToolbarActions from './ToolbarActions';

const CustomDataTableToolbar = ({
	//Updated props
	mobileMode,
	numSelected,

	//ToolbarSearch props
	SearchProps,
	hideSearch,

	//ToolbarRowShiftControls props
	RowShiftControlProps,

	//ToolbarRowGroupControls props
	RowGroupControlProps,

	//ToolbarActions props
	ActionProps,
	hideActions,

	WrapperProps,
}) => {
	return (
		<Paper
			elevation={4}
			{...omit(WrapperProps, 'sx')}
			sx={{
				border: (theme) =>
					theme.palette.mode === 'dark'
						? `1px solid ${
								numSelected > 0
									? theme.palette.secondary.light
									: 'rgba(81,81,81,1)'
						  }`
						: `1px solid ${
								numSelected > 0
									? theme.palette.secondary.light
									: 'rgba(224,224,224,1)'
						  }`,
				width: '100%',
				overflowX: 'hidden',
				p: 1,
				mt: 1,
				//mx: 1,
				display: 'flex',
				justifyContent: 'space-between',
				alignItems: 'center',
				color: 'text.primary',
				backgroundColor: numSelected > 0 ? 'secondary.light' : '',
				...WrapperProps.sx,
			}}>
			<Box sx={{ display: 'flex', alignItems: 'center' }}>
				<ToolbarSearch
					hidden={hideSearch}
					mobileMode={mobileMode}
					numSelected={numSelected}
					{...SearchProps}
				/>

				<ToolbarRowShiftControls
					mobileMode={mobileMode}
					numSelected={numSelected}
					{...RowShiftControlProps}
				/>

				<ToolbarRowGroupControls
					mobileMode={mobileMode}
					numSelected={numSelected}
					{...RowGroupControlProps}
				/>
			</Box>

			<Box sx={{ display: 'flex', alignItems: 'center' }}>
				<ToolbarActions
					hidden={hideActions}
					mobileMode={mobileMode}
					numSelected={numSelected}
					{...ActionProps}
				/>
			</Box>
		</Paper>
	);
};

CustomDataTableToolbar.propTypes = {
	mobileMode: PropTypes.bool,
	numSelected: PropTypes.number,

	hideSearch: PropTypes.bool,
	SearchProps: PropTypes.exact({
		searchBusy: PropTypes.bool,
		hidden: PropTypes.bool,
		disabled: PropTypes.bool,
		defaultValue: PropTypes.string,
		onChange: PropTypes.func,
		ignoreActiveFilters: PropTypes.bool,
		onCheckIgnoreActiveFilters: PropTypes.func,
	}),

	RowGroupControlProps: PropTypes.shape({
		show: PropTypes.bool, //default hidden
		disabled: PropTypes.bool, //global disable

		onCompress: PropTypes.func,
		hideCompress: PropTypes.bool,
		disableCompress: PropTypes.bool,

		onExpand: PropTypes.func,
		hideExpand: PropTypes.bool,
		disableExpand: PropTypes.bool,
	}),
	RowShiftControlProps: PropTypes.shape({
		show: PropTypes.bool, //default hidden
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
	}),

	hideActions: PropTypes.bool,
	ActionProps: PropTypes.exact({
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
	}),
	WrapperProps: PropTypes.object,
};

CustomDataTableToolbar.defaultProps = {
	SearchProps: {},
	RowGroupControlProps: {},
	RowShiftControlProps: {},
	ActionProps: {},
	WrapperProps: {},
};

export default CustomDataTableToolbar;
