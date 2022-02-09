import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { Box, Divider, Paper, Typography } from '@mui/material';
import {
	DataGridPro,
	GridToolbarContainer,
	GridToolbarExport,
} from '@mui/x-data-grid-pro';
import { ArrowDropDown, ArrowRight } from '@mui/icons-material';
import { TreeView } from '@mui/lab';
import { styled, useTheme } from '@mui/styles';
import { useZohoGetAllRecords } from '../Helpers/CustomHooks';
import StyledTreeItem from '../SideNav/StyledTreeItem';
import {
	currency,
	intTryParse,
	margin,
	percent,
	stockCalculation,
	sum,
} from '../Helpers/functions';
import { CanvasJSChart } from 'canvasjs-react-charts';

//#region //? Columns
const columnsAsEngineered = [
	{
		field: 'Quote',
		flex: 1,
		valueGetter: ({ value }) => value.display_value || '',
	},
	{
		field: 'Quote.Description',
		headerName: 'Room',
		flex: 3,
	},
	{
		field: 'Type',
		flex: 1,
	},
	{
		field: 'Product',
		flex: 4,
		valueGetter: ({ row }) => {
			let manufacturer = row.Manufacturer ? row.Manufacturer + ' ' : '';
			let nameCode =
				row.Name === row.Code ? row.Name : `${row.Name} (${row.Code})`;

			if (row.Code === 'Custom') {
				return row.Description;
			}

			return manufacturer + nameCode;
		},
	},
	{
		field: 'Quantity',
		flex: 1,
		type: 'number',
	},
	{
		field: 'Cost',
		flex: 1,
		valueFormatter: ({ value }) => currency(value),
		type: 'number',
	},
	{
		field: 'Cost_Total',
		headerName: 'Cost Total',
		flex: 1,
		valueFormatter: ({ value }) => currency(value),
		type: 'number',
	},
	{
		field: 'Sell_Price_Each',
		headerName: 'Sell Price Each',
		flex: 1,
		valueFormatter: ({ value }) => currency(value),
		type: 'number',
	},
	{
		field: 'Sell_Price_Total',
		headerName: 'Sell Price Total',
		flex: 1,
		valueFormatter: ({ value }) => currency(value),
		type: 'number',
	},
];

const columnsAsContracted = [
	{
		field: 'Sales_Order',
		headerName: 'Sales Order',
		flex: 1,
		valueGetter: ({ value }) => value.display_value || '',
	},
	{
		field: 'Sales_Order.Description',
		headerName: 'Room',
		flex: 3,
	},
	{
		field: 'Type',
		flex: 1,
	},
	{
		field: 'Product',
		flex: 4,
		valueGetter: ({ row }) => {
			let manufacturer = row.Manufacturer ? row.Manufacturer + ' ' : '';
			let nameCode =
				row.Name === row.Code ? row.Name : `${row.Name} (${row.Code})`;

			if (row.Code === 'Custom') {
				return row.Description;
			}

			return manufacturer + nameCode;
		},
	},
	{
		field: 'Quantity',
		flex: 1,
		type: 'number',
	},
	{
		field: 'Cost',
		flex: 1,
		valueFormatter: ({ value }) => currency(value),
		type: 'number',
	},
	{
		field: 'Cost_Total',
		headerName: 'Total Cost',
		flex: 1,
		valueFormatter: ({ value }) => currency(value),
		type: 'number',
	},
	{
		field: 'Sell_Price_Each',
		headerName: 'Sell Price Each',
		flex: 1,
		valueFormatter: ({ value }) => currency(value),
		type: 'number',
	},
	{
		field: 'Sell_Price_Total',
		headerName: 'Sell Price Total',
		flex: 1,
		valueFormatter: ({ value }) => currency(value),
		type: 'number',
	},
];

const columnsAsEngineeredWithChangeOrders = [
	{
		field: 'Quote',
		headerName: 'Quote/Sales Order',
		flex: 1,
		valueGetter: ({ row }) =>
			row.Sales_Order ? row.Sales_Order.display_value : row.Quote.display_value,
	},
	{
		field: 'Quote.Description',
		headerName: 'Room',
		flex: 3,
		valueGetter: ({ row }) =>
			row['Sales_Order.Description']
				? row['Sales_Order.Description']
				: row['Quote.Description'],
	},
	{
		field: 'Type',
		flex: 1,
	},
	{
		field: 'Product',
		flex: 4,
		valueGetter: ({ row }) => {
			let manufacturer = row.Manufacturer ? row.Manufacturer + ' ' : '';
			let nameCode =
				row.Name === row.Code ? row.Name : `${row.Name} (${row.Code})`;

			if (row.Code === 'Custom') {
				return row.Description;
			}

			return manufacturer + nameCode;
		},
	},
	{
		field: 'Quantity',
		flex: 1,
		type: 'number',
	},
	{
		field: 'Cost',
		flex: 1,
		valueFormatter: ({ value }) => currency(value),
		type: 'number',
	},
	{
		field: 'Cost_Total',
		headerName: 'Total Cost',
		flex: 1,
		valueFormatter: ({ value }) => currency(value),
		type: 'number',
	},
	{
		field: 'Sell_Price_Each',
		headerName: 'Sell Price Each',
		flex: 1,
		valueFormatter: ({ value }) => currency(value),
		type: 'number',
	},
	{
		field: 'Sell_Price_Total',
		headerName: 'Sell Price Total',
		flex: 1,
		valueFormatter: ({ value }) => currency(value),
		type: 'number',
	},
];

