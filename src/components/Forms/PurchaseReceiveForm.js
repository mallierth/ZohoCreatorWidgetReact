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
	getNameFn,
	sum,
} from '../Helpers/functions';
import {
	Box,
	Button,
	Divider,
	IconButton,
	ListItemIcon,
	ListItemText,
	Menu,
	MenuItem,
	Paper,
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
import Autocomplete, { createFilterOptions } from '@mui/material/Autocomplete';
const filter = createFilterOptions();
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
import { v4 as uuidv4 } from 'uuid';

//#region //TODO Mass update fields available
const massUpdateCapableFieldKeys = [];
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
				<MenuItem onClick={_onprintWizardOpen}>
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
				<MenuItem
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
				</MenuItem>
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

const PurchaseReceiveForm = ({
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
	const [data, setData] = useState({ ...loadData, ...resource.read() });
	const [id, setId] = useState(data.ID);
	const [Parent_Uuid] = useState(data.Uuid ? data.Uuid : uuidv4());
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
		deleteRecord,
	] = useFormData(data, loadData);
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
	const [wizard, setWizard] = useState({ open: false, activeStep: 0 });
	const hasError = Object.keys(error).length > 0;
	const purchaseReceiveLineItemState = useZohoGetAllRecords(
		'Purchase_Receive_Line_Items',
		id ? `Purchase_Receive==${id} && Deleted=false` : null
	);

	const getSaveDisabled = () => {
		let _disabled = true;
		Object.keys(state?.currentData).forEach((key) => {
			if (
				(key.includes('Quantity.') && state?.currentData[key] > 0) ||
				(key.includes('Serial_Numbers.') && state?.currentData[key].length > 0)
			) {
				_disabled = false;
			}
		});
		return _disabled;
	};

	useEffect(() => {
		console.log('purchaseReceiveLineItemState', purchaseReceiveLineItemState);
	}, [purchaseReceiveLineItemState]);

	//#region //! Update parent table row if applicable
	useEffect(() => {
		console.log(`PurchaseReceiveForm.js state change`, state);

		if (onChange) {
			onChange(state.savedData);
		}

		if (
			hasError &&
			(id ||
				currentUser.Enable_Autosave === false ||
				currentUser.Enable_Autosave === 'false')
		) {
			isValid();
		}
	}, [state]);
	//#endregion

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
					//? Add Purchase Receive
					addRecord(
						'Purchase_Receive',
						{
							Purchase_Order: state?.currentData?.Purchase_Order,
							Notes: state?.currentData?.Notes,
						},
						(response) => {
							//? Add Purchase Receive Line Items
							let _data = [];
							state?.currentData?.Purchase_Order_Line_Items.forEach(
								(lineItem) => {
									//! All PO Line Items are represented, regardless of whether Quantity === 0 or not
									_data.push({
										Purchase_Receive: response.ID,
										Purchase_Order_Line_Item: lineItem.ID,
										Quantity: state?.currentData[`Quantity.${lineItem.ID}`],
										Serial_Number_Entry: JSON.stringify(
											state?.currentData[`Serial_Numbers.${lineItem.ID}`]
										),
										Price_Book_Item: lineItem.Price_Book_Item,
										Code: lineItem.Code,
										Name: lineItem.Name,
										Manufacturer: lineItem.Manufacturer,
										Description: lineItem.Description,
									});
								}
							);
							addRecord(
								'Purchase_Receive_Line_Item',
								_data,
								(finalResponse) => {
									updateRecord(
										'Purchase_Receives',
										response.ID,
										{
											Line_Item_Order: JSON.stringify(
												finalResponse.map((lineItem) => lineItem.ID)
											),
										},
										() => {
											setId(response.ID);
										}
									);
								}
							);
						}
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
	const onDelete = () => {
		setConfirmationDialogData({
			title: `Delete ${formName.replaceAll('_', ' ')}`,
			onConfirm: () => {
				if (currentUser.Admin === true || currentUser.Admin === 'true') {
					//If current user is an admin, allow the ability to toggle void on/off
					deleteRecord(plurifyFormName(formName), [id], () => {
						if (uuid) {
							//TODO: Close current tab
						} else {
							//TODO: Dismiss current record view
						}
					});
				} else {
					updateRecord(plurifyFormName(formName), id, { Void_field: true });
				}
				setConfirmationDialogOpen(false);
			},
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
				disableTimeline
				CustomFormActions={
					<CustomFormActions
						currentData={state.currentData}
						currentUser={currentUser}
						onDelete={onDelete}
					/>
				}>
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

				{id ? (
					<ThemeCard sx={{ width: '100%', '& .MuiCardContent-root': { p: 0 } }}>
						<TableContainer sx={{ maxHeight: maxHeight - 16 }}>
							<Table
								sx={{ minWidth: 650, width: '100%' }}
								stickyHeader
								size='small'>
								<TableHead>
									<TableRow>
										<TableCell align='center'>#</TableCell>
										<TableCell>Product Info</TableCell>
										<TableCell>Quantity</TableCell>
										{purchaseReceiveLineItemState?.data?.filter(
											(lineItem) => lineItem.Serial_Number_Entry
										).length > 0 ? (
											<TableCell>Serial Numbers</TableCell>
										) : null}
									</TableRow>
								</TableHead>
								<TableBody>
									{purchaseReceiveLineItemState?.data?.map((lineItem, i) => (
										<TableRow key={lineItem.ID}>
											<TableCell align='center'>{i + 1}</TableCell>
											<TableCell sx={{ width: '30%' }}>
												<Typography>
													{getNameFn('Purchase_Receive_Line_Item', lineItem)}
												</Typography>
												<Typography sx={{ color: 'text.secondary' }}>
													{lineItem.Description}
												</Typography>
											</TableCell>
											<TableCell>{lineItem.Quantity}</TableCell>
											{purchaseReceiveLineItemState?.data?.filter(
												(x) => x.Serial_Number_Entry
											).length > 0 ? (
												<TableCell>
													{lineItem.Serial_Number_Entry
														? JSON.parse(lineItem.Serial_Number_Entry).join(
																', '
														  )
														: ''}
												</TableCell>
											) : null}
										</TableRow>
									))}
								</TableBody>
							</Table>
						</TableContainer>
					</ThemeCard>
				) : null}

				{!id ? (
					<ThemeCard sx={{ width: '100%', '& .MuiCardContent-root': { p: 0 } }}>
						<TableContainer sx={{ maxHeight: maxHeight - 51 - 16 }}>
							<Table
								sx={{ minWidth: 650, width: '100%' }}
								stickyHeader
								size='small'>
								<TableHead>
									<TableRow>
										<TableCell>Product Info</TableCell>
										<TableCell>Ordered</TableCell>
										<TableCell>Received</TableCell>
										<TableCell>Quantity To Receive</TableCell>
										{state?.currentData?.Purchase_Order_Line_Items.filter(
											(lineItems) =>
												lineItems['Price_Book_Item.Serialized'] === true ||
												lineItems['Price_Book_Item.Serialized'] === 'true'
										).length > 0 ? (
											<TableCell>
												<Tooltip
													title='Enter Serial Number and then press enter key'
													placement='left'>
													<Typography>Serial Number Entry</Typography>
												</Tooltip>
											</TableCell>
										) : null}
									</TableRow>
								</TableHead>
								<TableBody>
									{state?.currentData?.Purchase_Order_Line_Items.map(
										(lineItem) => (
											<PurchaseReceiveLineItem
												key={lineItem.ID}
												data={lineItem}
												onChangeQuantity={(e) =>
													mountData(`Quantity.${lineItem.ID}`, e)
												}
												onChangeSerialNumbers={(e) =>
													mountData(`Serial_Numbers.${lineItem.ID}`, e)
												}
												showSerialNumberColumn={
													state?.currentData?.Purchase_Order_Line_Items.filter(
														(lineItems) =>
															lineItems['Price_Book_Item.Serialized'] ===
																true ||
															lineItems['Price_Book_Item.Serialized'] === 'true'
													).length > 0
												}
											/>
										)
									)}
								</TableBody>
							</Table>
						</TableContainer>
					</ThemeCard>
				) : null}

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
					getSaveDisabled() ||
					state.status === 'saving' ||
					state.status === 'deleting'
				}
				onReset={onReset}
				resetDisabled={true}
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
				<Box>Email Wizard NYI</Box>
			</RenderPopup>

			{/* Print Wizard */}
			<RenderPopup
				title={
					<Box sx={{ display: 'flex' }}>
						<DatabaseDefaultIcon form={'Print_Wizard'} sx={{ mr: 0.75 }} />
						<Typography component='span'>
							Print Wizard{' '}
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
				/>
			</RenderPopup>

			{/* Toast messaging in lower right */}
			<ToastMessage data={toastData} />
			<SaveManager formDataState={state} />
		</Box>
	);
};
PurchaseReceiveForm.propTypes = {
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

PurchaseReceiveForm.defaultProps = {
	loadData: {},
	massUpdating: false,
	massUpdateRecordIds: [],
};

const Wrapper = (props) => {
	return (
		<React.Suspense fallback={<ContextCircularProgressLoader />}>
			<PurchaseReceiveForm {...props} />
		</React.Suspense>
	);
};

export default Wrapper;

const PurchaseReceiveLineItem = ({
	data,
	onChangeQuantity,
	onChangeSerialNumbers,
	showSerialNumberColumn,
}) => {
	const [value, setValue] = useState(0); //! This is where default is set... could do data.Quantity or 0
	const [serialNumberEntry, setSerialNumberEntry] = useState([]);
	const Quantity_Received = data.Quantity_Received
		? sum(data.Quantity_Received, 'display_value')
		: 0;
	const max = Number(data.Quantity) - Quantity_Received;

	useEffect(() => {
		if (
			data['Price_Book_Item.Serialized'] === true ||
			data['Price_Book_Item.Serialized'] === 'true'
		) {
			onChangeSerialNumbers(serialNumberEntry);
			setValue(serialNumberEntry.length);
		}
	}, [serialNumberEntry]);

	useEffect(() => {
		onChangeQuantity(value);
	}, [value]);

	return (
		<TableRow>
			<TableCell sx={{ width: '30%' }}>
				<Typography>{getNameFn('Purchase_Order_Line_Item', data)}</Typography>
				<Typography sx={{ color: 'text.secondary' }}>
					{data.Description}
				</Typography>
			</TableCell>
			<TableCell>{data.Quantity}</TableCell>
			<TableCell>{Quantity_Received}</TableCell>
			<TableCell>
				<TextField
					label=''
					type='number'
					value={value}
					onChange={(e) => {
						if (Number(e.target.value) >= 0 && Number(e.target.value) <= max) {
							setValue(Number(e.target.value));
						}
					}}
					InputProps={{
						readOnly:
							data['Price_Book_Item.Serialized'] === true ||
							data['Price_Book_Item.Serialized'] === 'true',
					}}
				/>
			</TableCell>
			{showSerialNumberColumn ? (
				<TableCell>
					{data['Price_Book_Item.Serialized'] === true ||
					data['Price_Book_Item.Serialized'] === 'true' ? (
						<Autocomplete
							sx={{ flex: 'auto' }}
							multiple
							disableCloseOnSelect
							name='Serial Numbers'
							label=''
							open={false}
							onClose={() => {}}
							getOptionLabel={(option) => option}
							value={serialNumberEntry}
							options={[]}
							freeSolo
							onChange={(e, newValue) => {
								//? inputValue basically flags an input as being custom, this functionality is driven by the filterOptions function. The key is arbitrarily named.

								if (newValue.length <= max) {
									//! Ensure max isn't exceeded
									setSerialNumberEntry(newValue);
								}
							}}
							filterOptions={(options, params) => {
								const filtered = filter(options, params);

								//The inputValue key is arbitrarily names but very important - it denotes custom user input in freeForm mode
								if (params.customInputValue !== '') {
									filtered.push(params.customInputValue);
								}

								return filtered;
							}}
							renderInput={(params) => <TextField {...params} />}
						/>
					) : null}
				</TableCell>
			) : null}
		</TableRow>
	);
};

PurchaseReceiveLineItem.propTypes = {
	data: PropTypes.shape({
		ID: PropTypes.string,
		Description: PropTypes.string,
		Quantity: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
		Quantity_Received: PropTypes.oneOfType([PropTypes.array, PropTypes.string]),
		'Price_Book_Item.Serialized': PropTypes.oneOfType([
			PropTypes.bool,
			PropTypes.string,
		]),
	}),
	onChangeQuantity: PropTypes.func,
	onChangeSerialNumbers: PropTypes.func,
	showSerialNumberColumn: PropTypes.bool,
};
