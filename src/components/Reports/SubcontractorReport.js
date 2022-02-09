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
		field: 'Name',
		flex: 4,
	},
	{
		field: 'Primary_Contact',
		headerName: 'Primary Contact',
		searchField: false,
		flex: 2,
		valueGetter: ({ value }) => value.display_value || '',
	},
	{
		field: 'Note',
		flex: 4,
	},
	{
		field: 'Contacts',
		searchField: false,
		flex: 2,
		valueGetter: ({ value }) =>
			Array.isArray(value) ? value.map((v) => v.display_value).join(', ') : '',
	},
	{
		field: 'Phone',
		flex: 2,
	},
	{
		field: 'Email',
		flex: 4,
	},
	{
		field: 'Website',
		flex: 4,
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

const SubcontractorReport = ({
	maxHeight,
	variant,
	forcedCriteria,
	loadData,
}) => {
	return (
		<CustomDataTable
			formName='Subcontractor'
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

SubcontractorReport.propTypes = {
	maxHeight: PropTypes.number,
	forcedCriteria: PropTypes.string,
	loadData: PropTypes.object,
	variant: PropTypes.oneOf(['tab']),
};

export default SubcontractorReport;
