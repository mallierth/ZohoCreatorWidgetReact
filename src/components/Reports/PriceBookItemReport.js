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
		flex: 3,
	},
	{
		field: 'Code',
		flex: 3,
	},
	{
		field: 'Type',
		flex: 1,
		valueOptions: [
			'Goods',
			'Service',
			'Assembly',
			'Comment',
			'Contingency',
			'Credit',
		],
	},
	{
		field: 'Description',
		flex: 5,
	},

	{
		field: 'Manufacturer',
		searchField: 'Manufacturer_Name',
		flex: 2,
		valueGetter: ({ value }) => value.display_value || '',
	},
	{
		field: 'Vendor',
		searchField: 'Vendor_Name',
		flex: 2,
		valueGetter: ({ value }) => value.display_value || '',
	},
	{
		field: 'Cost',
		searchField: false,
		type: 'number',
		flex: 1,
		valueFormatter: ({ value }) => currency(value),
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

const PriceBookItemReport = ({
	maxHeight,
	variant,
	forcedCriteria,
	loadData,
	onChange,
}) => {
	return (
		<CustomDataTable
			formName='Price_Book_Item'
			height={maxHeight - 16}
			forcedCriteria={forcedCriteria} //! add
			loadDataOnAddNewRow={loadData} //! add
			disableOpenOnRowClick={variant === 'lookupField'} //? add 2
			DataGridProps={{
				checkboxSelection: true,
				disableSelectionOnClick: variant !== 'lookupField', //? Updated
				disableMultipleSelection: variant === 'lookupField',
			}}
			WrapperProps={{
				elevation: 4,
			}}
			columns={columns}
			filterColumns={filterColumns}
			hideFilters={variant === 'tab'} //! add
			hideSearch={variant === 'tab'} //! add
			onChange={onChange} //? add 2
		/>
	);
};

PriceBookItemReport.propTypes = {
	maxHeight: PropTypes.number,
	forcedCriteria: PropTypes.string,
	loadData: PropTypes.object,
	variant: PropTypes.oneOf(['tab', 'lookupField']), //? Updated
	onChange: PropTypes.func,  //? Updated
};

export default PriceBookItemReport;
