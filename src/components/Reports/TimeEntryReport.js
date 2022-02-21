import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { useRecoilValue } from 'recoil';
import { Box, Typography } from '@mui/material';
import DatabaseDefaultIcon from '../Helpers/DatabaseDefaultIcon';
import CustomTable from '../CustomTable/CustomTable';
import CustomDataTable from '../CustomDataTable/CustomDataTable';
import { sum, currency, intTryParse } from '../Helpers/functions';
import { ContactMail, ManageAccounts } from '@mui/icons-material';
import RenderForm from '../Helpers/RenderForm';
import ResponsiveDialog from '../Modals/ResponsiveDialog';
import { currentUserState } from '../../recoil/atoms';

//? Report Filter Columns
export const columns = [
	{
		field: 'Employee',
		searchField: 'Employee_Full_Name',
		flex: 2,
		valueGetter: ({ value }) => value.display_value || '',
	},
	{
		field: 'Reference',
		searchField: 'Reference_Name',
		flex: 2,
		valueGetter: ({ value }) => value.display_value || '',
	},
	{
		field: 'Reason',
		searchField: 'Reason_Name',
		flex: 2,
		valueGetter: ({ value }) => value.display_value || '',
	},
	{
		field: 'Actual_Hours',
		headerName: 'Actual Hours',
		type: 'number',
		flex: 1,
	},
	{
		field: 'Report_Start',
		headerName: 'Start',
		searchField: false,
		type: 'dateTime',
		flex: 2,
		valueGetter: ({ value }) => value && new Date(value)
	},
	{
		field: 'Report_End',
		headerName: 'End',
		searchField: false,
		type: 'dateTime',
		flex: 2,
		valueGetter: ({ value }) => value && new Date(value)
	},
	{
		field: 'Work_Performed',
		headerName: 'Work Performed',
		flex: 5,
	},
];

//? Add columns that will be used only for filtering
export const filterColumns = [
	...columns,
	{ field: 'Date_field', headerName: 'Date', type: 'date' },
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

const TimeEntryReport = ({
	maxHeight,
	variant,
	forcedCriteria,
	loadData,
	showActions,
}) => {
	const currentUser = useRecoilValue(currentUserState);
	return (
		<CustomDataTable
			formName='Time_Entry'
			height={maxHeight - 16}
			forcedCriteria={forcedCriteria}
			loadDataOnAddNewRow={{
				Employee: {
					display_value: currentUser.Full_Name,
					ID: currentUser.ID,
				},
				Reason: currentUser.Default_Time_Entry_Reason,
				...loadData,
			}}
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

TimeEntryReport.propTypes = {
	showActions: PropTypes.bool,
	maxHeight: PropTypes.number,
	forcedCriteria: PropTypes.string,
	loadData: PropTypes.object,
	variant: PropTypes.oneOf(['tab']),
};

TimeEntryReport.defaultProps = {
	forcedCriteria: '',
};

export default TimeEntryReport;
