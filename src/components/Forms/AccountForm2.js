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
	Grid,
	IconButton,
	ListItemIcon,
	ListItemText,
	Menu,
	MenuItem,
	Paper,
	Stack,
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
import ConfirmationDialog from '../Helpers/ConfirmationDialog';
import TextFieldDateTime from '../FormControls/TextFieldDateTime';
import WizardDialog from '../Wizards/WizardDialog';
import WizardStep from '../Wizards/WizardStep';
import ContextCircularProgressLoader from '../Loaders/ContextCircularProgressLoader';
import SkeletonForm from '../Loaders/SkeletonForm';
import ResponsiveDialog from '../Modals/ResponsiveDialog';

import NoteReport from '../Reports/NoteReport';
import EmailReport from '../Reports/EmailReport';
import AttachmentReport from '../Reports/AttachmentReport';
import ContactReport from '../Reports/ContactReport';
import ServiceOrderReport from '../Reports/ServiceOrderReport';
import QuoteReport from '../Reports/QuoteReport';
import OpportunityReport from '../Reports/OpportunityReport';
import SalesOrderReport from '../Reports/SalesOrderReport';
import ProjectReport from '../Reports/ProjectReport';
import ServiceContractReport from '../Reports/ServiceContractReport';
import SubscriptionReport from '../Reports/SubscriptionReport';
import CustomerAssetReport from '../Reports/CustomerAssetReport';
import CustomerRoomReport from '../Reports/CustomerRoomReport';

//#region //TODO Mass update fields available
const massUpdateCapableFieldKeys = [
	{ label: 'Owner', value: 'Owner' },
	{ label: 'Status', value: 'Status' },
	{ label: 'Industry', value: 'Industry' },
	{ label: 'Primary Contact', value: 'Primary_Contact' },
	{ label: 'Tax Information', value: 'Tax Information' },
];

const formDef = {
	Name: {
		field: 'Name',
		headerName: 'Name',
		required: true,
		enableMassUpdate: false,
		defaultValue: '',
	},
	Number: {
		defaultValue: '',
	},
	Owner: {
		defaultValue: '',
	},

	Status: {
		defaultValue: '',
	},
	Industry: {
		defaultValue: '',
	},
	Primary_Contact: {
		defaultValue: '',
	},
	Note: {
		defaultValue: '',
	},
	Phone_Number: {
		defaultValue: '',
	},

	Shipping_Address_Street: {
		defaultValue: '',
	},
	Shipping_Address_City: {
		defaultValue: '',
	},
	Shipping_Address_State: {
		defaultValue: '',
	},
	Shipping_Address_Zip_Code: {
		defaultValue: '',
	},

	Billing_Address_Street: {
		defaultValue: '',
	},
	Billing_Address_City: {
		defaultValue: '',
	},
	Billing_Address_State: {
		defaultValue: '',
	},
	Billing_Address_Zip_Code: {
		defaultValue: '',
	},

	Copy_Shipping_Address: {
		defaultValue: true,
	},
	Tax_Goods: {
		defaultValue: false,
	},
	Tax_Services: {
		defaultValue: false,
	},
	Tax_Freight: {
		defaultValue: false,
	},
	Tax_Rate: {
		defaultValue: 0,
	},
	Tax_Exempt: {
		defaultValue: false,
	},
	Tax_Exempt_Certification: {
		defaultValue: '',
	},
	Out_of_State: {
		defaultValue: false,
	},

	Has_Special_Instructions: {
		defaultValue: false,
	},
	Special_Instructions: '',
};

const defaultLoadData = {
	Name: '',
	Number: '',
	Owner: '',

	Status: '',
	Industry: '',
	Primary_Contact: '',
	Note: '',
	Phone_Number: '',

	Shipping_Address_Street: '',
	Shipping_Address_City: '',
	Shipping_Address_State: '',
	Shipping_Address_Zip_Code: '',

	Billing_Address_Street: '',
	Billing_Address_City: '',
	Billing_Address_State: '',
	Billing_Address_Zip_Code: '',

	Copy_Shipping_Address: true,
	Tax_Goods: false,
	Tax_Services: false,
	Tax_Freight: false,
	Tax_Rate: 0.0,
	Tax_Exempt: false,
	Tax_Exempt_Certification: '',
	Out_of_State: false,

	Has_Special_Instructions: false,
	Special_Instructions: '',
};

//#endregion

