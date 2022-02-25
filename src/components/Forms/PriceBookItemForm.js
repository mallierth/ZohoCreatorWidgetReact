//import { useWhyDidYouUpdate } from 'use-why-did-you-update';
import React, { useEffect, useRef, useState } from 'react';
import PropTypes from 'prop-types';
import { useRecoilValue } from 'recoil';
import { omit } from 'lodash-es';
import ThemeCard from '../ThemeCard';
import TabbedSection from '../TabbedSection/TabbedSection';
import { debugState, currentUserState } from '../../recoil/atoms';
import * as Columns from '../../recoil/columnAtoms';
import DatabaseDefaultIcon from '../Helpers/DatabaseDefaultIcon';
import LookupField2 from '../FormControls/LookupField2';
import AsynchronousSelect2 from '../FormControls/AsynchronousSelect2';
import BottomBar from '../Helpers/BottomBar';
import {
	copyTextToClipboard,
	camelize,
	intTryParse,
	plurifyFormName,
} from '../Helpers/functions';
import {
	Autocomplete,
	Box,
	Button,
	Checkbox,
	CircularProgress,
	Divider,
	FormControlLabel,
	FormHelperText,
	Grid,
	IconButton,
	ListItemIcon,
	ListItemText,
	Menu,
	MenuItem,
	Paper,
	Tab,
	Table,
	TableBody,
	TableCell,
	TableContainer,
	TableHead,
	TableRow,
	TextField,
	Tooltip,
	Typography,
} from '@mui/material';
import {
	Block,
	DeleteForever,
	Email,
	ExpandMore,
	FactCheck,
	MoreVert,
	Print,
	Share,
} from '@mui/icons-material';
import TabbedSectionHeader from '../TabbedSection/TabbedSectionHeader';
import GridFormSectionWrapper from '../FormControls/GridFormSectionWrapper';
import GridInputWrapper from '../FormControls/GridInputWrapper';
import TabbedSectionContent from '../TabbedSection/TabbedSectionContent';
import StatusGraphic from '../FormControls/StatusGraphic';
import { useFormData, useDebouncedEffect } from '../Helpers/CustomHooks';
import CustomTable from '../CustomTable/CustomTable';
import FormWrapper from '../FormControls/FormWrapper';
import ToastMessage from '../ToastMessage/ToastMessage';
import SaveManager from '../Helpers/SaveManager';
import { useTheme } from '@mui/material/styles';
import useMediaQuery from '@mui/material/useMediaQuery';
import RenderPopup from '../Helpers/RenderPopup';
import RenderForm from '../Helpers/RenderForm';
import ConfirmationDialog from '../Helpers/ConfirmationDialog';
import ContextCircularProgressLoader from '../Loaders/ContextCircularProgressLoader';

//#region //TODO Mass update fields available
const massUpdateCapableFieldKeys = [
	{ label: 'Active', value: 'Active' },
	{ label: 'Track Inventory', value: 'Track_Inventory' },
	{ label: 'Purchase Item', value: 'Purchase_Item' },
	{ label: 'Sales Item', value: 'Sales_Item' },
	{ label: 'Reorder Level', value: 'Reorder_Level' },
	{ label: 'Serialized', value: 'Serialized' },
	{ label: 'Manufacturer', value: 'Manufacturer' },
	{ label: 'Vendor', value: 'Vendor' },
	{ label: 'Type', value: 'Type' },
	{ label: 'Unit', value: 'Unit' },
];
//#endregion

//#region //TODO Helper functions
const calculateUtilization = (v1, v2) => {
	if (!intTryParse(v1)) {
		v1 = 0;
	}

	if (!intTryParse(v2)) {
		v2 = 0;
	}

	if (parseFloat(v1) === 0) {
		return 0;
	}

	if (parseFloat(v2) === 0) {
		return 100;
	}

	return Math.round((parseFloat(v1) / parseFloat(v2)) * 100);
};
//#endregion

