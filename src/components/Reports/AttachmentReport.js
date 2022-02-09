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
		field: 'Description',
		flex: 2,
	},
	{
		field: 'File_Upload',
		headerName: 'File',
		searchField: false,
		flex: 5,
		renderCell: ({ row }) => (
			<Button
				color='info'
				startIcon={<FileDownload />}
				onClick={(e) => {
					e.stopPropagation();
					const link = document.createElement('a');
					link.download = zohoFilenameParserFromDownloadUrl(row.File_Upload);
					link.href = zohoDownloadUrlParser(row.File_Upload);
					link.click();
				}}>
				{zohoFilenameParserFromDownloadUrl(row.File_Upload)}
			</Button>
		),
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

const AttachmentReport = ({ maxHeight, variant, forcedCriteria, loadData }) => {
	return (
		<CustomDataTable
			formName='Attachment'
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

AttachmentReport.propTypes = {
	maxHeight: PropTypes.number,
	forcedCriteria: PropTypes.string,
	loadData: PropTypes.object,
	variant: PropTypes.oneOf(['tab']),
};

export default AttachmentReport;
