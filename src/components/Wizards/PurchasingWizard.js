//import { useWhyDidYouUpdate } from 'use-why-did-you-update';
import React, { useEffect, useRef, useState } from 'react';
import PropTypes from 'prop-types';
import { useRecoilValue, useRecoilState } from 'recoil';
import ThemeCard from '../ThemeCard';
import {
	debugState,
	currentUserState,
	applicationTabsState,
} from '../../recoil/atoms';
import DatabaseDefaultIcon from '../Helpers/DatabaseDefaultIcon';
import AsynchronousSelect2 from '../FormControls/AsynchronousSelect2';
import { DataGridPro } from '@mui/x-data-grid-pro';
import { currency, sum } from '../Helpers/functions';
import {
	Autocomplete,
	Box,
	Button,
	Checkbox,
	Chip,
	CircularProgress,
	Divider,
	Grid,
	List,
	ListItem,
	ListItemButton,
	ListItemText,
	Paper,
	Radio,
	Stack,
	TextField,
	Typography,
} from '@mui/material';
import { Close, DoneAll, OpenInNew } from '@mui/icons-material';

import {
	formatFormData,
	useFormData,
	useDebouncedEffect,
	useZohoGetAllRecords,
} from '../Helpers/CustomHooks';

import FormWrapper from '../FormControls/FormWrapper';
import ToastMessage from '../ToastMessage/ToastMessage';
import SaveManager from '../Helpers/SaveManager';
import { useTheme, alpha } from '@mui/material/styles';
import useMediaQuery from '@mui/material/useMediaQuery';
import ContextCircularProgressLoader from '../Loaders/ContextCircularProgressLoader';
import ResponsiveDialog from '../Modals/ResponsiveDialog';
import { LoadingButton } from '@mui/lab';
import { v4 as uuidv4 } from 'uuid';

const CustomFooter = ({
	resetDisabled,
	onClickReset,
	nextDisabled,
	onClickNext,
}) => {
	return (
		<Box
			sx={{
				padding: 1,
				display: 'flex',
				alignItems: 'center',
				justifyContent: 'flex-end',
			}}>
			{/* <Button onClick={onClickReset} disabled={resetDisabled} variant='outlined' sx={{ mr: 1 }}>
        Reset
      </Button> */}
			<Button
				onClick={onClickNext}
				disabled={nextDisabled}
				variant='contained'
				startIcon={<OpenInNew />}>
				Next
			</Button>
		</Box>
	);
};

CustomFooter.propTypes = {
	resetDisabled: PropTypes.bool,
	onClickReset: PropTypes.func.isRequired,
	nextDisabled: PropTypes.bool,
	onClickNext: PropTypes.func.isRequired,
};

const priceBookItemGetMax = 100;

