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
		field: 'Subject_field',
		headerName: 'Subject',
		flex: 3,
	},
	{
		field: 'Priority',
		flex: 2,
		valueOptions: ['Low', 'Medium', 'High', 'Critical'],
	},
	{
		field: 'Status',
		flex: 2,
		valueOptions: ['Open', 'On Hold', 'Service Ordered', 'Closed'],
	},
	{
		field: 'Type',
		flex: 2,
		valueOptions: ['Question', 'Problem', 'Feature', 'Other'],
	},

	{
		field: 'Service_Orders',
		headerName: 'Service Orders',
		searchField: 'Service_Orders_Name',
		flex: 2,
		valueGetter: ({ value }) =>
			value && Array.isArray(value)
				? value?.map((v) => v.display_value).join(', ')
				: '',
	},
	{
		field: 'Added_Time',
		headerName: 'Created',
		searchField: false,
		type: 'dateTime',
		flex: 2,
		valueGetter: ({ value }) => value && new Date(value),
	},
	{
		field: 'Due_Date',
		headerName: 'Due',
		searchField: false,
		type: 'dateTime',
		flex: 2,
		valueGetter: ({ value }) => value && new Date(value),
	},
	{
		field: 'ID',
		adminOnly: true,
		flex: 2,
	},
	{
		field: 'Zoho_Desk_ID',
		adminOnly: true,
		flex: 2,
	}
];

//? Add columns that will be used only for filtering
export const filterColumns = [
	...columns,
	{
		field: 'Added_Time',
		headerName: 'Date Created',
		type: 'dateTime',
	},
	{
		field: 'Date_Requested',
		headerName: 'Date Requested',
		type: 'dateTime',
	},
	{
		field: 'Date_Completed',
		headerName: 'Date Completed',
		type: 'date',
	},
	{
		field: 'Date_Closed',
		headerName: 'Date Closed',
		type: 'date',
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
	const estimatedHours = sum(rows, 'Total_Estimated_Hours');
	const actualHours = sum(rows, 'Total_Actual_Hours');
	const costToDate = sum(rows, 'Estimated_Cost_to_Date');
	const utilization = Math.round((actualHours / estimatedHours) * 100, 2);

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
				<Typography variant='body1'>
					Actual Hours: {actualHours}
					{', '}
				</Typography>
				<Typography variant='body1'>
					Estimated Hours: {estimatedHours}
					{', '}
				</Typography>
				<Typography variant='body1'>
					Utilization: {utilization} %{', '}
				</Typography>

				<Typography variant='body1'>
					Cost to Date: {currency(costToDate)}
				</Typography>
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

const ServiceRequestReport = ({
	maxHeight,
	variant,
	forcedCriteria,
	loadData,
	ignoreDefaultView,
}) => {
	return (
		<CustomDataTable
			formName='Service_Request'
			height={maxHeight - 16}
			ignoreDefaultView={ignoreDefaultView}
			forcedCriteria={forcedCriteria} //! add
			loadDataOnAddNewRow={loadData} //! add
			DataGridProps={{
				checkboxSelection: true,
				disableSelectionOnClick: true,
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

ServiceRequestReport.propTypes = {
	ignoreDefaultView: PropTypes.bool,
	maxHeight: PropTypes.number,
	forcedCriteria: PropTypes.string,
	loadData: PropTypes.object,
	variant: PropTypes.oneOf(['tab']),
};

export default ServiceRequestReport;
