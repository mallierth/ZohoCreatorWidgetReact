//import { useWhyDidYouUpdate } from 'use-why-did-you-update';
import React, { useEffect, useRef, useState } from 'react';
import PropTypes from 'prop-types';
import { v4 as uuidv4 } from 'uuid';
import { useRecoilState, useRecoilValue } from 'recoil';
import { useWhyDidYouUpdate } from 'use-why-did-you-update';
import { omit } from 'lodash-es';
import ThemeCard from '../ThemeCard';
import TabbedSection from '../TabbedSection/TabbedSection';
import {
	applicationTabsState,
	debugState,
	currentUserState,
} from '../../recoil/atoms';
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
import TaskReport from '../Reports/TaskReport';

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
	Tab,
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
import NoteReport from '../Reports/NoteReport';
import EmailReport from '../Reports/EmailReport';
import AttachmentReport from '../Reports/AttachmentReport';
import SalesOrderReport from '../Reports/SalesOrderReport';
import QuoteReport from '../Reports/QuoteReport';
import PurchaseOrderReport from '../Reports/PurchaseOrderReport';
import EstimateReport from '../Reports/EstimateReport';
import TimeEntryReport from '../Reports/TimeEntryReport';
import ExpenseReport from '../Reports/ExpenseReport';
import RmaReport from '../Reports/RmaReport';

//#region //TODO Mass update fields available
const massUpdateCapableFieldKeys = [
	{ label: 'Account', value: 'Account' },
	{ label: 'Type', value: 'Type' },
	{ label: 'Contact', value: 'Contact' },
	{ label: 'Status', value: 'Status' },
	{ label: 'Customer Rooms', value: 'Customer_Rooms' },
	{ label: 'Billing Priority', value: 'Billing_Priority' },
	{ label: 'Technicians Assigned', value: 'Technicians_Assigned' },
];

const defaultLoadData = {
	Status: 'Open',
	Description: '',
	Number: '',
	Account: '',
	Contact: '',
	Type: '',
	Service_Contract: '',
	Customer_Rooms: '',
	Billing_Priority: '',
	Technicians_Assigned: '',
	//Work_Requested: '<div></div>',
	Work_Performed: '',
	Date_Completed: '',
	Date_Requested: '',
	Date_Closed: '',
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
				</MenuItem> */}
				<MenuItem onClick={_onOpenSendEmail}>
					<ListItemIcon>
						<Email color='success' fontSize='small' />
					</ListItemIcon>
					<ListItemText>Send Email</ListItemText>
				</MenuItem>
				<Divider />
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

