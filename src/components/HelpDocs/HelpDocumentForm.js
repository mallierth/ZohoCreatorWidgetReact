//import { useWhyDidYouUpdate } from 'use-why-did-you-update';
import React, { useEffect, useRef, useState } from 'react';
import PropTypes from 'prop-types';
import { useRecoilValue } from 'recoil';
import { useWhyDidYouUpdate } from 'use-why-did-you-update';
import { omit } from 'lodash-es';
import ThemeCard from '../ThemeCard';
import TabbedSection from '../TabbedSection/TabbedSection';
import { debugState, currentUserState } from '../../recoil/atoms';
import { currentUserIsHelpAdminState } from '../../recoil/selectors';
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
import WizardDialog from '../Wizards/WizardDialog';
import WizardStep from '../Wizards/WizardStep';
import ContextCircularProgressLoader from '../Loaders/ContextCircularProgressLoader';
import FileUploadField from '../FormControls/FileUploadField';
import HelpStep from './HelpStep';
import { v4 as uuidv4 } from 'uuid';

//#region //TODO Mass update fields available
const massUpdateCapableFieldKeys = [];
const defaultLoadData = {
	Category: '',
	Subcategory: '',
	Idx: '',
	Videos: '',
	Status: 'Needs Review',
	Help_HTML: '<div></div>',
	Enable_Steps: true,
	Steps: [
		{
			Uuid: uuidv4(),
			Title: 'Step 1',
			Content: '',
		},
	],
};

const categories = [
	'General',
	'Presales',
	'QuickBooks',
	'Quotes',
	'Sales Orders',
	'Purchase Orders',
];

//#endregion

//#region //TODO Helper functions

//#endregion

const HelpDocmuentForm = ({
	resource, //Data loaded from the database
	onChange, //Function call raised when data is saved - useful for updating a parent table
	loadData, //When adding a new form, this is the data object that can contain things like: {Account: '123456', Reference: '1234566'}
	massUpdating, //Used to enable mass update mode
	massUpdateRecordIds,
	uuid,
	maxHeight,
}) => {
	const currentUser = useRecoilValue(currentUserState);
	const currentUserIsHelpAdmin = useRecoilValue(currentUserIsHelpAdminState);

	const [data, setData] = useState({
		...defaultLoadData,
		...loadData,
		...resource.read(),
	});
	const [id, setId] = useState(data.ID);
	const [error, setError] = useState({});
	const hasError = Object.keys(error).length > 0;

	const [
		state,
		addRecord,
		updateRecord,
		mountData,
		resetData,
		massUpdateRecords,
	] = useFormData(
		{
			...data,
			Steps:
				data.Steps && typeof data.Steps === 'string'
					? JSON.parse(data.Steps)
					: data.Steps,
		},
		{ ...defaultLoadData, ...loadData }
	);

	const [toastData, setToastData] = useState({});

	useEffect(() => {
		console.log('HelpDocumentForm.js state', state);
		if (onChange) {
			onChange(state.currentData);
		}
	}, [state]);

	return (
		<Box
			sx={{
				display: 'flex',
				flexDirection: 'column',
			}}>
			{/* Status bar if applicable */}

			<StatusGraphic
				statuses={[
					'Needs Review',
					'Active',
					'Rejected',
					'Flagged for Update',
					'Flagged for Removal',
					'Removed',
				]}
				value={state.currentData.Status}
				onChange={(e) => {
					mountData('Status', e);
				}}
				disabled={(params) =>
					Boolean(params === 'Removed') || Boolean(params === 'Rejected')
				}
			/>

			<ThemeCard header={massUpdating ? null : `Classifications`}>
				<GridFormSectionWrapper>
					<GridInputWrapper>
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
							{categories.map((option) => (
								<MenuItem key={option} value={option}>
									{option}
								</MenuItem>
							))}
						</TextField>
					</GridInputWrapper>
					<GridInputWrapper>
						<TextField
							label='Subcategory'
							value={state.currentData.Subcategory}
							required
							error={error.Subcategory}
							helperText={
								error.Subcategory
									? 'Please enter a value for this required field'
									: ''
							}
							onChange={(e) => mountData('Subcategory', e.target.value)}
						/>
					</GridInputWrapper>
					<GridInputWrapper>
						<FileUploadField
							label='Videos'
							value={state.currentData.Videos}
							multiple
							onChange={(e) => mountData('Videos', e ? e.target.files : e)}
							accept={['.mp4']}
						/>
					</GridInputWrapper>
				</GridFormSectionWrapper>
			</ThemeCard>

			<ThemeCard
				header={massUpdating ? null : `Ordered Steps or General Text`}
				sx={{ mt: 2 }}>
				<GridFormSectionWrapper>
					<GridInputWrapper md={12}>
						<FormControlLabel
							control={
								<Checkbox
									checked={
										state?.currentData?.Enable_Steps === true ||
										state?.currentData?.Enable_Steps === 'true'
									}
									onChange={(e) => mountData('Enable_Steps', e.target.checked)}
								/>
							}
							label='Enable Steps'
						/>
					</GridInputWrapper>
					<GridInputWrapper md={12}>
						{state?.currentData?.Enable_Steps === true ||
						state?.currentData?.Enable_Steps === 'true' ? (
							// Need to render reorderable list of up to 10 steps
							<Box>
								{state?.currentData?.Steps?.map((step, i) => (
									<HelpStep
										key={step.Uuid}
										step={step}
										onChange={(e) => mountData(`Step_${i}`, e)}
										onClose={() =>
											mountData(
												'Steps',
												state.currentData.Steps.filter(
													(x) => x.Uuid !== step.Uuid
												)
											)
										}
									/>
								))}
								<Button
									onClick={() =>
										mountData('Steps', [
											...state.currentData.Steps,
											{
												Uuid: uuidv4(),
												Title: `Step ${state.currentData.Steps.length + 1}`,
												Content: '',
											},
										])
									}>
									Add Step
								</Button>
							</Box>
						) : (
							<RichTextField
								defaultValue={state.currentData.Help_HTML}
								onChange={(e) => mountData('Help_HTML', e)}
							/>
						)}
					</GridInputWrapper>
				</GridFormSectionWrapper>
			</ThemeCard>

			{/* Toast messaging in lower right */}
			<ToastMessage data={toastData} />
			<SaveManager formDataState={state} />
		</Box>
	);
};
HelpDocmuentForm.propTypes = {
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

HelpDocmuentForm.defaultProps = {
	loadData: {},
	massUpdating: false,
	massUpdateRecordIds: [],
};

const Wrapper = (props) => {
	return (
		<React.Suspense fallback={<ContextCircularProgressLoader />}>
			<HelpDocmuentForm {...props} />
		</React.Suspense>
	);
};

export default Wrapper;
