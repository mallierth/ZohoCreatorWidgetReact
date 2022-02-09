//import { useWhyDidYouUpdate } from 'use-why-did-you-update';
import React, { useEffect, useRef, useState } from 'react';
import PropTypes from 'prop-types';
import { useRecoilValue } from 'recoil';
import { useWhyDidYouUpdate } from 'use-why-did-you-update';
import { omit } from 'lodash-es';
import ThemeCard from '../ThemeCard';
import TabbedSection from '../TabbedSection/TabbedSection';
import { debugState, currentUserState } from '../../recoil/atoms';
import * as Columns from '../../recoil/columnAtoms';
import DatabaseDefaultIcon from '../Helpers/DatabaseDefaultIcon';
import LookupField2 from '../FormControls/LookupField2';
import AsynchronousSelect2 from '../FormControls/AsynchronousSelect2';
import BottomBar from '../Helpers/BottomBar';
import PrintRecord from '../Forms/PrintRecord';
import {
	copyTextToClipboard,
	camelize,
	plurifyFormName,
} from '../Helpers/functions';
import {
	Autocomplete,
	Box,
	Button,
	Checkbox,
	Divider,
	FormControlLabel,
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
	MoreVert,
	Print,
	Restore,
	Share,
} from '@mui/icons-material';
import TabbedSectionHeader from '../TabbedSection/TabbedSectionHeader';
import GridFormSectionWrapper from '../FormControls/GridFormSectionWrapper';
import GridInputWrapper from '../FormControls/GridInputWrapper';
import TabbedSectionContent from '../TabbedSection/TabbedSectionContent';
import StatusGraphic from '../FormControls/StatusGraphic';
import {
	useFormData,
	useDebouncedEffect,
	useCustomTableLineItemFormData,
	useZohoGetAllRecords,
} from '../Helpers/CustomHooks';
import CustomTable from '../CustomTable/CustomTable';
import FormWrapper from '../FormControls/FormWrapper';
import ToastMessage from '../ToastMessage/ToastMessage';
import SaveManager from '../Helpers/SaveManager';
import { useTheme } from '@mui/material/styles';
import useMediaQuery from '@mui/material/useMediaQuery';
import RenderPopup from '../Helpers/RenderPopup';
import RenderForm from '../Helpers/RenderForm';
import ConfirmationDialog from '../Helpers/ConfirmationDialog';
import TextFieldDateTime from '../FormControls/TextFieldDateTime';
import WizardDialog from '../Wizards/WizardDialog';
import WizardStep from '../Wizards/WizardStep';
import ContextCircularProgressLoader from '../Loaders/ContextCircularProgressLoader';
import RichTextField from '../RichText/RichTextField';
import FileUploadField from '../FormControls/FileUploadField';
import dayjs from 'dayjs';
import NoteReport from '../Reports/NoteReport';
import EmailReport from '../Reports/EmailReport';
import AttachmentReport from '../Reports/AttachmentReport';
import ContactReport from '../Reports/ContactReport';
import ServiceOrderReport from '../Reports/ServiceOrderReport';
import CustomerAssetReport from '../Reports/CustomerAssetReport';
import CustomerRoomReport from '../Reports/CustomerRoomReport';
import SubscriptionReport from '../Reports/SubscriptionReport';
import SalesOrderReport from '../Reports/SalesOrderReport';
import PurchaseOrderReport from '../Reports/PurchaseOrderReport';
import EstimateReport from '../Reports/EstimateReport';
import TimeEntryReport from '../Reports/TimeEntryReport';
import ExpenseReport from '../Reports/ExpenseReport';

//#region //TODO Mass update fields available
const massUpdateCapableFieldKeys = [{ label: 'Description', value: 'Account' }];

