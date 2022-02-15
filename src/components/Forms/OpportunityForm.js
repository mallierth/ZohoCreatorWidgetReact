//import { useWhyDidYouUpdate } from 'use-why-did-you-update';
import React, { useEffect, useRef, useState } from 'react';
import PropTypes from 'prop-types';
import { useRecoilState, useRecoilValue } from 'recoil';
import ThemeCard from '../ThemeCard';
import TabbedSection from '../TabbedSection/TabbedSection';
import {
	applicationTabsState,
	debugState,
	currentUserState,
} from '../../recoil/atoms';
import { currentUserIsAdminState } from '../../recoil/selectors';
import { v4 as uuidv4 } from 'uuid';
import * as Columns from '../../recoil/columnAtoms';
import DatabaseDefaultIcon from '../Helpers/DatabaseDefaultIcon';
import LookupField2 from '../FormControls/LookupField2';
import AsynchronousSelect2 from '../FormControls/AsynchronousSelect2';
import BottomBar from '../Helpers/BottomBar';
import {
	copyTextToClipboard,
	camelize,
	plurifyFormName,
} from '../Helpers/functions';
import {
	Autocomplete,
	Box,
	Button,
	CircularProgress,
	Divider,
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
	Edit,
	Email,
	ExpandMore,
	FileDownload,
	MoreVert,
	Print,
	Share,
	TableChart,
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
import TextFieldDateTime from '../FormControls/TextFieldDateTime';
import WizardDialog from '../Wizards/WizardDialog';
import WizardStep from '../Wizards/WizardStep';
import ContextCircularProgressLoader from '../Loaders/ContextCircularProgressLoader';
import ResponsiveDialog from '../Modals/ResponsiveDialog';
import CustomFormActions from '../FormControls/CustomFormActions';
import FormVoidDialog from '../Modals/FormVoidDialog';
import FormDeleteDialog from '../Modals/FormDeleteDialog';
import GenerateProposalDialog from '../Modals/GenerateProposalDialog';
import OpportunityClosedWonDialog from '../Modals/OpportunityClosedWonDialog';
import NoteReport from '../Reports/NoteReport';
import EmailReport from '../Reports/EmailReport';
import AttachmentReport from '../Reports/AttachmentReport';
import QuoteReport from '../Reports/QuoteReport';
import TaskReport from '../Reports/TaskReport';
import OpportunityQuoteExportReport from '../Reports/OpportunityQuoteExportReport';
import dayjs from 'dayjs';
import TimeEntryReport from '../Reports/TimeEntryReport';

//#region //TODO Mass update fields available
const massUpdateCapableFieldKeys = [
	{ label: 'Billing Account', value: 'Account' },
	{ label: 'Accounts', value: 'Accounts' },
	{ label: 'Contact', value: 'Contact' },
	{ label: 'Type', value: 'Type' },
	{ label: 'Source', value: 'Source' },
];

const defaultLoadData = {
	Status: '',
	Alias: '',
	Number: '',
	Account: '',
	Accounts: '',
	Contact: '',
	Amount: '',
	Contingency: '',
	Type: '',
	Source: '',
	Closing_Date: '',
	Description: '',
};

//#endregion

//#region //TODO Helper functions

//#endregion

const OpportunityForm = ({
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
	const [conversionState, conversionRequest] = useFormData();
	const [massUpdateFieldList, setMassUpdateFieldList] = useState([]);
	const requiredFields = useRef(columns.filter((column) => column.required));
	const [error, setError] = useState({});
	const [toastData, setToastData] = useState({});
	const [confirmationDialogOpen, setConfirmationDialogOpen] = useState(false);
	const [confirmationDialogData, setConfirmationDialogData] = useState({});
	const [timelineOpen, setTimelineOpen] = useState(false);
	const [tabValue, setTabValue] = useState('Notes');
	const [closedWonDialogOpen, setClosedWonDialogOpen] = useState(false);
	const [closedWonQuotes, setClosedWonQuotes] = useState([]);
	const [printData, setPrintData] = useState({});
	const [generateProposalDialogOpen, setGenerateProposalDialogOpen] =
		useState(false);
	const [voidDialogOpen, setVoidDialogOpen] = useState(false);
	const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
	const hasError = Object.keys(error).length > 0;
	const isVoided =
		state?.currentData?.Void_field === true ||
		state?.currentData?.Void_field === 'true';

	const [exportQuotesDialogOpen, setExportQuotesDialogOpen] = useState(false);

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
					href: baseUrl,
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
		//? Print Data updates
		setPrintData((old) => ({
			...old,
			Account: state?.currentData?.Account,
			Salesperson: state?.currentData?.Owner,
		}));

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

		if (state?.currentData?.Project) {
			const thisAlert = {
				id: 'CONVERTED_PROJECT',
				variant: 'filled',
				severity: 'info',
				action: (
					<Button color='inherit' size='small' onClick={openProjectInNewTab}>
						Go to {state.currentData.Project.display_value}
					</Button>
				),
				message: `${state.currentData.Name} was converted to Project ${state.currentData.Project.display_value}`,
			};

			setAlerts((old) =>
				old[thisAlert.id] ? old : { ...old, [thisAlert.id]: thisAlert }
			);
		}

		if (state?.currentData?.Service_Order) {
			const thisAlert = {
				id: 'CONVERTED_SERVICE_ORDER',
				variant: 'filled',
				severity: 'info',
				action: (
					<Button
						color='inherit'
						size='small'
						onClick={openServiceOrderInNewTab}>
						Go to {state.currentData.Service_Order.display_value}
					</Button>
				),
				message: `${state.currentData.Name} was converted to Service Order ${state.currentData.Service_Order.display_value}`,
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
	const onExportQuotes = () => {
		console.log('TODO: onExportQuotes');
	};

	const openProjectInNewTab = () => {
		setApplicationTabs((old) => [
			...old.map((o) => ({ ...o, active: false })),
			{
				uuid: uuidv4(),
				label: 'Project: ' + state.currentData.Project.display_value,
				type: 'form',
				id: state.currentData.Project.ID,
				name: 'Project',
				active: true,
			},
		]);
	};

	const openServiceOrderInNewTab = () => {
		setApplicationTabs((old) => [
			...old.map((o) => ({ ...o, active: false })),
			{
				uuid: uuidv4(),
				label:
					'Service Order: ' + state.currentData.Service_Order.display_value,
				type: 'form',
				id: state.currentData.Service_Order.ID,
				name: 'Service_Order',
				active: true,
			},
		]);
	};

	const onClosedWon = () => {
		//TODO Update closedWonQuotes with conversion requests;

		// setToastData({
		// 	message: 'Conversion process is untested - talk to Matt! Returning...',
		// });
		// return;

		if (
			state.currentData.Type !== 'Service' &&
			state.currentData.Type !== 'Service Contract'
		) {
			conversionRequest(
				'Conversion_Request',
				{
					Source_Form: 'Opportunity',
					Source_Record_ID: id,
					Destination_Form:
						state?.currentData?.Type === 'Box Sale'
							? 'Service_Order'
							: 'Project',
					Execute_Workflows: true,
				},
				({ Destination_Record_Name, Destination_Record_ID }) => {
					if (
						closedWonQuotes.length === 0 ||
						closedWonQuotes.filter((quote) => quote.Status !== 'Converted')
							.length === 0
					) {
						//Quotes have already been converted
						setClosedWonDialogOpen(false);
						mountData('Status', 'Closed Won');
						mountData('Converted_to_Project', true);
						mountData(
							state?.currentData?.Type === 'Box Sale'
								? 'Service_Order'
								: 'Project',
							{
								display_value: Destination_Record_Name,
								ID: Destination_Record_ID,
							}
						);
						return;
					}

					let _conversionData = closedWonQuotes
						.filter((quote) => quote.Status !== 'Converted')
						.map((quote, i) => ({
							Source_Form: 'Quote',
							Source_Record_ID: quote.ID,
							Destination_Form: 'Sales_Order',
							Execute_Workflows: i === closedWonQuotes.length - 1, //Execute workflows only when on last record in array
						}));
					conversionRequest('Conversion_Request', _conversionData, () => {
						setClosedWonDialogOpen(false);
						mountData('Status', 'Closed Won');
						mountData('Converted_to_Project', true);
						mountData(
							state?.currentData?.Type === 'Box Sale'
								? 'Service_Order'
								: 'Project',
							{
								display_value: Destination_Record_Name,
								ID: Destination_Record_ID,
							}
						);
					});
				}
			);
		} else {
			setClosedWonDialogOpen(false);
			mountData('Status', 'Closed Won');
		}
	};

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
				CustomFormActions={
					<CustomFormActions
						options={[
							{
								type: 'form',
								label: 'Export Quotes',
								onClick: () => setExportQuotesDialogOpen(true),
								Icon: FileDownload,
							},
							{
								type: 'form',
								label: 'Generate Proposal',
								onClick: () => setGenerateProposalDialogOpen(true),
								Icon: Print,
							},
							{
								type: 'void',
								label: isVoided ? 'Unvoid' : 'Void',
								onClick: () => setVoidDialogOpen(true),
								Icon: Block,
								disabled: !currentUserIsAdmin && isVoided,
								hidden: true,
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
				{!massUpdating ? (
					<StatusGraphic
						statuses={columns
							.filter((column) => column.valueKey === 'Status')[0]
							.options(state.currentData.Type)}
						value={state.currentData.Status}
						onChange={(statusText) => {
							if (statusText === 'Closed Won') {
								setClosedWonDialogOpen(true);
							} else {
								mountData('Status', statusText);
							}
						}}
						disabled={(params) =>
							Boolean(params === 'Closed Won' || params === 'Closed Lost')
						}
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
								hidden={massUpdating && !massUpdateFieldList.includes('Alias')}>
								<TextField
									label='Alias'
									value={state.currentData.Alias}
									helperText={
										error.Alias
											? 'Please enter a value for this required field'
											: ''
									}
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
								hidden={
									massUpdating && !massUpdateFieldList.includes('Amount')
								}>
								<TextField
									label='Amount'
									value={state.currentData.Amount}
									type='number'
									onChange={(e) => mountData('Amount', e.target.value)}
								/>
							</GridInputWrapper>
							<GridInputWrapper
								massUpdating={massUpdating}
								hidden={
									massUpdating && !massUpdateFieldList.includes('Contingency')
								}>
								<TextField
									label='Contingency'
									value={state.currentData.Contingency}
									type='number'
									onChange={(e) => mountData('Contingency', e.target.value)}
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
									massUpdating && !massUpdateFieldList.includes('Source')
								}>
								<TextField
									select
									label='Source'
									value={state.currentData.Source}
									onChange={(e) => mountData('Source', e.target.value)}>
									{columns
										.filter((column) => column.valueKey === 'Source')[0]
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
									massUpdating && !massUpdateFieldList.includes('Closing_Date')
								}>
								<TextFieldDateTime
									type='date'
									label='Closing Date'
									value={state.currentData.Closing_Date}
									onChange={(e) => mountData('Closing_Date', e)}
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
									onChange={(e) => mountData('Description', e.target.value)}
								/>
							</GridInputWrapper>
						</GridFormSectionWrapper>
					</ThemeCard>
				)}

				{/* Form Specific Data (e.g. table, graph, etc.) */}
				{massUpdating || !id ? null : (
					<GridInputWrapper>
						<ThemeCard header='Total Hours Quoted' sx={{ mt: 1 }}>
							<TableContainer component={Paper}>
								<Table sx={{ minWidth: 650 }} size='small'>
									<TableHead>
										<TableRow>
											<TableCell>Labor Category</TableCell>
											<TableCell align='right'>Estimated Hours</TableCell>
										</TableRow>
									</TableHead>
									<TableBody>
										<TableRow>
											<TableCell>Project Management</TableCell>
											<TableCell align='right'>
												{parseFloat(
													state.savedData.Estimated_Project_Management || 0
												)}
											</TableCell>
										</TableRow>
										<TableRow>
											<TableCell>Administration</TableCell>
											<TableCell align='right'>
												{parseFloat(
													state.savedData.Estimated_Administration || 0
												)}
											</TableCell>
										</TableRow>
										<TableRow>
											<TableCell>Design & Engineering</TableCell>
											<TableCell align='right'>
												{parseFloat(
													state.savedData.Estimated_Design_and_Engineering || 0
												)}
											</TableCell>
										</TableRow>
										<TableRow>
											<TableCell>Drafting</TableCell>
											<TableCell align='right'>
												{parseFloat(state.savedData.Estimated_Drafting || 0)}
											</TableCell>
										</TableRow>
										<TableRow>
											<TableCell>Audio Profile</TableCell>
											<TableCell align='right'>
												{parseFloat(
													state.savedData.Estimated_Audio_Profile || 0
												)}
											</TableCell>
										</TableRow>
										<TableRow>
											<TableCell>Programming</TableCell>
											<TableCell align='right'>
												{parseFloat(state.savedData.Estimated_Programming || 0)}
											</TableCell>
										</TableRow>
										<TableRow>
											<TableCell>Rack Build</TableCell>
											<TableCell align='right'>
												{parseFloat(state.savedData.Estimated_Rack_Build || 0)}
											</TableCell>
										</TableRow>
										<TableRow>
											<TableCell>QC In House</TableCell>
											<TableCell align='right'>
												{parseFloat(state.savedData.Estimated_QC_In_House || 0)}
											</TableCell>
										</TableRow>
										<TableRow>
											<TableCell>Installation</TableCell>
											<TableCell align='right'>
												{parseFloat(
													state.savedData.Estimated_Installation || 0
												)}
											</TableCell>
										</TableRow>
										<TableRow>
											<TableCell>Travel</TableCell>
											<TableCell align='right'>
												{parseFloat(state.savedData.Estimated_Travel || 0)}
											</TableCell>
										</TableRow>
										<TableRow>
											<TableCell>QC On Site</TableCell>
											<TableCell align='right'>
												{parseFloat(state.savedData.Estimated_QC_On_Site || 0)}
											</TableCell>
										</TableRow>
										<TableRow>
											<TableCell>Client Training</TableCell>
											<TableCell align='right'>
												{parseFloat(
													state.savedData.Estimated_Client_Training || 0
												)}
											</TableCell>
										</TableRow>
										<TableRow>
											<TableCell>
												<Typography sx={{ fontWeight: 'bold' }}>
													Totals
												</Typography>
											</TableCell>
											<TableCell align='right'>
												{parseFloat(state.savedData.Total_Estimated_Hours || 0)}
											</TableCell>
										</TableRow>
									</TableBody>
								</Table>
							</TableContainer>
						</ThemeCard>
					</GridInputWrapper>
				)}

				{/* Tabbed Section */}
				{id && !massUpdating ? (
					<TabbedSection>
						<TabbedSectionHeader
							value={tabValue}
							onTabChanged={(e, tabIndex) => setTabValue(tabIndex)}>
							<Tab label='Notes' value='Notes' />
							<Tab label='Emails' value='Emails' />
							<Tab label='Attachments' value='Attachments' />
							<Tab label='Quotes' value='Quotes' />
							<Tab label='Tasks' value='Tasks' />
							<Tab label='Time Entries' value='Time Entries' />
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
							) : tabValue === 'Quotes' ? (
								<QuoteReport
									variant='tab'
									maxHeight={600}
									forcedCriteria={`Void_field=false && Reference==${
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
							) : tabValue === 'Time Entries' ? (
								<TimeEntryReport
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

			{/* Closed Won Dialog */}
			<OpportunityClosedWonDialog
				title={state?.currentData?.Name}
				open={closedWonDialogOpen}
				onClose={() => setClosedWonDialogOpen(false)}
				onClosedWon={onClosedWon}>
				<Box>
					<Typography sx={{ p: 1 }}>
						Please select Quotes that you would like to convert to Sales Orders.
						Also, please note that you can select Quotes that have already been
						converted or select no Quotes at all. It'll all be ok!
					</Typography>
					<CustomTable
						formName='Quote'
						defaultSortByColumn='Number'
						defaultCriteria={`Void_field=false && Reference==${
							state.savedData.Reference ? state.savedData.Reference.ID : '0'
						}${
							state.savedData.Enable_Phases &&
							state.savedData.Enable_Phases !== 'false'
								? `&& Phase==${id}`
								: ''
						}`}
						overrideHeight={600}
						disableFilters
						onChange={setClosedWonQuotes}
						hideToolbar
					/>
				</Box>
			</OpportunityClosedWonDialog>

			{/* Quote Export */}
			<RenderPopup
				title={
					<Box sx={{ display: 'flex' }}>
						<DatabaseDefaultIcon form={'Quote'} sx={{ mr: 0.75 }} />
						<Typography component='span'>
							Export Quotes for{' '}
							<Typography component='span' sx={{ fontWeight: 'bold' }}>
								{state?.currentData?.Name}
							</Typography>
						</Typography>
					</Box>
				}
				open={exportQuotesDialogOpen}
				onClose={() => setExportQuotesDialogOpen(false)}>
				<OpportunityQuoteExportReport
					maxHeight={maxHeight - 51 - 16}
					exportFilename={`${
						state.currentData.Name
					} Quotes Export ${dayjs().format('MM-DD-YY')}`}
					referenceId={state?.currentData?.Reference?.ID}
					phaseId={
						state?.currentData?.Enable_Phases === 'true' ||
						state?.currentData?.Enable_Phases === true
							? state?.currentData?.ID
							: null
					}
					variant='modal'
				/>
			</RenderPopup>

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

			{/* Form specific children (e.g. Email, Print Wizard) */}
			<GenerateProposalDialog
				title={state?.currentData?.Name}
				open={generateProposalDialogOpen}
				onClose={() => setGenerateProposalDialogOpen(false)}
				printData={printData}>
				<GridFormSectionWrapper>
					<Grid item xs={12}>
						<TextField
							label='Enter a Salesperson Name'
							value={printData.Salesperson}
							onChange={(e) =>
								setPrintData((old) => ({ ...old, Salesperson: e.target.value }))
							}
						/>
					</Grid>
					<Grid item xs={12}>
						<LookupField2
							name='Account'
							label='Select an Account'
							defaultSortByColumn='Name'
							reportName='Accounts_Report'
							defaultValue={printData.Account}
							onChange={(e) => setPrintData((old) => ({ ...old, Account: e }))}
							endAdornment={
								<IconButton edge='end' size='large'>
									<DatabaseDefaultIcon form='Account' />
								</IconButton>
							}
							overrideDialogZindex
						/>
					</Grid>
				</GridFormSectionWrapper>
			</GenerateProposalDialog>

			{/* Toast messaging in lower right */}
			<ToastMessage data={toastData} />
			<SaveManager formDataState={state} />
		</Box>
	);
};

OpportunityForm.propTypes = {
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

OpportunityForm.defaultProps = {
	loadData: {},
	massUpdating: false,
	massUpdateRecordIds: [],
};

const Wrapper = (props) => {
	return (
		<React.Suspense fallback={<ContextCircularProgressLoader />}>
			<OpportunityForm {...props} />
		</React.Suspense>
	);
};

export default Wrapper;
