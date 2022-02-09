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
		field: 'Number',
		flex: 1,
		type: 'number',
	},
	{
		field: 'Owner',
		searchField: 'Owner_Name',
		flex: 2,
		valueGetter: ({ value }) => value.display_value || '',
	},
	{
		field: 'Shipping_Address',
		headerName: 'Shipping Address',
		flex: 4,
		valueGetter: ({ row }) => {
			const street = row.Shipping_Address_Street;
			const city = row.Shipping_Address_City;
			const state = row.Shipping_Address_State;
			const zipCode = row.Shipping_Address_Zip_Code;

			if (street && city && state) {
				return `${street}, ${city}, ${state} ${zipCode}`;
			}

			if (city && state) {
				return `${city}, ${state} ${zipCode}`;
			}

			if (city) {
				return `${city} ${zipCode}`;
			}

			if (state) {
				return `${state} ${zipCode}`;
			}
		},
	},

	{
		field: 'Status',
		flex: 2,
		valueOptions: ['Prospect', 'Customer', 'Former Customer'],
	},
	{
		field: 'Industry',
		searchField: 'Industry_Name',
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

const CustomFooter = ({ rows }) => {
	const total = sum(rows, 'Total');

	return (
		<Box
			sx={{
				p: 1,
				display: 'flex',
				alignItems: 'center',
				justifyContent: 'space-between',
			}}>
			<Box
				sx={{ display: 'flex', '& > *': { pr: 1 }, color: 'text.secondary' }}>
				<Typography variant='body1'>Total: {currency(total)}</Typography>
			</Box>
			<Box>
				<Typography variant='body2'>Total Rows: {rows.length}</Typography>
			</Box>
		</Box>
	);
};
CustomFooter.propTypes = {
	rows: PropTypes.array.isRequired,
};

const AccountReport = ({ maxHeight, variant, forcedCriteria, loadData }) => {
	return (
		<CustomDataTable
			formName='Account'
			reportName='Accounts_Report'
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

AccountReport.propTypes = {
	maxHeight: PropTypes.number,
	forcedCriteria: PropTypes.string,
	loadData: PropTypes.object,
	variant: PropTypes.oneOf(['tab']),
};

export default AccountReport;
