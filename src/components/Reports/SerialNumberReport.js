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
		field: 'Value',
		headerName: 'Serial Number',
		flex: 3,
	},
	{
		field: 'Product',
		searchField: ['Price_Book_Item_Name', 'Price_Book_Item_Code', 'Price_Book_Item_Description', 'Manufacturer'],
		flex: 5,
		valueGetter: ({ row }) => {
			let manufacturer = row.Manufacturer ? row.Manufacturer + ' ' : '';
			let nameCode =
				row.Price_Book_Item_Name === row.Price_Book_Item_Code
					? row.Price_Book_Item_Name
					: `${row.Price_Book_Item_Name} (${row.Price_Book_Item_Code})`;

			if (row.Price_Book_Item_Code === 'Custom') {
				return row.Price_Book_Item_Description;
			}

			return manufacturer + nameCode;
		},
	},
	{
		field: 'Location',
		flex: 3,
	},
	{
		field: 'Status',
		flex: 2,
		valueOptions: ['Available', 'Reserved', 'Customer Asset', 'Removed'],
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

const SerialNumberReport = ({
	maxHeight,
	variant,
	forcedCriteria,
	loadData,
}) => {
	return (
		<CustomDataTable
			formName='Serial_Number'
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

SerialNumberReport.propTypes = {
	maxHeight: PropTypes.number.isRequired,
	forcedCriteria: PropTypes.string,
	loadData: PropTypes.object,
	variant: PropTypes.oneOf(['tab']),
};

export default SerialNumberReport;