const columnsPurchasing = [
	{
		field: 'Purchase_Order',
		headerName: 'Purchase Order',
		flex: 1,
		valueGetter: ({ value }) => value.display_value || '',
	},
	{
		field: 'Vendor',
		flex: 2,
		valueGetter: ({ value }) => value.display_value || '',
	},
	{
		field: 'Product',
		flex: 4,
		valueGetter: ({ row }) => {
			let manufacturer = row.Manufacturer ? row.Manufacturer + ' ' : '';
			let nameCode =
				row.Name === row.Code ? row.Name : `${row.Name} (${row.Code})`;

			if (row.Code === 'Custom') {
				return row.Description;
			}

			return manufacturer + nameCode;
		},
	},
	{
		field: 'Quantity',
		flex: 1,
		type: 'number',
	},
	{
		field: 'Cost',
		flex: 1,
		valueFormatter: ({ value }) => currency(value),
		type: 'number',
	},
	{
		field: 'Cost_Total',
		headerName: 'Total Cost',
		flex: 1,
		valueFormatter: ({ value }) => currency(value),
		type: 'number',
	},
];

const columnsSoldVsPurchased = [
	{
		field: 'Product',
		flex: 4,
		valueGetter: ({ row }) => {
			let manufacturer = row.Manufacturer ? row.Manufacturer + ' ' : '';
			let nameCode =
				row.Name === row.Code ? row.Name : `${row.Name} (${row.Code})`;

			if (row.Code === 'Custom') {
				return row.Description;
			}

			return manufacturer + nameCode;
		},
	},
	{
		field: 'Quantity_Sold',
		headerName: 'Sold',
		flex: 1,
		type: 'number',
	},
	{
		field: 'Quantity_Purchased',
		headerName: 'Purchased',
		flex: 1,
		type: 'number',
	},
	{
		field: 'Quantity_Filled',
		headerName: 'Filled',
		flex: 1,
		type: 'number',
	},
	{
		field: 'Quantity_Stock',
		headerName: 'Stock',
		flex: 1,
		type: 'number',
	},
	{
		field: 'Stock_Cost',
		headerName: 'Stock Cost',
		flex: 1,
		valueFormatter: ({ value }) => currency(value),
		type: 'number',
	},
	{
		field: 'Info',
		flex: 2,
	},
	{
		field: 'Suggestion',
		flex: 2,
	},
];

//#endregion

const Main = styled('main', {
	shouldForwardProp: (prop) => prop !== 'open' && prop !== 'desktopMode',
})(({ theme, open, desktopMode }) => ({
	maxWidth: open && desktopMode ? `calc(100vw - 240px)` : '100vw', //replaced
	flexGrow: 1,
	paddingLeft: theme.spacing(1),
	paddingRight: theme.spacing(1),
	transition: theme.transitions.create('margin', {
		easing: theme.transitions.easing.sharp,
		duration: theme.transitions.duration.leavingScreen,
	}),
	marginLeft: desktopMode ? `-240px` : 0,
	...(open && {
		transition: theme.transitions.create('margin', {
			easing: theme.transitions.easing.easeOut,
			duration: theme.transitions.duration.enteringScreen,
		}),
		marginLeft: 0,
	}),
}));

const CustomToolbar = ({ fileName = 'default' }) => {
	return (
		<GridToolbarContainer>
			<GridToolbarExport csvOptions={{ fileName }} />
		</GridToolbarContainer>
	);
};
CustomToolbar.propTypes = {
	fileName: PropTypes.string,
};