//#region //TODO Custom actions in form toolbar
const CustomFormActions = ({
	currentData,
	currentUser,
	onCopyDirectUrl,
	onOpenPickTicket,
	onOpenPrintWizard,
	onOpenSendEmail,
	onVoid,
	onDelete,
}) => {
	const theme = useTheme();
	const desktopMode = useMediaQuery(theme.breakpoints.up('sm'));
	const [anchorEl, setAnchorEl] = useState(null);
	const [open, setOpen] = useState(false);

	const onClose = () => {
		setAnchorEl(null);
		setOpen(false);
	};

	const onOpen = (e) => {
		setAnchorEl(e.currentTarget);
		setOpen(true);
	};

	const _onCopyDirectUrl = () => {
		onClose();
		onCopyDirectUrl();
	};

	const _onOpenPickTicket = () => {
		onClose();
		onOpenPickTicket();
	};

	const _onOpenPrintWizard = () => {
		onClose();
		onOpenPrintWizard();
	};

	const _onOpenSendEmail = () => {
		onClose();
		onOpenSendEmail();
	};

	const _onVoid = () => {
		onClose();
		onVoid();
	};

	const _onDelete = () => {
		onClose();
		onDelete();
	};

	useEffect(() => {
		desktopMode ? onClose() : null;
	}, [desktopMode]);

	return (
		<>
			{desktopMode ? (
				<Button
					//variant='contained'
					onClick={onOpen}
					startIcon={<ExpandMore />}>
					Actions
				</Button>
			) : (
				<Tooltip arrow title={'Actions'}>
					<IconButton onClick={onOpen} color='inherit' size='small'>
						<MoreVert />
					</IconButton>
				</Tooltip>
			)}

			<Menu anchorEl={anchorEl} open={open} onClose={onClose}>
				{/* Copy Direct Link/Print/Email */}
				{/* <MenuItem onClick={_onCopyDirectUrl}>
					<ListItemIcon>
						<Share color='success' fontSize='small' />
					</ListItemIcon>
					<ListItemText>Copy Direct Link</ListItemText>
				</MenuItem> */}
				<MenuItem onClick={_onOpenPrintWizard}>
					<ListItemIcon>
						<Print color='success' fontSize='small' />
					</ListItemIcon>
					<ListItemText>Print Wizard</ListItemText>
				</MenuItem>
				<MenuItem onClick={_onOpenSendEmail}>
					<ListItemIcon>
						<Email color='success' fontSize='small' />
					</ListItemIcon>
					<ListItemText>Send Email</ListItemText>
				</MenuItem>
				<Divider />
				{/* Record Specific Options */}
				<MenuItem onClick={_onOpenPickTicket}>
					<ListItemIcon>
						<FactCheck color='info' fontSize='small' />
					</ListItemIcon>
					<ListItemText>Pick Ticket</ListItemText>
				</MenuItem>
				<Divider />
				{/* Void/Delete Options */}
				<MenuItem onClick={_onVoid}>
					<ListItemIcon>
						<Block color='warning' fontSize='small' />
					</ListItemIcon>
					<ListItemText>Cancel/Void</ListItemText>
				</MenuItem>
				<MenuItem onClick={_onDelete}>
					<ListItemIcon>
						<DeleteForever color='error' fontSize='small' />
					</ListItemIcon>
					<ListItemText>Delete</ListItemText>
				</MenuItem>
			</Menu>
		</>
	);
};

CustomFormActions.propTypes = {
	currentData: PropTypes.object,
	currentUser: PropTypes.object,
	onCopyDirectUrl: PropTypes.func,
	onOpenPickTicket: PropTypes.func,
	onOpenPrintWizard: PropTypes.func,
	onOpenSendEmail: PropTypes.func,
	onVoid: PropTypes.func,
	onDelete: PropTypes.func,
};
//#endregion

const defaultLoadData = {
	Code: '',
	Name: '',
	Description: '',
	Unit: '',
	Cost: '',
	Type: 'Goods',

	Active: true,
	Track_Inventory: true,
	Purchase_Item: true,
	Sales_Item: true,
	Serialized: false,
	Reorder_Level: '',

	Manufacturer: '',
	Manufacturer_Part_Number: '',
	Vendor: '',
};

