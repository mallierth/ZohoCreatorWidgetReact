import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { useRecoilValue } from 'recoil';
import { Box, Button, Stack, Typography } from '@mui/material';
import { FileDownload } from '@mui/icons-material';
import DatabaseDefaultIcon from '../Helpers/DatabaseDefaultIcon';
import CustomTable from '../CustomTable/CustomTable';
import CustomDataTable from '../CustomDataTable/CustomDataTable';
import {
	sum,
	currency,
	intTryParse,
	zohoFilenameParserFromDownloadUrl,
	zohoDownloadUrlParser,
} from '../Helpers/functions';

//? Report Filter Columns
export const columns = [
	{
		field: 'Name',
		searchField: ['First_Name', 'Last_Name', ],
		flex: 2,
		valueGetter: ({ row }) => row.First_Name + ' ' + row.Last_Name,
	},
	{
		field: 'Email',
		flex: 3,
	},
	{
		field: 'Direct_Phone',
		headerName: 'Direct Phone',
		searchField: false,
		flex: 2,
	},
	{
		field: 'Office_Phone',
		headerName: 'Office Phone',
		searchField: false,
		flex: 2,
	},
	{
		field: 'Accounts',
		flex: 5,
		valueGetter: ({ value }) =>
			value && Array.isArray(value) ? value?.map((v) => v.display_value).join(', ') : '',
	},
	{
		field: 'Contact',
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

const PortalUserReport = ({ maxHeight, variant, forcedCriteria, loadData }) => {
	return (
		<CustomDataTable
			formName='Portal_User'
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

PortalUserReport.propTypes = {
	maxHeight: PropTypes.number,
	forcedCriteria: PropTypes.string,
	loadData: PropTypes.object,
	variant: PropTypes.oneOf(['tab']),
};

export default PortalUserReport;
