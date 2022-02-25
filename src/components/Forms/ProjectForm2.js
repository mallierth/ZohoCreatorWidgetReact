//import { useWhyDidYouUpdate } from 'use-why-did-you-update';
import React, { useEffect, useRef, useState } from 'react';
import PropTypes from 'prop-types';
import { useRecoilState, useRecoilValue } from 'recoil';
import { omit } from 'lodash-es';
import { v4 as uuidv4 } from 'uuid';
import dayjs from 'dayjs';
import ThemeCard from '../ThemeCard';
import TabbedSection from '../TabbedSection/TabbedSection';
import {
	debugState,
	currentUserState,
	appMaxWidthState,
	applicationTabsState,
} from '../../recoil/atoms';
import { currentUserIsAdminState } from '../../recoil/selectors';
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
	sum,
} from '../Helpers/functions';
import {
	AppBar,
	Autocomplete,
	Box,
	Button,
	Checkbox,
	Container,
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
	Toolbar,
	Typography,
} from '@mui/material';
import {
	ConfirmationNumber,
	DeleteForever,
	Description,
	Devices,
	Inventory,
	ShoppingCart,
	VerifiedUser,
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
import CustomFormActions from '../FormControls/CustomFormActions';
import ResponsiveDialog from '../Modals/ResponsiveDialog';
import FormDeleteDialog from '../Modals/FormDeleteDialog';
import ProjectPickTicketReport from '../Reports/ProjectPickTicketReport';
import ProjectAudit from './ProjectAudit';
import TextFieldDateTime from '../FormControls/TextFieldDateTime';

import NoteReport from '../Reports/NoteReport';
import EmailReport from '../Reports/EmailReport';
import AttachmentReport from '../Reports/AttachmentReport';
import QuoteReport from '../Reports/QuoteReport';
import TaskReport from '../Reports/TaskReport';
import SalesOrderLineItemReport from '../Reports/SalesOrderLineItemReport';
import SalesOrderReport from '../Reports/SalesOrderReport';
import EstimateReport from '../Reports/EstimateReport';
import PurchaseOrderReport from '../Reports/PurchaseOrderReport';
import { LoadingButton } from '@mui/lab';
import ExpenseReport from '../Reports/ExpenseReport';
import RmaReport from '../Reports/RmaReport';
import TimeEntryReport from '../Reports/TimeEntryReport';
import PurchaseOrderLineItemReport from '../Reports/PurchaseOrderLineItemReport';

//#region //TODO Mass update fields available
const massUpdateCapableFieldKeys = [
	{ label: 'Billing Account', value: 'Account' },
	{ label: 'Accounts', value: 'Accounts' },
	{ label: 'Contacts', value: 'Contacts' },
	{ label: 'Project Manager', value: 'Project_Manager' },
	{ label: 'Category', value: 'Category' },
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

const ProjectForm = ({
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
	const [applicationTabs, setApplicationTabs] =
		useRecoilState(applicationTabsState);
	const appMaxWidth = useRecoilValue(appMaxWidthState);
	const currentUser = useRecoilValue(currentUserState);
	const currentUserIsAdmin = useRecoilValue(currentUserIsAdminState);
	const columns = useRecoilValue(
		Columns[`${camelize(formName.replaceAll('_', ''))}ColumnsState`]
	);
	const debug = useRecoilValue(debugState);
	const [alerts, setAlerts] = useState({});
	const [data, setData] = useState({ ...loadData, ...resource.read() });
	const [id, setId] = useState(data?.ID);
	const baseUrl = `https://creatorapp.zoho.com/visionpointllc/av-professional-services/#Page:Search?Type=${formName}&ID=${id}`;
	const [recordTitle, setRecordTitle] = useState(data ? data.Name : null); //TODO
	const [
		state,
		addRecord,
		updateRecord,
		mountData,
		resetData,
		massUpdateRecords,
	] = useFormData(data, loadData);

	const [conversionState, convertLineItemsToAssets] = useFormData();

	const [massUpdateFieldList, setMassUpdateFieldList] = useState([]);
	const requiredFields = useRef(columns.filter((column) => column.required));
	const [error, setError] = useState({});
	const [toastData, setToastData] = useState({});
	const [confirmationDialogOpen, setConfirmationDialogOpen] = useState(false);
	const [confirmationDialogData, setConfirmationDialogData] = useState({});
	const [timelineOpen, setTimelineOpen] = useState(false);
	const [tabValue, setTabValue] = useState('Notes');
	const [pickTicketDialogOpen, setPickTicketDialogOpen] = useState(false);
	const [salesOrderLineItemDialogOpen, setSalesOrderLineItemDialogOpen] =
		useState(false);
	const [purchaseOrderLineItemDialogOpen, setPurchaseOrderLineItemDialogOpen] =
		useState(false);
	const [projectAuditDialogOpen, setProjectAuditDialogOpen] = useState(false);
	const [customerAssetCreateDialogOpen, setCustomerAssetCreateDialogOpen] =
		useState(false);
	const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
	const hasError = Object.keys(error).length > 0;

	const contractFormRef = useRef(null);
	const [customerAssetList, setCustomerAssetList] = useState([]);
	const [warrantyData, setWarrantyData] = useState({
		Create_Warranty: true,
		Contract_Value: '',
		Start_Date: '',
		End_Date: '',
	});

	useEffect(() => {
		console.log('conversionState change', conversionState);

		//TODO If successful, mountData('Converted_to', )
	}, [conversionState]);

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

		if (state?.currentData?.First_Year_Warranty) {
			const thisAlert = {
				id: 'CONVERTED_WARRANTY',
				variant: 'filled',
				severity: 'info',
				action: (
					<Button
						color='inherit'
						size='small'
						onClick={openFirstYearWarrantyInNewTab}>
						Go to {state?.currentData?.First_Year_Warranty?.display_value}
					</Button>
				),
				message: `First Year Warranty: ${state?.currentData?.First_Year_Warranty?.display_value}`,
			};

			setAlerts((old) =>
				old[thisAlert.id] ? old : { ...old, [thisAlert.id]: thisAlert }
			);
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
	const openFirstYearWarrantyInNewTab = () => {
		setApplicationTabs((old) => [
			...old.map((o) => ({ ...o, active: false })),
			{
				uuid: uuidv4(),
				label:
					'Service Contract: ' +
					state?.currentData?.First_Year_Warranty?.display_value,
				type: 'form',
				id: state.currentData?.First_Year_Warranty?.ID,
				name: 'Service_Contract',
				active: true,
			},
		]);
	};

	const openSourceOpportunityInNewTab = () => {
		setApplicationTabs((old) => [
			...old.map((o) => ({ ...o, active: false })),
			{
				uuid: uuidv4(),
				label:
					'Opportunity: ' +
					state?.currentData?.Source_Opportunity?.display_value,
				type: 'form',
				id: state.currentData?.Source_Opportunity?.ID,
				name: 'Opportunity',
				active: true,
			},
		]);
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
				CustomFormActions={
					<CustomFormActions
						options={[
							{
								type: 'form',
								label: `Go to ${state?.currentData?.Source_Opportunity?.display_value}`,
								onClick: () => openSourceOpportunityInNewTab(),
								hidden: !state?.currentData?.Source_Opportunity,
								Icon: Description,
							},
							{
								type: 'form',
								label: 'Pick Ticket',
								onClick: () => setPickTicketDialogOpen(true),
								Icon: ConfirmationNumber,
							},
							{
								type: 'form',
								label: 'Sales Order Line Items',
								onClick: () => setSalesOrderLineItemDialogOpen(true),
								Icon: Inventory,
							},
							{
								type: 'form',
								label: 'Purchase Order Line Items',
								onClick: () => setPurchaseOrderLineItemDialogOpen(true),
								Icon: ShoppingCart,
							},
							{
								type: 'form',
								label: 'Project Audit',
								onClick: () => setProjectAuditDialogOpen(true),
								Icon: VerifiedUser,
							},
							{
								type: 'form',
								label: 'Create Assets & Warranty',
								onClick: () => setCustomerAssetCreateDialogOpen(true),
								Icon: Devices,
								disabled:
									state?.currentData?.Customer_Assets_Created === true ||
									state?.currentData?.Customer_Assets_Created === 'true' ||
									state?.currentData?.Completed_Closeout_Audit === false ||
									state?.currentData?.Completed_Closeout_Audit === 'false',
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
				{!massUpdating ? (
					<StatusGraphic
						statuses={
							columns.filter((column) => column.valueKey === 'Status')[0]
								.options
						}
						value={state.currentData.Status}
						onChange={(statusText) => mountData('Status', statusText)}
						disabled={(params) => Boolean(params === 'Closed')}
					/>
				) : null}

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
								hidden={massUpdating && !massUpdateFieldList.includes('Alias')}>
								<TextField
									label='Alias'
									value={state.currentData.Alias}
									helperText={
										error.Alias
											? 'Please enter a value for this required field'
											: ''
									}
									required
									error={error.Alias}
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
									massUpdating && !massUpdateFieldList.includes('Account')
								}>
								<LookupField2
									name='Account'
									label='Billing Account'
									defaultSortByColumn='Name'
									formName='Account'
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
									!massUpdateFieldList.includes('Project_Manager')
								}>
								<AsynchronousSelect2
									name='Project_Manager'
									formName='Employee'
									reportName='Employees'
									displayValueKey='Full_Name'
									criteria='Active=true'
									error={error.Project_Manager}
									helperText={
										error.Project_Manager
											? 'Please enter a value for this required field'
											: ''
									}
									defaultValue={state.currentData.Project_Manager}
									onChange={(e) => mountData('Project_Manager', e)}
									required
								/>
							</GridInputWrapper>
							<GridInputWrapper
								massUpdating={massUpdating}
								hidden={
									massUpdating && !massUpdateFieldList.includes('Category')
								}>
								<TextField
									select
									label='Category'
									value={state.currentData.Category}
									required
									error={error.Category}
									helperText={
										error.Category
											? 'Please enter a value for this required field'
											: ''
									}
									onChange={(e) => mountData('Category', e.target.value)}>
									{columns
										.filter((column) => column.valueKey === 'Category')[0]
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
									massUpdating && !massUpdateFieldList.includes('Description')
								}>
								<TextField
									label='Description'
									value={state.currentData.Description}
									multiline
									onChange={(e) => mountData('Description', e.target.value)}
								/>
							</GridInputWrapper>
							<GridInputWrapper
								massUpdating={massUpdating}
								hidden={
									massUpdating &&
									!massUpdateFieldList.includes('Teamwork_Project_URL')
								}>
								<TextField
									label='Teamwork URL'
									value={state.currentData.Teamwork_Project_URL}
									type='url'
									onChange={(e) =>
										mountData('Teamwork_Project_URL', e.target.value)
									}
								/>
							</GridInputWrapper>
							<GridInputWrapper
								massUpdating={massUpdating}
								hidden={
									massUpdating &&
									!massUpdateFieldList.includes('Completed_Closeout_Audit')
								}>
								<FormControlLabel
									control={
										<Checkbox
											checked={state?.currentData?.Completed_Closeout_Audit}
											onChange={(e) =>
												mountData('Completed_Closeout_Audit', e.target.checked)
											}
										/>
									}
									label='Completed Closeout Audit'
								/>
							</GridInputWrapper>
						</GridFormSectionWrapper>
					</ThemeCard>
				)}

				{massUpdating || !id ? null : (
					<GridInputWrapper>
						<ThemeCard header='Hours Breakdown' sx={{ mt: 1 }}>
							<TableContainer component={Paper}>
								<Table sx={{ minWidth: 650 }} size='small'>
									<TableHead>
										<TableRow>
											<TableCell>Labor Category</TableCell>
											<TableCell align='right'>Actual Hours</TableCell>
											<TableCell align='right'>Estimated Hours</TableCell>
											<TableCell align='right'>Percent Utilization</TableCell>
										</TableRow>
									</TableHead>
									<TableBody>
										<TableRow>
											<TableCell>Project Management</TableCell>
											<TableCell align='right'>
												{intTryParse(state.savedData.Actual_Project_Management)
													? parseFloat(
															state.savedData.Actual_Project_Management
													  )
													: 0}
											</TableCell>
											<TableCell align='right'>
												{parseFloat(
													state.savedData.Estimated_Project_Management
												)}
											</TableCell>
											<TableCell align='right'>
												{calculateUtilization(
													state.savedData.Actual_Project_Management,
													state.savedData.Estimated_Project_Management
												) + ' %'}
											</TableCell>
										</TableRow>
										<TableRow>
											<TableCell>Administration</TableCell>
											<TableCell align='right'>
												{parseFloat(state.savedData.Actual_Administration)}
											</TableCell>
											<TableCell align='right'>
												{parseFloat(state.savedData.Estimated_Administration)}
											</TableCell>
											<TableCell align='right'>
												{calculateUtilization(
													state.savedData.Actual_Administration,
													state.savedData.Estimated_Administration
												) + ' %'}
											</TableCell>
										</TableRow>
										<TableRow>
											<TableCell>Design & Engineering</TableCell>
											<TableCell align='right'>
												{parseFloat(
													state.savedData.Actual_Design_and_Engineering
												)}
											</TableCell>
											<TableCell align='right'>
												{parseFloat(
													state.savedData.Estimated_Design_and_Engineering
												)}
											</TableCell>
											<TableCell align='right'>
												{calculateUtilization(
													state.savedData.Actual_Design_and_Engineering,
													state.savedData.Estimated_Design_and_Engineering
												) + ' %'}
											</TableCell>
										</TableRow>
										<TableRow>
											<TableCell>Drafting</TableCell>
											<TableCell align='right'>
												{parseFloat(state.savedData.Actual_Drafting)}
											</TableCell>
											<TableCell align='right'>
												{parseFloat(state.savedData.Estimated_Drafting)}
											</TableCell>
											<TableCell align='right'>
												{calculateUtilization(
													state.savedData.Actual_Drafting,
													state.savedData.Estimated_Drafting
												) + ' %'}
											</TableCell>
										</TableRow>
										<TableRow>
											<TableCell>Audio Profile</TableCell>
											<TableCell align='right'>
												{parseFloat(state.savedData.Actual_Audio_Profile)}
											</TableCell>
											<TableCell align='right'>
												{parseFloat(state.savedData.Estimated_Audio_Profile)}
											</TableCell>
											<TableCell align='right'>
												{calculateUtilization(
													state.savedData.Actual_Audio_Profile,
													state.savedData.Estimated_Audio_Profile
												) + ' %'}
											</TableCell>
										</TableRow>
										<TableRow>
											<TableCell>Programming</TableCell>
											<TableCell align='right'>
												{parseFloat(state.savedData.Actual_Programming)}
											</TableCell>
											<TableCell align='right'>
												{parseFloat(state.savedData.Estimated_Programming)}
											</TableCell>
											<TableCell align='right'>
												{calculateUtilization(
													state.savedData.Actual_Programming,
													state.savedData.Estimated_Programming
												) + ' %'}
											</TableCell>
										</TableRow>
										<TableRow>
											<TableCell>Rack Build</TableCell>
											<TableCell align='right'>
												{parseFloat(state.savedData.Actual_Rack_Build)}
											</TableCell>
											<TableCell align='right'>
												{parseFloat(state.savedData.Estimated_Rack_Build)}
											</TableCell>
											<TableCell align='right'>
												{calculateUtilization(
													state.savedData.Actual_Rack_Build,
													state.savedData.Estimated_Rack_Build
												) + ' %'}
											</TableCell>
										</TableRow>
										<TableRow>
											<TableCell>QC In House</TableCell>
											<TableCell align='right'>
												{parseFloat(state.savedData.Actual_QC_In_House)}
											</TableCell>
											<TableCell align='right'>
												{parseFloat(state.savedData.Estimated_QC_In_House)}
											</TableCell>
											<TableCell align='right'>
												{calculateUtilization(
													state.savedData.Actual_QC_In_House,
													state.savedData.Estimated_QC_In_House
												) + ' %'}
											</TableCell>
										</TableRow>
										<TableRow>
											<TableCell>Installation</TableCell>
											<TableCell align='right'>
												{parseFloat(state.savedData.Actual_Installation)}
											</TableCell>
											<TableCell align='right'>
												{parseFloat(state.savedData.Estimated_Installation)}
											</TableCell>
											<TableCell align='right'>
												{calculateUtilization(
													state.savedData.Actual_Installation,
													state.savedData.Estimated_Installation
												) + ' %'}
											</TableCell>
										</TableRow>
										<TableRow>
											<TableCell>Travel</TableCell>
											<TableCell align='right'>
												{parseFloat(state.savedData.Actual_Travel)}
											</TableCell>
											<TableCell align='right'>
												{parseFloat(state.savedData.Estimated_Travel)}
											</TableCell>
											<TableCell align='right'>
												{calculateUtilization(
													state.savedData.Actual_Travel,
													state.savedData.Estimated_Travel
												) + ' %'}
											</TableCell>
										</TableRow>
										<TableRow>
											<TableCell>QC On Site</TableCell>
											<TableCell align='right'>
												{parseFloat(state.savedData.Actual_QC_On_Site)}
											</TableCell>
											<TableCell align='right'>
												{parseFloat(state.savedData.Estimated_QC_On_Site)}
											</TableCell>
											<TableCell align='right'>
												{calculateUtilization(
													state.savedData.Actual_QC_On_Site,
													state.savedData.Estimated_QC_On_Site
												) + ' %'}
											</TableCell>
										</TableRow>
										<TableRow>
											<TableCell>Client Training</TableCell>
											<TableCell align='right'>
												{parseFloat(state.savedData.Actual_Client_Training)}
											</TableCell>
											<TableCell align='right'>
												{parseFloat(state.savedData.Estimated_Client_Training)}
											</TableCell>
											<TableCell align='right'>
												{calculateUtilization(
													state.savedData.Actual_Client_Training,
													state.savedData.Estimated_Client_Training
												) + ' %'}
											</TableCell>
										</TableRow>
										<TableRow>
											<TableCell>
												<Typography sx={{ fontWeight: 'bold' }}>
													Totals
												</Typography>
											</TableCell>
											<TableCell align='right'>
												{parseFloat(state.savedData.Total_Actual_Hours)}
											</TableCell>
											<TableCell align='right'>
												{parseFloat(state.savedData.Total_Estimated_Hours)}
											</TableCell>
											<TableCell align='right'>
												{calculateUtilization(
													state.savedData.Total_Actual_Hours,
													state.savedData.Total_Estimated_Hours
												) + ' %'}
											</TableCell>
										</TableRow>
									</TableBody>
								</Table>
							</TableContainer>
						</ThemeCard>
					</GridInputWrapper>
				)}
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
							<Tab label='Estimates' value='Estimates' />
							<Tab label='Purchase Orders' value='Purchase Orders' />
							<Tab label='Time Entries' value='Time Entries' />
							<Tab label='Expenses' value='Expenses' />
							<Tab label='RMAs' value='RMAs' />
						</TabbedSectionHeader>

						<TabbedSectionContent>
							{tabValue === 'Notes' ? (
								<NoteReport
									variant='tab'
									maxHeight={600}
									forcedCriteria={`Parent_ID=="${id}"`}
									loadData={{ Parent_ID: id }}
								/>
							) : tabValue === 'Emails' ? (
								<EmailReport
									variant='tab'
									maxHeight={600}
									forcedCriteria={`Parent_ID=="${id}"`}
									loadData={{ Parent_ID: id }}
								/>
							) : tabValue === 'Attachments' ? (
								<AttachmentReport
									variant='tab'
									maxHeight={600}
									forcedCriteria={`Parent_ID=="${id}"`}
									loadData={{ Parent_ID: id }}
								/>
							) : tabValue === 'Tasks' ? (
								<TaskReport
									variant='tab'
									maxHeight={600}
									forcedCriteria={`
										Parent_ID=="${
											state.savedData.Reference
												? state.savedData.Reference.ID
												: '0'
										}" || 
										Child_ID=="${id}" || Parent_ID=="${id}"
									`}
									loadData={{
										Parent_ID: id,
										Child_ID: id,
										Reference: state?.savedData?.Reference,
									}}
								/>
							) : tabValue === 'Quotes' ? (
								<QuoteReport
									variant='tab'
									maxHeight={600}
									forcedCriteria={`Reference==${
										state.savedData.Reference
											? state.savedData.Reference.ID
											: '0'
									}${
										state.savedData.Enable_Phases &&
										state.savedData.Enable_Phases !== 'false'
											? `&& Phase==${id}`
											: ''
									}`}
									loadData={{
										Account: state.currentData.Account,
										Reference: state.currentData.Reference,
									}}
								/>
							) : tabValue === 'Sales Orders' ? (
								<SalesOrderReport
									variant='tab'
									maxHeight={600}
									forcedCriteria={`Reference==${
										state.savedData.Reference
											? state.savedData.Reference.ID
											: '0'
									}${
										state.savedData.Enable_Phases &&
										state.savedData.Enable_Phases !== 'false'
											? `&& Phase==${id}`
											: ''
									}`}
									loadData={{
										Account: state.currentData.Account,
										Reference: state.currentData.Reference,
									}}
								/>
							) : tabValue === 'Estimates' ? (
								<EstimateReport
									variant='tab'
									maxHeight={600}
									forcedCriteria={`Reference==${
										state.savedData.Reference
											? state.savedData.Reference.ID
											: '0'
									}${
										state.savedData.Enable_Phases &&
										state.savedData.Enable_Phases !== 'false'
											? `&& Phase==${id}`
											: ''
									}`}
									loadData={{
										Account: state.currentData.Account,
										Reference: state.currentData.Reference,
									}}
								/>
							) : tabValue === 'Purchase Orders' ? (
								<PurchaseOrderReport
									variant='tab'
									maxHeight={600}
									forcedCriteria={`Reference==${
										state.savedData.Reference
											? state.savedData.Reference.ID
											: '0'
									}${
										state.savedData.Enable_Phases &&
										state.savedData.Enable_Phases !== 'false'
											? `&& Phase==${id}`
											: ''
									}`}
									loadData={{
										Account: state.currentData.Account,
										Reference: state.currentData.Reference,
									}}
								/>
							) : tabValue === 'Time Entries' ? (
								<TimeEntryReport
									variant='tab'
									maxHeight={maxHeight}
									forcedCriteria={`Reference==${
										state.savedData.Reference
											? state.savedData.Reference.ID
											: '0'
									}${
										state.savedData.Enable_Phases &&
										state.savedData.Enable_Phases !== 'false'
											? `&& Phase==${id}`
											: ''
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
									}${
										state.savedData.Enable_Phases &&
										state.savedData.Enable_Phases !== 'false'
											? `&& Phase==${id}`
											: ''
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
									}${
										state.savedData.Enable_Phases &&
										state.savedData.Enable_Phases !== 'false'
											? `&& Phase==${id}`
											: ''
									}`}
									loadData={{
										Reference: state?.savedData?.Reference,
										Account: state?.savedData?.Account,
										Type: 'Project',
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

			{/* Pick Ticket */}
			<RenderPopup
				title={
					<Box sx={{ display: 'flex' }}>
						<DatabaseDefaultIcon form={'Pick_Ticket'} sx={{ mr: 0.75 }} />
						<Typography component='span'>
							Pick Ticket for{' '}
							<Typography component='span' sx={{ fontWeight: 'bold' }}>
								{state?.currentData?.Name}
							</Typography>
						</Typography>
					</Box>
				}
				open={pickTicketDialogOpen}
				onClose={() => setPickTicketDialogOpen(false)}>
				<ProjectPickTicketReport
					maxHeight={maxHeight}
					variant='modal'
					referenceId={state.currentData.Reference.ID}
					phaseId={
						state.currentData.Enable_Phases === true ||
						state.currentData.Enable_Phases === 'true'
							? id
							: null
					}
				/>
			</RenderPopup>

			{/* Sales Order Line Items */}
			<RenderPopup
				title={
					<Box sx={{ display: 'flex' }}>
						<DatabaseDefaultIcon
							form={'Sales_Order_Line_Item'}
							sx={{ mr: 0.75 }}
						/>
						<Typography component='span'>
							Sales Order Line Items for{' '}
							<Typography component='span' sx={{ fontWeight: 'bold' }}>
								{state?.currentData?.Name}
							</Typography>
						</Typography>
					</Box>
				}
				open={salesOrderLineItemDialogOpen}
				onClose={() => setSalesOrderLineItemDialogOpen(false)}>
				<SalesOrderLineItemReport
					includeStatus
					disableOpenOnRowClick
					disableRowRightClick
					maxHeight={maxHeight}
					forcedCriteria={`Sales_Order.Reference_ID==${
						state.currentData.Reference ? state.currentData.Reference.ID : '0'
					}${
						state.currentData.Enable_Phases &&
						state.currentData.Enable_Phases !== 'false'
							? `&& Project.Phase==${id}`
							: ''
					} && Deleted == false && Sales_Order.Type=="Project Order" && Sales_Order.Void_field=false`}
					variant='modal'
					ActionProps={{
						hideAdd: true,
						hideEdit: true,
						hideMassUpdate: true,
						hideDelete: true,
					}}
					additionalColumns={[
						{
							field: 'Sales_Order.Description',
							headerName: 'Room',
							flex: 3,
						},
						{
							field: 'Sales_Order.Status',
							headerName: 'Sales Order Status',
							flex: 2,
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
					]}
				/>
			</RenderPopup>

			{/* Purchase Order Line Items */}
			<RenderPopup
				title={
					<Box sx={{ display: 'flex' }}>
						<DatabaseDefaultIcon
							form={'Purchase_Order_Line_Item'}
							sx={{ mr: 0.75 }}
						/>
						<Typography component='span'>
							Purchase Order Line Items for{' '}
							<Typography component='span' sx={{ fontWeight: 'bold' }}>
								{state?.currentData?.Name}
							</Typography>
						</Typography>
					</Box>
				}
				open={purchaseOrderLineItemDialogOpen}
				onClose={() => setPurchaseOrderLineItemDialogOpen(false)}>
				<PurchaseOrderLineItemReport
					includeStatus
					disableOpenOnRowClick
					disableRowRightClick
					maxHeight={maxHeight}
					forcedCriteria={`Purchase_Order.Reference_ID==${
						state.savedData.Reference ? state.savedData.Reference.ID : '0'
					}${
						state.savedData.Enable_Phases &&
						state.savedData.Enable_Phases !== 'false'
							? `&& Project.Phase==${id}`
							: ''
					} && Deleted == false && Purchase_Order.Void_field=false`}
					variant='modal'
					ActionProps={{
						hideAdd: true,
						hideEdit: true,
						hideMassUpdate: true,
						hideDelete: true,
					}}
					additionalColumns={[
						{
							field: 'Purchase_Order.Status',
							headerName: 'PO Status',
							flex: 1,
						},
						{
							field: 'Vendor.Name',
							headerName: 'Vendor',
							flex: 2,
						}
					]}
				/>
			</RenderPopup>

			{/* Project Audit */}
			<RenderPopup
				title={
					<Box sx={{ display: 'flex' }}>
						<DatabaseDefaultIcon form={'Project_Audit'} sx={{ mr: 0.75 }} />
						<Typography component='span'>
							Project Audit for{' '}
							<Typography component='span' sx={{ fontWeight: 'bold' }}>
								{state.currentData.Name}
							</Typography>
						</Typography>
					</Box>
				}
				open={projectAuditDialogOpen}
				onClose={() => setProjectAuditDialogOpen(false)}>
				<ProjectAudit
					referenceId={state?.currentData?.Reference?.ID}
					projectId={id}
				/>
			</RenderPopup>

			{/* Customer Assets */}
			<RenderPopup
				title={
					<Box sx={{ display: 'flex' }}>
						<DatabaseDefaultIcon form={'Customer_Asset'} sx={{ mr: 0.75 }} />
						<Typography component='span'>
							Complete Service Department's Project Closeout for{' '}
							<Typography component='span' sx={{ fontWeight: 'bold' }}>
								{state.currentData.Name}
							</Typography>
						</Typography>
					</Box>
				}
				open={customerAssetCreateDialogOpen}
				onClose={() =>
					conversionState.status === 'saving'
						? null
						: setCustomerAssetCreateDialogOpen(false)
				}>
				<Box sx={{ p: 2 }}>
					<FormControlLabel
						control={
							<Checkbox
								checked={Boolean(warrantyData?.Create_Warranty)}
								onChange={(e) =>
									setWarrantyData((old) => ({
										...old,
										Create_Warranty: e.target.checked,
									}))
								}
							/>
						}
						label='Create 1st Year Warranty'
					/>

					<TextField
						label='Contract Value'
						type='number'
						value={warrantyData.Contract_Value}
						disabled={
							!warrantyData?.Create_Warranty ||
							conversionState.status === 'saving'
						}
						required={Boolean(warrantyData?.Create_Warranty)}
						error={
							warrantyData?.Create_Warranty && !warrantyData.Contract_Value
						}
						helperText={
							!warrantyData.Contract_Value
								? 'Please enter a value for this required field'
								: ''
						}
						onChange={(e) =>
							setWarrantyData((old) => ({
								...old,
								Contract_Value: e.target.value,
							}))
						}
					/>

					<TextFieldDateTime
						type='date'
						label='Start Date'
						value={warrantyData.Start_Date}
						onChange={(e) =>
							setWarrantyData((old) => ({
								...old,
								Start_Date: e,
								End_Date: dayjs(e).add(364, 'day').format('l'),
							}))
						}
						disabled={
							!warrantyData?.Create_Warranty ||
							conversionState.status === 'saving'
						}
						required={Boolean(warrantyData?.Create_Warranty)}
						error={
							Boolean(warrantyData?.Create_Warranty) && !warrantyData.Start_Date
						}
						helperText={
							Boolean(warrantyData?.Create_Warranty) && !warrantyData.Start_Date
								? 'Please enter a value for this required field'
								: ''
						}
					/>

					<TextFieldDateTime
						type='date'
						label='End Date'
						value={warrantyData.End_Date}
						InputProps={{
							readOnly: true,
						}}
						helperText='Automatically set to 1 year after Start Date'
					/>
					<Typography sx={{ py: 2 }}>
						At this point in time, asset creation is fairly hands off and
						completed by the back end. A Customer Room will be created per Sales
						Order on the project. A Customer Asset will be created per Serial
						Number in the case of serialized products or with equal quantity for
						non-serialized products. All Sales Order Line Items whose Price Book
						Items are of type "Goods" will have an asset created.
					</Typography>
				</Box>

				{/* <SalesOrderLineItemReport
					maxHeight={maxHeight - 2 * 51 - 16 - contractFormRef?.current?.clientHeight}
					forcedCriteria={`Sales_Order.Reference_ID == ${
						state?.currentData?.Reference?.ID
					}${
						state.savedData.Enable_Phases === 'true' &&
						state.savedData.Enable_Phases === true
							? `&& Phase==${id}`
							: ''
					} && Sales_Order.Type=="Project Order" && Deleted==false && Type != "Comment" && Type != "Credit" `}
					onChange={(selections) => setCustomerAssetList(selections)}
				/> */}
				<Box sx={{ py: 1 }}></Box>
				<AppBar
					color='inherit'
					position='relative'
					sx={{ position: 'absolute', bottom: 0 }}>
					<Container
						maxWidth='xl'
						disableGutters
						sx={{ maxWidth: { xs: appMaxWidth } }}>
						<Toolbar
							sx={{
								minHeight: { xs: 51 },
								display: 'flex',
								justifyContent: 'flex-end',
							}}>
							<Button
								onClick={() => setCustomerAssetCreateDialogOpen(false)}
								disabled={conversionState.status === 'saving'}
								sx={{ mr: 2 }}>
								Close
							</Button>
							<LoadingButton
								onClick={() => {
									console.log(
										'',
										JSON.stringify(customerAssetList.map((x) => x.ID))
									);
									let _conversionData = {
										Source_Form: 'Sales_Order_Line_Item',
										Destination_Form: 'Customer_Asset',
										Input_Data: JSON.stringify({
											...warrantyData,
											Project: id,
										}),
									};
									convertLineItemsToAssets(
										'Conversion_Request',
										_conversionData,
										({ Output_Data }) => {
											//Success
											console.log(
												'ProjectForm closeout Output_Data',
												Output_Data
											);

											mountData('Customer_Assets_Created', true);
											mountData('Closeout_Complete', true);
											mountData('Status', 'Closed');

											if (warrantyData?.Create_Warranty) {
												const _Output_Data = JSON.parse(Output_Data);
												mountData(
													'First_Year_Warranty',
													_Output_Data.Service_Contract
												);
												openFirstYearWarrantyInNewTab();
											}
											setWarrantyData({
												Create_Warranty: true,
												Contract_Value: '',
												Start_Date: '',
												End_Date: '',
											});
											setCustomerAssetCreateDialogOpen(false);
										}
									);
								}}
								disabled={
									warrantyData?.Create_Warranty &&
									(!warrantyData.Contract_Value ||
										!warrantyData.Start_Date ||
										!warrantyData.End_Date)
								}
								color='secondary'
								variant='contained'
								loading={conversionState.status === 'saving'}>
								Complete Closeout
							</LoadingButton>
						</Toolbar>
					</Container>
				</AppBar>
			</RenderPopup>

			{/* Delete Dialog */}
			<FormDeleteDialog
				formName={formName}
				formTitle={state?.currentData?.Name}
				open={deleteDialogOpen}
				onClose={() => setDeleteDialogOpen(false)}
				onDelete={onDelete}
			/>

			{/* Toast messaging in lower right */}
			<ToastMessage data={toastData} />
			<SaveManager formDataState={state} />
			<SaveManager formDataState={conversionState} />
		</Box>
	);
};

ProjectForm.propTypes = {
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

ProjectForm.defaultProps = {
	loadData: {},
	massUpdating: false,
	massUpdateRecordIds: [],
};

const Wrapper = (props) => {
	return (
		<React.Suspense fallback={<ContextCircularProgressLoader />}>
			<ProjectForm {...props} />
		</React.Suspense>
	);
};

export default Wrapper;
