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
		field: 'Account',
		searchField: 'Account_Name',
		flex: 2,
		valueGetter: ({ value }) => value.display_value || '',
	},
	{
		field: 'Owner',
		flex: 2,
	},
	{
		field: 'Project_Manager',
		headerName: 'Project Manager',
		searchField: 'Project_Manager_Full_Name',
		flex: 2,
		valueGetter: ({ value }) => value.display_value || '',
	},
	{
		field: 'Status',
		flex: 2,
		valueOptions: [
			'Preliminary',
			'Open',
			'On Hold',
			'Pending Closeout',
			'Closed',
		],
	},
	{
		field: 'Total_Actual_Hours',
		headerName: 'Actual Hours',
		type: 'number',
		flex: 1,
	},
	{
		field: 'Total_Estimated_Hours',
		headerName: 'Estimated Hours',
		type: 'number',
		flex: 1,
	},
	{
		field: 'Utilization',
		headerName: 'Utilization (%)',
		searchField: false,
		type: 'number',
		flex: 1,
		valueGetter: ({ row }) =>
			Math.round(
				(Number(row.Total_Actual_Hours || 0) /
					Number(row.Total_Estimated_Hours || 0)) *
					100,
				2
			),
	},
	{
		field: 'Estimated_Cost_to_Date',
		headerName: 'Cost to Date',
		type: 'number',
		flex: 1,
		valueFormatter: ({ value }) => currency(value),
	},
];

//? Add columns that will be used only for filtering
export const filterColumns = [
	...columns,
	{
		field: 'Category',
		flex: 1.5,
		valueOptions: ['Client', 'Internal'],
	},
	{
		field: 'Reference',
		searchField: 'Reference_Name',
		flex: 1,
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

const ProjectReport = ({ maxHeight, variant, forcedCriteria, loadData }) => {
	return (
		<CustomDataTable
			formName='Project'
			height={maxHeight - 16}
			forcedCriteria={forcedCriteria} //! add
			loadDataOnAddNewRow={loadData} //! add
			DataGridProps={{
				checkboxSelection: true,
				disableSelectionOnClick: true,
				getRowClassName: ({ row }) => {
					if (row.Utilization >= 80 && row.Utilization < 95) {
						return 'warning-row';
					} else if (row.Utilization >= 95) {
						return 'error-row';
					}
				},
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

ProjectReport.propTypes = {
	maxHeight: PropTypes.number,
	forcedCriteria: PropTypes.string,
	loadData: PropTypes.object,
	variant: PropTypes.oneOf(['tab']),
};

export default ProjectReport;