const ServiceOrderForm = ({
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
	const [applicationTabs, setApplicationTabs] =
		useRecoilState(applicationTabsState);
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
	const accountDataState = useZohoGetAllRecords(
		'Accounts_Report',
		data?.Account?.ID ? `ID==${data?.Account?.ID}` : null
	);
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

	useEffect(() => {
		if (accountDataState.status === 'fetched') {
			console.log('accountDataState.data', accountDataState.data);
			if (accountDataState.data.length > 0) {
				const _accountData = accountDataState.data[0];
				if (
					_accountData.Has_Special_Instructions === true ||
					_accountData.Has_Special_Instructions === 'true'
				) {
					if (_accountData.Special_Instructions) {
						const thisAlert = {
							id: 'SPECIAL_INSTRUCTIONS',
							variant: 'filled',
							severity: 'warning',
							action: null,
							message: _accountData.Special_Instructions,
						};

						setAlerts((old) =>
							old[thisAlert.id] ? old : { ...old, [thisAlert.id]: thisAlert }
						);
					} else {
						const thisAlert = {
							id: 'SPECIAL_INSTRUCTIONS_ERROR',
							variant: 'filled',
							severity: 'error',
							action: (
								<Button
									color='inherit'
									size='small'
									onClick={() => openAccountInNewTab(_accountData)}>
									Go to {_accountData.Name}
								</Button>
							),
							message: `The Account ${_accountData.Name} has the checkbox checked for Has Special Instructions, but the Special Instructions text is blank!`,
						};

						setAlerts((old) =>
							old[thisAlert.id] ? old : { ...old, [thisAlert.id]: thisAlert }
						);
					}
				}
			}
		}
	}, [accountDataState]);

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
		console.log(`ServiceOrderForm.js state change`, state);

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

	const openAccountInNewTab = (accountData) => {
		//Use parameter data if provided, else use currentData
		const label = accountData.Name;
		const id = accountData.ID;

		setApplicationTabs((old) => [
			...old,
			{
				uuid: uuidv4(),
				label: 'Account: ' + label,
				type: 'form',
				id,
				name: 'Account',
			},
		]);
	};

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
								hidden={
									massUpdating && !massUpdateFieldList.includes('Description')
								}>
								<TextField
									label='Description'
									value={state.currentData.Description}
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
								hidden={
									massUpdating && !massUpdateFieldList.includes('Number')
								}>
								<TextField
									label='Number'
									value={state.savedData.Number}
									type='number'
									InputProps={{
										readOnly: true,
									}}
								/>
							</GridInputWrapper>
							<GridInputWrapper
								massUpdating={massUpdating}
								hidden={
									massUpdating && !massUpdateFieldList.includes('Account')
								}>
								<LookupField2
									name='Account'
									label='Account'
									defaultSortByColumn='Name'
									reportName='Accounts_Report'
									required
									error={error.Account}
									defaultValue={state.currentData.Account}
									onChange={(e) => mountData('Account', e)}
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
									formName='Contact'
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
									!massUpdateFieldList.includes('Service_Contract')
								}>
								<LookupField2
									name='Service_Contract'
									label='Service Contract'
									defaultSortByColumn='Name'
									formName='Service_Contract'
									reportName='Service_Contracts'
									defaultCriteria={`Accounts.contains(${
										state.currentData.Account ? state.currentData.Account.ID : 0
									})`}
									defaultValue={state.currentData.Service_Contract}
									onChange={(e) => mountData('Service_Contract', e)}
									endAdornment={
										<IconButton edge='end' size='large'>
											<DatabaseDefaultIcon form='Service_Contract' />
										</IconButton>
									}
								/>
							</GridInputWrapper>
							<GridInputWrapper
								massUpdating={massUpdating}
								hidden={
									massUpdating &&
									!massUpdateFieldList.includes('Customer_Rooms')
								}>
								<LookupField2
									name='Customer_Rooms'
									label='Customer Rooms'
									defaultSortByColumn='Name'
									formName='Customer_Room'
									reportName='Customer_Rooms'
									defaultCriteria={`Account==${
										state.currentData.Account ? state.currentData.Account.ID : 0
									}`}
									defaultValue={state.currentData.Customer_Rooms}
									onChange={(e) => mountData('Customer_Rooms', e)}
									multiSelect
									endAdornment={
										<IconButton edge='end' size='large'>
											<DatabaseDefaultIcon form='Customer_Room' />
										</IconButton>
									}
								/>
							</GridInputWrapper>
							<GridInputWrapper
								massUpdating={massUpdating}
								hidden={
									massUpdating &&
									!massUpdateFieldList.includes('Billing_Priority')
								}>
								<TextField
									select
									label='Billing Priority'
									value={state.currentData.Billing_Priority}
									required
									error={error.Billing_Priority}
									helperText={
										error.Billing_Priority
											? 'Please enter a value for this required field'
											: ''
									}
									onChange={(e) =>
										mountData('Billing_Priority', e.target.value)
									}>
									{columns
										.filter(
											(column) => column.valueKey === 'Billing_Priority'
										)[0]
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
									!massUpdateFieldList.includes('Technicians_Assigned')
								}>
								<AsynchronousSelect2
									label='Technician(s) Assigned'
									name='Technicians_Assigned'
									formName='Employee'
									reportName='Employees'
									displayValueKey='Full_Name'
									criteria='Active=true'
									multiSelect
									defaultValue={state.currentData.Technicians_Assigned}
									onChange={(e) => mountData('Technicians_Assigned', e)}
								/>
							</GridInputWrapper>
							<GridInputWrapper></GridInputWrapper>
							<GridInputWrapper
								massUpdating={massUpdating}
								hidden={
									massUpdating &&
									!massUpdateFieldList.includes('Work_Requested')
								}>
								<RichTextField
									label='Work Requested'
									defaultValue={state.currentData.Work_Requested}
									onChange={(e) => mountData('Work_Requested', e)}
									error={error.Work_Requested}
									helperText={
										error.Work_Requested
											? 'Please enter a value for this required field'
											: ''
									}
									required
								/>
							</GridInputWrapper>
							<GridInputWrapper
								massUpdating={massUpdating}
								hidden={
									massUpdating &&
									!massUpdateFieldList.includes('Work_Requested')
								}>
								<RichTextField
									label='Work Performed'
									defaultValue={state.currentData.Work_Performed}
									onChange={(e) => mountData('Work_Performed', e)}
								/>
							</GridInputWrapper>

							{/* Sections */}
							<GridInputWrapper>
								<ThemeCard header='Dates' elevation={8}>
									<Grid container spacing={2}>
										<Grid item xs={12}>
											<TextFieldDateTime
												type='dateTime'
												label='Created'
												value={state.currentData.Added_Time}
												InputProps={{
													readOnly: true,
												}}
											/>
										</Grid>
										<Grid item xs={12}>
											<TextFieldDateTime
												type='dateTime'
												label='Requested'
												value={state.currentData.Date_Requested}
												onChange={(e) => mountData('Date_Requested', e)}
											/>
										</Grid>
										<Grid item xs={12}>
											<TextFieldDateTime
												type='date'
												label='Completed'
												value={state.currentData.Date_Completed}
												InputProps={{
													readOnly: true,
												}}
											/>
										</Grid>
										<Grid item xs={12}>
											<TextFieldDateTime
												type='date'
												label='Closed'
												value={state.currentData.Date_Closed}
												InputProps={{
													readOnly: true,
												}}
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
							<Tab label='Tasks' value='Tasks' />
							<Tab label='Quotes' value='Quotes' />
							<Tab label='Sales Orders' value='Sales Orders' />
							<Tab label='Purchase Orders' value='Purchase Orders' />
							<Tab label='Estimates' value='Estimates' />
							<Tab label='Time Entries' value='Time Entries' />
							<Tab label='Expenses' value='Expenses' />
							<Tab label='RMAs' value='RMAs' />
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
							) : tabValue === 'Tasks' ? (
								<TaskReport
									showActions
									maxHeight={maxHeight}
									forcedCriteria={`Reference==${state?.savedData?.Reference?.ID}`}
									loadData={{
										Service_Order: id,
										Service_Contract: state?.savedData?.Service_Contract,
										Parent_ID: id,
										Reference: state?.savedData?.Reference,
										Account: state?.savedData?.Account,
										Contact: state.savedData?.Contact,
									}}
									WrapperProps={{
										sx: {
											my: 0,
											p: 1,
										},
									}}
								/>
							) : tabValue === 'Quotes' ? (
								<QuoteReport
									variant='tab'
									maxHeight={maxHeight}
									forcedCriteria={`Void_field=false && Reference==${
										state.savedData.Reference
											? state.savedData.Reference.ID
											: '0'
									}`}
									loadData={{
										Reference: state?.savedData?.Reference,
										Account: state?.currentData?.Account,
										Type: 'Service Order',
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
										Reference: state?.savedData?.Reference,
										Account: state?.currentData?.Account,
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
									loadData={{
										Reference: state?.savedData?.Reference,
										
									}}
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
									loadData={{
										Reference: state?.savedData?.Reference,
										Account: state?.savedData?.Account,
									}}
								/>
							) : tabValue === 'Time Entries' ? (
								<TimeEntryReport
									variant='tab'
									maxHeight={maxHeight}
									forcedCriteria={`Reference==${
										state.savedData.Reference ? state.savedData.Reference.ID : 0
									}`}
									loadData={{
										Reference: state?.savedData?.Reference,
										Account: state?.savedData?.Account,
										Reason: currentUser?.Default_Time_Entry_Reason,
									}}
								/>
							) : tabValue === 'Expenses' ? (
								<ExpenseReport
									variant='tab'
									maxHeight={maxHeight}
									forcedCriteria={`Reference==${
										state.savedData.Reference
											? state.savedData.Reference.ID
											: '0'
									}`}
									loadData={{
										Reference: state?.savedData?.Reference,
										Account: state?.savedData?.Account,
									}}
								/>
							) : tabValue === 'RMAs' ? (
								<RmaReport
									variant='tab'
									maxHeight={maxHeight}
									forcedCriteria={`Reference==${
										state.savedData.Reference
											? state.savedData.Reference.ID
											: '0'
									}`}
									loadData={{
										Reference: state?.savedData?.Reference,
										Account: state?.savedData?.Account,
										Type: 'Service',
									}}
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
			<RenderPopup
				title={
					<Box sx={{ display: 'flex' }}>
						<DatabaseDefaultIcon form={'Email'} sx={{ mr: 0.75 }} />
						<Typography component='span'>
							Send Email{' '}
							<Typography component='span' sx={{ fontWeight: 'bold' }}>
								{state.currentData.Name}
							</Typography>
						</Typography>
					</Box>
				}
				open={emailWizardOpen}
				onClose={() => setEmailWizardOpen(false)}>
				<RenderForm
					formName={'Email'}
					loadData={{
						Form: 'Service_Order',
						Service_Order: state?.currentData?.ID,
						Contact: state?.currentData?.Contact?.ID,
						Service_Contract: state?.currentData?.Service_Contract?.ID,
						Account: state?.currentData?.Account?.ID,
						Parent_ID: state?.savedData?.ID,
						Subject_field: '',
						Cc: '',
						To: '',
						Message: '',
						From_Update: 'Support',
					}}
					onChange={() =>
						console.log(
							'Email sent?? If Status == Open/Empty => Update status to Issued'
						)
					}
					parentForm={formName}
				/>
			</RenderPopup>

			{/* Print Wizard */}

			{/* Toast messaging in lower right */}
			<ToastMessage data={toastData} />
			<SaveManager formDataState={state} />
		</Box>
	);
};
ServiceOrderForm.propTypes = {
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

ServiceOrderForm.defaultProps = {
	loadData: {},
	massUpdating: false,
	massUpdateRecordIds: [],
};

const Wrapper = (props) => {
	return (
		<React.Suspense fallback={<ContextCircularProgressLoader />}>
			<ServiceOrderForm {...props} />
		</React.Suspense>
	);
};

export default Wrapper;
