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
		field: 'Number',
		type: 'number',
		flex: 1,
		hide: true,
	},
	{
		field: 'Name',
		flex: 1,
	},
	{
		field: 'Purchase_Order',
		headerName: 'Purchase Order',
		searchField: 'Purchase_Order_Name',
		flex: 2,
		valueGetter: ({ value }) => value.display_value || '',
	},
	{
		field: 'Vendor_Name',
		headerName: 'Vendor',
		flex: 3,
	},

	{
		field: 'Added_Time',
		headerName: 'Date',
		flex: 2,
		type: 'dateTime',
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

const PurchaseReceiveReport = ({
	maxHeight,
	showActions,
	forcedCriteria,
	loadData,
	variant,
}) => {
	return (
		<CustomDataTable
			formName='Purchase_Receive'
			height={maxHeight - 16}
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
			hideFilters={variant === 'tab'}
			hideSearch={variant === 'tab'}
		/>
	);
};

PurchaseReceiveReport.propTypes = {
	maxHeight: PropTypes.number,
	forcedCriteria: PropTypes.string,
	loadData: PropTypes.object,
	variant: PropTypes.oneOf(['tab']),
	showActions: PropTypes.bool,
};

PurchaseReceiveReport.defaultProps = {
	forcedCriteria: '',
};

export default PurchaseReceiveReport;