const ProjectAudit = ({ referenceId, projectId }) => {
	const theme = useTheme();
	const [expanded, setExpanded] = useState([]);
	const [selected, setSelected] = useState('2');

	const [rowsAsEngineered, setRowsAsEngineered] = useState([]);
	const [rowsAsContracted, setRowsAsContracted] = useState([]);
	const [
		rowsAsEngineeredWithChangeOrders,
		setRowsAsEngineeredWithChangeOrders,
	] = useState([]);
	const [rowsPurchasing, setRowsPurchasing] = useState([]);
	const [rowsSoldVsPurchased, setRowsSoldVsPurchased] = useState([]);

	const quoteLineItemsDataState = useZohoGetAllRecords(
		'Quote_Line_Items',
		`Quote.Reference_ID==${referenceId} && Quote.Type=="Quote" && Quote.Status=="Converted" && Quote.Void_field=false && Deleted=false`
	);
	const opportunityDataState = useZohoGetAllRecords(
		'Opportunities',
		`Reference==${referenceId} && Status=="Closed Won"`
	);
	const projectDataState = useZohoGetAllRecords('Projects', `ID==${projectId}`);
	const salesOrderLineItemsDataState = useZohoGetAllRecords(
		'Sales_Order_Line_Items',
		`Sales_Order.Reference_ID==${referenceId} && Sales_Order.Type=="Project Order" && Sales_Order.Void_field=false && Deleted=false`
	);
	const changeOrderLineItemsDataState = useZohoGetAllRecords(
		'Sales_Order_Line_Items',
		`Sales_Order.Reference_ID==${referenceId} && Sales_Order.Type.contains("Change Order") && Sales_Order.Void_field=false && Deleted=false`
	);
	const externalChangeOrderDataState = useZohoGetAllRecords(
		'Sales_Orders',
		`Reference==${referenceId} && Type=="Change Order EXTERNAL" && Void_field=false`
	);
	const purchaseOrderLineItemsDataState = useZohoGetAllRecords(
		'Purchase_Order_Line_Items',
		`Purchase_Order.Reference_ID==${referenceId} && Purchase_Order.Void_field=false && Deleted=false`
	);

	//#region //? As Engineered (Quote Data)
	const asEngineeredGoodsCostTotal = sum(
		rowsAsEngineered.filter((d) => d.Type === 'Goods'),
		'Cost_Total'
	);
	const asEngineeredGoodsSellTotal = sum(
		rowsAsEngineered.filter((d) => d.Type === 'Goods'),
		'Sell_Price_Total'
	);
	const asEngineeredServicesCostTotal = sum(
		rowsAsEngineered.filter((d) => d.Type === 'Service'),
		'Cost_Total'
	);
	const asEngineeredServicesSellTotal = sum(
		rowsAsEngineered.filter((d) => d.Type === 'Service'),
		'Sell_Price_Total'
	);
	const asEngineeredFloat = intTryParse(opportunityDataState?.data[0]?.Amount)
		? parseFloat(opportunityDataState?.data[0]?.Amount) -
		  sum(
				rowsAsEngineered.filter((d) => d.Type === 'Goods'),
				'Sell_Price_Total'
		  ) -
		  sum(
				rowsAsEngineered.filter((d) => d.Type === 'Service'),
				'Sell_Price_Total'
		  )
		: 0;
	const asEngineeredGrossProfitGoods = margin(
		rowsAsEngineered.filter((d) => d.Type === 'Goods')
	);
	const asEngineeredGrossProfitServices = margin(
		rowsAsEngineered.filter((d) => d.Type === 'Service')
	);
	const asEngineeredCostTotal =
		sum(
			rowsAsEngineered.filter((d) => d.Type === 'Goods'),
			'Cost_Total'
		) +
		sum(
			rowsAsEngineered.filter((d) => d.Type === 'Service'),
			'Cost_Total'
		);
	const asEngineeredSellTotal =
		sum(
			rowsAsEngineered.filter((d) => d.Type === 'Goods'),
			'Sell_Price_Total'
		) +
		sum(
			rowsAsEngineered.filter((d) => d.Type === 'Service'),
			'Sell_Price_Total'
		);
	const asEngineeredGrossProfit = margin([
		...rowsAsEngineered,
		{
			Cost_Total: 0,
			Sell_Price_Total: intTryParse(opportunityDataState?.data[0]?.Amount)
				? parseFloat(opportunityDataState?.data[0]?.Amount) -
				  asEngineeredGoodsSellTotal -
				  asEngineeredServicesSellTotal
				: 0,
		},
	]);
	//#endregion

	//#region //? As Engineered w/ Changes (Quote Data + Sales Order Change Orders)
	const asEngineeredWithChangeOrdersGoodsCostTotal = sum(
		rowsAsEngineeredWithChangeOrders.filter((d) => d.Type === 'Goods'),
		'Cost_Total'
	);
	const asEngineeredWithChangeOrdersGoodsSellTotal = sum(
		rowsAsEngineeredWithChangeOrders.filter((d) => d.Type === 'Goods'),
		'Sell_Price_Total'
	);
	const asEngineeredWithChangeOrdersServicesCostTotal = sum(
		rowsAsEngineeredWithChangeOrders.filter((d) => d.Type === 'Service'),
		'Cost_Total'
	);
	const asEngineeredWithChangeOrdersServicesSellTotal = sum(
		rowsAsEngineeredWithChangeOrders.filter((d) => d.Type === 'Service'),
		'Sell_Price_Total'
	);
	const asEngineeredWithChangeOrdersFloat = intTryParse(
		opportunityDataState?.data[0]?.Amount
	)
		? parseFloat(opportunityDataState?.data[0]?.Amount) -
		  sum(
				rowsAsEngineeredWithChangeOrders.filter((d) => d.Type === 'Goods'),
				'Sell_Price_Total'
		  ) -
		  sum(
				rowsAsEngineeredWithChangeOrders.filter((d) => d.Type === 'Service'),
				'Sell_Price_Total'
		  )
		: 0;
	const asEngineeredWithChangeOrdersGrossProfitGoods = margin(
		rowsAsEngineeredWithChangeOrders.filter((d) => d.Type === 'Goods')
	);
	const asEngineeredWithChangeOrdersGrossProfitServices = margin(
		rowsAsEngineeredWithChangeOrders.filter((d) => d.Type === 'Service')
	);
	const asEngineeredWithChangeOrdersCostTotal =
		sum(
			rowsAsEngineeredWithChangeOrders.filter((d) => d.Type === 'Goods'),
			'Cost_Total'
		) +
		sum(
			rowsAsEngineeredWithChangeOrders.filter((d) => d.Type === 'Service'),
			'Cost_Total'
		);
	const asEngineeredWithChangeOrdersSellTotal =
		sum(
			rowsAsEngineeredWithChangeOrders.filter((d) => d.Type === 'Goods'),
			'Sell_Price_Total'
		) +
		sum(
			rowsAsEngineeredWithChangeOrders.filter((d) => d.Type === 'Service'),
			'Sell_Price_Total'
		);
	const asEngineeredWithChangeOrdersGrossProfit = margin([
		...rowsAsEngineeredWithChangeOrders,
		{
			Cost_Total: 0,
			Sell_Price_Total: intTryParse(opportunityDataState?.data[0]?.Amount)
				? parseFloat(opportunityDataState?.data[0]?.Amount) -
				  asEngineeredWithChangeOrdersGoodsSellTotal -
				  asEngineeredWithChangeOrdersServicesSellTotal
				: 0,
		},
	]);
	//#endregion

	//#region //? As Contracted (Sales Order Data)
	const asContractedGoodsCostTotal = sum(
		rowsAsContracted.filter((d) => d.Type === 'Goods'),
		'Cost_Total'
	);
	const asContractedGoodsSellTotal = sum(
		rowsAsContracted.filter((d) => d.Type === 'Goods'),
		'Sell_Price_Total'
	);
	const asContractedServicesCostTotal = sum(
		rowsAsContracted.filter((d) => d.Type === 'Service'),
		'Cost_Total'
	);
	const asContractedServicesSellTotal = sum(
		rowsAsContracted.filter((d) => d.Type === 'Service'),
		'Sell_Price_Total'
	);
	const asContractedFloat = intTryParse(opportunityDataState?.data[0]?.Amount)
		? parseFloat(opportunityDataState?.data[0]?.Amount) -
		  sum(
				rowsAsContracted.filter((d) => d.Type === 'Goods'),
				'Sell_Price_Total'
		  ) -
		  sum(
				rowsAsContracted.filter((d) => d.Type === 'Service'),
				'Sell_Price_Total'
		  )
		: 0;
	const asContractedGrossProfitGoods = margin(
		rowsAsContracted.filter((d) => d.Type === 'Goods')
	);
	const asContractedGrossProfitServices = margin(
		rowsAsContracted.filter((d) => d.Type === 'Service')
	);
	const asContractedCostTotal =
		sum(
			rowsAsContracted.filter((d) => d.Type === 'Goods'),
			'Cost_Total'
		) +
		sum(
			rowsAsContracted.filter((d) => d.Type === 'Service'),
			'Cost_Total'
		);
	const asContractedSellTotal =
		sum(
			rowsAsContracted.filter((d) => d.Type === 'Goods'),
			'Sell_Price_Total'
		) +
		sum(
			rowsAsContracted.filter((d) => d.Type === 'Service'),
			'Sell_Price_Total'
		);
	const asContractedGrossProfit = margin([
		...rowsAsContracted,
		{
			Cost_Total: 0,
			Sell_Price_Total: intTryParse(opportunityDataState?.data[0]?.Amount)
				? parseFloat(opportunityDataState?.data[0]?.Amount) -
				  asContractedGoodsSellTotal -
				  asContractedServicesSellTotal
				: 0,
		},
	]);
	//#endregion

	const purchasingCostTotal = sum(rowsPurchasing, 'Cost_Total');
	const stockCosts = sum(rowsSoldVsPurchased, 'Stock_Cost');
	const opportunityAmount =
		parseFloat(opportunityDataState?.data[0]?.Amount) || 0;
	const projectTotalExpensesCost =
		parseFloat(projectDataState?.data[0]?.Total_Expenses) || 0;
	const projectTotalHoursCost =
		parseFloat(projectDataState?.data[0]?.Total_Actual_Hours_Cost) || 0;
	const projectValue =
		(parseFloat(opportunityDataState?.data[0]?.Amount) || 0) +
		sum(externalChangeOrderDataState.data, 'Total');
	const projectName = projectDataState?.data?.Name;

	useEffect(() => {
		console.log('quoteLineItemsDataState', quoteLineItemsDataState);

		if (
			quoteLineItemsDataState.status === 'fetched' &&
			changeOrderLineItemsDataState.status === 'fetched'
		) {
			setRowsAsEngineered(quoteLineItemsDataState.data.map(row => ({...row, id: row.ID })));
			setRowsAsEngineeredWithChangeOrders([
				...quoteLineItemsDataState.data.map(row => ({...row, id: row.ID })),
				...changeOrderLineItemsDataState.data.map(row => ({...row, id: row.ID })),
			]);
		}
	}, [quoteLineItemsDataState, changeOrderLineItemsDataState]);

	useEffect(() => {
		console.log(
			'rowsAsEngineered change',
			sum(
				rowsAsEngineered.filter((d) => d.Type === 'Goods'),
				'Cost_Total'
			),
			rowsAsEngineered
		);
	}, [rowsAsEngineered]);

	useEffect(() => {
		if (
			salesOrderLineItemsDataState.status === 'fetched' &&
			purchaseOrderLineItemsDataState.status === 'fetched'
		) {
			setRowsAsContracted(salesOrderLineItemsDataState.data.map(row => ({...row, id: row.ID })));
			setRowsPurchasing(purchaseOrderLineItemsDataState.data.map(row => ({...row, id: row.ID })));

			//* Purchased vs. Sold
			var purchasedVsSoldDeltaData = [];
			//? Iterate through all sales order line items and organize around Price Book Item IDs
			salesOrderLineItemsDataState.data.forEach((salesOrderLineItem) => {
				if (
					purchasedVsSoldDeltaData.length === 0 ||
					purchasedVsSoldDeltaData.filter(
						(d) =>
							d?.Price_Book_Item?.ID === salesOrderLineItem?.Price_Book_Item?.ID
					).length === 0
				) {
					//? purchasedVsSoldDeltaData does NOT include the salesOrderLineItem.Price_Book_Item.ID, so push to purchasedVsSoldDeltaData
					const _Quantity_Purchased = sum(
						purchaseOrderLineItemsDataState.data.filter(
							(pd) =>
								pd.Price_Book_Item_ID ===
								salesOrderLineItem?.Price_Book_Item?.ID
						),
						'Quantity'
					);
					const _Quantity_Filled = sum(
						salesOrderLineItem.Quantity_Reserved,
						'display_value'
					);
					const stockResult = stockCalculation(
						parseInt(salesOrderLineItem.Quantity),
						_Quantity_Purchased,
						_Quantity_Filled
					);
					const _Quantity_Stock = stockResult.Quantity_Stock;
					purchasedVsSoldDeltaData.push({
						...salesOrderLineItem,
						Quantity_Sold: parseInt(salesOrderLineItem.Quantity),
						Quantity_Purchased: _Quantity_Purchased,
						Quantity_Filled: _Quantity_Filled,
						Quantity_Stock: _Quantity_Stock,
						Stock_Cost: _Quantity_Stock * salesOrderLineItem.Cost,
						Info: stockResult.Info,
						Suggestion: stockResult.Suggestion,
					});
				} else {
					//? purchasedVsSoldDeltaData does include the salesOrderLineItem.Price_Book_Item.ID, update purchasedVsSoldDeltaData
					const i = purchasedVsSoldDeltaData.indexOf(
						purchasedVsSoldDeltaData.filter(
							(delta) =>
								delta?.Price_Book_Item?.ID ===
								salesOrderLineItem?.Price_Book_Item?.ID
						)[0]
					);
					const old = purchasedVsSoldDeltaData.filter(
						(delta) =>
							delta?.Price_Book_Item?.ID ===
							salesOrderLineItem?.Price_Book_Item?.ID
					)[0];
					const _Quantity_Filled = sum(
						salesOrderLineItem.Quantity_Reserved,
						'display_value'
					);
					const stockResult = stockCalculation(
						old.Quantity_Sold + parseInt(salesOrderLineItem.Quantity),
						old.Quantity_Filled + _Quantity_Filled
					);
					const _Quantity_Stock = stockResult.Quantity_Stock;
					purchasedVsSoldDeltaData.splice(i, 1, {
						...old,
						Quantity_Sold:
							old.Quantity_Sold + parseInt(salesOrderLineItem.Quantity),
						Quantity_Filled: old.Quantity_Filled + _Quantity_Filled,
						Quantity_Stock: _Quantity_Stock,
						Stock_Cost: _Quantity_Stock * salesOrderLineItem.Cost,
						Info: stockResult.Info,
						Suggestion: stockResult.Suggestion,
					});
				}
			});
			purchaseOrderLineItemsDataState.data.forEach((purchaseOrderLineItem) => {
				if (
					purchasedVsSoldDeltaData.length === 0 ||
					purchasedVsSoldDeltaData.filter(
						(delta) =>
							delta?.Price_Book_Item?.ID ===
							purchaseOrderLineItem?.Price_Book_Item?.ID
					).length === 0
				) {
					//? purchasedVsSoldDeltaData does NOT include the purchaseOrderLineItem.Price_Book_Item.ID, so push to purchasedVsSoldDeltaData
					const _Quantity_Sold =
						salesOrderLineItemsDataState.data.filter(
							(salesOrderLineItem) =>
								salesOrderLineItem?.Price_Book_Item?.ID ===
								purchaseOrderLineItem?.Price_Book_Item?.ID
						).length > 0
							? sum(
									salesOrderLineItemsDataState.data.filter(
										(salesOrderLineItem) =>
											salesOrderLineItem?.Price_Book_Item?.ID ===
											purchaseOrderLineItem?.Price_Book_Item?.ID
									),
									'Quantity'
							  )
							: 0;
					const stockResult = stockCalculation(
						_Quantity_Sold,
						parseInt(purchaseOrderLineItem.Quantity),
						0
					);
					const _Quantity_Stock = stockResult.Quantity_Stock;
					purchasedVsSoldDeltaData.push({
						...purchaseOrderLineItem,
						Quantity_Sold: _Quantity_Sold,
						Quantity_Purchased: parseInt(purchaseOrderLineItem.Quantity),
						Quantity_Filled: 0, //Products not sold won't be able to be filled
						Quantity_Stock: _Quantity_Stock, //These will always be products purchased with 0 sold
						Stock_Cost:
							parseInt(purchaseOrderLineItem.Quantity) *
							purchaseOrderLineItem.Cost, //Change to show cost for products purchased and not sold - this was always 0 because filled from stock was 0
						Info: stockResult.Info,
						Suggestion: stockResult.Suggestion,
					});
				}
			});

			purchasedVsSoldDeltaData.sort(
				(a, b) =>
					purchasedVsSoldDeltaData.indexOf(a.Name) -
					purchasedVsSoldDeltaData.indexOf(b.Name)
			);

			setRowsSoldVsPurchased(purchasedVsSoldDeltaData.map(row => ({...row, id: row.ID })));
		}
	}, [salesOrderLineItemsDataState, purchaseOrderLineItemsDataState]);

	const getProfitAndLossDataPoints = () => {
		var dataPoints = [
			{
				label: 'Project Sell',
				y: opportunityAmount,
			},
			{
				label: 'Equipment Purchased',
				y: -sum(purchaseOrderLineItemsDataState.data, 'Cost_Total'),
			},
			{
				label: 'Expenses',
				y: -projectTotalExpensesCost,
			},
			{
				label: 'Payroll Costs',
				y: -projectTotalHoursCost,
			},
			{
				label: 'Estimated Revenue',
				isCumulativeSum: true,
				indexLabel: '{y}',
			},
		];

		var changeOrderData = [];

		if (externalChangeOrderDataState.status === 'fetched') {
			changeOrderData = externalChangeOrderDataState?.data?.map((d) => ({
				label: d?.Name,
				y: parseFloat(d?.Total),
			}));
		}

		//! Insert change order data if present
		if (changeOrderData.length > 0) {
			changeOrderData.forEach((d) => {
				dataPoints.splice(dataPoints.length - 1, 0, d);
			});
		}

		return dataPoints;
	};

	const renderPage = () => {
		switch (selected) {
			case '1a':
				return (
					<Box>
						<Box sx={{ width: '100%', pb: 4 }}>
							<Typography>As Engineered (Original Quote Data)</Typography>
							<Box sx={{ display: 'flex', height: '100%' }}>
								<Box sx={{ flexGrow: 1 }}>
									<DataGridPro
										rowHeight={25}
										autoHeight
										components={{
											Footer: () => <Box></Box>,
											Toolbar: CustomToolbar,
										}}
										componentsProps={{
											toolbar: {
												fileName: `${projectDataState?.data[0]?.Name} Overview As Engineered`,
											},
										}}
										rows={[
											{
												id: 0,
												Category: 'Goods',
												Cost: currency(asEngineeredGoodsCostTotal),
												Sell_Price: currency(asEngineeredGoodsSellTotal),
												Margin: percent(
													asEngineeredGrossProfitGoods
														? asEngineeredGrossProfitGoods * 100
														: 0
												),
											},
											{
												id: 1,
												Category: 'Services',
												Cost: currency(asEngineeredServicesCostTotal),
												Sell_Price: currency(asEngineeredServicesSellTotal),
												Margin: percent(
													asEngineeredGrossProfitServices
														? asEngineeredGrossProfitServices * 100
														: 0
												),
											},
											{
												id: 2,
												Category: 'CHEDDAH',
												Cost: currency(0),
												Sell_Price: currency(asEngineeredFloat),
												Margin: percent(100),
											},
											{
												id: 3,
												Category: 'Totals:',
												Cost: currency(asEngineeredCostTotal),
												Sell_Price: currency(
													asEngineeredSellTotal + asEngineeredFloat
												),
												Margin: percent(
													asEngineeredGrossProfit
														? asEngineeredGrossProfit * 100
														: 0
												),
											},
										]}
										columns={[
											{
												headerName: ' ',
												field: 'Category',
												flex: 1,
											},
											{
												field: 'Cost',
												flex: 1,
												type: 'number',
											},
											{
												headerName: 'Sell Price',
												field: 'Sell_Price',
												flex: 1,
												type: 'number',
											},
											{
												field: 'Margin',
												flex: 1,
												type: 'number',
											},
										]}
									/>
								</Box>
							</Box>
						</Box>

						<Box sx={{ width: '100%', pb: 4 }}>
							<Typography>As Contracted (Current Sales Order Data)</Typography>
							<Box sx={{ display: 'flex', height: '100%' }}>
								<Box sx={{ flexGrow: 1 }}>
									<DataGridPro
										rowHeight={25}
										autoHeight
										components={{
											Footer: () => <Box></Box>,
											Toolbar: CustomToolbar,
										}}
										componentsProps={{
											toolbar: {
												fileName: `${projectName} Overview As Contracted`,
											},
										}}
										rows={[
											{
												id: 0,
												Category: 'Goods',
												Cost: currency(asContractedGoodsCostTotal),
												Sell_Price: currency(asContractedGoodsSellTotal),
												Margin: percent(
													asContractedGrossProfitGoods
														? asContractedGrossProfitGoods * 100
														: 0
												),
											},
											{
												id: 1,
												Category: 'Services',
												Cost: currency(asContractedServicesCostTotal),
												Sell_Price: currency(asContractedServicesSellTotal),
												Margin: percent(
													asContractedGrossProfitServices
														? asContractedGrossProfitServices * 100
														: 0
												),
											},
											{
												id: 2,
												Category: 'CHEDDAH',
												Cost: currency(0),
												Sell_Price: currency(
													asContractedFloat +
														sum(externalChangeOrderDataState.data, 'Total')
												),
												Margin: percent(100),
											},
											{
												id: 3,
												Category: 'Totals:',
												Cost: currency(asContractedCostTotal),
												Sell_Price: currency(
													asContractedSellTotal +
														asContractedFloat +
														sum(externalChangeOrderDataState.data, 'Total')
												),
												Margin: percent(
													asContractedGrossProfit
														? asContractedGrossProfit * 100
														: 0
												),
											},
										]}
										columns={[
											{
												headerName: ' ',
												field: 'Category',
												flex: 1,
											},
											{
												field: 'Cost',
												flex: 1,
												type: 'number',
											},
											{
												headerName: 'Sell Price',
												field: 'Sell_Price',
												flex: 1,
												type: 'number',
											},
											{
												field: 'Margin',
												flex: 1,
												type: 'number',
											},
										]}
									/>
								</Box>
							</Box>
						</Box>

						<Box sx={{ width: '100%', pb: 4 }}>
							<Typography>
								As Engineered w/ Changes (Original Quote Data + Accepted Change
								Orders)
							</Typography>
							<Box sx={{ display: 'flex', height: '100%' }}>
								<Box sx={{ flexGrow: 1 }}>
									<DataGridPro
										rowHeight={25}
										autoHeight
										components={{
											Footer: () => <Box></Box>,
											Toolbar: CustomToolbar,
										}}
										componentsProps={{
											toolbar: {
												fileName: `${projectName} Overview As Engineered with Changes`,
											},
										}}
										rows={[
											{
												id: 0,
												Category: 'Goods',
												Cost: currency(
													asEngineeredWithChangeOrdersGoodsCostTotal
												),
												Sell_Price: currency(
													asEngineeredWithChangeOrdersGoodsSellTotal
												),
												Margin: percent(
													asEngineeredWithChangeOrdersGrossProfitGoods
														? asEngineeredWithChangeOrdersGrossProfitGoods * 100
														: 0
												),
											},
											{
												id: 1,
												Category: 'Services',
												Cost: currency(
													asEngineeredWithChangeOrdersServicesCostTotal
												),
												Sell_Price: currency(
													asEngineeredWithChangeOrdersServicesSellTotal
												),
												Margin: percent(
													asEngineeredWithChangeOrdersGrossProfitServices
														? asEngineeredWithChangeOrdersGrossProfitServices *
																100
														: 0
												),
											},
											{
												id: 2,
												Category: 'CHEDDAH',
												Cost: currency(0),
												Sell_Price: currency(
													asEngineeredWithChangeOrdersFloat +
														sum(externalChangeOrderDataState.data, 'Total')
												),
												Margin: percent(100),
											},
											{
												id: 3,
												Category: 'Totals:',
												Cost: currency(asEngineeredWithChangeOrdersCostTotal),
												Sell_Price: currency(
													asEngineeredWithChangeOrdersSellTotal +
														asEngineeredWithChangeOrdersFloat +
														sum(externalChangeOrderDataState.data, 'Total')
												),
												Margin: percent(
													asEngineeredWithChangeOrdersGrossProfit
														? asEngineeredWithChangeOrdersGrossProfit * 100
														: 0
												),
											},
										]}
										columns={[
											{
												headerName: ' ',
												field: 'Category',
												flex: 1,
											},
											{
												field: 'Cost',
												flex: 1,
												type: 'number',
											},
											{
												headerName: 'Sell Price',
												field: 'Sell_Price',
												flex: 1,
												type: 'number',
											},
											{
												field: 'Margin',
												flex: 1,
												type: 'number',
											},
										]}
									/>
								</Box>
							</Box>
						</Box>

						<Box sx={{ pb: 4 }}>
							<Typography>
								Estimated Equipment Cost: {currency(asContractedGoodsCostTotal)}
								, Actual Equipment Cost: {currency(purchasingCostTotal)}, Delta:{' '}
								<Typography
									component='span'
									sx={{
										color:
											asContractedGoodsCostTotal - purchasingCostTotal > 0
												? 'success.main'
												: 'error.main',
									}}>
									{currency(asContractedGoodsCostTotal - purchasingCostTotal)}
								</Typography>
							</Typography>
							<Typography>
								Estimated Labor Cost: {currency(asContractedServicesCostTotal)},
								Actual Labor Cost: {currency(projectTotalHoursCost)} + Actual
								Expenses Cost: {currency(projectTotalExpensesCost)} ={' '}
								{currency(projectTotalHoursCost + projectTotalExpensesCost)},
								Delta:{' '}
								<Typography
									component='span'
									sx={{
										color:
											asContractedServicesCostTotal -
												(projectTotalHoursCost + projectTotalExpensesCost) >
											0
												? 'success.main'
												: 'error.main',
									}}>
									{currency(
										asContractedServicesCostTotal -
											(projectTotalHoursCost + projectTotalExpensesCost)
									)}
								</Typography>
							</Typography>
						</Box>
					</Box>
				);
			case '1b':
				return (
					<Box sx={{ height: 700, width: '100%' }}>
						<Box sx={{ display: 'flex', height: '100%' }}>
							<Box sx={{ flexGrow: 1 }}>
								<DataGridPro
									rows={rowsAsEngineered}
									columns={columnsAsEngineered}
									rowHeight={25}
									components={{
										Footer: () => <Box></Box>,
										Toolbar: CustomToolbar,
									}}
									componentsProps={{
										toolbar: {
											fileName: `${projectName} Quote Line Items`,
										},
									}}
								/>
							</Box>
						</Box>
					</Box>
				);
			case '1c':
				return (
					<Box sx={{ height: 700, width: '100%' }}>
						<Box sx={{ display: 'flex', height: '100%' }}>
							<Box sx={{ flexGrow: 1 }}>
								<DataGridPro
									components={{
										Toolbar: CustomToolbar,
									}}
									componentsProps={{
										toolbar: {
											fileName: `${projectName} Sales Order Line Items`,
										},
									}}
									rows={rowsAsContracted}
									columns={columnsAsContracted}
									rowHeight={25}
								/>
							</Box>
						</Box>
					</Box>
				);
			case '1d':
				return (
					<Box sx={{ height: 700, width: '100%' }}>
						<Box sx={{ display: 'flex', height: '100%' }}>
							<Box sx={{ flexGrow: 1 }}>
								<DataGridPro
									components={{
										Toolbar: CustomToolbar,
									}}
									componentsProps={{
										toolbar: {
											fileName: `${projectName} Quote and Change Order Line Items`,
										},
									}}
									rows={rowsAsEngineeredWithChangeOrders}
									columns={columnsAsEngineeredWithChangeOrders}
									rowHeight={25}
								/>
							</Box>
						</Box>
					</Box>
				);
			case '2':
				return (
					<Box>
						<CanvasJSChart
							options={{
								height: 550,
								animationEnabled: true,
								exportEnabled: true,
								title: {
									text: 'Estimated Profit and Loss',
								},
								axisY: {
									valueFormatString: '$#,##0,.K',
									includeZero: true,
								},
								data: [
									{
										type: 'waterfall',
										risingColor: theme.palette.success.light,
										fallingColor: theme.palette.error.light,
										yValueFormatString: '$#,##0,.00K',
										indexLabelOrientation: 'vertical',
										dataPoints: getProfitAndLossDataPoints(),
									},
								],
							}}
						/>
					</Box>
				);
			case '3':
				return (
					<Box sx={{ height: 700, width: '100%' }}>
						<Box sx={{ display: 'flex', height: '100%' }}>
							<Box sx={{ flexGrow: 1 }}>
								<DataGridPro
									components={{
										Toolbar: CustomToolbar,
									}}
									componentsProps={{
										toolbar: {
											fileName: `${projectName} Purchase Order Line Items`,
										},
									}}
									rows={rowsPurchasing}
									columns={columnsPurchasing}
									rowHeight={25}
								/>
							</Box>
						</Box>
					</Box>
				);
			case '4':
				return (
					<Box sx={{ height: 700, width: '100%' }}>
						<Box sx={{ display: 'flex', height: '100%' }}>
							<Box sx={{ flexGrow: 1 }}>
								<DataGridPro
									components={{
										Toolbar: CustomToolbar,
									}}
									componentsProps={{
										toolbar: {
											fileName: `${projectName} Product Sold vs Purchased`,
										},
									}}
									rows={rowsSoldVsPurchased}
									columns={columnsSoldVsPurchased}
									rowHeight={25}
								/>
							</Box>
						</Box>
					</Box>
				);
		}
	};

	return (
		<Box sx={{ display: 'flex',  }}> 
			<Box>
				<TreeView
					expanded={expanded}
					selected={selected}
					onNodeToggle={(e, nodeIds) => setExpanded(nodeIds)}
					onNodeSelect={(e, nodeId) => {
						if (nodeId !== '1') {
							setSelected(nodeId);
						}
					}}
					defaultCollapseIcon={<ArrowDropDown />}
					defaultExpandIcon={<ArrowRight />}
					defaultEndIcon={<div style={{ width: 24 }} />}
					sx={{
						height: '100%',
						pt: 1,
						pr: 1,
						flexGrow: 1,
						width: `240px`,
						overflowY: 'auto',
					}}>
					<StyledTreeItem nodeId='2' labelText='Profit & Loss Chart' />
					<StyledTreeItem nodeId='1' labelText='Projected Margins'>
						<StyledTreeItem nodeId='1a' labelText='Overview' />
						<StyledTreeItem nodeId='1b' labelText='As Engineered' />
						<StyledTreeItem nodeId='1c' labelText='As Contracted' />
						<StyledTreeItem nodeId='1d' labelText='As Engineered w/ Changes' />
					</StyledTreeItem>

					<StyledTreeItem nodeId='3' labelText='All Purchases' />
					<StyledTreeItem nodeId='4' labelText='Product Sold vs. Purchased' />
				</TreeView>
			</Box>
			<Divider orientation='vertical' flexItem />
			<Main>{renderPage()}</Main>
		</Box>
	);
};

ProjectAudit.propTypes = {
	referenceId: PropTypes.string.isRequired,
	projectId: PropTypes.string.isRequired,
};

export default ProjectAudit;
