import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { useRecoilValue } from 'recoil';
import { Box, Typography } from '@mui/material';
import DatabaseDefaultIcon from '../Helpers/DatabaseDefaultIcon';
import CustomTable from '../CustomTable/CustomTable';
import CustomDataTable from '../CustomDataTable/CustomDataTable';
import { sum, currency, intTryParse } from '../Helpers/functions';

//? Report Filter Columns
export const columns = [
	{
		field: 'Number',
		flex: 1,
		type: 'number',
		hide: true,
	},
	{
		field: 'Name',
		flex: 1,
	},
	{
		field: 'Description',
		flex: 3,
	},
	{
		field: 'Account',
		searchField: 'Account_Name',
		flex: 2,
		valueGetter: ({ value }) => value.display_value || '',
	},
	{
		field: 'Owner',
		searchField: 'Owner_Name',
		flex: 2,
		valueGetter: ({ value }) => value.display_value || '',
	},
	{
		field: 'Reference',
		searchField: 'Reference_Name',
		flex: 1,
		valueGetter: ({ value }) => value.display_value || '',
	},
	{
		field: 'Type',
		flex: 1.5,
		valueOptions: [
			'Project_Order',
			'Change Order INTERNAL',
			'Change Order EXTERNAL',
			'Service Order',
			'Service Contract',
			'Box Sale',
			'Rack Build Parts',
		],
	},
	{
		field: 'Status',
		flex: 2,
		valueOptions: (params) => {
			console.log('SalesOrderReport Status params', params);

			switch (params?.Type) {
				case 'Project Order':
					return [
						'Open for Drafting',
						'Drafting Review Complete',
						'Programming Review Complete',
						'Engineering Review Complete',
						'Waiting for Parts',
						'Partially Received',
						'Fully Received',
						'Closed',
					];
				case 'Change Order INTERNAL':
				case 'Change Order EXTERNAL':
				case 'Service Order':
				case 'Service Contract':
				case 'Box Sale':
					return [
						'Open',
						'Waiting for Parts',
						'Partially Received',
						'Fully Received',
						'Closed',
					];
				case 'Rack Build Parts':
					return ['Open', 'Closed'];
				default:
					return [
						'Open',
						'Open for Drafting',
						'Drafting Review Complete',
						'Programming Review Complete',
						'Engineering Review Complete',
						'Waiting for Parts',
						'Partially Received',
						'Fully Received',
						'Closed',
					];
			}
		},
	},
	{
		field: 'Total',
		type: 'number',
		flex: 1,
		valueFormatter: ({ value }) => currency(value),
	},
	{
		field: 'Converted_from',
		headerName: 'Quote',
		searchField: 'Quote_Name',
		flex: 1,
		valueGetter: ({ value }) => value.display_value || '',
	},
];

//? Add columns that will be used only for filtering
export const filterColumns = [
	...columns,
	{
		field: 'Comment',
	},
	{
		field: 'Void_field',
		headerName: 'Void',
		type: 'boolean',
	},
].sort((a, b) => {
	if (
		a.headerName
			? a.headerName
			: a.field < b.headerName
			? b.headerName
			: b.field
	) {
		return -1;
	} else if (
		a.headerName
			? a.headerName
			: a.field > b.headerName
			? b.headerName
			: b.field
	) {
		return 1;
	} else {
		return 0;
	}
});

const CustomFooter = ({ rows }) => {
	const total = sum(rows, 'Total');

	return (
		<Box
			sx={{
				p: 1,
				display: 'flex',
				alignItems: 'center',
				justifyContent: 'space-between',
			}}>
			<Box
				sx={{ display: 'flex', '& > *': { pr: 1 }, color: 'text.secondary' }}>
				<Typography variant='body1'>Total: {currency(total)}</Typography>
			</Box>
			<Box>
				<Typography variant='body2'>Total Rows: {rows.length}</Typography>
			</Box>
		</Box>
	);
};
CustomFooter.propTypes = {
	rows: PropTypes.array.isRequired,
};

const SalesOrderReport = ({ maxHeight, variant, forcedCriteria, loadData, ignoreDefaultView, }) => {
	return (
		<CustomDataTable
			formName='Sales_Order'
			height={maxHeight - 16}
			ignoreDefaultView={ignoreDefaultView}
			forcedCriteria={forcedCriteria} //! add
			loadDataOnAddNewRow={loadData} //! add
			DataGridProps={{
				checkboxSelection: true,
				disableSelectionOnClick: true,
				getRowClassName: ({ row }) =>
					row.Void_field === true || row.Void_field === 'true'
						? `error-row`
						: '',
				components: {
					Footer: CustomFooter,
				},
			}}
			ActionProps={{
				showDuplicate: true,
			}}
			WrapperProps={{
				elevation: 4,
			}}
			columns={columns}
			filterColumns={filterColumns}
			hideFilters={variant === 'tab'} //! add
			hideSearch={variant === 'tab'} //! add
		/>
	);
};

SalesOrderReport.propTypes = {
	ignoreDefaultView: PropTypes.bool,
	maxHeight: PropTypes.number,
	forcedCriteria: PropTypes.string,
	loadData: PropTypes.object,
	variant: PropTypes.oneOf(['tab']),
};

export default SalesOrderReport;
