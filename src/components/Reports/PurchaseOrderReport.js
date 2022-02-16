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
		field: 'Vendor',
		searchField: 'Vendor_Name',
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
		field: 'Status',
		flex: 2,
		valueOptions: () => [
			'Open',
			'Approved',
			'Issued',
			'Partially Received',
			'Closed',
		],
	},
	{
		field: 'Total',
		type: 'number',
		flex: 1,
		valueFormatter: ({ value }) => currency(value),
	},
	{
		field: 'Date_field',
		headerName: 'Date',
		type: 'date',
		flex: 2,
		valueGetter: ({ value }) => value && new Date(value)
	},
	{
		field: 'Buyer',
		searchField: false,
		flex: 2,
		valueGetter: ({ value }) => value.display_value || '',
	},
];

//? Add columns that will be used only for filtering
export const filterColumns = [
	...columns,
	{
		field: 'Added_Time',
		headerName: 'Date Created',
		type: 'dateTime',
		flex: 2,
		valueGetter: ({ value }) => value && new Date(value)
	},
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

const PurchaseOrderReport = ({
	maxHeight,
	variant,
	forcedCriteria,
	loadData,
}) => {
	return (
		<CustomDataTable
			formName='Purchase_Order'
			height={maxHeight - 16}
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

PurchaseOrderReport.propTypes = {
	maxHeight: PropTypes.number,
	forcedCriteria: PropTypes.string,
	loadData: PropTypes.object,
	variant: PropTypes.oneOf(['tab']),
};

export default PurchaseOrderReport;
