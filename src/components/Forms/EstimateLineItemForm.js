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

//#region //TODO Mass update fields available
const massUpdateCapableFieldKeys = [{ label: 'Margin', value: 'Margin' }];
//#endregion

//#region //TODO Helper functions

//#endregion

const EstimateLineItemForm = ({
	formName, //Used to require fewer edits between template and specific forms
	resource, //Data loaded from the database
	onChange, //Function call raised when data is saved - useful for updating a parent table
	loadData, //When adding a new form, this is the data object that can contain things like: {Account: '123456', Reference: '1234566'}
	massUpdating, //Used to enable mass update mode
	massUpdateRecordIds,
	uuid,
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
		...resource.read(),
		...(Array.isArray(loadData) ? loadData[0] : loadData),
	}); //I should have an opportunity here to set loadData as well
	const [id, setId] = useState(data.ID);
	const [lineItemDataState, lineItemDispatch] = useCalculateSalesTotals(
		formName,
		data
	);
	const [massUpdateFieldList, setMassUpdateFieldList] = useState([]);
	const requiredFields = useRef(columns.filter((column) => column.required));

	useEffect(() => {
		if (Object.keys(data).length > 0) {
			lineItemDispatch({
				type: 'COST',
				payload: intTryParse(data.Cost) ? parseFloat(data.Cost) : 0.0,
			});
			lineItemDispatch({
				type: 'DESCRIPTION',
				payload: data.Description,
			});
		} else {
			lineItemDispatch({ type: 'RESET' });
		}
	}, [data]);

	useEffect(() => {
		checkError();

		if (onChange) {
			onChange(lineItemDataState);
		}
	}, [lineItemDataState]);

	const checkError = () => {
		let _error = {};

		if (requiredFields.current.length > 0) {
			requiredFields.current.forEach((field) => {
				if (
					!lineItemDataState[field.valueKey] ||
					lineItemDataState[field.valueKey] === 0
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
			) : data.Type === 'Goods' || data.Type === 'Service' ? (
				<Grid container rowSpacing={0} columnSpacing={2}>
					<Grid item xs={12} md={6}>
						<ThemeCard header='Price Book Item Details'>
							<Grid container spacing={2} direction='row'>
								<Grid item xs={12}>
									<TextField
										label='Name'
										value={lineItemDataState.Name}
										InputProps={{
											readOnly: true,
										}}
									/>
								</Grid>
								<Grid item xs={12}>
									<TextField
										label='Code'
										value={lineItemDataState.Code}
										InputProps={{
											readOnly: true,
										}}
									/>
								</Grid>
								<Grid item xs={12}>
									<TextField
										label='Manufacturer'
										defaultValue={lineItemDataState.Manufacturer}
										InputProps={{
											readOnly: true,
										}}
									/>
								</Grid>
								<Grid item xs={12}>
									<TextField
										label='Description'
										value={lineItemDataState.Description}
										multiline
										onChange={(e) =>
											lineItemDispatch({
												type: 'DESCRIPTION',
												payload: e.target.value,
											})
										}
									/>
								</Grid>
							</Grid>
						</ThemeCard>
					</Grid>
					<Grid item xs={12} md={6}>
						<ThemeCard header='Pricing Details' sx={{ mt: { xs: 1, sm: 0 } }}>
							<Grid container spacing={2} direction='row'>
								<Grid item xs={12} md={6}>
									<TextField
										autoFocus
										label='Quantity'
										value={lineItemDataState.Quantity}
										type='number'
										step='1'
										onChange={(e) =>
											lineItemDispatch({
												type: 'QUANTITY',
												payload: intTryParse(e.target.value)
													? parseInt(e.target.value)
													: 0,
											})
										}
									/>
								</Grid>
								<Grid item xs={12} md={6}>
									<Box sx={{ display: 'flex', alignItems: 'flex-end' }}>
										<TextField
											select={lineItemDataState.Price_Level_Type === 'Preset'}
											label='Margin'
											value={lineItemDataState.Margin}
											type='number'
											onChange={(e) =>
												lineItemDispatch({
													type:
														lineItemDataState.Price_Level_Type === 'Preset'
															? 'PRESET_MARGIN'
															: 'CUSTOM_MARGIN',
													payload: intTryParse(e.target.value)
														? parseFloat(e.target.value)
														: 0.0,
												})
											}>
											{marginOptions.map((option) => (
												<MenuItem key={option.value} value={option.value}>
													{option.label}
												</MenuItem>
											))}
										</TextField>
										<FormControlLabel
											sx={{ ml: 2, mr: 0 }}
											control={
												<Switch
													checked={
														lineItemDataState.Price_Level_Type === 'Custom'
													}
													onChange={(e) =>
														lineItemDispatch({
															type: 'PRICE_LEVEL_TYPE',
															payload: e.target.checked ? 'Custom' : 'Preset',
														})
													}
												/>
											}
											label='Custom'
										/>
									</Box>
								</Grid>
								<Grid item xs={12} md={6}>
									<TextField
										label='Cost'
										value={lineItemDataState.Cost}
										type='number'
										onChange={(e) =>
											lineItemDispatch({
												type: 'COST',
												payload: intTryParse(e.target.value)
													? parseFloat(e.target.value)
													: 0.0,
											})
										}
									/>
								</Grid>
								<Grid item xs={12} md={6}>
									<TextField
										label='Sell Price Each'
										value={lineItemDataState.Sell_Price_Each}
										type='number'
										onChange={(e) =>
											lineItemDispatch({
												type: 'SELL_PRICE_EACH',
												payload: intTryParse(e.target.value)
													? parseFloat(e.target.value)
													: 0.0,
											})
										}
									/>
								</Grid>
								<Grid item xs={12} md={6}>
									<TextField
										label='Discount (%)'
										value={lineItemDataState.Discount_Rate}
										type='number'
										onChange={(e) =>
											lineItemDispatch({
												type: 'DISCOUNT_RATE',
												payload: intTryParse(e.target.value)
													? parseFloat(e.target.value)
													: 0.0,
											})
										}
									/>
								</Grid>
								<Grid item xs={12} md={6}>
									<TextField
										label='Sell Price Subtotal'
										value={lineItemDataState.Sell_Price_Subtotal}
										type='number'
										onChange={(e) =>
											lineItemDispatch({
												type: 'SELL_PRICE_SUBTOTAL',
												payload: intTryParse(e.target.value)
													? parseFloat(e.target.value)
													: 0.0,
											})
										}
									/>
								</Grid>
								<Grid item xs={12} md={6}>
									<TextField
										label='Discount ($)'
										value={lineItemDataState.Discount_Dollars}
										type='number'
										onChange={(e) =>
											lineItemDispatch({
												type: 'DISCOUNT_DOLLARS',
												payload: intTryParse(e.target.value)
													? parseFloat(e.target.value)
													: 0.0,
											})
										}
									/>
								</Grid>
								<Grid item xs={12} md={6}>
									<TextField
										label='Sell Price Total'
										value={lineItemDataState.Sell_Price_Total}
										type='number'
										helperText={'Includes any discounts'}
										InputProps={{
											readOnly: true,
										}}
									/>
								</Grid>
							</Grid>
						</ThemeCard>
					</Grid>
				</Grid>
			) : data.Type === 'Assembly' ? (
				<Grid container rowSpacing={0} columnSpacing={2}>
					<Grid item xs={12} md={6}>
						<ThemeCard header='Assembly Details'>
							<Grid container spacing={2} direction='row'>
								<Grid item xs={12}>
									<TextField
										label='Name'
										value={lineItemDataState.Name}
										onChange={(e) =>
											lineItemDispatch({
												type: 'NAME',
												payload: e.target.value,
											})
										}
										required
										error={!lineItemDataState.Name}
										InputProps={{
											readOnly:
												typeof lineItemDataState.Price_Book_Item === 'object'
													? lineItemDataState.Price_Book_Item.ID !==
													  customAssemblyLineItemId
													: lineItemDataState.Price_Book_Item !==
													  customAssemblyLineItemId,
										}}
									/>
								</Grid>
								<Grid item xs={12}>
									<TextField
										label='Code'
										value={lineItemDataState.Code}
										onChange={(e) =>
											lineItemDispatch({
												type: 'CODE',
												payload: e.target.value,
											})
										}
										required
										error={!lineItemDataState.Code}
										InputProps={{
											readOnly:
												typeof lineItemDataState.Price_Book_Item === 'object'
													? lineItemDataState.Price_Book_Item.ID !==
													  customAssemblyLineItemId
													: lineItemDataState.Price_Book_Item !==
													  customAssemblyLineItemId,
										}}
									/>
								</Grid>
								<Grid item xs={12}>
									<TextField
										label='Manufacturer'
										value={lineItemDataState.Manufacturer}
										onChange={(e) =>
											lineItemDispatch({
												type: 'MANUFACTURER',
												payload: e.target.value,
											})
										}
										InputProps={{
											readOnly:
												typeof lineItemDataState.Price_Book_Item === 'object'
													? lineItemDataState.Price_Book_Item.ID !==
													  customAssemblyLineItemId
													: lineItemDataState.Price_Book_Item !==
													  customAssemblyLineItemId,
										}}
									/>
								</Grid>
								<Grid item xs={12}>
									<TextField
										label='Description'
										value={lineItemDataState.Description}
										multiline
										required
										error={!lineItemDataState.Description}
										onChange={(e) =>
											lineItemDispatch({
												type: 'DESCRIPTION',
												payload: e.target.value,
											})
										}
									/>
								</Grid>
							</Grid>
						</ThemeCard>
					</Grid>
					<Grid item xs={12} md={6}>
						<ThemeCard header='Pricing Details' sx={{ mt: { xs: 1, sm: 0 } }}>
							<Grid container spacing={2} direction='row'>
								<Grid item xs={12} md={6}>
									<TextField
										autoFocus
										label='Quantity'
										value={lineItemDataState.Quantity}
										type='number'
										step='0.5'
										onChange={(e) =>
											lineItemDispatch({
												type: 'QUANTITY',
												payload: intTryParse(e.target.value)
													? parseInt(e.target.value)
													: 0,
											})
										}
									/>
								</Grid>
								<Grid item xs={12} md={6}>
									<Box sx={{ display: 'flex', alignItems: 'flex-end' }}>
										<TextField
											select={lineItemDataState.Price_Level_Type === 'Preset'}
											label='Margin'
											value={lineItemDataState.Margin}
											type='number'
											disabled>
											{marginOptions.map((option) => (
												<MenuItem key={option.value} value={option.value}>
													{option.label}
												</MenuItem>
											))}
										</TextField>
										<FormControlLabel
											sx={{ ml: 2, mr: 0 }}
											disabled
											control={
												<Switch
													checked={
														lineItemDataState.Price_Level_Type === 'Custom'
													}
													onChange={(e) =>
														lineItemDispatch({
															type: 'PRICE_LEVEL_TYPE',
															payload: e.target.checked ? 'Custom' : 'Preset',
														})
													}
												/>
											}
											label='Custom'
										/>
									</Box>
								</Grid>
								<Grid item xs={12} md={6}>
									<TextField
										label='Cost'
										disabled
										value={lineItemDataState.Cost}
										type='number'
										onChange={(e) =>
											lineItemDispatch({
												type: 'COST',
												payload: intTryParse(e.target.value)
													? parseFloat(e.target.value)
													: 0.0,
											})
										}
									/>
								</Grid>
								<Grid item xs={12} md={6}>
									<TextField
										label='Sell Price Each'
										disabled
										value={lineItemDataState.Sell_Price_Each}
										type='number'
										onChange={(e) =>
											lineItemDispatch({
												type: 'SELL_PRICE_EACH',
												payload: intTryParse(e.target.value)
													? parseFloat(e.target.value)
													: 0.0,
											})
										}
									/>
								</Grid>
								<Grid item xs={12} md={6}>
									<TextField
										label='Discount (%)'
										disabled
										value={lineItemDataState.Discount_Rate}
										type='number'
										onChange={(e) =>
											lineItemDispatch({
												type: 'DISCOUNT_RATE',
												payload: intTryParse(e.target.value)
													? parseFloat(e.target.value)
													: 0.0,
											})
										}
									/>
								</Grid>
								<Grid item xs={12} md={6}>
									<TextField
										label='Sell Price Subtotal'
										disabled
										value={lineItemDataState.Sell_Price_Subtotal}
										type='number'
										onChange={(e) =>
											lineItemDispatch({
												type: 'SELL_PRICE_SUBTOTAL',
												payload: intTryParse(e.target.value)
													? parseFloat(e.target.value)
													: 0.0,
											})
										}
									/>
								</Grid>
								<Grid item xs={12} md={6}>
									<TextField
										label='Discount ($)'
										disabled
										value={lineItemDataState.Discount_Dollars}
										type='number'
										onChange={(e) =>
											lineItemDispatch({
												type: 'DISCOUNT_DOLLARS',
												payload: intTryParse(e.target.value)
													? parseFloat(e.target.value)
													: 0.0,
											})
										}
									/>
								</Grid>
								<Grid item xs={12} md={6}>
									<TextField
										label='Sell Price Total'
										value={lineItemDataState.Sell_Price_Total}
										type='number'
										helperText={'Includes any discounts'}
										InputProps={{
											readOnly: true,
										}}
									/>
								</Grid>
							</Grid>
						</ThemeCard>
					</Grid>
				</Grid>
			) : data.Type === 'Comment' ? (
				<Grid container rowSpacing={0} columnSpacing={2}>
					<Grid item xs={12} md={6}>
						<ThemeCard header='Comment Details'>
							<Grid container spacing={2} direction='row'>
								<Grid item xs={12}>
									<TextField
										label='Comment Text'
										value={lineItemDataState.Description}
										multiline
										onChange={(e) =>
											lineItemDispatch({
												type: 'DESCRIPTION',
												payload: e.target.value,
											})
										}
									/>
								</Grid>
							</Grid>
						</ThemeCard>
					</Grid>
					<Grid item xs={12} md={6}>
						<ThemeCard header='Preset Comments' sx={{ mt: { xs: 1, sm: 0 } }}>
							<Grid container spacing={2} direction='row'>
								<Grid item xs={12} md={6}>
									<Button
										variant='text'
										sx={{ width: '100%' }}
										onClick={() =>
											lineItemDispatch({
												type: 'DESCRIPTION',
												payload: '*** ROUTING & SWITCHING ***',
											})
										}>
										Routing & Switching
									</Button>
								</Grid>
								<Grid item xs={12} md={6}>
									<Button
										variant='text'
										sx={{ width: '100%' }}
										onClick={() =>
											lineItemDispatch({
												type: 'DESCRIPTION',
												payload: '*** VIDEO ***',
											})
										}>
										Video
									</Button>
								</Grid>
								<Grid item xs={12} md={6}>
									<Button
										variant='text'
										sx={{ width: '100%' }}
										onClick={() =>
											lineItemDispatch({
												type: 'DESCRIPTION',
												payload: '*** VIDEO CONFERENCING ***',
											})
										}>
										Video Conferencing
									</Button>
								</Grid>
								<Grid item xs={12} md={6}>
									<Button
										variant='text'
										sx={{ width: '100%' }}
										onClick={() =>
											lineItemDispatch({
												type: 'DESCRIPTION',
												payload: '*** AUDIO ***',
											})
										}>
										Audio
									</Button>
								</Grid>
								<Grid item xs={12} md={6}>
									<Button
										variant='text'
										sx={{ width: '100%' }}
										onClick={() =>
											lineItemDispatch({
												type: 'DESCRIPTION',
												payload: '*** CONTROL ***',
											})
										}>
										Control
									</Button>
								</Grid>
								<Grid item xs={12} md={6}>
									<Button
										variant='text'
										sx={{ width: '100%' }}
										onClick={() =>
											lineItemDispatch({
												type: 'DESCRIPTION',
												payload: '*** CABLE CUBBY ***',
											})
										}>
										Cable Cubby
									</Button>
								</Grid>
								<Grid item xs={12} md={6}>
									<Button
										variant='text'
										sx={{ width: '100%' }}
										onClick={() =>
											lineItemDispatch({
												type: 'DESCRIPTION',
												payload: '*** INFRASTRUCTURE ***',
											})
										}>
										Infrastructure
									</Button>
								</Grid>
								<Grid item xs={12} md={6}>
									<Button
										variant='text'
										sx={{ width: '100%' }}
										onClick={() =>
											lineItemDispatch({
												type: 'DESCRIPTION',
												payload: '*** MISCELLANEOUS & SERVICES ***',
											})
										}>
										Miscellaneous & Services
									</Button>
								</Grid>
							</Grid>
						</ThemeCard>
					</Grid>
				</Grid>
			) : data.Type === 'Credit' ? (
				<Grid container rowSpacing={0} columnSpacing={2}>
					<Grid item xs={12} md={6}>
						Credit
					</Grid>
				</Grid>
			) : (
				<Typography>
					Error: Price Book Item Type "{data.Type}" was not defined within
					EstimateLineItemForm.js!
				</Typography>
			)}
		</Box>
	);
};

EstimateLineItemForm.propTypes = {
	formName: PropTypes.string.isRequired,
	id: PropTypes.string,
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

EstimateLineItemForm.defaultProps = {
	loadData: {},
	massUpdating: false,
	massUpdateRecordIds: [],
};

const Wrapper = (props) => {
	return (
		<React.Suspense fallback={<ContextCircularProgressLoader />}>
			<EstimateLineItemForm {...props} />
		</React.Suspense>
	);
};

export default Wrapper;
