import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { useRecoilValue } from 'recoil';
import { Box, Typography } from '@mui/material';
import DatabaseDefaultIcon from '../Helpers/DatabaseDefaultIcon';
import CustomTable from '../CustomTable/CustomTable';
import CustomDataTable from '../CustomDataTable/CustomDataTable';
import { sum, currency, intTryParse } from '../Helpers/functions';
import { DisabledByDefault } from '@mui/icons-material';

//? Report Filter Columns
export const columns = [
	{
		field: 'Type',
		flex: 1,
		valueOptions: ['Manufacturer', 'Block of Hours', 'Subscription'].sort(),
	},
	{
		field: 'Manufacturer',
		flex: 2,
		valueGetter: ({ value }) => value.display_value || '',
	},
	{
		field: 'Accounts',
		searchField: 'Accounts_Names',
		flex: 4,
		valueGetter: ({ value }) =>
			value?.map((v) => v.display_value).join(', ') || '',
	},

	{
		field: 'Service_Contract',
		headerName: 'Service Contract',
		searchField: 'Service_Contract_Name',
		flex: 1,
		valueGetter: ({ value }) => value.display_value || '',
	},

	{
		field: 'Description',
		flex: 4,
	},

	{
		field: 'Value',
		searchField: false,
		type: 'number',
		flex: 1,
		valueFormatter: ({ value }) => currency(value),
	},
	{
		field: 'Start_Date',
		headerName: 'Start',
		searchField: false,
		type: 'date',
		flex: 2,
	},
	{
		field: 'End_Date',
		headerName: 'End',
		searchField: false,
		type: 'date',
		flex: 2,
	},
	{
		field: 'Days_Remaining',
		headerName: 'Days Remaining',
		searchField: false,
		type: 'number',
		flex: 1,
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
	const total = sum(rows, 'Value');

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
				<Typography variant='body1'>Total Value: {currency(total)}</Typography>
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

const SubscriptionReport = ({
	maxHeight,
	variant,
	forcedCriteria,
	loadData,
}) => {
	return (
		<CustomDataTable
			formName='Subscription'
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

SubscriptionReport.propTypes = {
	maxHeight: PropTypes.number,
	forcedCriteria: PropTypes.string,
	loadData: PropTypes.object,
	variant: PropTypes.oneOf(['tab']),
};

export default SubscriptionReport;
