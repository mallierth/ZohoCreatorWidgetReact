import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { useRecoilValue } from 'recoil';
import {
	Box,
	Button,
	DialogActions,
	Grid,
	IconButton,
	Stack,
	TextField,
	Typography,
} from '@mui/material';
import { Close, ContentCopy } from '@mui/icons-material';
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
import RenderPopup from '../Helpers/RenderPopup';

//? Report Filter Columns
export const columns = [
	{
		field: 'Number',
		flex: 1,
		type: 'number',
		hide: true,
	},
	{
		field: 'Name',
		flex: 1,
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
		field: 'Owner',
		searchField: 'Owner_Name',
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
		field: 'Type',
		flex: 1.5,
		valueOptions: [
			'Quote',
			'Change Order INTERNAL',
			'Change Order EXTERNAL',
			'Service Order',
			'Service Contract',
			'Box Sale',
		],
	},
	{
		field: 'Status',
		flex: 2,
		valueOptions: (params) => {
			console.log('QuoteReport Status params', params);

			const decimalAmount = intTryParse(params?.Total)
				? parseFloat(params?.Total)
				: 0;

			switch (params?.Type) {
				case 'Quote':
					return [
						'Open for Engineering',
						'Engineering Review Complete',
						'Proposal Review Complete',
						'Scope Review Complete',
						'Financial Review Complete',
						'Accepted',
					];
				case 'Change Order INTERNAL':
					if (decimalAmount >= 100) {
						return [
							'Open for Engineering',
							'Engineering Review Complete',
							'Finance Review Complete',
							'Accepted',
						];
					}

					return [
						'Open for Engineering',
						'Engineering Review Complete',
						'Accepted',
					];
				case 'Change Order EXTERNAL':
					return [
						'Open for Engineering',
						'Engineering Review Complete',
						'Sales Manager Review Complete',
						'Accepted',
					];
				case 'Service Contract':
				case 'Service Order':
				case 'Box Sale':
					return ['Open', 'Accepted'];
				default:
					return [
						'Open for Engineering',
						'Engineering Review Complete',
						'Proposal Review Complete',
						'Scope Review Complete',
						'Financial Review Complete',
						'Project Management Review Complete',
						'Accepted',
					];
			}
		},
	},
	{
		field: 'Total',
		type: 'number',
		flex: 1,
		valueFormatter: ({ value }) => currency(value),
	},
	{
		field: 'Converted_to',
		headerName: 'Sales Order',
		searchField: 'Sales_Order_Name',
		flex: 1,
		valueGetter: ({ value }) => value.display_value || '',
	},
];

