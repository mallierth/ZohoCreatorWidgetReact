import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { useRecoilValue } from 'recoil';
import { Box, Typography } from '@mui/material';
import { GridActionsCellItem } from '@mui/x-data-grid';
import DatabaseDefaultIcon from '../Helpers/DatabaseDefaultIcon';
import CustomTable from '../CustomTable/CustomTable';
import CustomDataTable from '../CustomDataTable/CustomDataTable';
import { sum, currency, intTryParse } from '../Helpers/functions';
import { ContactMail, ManageAccounts } from '@mui/icons-material';
import RenderForm from '../Helpers/RenderForm';
import ResponsiveDialog from '../Modals/ResponsiveDialog';

//? Report Filter Columns
export const columns = [
	{
		field: 'Name',
		flex: 4,
	},
	{
		field: 'Drawings_Name',
		headerName: 'Alt Name',
		flex: 4,
	},
	{
		field: 'Description',
		flex: 3,
	},
	{
		field: 'Account',
		searchField: 'Account_Name',
		flex: 3,
		valueGetter: ({ value }) => value.display_value || '',
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

const CustomerRoomReport = ({
	maxHeight,
	variant,
	forcedCriteria,
	loadData,
	showActions,
	ignoreDefaultView,
}) => {
	return (
		<CustomDataTable
			formName='Customer_Room'
			height={maxHeight - 16}
			ignoreDefaultView={ignoreDefaultView}
			forcedCriteria={forcedCriteria}
			loadDataOnAddNewRow={loadData}
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

CustomerRoomReport.propTypes = {
	ignoreDefaultView: PropTypes.bool,
	showActions: PropTypes.bool,
	maxHeight: PropTypes.number,
	forcedCriteria: PropTypes.string,
	loadData: PropTypes.shape({
		Service_Order: PropTypes.oneOfType([PropTypes.string, PropTypes.object]),
		Reference: PropTypes.oneOfType([PropTypes.string, PropTypes.object]),
		Parent_ID: PropTypes.string,
	}),
	variant: PropTypes.oneOf(['tab']),
};

CustomerRoomReport.defaultProps = {
	forcedCriteria: '',
};

export default CustomerRoomReport;