//#region //TODO Helper functions

//#endregion

//#region //TODO Custom actions in form toolbar
const CustomFormActions = ({
	currentData,
	currentUser,
	onCopyDirectUrl,
	onOpenPrintWizard,
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
	onOpenPrintWizard: PropTypes.func,
	onOpenSendEmail: PropTypes.func,
	onVoid: PropTypes.func,
	onDelete: PropTypes.func,
};
//#endregion

const AccountForm = ({
	formName, //Used to require fewer edits between template and specific forms
	setAppBreadcrumb, //If form is fullscreen - when rendered from a table row, this won't be defined
	databaseInformationResource,
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
	const [databaseInformation, setDatabaseInformation] = useState(
		databaseInformationResource ? databaseInformationResource.read() : {}
	);
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
	const [wizard, setWizard] = useState({ open: false, activeStep: 0 });
	const hasError = Object.keys(error)?.length > 0;

	useEffect(() => {
		console.log('databaseInformation', databaseInformation);
	}, [databaseInformation]);

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
		if (onChange) {
			onChange(state.savedData);
		}

		console.log('AccountForm state change', state);
		console.log('massUpdateFieldList', massUpdateFieldList);

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
					updateRecord('Accounts_Report', id, state.data);
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
					updateRecord('Accounts_Report', id, state.data);
				} else if (massUpdating) {
					//? Filter out keys in currentData that are not part of the massUpdate
					let _keysToOmit = [];
					Object.keys(state?.currentData).forEach((key) => {
						if (!massUpdateFieldList.includes(key)) {
							_keysToOmit.push(key);
						}
					});

					console.log(
						'modified massUpdate object',
						omit(state.currentData, _keysToOmit)
					);

					return;
					massUpdateRecords(
						'Accounts_Report',
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
		resetData();
		setError({});
		setData(state.savedData);
		setMassUpdateFieldList([]);
	};

	const isValid = () => {
		let _error = {};
		const _requiredFields = massUpdating
			? requiredFields.current.filter((field) =>
					massUpdateFieldList.includes(field.valueKey)
			  )
			: requiredFields.current;

		console.log('errorCheck requiredFields', _requiredFields);

		if (_requiredFields.length > 0) {
			_requiredFields.forEach((field) => {
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

	const getDrawerTitle = (formName) => {
		//Edit
		return (
			<Box sx={{ display: 'flex' }}>
				<DatabaseDefaultIcon form={formName} sx={{ mr: 0.75 }} />
				<Typography component='span' sx={{ mr: 0.75 }}>{`${plurifyFormName(
					formName.replaceAll('_', ' ')
				)} for `}</Typography>
				<Typography component='span' sx={{ fontWeight: 'bold' }}>
					{state.currentData.Name}
				</Typography>
			</Box>
		);
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
				CustomFormActions={
					<CustomFormActions
						currentData={state.currentData}
						currentUser={currentUser}
						onCopyDirectUrl={onCopyDirectUrl}
						onOpenPrintWizard={onOpenPrintWizard}
						onOpenSendEmail={onOpenSendEmail}
						onVoid={onVoid}
						onDelete={onDelete}
					/>
				}>
				{id && databaseInformation ? (
					<Grid container spacing={{ xs: 0, md: 2 }}>
						<GridInputWrapper>
							<ThemeCard header='Financial Summary'>
								<Stack
									alignItems='flex-start'
									justifyContent='flex-start'
									spacing={1}>
									<Button
										onClick={() =>
											setRenderPopupData({
												title: getDrawerTitle('Quote'),
												children: (
													<QuoteReport
														maxHeight={maxHeight}
														ignoreDefaultView
														forcedCriteria={`(Account == ${id})`}
														loadData={{
															Account: {
																ID: id,
																display_value: state.currentData.Name,
															},
															Owner: {
																ID: currentUser.ID,
																display_value: currentUser.Full_Name,
															},
														}}
													/>
												),
												onClose: () => setRenderPopupData({}),
											})
										}
										startIcon={<DatabaseDefaultIcon form='Quote' />}
										sx={
											parseInt(databaseInformation.Account_Quotes_Open_Count) >
											0
												? { color: 'success.main' }
												: { color: 'text.secondary' }
										}
										variant='text'>
										<Typography
											sx={{ color: 'text.secondary' }}
											variant='inherit'>{`Quotes: ${databaseInformation.Account_Quotes_Open_Count} Open / ${databaseInformation.Account_Quotes_Count} Total`}</Typography>
									</Button>
									<Button
										onClick={() =>
											setRenderPopupData({
												title: getDrawerTitle('Opportunity'),
												children: (
													<OpportunityReport
														maxHeight={maxHeight}
														ignoreDefaultView
														forcedCriteria={`(Account == ${id} || Accounts.contains(${id}))`}
														loadData={{
															Account: {
																ID: id,
																display_value: state.currentData.Name,
															},
															Accounts: [
																{
																	ID: id,
																	display_value: state.currentData.Name,
																},
															],
															Owner: currentUser.Full_Name,
														}}
													/>
												),
												onClose: () => setRenderPopupData({}),
											})
										}
										startIcon={<DatabaseDefaultIcon form='Opportunity' />}
										sx={
											parseInt(
												databaseInformation.Account_Opportunities_Open_Count
											) > 0
												? { color: 'success.main' }
												: { color: 'text.secondary' }
										}
										variant='text'>
										<Typography
											sx={{ color: 'text.secondary' }}
											variant='inherit'>{`Opportunities: ${databaseInformation.Account_Opportunities_Open_Count} Open / ${databaseInformation.Account_Opportunities_Count} Total`}</Typography>
									</Button>
									<Button
										onClick={() =>
											setRenderPopupData({
												title: getDrawerTitle('Sales_Order'),
												children: (
													<SalesOrderReport
														maxHeight={maxHeight}
														ignoreDefaultView
														forcedCriteria={`(Account == ${id})`}
														loadData={{
															Account: {
																ID: id,
																display_value: state.currentData.Name,
															},
															Owner: {
																ID: currentUser.ID,
																display_value: currentUser.Full_Name,
															},
														}}
													/>
												),
												onClose: () => setRenderPopupData({}),
											})
										}
										startIcon={<DatabaseDefaultIcon form='Sales_Order' />}
										sx={
											parseInt(
												databaseInformation.Account_Sales_Orders_Open_Count
											) > 0
												? { color: 'success.main' }
												: { color: 'text.secondary' }
										}
										variant='text'>
										<Typography
											sx={{ color: 'text.secondary' }}
											variant='inherit'>{`Sales Orders: ${databaseInformation.Account_Sales_Orders_Open_Count} Open / ${databaseInformation.Account_Sales_Orders_Count} Total`}</Typography>
									</Button>
									<Button
										onClick={() =>
											setRenderPopupData({
												title: getDrawerTitle('Project'),
												children: (
													<ProjectReport
														maxHeight={maxHeight}
														ignoreDefaultView
														forcedCriteria={`(Account == ${id} || Accounts.contains(${id}))`}
														loadData={{
															Account: {
																ID: id,
																display_value: state.currentData.Name,
															},
															Accounts: [
																{
																	ID: id,
																	display_value: state.currentData.Name,
																},
															],
														}}
													/>
												),
												onClose: () => setRenderPopupData({}),
											})
										}
										startIcon={<DatabaseDefaultIcon form='Project' />}
										sx={
											parseInt(
												databaseInformation.Account_Projects_Open_Count
											) > 0
												? { color: 'success.main' }
												: { color: 'text.secondary' }
										}
										variant='text'>
										<Typography
											sx={{ color: 'text.secondary' }}
											variant='inherit'>{`Projects: ${databaseInformation.Account_Projects_Open_Count} Open / ${databaseInformation.Account_Projects_Count} Total`}</Typography>
									</Button>
								</Stack>
							</ThemeCard>
						</GridInputWrapper>
						<GridInputWrapper>
							<ThemeCard header='Service Summary' sx={{ mt: { sm: 1, md: 0 } }}>
								<Stack
									alignItems='flex-start'
									justifyContent='flex-start'
									spacing={1}>
									<Button
										onClick={() =>
											setRenderPopupData({
												title: getDrawerTitle('Service_Order'),
												children: (
													<ServiceOrderReport
														maxHeight={maxHeight}
														ignoreDefaultView
														forcedCriteria={`Account == ${id}`}
														loadData={{
															Account: {
																display_value: state.currentData.Name,
																ID: id,
															},
														}}
													/>
												),
												onClose: () => setRenderPopupData({}),
											})
										}
										startIcon={<DatabaseDefaultIcon form='Service_Order' />}
										sx={
											parseInt(
												databaseInformation.Account_Service_Orders_Open_Count
											) > 0
												? { color: 'success.main' }
												: { color: 'text.secondary' }
										}
										variant='text'>
										<Typography
											sx={{ color: 'text.secondary' }}
											variant='inherit'>{`Service Orders: ${databaseInformation.Account_Service_Orders_Open_Count} Open / ${databaseInformation.Account_Service_Orders_Count} Total`}</Typography>
									</Button>
									<Button
										onClick={() =>
											setRenderPopupData({
												title: getDrawerTitle('Service_Contract'),
												children: (
													<ServiceContractReport
														maxHeight={maxHeight}
														ignoreDefaultView
														forcedCriteria={`(Billing_Account == ${id} || Accounts.contains(${id}))`}
														loadData={{
															Billing_Account: {
																ID: id,
																display_value: state.currentData.Name,
															},
															Accounts: [
																{
																	ID: id,
																	display_value: state.currentData.Name,
																},
															],
														}}
													/>
												),
												onClose: () => setRenderPopupData({}),
											})
										}
										startIcon={<DatabaseDefaultIcon form='Service_Contract' />}
										sx={
											parseInt(
												databaseInformation.Account_Service_Contracts_Open_Count
											) > 0
												? { color: 'success.main' }
												: { color: 'text.secondary' }
										}
										variant='text'>
										<Typography
											sx={{ color: 'text.secondary' }}
											variant='inherit'>{`Service Contracts: ${databaseInformation.Account_Service_Contracts_Open_Count} Active / ${databaseInformation.Account_Service_Contracts_Count} Total`}</Typography>
									</Button>
									<Button
										onClick={() =>
											setRenderPopupData({
												title: getDrawerTitle('Subscription'),
												children: (
													<SubscriptionReport
														maxHeight={maxHeight}
														ignoreDefaultView
														forcedCriteria={`Accounts.contains(${id})`}
														loadData={{
															Accounts: [
																{
																	display_value: state.currentData.Name,
																	ID: id,
																},
															],
														}}
													/>
												),
												onClose: () => setRenderPopupData({}),
											})
										}
										startIcon={<DatabaseDefaultIcon form='Subscription' />}
										sx={
											parseInt(
												databaseInformation.Account_Subscriptions_Open_Count
											) > 0
												? { color: 'success.main' }
												: { color: 'text.secondary' }
										}
										variant='text'>
										<Typography
											sx={{ color: 'text.secondary' }}
											variant='inherit'>{`Subscriptions: ${databaseInformation.Account_Subscriptions_Open_Count} Active / ${databaseInformation.Account_Subscriptions_Count} Total`}</Typography>
									</Button>
									<Button
										onClick={() =>
											setRenderPopupData({
												title: getDrawerTitle('Customer_Asset'),
												children: (
													<CustomerAssetReport
														maxHeight={maxHeight}
														ignoreDefaultView
														forcedCriteria={`Account == ${id}`}
														loadData={{
															Account: {
																display_value: state.currentData.Name,
																ID: id,
															},
														}}
													/>
												),
												onClose: () => setRenderPopupData({}),
											})
										}
										startIcon={<DatabaseDefaultIcon form='Customer_Asset' />}
										sx={{
											color:
												parseInt(
													databaseInformation.Account_Customer_Assets_Count
												) > 0
													? 'success.main'
													: 'text.secondary',
										}}
										variant='text'>
										<Typography
											sx={{ color: 'text.secondary' }}
											variant='inherit'>{`Assets: ${databaseInformation.Account_Customer_Assets_Count} Total`}</Typography>
									</Button>
									<Button
										onClick={() =>
											setRenderPopupData({
												title: getDrawerTitle('Customer_Room'),
												children: (
													<CustomerRoomReport
														maxHeight={maxHeight}
														ignoreDefaultView
														forcedCriteria={`Account == ${id}`}
														loadData={{
															Account: {
																display_value: state.currentData.Name,
																ID: id,
															},
														}}
													/>
												),
												onClose: () => setRenderPopupData({}),
											})
										}
										startIcon={<DatabaseDefaultIcon form='Customer_Room' />}
										sx={{
											color:
												parseInt(
													databaseInformation.Account_Customer_Rooms_Count
												) > 0
													? 'success.main'
													: 'text.secondary',
										}}
										variant='text'>
										<Typography
											sx={{ color: 'text.secondary' }}
											variant='inherit'>{`Rooms: ${databaseInformation.Account_Customer_Rooms_Count} Total`}</Typography>
									</Button>
								</Stack>
							</ThemeCard>
						</GridInputWrapper>
					</Grid>
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
						}
						sx={{ mt: 1 }}>
						<GridFormSectionWrapper>
							<GridInputWrapper
								massUpdating={massUpdating}
								hidden={massUpdating && !massUpdateFieldList.includes('Name')}>
								<TextField
									label='Name'
									value={state.currentData.Name}
									helperText={
										error.Name
											? 'Please enter a value for this required field'
											: `${state.currentData.Name?.length || 0}/41 characters`
									}
									required
									error={error.Name}
									onChange={(e) =>
										mountData(
											'Name',
											e.target.value.length <= 41
												? e.target.value
												: e.target.value.substring(0, 41)
										)
									}
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
								hidden={
									massUpdating && !massUpdateFieldList.includes('Status')
								}>
								<TextField
									select
									label='Status'
									value={state.currentData.Status}
									required
									error={error.Status}
									helperText={
										error.Status
											? 'Please enter a value for this required field'
											: ''
									}
									onChange={(e) => mountData('Status', e.target.value)}>
									{columns
										.filter((column) => column.valueKey === 'Status')[0]
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
									massUpdating && !massUpdateFieldList.includes('Industry')
								}>
								<AsynchronousSelect2
									name='Industry'
									formName='Account_Industry'
									reportName='Account_Industries'
									displayValueKey='Name'
									defaultValue={state.currentData.Industry}
									onChange={(e) => mountData('Industry', e)}
								/>
							</GridInputWrapper>
							<GridInputWrapper
								massUpdating={massUpdating}
								hidden={
									massUpdating &&
									!massUpdateFieldList.includes('Primary_Contact')
								}>
								<LookupField2
									name='Primary_Contact'
									formName='Contact'
									defaultSortByColumn='First_Name'
									reportName='Contacts'
									defaultValue={state.currentData.Primary_Contact}
									onChange={(e) => mountData('Primary_Contact', e)}
									endAdornment={
										<IconButton edge='end' size='large'>
											<DatabaseDefaultIcon form='Contact' />
										</IconButton>
									}
								/>
							</GridInputWrapper>
							<GridInputWrapper
								massUpdating={massUpdating}
								hidden={massUpdating && !massUpdateFieldList.includes('Note')}>
								<TextField
									label='Note'
									value={state.currentData.Note}
									multiline
									onChange={(e) => mountData('Note', e.target.value)}
								/>
							</GridInputWrapper>
							<GridInputWrapper
								massUpdating={massUpdating}
								hidden={
									massUpdating && !massUpdateFieldList.includes('Phone_Number')
								}>
								<TextField
									label='Phone Number'
									value={state.currentData.Phone_Number}
									multiline
									onChange={(e) => mountData('Phone_Number', e.target.value)}
								/>
							</GridInputWrapper>

							<GridInputWrapper
								massUpdating={massUpdating}
								hidden={
									massUpdating &&
									!massUpdateFieldList.includes('Shipping Address')
								}>
								<ThemeCard header='Shipping Address' elevation={8}>
									<Grid container spacing={2}>
										<Grid item xs={12}>
											<TextField
												label='Street'
												value={state.currentData.Shipping_Address_Street}
												multiline
												onChange={(e) => {
													mountData('Shipping_Address_Street', e.target.value);
													if (state.currentData.Copy_Shipping_Address) {
														mountData('Billing_Address_Street', e.target.value);
													}
												}}
												error={error.Shipping_Address_Street}
												helperText={
													error.Shipping_Address_Street
														? 'Please enter a value for this required field'
														: ''
												}
												required
											/>
										</Grid>
										<Grid item xs={12}>
											<TextField
												label='City'
												value={state.currentData.Shipping_Address_City}
												onChange={(e) => {
													mountData('Shipping_Address_City', e.target.value);
													if (state.currentData.Copy_Shipping_Address) {
														mountData('Billing_Address_City', e.target.value);
													}
												}}
												error={error.Shipping_Address_City}
												helperText={
													error.Shipping_Address_City
														? 'Please enter a value for this required field'
														: ''
												}
												required
											/>
										</Grid>
										<Grid item xs={12}>
											<TextField
												label='State'
												value={state.currentData.Shipping_Address_State}
												onChange={(e) => {
													mountData('Shipping_Address_State', e.target.value);
													if (state.currentData.Copy_Shipping_Address) {
														mountData('Billing_Address_State', e.target.value);
													}
												}}
												error={error.Shipping_Address_State}
												helperText={
													error.Shipping_Address_State
														? 'Please enter a value for this required field'
														: ''
												}
												required
											/>
										</Grid>
										<Grid item xs={12}>
											<TextField
												label='Zip Code'
												value={state.currentData.Shipping_Address_Zip_Code}
												onChange={(e) => {
													mountData(
														'Shipping_Address_Zip_Code',
														e.target.value
													);
													if (state.currentData.Copy_Shipping_Address) {
														mountData(
															'Billing_Address_Zip_Code',
															e.target.value
														);
													}
												}}
												error={error.Shipping_Address_Zip_Code}
												helperText={
													error.Shipping_Address_Zip_Code
														? 'Please enter a value for this required field'
														: ''
												}
												required
											/>
										</Grid>
									</Grid>
								</ThemeCard>
							</GridInputWrapper>

							<GridInputWrapper
								massUpdating={massUpdating}
								hidden={
									massUpdating &&
									!massUpdateFieldList.includes('Billing Address')
								}>
								<ThemeCard
									header='Billing Address'
									elevation={8}
									headerButtons={[
										<FormControlLabel
											key='1'
											control={
												<Checkbox
													checked={state.currentData.Copy_Shipping_Address}
													onChange={(e) => {
														mountData(
															'Copy_Shipping_Address',
															e.target.checked
														);
														if (e.target.checked) {
															mountData(
																'Billing_Address_Street',
																state.currentData.Shipping_Address_Street
															);
															mountData(
																'Billing_Address_City',
																state.currentData.Shipping_Address_City
															);
															mountData(
																'Billing_Address_State',
																state.currentData.Shipping_Address_State
															);
															mountData(
																'Billing_Address_Zip_Code',
																state.currentData.Shipping_Address_Zip_Code
															);
														} else {
															mountData('Billing_Address_Street', '');
															mountData('Billing_Address_City', '');
															mountData('Billing_Address_State', '');
															mountData('Billing_Address_Zip_Code', '');
														}
													}}
												/>
											}
											label='Copy Shipping Address'
										/>,
									]}>
									<Grid container spacing={2}>
										<Grid item xs={12}>
											<TextField
												label='Street'
												value={state.currentData.Billing_Address_Street}
												multiline
												onChange={(e) =>
													mountData('Billing_Address_Street', e.target.value)
												}
												disabled={state.currentData.Copy_Shipping_Address}
											/>
										</Grid>
										<Grid item xs={12}>
											<TextField
												label='City'
												value={state.currentData.Billing_Address_City}
												onChange={(e) =>
													mountData('Billing_Address_City', e.target.value)
												}
												disabled={state.currentData.Copy_Shipping_Address}
											/>
										</Grid>
										<Grid item xs={12}>
											<TextField
												label='State'
												value={state.currentData.Billing_Address_State}
												onChange={(e) =>
													mountData('Billing_Address_State', e.target.value)
												}
												disabled={state.currentData.Copy_Shipping_Address}
											/>
										</Grid>
										<Grid item xs={12}>
											<TextField
												label='Zip Code'
												value={state.currentData.Billing_Address_Zip_Code}
												onChange={(e) =>
													mountData('Billing_Address_Zip_Code', e.target.value)
												}
												disabled={state.currentData.Copy_Shipping_Address}
											/>
										</Grid>
									</Grid>
								</ThemeCard>
							</GridInputWrapper>

							<GridInputWrapper
								massUpdating={massUpdating}
								hidden={
									massUpdating &&
									!massUpdateFieldList.includes('Tax Information')
								}>
								<ThemeCard header='Tax Information' elevation={8}>
									<Grid container spacing={2}>
										<Grid item xs={12}>
											<FormControlLabel
												control={
													<Checkbox
														checked={state.currentData.Tax_Goods}
														onChange={(e) => {
															mountData('Tax_Goods', e.target.checked);
															if (
																e.target.checked &&
																state.currentData.Tax_Exempt
															) {
																mountData('Tax_Exempt', false);
															}
															if (
																e.target.checked &&
																state.currentData.Out_of_State
															) {
																mountData('Out_of_State', false);
															}
														}}
														disabled={
															state.currentData.Tax_Exempt ||
															state.currentData.Out_of_State
														}
													/>
												}
												label='Tax Goods'
											/>
											<FormControlLabel
												control={
													<Checkbox
														checked={state.currentData.Tax_Services}
														onChange={(e) => {
															mountData('Tax_Services', e.target.checked);
															if (
																e.target.checked &&
																state.currentData.Tax_Exempt
															) {
																mountData('Tax_Exempt', false);
															}
															if (
																e.target.checked &&
																state.currentData.Out_of_State
															) {
																mountData('Out_of_State', false);
															}
														}}
														disabled={
															state.currentData.Tax_Exempt ||
															state.currentData.Out_of_State
														}
													/>
												}
												label='Tax Services'
											/>
											<FormControlLabel
												control={
													<Checkbox
														checked={state.currentData.Tax_Freight}
														onChange={(e) => {
															mountData('Tax_Freight', e.target.checked);
															if (
																e.target.checked &&
																state.currentData.Tax_Exempt
															) {
																mountData('Tax_Exempt', false);
															}
															if (
																e.target.checked &&
																state.currentData.Out_of_State
															) {
																mountData('Out_of_State', false);
															}
														}}
														disabled={
															state.currentData.Tax_Exempt ||
															state.currentData.Out_of_State
														}
													/>
												}
												label='Tax Freight'
											/>

											{state.currentData.Tax_Goods ||
											state.currentData.Tax_Services ||
											state.currentData.Tax_Freight ? (
												<TextField
													label='Tax Rate'
													value={state.currentData.Tax_Rate}
													type='number'
													onChange={(e) =>
														mountData('Tax_Rate', e.target.value)
													}
												/>
											) : null}
										</Grid>

										<Grid item xs={12}>
											<FormControlLabel
												control={
													<Checkbox
														checked={state.currentData.Tax_Exempt}
														onChange={(e) => {
															mountData('Tax_Exempt', e.target.checked);
															if (
																e.target.checked &&
																state.currentData.Tax_Goods
															) {
																mountData('Tax_Goods', false);
															}
															if (
																e.target.checked &&
																state.currentData.Tax_Services
															) {
																mountData('Tax_Services', false);
															}
															if (
																e.target.checked &&
																state.currentData.Tax_Freight
															) {
																mountData('Tax_Freight', false);
															}
															if (
																e.target.checked &&
																state.currentData.Out_of_State
															) {
																mountData('Out_of_State', false);
															}
														}}
														disabled={
															state.currentData.Tax_Goods ||
															state.currentData.Tax_Services ||
															state.currentData.Tax_Freight ||
															state.currentData.Out_of_State
														}
													/>
												}
												label='Tax Exempt'
											/>
											{state.currentData.Tax_Exempt ? (
												<TextField
													label='Tax Exempt Cert#'
													value={state.currentData.Tax_Exempt_Certification}
													onChange={(e) =>
														mountData(
															'Tax_Exempt_Certification',
															e.target.value
														)
													}
												/>
											) : null}
										</Grid>
										<Grid item xs={12}>
											<FormControlLabel
												control={
													<Checkbox
														checked={state.currentData.Out_of_State}
														onChange={(e) => {
															mountData('Out_of_State', e.target.checked);
															if (
																e.target.checked &&
																state.currentData.Tax_Goods
															) {
																mountData('Tax_Goods', false);
															}
															if (
																e.target.checked &&
																state.currentData.Tax_Services
															) {
																mountData('Tax_Services', false);
															}
															if (
																e.target.checked &&
																state.currentData.Tax_Freight
															) {
																mountData('Tax_Freight', false);
															}
															if (
																e.target.checked &&
																state.currentData.Tax_Exempt
															) {
																mountData('Tax_Exempt', false);
															}
														}}
														disabled={
															state.currentData.Tax_Goods ||
															state.currentData.Tax_Services ||
															state.currentData.Tax_Freight ||
															state.currentData.Tax_Exempt
														}
													/>
												}
												label='Out of State'
											/>
										</Grid>
									</Grid>
								</ThemeCard>
							</GridInputWrapper>

							<GridInputWrapper
								massUpdating={massUpdating}
								hidden={
									massUpdating &&
									!massUpdateFieldList.includes('Special Instructions')
								}>
								<ThemeCard header='Special Instructions' elevation={8}>
									<Grid container spacing={2}>
										<Grid item xs={12}>
											<FormControlLabel
												control={
													<Checkbox
														checked={state.currentData.Has_Special_Instructions}
														onChange={(e) =>
															mountData(
																'Has_Special_Instructions',
																e.target.checked
															)
														}
													/>
												}
												label='Special Instructions'
											/>

											{state.currentData.Has_Special_Instructions ? (
												<TextField
													label='Special Instructions'
													value={
														state.data['Special_Instructions'] ||
														state.savedData['Special_Instructions']
													}
													multiline
													onChange={(e) =>
														mountData('Special_Instructions', e.target.value)
													}
												/>
											) : null}
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
							<Tab label='Contacts' value='Contacts' />
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
							) : tabValue === 'Contacts' ? (
								<ContactReport
									variant='tab'
									maxHeight={maxHeight}
									forcedCriteria={`Account==${id}`}
									loadData={{
										Type: 'Account',
										Account: { ID: id, display_value: state.currentData.Name },
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
					JSON.stringify(state?.savedData) ===
						JSON.stringify(state?.currentData) ||
					Object.values(error).includes(true) ||
					state.status === 'saving' ||
					state.status === 'deleting'
				}
				onReset={onReset}
				resetDisabled={
					JSON.stringify(state?.savedData) ===
						JSON.stringify(state?.currentData) ||
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

			{/* <ResponsiveDialog
				sx={{ '& .MuiDialogContent-root': { p: 0 } }}
				title={renderPopupData.title}
				open={Boolean(renderPopupData.title)}
				onClose={() => setRenderPopupData({})}>
				{renderPopupData.children}
			</ResponsiveDialog> */}

			<WizardDialog
				title='Generate Proposal'
				open={wizard.open}
				onClose={() => setWizard((old) => ({ ...old, open: false }))}
				activeStep={wizard.activeStep}
				setActiveStep={(e) => setWizard((old) => ({ ...old, activeStep: e }))}
				onClickFinish={() =>
					console.log('Add Record to Document_Generation and auto download!')
				}>
				<WizardStep title='Select Fields'>
					<GridFormSectionWrapper>
						<Grid item xs={12}>
							<TextField
								label='Enter a Salesperson Name'
								defaultValue={currentUser ? currentUser.Full_Name : ''}
								onChange={(e) =>
									console.log(
										'Wizard Salesperson change to => ',
										e.target.value
									)
								}
							/>
						</Grid>
						<Grid item xs={12}>
							<LookupField2
								name='Account'
								label='Select an Account'
								defaultSortByColumn='Name'
								reportName='Accounts_Report'
								defaultValue={state.currentData.Account}
								onChange={(e) => console.log('Wizard Account change to => ', e)}
								endAdornment={
									<IconButton edge='end' size='large'>
										<DatabaseDefaultIcon form='Account' />
									</IconButton>
								}
								overrideDialogZindex
							/>
						</Grid>
					</GridFormSectionWrapper>
				</WizardStep>
				<WizardStep title='Confirm Fields'>
					<Box>1. Display data selected on previous step</Box>
					<Box>2. If click Finish, submit data to docmosis</Box>
					<Box>3. Show loader</Box>
					<Box>
						4. Upon response from docmosis API, download file and save a copy to
						Opportunity
					</Box>
					<Box>5. If successful, dismiss wizard</Box>
				</WizardStep>
			</WizardDialog>

			{/* Toast messaging in lower right */}
			<ToastMessage data={toastData} />
			<SaveManager formDataState={state} />
		</Box>
	);
};

AccountForm.propTypes = {
	formName: PropTypes.string.isRequired,
	id: PropTypes.string,
	loadData: PropTypes.object,
	databaseInformation: PropTypes.object,
	resource: PropTypes.object,
	setAppBreadcrumb: PropTypes.func,
	onChange: PropTypes.func,
	massUpdating: PropTypes.bool,
	massUpdateRecordIds: PropTypes.array,
	uuid: PropTypes.string,
	maxHeight: PropTypes.number,
};

AccountForm.defaultProps = {
	loadData: {},
	massUpdating: false,
	massUpdateRecordIds: [],
	databaseInformation: {},
};

const Wrapper = (props) => {
	return (
		<React.Suspense fallback={<ContextCircularProgressLoader />}>
			<AccountForm {...props} />
		</React.Suspense>
	);
};

export default Wrapper;