//? Add columns that will be used only for filtering
export const filterColumns = [
	...columns,
	{
		field: 'Comment',
	},
	{
		field: 'Void_field',
		headerName: 'Void',
		type: 'boolean',
	},
].sort((a, b) => {
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

const QuoteReport = ({ maxHeight, variant, forcedCriteria, loadData, ignoreDefaultView }) => {
	//! add
	return (
		<CustomDataTable
			formName='Quote'
			height={maxHeight - 16}
			ignoreDefaultView={ignoreDefaultView}
			forcedCriteria={forcedCriteria} //! add
			loadDataOnAddNewRow={loadData} //! add
			duplicateDialogComponent={(data, setData, open, onClose, onDuplicate) => (
				<RenderPopup
					title={getNameFn('Quote', data)}
					formName={'Quote'}
					open={open}
					onClose={onClose}>
					<Stack spacing={2} sx={{ p: 1 }}>
						<LookupField2
							name='Account'
							label='Account'
							defaultSortByColumn='Name'
							reportName='Accounts_Report'
							required
							error={!data?.Account}
							defaultValue={data?.Account}
							onChange={(e) => setData((old) => ({ ...old, Account: e }))}
							endAdornment={
								<IconButton edge='end' size='large'>
									<DatabaseDefaultIcon form='Account' />
								</IconButton>
							}
						/>
						<LookupField2
							name='Reference'
							label='Reference'
							defaultSortByColumn='Name'
							formName='Billing_Entity'
							reportName='Billing_Entities'
							defaultCriteria={
								data?.Account ? `Account==${data.Account.ID}` : ''
							}
							required
							error={!data?.Reference}
							defaultValue={data.Reference}
							onChange={(e) => setData((old) => ({ ...old, Reference: e }))}
							endAdornment={
								<IconButton edge='end' size='large'>
									<DatabaseDefaultIcon form={getReferenceFormType(data)} />
								</IconButton>
							}
							referenceFormName={getReferenceFormType(data)}
						/>
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
					</Stack>

					<DialogActions>
						<Button variant='outlined' startIcon={<Close />} onClick={onClose}>
							Close
						</Button>
						<Button
							variant='contained'
							startIcon={<ContentCopy />}
							onClick={onDuplicate}>
							Duplicate
						</Button>
					</DialogActions>
				</RenderPopup>
				// <DuplicateRecordDialog
				// 	title={getNameFn('Quote', data)}
				// 	formName={'Quote'}
				// 	open={open}
				// 	onClose={onClose}
				// 	onDuplicate={onDuplicate}>
				// 	<Grid container spacing={2}>
				// 		<Grid item xs={12}>
				// 			<LookupField2
				// 				name='Account'
				// 				label='Account'
				// 				defaultSortByColumn='Name'
				// 				reportName='Accounts_Report'
				// 				required
				// 				error={!data?.Account}
				// 				defaultValue={data?.Account}
				// 				onChange={(e) => setData((old) => ({ ...old, Account: e }))}
				// 				endAdornment={
				// 					<IconButton edge='end' size='large'>
				// 						<DatabaseDefaultIcon form='Account' />
				// 					</IconButton>
				// 				}
				// 			/>
				// 		</Grid>
				// 		<Grid item xs={12}>
				// 			<LookupField2
				// 				name='Reference'
				// 				label='Reference'
				// 				defaultSortByColumn='Name'
				// 				formName='Billing_Entity'
				// 				reportName='Billing_Entities'
				// 				defaultCriteria={
				// 					data?.Account ? `Account==${data.Account.ID}` : ''
				// 				}
				// 				required
				// 				error={!data?.Reference}
				// 				defaultValue={data.Reference}
				// 				onChange={(e) => setData((old) => ({ ...old, Reference: e }))}
				// 				endAdornment={
				// 					<IconButton edge='end' size='large'>
				// 						<DatabaseDefaultIcon form={getReferenceFormType(data)} />
				// 					</IconButton>
				// 				}
				// 				referenceFormName={getReferenceFormType(data)}
				// 			/>
				// 		</Grid>
				// 		<Grid item xs={12}>
				// 			<TextField
				// 				label='Quantity'
				// 				value={data.Quantity || 0}
				// 				helperText={
				// 					!data.Quantity
				// 						? 'Please enter a value for this required field'
				// 						: ''
				// 				}
				// 				error={!data.Quantity}
				// 				type='number'
				// 				onChange={(e) =>
				// 					setData((old) => ({
				// 						...old,
				// 						Quantity: Number(e.target.value),
				// 					}))
				// 				}
				// 				required
				// 			/>
				// 		</Grid>
				// 	</Grid>
				// </DuplicateRecordDialog>
			)}
			DataGridProps={{
				checkboxSelection: true,
				disableSelectionOnClick: true,
				getRowClassName: ({ row }) =>
					row.Void_field === true || row.Void_field === 'true'
						? `error-row`
						: '',
				components: {
					Footer: CustomFooter,
				},
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

QuoteReport.propTypes = {
	ignoreDefaultView: PropTypes.bool,
	maxHeight: PropTypes.number,
	forcedCriteria: PropTypes.string,
	loadData: PropTypes.object,
	variant: PropTypes.oneOf(['tab']),
};

export default QuoteReport;
