import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { useRecoilValue } from 'recoil';
import { Box, Grid, IconButton, TextField, Typography } from '@mui/material';
import DatabaseDefaultIcon from '../Helpers/DatabaseDefaultIcon';
import CustomTable from '../CustomTable/CustomTable';
import CustomDataTable from '../CustomDataTable/CustomDataTable';
import DuplicateRecordDialog from '../Modals/DuplicateRecordDialog';
import LookupField2 from '../FormControls/LookupField2';
import {
	sum,
	currency,
	intTryParse,
	getNameFn,
	getReferenceFormType,
} from '../Helpers/functions';

//? Report Filter Columns
export const columns = [
	{
		field: 'Name',
		flex: 2,
		valueGetter: ({ row }) => {
			if (row.Price_Book_Item) {
				return row.Price_Book_Item.display_value;
			}

			return row.Name;
		},
	},
	{
		field: 'Description',
		flex: 3,
	},
	{
		field: 'Account',
		searchField: 'Account_Name',
		flex: 2,
		valueGetter: ({ value }) => value.display_value || '',
	},
	{
		field: 'Serial_Number',
		headerName: 'Serial Number',
		searchField: 'Serial_Number_Value',
		flex: 2,
		valueGetter: ({ value }) => value.display_value || '',
	},
	{
		field: 'Quantity',
		flex: 1,
		type: 'number',
	},
	{
		field: 'Customer_Room',
		headerName: 'Customer Room',
		searchField: 'Customer_Room_Name',
		flex: 3,
		valueGetter: ({ value }) => value.display_value || '',
	},
	{
		field: 'Service_Contract',
		headerName: 'Service Contract',
		searchField: 'Service_Contract_Name',
		flex: 2,
		valueGetter: ({ value }) => value.display_value || '',
	},
	{
		field: 'Purchase_Price',
		headerName: 'Purchase Price',
		searchField: false,
		flex: 1,
		valueGetter: ({ value }) => currency(value),
	},
	{
		field: 'Date_Purchased',
		headerName: 'Date Purchased',
		searchField: false,
		type: 'date',
		flex: 1,
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

const CustomerAssetReport = ({
	maxHeight,
	variant,
	forcedCriteria,
	loadData,
	showActions,
	ignoreDefaultView,
}) => {
	return (
		<CustomDataTable
			formName='Customer_Asset'
			height={maxHeight - 16}
			ignoreDefaultView={ignoreDefaultView}
			forcedCriteria={forcedCriteria}
			loadDataOnAddNewRow={loadData}
			duplicateDialogComponent={(data, setData, open, onClose, onDuplicate) => (
				<DuplicateRecordDialog
					title={getNameFn('Customer_Asset', data)}
					formName={'Customer_Asset'}
					open={open}
					onClose={onClose}
					onDuplicate={onDuplicate}>
					<Grid container spacing={2}>
						<Grid item xs={12}>
							<Typography>
								Customer Asset duplication is kept simple: Basically all
								properties from the source Customer Asset will be copied to the
								specified number of new assets.
							</Typography>
						</Grid>
						<Grid item xs={12}>
							<TextField
								label='Duplicate Quantity'
								value={data.Duplicate_Quantity || 0}
								helperText={
									!data.Duplicate_Quantity
										? 'Please enter a value for this required field'
										: ''
								}
								error={!data.Duplicate_Quantity}
								type='number'
								onChange={(e) =>
									setData((old) => ({
										...old,
										Duplicate_Quantity: Number(e.target.value),
									}))
								}
								required
							/>
						</Grid>
					</Grid>
				</DuplicateRecordDialog>
			)}
			DataGridProps={{
				checkboxSelection: true,
				disableSelectionOnClick: true,
			}}
			ActionProps={{
				showDuplicate: true,
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

CustomerAssetReport.propTypes = {
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

CustomerAssetReport.defaultProps = {
	forcedCriteria: '',
};

export default CustomerAssetReport;
