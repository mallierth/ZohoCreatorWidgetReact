import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { useRecoilValue } from 'recoil';
import { Box, Tooltip, Typography } from '@mui/material';
import {
	Category,
	Forum,
	MoneyOff,
	PriceCheck,
	Settings,
	Timer,
	Warning,
} from '@mui/icons-material';
import DatabaseDefaultIcon from '../Helpers/DatabaseDefaultIcon';
import CustomTable from '../CustomTable/CustomTable';
import DataGridGroupToggleButton from '../CustomDataTable/DataGridGroupToggleButton';
import CustomDataTable from '../CustomDataTable/CustomDataTable';
import { sum, currency, intTryParse, percent } from '../Helpers/functions';

//? Report Filter Columns
export const columns = [
	// {
	// 	field: 'Purchase_Order',
	// 	headerName: 'Purchase Order',
	// 	flex: 1,
	// 	valueGetter: ({ value }) => value.display_value || '',
	// },
	{
		field: 'Type',
		headerName: '',
		align: 'center',
		width: 50,
		valueOptions: [
			'Goods',
			'Service',
			'Assembly',
			'Comment',
			'Contingency',
			'Credit',
		],
		valueFormatter: ({ value }) => value,
		valueParser: (value) => value,
		renderCell: ({ row }) => {
			switch (row.Type) {
				case 'Goods':
					return (
						<Tooltip arrow title='Goods' placement='right'>
							<Settings color='primary' />
						</Tooltip>
					);
				case 'Service':
					return (
						<Tooltip arrow title='Service' placement='right'>
							<Timer color='secondary' />
						</Tooltip>
					);
				case 'Assembly':
					return (
						<Tooltip arrow title='Assembly' placement='right'>
							<Category color='success' />
						</Tooltip>
					);
				case 'Comment':
					return (
						<Tooltip arrow title='Comment' placement='right'>
							<Forum color='info' />
						</Tooltip>
					);
				case 'Contingency':
					return (
						<Tooltip arrow title='Contingency' placement='right'>
							<PriceCheck color='warning' />
						</Tooltip>
					);
				case 'Credit':
					return (
						<Tooltip arrow title='Credit' placement='right'>
							<MoneyOff color='error' />
						</Tooltip>
					);
				default:
					return (
						<Tooltip arrow title='Credit' placement='right'>
							<Warning />
						</Tooltip>
					);
			}
		},
	},
	{
		field: 'Manufacturer',
		flex: 2,
	},
	{
		field: 'Product',
		flex: 5,
		valueGetter: ({ row }) => getProductInfo(row),
		renderCell: ({ row }) => getProductInfoRendered(row),
	},
	{
		field: 'Description',
		flex: 5,
		hide: true,
		enableExport: true,
	},
	{
		field: 'Quantity',
		type: 'number',
		flex: 1,
		valueFormatter: ({ api, id, value, row }) => {
			//Workaround to still enable export for xlsx where api isn't defined
			let _row;
			if (row) {
				_row = row;
			} else {
				_row = api.getRow(id);
			}
			return _row.Type === 'Comment' ? '' : value;
		},
	},
	{
		field: 'Cost',
		type: 'number',
		flex: 1,
		valueFormatter: ({ api, id, value, row }) => {
			//Workaround to still enable export for xlsx where api isn't defined
			let _row;
			if (row) {
				_row = row;
			} else {
				_row = api.getRow(id);
			}
			return _row.Type === 'Comment' ? '' : currency(value);
		},
	},
	{
		field: 'Cost_Total',
		headerName: 'Cost Total',
		type: 'number',
		flex: 1,
		valueFormatter: ({ api, id, value, row }) => {
			//Workaround to still enable export for xlsx where api isn't defined
			let _row;
			if (row) {
				_row = row;
			} else {
				_row = api.getRow(id);
			}
			return _row.Type === 'Comment' ? '' : currency(value);
		},
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

const getProductInfo = (row) => {
	let manufacturer = row.Manufacturer ? row.Manufacturer + ' ' : '';
	let nameCode = row.Name === row.Code ? row.Name : `${row.Name} (${row.Code})`;

	if (row.Code === 'Custom') {
		return row.Description;
	}

	return manufacturer + nameCode;
};

const getProductInfoRendered = (row) => {
	let nameCode = row.Name === row.Code ? row.Name : `${row.Name} (${row.Code})`;

	if (row.Type === 'Comment') {
		return <Typography variant='body2'>{row.Description}</Typography>;
	}

	return (
		<Box sx={{ display: 'grid' }}>
			<Typography variant='body2' sx={{ fontWeight: 'bold' }}>
				{nameCode}
			</Typography>
			<Typography
				variant='caption'
				sx={{ color: 'secondary', fontStyle: 'italic' }}>
				{row.Description}
			</Typography>
		</Box>
	);
};

const PurchaseOrderLineItemReport = ({
	maxHeight,
	showActions,
	forcedCriteria,
	loadData,
	variant,
	onChange,
}) => {
	return (
		<CustomDataTable
			formName='Purchase_Order_Line_Item'
			height={maxHeight - 16}
			forcedCriteria={forcedCriteria}
			loadDataOnAddNewRow={loadData}
			// rowFormatter={(rows) =>
			// 	rows.map((row) => {
			// 		if (
			// 			row.Collapsible_Child === true ||
			// 			row.Collapsible_Child === 'true'
			// 		) {
			// 			//? Child (should be contained within a parent's Collapsible_Line_Items)
			// 			const _parent = rows.filter(
			// 				(d) =>
			// 					Array.isArray(d.Collapsible_Line_Items) &&
			// 					d.Collapsible_Line_Items.map((x) => x.ID).includes(row.ID)
			// 			)[0];

			// 			return { ...row, hierarchy: [_parent.ID, row.ID] };
			// 			/*return {
			// 				...row,
			// 				hierarchy: [
			// 					`${getProductInfo(_parent)}_${_parent.ID}`,
			// 					getProductInfo(row),
			// 				],
			// 			};
			// 			*/
			// 		}

			// 		return { ...row, hierarchy: [row.ID] };
			// 		//return { ...row, hierarchy: [getProductInfo(row)] };
			// 	})
			// }
			DataGridProps={{
				rowHeight: 44,
				checkboxSelection: true,
				disableSelectionOnClick: true,
				// components: {
				// 	Footer: CustomFooter,
				// },
				// getRowClassName: ({ row }) =>
				// 	row.hierarchy.length > 1 ? 'action-row' : '',
				// isRowSelectable: ({ row }) => row.hierarchy.length === 1,
				// treeData: true,
				// getTreeDataPath: (row) => row.hierarchy,
				// groupingColDef: {
				// 	headerName: '',
				// 	width: 50,
				// 	align: 'center',
				// 	renderCell: (params) => <DataGridGroupToggleButton {...params} />,
				// },
			}}
			WrapperProps={{
				elevation: 4,
			}}
			columns={columns}
			filterColumns={filterColumns}
			hideFilters={variant === 'tab'} //! add
			hideSearch={variant === 'tab'} //! add
			onChange={onChange}
		/>
	);
};

PurchaseOrderLineItemReport.propTypes = {
	maxHeight: PropTypes.number,
	forcedCriteria: PropTypes.string,
	loadData: PropTypes.object,
	variant: PropTypes.oneOf(['tab']),
	showActions: PropTypes.bool,
	onChange: PropTypes.func,
};

export default PurchaseOrderLineItemReport;
