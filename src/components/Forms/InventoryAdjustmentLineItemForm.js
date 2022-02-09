//import { useWhyDidYouUpdate } from 'use-why-did-you-update';
import React, { useEffect, useRef, useState } from 'react';
import PropTypes from 'prop-types';
import { useRecoilValue } from 'recoil';
import { omit } from 'lodash-es';
import ThemeCard from '../ThemeCard';
import {
	debugState,
	currentUserState,
	customAssemblyLineItemIdState,
} from '../../recoil/atoms';
import * as Columns from '../../recoil/columnAtoms';
import DatabaseDefaultIcon from '../Helpers/DatabaseDefaultIcon';
import LookupField2 from '../FormControls/LookupField2';
import {
	copyTextToClipboard,
	camelize,
	intTryParse,
	plurifyFormName,
	marginOptions,
} from '../Helpers/functions';
import {
	Autocomplete,
	Box,
	Button,
	Divider,
	FormControlLabel,
	Grid,
	IconButton,
	ListItemIcon,
	ListItemText,
	Menu,
	MenuItem,
	Switch,
	TextField,
	Tooltip,
	Typography,
} from '@mui/material';
import {
	Block,
	DeleteForever,
	Email,
	ExpandMore,
	MoreVert,
	Print,
	Share,
} from '@mui/icons-material';

import {
	useFormData,
	useDebouncedEffect,
	useCalculateSalesTotals,
} from '../Helpers/CustomHooks';

import { useTheme } from '@mui/material/styles';
import useMediaQuery from '@mui/material/useMediaQuery';
import ContextCircularProgressLoader from '../Loaders/ContextCircularProgressLoader';
import { v4 as uuidv4 } from 'uuid';

//#region //TODO Mass update fields available
const massUpdateCapableFieldKeys = [{ label: 'Margin', value: 'Margin' }];
//#endregion

//#region //TODO Helper functions

//#endregion

