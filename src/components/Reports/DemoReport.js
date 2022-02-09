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
		flex: 1,
	},
	{
		field: 'Alias',
		flex: 3,
	},
	{
		field: 'Type',
		flex: 1.5,
		valueOptions: ['Manufacturer', 'Internal'],
	},
	{
		field: 'Status',
		flex: 1.5,
		valueOptions: ['Active', 'Complete'],
	},
	{
		field: 'Description',
		searchField: false,
		flex: 8,
		renderCell: ({ value }) => (
			<Box
				sx={{ maxHeight: '150px', overflowY: 'auto' }}
				dangerouslySetInnerHTML={{ __html: value }}></Box>
		),
	},
	{
		field: 'Owner',
		searchField: false,
		flex: 2,
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

const DemoReport = ({ maxHeight, variant, forcedCriteria, loadData }) => {
	return (
		<CustomDataTable
			formName='Demo'
			forcedCriteria={forcedCriteria}
			height={maxHeight - 16}
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

DemoReport.propTypes = {
	maxHeight: PropTypes.number,
	forcedCriteria: PropTypes.string,
	loadData: PropTypes.object,
	variant: PropTypes.oneOf(['tab']),
};

export default DemoReport;
