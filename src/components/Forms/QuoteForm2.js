//import { useWhyDidYouUpdate } from 'use-why-did-you-update';
import React, { useEffect, useRef, useState } from 'react';
import PropTypes from 'prop-types';
import { useRecoilState, useRecoilValue } from 'recoil';
import { useWhyDidYouUpdate } from 'use-why-did-you-update';
import { omit } from 'lodash-es';
import { v4 as uuidv4 } from 'uuid';
import ThemeCard from '../ThemeCard';
import TabbedSection from '../TabbedSection/TabbedSection';
import {
	debugState,
	applicationTabsState,
	currentUserState,
} from '../../recoil/atoms';
import { currentUserIsAdminState } from '../../recoil/selectors';
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
	getReferenceFormType,
} from '../Helpers/functions';
import {
	Autocomplete,
	Box,
	Button,
	Divider,
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
	Autorenew,
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
import ResponsiveDialog from '../Modals/ResponsiveDialog';
import CustomFormActions from '../FormControls/CustomFormActions';
import FormVoidDialog from '../Modals/FormVoidDialog';
import FormDeleteDialog from '../Modals/FormDeleteDialog';
import ConvertQuoteToSalesOrderDialog from '../Modals/ConvertQuoteToSalesOrderDialog';
import RichTextField from '../RichText/RichTextField';
import dayjs from 'dayjs';

//#region //TODO Mass update fields available
const massUpdateCapableFieldKeys = [
	{ label: 'Account', value: 'Account' },
	{ label: 'Reference', value: 'Reference' },
	{ label: 'Owner', value: 'Owner' },
	{ label: 'Status', value: 'Status' },
	{ label: 'Type', value: 'Type' },
	{ label: 'Terms', value: 'Terms' },
	{ label: 'Comment', value: 'Comment' },
];

const defaultLoadData = {
	Description: '',
	Number: '',
	Owner: '',
	Type: '',
	Account: '',
	Reference: '',
	Contacts: '',
	Expiration_Date: dayjs().add(90, 'day').format('L'),
	Terms: 'Net 60',
	Comment: '',
	Customer_Notes: '',
	Terms_Conditions: '',
};
//#endregion

//#region //TODO Helper functions
const typeServiceOrderNotesTemplate = 
	`<div>VisionPoint’s Service Rates are $165/hour (Customers w/o active Maintenance Agreement) and $125/hour (Customers w/ active Maintenance Agreement) port to port with a 3-hour minimum. Invoice will reflect actual hours worked. Non-system sales or transactional sales are covered by a manufacturer’s warranty. VisionPoint will assist with the return or repair of any equipment failures at no change within the first 30 days of purchase.<br>**Any applicable Sales Tax and/or Freight charges will be assessed at the time of invoicing.</div>`;
const typeServiceOrderTermsAndConditionsTemplate = `<div>All information contained in this document is the intellectual property of VisionPoint LLC. This document has been provided for review only. VisionPoint LLC is an Equal Opportunity Employer.</div>`;

//#endregion

const QuoteForm = ({
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
	const currentUserIsAdmin = useRecoilValue(currentUserIsAdminState);
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
	const [id, setId] = useState(data?.ID);
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
	const [conversionState, convertQuoteToSalesOrder] = useFormData();
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
	const [tabValue, setTabValue] = useState('Line Items');
	const [emailWizardOpen, setEmailWizardOpen] = useState(false);
	const [printWizardOpen, setPrintWizardOpen] = useState(false);
	const [convertDialogOpen, setConvertDialogOpen] = useState(false);
	const [voidDialogOpen, setVoidDialogOpen] = useState(false);
	const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
	const hasError = Object.keys(error).length > 0;
	const isVoided =
		state?.currentData?.Void_field === true ||
		state?.currentData?.Void_field === 'true';

	const [overrideHtmlCustomerNotes, setOverrideHtmlCustomerNotes] = useState(data.Customer_Notes);
	const [overrideHtmlTermsConditions, setOverrideHtmlTermsConditions] = useState(data.Terms_Conditions);

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
		console.log(`QuoteForm.js state change`, state);

		if (onChange) {
			onChange(state.savedData);
		}

		if(state.currentData?.Type == "Service Order") {
			//? Examine Quote Notes & Terms & Conditions
			if(!state.currentData?.Customer_Notes) {
				//mountData('Customer_Notes', );
				setOverrideHtmlCustomerNotes(typeServiceOrderNotesTemplate);
			}

			if(!state.currentData?.Terms_Conditions) {
				//mountData('Terms_Conditions', typeServiceOrderTermsAndConditionsTemplate);
				setOverrideHtmlTermsConditions(typeServiceOrderTermsAndConditionsTemplate);
			}
		}

		if (
			hasError &&
			(!id ||
				currentUser.Enable_Autosave === false ||
				currentUser.Enable_Autosave === 'false')
		) {
			isValid();
		}

		if (state?.currentData?.Converted_to) {
			const thisAlert = {
				id: 'CONVERTED',
				variant: 'filled',
				severity: 'info',
				action: (
					<Button
						color='inherit'
						size='small'
						onClick={() => openSalesOrderInNewTab()}>
						Go to {state.currentData.Converted_to.display_value}
					</Button>
				),
				message: `${state.currentData.Name} has already been converted to ${state.currentData.Converted_to.display_value}`,
			};

			setAlerts((old) =>
				old[thisAlert.id] ? old : { ...old, [thisAlert.id]: thisAlert }
			);
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
	const onConvertToSalesOrder = () => {
		let _conversionData = {
			Source_Form: 'Quote',
			Source_Record_ID: id,
			Destination_Form: 'Sales_Order',
			Execute_Workflows: true,
		};
		convertQuoteToSalesOrder(
			'Conversion_Request',
			_conversionData,
			({ Destination_Record_ID, Destination_Record_Name }) => {
				const _salesOrderData = {
					ID: Destination_Record_ID,
					display_value: Destination_Record_Name,
				};
				openSalesOrderInNewTab(_salesOrderData);
				setConvertDialogOpen(false);
				mountData('Status', 'Accepted');
				mountData('Converted_to', _salesOrderData);
			}
		);
	};

	const openSalesOrderInNewTab = (salesOrderData) => {
		//Use parameter data if provided, else use currentData
		const label = salesOrderData
			? salesOrderData?.display_value
			: state?.currentData?.Converted_to?.display_value;
		const id = salesOrderData
			? salesOrderData?.ID
			: state?.currentData?.Converted_to?.ID;

		setApplicationTabs((old) => [
			...old,
			{
				uuid: uuidv4(),
				label: 'Sales Order: ' + label,
				type: 'form',
				id,
				name: 'Sales_Order',
			},
		]);
	};

	useEffect(() => {
		console.log('conversionState change', conversionState);

		//TODO If successful, mountData('Converted_to', )
	}, [conversionState]);

	const onVoid = () => {
		if (currentUserIsAdmin) {
			//If current user is an admin, allow the ability to toggle void on/off
			updateRecord(plurifyFormName(formName), id, {
				Void_field: !isVoided,
			});
		} else {
			updateRecord(plurifyFormName(formName), id, { Void_field: true });
		}
	};

	const onDelete = () => {
		console.log('TODO: onDelete');
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
				disabled={false}
				CustomFormActions={
					<CustomFormActions
						options={[
							{
								type: 'form',
								label: 'Convert to Sales Order',
								onClick: () => setConvertDialogOpen(true),
								Icon: Autorenew,
								disabled: Boolean(state?.currentData?.Converted_to),
							},
							{
								type: 'general',
								label: 'Print Wizard',
								onClick: () => setPrintWizardOpen(true),
								Icon: Print,
							},
							{
								type: 'general',
								label: 'Send Email',
								onClick: () => setEmailWizardOpen(true),
								Icon: Email,
							},
							{
								type: 'void',
								label: isVoided ? 'Unvoid' : 'Void',
								onClick: () => setVoidDialogOpen(true),
								Icon: Block,
								disabled: !currentUserIsAdmin && isVoided,
							},
							{
								type: 'void',
								label: 'Delete',
								onClick: () => setDeleteDialogOpen(true),
								Icon: DeleteForever,
								disabled: !currentUserIsAdmin,
							},
						]}
					/>
				}>
				{/* Status bar if applicable */}
				{!massUpdating &&
				columns.filter((column) => column.valueKey === 'Status')[0].options
					.length > 0 ? (
					<StatusGraphic
						statuses={columns
							.filter((column) => column.valueKey === 'Status')[0]
							.options(state.currentData.Type, state.currentData.Total)}
						value={state.currentData.Status}
						onChange={(statusText) => {
							mountData('Status', statusText);
						}}
						disabled={(params) => Boolean(params === 'Accepted')}
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
								hidden={massUpdating && !massUpdateFieldList.includes('Owner')}>
								<AsynchronousSelect2
									name='Owner'
									formName='Employee'
									reportName='Employees'
									displayValueKey='Full_Name'
									criteria='Active=true'
									error={error.Owner}
									helperText={
										error.Owner
											? 'Please enter a value for this required field'
											: ''
									}
									defaultValue={state.currentData.Owner}
									onChange={(e) => mountData('Owner', e)}
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
									massUpdating && !massUpdateFieldList.includes('Reference')
								}>
								<LookupField2
									name='Reference'
									label='Reference'
									defaultSortByColumn='Name'
									formName='Billing_Entity'
									reportName='Billing_Entities'
									defaultCriteria={
										state.currentData.Account
											? `Account==${state.currentData.Account.ID}`
											: ''
									}
									required
									error={error.Reference}
									defaultValue={state.currentData.Reference}
									onChange={(e) => mountData('Reference', e)}
									endAdornment={
										<IconButton edge='end' size='large'>
											<DatabaseDefaultIcon
												form={getReferenceFormType(state?.currentData)}
											/>
										</IconButton>
									}
									referenceFormName={getReferenceFormType(state?.currentData)}
								/>
							</GridInputWrapper>
							<GridInputWrapper
								massUpdating={massUpdating}
								hidden={
									massUpdating && !massUpdateFieldList.includes('Contacts')
								}>
								<LookupField2
									name='Contacts'
									defaultSortByColumn='First_Name'
									formName='Contact'
									reportName='Contacts'
									multiSelect
									defaultValue={state.currentData.Contacts}
									onChange={(e) => mountData('Contacts', e)}
									endAdornment={
										<IconButton edge='end' size='large'>
											<DatabaseDefaultIcon form='Contact' />
										</IconButton>
									}
								/>
							</GridInputWrapper>
							<GridInputWrapper
								massUpdating={massUpdating}
								hidden={
									massUpdating &&
									!massUpdateFieldList.includes('Expiration_Date')
								}>
								<TextFieldDateTime
									type='date'
									label='Expiration Date'
									value={state.currentData.Expiration_Date}
									onChange={(e) => mountData('Expiration_Date', e)}
									required
									error={error.Expiration_Date}
									helperText={
										error.Expiration_Date
											? 'Please enter a value for this required field'
											: ''
									}
								/>
							</GridInputWrapper>
							<GridInputWrapper
								massUpdating={massUpdating}
								hidden={massUpdating && !massUpdateFieldList.includes('Terms')}>
								<TextField
									select
									label='Terms'
									value={state.currentData.Terms}
									required
									error={error.Terms}
									helperText={
										error.Terms
											? 'Please enter a value for this required field'
											: ''
									}
									onChange={(e) => mountData('Terms', e.target.value)}>
									{columns
										.filter((column) => column.valueKey === 'Terms')[0]
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
									massUpdating &&
									!massUpdateFieldList.includes('Customer_Notes')
								}>
								<RichTextField
									label='Customer Notes'
									defaultValue={state.currentData.Customer_Notes}
									overrideHtml={overrideHtmlCustomerNotes}
									onChange={(e) => mountData('Customer_Notes', e)}
								/>
							</GridInputWrapper>
							<GridInputWrapper
								massUpdating={massUpdating}
								hidden={
									massUpdating &&
									!massUpdateFieldList.includes('Terms_Conditions')
								}>
								<RichTextField
									label='Terms & Conditions'
									defaultValue={state.currentData.Terms_Conditions}
									overrideHtml={overrideHtmlTermsConditions}
									onChange={(e) => mountData('Terms_Conditions', e)}
								/>
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
							<Tab label='Line Items' value='Line Items' />
							<Tab label='Summary' value='Summary' />
							<Tab label='Notes' value='Notes' />
							<Tab label='Emails' value='Emails' />
							<Tab label='Attachments' value='Attachments' />
						</TabbedSectionHeader>

						<TabbedSectionContent>
							{tabValue === 'Line Items' ? (
								<CustomTable
									formName='Quote_Line_Item'
									customSortOrder={lineItemDataState.Line_Item_Order}
									defaultSortByColumn='Added_Time'
									defaultCriteria={`(Quote==${id} && Deleted=false)`}
									enableShiftControls
									enableAssemblyControls
									enableAddComment
									enableCollapseRows
									enableDragReorder
									lineItemTable
									lineItemDataState={lineItemDataState}
									lineItemDispatch={lineItemDispatch}
									parentId={id}
								/>
							) : tabValue === 'Summary' ? (
								'Summary'
							) : tabValue === 'Notes' ? (
								<CustomTable
									formName='Note'
									reportName='Notes'
									defaultSortByColumn='Added_Time'
									defaultCriteria={`Parent_ID=="${id}"`}
									tabTable
									parentId={id}
								/>
							) : tabValue === 'Emails' ? (
								<CustomTable
									formName='Email'
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

			{/* Convert Quote to Sales Order Dialog */}
			<ConvertQuoteToSalesOrderDialog
				title={state?.currentData?.Name}
				open={convertDialogOpen}
				onClose={() => setConvertDialogOpen(false)}
				onConvert={onConvertToSalesOrder}
			/>

			{/* Void Dialog */}
			<FormVoidDialog
				formName={formName}
				formTitle={state?.currentData?.Name}
				open={voidDialogOpen}
				onClose={() => setVoidDialogOpen(false)}
				onVoid={onVoid}
				currentVoidState={isVoided}
				currentUserIsAdmin={currentUserIsAdmin}
			/>

			{/* Delete Dialog */}
			<FormDeleteDialog
				formName={formName}
				formTitle={state?.currentData?.Name}
				open={deleteDialogOpen}
				onClose={() => setDeleteDialogOpen(false)}
				onDelete={onDelete}
			/>

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
				<Box>Email Wizard NYI</Box>
			</RenderPopup>

			{/* Print Wizard */}
			<ResponsiveDialog
				sx={{ '& .MuiDialogContent-root': { p: 0 } }}
				title={
					<Box sx={{ display: 'flex' }}>
						<DatabaseDefaultIcon form={'Print_Wizard'} sx={{ mr: 0.75 }} />
						<Typography component='span'>
							Print Wizard for{' '}
							<Typography component='span' sx={{ fontWeight: 'bold' }}>
								{state.currentData.Name}
							</Typography>
						</Typography>
					</Box>
				}
				open={printWizardOpen}
				onClose={() => setPrintWizardOpen(false)}>
				<PrintRecord
					reportName='Quotes'
					outputFileName={state.currentData.Name}
					data={{
						...state.currentData,
						Quote_Line_Items: lineItemDataState.rows,
					}}
					defaultShowLineItemDetails={
						state.currentData.Type === 'Quote' ||
						state.currentData.Type === 'Change Order INTERNAL'
					}
					maxHeight={maxHeight - 51}
				/>
			</ResponsiveDialog>

			{/* Toast messaging in lower right */}
			<ToastMessage data={toastData} />
			<SaveManager formDataState={state} />
		</Box>
	);
};
QuoteForm.propTypes = {
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

QuoteForm.defaultProps = {
	loadData: {},
	massUpdating: false,
	massUpdateRecordIds: [],
};

const Wrapper = (props) => {
	return (
		<React.Suspense fallback={<ContextCircularProgressLoader />}>
			<QuoteForm {...props} />
		</React.Suspense>
	);
};

export default Wrapper;
