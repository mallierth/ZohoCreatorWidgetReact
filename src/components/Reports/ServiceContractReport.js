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
		field: 'Alias',
		flex: 3,
	},
	{
		field: 'Billing_Account',
		headerName: 'Account',
		searchField: 'Billing_Account_Name',
		flex: 2,
		valueGetter: ({ value }) => value.display_value || '',
	},
	{
		field: 'Accounts',
		searchField: 'Accounts_Names',
		flex: 4,
		valueGetter: ({ value }) =>
			value && Array.isArray(value) ? value?.map((v) => v.display_value).join(', ') : '',
	},
	{
		field: 'Type',
		flex: 2,
		valueOptions: [
			'A - 1st Year Job Warranty (VMA)',
			'B - VMA (VP Maintenance Agreement)',
			'C - VMA w/Exclusions',
			'D - VMA & Codec Coverage',
			'E - VMA w/Exclusions & Codec Covg',
			'F - VMA & Codec Covg & Remote Monit.',
			'G - VMA & Remote Monitoring',
			'H - Codec Core Services Only (No Labor)',
			'I - Service Labor - Block of Time or Hours',
			'J - Service Labor And Equipment (Block of Money)',
			'K - Billable Manufacturers Warranty ONLY',
			'L - Parts, Firmware & Software Upgrades (No Labor)',
			'M - Parts Only Shipped NEXT DAY',
			'N - VP Hosting Agreement',
			'P- PrePaid Out-of-Scope Work',
			'S - Sales Support Subscription',
			'SL- StarLeaf',
			'V - Cisco/Acano Hosting',
			'W - Registered Managed Services',
			'X- Webex',
			'Y- Acano Maintenance',
			'Membership',
			'Codec Coverage',
		].sort(),
	},
	{
		field: 'Status',
		flex: 2,
		valueOptions: ['Active', 'Expired', 'Renewed'],
	},
	{
		field: 'Contract_Value',
		headerName: 'Contract Value',
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
export const filterColumns = [
	...columns,
	{
		field: 'Added_Time',
		headerName: 'Date Created',
		searchField: false,
		type: 'dateTime',
		flex: 2,
	},
	{
		field: 'Renewed_to_Contract',
		headerName: 'Renewed To',
		valueGetter: ({ value }) => value.display_value || '',
	},
	{
		field: 'Renewed_from_Contract',
		headerName: 'Renewed from',
		valueGetter: ({ value }) => value.display_value || '',
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
	const total = sum(rows, 'Contract_Value');

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

const ServiceContractReport = ({
	maxHeight,
	variant,
	forcedCriteria,
	loadData,
	ignoreDefaultView,
}) => {
	return (
		<CustomDataTable
			formName='Service_Contract'
			height={maxHeight - 16}
			ignoreDefaultView={ignoreDefaultView}
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

ServiceContractReport.propTypes = {
	ignoreDefaultView: PropTypes.bool,
	maxHeight: PropTypes.number,
	forcedCriteria: PropTypes.string,
	loadData: PropTypes.object,
	variant: PropTypes.oneOf(['tab']),
};

export default ServiceContractReport;