const InventoryAdjustmentLineItemForm = ({
	formName, //Used to require fewer edits between template and specific forms
	resource, //Data loaded from the database
	onChange, //Function call raised when data is saved - useful for updating a parent table
	loadData, //When adding a new form, this is the data object that can contain things like: {Account: '123456', Reference: '1234566'}
	massUpdating, //Used to enable mass update mode
	massUpdateRecordIds,
	maxHeight,
	hasError,
}) => {
	const customAssemblyLineItemId = useRecoilValue(
		customAssemblyLineItemIdState
	);
	const columns = useRecoilValue(
		Columns[`${camelize(formName.replaceAll('_', ''))}ColumnsState`]
	);
	const debug = useRecoilValue(debugState);
	const [alerts, setAlerts] = useState([]);
	const [data, setData] = useState({
		Serial_Numbers_to_Add: [],
		Serial_Numbers_to_Remove: [],
		...resource.read(),
		...(Array.isArray(loadData) ? loadData[0] : loadData),
	}); //I should have an opportunity here to set loadData as well
	const [id] = useState(data.ID);
	const [uuid] = useState(data.Uuid ? data.Uuid : uuidv4());
	const [
		state,
		addRecord,
		updateRecord,
		mountData,
		resetData,
		massUpdateRecords,
	] = useFormData(data, loadData);
	const [massUpdateFieldList, setMassUpdateFieldList] = useState([]);
	const requiredFields = useRef(columns.filter((column) => column.required));

	useEffect(() => {
		console.log('InvAdvLineItem data', data);
	}, [data]);

	useEffect(() => {
		console.log('InventoryAdjustmentLineItemForm.js state change', state);

		checkError();

		if (onChange) {
			const temp = id ? { ID: id } : {};
			temp.Uuid = uuid; //Simulated ID? See how this works

			//? Filter extra keys
			const _keys = Object.keys(state.currentData);
			const _goodKeys = [
				'Inventory_Adjustment',
				'Warehouse_Stock_Item',
				'Quantity_to_Adjust',
				'Serial_Numbers_to_Add',
				'Serial_Numbers_to_Remove',
				'Parent_Uuid',
			];
			const _omitKeys = _keys.filter((key) => !_goodKeys.includes(key));
			onChange({
				...omit(state.currentData, _omitKeys),
				...temp,
				Selected: false,
			});
		}
	}, [state]);

	const checkError = () => {
		let _error = {};

		if (requiredFields.current.length > 0) {
			requiredFields.current.forEach((field) => {
				if (
					!state.currentData[field.valueKey] ||
					state.currentData[field.valueKey] === 0
				) {
					_error[field.valueKey] = true;
				}
			});
		}
		hasError ? hasError(Object.keys(_error).length > 0) : null; //if _error = {}, returns true
	};
	//#endregion

	return (
		<Box
			sx={{
				display: 'flex',
				flexDirection: 'column',
			}}>
			{/* Mass Update Field Selctor - Driven by massUpdateCapableFieldKeys constant */}
			{massUpdating ? (
				<Box sx={{ width: '100%', px: 2, pt: 2 }}>
					<Autocomplete
						multiple
						disableCloseOnSelect
						options={massUpdateCapableFieldKeys.sort(
							(a, b) => a.label - b.label
						)}
						getOptionLabel={(option) => option.label}
						isOptionEqualToValue={(option, value) =>
							option.value === value.value
						}
						onChange={(e, newValue) =>
							setMassUpdateFieldList(newValue.map((v) => v.value))
						}
						value={massUpdateCapableFieldKeys.filter((option) =>
							massUpdateFieldList.includes(option.value) ? option : null
						)}
						renderInput={(params) => (
							<TextField
								{...params}
								variant='standard'
								label='Fields to Mass Update'
								placeholder={
									massUpdateFieldList.length === 0 ? 'Select field(s)' : ''
								}
							/>
						)}
					/>
				</Box>
			) : null}

			{massUpdating && massUpdateFieldList.length === 0 ? (
				<Box sx={{ width: '100%', py: 6 }}>
					<Typography align='center' sx={{ color: 'text.secondary' }}>
						Please select at least one field from the dropdown above to begin
					</Typography>
				</Box>
			) : (
				<Grid container rowSpacing={0} columnSpacing={2}>
					<Grid item xs={12} md={6}>
						<ThemeCard header='Warehouse Stock Item Details'>
							<Grid container spacing={2} direction='row'>
								<Grid item xs={12}>
									<TextField
										label='Name'
										value={state.currentData.Price_Book_Item_Name}
										InputProps={{
											readOnly: true,
										}}
									/>
								</Grid>
								<Grid item xs={12}>
									<TextField
										label='Code'
										value={state.currentData.Price_Book_Item_Code}
										InputProps={{
											readOnly: true,
										}}
									/>
								</Grid>
								<Grid item xs={12}>
									<TextField
										label='Manufacturer'
										defaultValue={state.currentData.Manufacturer_Name}
										InputProps={{
											readOnly: true,
										}}
									/>
								</Grid>
								<Grid item xs={12}>
									<TextField
										label='Description'
										value={state.currentData.Price_Book_Item_Description}
										InputProps={{
											readOnly: true,
										}}
									/>
								</Grid>
							</Grid>
						</ThemeCard>
					</Grid>
					<Grid item xs={12} md={6}>
						<ThemeCard header='Stock Details' sx={{ mt: { xs: 1, sm: 0 } }}>
							<Grid container spacing={2} direction='row'>
								<Grid item xs={12} md={6}>
									<TextField
										autoFocus
										label='Quantity in Stock'
										value={state.currentData.Quantity_in_Stock || 0}
										type='number'
										step={1}
										InputProps={{
											readOnly: true,
										}}
									/>
								</Grid>
								<Grid item xs={12} md={6}>
									<TextField
										autoFocus
										label='Quantity to Adjust'
										value={state.currentData.Quantity_to_Adjust || 0}
										type='number'
										step={1}
										onChange={(e) =>
											mountData(
												'Quantity_to_Adjust',
												intTryParse(e.target.value)
													? parseInt(e.target.value)
													: 0
											)
										}
										helperText={
											state.currentData['Price_Book_Item.Serialized'] ===
												'true' ||
											state.currentData['Price_Book_Item.Serialized'] === true
												? 'Adjusted Automatically by Serial Number Selections'
												: ''
										}
										disabled={
											state.currentData['Price_Book_Item.Serialized'] ===
												'true' ||
											state.currentData['Price_Book_Item.Serialized'] === true
										}
									/>
								</Grid>

								{state.currentData['Price_Book_Item.Serialized'] === 'true' ||
								state.currentData['Price_Book_Item.Serialized'] === true ? (
									<>
										<Grid item xs={12} md={6}>
											<Autocomplete
												multiple
												freeSolo
												options={[]}
												value={
													typeof state.currentData.Serial_Numbers_to_Add ===
														'string' &&
													state?.currentData?.Serial_Numbers_to_Add
														? JSON.parse(
																state.currentData.Serial_Numbers_to_Add
														  )
														: state.currentData.Serial_Numbers_to_Add
												}
												onChange={(e, newValue) => {
													mountData('Serial_Numbers_to_Add', newValue);

													if (state.currentData.Serial_Numbers_to_Remove) {
														mountData(
															'Quantity_to_Adjust',
															-1 *
																(typeof state.currentData
																	.Serial_Numbers_to_Remove === 'string' &&
																state?.currentData?.Serial_Numbers_to_Remove
																	? JSON.parse(
																			state.currentData.Serial_Numbers_to_Remove
																	  ).length
																	: state.currentData.Serial_Numbers_to_Remove
																			.length) +
																newValue.length
														);
													} else {
														mountData('Quantity_to_Adjust', newValue.length);
													}
												}}
												renderInput={(params) => (
													<TextField
														{...params}
														label='Serial Numbers to Add'
														placeholder='Serial Numbers'
														helperText='Type a Serial Number and press Enter to add it to the list'
													/>
												)}
											/>
										</Grid>
										<Grid item xs={12} md={6}>
											<LookupField2
												overrideDialogZindex
												name='Serial_Numbers'
												label='Serial Numbers to Remove'
												defaultSortByColumn='Value'
												formName='Serial_Number'
												reportName='Serial_Numbers'
												defaultValue={
													typeof state.currentData.Serial_Numbers_to_Remove ===
														'string' &&
													state?.currentData?.Serial_Numbers_to_Remove &&
													state?.currentData?.Serial_Numbers_to_Remove
														? JSON.parse(
																state.currentData.Serial_Numbers_to_Remove
														  )
														: state.currentData.Serial_Numbers_to_Remove
												}
												defaultCriteria={`Warehouse_Stock_Item==${state.currentData.Warehouse_Stock_Item}`}
												onChange={(e) => {
													mountData('Serial_Numbers_to_Remove', e);

													if (state.currentData.Serial_Numbers_to_Add) {
														mountData(
															'Quantity_to_Adjust',
															-1 * e.length +
																(typeof state.currentData
																	.Serial_Numbers_to_Add === 'string' &&
																state?.currentData?.Serial_Numbers_to_Add
																	? JSON.parse(
																			state.currentData.Serial_Numbers_to_Add
																	  ).length
																	: state.currentData.Serial_Numbers_to_Add
																			.length)
														);
													} else {
														mountData('Quantity_to_Adjust', -1 * e.length);
													}
												}}
												multiSelect
												endAdornment={
													<IconButton edge='end' size='large'>
														<DatabaseDefaultIcon form='Serial_Number' />
													</IconButton>
												}
											/>
										</Grid>
									</>
								) : null}
							</Grid>
						</ThemeCard>
					</Grid>
				</Grid>
			)}
		</Box>
	);
};

InventoryAdjustmentLineItemForm.propTypes = {
	formName: PropTypes.string.isRequired,
	loadData: PropTypes.oneOfType([PropTypes.object, PropTypes.array]),
	resource: PropTypes.object,
	setAppBreadcrumb: PropTypes.func,
	onChange: PropTypes.func,
	massUpdating: PropTypes.bool,
	massUpdateRecordIds: PropTypes.array,
	uuid: PropTypes.string,
	maxHeight: PropTypes.number,
	hasError: PropTypes.func,
};

InventoryAdjustmentLineItemForm.defaultProps = {
	loadData: {},
	massUpdating: false,
	massUpdateRecordIds: [],
};

const Wrapper = (props) => {
	return (
		<React.Suspense fallback={<ContextCircularProgressLoader />}>
			<InventoryAdjustmentLineItemForm {...props} />
		</React.Suspense>
	);
};

export default Wrapper;
