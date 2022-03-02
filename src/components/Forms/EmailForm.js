//import { useWhyDidYouUpdate } from 'use-why-did-you-update';
import React, { useEffect, useRef, useState } from 'react';
import PropTypes from 'prop-types';
import { useRecoilValue } from 'recoil';
import { useWhyDidYouUpdate } from 'use-why-did-you-update';
import { omit } from 'lodash-es';
import ThemeCard from '../ThemeCard';
import TabbedSection from '../TabbedSection/TabbedSection';
import {
	debugState,
	currentUserState,
	appMaxWidthState,
} from '../../recoil/atoms';
import * as Columns from '../../recoil/columnAtoms';
import DatabaseDefaultIcon from '../Helpers/DatabaseDefaultIcon';
import LookupField2 from '../FormControls/LookupField2';
import BottomBar from '../Helpers/BottomBar';
import PrintRecord from '../Forms/PrintRecord';
import { generateDocument } from '../../apis/docmosis';
import {
	copyTextToClipboard,
	camelize,
	plurifyFormName,
	urltoFile,
} from '../Helpers/functions';
import {
	AppBar,
	Box,
	Button,
	Breadcrumbs,
	Checkbox,
	Container,
	Divider,
	FormControlLabel,
	Grid,
	IconButton,
	Link,
	ListItemIcon,
	ListItemText,
	Menu,
	MenuItem,
	Paper,
	Tab,
	TextField,
	Toolbar,
	Tooltip,
	Typography,
} from '@mui/material';
import {
	Block,
	ConstructionOutlined,
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
	useZohoGetRecordById,
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
import AsynchronousSelect2 from '../FormControls/AsynchronousSelect2';
import Autocomplete, { createFilterOptions } from '@mui/material/Autocomplete';
const filter = createFilterOptions();
import { LoadingButton } from '@mui/lab';
import { addRecord as rawAddRecord } from '../../apis/ZohoCreator';
import ContactReport from '../Reports/ContactReport';

//#region //TODO Mass update fields available
const massUpdateCapableFieldKeys = [];

const defaultLoadData = {
	Subject_field: '',
}

//#endregion

//#region //TODO Helper functions
const parseForContactData = (data) => {
	if (data?.Contact_Criteria) {
		return data?.Contact_Criteria;
	}

	if (data?.Contact) {
		return typeof data.Contact === 'object'
			? `ID==${data.Contact.ID}`
			: `ID==${data.Contact}`;
	}

	if (data?.Contacts) {
		return `(${data.Contacts.map((contact) =>
			typeof contact === 'object' ? `ID==${contact.ID}` : `ID==${contact}`
		).join(' || ')})`;
	}
};

const parseForEmployeeData = (data) => {
	if (data?.To) {
		if (Array.isArray(data.To)) {
			return `(${data.To.map((contact) =>
				typeof contact === 'object' ? `ID==${contact.ID}` : `ID==${contact}`
			).join(' || ')})`;
		} else if (typeof data.To === 'object') {
			return `ID==${data.To.ID}`;
		} else if (data.To) {
			return `ID==${data.To}`;
		}
	}
};
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

const EmailForm = ({
	formName, //Used to require fewer edits between template and specific forms
	setAppBreadcrumb, //If form is fullscreen - when rendered from a table row, this won't be defined
	resource, //Data loaded from the database
	onChange, //Function call raised when data is saved - useful for updating a parent table
	loadData, //When adding a new form, this is the data object that can contain things like: {Account: '123456', Reference: '1234566'}
	massUpdating, //Used to enable mass update mode
	massUpdateRecordIds,
	uuid,
	maxHeight,
	parentForm, //Used for email templates
}) => {
	const currentUser = useRecoilValue(currentUserState);
	const appMaxWidth = useRecoilValue(appMaxWidthState);
	const columns = useRecoilValue(
		Columns[`${camelize(formName.replaceAll('_', ''))}ColumnsState`]
	);
	const debug = useRecoilValue(debugState);
	const [alerts, setAlerts] = useState({});
	const [data, setData] = useState({
		...defaultLoadData,
		From_Update: currentUser?.Email,
		...loadData,
		...resource.read(),
	});
	const emailTemplateState = useZohoGetAllRecords(
		'Email_Templates',
		parentForm
			? `Form=="${parentForm.replaceAll(
					'_',
					' '
			  )}" || Form=="${parentForm.replaceAll(' ', '_')}"`
			: undefined
	);
	const contactEmailState = useZohoGetAllRecords(
		'Contacts',
		parseForContactData(data)
	);
	const employeeEmailState = useZohoGetAllRecords(
		'Employees',
		parseForEmployeeData(data)
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
	] = useFormData(data, {...defaultLoadData, ...loadData, } );

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
	const [contactsModalOpen, setContactsModalOpen] = useState(false);
	const [contactsCcModalOpen, setContactsCcModalOpen] = useState(false);
	const [toDropdownOpen, setToDropdownOpen] = useState(false);
	const [selectedContacts, setSelectedContacts] = useState(loadData.To || []);
	const [customInputContacts, setCustomInputContacts] = useState(data.To && Array.isArray(data.To) ? data.To : []);
	const [selectedCcContacts, setSelectedCcContacts] = useState([]);
	const [customInputCcContacts, setCustomInputCcContacts] = useState([]);
	const [templateFetching, setTemplateFetching] = useState(false);
	const [templateEmailBody, setTemplateEmailBody] = useState(null);
	const [base64Data, setBase64Data] = useState(null);

	//! Record title when accessed via direct URL
	useEffect(() => {
		if (emailTemplateState?.status === 'fetched') {
			console.log(
				'EmailForm.js emailTemplateState change',
				emailTemplateState.data
			);

			if (loadData.Default_Template_Name) {
				(async () => {
					setTemplateFetching(true);
					const response = await rawAddRecord('Email_Template_Instance', {
						...state?.currentData,
						Template_Name: loadData.Default_Template_Name,
					});
					console.log('response', response);
					mountData('Subject_field', response?.Subject_field);
					mountData('Message', response?.HTML_Template);
					response?.HTML_Template
						? setTemplateEmailBody(response.HTML_Template)
						: null;

					setTemplateFetching(false);
				})();
			}
		}
	}, [emailTemplateState]);

	//! Used to auto load selec
	useEffect(() => {
		if (employeeEmailState?.data?.length > 0) {
			setSelectedContacts(employeeEmailState.data);
		} else if (contactEmailState?.data?.length > 0) {
			setSelectedContacts(contactEmailState.data);
		}
	}, [contactEmailState, employeeEmailState]);

	//#region //! Update parent table row if applicable
	useEffect(() => {
		console.log(`EmailForm.js state change`, state);

		//! The email form is a bit unique since autosave will never be applicable here
		if (state?.status === 'saved' && onChange) {
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

		//! Alert: NO_EDITS
		if (id) {
			const thisAlert = {
				id: 'NO_EDITS',
				variant: 'filled',
				severity: 'info',
				action: null,
				message: 'Emails cannot be edited after they are sent!',
			};

			setAlerts((old) =>
				old[thisAlert.id] ? old : { ...old, [thisAlert.id]: thisAlert }
			);
		}
	}, [state]);
	//#endregion

	//#region //! Data save/autosave/reset/validity

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
					updateRecord(plurifyFormName(formName), id, state.currentData);
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
					let attachmentCount = 0;
					state?.currentData?.File_Upload_0 ? attachmentCount++ : null;
					state?.currentData?.File_Upload_1 ? attachmentCount++ : null;
					state?.currentData?.File_Upload_2 ? attachmentCount++ : null;
					state?.currentData?.File_Upload_3 ? attachmentCount++ : null;
					state?.currentData?.File_Upload_4 ? attachmentCount++ : null;
					addRecord(
						formName,
						{ ...state.currentData, Attachment_Count: attachmentCount },
						(response) => setId(response.ID)
					);
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

	useEffect(() => {
		mountData(
			'To',
			[
				...selectedContacts.map((contact) => contact.Email),
				...customInputContacts,
			].join('; ')
		);
	}, [selectedContacts, customInputContacts]);

	useEffect(() => {
		mountData(
			'CC',
			[
				...selectedCcContacts.map((contact) => contact.Email),
				...customInputCcContacts,
			].join('; ')
		);
	}, [selectedCcContacts, customInputCcContacts]);

	//#region //! Auto Download Attachment and Assign to FileUploadField Logic
	useEffect(() => {
		if (loadData.Default_Attachment_Data) {
			autoDownloadAttachment();
		}
	}, [loadData.Default_Attachment_Data]);

	const autoDownloadAttachment = async () => {
		const response = await generateDocument(
			`${plurifyFormName(parentForm)}/${plurifyFormName(parentForm)}.docx`,
			`${loadData.Output_Filename}.pdf`,
			loadData.Default_Attachment_Data,
			currentUser.Full_Name
		);

		console.log('docmosis response', response);

		if (response?.data?.succeeded) {
			setBase64Data('data:application/pdf;base64,' + response.data.resultFile);
		}
	};

	useEffect(() => {
		if (base64Data) {
			(async () => {
				const file = await urltoFile(
					base64Data,
					`${loadData.Output_Filename}.pdf`
				);
				console.log('EmailForm.js file response ', file, file instanceof File);
				mountData('File_Upload_0', file);

				// var link = document.createElement('a');
				// link.download = `${loadData.Output_Filename}.pdf`;
				// link.href = base64Data;
				// document.body.appendChild(link);
				// link.click();
			})();
		}
	}, [base64Data]);
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
				disabled={Boolean(id)}
				disabledText='SENT'>
				{/* Status bar if applicable */}

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
					<ThemeCard>
						<GridFormSectionWrapper>
							{/* Fields */}
							<GridInputWrapper
								md={12}
								massUpdating={massUpdating}
								hidden={
									massUpdating && !massUpdateFieldList.includes('From_Update')
								}>
								<TextField
									select
									label='From'
									value={state.currentData.From_Update}
									required
									error={error.From_Update}
									helperText={
										error.From_Update
											? 'Please enter a value for this required field'
											: ''
									}
									onChange={(e) => mountData('From_Update', e.target.value)}>
									{[currentUser?.Email, 'Support', 'Purchasing'].map(
										(option) => (
											<MenuItem key={option} value={option}>
												{option}
											</MenuItem>
										)
									)}
								</TextField>
							</GridInputWrapper>
							<GridInputWrapper
								md={12}
								massUpdating={massUpdating}
								hidden={massUpdating && !massUpdateFieldList.includes('To')}>
								<Box sx={{ display: 'flex' }}>
									<Tooltip
										arrow
										title='Click here to insert Contact email(s) from our database'>
										<Button
											sx={{ mr: 1 }}
											onClick={() => setContactsModalOpen(true)}
											variant='contained'
											size='large'
											color={error.To ? 'error' : 'primary'}>
											To
										</Button>
									</Tooltip>
									<Autocomplete
										sx={{ flex: 'auto' }}
										multiple
										disableCloseOnSelect
										name='Email To'
										label=' '
										open={false}
										onClose={() => setToDropdownOpen(false)}
										getOptionLabel={(option) => option}
										value={[
											...selectedContacts.map((contact) => contact.Full_Name),
											...customInputContacts,
										]}
										options={[]}
										freeSolo
										onChange={(e, newValue) => {
											//? inputValue basically flags an input as being custom, this functionality is driven by the filterOptions function. The key is arbitrarily named.
											console.log('newValue', newValue);
											let customInputs = [];
											//Iterate through newValue array to see what is custom and what is a Contact
											newValue.forEach((value) => {
												if (
													selectedContacts
														.map((selectedContact) => selectedContact.Full_Name)
														.includes(value)
												) {
													//This current value exists
												} else {
													//Custom input
													customInputs.push(value);
												}
											});

											setCustomInputContacts(customInputs);

											//If the entry within newValue array is contained within the currently selected contacts,
											setSelectedContacts((old) =>
												old.filter((o) => newValue.includes(o.Full_Name))
											);
										}}
										filterOptions={(options, params) => {
											const filtered = filter(options, params);

											//The inputValue key is arbitrarily names but very important - it denotes custom user input in freeForm mode
											if (params.customInputValue !== '') {
												filtered.push(params.customInputValue);
											}

											return filtered;
										}}
										renderInput={(params) => (
											<TextField
												{...params}
												required
												error={error.To}
												helperText='Note: You can type any valid email address and press [Enter] to add it to the recipient list'
											/>
										)}
									/>
								</Box>
							</GridInputWrapper>
							<GridInputWrapper
								md={12}
								massUpdating={massUpdating}
								hidden={massUpdating && !massUpdateFieldList.includes('CC')}>
								<Box sx={{ display: 'flex' }}>
									<Tooltip
										arrow
										title='Click here to insert Contact email(s) from our database'>
										<Button
											sx={{ mr: 1 }}
											onClick={() => setContactsModalOpen(true)}
											variant='contained'
											size='large'
											color={error.To ? 'error' : 'primary'}>
											Cc
										</Button>
									</Tooltip>
									<Autocomplete
										sx={{ flex: 'auto' }}
										multiple
										disableCloseOnSelect
										name='Email Cc'
										label=' '
										open={false}
										onClose={() => setToDropdownOpen(false)}
										getOptionLabel={(option) => option}
										value={[
											...selectedCcContacts.map((contact) => contact.Full_Name),
											...customInputCcContacts,
										]}
										options={[]}
										freeSolo
										onChange={(e, newValue) => {
											//? inputValue basically flags an input as being custom, this functionality is driven by the filterOptions function. The key is arbitrarily named.
											console.log('newValue', newValue);
											let customInputs = [];
											//Iterate through newValue array to see what is custom and what is a Contact
											newValue.forEach((value) => {
												if (
													selectedCcContacts
														.map((selectedContact) => selectedContact.Full_Name)
														.includes(value)
												) {
													//This current value exists
												} else {
													//Custom input
													customInputs.push(value);
												}
											});

											setCustomInputCcContacts(customInputs);

											//If the entry within newValue array is contained within the currently selected contacts,
											setSelectedCcContacts((old) =>
												old.filter((o) => newValue.includes(o.Full_Name))
											);
										}}
										filterOptions={(options, params) => {
											const filtered = filter(options, params);

											//The inputValue key is arbitrarily names but very important - it denotes custom user input in freeForm mode
											if (params.customInputValue !== '') {
												filtered.push(params.customInputValue);
											}

											return filtered;
										}}
										renderInput={(params) => (
											<TextField
												{...params}
												required
												error={error.To}
												helperText='Note: You can type any valid email address and press [Enter] to add it to the recipient list'
											/>
										)}
									/>
								</Box>
							</GridInputWrapper>
							<GridInputWrapper
								md={12}
								massUpdating={massUpdating}
								hidden={
									massUpdating && !massUpdateFieldList.includes('Subject_field')
								}>
								<TextField
									label='Subject'
									value={state.currentData.Subject_field}
									onChange={(e) => mountData('Subject_field', e.target.value)}
									helperText={
										error.Subject_field
											? 'Please enter a value for this required field'
											: ''
									}
									error={error.Subject_field}
									required
								/>
							</GridInputWrapper>
							<GridInputWrapper
								md={12}
								massUpdating={massUpdating}
								hidden={
									massUpdating && !massUpdateFieldList.includes('Message')
								}>
								<RichTextField
									overrideHtml={templateEmailBody}
									defaultValue={state.currentData.Message}
									onChange={(e) => mountData('Message', e)}
								/>
								<Box sx={{ mt: 1, display: 'flex', alignItems: 'center' }}>
									{emailTemplateState?.data?.length ? (
										<Typography sx={{ mr: 2 }}>
											Insert Email Template:{' '}
										</Typography>
									) : null}
									{emailTemplateState?.data?.map((template) => (
										<LoadingButton
											key={template.ID}
											loading={templateFetching}
											sx={{ mr: 1 }}
											onClick={async () => {
												setTemplateFetching(true);
												const response = await rawAddRecord(
													'Email_Template_Instance',
													{
														...state?.currentData,
														Template_Name: template.Name,
													}
												);
												console.log('response', response);
												mountData('Subject_field', response?.Subject_field);
												mountData('Message', response?.HTML_Template);
												response?.HTML_Template
													? setTemplateEmailBody(response.HTML_Template)
													: null;

												setTemplateFetching(false);
											}}
											variant='outlined'>
											{template.Name}
										</LoadingButton>
									))}
								</Box>
							</GridInputWrapper>

							{/* Sections */}
							<GridInputWrapper>
								<ThemeCard header='Attachments' elevation={8}>
									<Grid container spacing={2}>
										<Grid item xs={12}>
											<FileUploadField
												value={state.currentData.File_Upload_0}
												onChange={(e) =>
													mountData('File_Upload_0', e ? e.target.files[0] : e)
												}
											/>
										</Grid>
										<Grid item xs={12}>
											<FileUploadField
												value={state.currentData.File_Upload_1}
												onChange={(e) =>
													mountData('File_Upload_1', e ? e.target.files[0] : e)
												}
											/>
										</Grid>
										<Grid item xs={12}>
											<FileUploadField
												value={state.currentData.File_Upload_2}
												onChange={(e) =>
													mountData('File_Upload_2', e ? e.target.files[0] : e)
												}
											/>
										</Grid>
										<Grid item xs={12}>
											<FileUploadField
												value={state.currentData.File_Upload_3}
												onChange={(e) =>
													mountData('File_Upload_3', e ? e.target.files[0] : e)
												}
											/>
										</Grid>
										<Grid item xs={12}>
											<FileUploadField
												value={state.currentData.File_Upload_4}
												onChange={(e) =>
													mountData('File_Upload_4', e ? e.target.files[0] : e)
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

			{/* Contact Selection for Emails */}
			<RenderPopup
				open={contactsModalOpen}
				onClose={() => setContactsModalOpen(false)}
				overrideDialogZindex
				title={
					<Breadcrumbs
						sx={{
							display: { xs: 'none', sm: 'flex' },
							color: 'primary.contrastText',
						}}>
						<Link
							sx={{ display: 'flex', alignItems: 'center' }}
							color='inherit'
							underline='none'>
							<DatabaseDefaultIcon form={formName} sx={{ mr: 1 }} />
							Select Contacts
						</Link>
					</Breadcrumbs>
				}
				moveableModal>
				<>
					<ContactReport
						maxHeight={600}
						defaultSelections={selectedContacts}
						disableOpenOnRowClick
						onChange={(selections) => setSelectedContacts(selections)}
					/>
					<AppBar color='inherit' position='relative'>
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
									onClick={() => setContactsModalOpen(false)}
									sx={{ mr: 2 }}>
									Cancel
								</Button>
								<Button
									onClick={() => setContactsModalOpen(false)}
									disabled={selectedContacts.length === 0}
									color='secondary'
									variant='contained'>
									OK
								</Button>
							</Toolbar>
						</Container>
					</AppBar>
				</>
			</RenderPopup>

			<RenderPopup
				open={contactsCcModalOpen}
				onClose={() => setContactsCcModalOpen(false)}
				overrideDialogZindex
				title={
					<Breadcrumbs
						sx={{
							display: { xs: 'none', sm: 'flex' },
							color: 'primary.contrastText',
						}}>
						<Link
							sx={{ display: 'flex', alignItems: 'center' }}
							color='inherit'
							underline='none'>
							<DatabaseDefaultIcon form={formName} sx={{ mr: 1 }} />
							Select Contacts
						</Link>
					</Breadcrumbs>
				}
				moveableModal>
				<>
					<ContactReport
						maxHeight={600}
						defaultSelections={selectedCcContacts}
						disableOpenOnRowClick
						onChange={(selections) => setSelectedCcContacts(selections)}
					/>

					<AppBar color='inherit' position='relative'>
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
									onClick={() => setContactsCcModalOpen(false)}
									sx={{ mr: 2 }}>
									Cancel
								</Button>
								<Button
									onClick={() => setContactsCcModalOpen(false)}
									disabled={selectedCcContacts.length === 0}
									color='secondary'
									variant='contained'>
									OK
								</Button>
							</Toolbar>
						</Container>
					</AppBar>
				</>
			</RenderPopup>

			{/* Print Wizard */}

			{/* Toast messaging in lower right */}
			<ToastMessage data={toastData} />
			<SaveManager formDataState={state} email />
		</Box>
	);
};
EmailForm.propTypes = {
	formName: PropTypes.string.isRequired,
	id: PropTypes.string,
	loadData: PropTypes.shape({
		Form: PropTypes.string,
		Purchase_Order: PropTypes.string,
		Service_Order: PropTypes.string,
		Service_Contract: PropTypes.string,
		Contact: PropTypes.string,
		Vendor: PropTypes.string,
		Reference: PropTypes.string,
		Parent_ID: PropTypes.string,
		Subject_field: PropTypes.string,
		Cc: PropTypes.string,
		To: PropTypes.string,
		Message: PropTypes.string,
		From_Update: PropTypes.string,
		Default_Template_Name: PropTypes.string,
		Output_Filename: PropTypes.string,
		Default_Attachment_Data: PropTypes.object,
	}),
	resource: PropTypes.object,
	setAppBreadcrumb: PropTypes.func,
	onChange: PropTypes.func,
	massUpdating: PropTypes.bool,
	massUpdateRecordIds: PropTypes.array,
	parentForm: PropTypes.string,
	uuid: PropTypes.string,
	maxHeight: PropTypes.number,
};

EmailForm.defaultProps = {
	loadData: {},
	massUpdating: false,
	massUpdateRecordIds: [],
};

const Wrapper = (props) => {
	return (
		<React.Suspense fallback={<ContextCircularProgressLoader />}>
			<EmailForm {...props} />
		</React.Suspense>
	);
};

export default Wrapper;