const PurchasingWizard = ({
	formName, //Used to require fewer edits between template and specific forms
	setAppBreadcrumb, //If form is fullscreen - when rendered from a table row, this won't be defined
	resource, //Data loaded from the database
	onChange, //Function call raised when data is saved - useful for updating a parent table
	loadData, //When adding a new form, this is the data object that can contain things like: {Account: '123456', Reference: '1234566'}
	massUpdating, //Used to enable mass update mode
	massUpdateRecordIds,
	uuid,
}) => {
	const [applicationTabs, setApplicationTabs] =
		useRecoilState(applicationTabsState);
	const theme = useTheme();
	const desktopMode = useMediaQuery(theme.breakpoints.up('sm'));
	const currentUser = useRecoilValue(currentUserState);
	const debug = useRecoilValue(debugState);
	const [alerts, setAlerts] = useState({});
	const [data, setData] = useState({
		...loadData,
		...resource?.read(),
		Record_Type: 'Project',
	});
	const [id, setId] = useState(data.ID);
	const [state, , , mountData, , ,] = useFormData(data, loadData);
	const [purchaseOrdersDataState, addRecord, updateRecord, , , ,] = useFormData(
		{}
	);

	const [toastData, setToastData] = useState({});
	const [timelineOpen, setTimelineOpen] = useState(false);

	const [lineItemCriteria, setLineItemCriteria] = useState(null);
	const [reportCriteria, setReportCriteria] = useState(lineItemCriteria);
	const rowDataState = useZohoGetAllRecords(
		'Sales_Order_Line_Items',
		reportCriteria
	);
	const [rows, setRows] = useState([]);
	const [purchasingData, setPurchasingData] = useState([]);
	const projectDataState = useZohoGetAllRecords(
		'Projects',
		'(Status=="Open" || Status=="Preliminary" || Status=="Pending Closeout") && Category=="Client"'
	);

	const vendorDataState = useZohoGetAllRecords('Vendors', 'ID > 0');
	const [priceBookItemCriteria, setPriceBookItemCriteria] = useState(null);
	const priceBookItemDataState = useZohoGetAllRecords(
		'Price_Book_Items',
		priceBookItemCriteria
	);

	const priceBookItemGetData = useRef(null);

	const [selectionModel, setSelectionModel] = useState([]);
	const nextDisabled = selectionModel.length === 0;
	const resetDisabled = JSON.stringify(rows) === JSON.stringify(purchasingData);
	const [selectedRow, setSelectedRow] = useState(null);
	const [purchaseOrderConfirmModalOpen, setPurchaseOrderConfirmModalOpen] =
		useState(false);
	const [purchasingFinalData, setPurchasingFinalData] = useState([]);
	const [loading, setLoading] = useState(false);

	useEffect(() => {
		if (rowDataState.status === 'fetched') {
			//? Pull current Price_Book_Items
			const _uniqCriteriaArr = [
				...new Set(
					rowDataState.data.map((row) => `ID==${row.Price_Book_Item.ID}`)
				),
			];

			if (_uniqCriteriaArr.length < priceBookItemGetMax) {
				priceBookItemGetData.current = {
					pass: 0,
					requiredPasses: 1,
					criteriaArray: _uniqCriteriaArr,
					complete: false,
					data: [],
				};
				setPriceBookItemCriteria(`(${_uniqCriteriaArr.join(' || ')})`);
			} else {
				priceBookItemGetData.current = {
					pass: 0,
					requiredPasses: Math.ceil(
						_uniqCriteriaArr.length / priceBookItemGetMax
					),
					criteriaArray: _uniqCriteriaArr,
					complete: false,
					data: [],
				};
				const _pass = priceBookItemGetData?.current?.pass || 0;
				const _start = _pass * priceBookItemGetMax; //pass = 0, _start = 0; pass = 1, _start = 100
				const _end = (_pass + 1) * priceBookItemGetMax - 1; //pass = 0, _end = 99, pass = 1, _end = 199
				setPriceBookItemCriteria(
					`(${_uniqCriteriaArr
						.filter((x, i) => i >= _start && i <= _end)
						.join(' || ')})`
				);
			}
		}
	}, [rowDataState]);

	const getPriceBookItemData = (id) => {
		if (
			priceBookItemGetData?.current?.data.length > 0 &&
			priceBookItemGetData?.current?.data.filter((row) => row.ID === id)
				.length === 1
		) {
			return priceBookItemGetData.current.data.filter(
				(row) => row.ID === id
			)[0];
		}

		return '';
	};

	const getVendorDataById = (id) => {
		if (
			vendorDataState.data.length > 0 &&
			vendorDataState.data.filter((row) => row.ID === id).length === 1
		) {
			return vendorDataState.data.filter((row) => row.ID === id)[0];
		}

		return '';
	};

	const getVendorData = (name) => {
		if (
			vendorDataState.data.length > 0 &&
			vendorDataState.data.filter((row) => row.Name === name).length === 1
		) {
			return vendorDataState.data.filter((row) => row.Name === name)[0];
		}

		return '';
	};

	useEffect(() => {
		if (priceBookItemDataState.status === 'fetched') {
			if (priceBookItemDataState.status === 'fetched') {
				priceBookItemGetData.current.pass =
					priceBookItemGetData?.current?.pass + 1;
				priceBookItemGetData.current.data = [
					...priceBookItemGetData.current.data,
					...priceBookItemDataState.data,
				]; //? Merge

				if (
					priceBookItemGetData?.current?.pass ===
					priceBookItemGetData?.current?.requiredPasses
				) {
					priceBookItemGetData.current.complete = true;
					//? Retrieving all Sales_Order_Line_Items initially, then filtering down to Purchase_Item=true here
					setRows(
						rowDataState.data
							.map((row) => {
								const priceBookItem = getPriceBookItemData(
									row.Price_Book_Item.ID
								);
								let Quantity_Sold = parseInt(row.Quantity || 0);

								let Quantity_Reserved = 0;
								if (Array.isArray(row.Quantity_Reserved)) {
									Quantity_Reserved = sum(
										row.Quantity_Reserved,
										'display_value'
									);
								}
								let Quantity_Ordered = 0;
								if (Array.isArray(row.Quantity_Ordered)) {
									Quantity_Ordered = sum(row.Quantity_Ordered, 'display_value');
								}

								let Quantity_Needed =
									Quantity_Sold - Quantity_Reserved - Quantity_Ordered >= 0
										? Quantity_Sold - Quantity_Reserved - Quantity_Ordered
										: 0;

								return {
									...row,
									id: row.ID,
									Quantity_to_Order: Quantity_Needed,
									Purchase_Item: priceBookItem.Purchase_Item,
									// Vendor_Select: {
									//   ID: row["Price_Book_Item.Vendor_ID"],
									//   display_value: row["Price_Book_Item.Vendor_Name"],
									// },
									Vendor_Select: priceBookItem.Vendor.display_value || '',
									Drop_Ship: false,
								};
							})
							.filter(
								(row) =>
									row.Purchase_Item === true || row.Purchase_Item === 'true'
							) //? Filtering here with current Price_Book_Item data is the cleanest solution that doesn't rely on formulas
					);
				} else {
					//? Pull next pass of data
					const _pass = priceBookItemGetData?.current?.pass || 0;
					const _start = _pass * priceBookItemGetMax; //pass = 0, _start = 0; pass = 1, _start = 100
					const _end = (_pass + 1) * priceBookItemGetMax - 1; //pass = 0, _end = 99, pass = 1, _end = 199
					const _uniqCriteriaArr = priceBookItemGetData?.current?.criteriaArray;
					setPriceBookItemCriteria(
						`(${_uniqCriteriaArr
							.filter((x, i) => i >= _start && i <= _end)
							.join(' || ')})`
					);
				}
			}
		}
	}, [priceBookItemDataState]);

	useEffect(() => {
		setPurchasingData(rows);
	}, [rows]);

	useDebouncedEffect(
		() => {
			lineItemCriteria
				? setReportCriteria(
						`${lineItemCriteria} && Deleted=false && !Sales_Order.Type.contains("Change Order") && Sales_Order.Void_field=false`
				  )
				: null;
		},
		[lineItemCriteria],
		2000
	);

	useEffect(() => {
		console.log('reportCriteria', reportCriteria);
		setSelectionModel([]); //Reset selections
		setPriceBookItemCriteria(null);
	}, [reportCriteria]);

	const getProductCellValue = ({ row }) => {
		let _base =
			row?.Name !== row?.Code ? `${row?.Name} (${row.Code})` : row?.Name;
		_base = row?.Manufacturer ? `${row.Manufacturer} ${_base}` : _base;

		return row?.Description ? `${_base}\n${row?.Description}` : _base;
	};

	const onClickReset = () => {
		priceBookItemGetData.current = null;
		setRows(rows);
		setPurchasingData(rows);
	};

	const onClickNext = () => {
		//? For each selectionModel

		//! Shipped to VisionPoint
		let _finalData = {};
		if (
			purchasingData.filter(
				(row) => !row.Drop_Ship && selectionModel.includes(row.id)
			).length > 0
		) {
			const _formattedPurchasingData = purchasingData
				.filter((row) => !row.Drop_Ship && selectionModel.includes(row.id))
				.map((row, i) => {
					if (selectionModel.includes(row.id)) {
						const _vendor = getVendorData(row.Vendor_Select);
						return {
							id: i,
							Quantity_to_Order: row.Quantity_to_Order,
							Price_Book_Item: row.Price_Book_Item,
							Vendor: { ID: _vendor.ID, display_value: _vendor.Name },
							Cost: Number(row.Cost),
							Cost_Total: Number(row.Cost) * row.Quantity_to_Order, //Can't use Cost_Total already present on row because Quantity might !== Quantity_to_Order
							Sales_Order: row.Sales_Order,
							Sales_Order_Line_Item: {
								ID: row.ID,
								display_value: row.Quantity,
							},
						};
					}
				})
				.filter((row) => row);

			//? Need to create 1 PO per Vendor that isn't being Drop Shipped
			const _uniqueVendors = [
				...new Set(_formattedPurchasingData.map((row) => row.Vendor.ID)),
			];

			//? Create an array of arrays representing one PO and its Purchase_Order_Line_Items

			_uniqueVendors.forEach((vendorId) => {
				//? Creating one PO per unique vendor
				if (
					_formattedPurchasingData.filter((row) => row.Vendor.ID === vendorId)
						.length > 0
				) {
					//? Purchasing data contains a match for the current vendor
					const _uniquePriceBookItemsForThisVendor = [
						...new Set(
							_formattedPurchasingData
								.filter((row) => row.Vendor.ID === vendorId)
								.map((row) => row.Price_Book_Item.ID)
						),
					];

					let _returnArr = [];
					_uniquePriceBookItemsForThisVendor.forEach((priceBookItemId) => {
						if (
							_formattedPurchasingData.filter(
								(row) => row.Price_Book_Item.ID === priceBookItemId
							).length > 0
						) {
							//? Get like Price_Book_Items from the line item array
							const _data = _formattedPurchasingData.filter(
								(row) => row.Price_Book_Item.ID === priceBookItemId
							);
							const _priceBookItem = getPriceBookItemData(priceBookItemId);
							_returnArr.push({
								Quantity: sum(_data, 'Quantity_to_Order'),
								Price_Book_Item: _data[0].Price_Book_Item,
								Name: _priceBookItem.Name,
								Code: _priceBookItem.Code,
								Description: _priceBookItem.Description,
								Manufacturer: _priceBookItem.Manufacturer,
								Vendor: _data[0].Vendor,
								Cost: Number(_priceBookItem.Cost), //! Regardless of cost used on Sales Order, default to Price Book Item's cost
								Cost_Total:
									Number(_priceBookItem.Cost) * sum(_data, 'Quantity_to_Order'), //Can't use Cost_Total already present on row because Quantity might !== Quantity_to_Order
								Collapsible_Line_Items: _data.map(
									(d) => d.Sales_Order_Line_Item
								),
							});
						}
					});

					//? Add to finalized data
					if (_returnArr.length > 0) _finalData[vendorId] = _returnArr;
				}
			});
		}

		//! Drop Shipped
		let _finalDataDropShip = {};
		if (
			purchasingData.filter(
				(row) => row.Drop_Ship && selectionModel.includes(row.id)
			).length > 0
		) {
			const _formattedPurchasingDataDropShip = purchasingData
				.filter((row) => row.Drop_Ship && selectionModel.includes(row.id))
				.map((row, i) => {
					if (selectionModel.includes(row.id)) {
						const _vendor = getVendorData(row.Vendor_Select);
						return {
							id: i,
							Quantity_to_Order: row.Quantity_to_Order,
							Price_Book_Item: row.Price_Book_Item,
							Vendor: { ID: _vendor.ID, display_value: _vendor.Name },
							Cost: Number(row.Cost),
							Cost_Total: Number(row.Cost) * row.Quantity_to_Order, //Can't use Cost_Total already present on row because Quantity might !== Quantity_to_Order
							Sales_Order: row.Sales_Order,
							Sales_Order_Line_Item: {
								ID: row.ID,
								display_value: row.Quantity,
							},
						};
					}
				})
				.filter((row) => row);

			//? Need to create 1 PO per Vendor that is being Drop Shipped
			const _uniqueVendorsDropShip = [
				...new Set(
					_formattedPurchasingDataDropShip.map((row) => row.Vendor.ID)
				),
			];

			//? Create an object of arrays representing one PO and its Purchase_Order_Line_Items

			_uniqueVendorsDropShip.forEach((vendorId) => {
				//? Creating one PO per unique vendor
				if (
					_formattedPurchasingDataDropShip.filter(
						(row) => row.Vendor.ID === vendorId
					).length > 0
				) {
					//? Purchasing data contains a match for the current vendor
					const _uniquePriceBookItemsForThisVendor = [
						...new Set(
							_formattedPurchasingDataDropShip
								.filter((row) => row.Vendor.ID === vendorId)
								.map((row) => row.Price_Book_Item.ID)
						),
					];

					let _returnArr = [];
					_uniquePriceBookItemsForThisVendor.forEach((priceBookItemId) => {
						if (
							_formattedPurchasingDataDropShip.filter(
								(row) => row.Price_Book_Item.ID === priceBookItemId
							).length > 0
						) {
							//? Get like Price_Book_Items from the line item array
							const _data = _formattedPurchasingDataDropShip.filter(
								(row) => row.Price_Book_Item.ID === priceBookItemId
							);

							const _priceBookItem = getPriceBookItemData(priceBookItemId);
							_returnArr.push({
								Quantity: sum(_data, 'Quantity_to_Order'),
								Price_Book_Item: _data[0].Price_Book_Item,
								Name: _priceBookItem.Name,
								Code: _priceBookItem.Code,
								Description: _priceBookItem.Description,
								Manufacturer: _priceBookItem.Manufacturer,
								Vendor: _data[0].Vendor,
								Cost: Number(_priceBookItem.Cost), //! Regardless of cost used on Sales Order, default to Price Book Item's cost
								Cost_Total:
									Number(_priceBookItem.Cost) * sum(_data, 'Quantity_to_Order'), //Can't use Cost_Total already present on row because Quantity might !== Quantity_to_Order
								Collapsible_Line_Items: _data.map(
									(d) => d.Sales_Order_Line_Item
								),
							});
						}
					});

					//? Add to finalized data
					if (_returnArr.length > 0) _finalDataDropShip[vendorId] = _returnArr;
				}
			});
		}

		console.log('_finalData', _finalData);
		console.log('_finalDataDropShip', _finalDataDropShip);

		//! Check for undefined Vendor_Select
		if (
			Object.keys(_finalData).filter((key) => key === 'undefined' || !key)
				.length > 0 ||
			Object.keys(_finalDataDropShip).filter(
				(key) => key === 'undefined' || !key
			).length > 0
		) {
			setToastData({
				message: `1 or more selected line items does not have a Vendor assigned!`,
				severity: 'error',
			});
			return;
		}

		//? Columns are defined for confirmation DataGridPro
		const _finalFormattedData = [];
		Object.keys(_finalData).forEach((vendorId, i) => {
			_finalFormattedData.push({
				id: `${vendorId}`,
				Purchase_Order: [`PO ${i + 1} of ${Object.keys(_finalData).length}`],
				//Purchase_Order: `PO ${i + 1} of ${Object.keys(_finalData).length}`,
				Vendor: {
					ID: vendorId,
					display_value: getVendorDataById(vendorId).Name,
				},
				Reference: {
					ID: rowDataState.data[0]['Sales_Order.Reference_ID'],
					display_value: rowDataState.data[0]['Sales_Order.Reference_Name'],
				},
				Total: sum(_finalData[vendorId], 'Cost_Total'),
				Drop_Ship: false,
				Purchase_Order_Line_Items: _finalData[vendorId],
			});

			//? Grouping for line items
			_finalData[vendorId].forEach((lineItem) => {
				_finalFormattedData.push({
					id: `${lineItem.Price_Book_Item.ID}`,
					Purchase_Order: [
						`PO ${i + 1} of ${Object.keys(_finalData).length}`,
						lineItem.Name,
					],
					//Purchase_Order: `PO ${i + 1} of ${Object.keys(_finalData).length}`,
					Vendor: {
						ID: vendorId,
						display_value: getVendorDataById(vendorId).Name,
					},
					Reference: {
						ID: rowDataState.data[0]['Sales_Order.Reference_ID'],
						display_value: rowDataState.data[0]['Sales_Order.Reference_Name'],
					},
					Total: lineItem.Cost_Total,
					Drop_Ship: false,
					Purchase_Order_Line_Items: _finalData[vendorId],
				});
			});
		});

		Object.keys(_finalDataDropShip).forEach((vendorId, i) => {
			_finalFormattedData.push({
				id: `${vendorId}-drop-ship`,
				Purchase_Order: [
					`**DROP SHIP** PO ${i + 1} of ${
						Object.keys(_finalDataDropShip).length
					}`,
				],
				// Purchase_Order: `**DROP SHIP** PO ${i + 1} of ${
				//   Object.keys(_finalDataDropShip).length
				// }`,
				Vendor: {
					ID: vendorId,
					display_value: getVendorDataById(vendorId).Name,
				},
				Reference: {
					ID: rowDataState.data[0]['Sales_Order.Reference_ID'],
					display_value: rowDataState.data[0]['Sales_Order.Reference_Name'],
				},
				Total: sum(_finalDataDropShip[vendorId], 'Cost_Total'),
				Drop_Ship: true,
				Purchase_Order_Line_Items: _finalDataDropShip[vendorId],
			});

			//? Grouping for line items
			_finalDataDropShip[vendorId].forEach((lineItem) => {
				_finalFormattedData.push({
					id: `${lineItem.Price_Book_Item.ID}-drop-ship`,
					Purchase_Order: [
						`**DROP SHIP** PO ${i + 1} of ${
							Object.keys(_finalDataDropShip).length
						}`,
						lineItem.Name,
					],
					//Purchase_Order: `PO ${i + 1} of ${Object.keys(_finalData).length}`,
					Vendor: {
						ID: vendorId,
						display_value: getVendorDataById(vendorId).Name,
					},
					Reference: {
						ID: rowDataState.data[0]['Sales_Order.Reference_ID'],
						display_value: rowDataState.data[0]['Sales_Order.Reference_Name'],
					},
					Total: lineItem.Cost_Total,
					Drop_Ship: true,
				});
			});
		});

		console.log('_finalFormattedData', _finalFormattedData);

		setPurchasingFinalData(_finalFormattedData);
		setPurchaseOrderConfirmModalOpen(true);
	};

	//! Important! This is where POs are created en masse
	const onCreatePurchaseOrders = () => {
		setLoading(true);

		const _formattedPurchaseOrderData = purchasingFinalData
			.filter((rows) => rows.Purchase_Order.length === 1)
			.map((purchaseOrder) => ({
				Vendor: purchaseOrder.Vendor,
				Reference: purchaseOrder.Reference,
				Status: 'Open',
				Payment_Method: 'Purchase Order',
				Buyer: currentUser.ID,
				Drop_Ship: purchaseOrder.Drop_Ship,
				Terms: 'Net 30',
				Shipping_Priority: 'Ground',
				Street: '152 Rockwell Rd.',
				Street_2: 'Suite A1',
				City: 'Newington',
				State: 'CT',
				Zip_Code: '06111',
				Subtotal: purchaseOrder.Total,
				Total: purchaseOrder.Total,
				Purchase_Order_Line_Items: JSON.stringify(
					formatFormData(purchaseOrder.Purchase_Order_Line_Items).data
				),
			}));

		console.log('TODO: Create purchase orders', _formattedPurchaseOrderData);

		addRecord('Purchase_Order', _formattedPurchaseOrderData, (successes) => {
			//Open application tabs
			const _successes = successes.map((success) => ({
				uuid: uuidv4(),
				label: `Purchase Order: ${success.Name}`,
				type: 'form',
				id: success.ID,
				name: 'Purchase_Order',
				loadData: success,
			}));
			setApplicationTabs((old) => [...old, ..._successes]);
			setPurchaseOrderConfirmModalOpen(false);
			setLoading(false);
			setSelectionModel([]);
			setReportCriteria((oldCriteria) => `(${oldCriteria})`);
		});
	};

	const onPurchaseOrderConfirmModalClose = () => {
		setPurchaseOrderConfirmModalOpen(false);
	};

	return (
		<Box
			sx={{
				display: 'flex',
				flexDirection: 'column',
				backgroundColor: 'background.default',
			}}>
			<Box sx={{ mt: 1 }}>
				<ThemeCard header={`Select a Reference to Fill Product To`}>
					<Grid container spacing={2}>
						<Grid item xs={12}>
							<Box sx={{ display: 'flex', alignItems: 'baseline' }}>
								<Radio
									checked={state?.currentData?.Record_Type === 'Project'}
									onChange={(e) => {
										if (state?.currentData?.Project) {
											const referenceId = projectDataState.data.filter(
												(project) =>
													project.ID === state?.currentData?.Project?.ID
											)[0].Reference.ID;
											//No need to debounce this selection
											setReportCriteria(
												`Sales_Order.Reference_ID==${referenceId} && Deleted=false && !Sales_Order.Type.contains("Change Order") && Sales_Order.Void_field=false`
											);
										}
										mountData('Record_Type', e.target.value);
									}}
									value='Project'
									name='radio-buttons'
								/>
								<Typography component='span'>
									Fill products for a{' '}
									<Typography component='span' sx={{ fontWeight: 'bold' }}>
										Project
									</Typography>
									:
								</Typography>
								<AsynchronousSelect2
									name='Project'
									displayValueKey='Name'
									criteria='(Status=="Open" || Status=="Preliminary" || Status=="Pending Closeout") && Category=="Client"'
									defaultValue={state.currentData.Project || ''}
									overrideOptions={projectDataState.data}
									onChange={(e) => {
										if (state?.currentData?.Record_Type !== 'Project') {
											mountData('Record_Type', 'Project');
										}
										mountData('Project', e);
										const referenceId = projectDataState.data.filter(
											(project) => project.ID === e.ID
										)[0].Reference.ID;
										//No need to debounce this selection
										setReportCriteria(
											`Sales_Order.Reference_ID==${referenceId} && Deleted=false && !Sales_Order.Type.contains("Change Order") && Sales_Order.Void_field=false`
										);
									}}
									sx={{ ml: 2, width: 200 }}
									fullWidth={false}
								/>
							</Box>
						</Grid>
						<Grid item xs={12}>
							<Box sx={{ display: 'flex', alignItems: 'baseline' }}>
								<Radio
									checked={state?.currentData?.Record_Type === 'Sales_Order'}
									onChange={(e) => {
										if (state?.currentData?.Sales_Order_Number) {
											//Fetch instantly
											setReportCriteria(
												`Sales_Order.Name.contains("${state?.currentData?.Sales_Order_Number}") && Deleted=false && !Sales_Order.Type.contains("Change Order") && Sales_Order.Void_field=false`
											);
										}

										mountData('Record_Type', e.target.value);
									}}
									value='Sales_Order'
									name='radio-buttons'
								/>
								<Typography component='span'>
									Fill products for a{' '}
									<Typography component='span' sx={{ fontWeight: 'bold' }}>
										Sales Order
									</Typography>
									:
								</Typography>
								<TextField
									label='Sales Order#'
									value={state?.currentData?.Sales_Order_Number || ''}
									type='number'
									onChange={(e) => {
										if (state?.currentData?.Record_Type !== 'Sales_Order') {
											mountData('Record_Type', 'Sales_Order');
										}
										mountData('Sales_Order_Number', e.target.value);
										setLineItemCriteria(
											`Sales_Order.Name.contains("${e.target.value}")`
										);
									}}
									sx={{ ml: 2, width: 200 }}
									fullWidth={false}
								/>
							</Box>
						</Grid>
						<Grid item xs={12}>
							<Box sx={{ display: 'flex', alignItems: 'baseline' }}>
								<Radio
									checked={state?.currentData?.Record_Type === 'Service_Order'}
									onChange={(e) => {
										if (state?.currentData?.Service_Order_Number) {
											//Fetch instantly
											setReportCriteria(
												`Sales_Order.Reference_Name.startsWith("SO") && Sales_Order.Reference_Name.contains("${state?.currentData?.Service_Order_Number}") && Deleted=false && !Sales_Order.Type.contains("Change Order") && Sales_Order.Void_field=false`
											);
										}

										mountData('Record_Type', e.target.value);
									}}
									value='Service_Order'
									name='radio-buttons'
								/>
								<Typography component='span'>
									Fill products for a{' '}
									<Typography component='span' sx={{ fontWeight: 'bold' }}>
										Service Order
									</Typography>
									:
								</Typography>
								<TextField
									label='Service Order#'
									value={state?.currentData?.Service_Order_Number || ''}
									type='number'
									onChange={(e) => {
										if (state?.currentData?.Record_Type !== 'Service_Order') {
											mountData('Record_Type', 'Service_Order');
										}
										mountData('Service_Order_Number', e.target.value);
										setLineItemCriteria(
											`Sales_Order.Reference_Name.startsWith("SO") && Sales_Order.Reference_Name.contains("${e.target.value}")`
										);
									}}
									sx={{ ml: 2, width: 200 }}
									fullWidth={false}
								/>
							</Box>
						</Grid>
					</Grid>
				</ThemeCard>

				{desktopMode && (lineItemCriteria || reportCriteria) ? (
					<Grid container spacing={2}>
						<Grid item xs={12}>
							<Paper
								elevation={4}
								sx={{
									mt: 1,
									height: window.innerHeight - 2 * 51 - 270 - 8 - 1, //2*51 = navBar and tabBar, 270 = height of sales order selection, 2*8 for py: 1, the 1 is from an inconsistency
									width: '100%',
									display: 'flex',
									flexDirection: 'column',
									//Column Styles
									'& .dataGrid-cell-input': {
										backgroundColor: (theme) =>
											alpha(theme.palette.info.main, 0.1),
									},
								}}>
								<DataGridPro
									checkboxSelection
									disableSelectionOnClick
									onCellEditCommit={(params) =>
										setPurchasingData((old) =>
											old.map((oldRow) =>
												oldRow.id === params.id
													? { ...oldRow, [params.field]: params.value }
													: oldRow
											)
										)
									}
									isRowSelectable={(params) => params.row.Quantity_to_Order > 0}
									sx={{
										'&.MuiDataGrid-root .MuiDataGrid-cell:focus': {
											outline: 'none',
										},
										'& .no-vendor': {
											backgroundColor: 'error.light',
											color: 'error.contrastText',
										},
									}}
									getCellClassName={(params) => {
										if (params.field !== 'Vendor_Select') {
											return '';
										}
										return !params.value ? 'no-vendor' : '';
									}}
									loading={!priceBookItemGetData?.current?.complete}
									components={{
										Footer: CustomFooter,
									}}
									componentsProps={{
										footer: {
											resetDisabled,
											onClickReset,
											nextDisabled,
											onClickNext,
										},
									}}
									rows={rows}
									columns={[
										{
											field: 'Sales_Order',
											headerName: 'Sales Order',
											description: 'Sales Order',
											valueGetter: ({ row }) =>
												`${row.Sales_Order.display_value}${
													row?.Reference
														? ` (${row.Reference.display_value})`
														: ''
												}`,
											valueFormatter: ({ value }) => value.display_value,
											flex: 2,
										},
										{
											field: 'Product_Info',
											headerName: 'Product Info',
											valueGetter: getProductCellValue,
											flex: 3,
										},
										{
											field: 'Quantity_Ordered',
											headerName: 'Qty Ordered',
											type: 'number',
											valueGetter: ({ row }) => {
												if (Array.isArray(row.Quantity_Ordered)) {
													return sum(row.Quantity_Ordered, 'display_value');
												}

												return 0;
											},
											flex: 0.5,
										},
										{
											field: 'Quantity_Reserved',
											headerName: 'Qty Filled',
											type: 'number',
											valueGetter: ({ row }) => {
												if (Array.isArray(row.Quantity_Reserved)) {
													return sum(row.Quantity_Reserved, 'display_value');
												}

												return 0;
											},
											flex: 0.5,
										},
										{
											field: 'Quantity_Needed',
											headerName: 'Qty Needed',
											type: 'number',
											valueGetter: ({ row }) => {
												let Quantity_Sold = parseInt(row.Quantity || 0);

												let Quantity_Reserved = 0;
												if (Array.isArray(row.Quantity_Reserved)) {
													Quantity_Reserved = sum(
														row.Quantity_Reserved,
														'display_value'
													);
												}
												let Quantity_Ordered = 0;
												if (Array.isArray(row.Quantity_Ordered)) {
													Quantity_Ordered = sum(
														row.Quantity_Ordered,
														'display_value'
													);
												}

												return Quantity_Sold -
													Quantity_Reserved -
													Quantity_Ordered >=
													0
													? Quantity_Sold - Quantity_Reserved - Quantity_Ordered
													: 0;
											},
											flex: 0.5,
										},
										{
											field: 'Quantity_to_Order',
											headerName: 'Qty to Order',
											type: 'number',
											flex: 0.5,
											editable: true,
											headerClassName: 'dataGrid-cell-input',
											cellClassName: 'dataGrid-cell-input',
											preProcessEditCellProps: (params) => {
												//? Check for min/max quantity to order values
												let Quantity_Sold = parseInt(params.row.Quantity || 0);

												let Quantity_Reserved = 0;
												if (Array.isArray(params.row.Quantity_Reserved)) {
													Quantity_Reserved = sum(
														params.row.Quantity_Reserved,
														'display_value'
													);
												}
												let Quantity_Ordered = 0;
												if (Array.isArray(params.row.Quantity_Ordered)) {
													Quantity_Ordered = sum(
														params.row.Quantity_Ordered,
														'display_value'
													);
												}

												//? Determine max order quantity based on needs
												let max =
													Quantity_Sold -
														Quantity_Reserved -
														Quantity_Ordered >=
													0
														? Quantity_Sold -
														  Quantity_Reserved -
														  Quantity_Ordered
														: 0;

												const hasError =
													params.props.value < 0 || params.props.value > max;
												return { ...params.props, error: hasError };
											},
										},
										{
											field: 'Vendor_Select',
											headerName: 'Vendor Select',
											flex: 2,
											type: 'singleSelect',
											valueOptions: vendorDataState?.data
												?.map((option) => option.Name)
												.sort(),
											editable: true,
											headerClassName: 'dataGrid-cell-input',
											cellClassName: 'dataGrid-cell-input',
											preProcessEditCellProps: (params) => {
												const hasError = !params.props.value;
												return { ...params.props, error: hasError };
											},
										},
										{
											field: 'Drop_Ship',
											headerName: 'Drop Ship',
											flex: 0.5,
											headerAlign: 'center',
											type: 'boolean',
											editable: true,
											headerClassName: 'dataGrid-cell-input',
											cellClassName: 'dataGrid-cell-input',
										},
									]}
									onSelectionModelChange={(newSelectionModel) => {
										setSelectionModel(newSelectionModel);
									}}
									selectionModel={selectionModel}
								/>
							</Paper>
						</Grid>
					</Grid>
				) : lineItemCriteria || reportCriteria ? (
					<Paper></Paper>
				) : (
					<Typography textAlign={'center'} sx={{ py: 6 }}>
						Please select a Project, Sales Order, or Service Order Reference
						above...
					</Typography>
				)}

				{/* Form Specific Data (e.g. table, graph, etc.) */}

				{/* Tabbed Section */}
			</Box>

			{/* PO Confirmation */}
			<ResponsiveDialog
				maxWidth='xl'
				title='Confirm Purchase Orders to be Created'
				open={purchaseOrderConfirmModalOpen}
				onClose={() => (loading ? null : onPurchaseOrderConfirmModalClose())}
				buttons={
					<>
						<LoadingButton
							variant='outlined'
							startIcon={<Close />}
							onClick={onPurchaseOrderConfirmModalClose}
							loading={loading}>
							Close
						</LoadingButton>
						<LoadingButton
							variant='contained'
							startIcon={<DoneAll />}
							onClick={onCreatePurchaseOrders}
							loading={loading}>
							Create Purchase Orders
						</LoadingButton>
					</>
				}>
				<Paper
					elevation={4}
					sx={{
						mt: 1,
						height: window.innerHeight - 2 * 51 - 270 - 8 - 1, //2*51 = navBar and tabBar, 270 = height of sales order selection, 2*8 for py: 1, the 1 is from an inconsistency
						width: '100%',
						//display: "flex",
						//flexDirection: "column",
						//Column Styles
						'& .dataGrid-cell-input': {
							backgroundColor: (theme) =>
								alpha(theme.palette.secondary.main, 0.05),
						},
					}}>
					<DataGridPro
						disableSelectionOnClick
						sx={{
							'& .MuiDataGrid-root .MuiDataGrid-cell:focus': {
								outline: 'none',
							},
						}}
						treeData
						getTreeDataPath={(row) => row.Purchase_Order}
						groupingColDef={{ headerName: 'Purchase Order' }}
						rows={purchasingFinalData}
						columns={[
							// {
							//   field: "Purchase_Order",
							//   headerName: "Purchase Order",
							//   flex: 2,
							// },
							{
								field: 'Vendor',
								valueGetter: ({ row }) => row.Vendor.display_value,
								flex: 4,
							},
							{
								field: 'Reference',
								valueGetter: ({ row }) => row.Reference.display_value,
								flex: 4,
							},
							{
								field: 'Total',
								type: 'number',
								valueFormatter: ({ value }) => currency(Number(value)),
								flex: 0.5,
							},
							{
								field: 'Drop_Ship',
								headerName: 'Drop Ship',
								type: 'boolean',
								flex: 0.5,
							},
						]}
					/>
				</Paper>
			</ResponsiveDialog>

			{/* Toast messaging in lower right */}
			<ToastMessage data={toastData} />
			<SaveManager formDataState={purchaseOrdersDataState} />
		</Box>
	);
};

PurchasingWizard.propTypes = {
	formName: PropTypes.string.isRequired,
	id: PropTypes.string,
	loadData: PropTypes.object,
	resource: PropTypes.object,
	setAppBreadcrumb: PropTypes.func,
	onChange: PropTypes.func,
	massUpdating: PropTypes.bool,
	massUpdateRecordIds: PropTypes.array,
	uuid: PropTypes.string,
};

PurchasingWizard.defaultProps = {
	loadData: {},
	massUpdating: false,
	massUpdateRecordIds: [],
};

const Wrapper = (props) => {
	return (
		<React.Suspense fallback={<ContextCircularProgressLoader />}>
			<PurchasingWizard {...props} />
		</React.Suspense>
	);
};

export default Wrapper;