const PriceBookItemForm = ({
	formName, //Used to require fewer edits between template and specific forms
	setAppBreadcrumb, //If form is fullscreen - when rendered from a table row, this won't be defined
	resource, //Data loaded from the database
	onChange, //Function call raised when data is saved - useful for updating a parent table
	loadData, //When adding a new form, this is the data object that can contain things like: {Account: '123456', Reference: '1234566'}
	massUpdating, //Used to enable mass update mode
	massUpdateRecordIds,
	uuid,
	maxHeight,
}) => {
	const currentUser = useRecoilValue(currentUserState);
	const columns = useRecoilValue(
		Columns[`${camelize(formName.replaceAll('_', ''))}ColumnsState`]
	);
	const debug = useRecoilValue(debugState);
	const [alerts, setAlerts] = useState({});
	const [data, setData] = useState({
		...defaultLoadData,
		...loadData,
		...resource.read(),
	});
	const [id, setId] = useState(data.ID);
	const baseUrl = `https://creatorapp.zoho.com/visionpointllc/av-professional-services/#Page:Search?Type=${formName}&ID=${id}`;
	const [recordTitle, setRecordTitle] = useState(data ? data.Name : null); //TODO
	const [
		state,
		addRecord,
		updateRecord,
		mountData,
		resetData,
		massUpdateRecords,
	] = useFormData(data, { ...defaultLoadData, ...loadData });

	const [massUpdateFieldList, setMassUpdateFieldList] = useState([]);
	const requiredFields = useRef(columns.filter((column) => column.required));
	const [error, setError] = useState({});
	const [toastData, setToastData] = useState({});
	const [confirmationDialogOpen, setConfirmationDialogOpen] = useState(false);
	const [confirmationDialogData, setConfirmationDialogData] = useState({});
	const [timelineOpen, setTimelineOpen] = useState(false);
	const [tabValue, setTabValue] = useState('Notes');
	const [renderPopupData, setRenderPopupData] = useState({});
	const hasError = Object.keys(error).length > 0;

	//! Record title when accessed via direct URL
	useEffect(() => {
		if (setAppBreadcrumb) {
			const title = () => {
				if (id) {
					return recordTitle;
				} else {
					return `Add New ${formName.replaceAll('_', '')}`;
				}
			};

			setAppBreadcrumb([
				{
					href: '',
					icon: <DatabaseDefaultIcon form={formName} sx={{ mr: 0.75 }} />,
					label: plurifyFormName(formName),
				},
				{
					href: '',
					icon: <DatabaseDefaultIcon form={formName} sx={{ mr: 0.75 }} />,
					label: title(),
				},
			]);
		}
	}, [recordTitle]);

	//#region //! Update parent table row if applicable
	useEffect(() => {
		if (onChange) {
			onChange(state.savedData);
		}

		if (
			hasError &&
			(!id ||
				currentUser.Enable_Autosave === false ||
				currentUser.Enable_Autosave === 'false')
		) {
			isValid();
		}
	}, [state]);
	//#endregion

	//#region //! Data save/autosave/reset/validity
	//! Debounced effect to raise onAutoSave() every 2 seconds
	useDebouncedEffect(
		() =>
			Object.keys(state.data).length > 0 &&
			(currentUser.Enable_Autosave === true ||
				currentUser.Enable_Autosave === 'true') &&
			!massUpdating &&
			id
				? onAutoSave()
				: null,
		[state.data, id],
		2000
	);

	//! Raised by useDebouncedEffect
	const onAutoSave = () => {
		if (!id) {
			return;
		}

		if (isValid()) {
			if (debug) {
				setToastData({
					message: `DEBUG ENABLED: AutoSave called with valid form data!`,
					severity: 'info',
				});
			} else {
				if (id) {
					updateRecord(plurifyFormName(formName), id, state.data);
				}
			}
		} else {
			setToastData({
				message: `Please enter a value for all required fields`,
				severity: 'warning',
			});
		}
	};

	//! Manual Save
	const onSave = () => {
		if (isValid()) {
			if (debug) {
				setToastData({
					message: `DEBUG ENABLED: Save manually called with valid form data!`,
					severity: 'info',
				});
			} else {
				if (id) {
					updateRecord(plurifyFormName(formName), id, state.data);
				} else if (massUpdating) {
					massUpdateRecords(
						plurifyFormName(formName),
						massUpdateRecordIds,
						{},
						(response) => {
							console.log('massUpdate response', response);
						}
					);
				} else {
					addRecord(formName, state.data, (response) => setId(response.ID));
				}
			}
		} else {
			setToastData({
				message: `Please enter a value for all required fields`,
				severity: 'warning',
			});
		}
	};

	const onReset = () => {
		if (!massUpdating) {
			resetData();
			setError({});
			setData(state.savedData);
		} else {
			setMassUpdateFieldList([]);
		}
	};

	const isValid = () => {
		console.log('errorCheck requiredFields', requiredFields.current);
		let _error = {};

		if (requiredFields.current.length > 0) {
			requiredFields.current.forEach((field) => {
				if (
					!state.currentData[field.valueKey] ||
					state.currentData[field.valueKey] === 0 ||
					(Array.isArray(state.currentData[field.valueKey]) &&
						state.currentData[field.valueKey].length === 0)
				) {
					_error[field.valueKey] = true;
				}
			});
		}

		setError(_error);
		return Object.keys(_error).length === 0; //if _error = {}, returns true
	};
	//#endregion

	//#region //! Commands exposed by Actions dropdown
	const onCopyDirectUrl = async () => {
		copyTextToClipboard(baseUrl)
			.then(() =>
				setToastData({
					message: 'Direct link copied to clipboard!',
					severity: 'success',
				})
			)
			.catch(() =>
				setToastData({
					message: 'Error copying text to clipboard',
					severity: 'error',
				})
			);
	};

	const onOpenPickTicket = () => {
		setRenderPopupData({
			title: `Pick Ticket for ${
				state.savedData ? state.savedData.Name : 'N/A'
			}`,
			onClose: () => console.log('Pick Ticket => Closed'),
			children: <Box>Pick Ticket Page</Box>,
		});
	};

	const onOpenPrintWizard = () => {
		setRenderPopupData({
			title: `Print Wizard for ${
				state.savedData ? state.savedData.Name : 'N/A'
			}`,
			onClose: () => console.log('Print Wizard => Closed'),
			children: <Box>Print Wizard Page</Box>,
		});
	};

	const onOpenSendEmail = () => {
		setRenderPopupData({
			title: `Send Email for ${state.savedData ? state.savedData.Name : 'N/A'}`,
			onClose: () => console.log('Send Email => Closed'),
			children: <Box>Email Form</Box>,
		});
	};

	const onVoid = () => {
		setConfirmationDialogData({
			title: `Cancel ${formName.replaceAll('_', ' ')}`,
			onConfirm: () => console.log('Void => Confirm'),
			confirmButtonColor: 'warning',
			children: <Typography>Are you sure you want to cancel?</Typography>,
		});
	};

	const onDelete = () => {
		setConfirmationDialogData({
			title: `Delete ${formName.replaceAll('_', ' ')}`,
			onConfirm: () => console.log('Delete => Confirm'),
			confirmButtonColor: 'error',
			children: (
				<Typography>
					Are you sure you want to delete this {formName.replaceAll('_', ' ')}?
				</Typography>
			),
		});
	};
	//#endregion

	return (
		<Box
			sx={{
				display: 'flex',
				flexDirection: 'column',
				backgroundColor: 'background.default',
			}}>
			<FormWrapper
				id={id}
				viewingInTab={Boolean(uuid)}
				alerts={alerts}
				timelineOpen={timelineOpen}
				setTimelineOpen={setTimelineOpen}
				massUpdating={massUpdating}
				maxHeight={maxHeight}
				CustomFormActions={
					<CustomFormActions
						currentData={state.currentData}
						currentUser={currentUser}
						onCopyDirectUrl={onCopyDirectUrl}
						onOpenPickTicket={onOpenPickTicket}
						onOpenPrintWizard={onOpenPrintWizard}
						onOpenSendEmail={onOpenSendEmail}
						onVoid={onVoid}
						onDelete={onDelete}
					/>
				}>
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
					<ThemeCard
						header={
							massUpdating ? null : `${formName.replaceAll('_', ' ')} Details`
						}>
						<GridFormSectionWrapper>
							<GridInputWrapper
								massUpdating={massUpdating}
								hidden={massUpdating && !massUpdateFieldList.includes('Code')}>
								<TextField
									label='Code'
									value={state.currentData.Code}
									helperText={
										error.Code
											? 'Please enter a value for this required field'
											: ''
									}
									error={error.Code}
									onChange={(e) => mountData('Code', e.target.value)}
									required
								/>
							</GridInputWrapper>
							<GridInputWrapper
								massUpdating={massUpdating}
								hidden={massUpdating && !massUpdateFieldList.includes('Name')}>
								<TextField
									label='Name'
									value={state.currentData.Name}
									helperText={
										error.Name
											? 'Please enter a value for this required field'
											: ''
									}
									error={error.Name}
									onChange={(e) => mountData('Name', e.target.value)}
									required
								/>
							</GridInputWrapper>
							<GridInputWrapper
								massUpdating={massUpdating}
								hidden={
									massUpdating && !massUpdateFieldList.includes('Description')
								}>
								<TextField
									label='Description'
									value={state.currentData.Description}
									multiline
									helperText={
										error.Description
											? 'Please enter a value for this required field'
											: ''
									}
									error={error.Description}
									onChange={(e) => mountData('Description', e.target.value)}
									required
								/>
							</GridInputWrapper>
							<GridInputWrapper
								massUpdating={massUpdating}
								hidden={massUpdating && !massUpdateFieldList.includes('Unit')}>
								<AsynchronousSelect2
									name='Unit'
									formName='Price_Book_Item_Unit'
									reportName='Price_Book_Item_Units'
									displayValueKey='Name'
									error={error.Unit}
									helperText={
										error.Unit
											? 'Please enter a value for this required field'
											: ''
									}
									defaultValue={state.currentData.Unit}
									onChange={(e) => mountData('Unit', e)}
									required
								/>
							</GridInputWrapper>
							<GridInputWrapper
								massUpdating={massUpdating}
								hidden={massUpdating && !massUpdateFieldList.includes('Cost')}>
								<TextField
									label='Cost'
									value={state.currentData.Cost}
									type='number'
									helperText={
										error.Cost
											? 'Please enter a value for this required field'
											: ''
									}
									error={error.Cost}
									onChange={(e) => mountData('Cost', e.target.value)}
									required
								/>
							</GridInputWrapper>
							<GridInputWrapper
								massUpdating={massUpdating}
								hidden={massUpdating && !massUpdateFieldList.includes('Type')}>
								<TextField
									select
									label='Type'
									value={state.currentData.Type}
									required
									error={error.Type}
									helperText={
										error.Type
											? 'Please enter a value for this required field'
											: ''
									}
									onChange={(e) => mountData('Type', e.target.value)}>
									{columns
										.filter((column) => column.valueKey === 'Type')[0]
										.options.filter(
											(option) => option !== 'Credit' && option !== 'Comment'
										)
										.map((option) => (
											<MenuItem key={option} value={option}>
												{option}
											</MenuItem>
										))}
								</TextField>
							</GridInputWrapper>
							{/* <GridInputWrapper
								massUpdating={massUpdating}
								hidden={
									massUpdating && !massUpdateFieldList.includes('Website')
								}>
								<TextField
									label='Website'
									value={state.currentData.Website}
									type='url'
									onChange={(e) => mountData('Website', e.target.value)}
								/>
							</GridInputWrapper> */}

							<GridInputWrapper>
								<ThemeCard header='Inventory Management' elevation={8}>
									<Grid container spacing={2}>
										<Grid item xs={12}>
											<FormControlLabel
												control={
													<Checkbox
														checked={state.currentData.Active}
														onChange={(e) =>
															mountData('Active', e.target.checked)
														}
													/>
												}
												label='Active'
											/>
										</Grid>
										<Grid item xs={12}>
											<FormControlLabel
												control={
													<Checkbox
														checked={state.currentData.Track_Inventory}
														onChange={(e) =>
															mountData('Track_Inventory', e.target.checked)
														}
													/>
												}
												label='Track Inventory'
											/>
											<FormHelperText>
												Check to require this product to be filled on Sales
												Orders
											</FormHelperText>
										</Grid>
										<Grid item xs={12}>
											<FormControlLabel
												control={
													<Checkbox
														checked={state.currentData.Purchase_Item}
														onChange={(e) =>
															mountData('Purchase_Item', e.target.checked)
														}
													/>
												}
												label='Purchase Item'
											/>
											<FormHelperText>
												Check to allow this item on Purchase Orders
											</FormHelperText>
										</Grid>
										<Grid item xs={12}>
											<FormControlLabel
												control={
													<Checkbox
														checked={state.currentData.Sales_Item}
														onChange={(e) =>
															mountData('Sales_Item', e.target.checked)
														}
													/>
												}
												label='Sales Item'
											/>
											<FormHelperText>
												Check to allow this item on Quotes & Sales Orders
											</FormHelperText>
										</Grid>
										<Grid item xs={12}>
											<FormControlLabel
												control={
													<Checkbox
														checked={state.currentData.Serialized}
														onChange={(e) =>
															mountData('Serialized', e.target.checked)
														}
													/>
												}
												label='Serialized'
											/>
										</Grid>

										<Grid item xs={12}>
											<TextField
												label='Reorder Level'
												value={state.currentData.Reorder_Level}
												type='number'
												onChange={(e) =>
													mountData('Reorder_Level', e.target.value)
												}
											/>
										</Grid>
									</Grid>
								</ThemeCard>
							</GridInputWrapper>
							<GridInputWrapper
								massUpdating={massUpdating}
								hidden={
									massUpdating &&
									!massUpdateFieldList.includes('Purchasing Information')
								}>
								<ThemeCard header='Purchasing Information' elevation={8}>
									<Grid container spacing={2}>
										<Grid item xs={12}>
											<LookupField2
												name='Manufacturer'
												defaultSortByColumn='Name'
												defaultValue={state.currentData.Manufacturer}
												onChange={(e) => mountData('Manufacturer', e)}
												endAdornment={
													<IconButton edge='end' size='large'>
														<DatabaseDefaultIcon form='Manufacturer' />
													</IconButton>
												}
											/>
										</Grid>
										<Grid item xs={12}>
											<TextField
												label='Manufacturer Part Number'
												value={state.currentData.Manufacturer_Part_Number}
												onChange={(e) =>
													mountData('Manufacturer_Part_Number', e.target.value)
												}
											/>
										</Grid>
										<Grid item xs={12}>
											<LookupField2
												name='Vendor'
												defaultSortByColumn='Name'
												defaultValue={state.currentData.Vendor}
												onChange={(e) => mountData('Vendor', e)}
												endAdornment={
													<IconButton edge='end' size='large'>
														<DatabaseDefaultIcon form='Vendor' />
													</IconButton>
												}
											/>
										</Grid>
									</Grid>
								</ThemeCard>
							</GridInputWrapper>

							{state.currentData.Type === 'Service' ? (
								<GridInputWrapper
									massUpdating={massUpdating}
									hidden={
										massUpdating &&
										!massUpdateFieldList.includes('Services Information')
									}>
									<ThemeCard header='Services Information' elevation={8}>
										<Grid container spacing={2}>
											<Grid item xs={12}>
												<TextField
													label='Sell Price ($)'
													value={state.currentData.Sell_Price}
													onChange={(e) =>
														mountData('Sell_Price', e.target.value)
													}
												/>
											</Grid>

											<Grid item xs={12}>
												<TextField
													label='Margin (%)'
													value={
														state.currentData.Sell_Price &&
														state.currentData.Cost
															? ((state.currentData.Sell_Price -
																	state.currentData.Cost) /
																	state.currentData.Sell_Price) *
															  100
															: 0
													}
													helperText='[(Sell Price - Cost) / Sell Price] * 100%'
													InputProps={{
														readOnly: true,
													}}
												/>
											</Grid>
										</Grid>
									</ThemeCard>
								</GridInputWrapper>
							) : null}

							<GridInputWrapper massUpdating={massUpdating}>
								<ThemeCard header='Aging Product Details' elevation={8}>
									<Grid container spacing={2}>
										<Grid item xs={12}>
											<FormControlLabel
												control={
													<Checkbox
														checked={state.currentData.End_of_Life}
														onChange={(e) =>
															mountData('End_of_Life', e.target.checked)
														}
													/>
												}
												label='End of Life'
											/>
										</Grid>
										<Grid item xs={12}>
											<FormControlLabel
												control={
													<Checkbox
														checked={state.currentData.End_of_Service}
														onChange={(e) =>
															mountData('End_of_Service', e.target.checked)
														}
													/>
												}
												label='End of Service'
											/>
										</Grid>
									</Grid>
								</ThemeCard>
							</GridInputWrapper>
						</GridFormSectionWrapper>
					</ThemeCard>
				)}

				{id && !massUpdating ? (
					<TabbedSection>
						<TabbedSectionHeader
							value={tabValue}
							onTabChanged={(e, tabIndex) => setTabValue(tabIndex)}>
							<Tab label='Notes' value='Notes' />
							<Tab label='Attachments' value='Attachments' />
							<Tab label='Stock' value='Stock' />
							<Tab label='Reservations' value='Reservations' />
							<Tab label='Serial Numbers' value='Serial_Numbers' />
						</TabbedSectionHeader>

						<TabbedSectionContent>
							{tabValue === 'Notes' ? (
								<CustomTable
									formName='Note'
									defaultSortByColumn='Added_Time'
									defaultCriteria={`Parent_ID=="${id}"`}
									tabTable
									parentId={id}
								/>
							) : tabValue === 'Attachments' ? (
								<CustomTable
									formName='Attachment'
									defaultSortByColumn='Added_Time'
									defaultCriteria={`Parent_ID=="${id}"`}
									tabTable
									parentId={id}
								/>
							) : tabValue === 'Stock' ? (
								<CustomTable
									formName='Warehouse_Stock_Item'
									defaultSortByColumn='Added_Time'
									defaultCriteria={`Price_Book_Item==${state.savedData.ID}`}
									tabTable
									parentId={id}
								/>
							) : tabValue === 'Reservations' ? (
								<CustomTable
									formName='Warehouse_Stock_Item_Reservations'
									defaultSortByColumn='Added_Time'
									defaultCriteria={`Price_Book_Item==${state.savedData.ID}`}
									tabTable
									parentId={id}
								/>
							) : tabValue === 'Serial Numbers' ? (
								<CustomTable
									formName='Serial_Number'
									defaultSortByColumn='Added_Time'
									defaultSortDirection='asc'
									defaultCriteria={`Price_Book_Item==${state.savedData.ID}`}
									tabTable
								/>
							) : null}
						</TabbedSectionContent>
					</TabbedSection>
				) : null}
			</FormWrapper>

			<BottomBar
				show={
					!id ||
					currentUser.Enable_Autosave === false ||
					currentUser.Enable_Autosave === 'false'
						? true
						: false
				}
				onSave={onSave}
				saveDisabled={
					(state.data && Object.keys(state.data).length === 0) ||
					Object.values(error).includes(true) ||
					state.status === 'saving' ||
					state.status === 'deleting'
				}
				onReset={onReset}
				resetDisabled={
					(state.data && Object.keys(state.data).length === 0) ||
					state.status === 'saving' ||
					state.status === 'deleting'
				}
			/>

			{/* Form specific action confirmation (e.g. Void, Delete) */}
			<ConfirmationDialog
				open={confirmationDialogOpen}
				title={confirmationDialogData.title}
				onBack={() => setConfirmationDialogOpen(false)}
				onConfirm={confirmationDialogData.onConfirm}
				confirmButtonColor={confirmationDialogData.confirmButtonColor}>
				{confirmationDialogData.children}
			</ConfirmationDialog>

			{/* Form specific children (e.g. Email, Print Wizard) */}
			<RenderPopup
				title={renderPopupData.title}
				open={renderPopupData.title ? true : false}
				onClose={() => setRenderPopupData({})}>
				{renderPopupData.children}
			</RenderPopup>

			{/* Toast messaging in lower right */}
			<ToastMessage data={toastData} />
			<SaveManager formDataState={state} />
		</Box>
	);
};

PriceBookItemForm.propTypes = {
	formName: PropTypes.string.isRequired,
	id: PropTypes.string,
	loadData: PropTypes.object,
	resource: PropTypes.object,
	setAppBreadcrumb: PropTypes.func,
	onChange: PropTypes.func,
	massUpdating: PropTypes.bool,
	massUpdateRecordIds: PropTypes.array,
	uuid: PropTypes.string,
	maxHeight: PropTypes.number,
};

PriceBookItemForm.defaultProps = {
	loadData: {},
	massUpdating: false,
	massUpdateRecordIds: [],
};

const Wrapper = (props) => {
	return (
		<React.Suspense fallback={<ContextCircularProgressLoader />}>
			<PriceBookItemForm {...props} />
		</React.Suspense>
	);
};

export default Wrapper;
