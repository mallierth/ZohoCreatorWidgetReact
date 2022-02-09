import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { useRecoilValue } from 'recoil';
import { Box, Button, Typography } from '@mui/material';
import DatabaseDefaultIcon from '../Helpers/DatabaseDefaultIcon';
import CustomTable from '../CustomTable/CustomTable';
import CustomDataTable from '../CustomDataTable/CustomDataTable';
import {
	sum,
	currency,
	intTryParse,
	zohoDownloadUrlParser,
	zohoFilenameParserFromDownloadUrl,
} from '../Helpers/functions';
import { FileDownload } from '@mui/icons-material';

//? Report Filter Columns
export const columns = [
	{
		field: 'Employee',
		searchField: 'Employee_Full_Name',
		flex: 2,
		valueGetter: ({ value }) => value.display_value || '',
	},
	{
		field: 'Approver',
		searchField: 'Approver_Full_Name',
		flex: 2,
		valueGetter: ({ value }) => value.display_value || '',
	},
	{
		field: 'Description',
		flex: 2,
	},
	{
		field: 'Date_field',
		headerName: 'Date',
		searchField: false,
		type: 'date',
		flex: 2,
	},
	{
		field: 'Amount',
		searchField: false,
		type: 'number',
		flex: 1,
		valueFormatter: ({ value }) => currency(value),
	},
	{
		field: 'Merchant',
		flex: 2,
	},
	{
		field: 'Category',
		searchField: 'Category_Name',
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
		field: 'Comment',
	},
	{
		field: 'Paid_Through',
		headerName: 'Paid Through',
		searchField: false,
		flex: 2,
		valueGetter: ({ value }) => value.display_value || '',
	},
	{
		field: 'Purchase_Order',
		headerName: 'Purchase Order',
		searchField: false,
		flex: 2,
		valueGetter: ({ value }) => value.display_value || '',
	},
	{
		field: 'File_Upload',
		headerName: 'Receipt',
		searchField: false,
		flex: 3,
		renderCell: ({ value }) => (
			<>
				{value ? (
					<Button
						color='info'
						startIcon={<FileDownload />}
						onClick={(e) => {
							e.stopPropagation();
							const link = document.createElement('a');
							link.download = zohoFilenameParserFromDownloadUrl(value);
							link.href = zohoDownloadUrlParser(value);
							link.click();
						}}>
						{zohoFilenameParserFromDownloadUrl(value)}
					</Button>
				) : null}
			</>
		),
	},
];

//? Add columns that will be used only for filtering
export const filterColumns = [...columns].sort((a, b) => {
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
	const total = sum(rows, 'Amount');

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

const ExpenseReport = ({ maxHeight, variant, forcedCriteria, loadData }) => {
	return (
		<CustomDataTable
			formName='Expense'
			height={maxHeight - 16}
			forcedCriteria={forcedCriteria} //! add
			loadDataOnAddNewRow={loadData} //! add
			DataGridProps={{
				checkboxSelection: true,
				disableSelectionOnClick: true,
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

ExpenseReport.propTypes = {
	maxHeight: PropTypes.number,
	forcedCriteria: PropTypes.string,
	loadData: PropTypes.object,
	variant: PropTypes.oneOf(['tab']),
};

export default ExpenseReport;
