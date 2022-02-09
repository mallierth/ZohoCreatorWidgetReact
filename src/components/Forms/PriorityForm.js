//import { useWhyDidYouUpdate } from 'use-why-did-you-update';
import React, { useEffect, useRef, useState } from 'react';
import PropTypes from 'prop-types';
import { useRecoilState, useRecoilValue } from 'recoil';
import { useWhyDidYouUpdate } from 'use-why-did-you-update';
import { omit } from 'lodash-es';
import ThemeCard from '../ThemeCard';
import TabbedSection from '../TabbedSection/TabbedSection';
import {
	debugState,
	currentUserState,
	applicationTabsState,
} from '../../recoil/atoms';
import { currentUserIsAdminState } from '../../recoil/selectors';
import * as Columns from '../../recoil/columnAtoms';
import DatabaseDefaultIcon from '../Helpers/DatabaseDefaultIcon';
import LookupField2 from '../FormControls/LookupField2';
import AsynchronousSelect2 from '../FormControls/AsynchronousSelect2';
import BottomBar from '../Helpers/BottomBar';
import PrintRecord from '../Forms/PrintRecord';
import RichTextField from '../RichText/RichTextField';
import {
	copyTextToClipboard,
	camelize,
	plurifyFormName,
} from '../Helpers/functions';
import {
	Autocomplete,
	Box,
	Button,
	Divider,
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
	FileUpload,
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
import FormVoidDialog from '../Modals/FormVoidDialog';
import FormDeleteDialog from '../Modals/FormDeleteDialog';

//#region //TODO Mass update fields available
const massUpdateCapableFieldKeys = [];
//#endregion

//#region //TODO Helper functions

//#endregion

const PriorityForm = ({
	formName, //Used to require fewer edits between template and specific forms
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
	const [data, setData] = useState({ ...loadData, ...resource.read() });
	const [id, setId] = useState(data?.ID);
	const [
		state,
		addRecord,
		updateRecord,
		mountData,
		resetData,
		massUpdateRecords,
	] = useFormData(data, loadData);

	const [massUpdateFieldList, setMassUpdateFieldList] = useState([]);
	const requiredFields = useRef(columns.filter((column) => column.required));
	const [error, setError] = useState({});
	const [toastData, setToastData] = useState({});

	const [timelineOpen, setTimelineOpen] = useState(false);
	const [voidDialogOpen, setVoidDialogOpen] = useState(false);
	const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
	const hasError = Object.keys(error).length > 0;
	const isVoided =
		state?.currentData?.Void_field === true ||
		state?.currentData?.Void_field === 'true';

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

	//#region //! Commands exposed by Actions dropdown
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
				//CustomFormActions={{}}
			>
				{/* Status bar if applicable */}
				{!massUpdating &&
				columns.filter((column) => column.valueKey === 'Status')[0].options
					.length > 0 ? (
					<StatusGraphic
						statuses={
							columns.filter((column) => column.valueKey === 'Status')[0]
								.options
						}
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
					<ThemeCard header='Priority Details'>
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
									massUpdating && !massUpdateFieldList.includes('Employees')
								}>
								<AsynchronousSelect2
									label='Employee(s)'
									name='Employees'
									formName='Employee'
									reportName='Employees'
									displayValueKey='Full_Name'
									criteria='Active=true'
									multiSelect
									error={error.Employees}
									helperText={
										error.Employees
											? 'Please enter a value for this required field'
											: 'If left blank, this priority will be considered unassigned'
									}
									defaultValue={state.currentData.Employees}
									onChange={(e) => mountData('Employees', e)}
									required
								/>
							</GridInputWrapper>

							<GridInputWrapper
								massUpdating={massUpdating}
								hidden={
									massUpdating && !massUpdateFieldList.includes('Employees')
								}>
								<AsynchronousSelect2
									label='Tags'
									name='Tags'
									formName='Tag'
									reportName='Tags'
									displayValueKey='Name'
									multiSelect
									defaultValue={state.currentData.Tags}
									onChange={(e) => mountData('Tags', e)}
								/>
							</GridInputWrapper>

							<GridInputWrapper
								massUpdating={massUpdating}
								hidden={
									massUpdating && !massUpdateFieldList.includes('Due_Date')
								}>
								<TextFieldDateTime
									type='date'
									label='Due Date'
									value={state.currentData.Due_Date}
									onChange={(e) => mountData('Due_Date', e)}
								/>
							</GridInputWrapper>
						</GridFormSectionWrapper>
					</ThemeCard>
				)}
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

			{/* Toast messaging in lower right */}
			<ToastMessage data={toastData} />
			<SaveManager formDataState={state} />
		</Box>
	);
};

PriorityForm.propTypes = {
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

PriorityForm.defaultProps = {
	loadData: {},
	massUpdating: false,
	massUpdateRecordIds: [],
};

export default PriorityForm;
