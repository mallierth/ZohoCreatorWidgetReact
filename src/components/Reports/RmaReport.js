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
	},
	{
		field: 'Vendor',
		searchField: 'Vendor_Name',
		flex: 2,
		valueGetter: ({ value }) => value.display_value || '',
	},
	{
		field: 'Account',
		searchField: 'Account_Name',
		flex: 2,
		valueGetter: ({ value }) => value.display_value || '',
	},
	{
		field: 'Contact',
		searchField: false,
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
		field: 'Technicians_Responsible',
		headerName: 'Technicians Responsible',
		flex: 2,
		valueGetter: ({ value }) =>
			Array.isArray(value) ? value.map((v) => v.display_value).join(', ') : '',
	},
	{
		field: 'Cost_of_Repair',
		headerName: 'Cost of Repair',
		type: 'number',
		flex: 1,
		valueFormatter: ({ value }) => currency(value),
	},
	{
		field: 'Comment',
		flex: 5,
	},
	{
		field: 'Type',
		flex: 1,
		valueOptions: () => ['Project', 'Service'],
	},
	{
		field: 'Status',
		flex: 1,
		valueOptions: () => [
			'Open',
			'Approved',
			'Issued',
			'Partially Received',
			'Closed',
		],
	},
];

//? Add columns that will be used only for filtering
export const filterColumns = [].sort((a, b) => {
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

const RmaReport = ({ maxHeight, variant, forcedCriteria, loadData }) => {
	return (
		<CustomDataTable
			formName='RMA'
			height={maxHeight - 16}
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

RmaReport.propTypes = {
	maxHeight: PropTypes.number,
	forcedCriteria: PropTypes.string,
	loadData: PropTypes.object,
	variant: PropTypes.oneOf(['tab']),
};

export default RmaReport;