const defaultLoadData = {
	Alias: 'Auto-generated Contract#: Contract Type',
	Number: '',
	Billing_Account: '',
	Accounts: '',
	Contact: '',
	Type: '',
	Contract_Value: '',
	Comment: '',
	Start_Date: '',
	End_Date: '',
	Days_Remaining: '',
	Renewed_from_Contract: '',
	Renewed_to_Contract: '',
	Labor_Rate: 125,
	Dollars_Sold: '',
	Dollars_Used_to_Date: 0,
	Dollars_Remaining: '',

	On_Site_Support_Rate: 165,
	On_Site_Hours_Logged: 0,

	Remote_Support_Rate: 125,
	Remote_Support_Hours_Logged: 0,
};

//#endregion

//#region //TODO Helper functions

//#endregion

//#region //TODO Custom actions in form toolbar
const CustomFormActions = ({
	currentData,
	currentUser,
	onCopyDirectUrl,
	onprintWizardOpen,
	onOpenSendEmail,
	onVoid,
	onDelete,

	//Form Specific
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

	const _onprintWizardOpen = () => {
		onClose();
		onprintWizardOpen();
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
				{/* <MenuItem onClick={_onprintWizardOpen}>
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
				<Divider /> */}
				{/* Record Specific Options */}

				{/* Void/Delete Options */}
				{/* <MenuItem
					onClick={_onVoid}
					disabled={
						(currentData.Void_field === true ||
							currentData.Void_field === 'true') &&
						currentUser.Admin !== true &&
						currentUser.Admin !== 'true'
					}>
					<ListItemIcon>
						{currentData.Void_field === true ||
						currentData.Void_field === 'true' ? (
							<Restore color='warning' fontSize='small' />
						) : (
							<Block color='warning' fontSize='small' />
						)}
					</ListItemIcon>
					<ListItemText>
						{currentData.Void_field === true ||
						currentData.Void_field === 'true'
							? 'UNVOID'
							: 'Void'}
					</ListItemText>
				</MenuItem> */}
				{currentUser.Admin === true || currentUser.Admin === 'true' ? (
					<MenuItem onClick={_onDelete}>
						<ListItemIcon>
							<DeleteForever color='error' fontSize='small' />
						</ListItemIcon>
						<ListItemText>Delete</ListItemText>
					</MenuItem>
				) : null}
			</Menu>
		</>
	);
};

CustomFormActions.propTypes = {
	currentData: PropTypes.object,
	currentUser: PropTypes.object,
	onCopyDirectUrl: PropTypes.func,
	onprintWizardOpen: PropTypes.func,
	onOpenSendEmail: PropTypes.func,
	onVoid: PropTypes.func,
	onDelete: PropTypes.func,
};
//#endregion

const ServiceContractForm = ({
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
	//https://creatorapp.zoho.com/visionpointllc/av-professional-services/#Search1?Type=Quote&ID=3860683000011594075
	const [recordTitle, setRecordTitle] = useState(data ? data.Name : null); //TODO
	const [
		state,
		addRecord,
		updateRecord,
		mountData,
		resetData,
		massUpdateRecords,
	] = useFormData(data, { ...defaultLoadData, ...loadData });
	const [lineItemDataState, lineItemDispatch] = useCustomTableLineItemFormData(
		formName,
		data
	);

	const [massUpdateFieldList, setMassUpdateFieldList] = useState([]);
	const requiredFields = useRef(columns.filter((column) => column.required));
	const [error, setError] = useState({});
	const [toastData, setToastData] = useState({});
	const [confirmationDialogOpen, setConfirmationDialogOpen] = useState(false);
	const [confirmationDialogData, setConfirmationDialogData] = useState({});
	const [timelineOpen, setTimelineOpen] = useState(false);
	const [tabValue, setTabValue] = useState('Notes');
	const [emailWizardOpen, setEmailWizardOpen] = useState(false);
	const [printWizardOpen, setPrintWizardOpen] = useState(false);
	const [wizard, setWizard] = useState({ open: false, activeStep: 0 });
	const hasError = Object.keys(error).length > 0;

	const relatedServiceOrdersDataState = useZohoGetAllRecords(
		'Service_Orders',
		`Service_Contract==${id ? id : 0}`
	); //* Retrieve data from database
	const relatedServiceOrderCriteria = useRef('');

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

	//! Helper to fetch related Service Orders for related record criteria - as of 12/15/21 - time entries on all related SO's
	useEffect(() => {
		if (relatedServiceOrdersDataState.status === 'fetched') {
			relatedServiceOrderCriteria.current = `(${relatedServiceOrdersDataState.data
				.map((data) => `Reference==${data.Reference.ID}`)
				.join(' || ')})`;
		}
	}, [relatedServiceOrdersDataState]);

	//#region //! Update parent table row if applicable
	useEffect(() => {
		console.log(`ServiceContractForm.js state change`, state);

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

		//! Alert: NO_TAX
		if (
			(state.currentData.Type === 'Service Order' ||
				state.currentData.Type === 'Change Order EXTERNAL') &&
			state.currentData.Tax === 0
		) {
			const thisAlert = {
				id: 'NO_TAX',
				variant: 'filled',
				severity: 'warning',
				action: null,
				message:
					'No Tax: Make sure taxes will be applied at the time of invoice or account for them on this quote',
			};

			setAlerts((old) =>
				old[thisAlert.id] ? old : { ...old, [thisAlert.id]: thisAlert }
			);
		} else if (
			alerts.NO_TAX &&
			((state.currentData.Type !== 'Service Order' &&
				state.currentData.Type !== 'Change Order EXTERNAL') ||
				state.currentData.Tax > 0)
		) {
			//Dismiss alert if currently displayed
			setAlerts((old) => omit(old, 'NO_TAX'));
		}

		//! Alert: VOID
		if (
			state.currentData.Void_field === true ||
			state.currentData.Void_field === 'true'
		) {
			const thisAlert = {
				id: 'VOID',
				variant: 'filled',
				severity: 'warning',
				action: null,
				message:
					'This Quote has been voided, so be aware that your changes will not trigger workflows and this record will be excluded from database calculations',
			};

			setAlerts((old) =>
				old[thisAlert.id] ? old : { ...old, [thisAlert.id]: thisAlert }
			);
		} else if (alerts.VOID) {
			//Dismiss alert if currently displayed
			setAlerts((old) => omit(old, 'VOID'));
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

	//! Debounced data related to line item form's details section align with line item order
	useDebouncedEffect(
		() => {
			//This acts like a loading statement - it seems rows consistently come in last. Once they are in, data is relevant
			if (lineItemDataState.rows.length === 0) {
				return;
			}

			//Dynamically iterate through all of the keys exposed by lineItemDataState and match them against data already in the database
			let objectShapedLikeSavedData = {};
			Object.keys(lineItemDataState).forEach((key) => {
				objectShapedLikeSavedData[key] = state.savedData[key]
					? state.savedData[key]
					: lineItemDataState[key];
			});

			//If lineItemDataState differs from the last save, trigger an auto save but just for this data - it will udpate state.savedData for the next go around
			if (
				JSON.stringify(objectShapedLikeSavedData) !==
				JSON.stringify({
					...lineItemDataState,
					Line_Item_Order: JSON.stringify(lineItemDataState.Line_Item_Order),
				})
			) {
				console.log(
					'autosave objectShapedLikeSavedData',
					objectShapedLikeSavedData
				);
				console.log('autosave lineItemDataState', {
					...lineItemDataState,
					Line_Item_Order: JSON.stringify(lineItemDataState.Line_Item_Order),
				});

				updateRecord(plurifyFormName(formName), id, {
					...lineItemDataState,
					Line_Item_Order: JSON.stringify(lineItemDataState.Line_Item_Order),
				});
			}
		},
		[lineItemDataState],
		500
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

	const onprintWizardOpen = () => {
		setPrintWizardOpen(true);
	};

	const onOpenSendEmail = () => {
		setEmailWizardOpen(true);
	};

	const onVoid = () => {
		setConfirmationDialogData({
			title: `Void ${formName.replaceAll('_', ' ')}`,
			onConfirm: () => {
				if (currentUser.Admin === true || currentUser.Admin === 'true') {
					//If current user is an admin, allow the ability to toggle void on/off
					updateRecord(plurifyFormName(formName), id, {
						Void_field: !state.savedData.Void_field,
					});
				} else {
					updateRecord(plurifyFormName(formName), id, { Void_field: true });
				}
				setConfirmationDialogOpen(false);
			},
			confirmButtonColor: 'warning',
			children: (
				<Typography sx={{ p: 2 }}>
					Are you sure you want to{' '}
					{state.savedData.Void_field === true ||
					state.savedData.Void_field === 'true'
						? 'unvoid'
						: 'void'}{' '}
					this quote?
				</Typography>
			),
		});
		setConfirmationDialogOpen(true);
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
		setConfirmationDialogOpen(true);
	};

	//#endregion

	const getReferenceIconForm = () => {
		switch (state.currentData.Type) {
			case 'Service Order':
			case 'Box Sale':
				return 'Service_Order';
			case 'Service Contract':
				return 'Service_Contract';
			default:
				return 'Project';
		}
	};

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
				disabled={false}
				CustomFormActions={
					<CustomFormActions
						currentData={state.currentData}
						currentUser={currentUser}
						onCopyDirectUrl={onCopyDirectUrl}
						onprintWizardOpen={onprintWizardOpen}
						onOpenSendEmail={onOpenSendEmail}
						onVoid={onVoid}
						onDelete={onDelete}
					/>
				}>
				{/* Status bar if applicable */}
				{!massUpdating &&
				columns.filter((column) => column.valueKey === 'Status')[0].options()
					.length > 0 ? (
					<StatusGraphic
						statuses={columns
							.filter((column) => column.valueKey === 'Status')[0]
							.options()} //!Insert arg here if helpful (Type/Total for quote change orders, etc)
						value={state.currentData.Status}
						onChange={(statusText) => mountData('Status', statusText)}
					/>
				) : null}

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
					<ThemeCard
						header={
							massUpdating ? null : `${formName.replaceAll('_', ' ')} Details`
						}>
						<GridFormSectionWrapper>
							{/* Fields */}
							<GridInputWrapper
								massUpdating={massUpdating}
								hidden={massUpdating && !massUpdateFieldList.includes('Alias')}>
								<TextField
									label='Alias'
									value={
										state.currentData.Name
											? `${state.currentData.Name}: ${state.currentData.Type}`
											: 'Auto-generated to SC#: SC Type'
									}
									InputProps={{
										readOnly: true,
									}}
									onChange={(e) => mountData('Alias', e.target.value)}
								/>
							</GridInputWrapper>
							<GridInputWrapper
								massUpdating={massUpdating}
								hidden={
									massUpdating && !massUpdateFieldList.includes('Number')
								}>
								<TextField
									label='Number'
									defaultValue={state.savedData.Number}
									type='number'
									InputProps={{
										readOnly: true,
									}}
								/>
							</GridInputWrapper>
							<GridInputWrapper
								massUpdating={massUpdating}
								hidden={
									massUpdating &&
									!massUpdateFieldList.includes('Billing_Account')
								}>
								<LookupField2
									name='Billing_Account'
									defaultSortByColumn='Name'
									formName='Account'
									reportName='Accounts_Report'
									required
									error={error.Billing_Account}
									defaultValue={state.currentData.Billing_Account}
									onChange={(e) => mountData('Billing_Account', e)}
									endAdornment={
										<IconButton edge='end' size='large'>
											<DatabaseDefaultIcon form='Account' />
										</IconButton>
									}
								/>
							</GridInputWrapper>
							<GridInputWrapper
								massUpdating={massUpdating}
								hidden={
									massUpdating && !massUpdateFieldList.includes('Accounts')
								}>
								<LookupField2
									name='Accounts'
									defaultSortByColumn='Name'
									formName='Account'
									reportName='Accounts_Report'
									multiSelect
									defaultValue={state.currentData.Accounts}
									onChange={(e) => mountData('Accounts', e)}
									endAdornment={
										<IconButton edge='end' size='large'>
											<DatabaseDefaultIcon form='Account' />
										</IconButton>
									}
								/>
							</GridInputWrapper>
							<GridInputWrapper
								massUpdating={massUpdating}
								hidden={
									massUpdating && !massUpdateFieldList.includes('Contact')
								}>
								<LookupField2
									name='Contact'
									defaultSortByColumn='First_Name'
									reportName='Contacts'
									defaultValue={state.currentData.Contact}
									onChange={(e) => mountData('Contact', e)}
									endAdornment={
										<IconButton edge='end' size='large'>
											<DatabaseDefaultIcon form='Contact' />
										</IconButton>
									}
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
										.options.map((option) => (
											<MenuItem key={option} value={option}>
												{option}
											</MenuItem>
										))}
								</TextField>
							</GridInputWrapper>
							<GridInputWrapper
								massUpdating={massUpdating}
								hidden={
									massUpdating &&
									!massUpdateFieldList.includes('Contract_Value')
								}>
								<TextField
									label='Contract Value'
									type='number'
									value={state.currentData.Contract_Value}
									required
									error={error.Contract_Value}
									helperText={
										error.Contract_Value
											? 'Please enter a value for this required field'
											: ''
									}
									onChange={(e) => mountData('Contract_Value', e.target.value)}
								/>
							</GridInputWrapper>
							<GridInputWrapper
								massUpdating={massUpdating}
								hidden={
									massUpdating && !massUpdateFieldList.includes('Comment')
								}>
								<TextField
									label='Comment'
									value={state.currentData.Comment}
									onChange={(e) => mountData('Comment', e.target.value)}
								/>
							</GridInputWrapper>
							<GridInputWrapper
								massUpdating={massUpdating}
								hidden={
									massUpdating && !massUpdateFieldList.includes('Start_Date')
								}>
								<TextFieldDateTime
									type='date'
									label='Start Date'
									value={state.currentData.Start_Date}
									onChange={(e) => mountData('Start_Date', e)}
									required
									error={error.Start_Date}
									helperText={
										error.Start_Date
											? 'Please enter a value for this required field'
											: ''
									}
								/>
							</GridInputWrapper>
							<GridInputWrapper
								massUpdating={massUpdating}
								hidden={
									massUpdating && !massUpdateFieldList.includes('End_Date')
								}>
								<TextFieldDateTime
									type='date'
									label='End Date'
									value={state.currentData.End_Date}
									onChange={(e) => mountData('End_Date', e)}
									required
									error={error.End_Date}
									helperText={
										error.End_Date
											? 'Please enter a value for this required field'
											: ''
									}
								/>
							</GridInputWrapper>
							<GridInputWrapper
								massUpdating={massUpdating}
								hidden={
									massUpdating &&
									!massUpdateFieldList.includes('Days_Remaining')
								}>
								<TextField
									label='Days Remaining'
									type='number'
									//value={dayjs(dayjs().format('l')).diff(state.currentData.End_Date, 'day')}
									value={
										dayjs(state.currentData.End_Date).diff(
											dayjs().format('l'),
											'day'
										) > 0
											? dayjs(state.currentData.End_Date).diff(
													dayjs().format('l'),
													'day'
											  )
											: 0
									}
									InputProps={{
										readOnly: true,
									}}
								/>
							</GridInputWrapper>
							<GridInputWrapper></GridInputWrapper>

							{/* Sections */}
							<GridInputWrapper>
								<ThemeCard header='Labor Information' elevation={8}>
									<TableContainer component={Paper}>
										<Table sx={{ minWidth: 650 }} size='small'>
											<TableHead>
												<TableRow>
													<TableCell>Category</TableCell>
													<TableCell align='right'>Rate</TableCell>
													<TableCell align='right'>Hours Logged</TableCell>
													<TableCell align='right'>Labor Cost</TableCell>
												</TableRow>
											</TableHead>
											<TableBody>
												<TableRow>
													<TableCell>On Site</TableCell>
													<TableCell align='right'>
														<TextField
															size='small'
															value={state.currentData.On_Site_Support_Rate}
															type='number'
															onChange={(e) =>
																mountData(
																	'On_Site_Support_Rate',
																	e.target.value
																)
															}
														/>
													</TableCell>
													<TableCell align='right'>
														{state.currentData.On_Site_Hours_Logged}
													</TableCell>
													<TableCell align='right'>
														{state.currentData.On_Site_Support_Rate ||
															0 * state.currentData.On_Site_Hours_Logged ||
															0}
													</TableCell>
												</TableRow>
												<TableRow>
													<TableCell>Remote</TableCell>
													<TableCell align='right'>
														<TextField
															size='small'
															value={state.currentData.Remote_Support_Rate}
															type='number'
															onChange={(e) =>
																mountData('Remote_Support_Rate', e.target.value)
															}
														/>
													</TableCell>
													<TableCell align='right'>
														{state.currentData.Remote_Support_Hours_Logged}
													</TableCell>
													<TableCell align='right'>
														{state.currentData.Remote_Support_Rate ||
															0 *
																state.currentData.Remote_Support_Hours_Logged ||
															0}
													</TableCell>
												</TableRow>
												<TableRow>
													<TableCell>
														<Typography sx={{ fontWeight: 'bold' }}>
															Totals
														</Typography>
													</TableCell>
													<TableCell align='right'>N/A</TableCell>
													<TableCell align='right'>
														{state.currentData.On_Site_Hours_Logged ||
															0 +
																state.currentData.Remote_Support_Hours_Logged ||
															0}
													</TableCell>
													<TableCell align='right'>
														{state.currentData.On_Site_Support_Rate ||
															0 * state.currentData.On_Site_Hours_Logged ||
															0 + state.currentData.Remote_Support_Rate ||
															0 *
																state.currentData.Remote_Support_Hours_Logged ||
															0}
													</TableCell>
												</TableRow>
											</TableBody>
										</Table>
									</TableContainer>
								</ThemeCard>
							</GridInputWrapper>

							{state.currentData.Type ===
							'I - Service Labor - Block of Time or Hours' ? (
								<GridInputWrapper>
									<ThemeCard
										header='Block of Hours/Money Information'
										elevation={8}>
										<Grid container spacing={2}>
											<Grid item xs={12}>
												<TextField
													label='Labor Rate'
													value={state.currentData.Labor_Rate}
													type='number'
													onChange={(e) =>
														mountData('Labor_Rate', e.target.value)
													}
													helperText='Used to calculate data in the fields below'
												/>
											</Grid>
											<Grid item xs={12}>
												<TextField
													label='Dollars Sold'
													value={state.currentData.Dollars_Sold}
													type='number'
													onChange={(e) =>
														mountData('Dollars_Sold', e.target.value)
													}
													helperText='Time entries and/or sales orders will be subtracted from this number'
												/>
											</Grid>
											<Grid item xs={12}>
												<TextField
													label='Dollars Used to Date'
													value={state.currentData.Dollars_Used_to_Date}
													type='number'
													onChange={(e) =>
														mountData('Dollars_Used_to_Date', e.target.value)
													}
													InputProps={{
														readOnly: true,
													}}
													helperText='Calculation of time entries * labor rate plus any transactions'
												/>
											</Grid>
											<Grid item xs={12}>
												<TextField
													label='Dollars Remaining'
													value={state.currentData.Dollars_Remaining}
													type='number'
													onChange={(e) =>
														mountData('Dollars_Remaining', e.target.value)
													}
													InputProps={{
														readOnly: true,
													}}
													helperText='Original dollars sold minus dollars used'
												/>
											</Grid>
										</Grid>
									</ThemeCard>
								</GridInputWrapper>
							) : null}

							<GridInputWrapper>
								<ThemeCard header='Renewal Information' elevation={8}>
									<Grid container spacing={2}>
										<Grid item xs={12}>
											<LookupField2
												name='Renewed_from_Contract'
												label='Renewed from Contract'
												defaultSortByColumn='Name'
												formName='Service_Contract'
												reportName='Service_Contracts'
												defaultCriteria={
													state.currentData.Accounts
														? state.currentData.Accounts.map(
																(account) => `Accounts.contains(${account.ID})`
														  ).join(' || ')
														: ''
												}
												defaultValue={state.currentData.Renewed_from_Contract}
												onChange={(e) => mountData('Renewed_from_Contract', e)}
												endAdornment={
													<IconButton edge='end' size='large'>
														<DatabaseDefaultIcon form='Service_Contract' />
													</IconButton>
												}
											/>
										</Grid>
										<Grid item xs={12}>
											<LookupField2
												name='Renewed_to_Contract'
												label='Renewed to Contract'
												defaultSortByColumn='Name'
												formName='Service_Contract'
												reportName='Service_Contracts'
												defaultCriteria={
													state.currentData.Accounts
														? state.currentData.Accounts.map(
																(account) => `Accounts.contains(${account.ID})`
														  ).join(' || ')
														: ''
												}
												defaultValue={state.currentData.Renewed_to_Contract}
												onChange={(e) => mountData('Renewed_to_Contract', e)}
												endAdornment={
													<IconButton edge='end' size='large'>
														<DatabaseDefaultIcon form='Service_Contract' />
													</IconButton>
												}
											/>
										</Grid>
									</Grid>
								</ThemeCard>
							</GridInputWrapper>
						</GridFormSectionWrapper>
					</ThemeCard>
				)}

				{/* Form Specific Data (e.g. table, graph, etc.) */}

				{/* Tabbed Section */}
				{id && !massUpdating ? (
					<TabbedSection>
						<TabbedSectionHeader
							value={tabValue}
							onTabChanged={(e, tabIndex) => setTabValue(tabIndex)}>
							<Tab label='Notes' value='Notes' />
							<Tab label='Emails' value='Emails' />
							<Tab label='Attachments' value='Attachments' />
							<Tab label='Customer Assets' value='Customer Assets' />
							<Tab label='Customer Rooms' value='Customer Rooms' />
							<Tab label='Service Orders' value='Service Orders' />
							<Tab label='Subscriptions' value='Subscriptions' />
							<Tab label='Sales Orders' value='Sales Orders' />
							<Tab label='Purchase Orders' value='Purchase Orders' />
							<Tab label='Estimates' value='Estimates' />
							<Tab label='Time Entries' value='Time Entries' />
							<Tab label='Expenses' value='Expenses' />
						</TabbedSectionHeader>

						<TabbedSectionContent>
							{tabValue === 'Notes' ? (
								<NoteReport
									variant='tab'
									maxHeight={maxHeight}
									forcedCriteria={`Parent_ID=="${id}"`}
									loadData={{ Parent_ID: id }}
								/>
							) : tabValue === 'Emails' ? (
								<EmailReport
									variant='tab'
									maxHeight={maxHeight}
									forcedCriteria={`Parent_ID=="${id}"`}
									loadData={{ Parent_ID: id }}
								/>
							) : tabValue === 'Attachments' ? (
								<AttachmentReport
									variant='tab'
									maxHeight={maxHeight}
									forcedCriteria={`Parent_ID=="${id}"`}
									loadData={{ Parent_ID: id }}
								/>
							) : tabValue === 'Customer Assets' ? (
								<CustomerAssetReport
									variant='tab'
									maxHeight={maxHeight}
									forcedCriteria={`Service_Contract==${id}`}
									loadData={{
										Service_Contract: {
											ID: id,
											display_value: state.currentData.Name,
										},
									}}
								/>
							) : tabValue === 'Customer Rooms' ? (
								<CustomerRoomReport
									variant='tab'
									maxHeight={maxHeight}
									forcedCriteria={`Service_Contract==${id}`}
									loadData={{
										Service_Contract: {
											ID: id,
											display_value: state.currentData.Name,
										},
									}}
								/>
							) : tabValue === 'Service Orders' ? (
								<ServiceOrderReport
									variant='tab'
									maxHeight={maxHeight}
									forcedCriteria={`Service_Contract==${id}`}
									loadData={{
										Service_Contract: {
											ID: id,
											display_value: state.currentData.Name,
										},
										Account: state?.currentData?.Billing_Account,
										Billing_Priority: 'Not Billable',
									}}
								/>
							) : tabValue === 'Subscriptions' ? (
								<SubscriptionReport
									variant='tab'
									maxHeight={maxHeight}
									forcedCriteria={`Service_Contract==${id}`}
									loadData={{
										Service_Contract: {
											ID: id,
											display_value: state.currentData.Name,
										},
									}}
								/>
							) : tabValue === 'Sales Orders' ? (
								<SalesOrderReport
									variant='tab'
									maxHeight={maxHeight}
									forcedCriteria={`Void_field=false && Reference==${
										state.savedData.Reference
											? state.savedData.Reference.ID
											: '0'
									}`}
									loadData={{
										Account: state?.currentData?.Billing_Account,
										Type: 'Service Order',
									}}
								/>
							) : tabValue === 'Purchase Orders' ? (
								<PurchaseOrderReport
									variant='tab'
									maxHeight={maxHeight}
									forcedCriteria={`Void_field=false && Reference==${
										state.savedData.Reference
											? state.savedData.Reference.ID
											: '0'
									}`}
								/>
							) : tabValue === 'Estimates' ? (
								<EstimateReport
									variant='tab'
									maxHeight={maxHeight}
									forcedCriteria={`Void_field=false && Reference==${
										state.savedData.Reference
											? state.savedData.Reference.ID
											: '0'
									}`}
								/>
							) : tabValue === 'Time Entries' ? (
								<TimeEntryReport
									variant='tab'
									maxHeight={maxHeight}
									forcedCriteria={`(Reference==${
										state.savedData.Reference ? state.savedData.Reference.ID : 0
									}) || ${relatedServiceOrderCriteria.current}`}
								/>
							) : tabValue === 'Expenses' ? (
								<ExpenseReport
									variant='tab'
									maxHeight={maxHeight}
									forcedCriteria={`(Reference==${
										state.savedData.Reference ? state.savedData.Reference.ID : 0
									}) || ${relatedServiceOrderCriteria.current}`}
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

			{/* Email Wizard) */}

			{/* Print Wizard */}

			{/* Toast messaging in lower right */}
			<ToastMessage data={toastData} />
			<SaveManager formDataState={state} />
		</Box>
	);
};
ServiceContractForm.propTypes = {
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

ServiceContractForm.defaultProps = {
	loadData: {},
	massUpdating: false,
	massUpdateRecordIds: [],
};

const Wrapper = (props) => {
	return (
		<React.Suspense fallback={<ContextCircularProgressLoader />}>
			<ServiceContractForm {...props} />
		</React.Suspense>
	);
};

export default Wrapper;
