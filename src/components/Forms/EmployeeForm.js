//import { useWhyDidYouUpdate } from 'use-why-did-you-update';
import React, { useEffect, useRef, useState } from 'react';
import PropTypes from 'prop-types';
import { v4 as uuidv4 } from 'uuid';
import { useRecoilValue, useRecoilState } from 'recoil';
import { omit } from 'lodash-es';
import ThemeCard from '../ThemeCard';
import TabbedSection from '../TabbedSection/TabbedSection';
import { debugState, currentUserState, themeState } from '../../recoil/atoms';
import {
	currentUserThemeModeState,
	currentUserPrimaryColorState,
	currentUserSecondaryColorState,
	themeModeState,
	themePrimaryColorState,
	themeSecondaryColorState,
	currentUserIdState,
} from '../../recoil/selectors';
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
} from '../Helpers/functions';
import {
	Autocomplete,
	Box,
	Button,
	Checkbox,
	Divider,
	FormControl,
	FormControlLabel,
	FormLabel,
	Grid,
	IconButton,
	ListItemIcon,
	ListItemText,
	Menu,
	MenuItem,
	Radio,
	RadioGroup,
	TextField,
	Tooltip,
	Typography,
} from '@mui/material';
import {
	Block,
	DeleteForever,
	Email,
	ExpandMore,
	FactCheck,
	MoreVert,
	Print,
	Share,
} from '@mui/icons-material';
import darkScrollbar from '@mui/material/darkScrollbar';
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
import { Context } from 'immutability-helper';
import ModeSwitch from '../FormControls/ModeSwich';
import { ColorPicker } from 'mui-color';
import { axiosGetAllRecords } from '../../apis/ZohoCreator';

//#region //TODO Mass update fields available
const massUpdateCapableFieldKeys = [
	{ label: 'Theme', value: 'Theme' },
	{ label: 'Enable Autosave', value: 'Enable_Autosave' },
];
//#endregion

//#region //TODO Helper functions

//#endregion

//#region //TODO Custom actions in form toolbar
const CustomFormActions = ({
	currentData,
	currentUser,
	onCopyDirectUrl,
	onOpenPickTicket,
	onOpenPrintWizard,
	onOpenSendEmail,
	onVoid,
	onDelete,
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

	const _onOpenPickTicket = () => {
		onClose();
		onOpenPickTicket();
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
				<MenuItem onClick={_onOpenPickTicket}>
					<ListItemIcon>
						<FactCheck color='info' fontSize='small' />
					</ListItemIcon>
					<ListItemText>Pick Ticket</ListItemText>
				</MenuItem>
				<Divider />
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
	onOpenPickTicket: PropTypes.func,
	onOpenPrintWizard: PropTypes.func,
	onOpenSendEmail: PropTypes.func,
	onVoid: PropTypes.func,
	onDelete: PropTypes.func,
};
//#endregion

const EmployeeForm = ({
	formName, //Used to require fewer edits between template and specific forms
	setAppBreadcrumb, //If form is fullscreen - when rendered from a table row, this won't be defined
	resource, //Data loaded from the database
	onChange, //Function call raised when data is saved - useful for updating a parent table
	loadData, //When adding a new form, this is the data object that can contain things like: {Account: '123456', Reference: '1234566'}
	massUpdating, //Used to enable mass update mode
	massUpdateRecordIds,
	uuid,
	maxHeight,

	mySettingsModal, //Specific to this form
}) => {
	const [currentUser, setCurrentUser] = useRecoilState(currentUserState);
	const currentUserId = useRecoilValue(currentUserIdState);
	const currentUserThemeMode = useRecoilValue(currentUserThemeModeState);
	const currentUserPrimaryColor = useRecoilValue(currentUserPrimaryColorState);
	const currentUserSecondaryColor = useRecoilValue(
		currentUserSecondaryColorState
	);
	const [theme, setTheme] = useRecoilState(themeState);
	const themeMode = useRecoilValue(themeModeState);
	const themePrimaryColor = useRecoilValue(themePrimaryColorState);
	const themeSecondaryColor = useRecoilValue(themeSecondaryColorState);
	const [themePresets, setThemePresets] = useState(
		JSON.parse(currentUser.Custom_Themes).map((customTheme) => ({
			...customTheme,
			ID: uuidv4(),
		}))
	);
	const [themePresetValue, setThemePresetValue] = useState(null);
	const selectedThemePreset = themePresets.filter(
		(preset) => preset.ID === themePresetValue
	)[0];
	const columns = useRecoilValue(
		Columns[`${camelize(formName.replaceAll('_', ''))}ColumnsState`]
	);
	const [debug, setDebug] = useRecoilState(debugState);
	const [alerts, setAlerts] = useState({});
	const [data, setData] = useState({ ...loadData, ...resource.read() });
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
	] = useFormData(data, loadData);

	const [massUpdateFieldList, setMassUpdateFieldList] = useState([]);
	const requiredFields = useRef(columns.filter((column) => column.required));
	const [error, setError] = useState({});
	const [toastData, setToastData] = useState({});
	const [confirmationDialogOpen, setConfirmationDialogOpen] = useState(false);
	const [confirmationDialogData, setConfirmationDialogData] = useState({});
	const [timelineOpen, setTimelineOpen] = useState(false);
	const [tabValue, setTabValue] = useState(0);
	const [renderPopupData, setRenderPopupData] = useState({});
	const hasError = Object.keys(error).length > 0;

	//? If the current theme differs from the users settings on load, set to user's settings
	//? Any changes after initial load should update currentUser
	useEffect(() => {
		if (
			currentUserThemeMode !== themeMode ||
			currentUserPrimaryColor !== themePrimaryColor ||
			currentUserSecondaryColor !== themeSecondaryColor
		) {
			mountData('Theme', themeMode);
			mountData('Primary_Color', themePrimaryColor);
			mountData('Secondary_Color', themeSecondaryColor);
		}

		if (
			themePresets.filter(
				(preset) =>
					preset.Primary_Color === theme.palette.primary.main &&
					preset.Secondary_Color === theme.palette.secondary.main &&
					preset.Theme === theme.palette.mode
			).length === 0
		) {
			setThemePresetValue(null);
		} else {
			themePresets.forEach((preset) => {
				if (
					preset.Primary_Color === theme.palette.primary.main &&
					preset.Secondary_Color === theme.palette.secondary.main &&
					preset.Theme === theme.palette.mode
				) {
					setThemePresetValue(preset.ID);
				}
			});
		}
	}, [
		currentUserThemeMode,
		currentUserPrimaryColor,
		currentUserSecondaryColor,
		themeMode,
		themePrimaryColor,
		themeSecondaryColor,
		themePresets,
	]);

	useEffect(() => {
		const _themePresets = themePresets.map((preset) => omit(preset, 'ID'));
		if (
			themePresets &&
			JSON.stringify(_themePresets) !==
				JSON.stringify(JSON.parse(currentUser.Custom_Themes))
		) {
			console.log('themePresets change, update currentUser', _themePresets);
			mountData('Custom_Themes', JSON.stringify(_themePresets));
		}
	}, [themePresets]);

	useEffect(() => {
		if (themePresetValue) {
			console.log(
				'themePresetValue change',
				themePresetValue,
				'selectedTheme',
				selectedThemePreset
			);

			setTheme((oldTheme) => ({
				...oldTheme,
				components: {
					...oldTheme.components,
					MuiCssBaseline: {
						styleOverrides: {
							body:
								selectedThemePreset.Theme === 'dark' ? darkScrollbar() : null,
						},
					},
				},
				palette: {
					...oldTheme.palette,
					primary: {
						main: selectedThemePreset.Primary_Color,
					},
					secondary: {
						main: selectedThemePreset.Secondary_Color,
					},
					mode: selectedThemePreset.Theme,
					background: {
						default: selectedThemePreset.Theme === 'dark' ? '#121212' : '#eee',
					},
					tabs: {
						active: selectedThemePreset.Theme === 'dark' ? '#121212' : '#eee',
						inactive: 'transparent',
						background:
							selectedThemePreset.Theme === 'dark' ? '#121212' : '#eee',
					},
				},
			}));
		}
	}, [themePresetValue]);

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
		console.log('state changed', state);
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

		switch (state.status) {
			case 'saved':
				// if (
				// 	state.savedData.Enable_Autosave === false ||
				// 	state.savedData.Enable_Autosave
				// ) {
				// 	const Enable_Autosave =
				// 		state.savedData.Enable_Autosave === 'true' ||
				// 		state.savedData.Enable_Autosave === true
				// 			? true
				// 			: false;
				// 	if (currentUser.Enable_Autosave !== Enable_Autosave) {
				// 		setCurrentUser((user) => ({
				// 			...user,
				// 			Enable_Autosave: Enable_Autosave,
				// 		}));
				// 	}
				// }
				setCurrentUser((oldUser) =>
					!oldUser ||
					JSON.stringify(oldUser) !== JSON.stringify(state.savedData)
						? state.savedData
						: oldUser
				);

				if (state.savedData.Name) {
					setRecordTitle((old) =>
						old !== state.savedData.Name ? state.savedData.Name : old
					);
				}

				break;
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
		mySettingsModal ? 500 : 2000
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
				renderInModal={mySettingsModal}
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
					/>
				}>
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
					<>
						<ThemeCard
							header={
								massUpdating ? null : `${formName.replaceAll('_', ' ')} Details`
							}>
							<GridFormSectionWrapper>
								<GridInputWrapper
									massUpdating={massUpdating}
									hidden={
										massUpdating && !massUpdateFieldList.includes('First_Name')
									}>
									<TextField
										label='First Name'
										value={state.currentData.First_Name}
										helperText={
											error.First_Name
												? 'Please enter a value for this required field'
												: ''
										}
										required
										error={error.First_Name}
										onChange={(e) => mountData('First_Name', e.target.value)}
										InputProps={{
											readOnly: true,
										}}
									/>
								</GridInputWrapper>
								<GridInputWrapper
									massUpdating={massUpdating}
									hidden={
										massUpdating && !massUpdateFieldList.includes('Last_Name')
									}>
									<TextField
										label='Last Name'
										value={state.currentData.Last_Name}
										helperText={
											error.Last_Name
												? 'Please enter a value for this required field'
												: ''
										}
										required
										error={error.Last_Name}
										onChange={(e) => mountData('Last_Name', e.target.value)}
										InputProps={{
											readOnly: true,
										}}
									/>
								</GridInputWrapper>
								<GridInputWrapper
									massUpdating={massUpdating}
									hidden={
										massUpdating && !massUpdateFieldList.includes('Email')
									}>
									<TextField
										label='Email'
										value={state.currentData.Email}
										helperText={
											error.Email
												? 'Please enter a value for this required field'
												: ''
										}
										type='email'
										required
										error={error.Email}
										onChange={(e) => mountData('Email', e.target.value)}
										InputProps={{
											readOnly: true,
										}}
									/>
								</GridInputWrapper>
								<GridInputWrapper
									massUpdating={massUpdating}
									hidden={
										massUpdating &&
										!massUpdateFieldList.includes('Default_Time_Entry_Reason')
									}>
									<AsynchronousSelect2
										label='Default Time Entry Reason'
										name='Default_Time_Entry_Reason'
										formName='Time_Entry_Reason'
										reportName='Time_Entry_Reasons'
										displayValueKey='Name'
										defaultValue={state.currentData.Default_Time_Entry_Reason}
										onChange={(e) => mountData('Default_Time_Entry_Reason', e)}
									/>
								</GridInputWrapper>
							</GridFormSectionWrapper>
						</ThemeCard>

						<ThemeCard
							sx={{ mt: 1 }}
							header={massUpdating ? null : `Customization`}>
							<GridFormSectionWrapper>
								<Grid item xs={12}>
									<Box sx={{ display: 'flex', alignItems: 'center' }}>
										<ColorPicker
											hideTextfield
											value={theme.palette.primary.main}
											onChange={(e) => {
												setTheme((oldTheme) => ({
													...oldTheme,
													palette: {
														...oldTheme.palette,
														primary: {
															main: '#' + e?.hex,
														},
													},
												}));
											}}
										/>
										<ColorPicker
											hideTextfield
											value={theme.palette.secondary.main}
											onChange={(e) => {
												setTheme((oldTheme) => ({
													...oldTheme,
													palette: {
														...oldTheme.palette,
														secondary: {
															main: '#' + e?.hex,
														},
													},
												}));
											}}
										/>
										<ModeSwitch
											label=''
											checked={theme.palette.mode === 'dark'}
											onChange={(e) => {
												setTheme((oldTheme) => ({
													...oldTheme,
													components: {
														...oldTheme.components,
														MuiCssBaseline: {
															styleOverrides: {
																body: e ? darkScrollbar() : null,
															},
														},
													},
													palette: {
														...oldTheme.palette,
														mode: e ? 'dark' : 'light',
														background: {
															default: e ? '#121212' : '#eee',
														},
														tabs: {
															active: e ? '#121212' : '#eee',
															inactive: 'transparent',
															background: e ? '#121212' : '#eee',
														},
													},
												}));
											}}
										/>
									</Box>
								</Grid>

								<GridInputWrapper>
									<FormControl>
										<FormLabel>Presets</FormLabel>
										<RadioGroup
											value={themePresetValue}
											onChange={(e) => setThemePresetValue(e.target.value)}>
											{themePresets.map((preset) => (
												<FormControlLabel
													key={preset.ID}
													value={preset.ID}
													control={<Radio />}
													label={
														<Box sx={{ display: 'flex', alignItems: 'center' }}>
															<ColorPicker
																hideTextfield
																value={preset.Primary_Color}
																onChange={(e) => {
																	if (themePresetValue === preset.ID) {
																		setTheme((oldTheme) => ({
																			...oldTheme,
																			palette: {
																				...oldTheme.palette,
																				primary: {
																					main: '#' + e?.hex,
																				},
																			},
																		}));
																	}
																	setThemePresets((oldPresets) =>
																		oldPresets.map((oldPreset) =>
																			oldPreset.ID === preset.ID
																				? {
																						...oldPreset,
																						Primary_Color: '#' + e?.hex,
																				  }
																				: oldPreset
																		)
																	);
																}}
															/>
															<ColorPicker
																hideTextfield
																value={preset.Secondary_Color}
																onChange={(e) => {
																	if (themePresetValue === preset.ID) {
																		setTheme((oldTheme) => ({
																			...oldTheme,
																			palette: {
																				...oldTheme.palette,
																				secondary: {
																					main: '#' + e?.hex,
																				},
																			},
																		}));
																	}
																	setThemePresets((oldPresets) =>
																		oldPresets.map((oldPreset) =>
																			oldPreset.ID === preset.ID
																				? {
																						...oldPreset,
																						Secondary_Color: '#' + e?.hex,
																				  }
																				: oldPreset
																		)
																	);
																}}
															/>
															<ModeSwitch
																label=''
																checked={Boolean(preset.Theme === 'dark')}
																onChange={(e) => {
																	if (themePresetValue === preset.ID) {
																		setTheme((oldTheme) => ({
																			...oldTheme,
																			components: {
																				...oldTheme.components,
																				MuiCssBaseline: {
																					styleOverrides: {
																						body: e ? darkScrollbar() : null,
																					},
																				},
																			},
																			palette: {
																				...oldTheme.palette,
																				mode: e ? 'dark' : 'light',
																				background: {
																					default: e ? '#121212' : '#eee',
																				},
																				tabs: {
																					active: e ? '#121212' : '#eee',
																					inactive: 'transparent',
																					background: e ? '#121212' : '#eee',
																				},
																			},
																		}));
																	}
																	setThemePresets((oldPresets) =>
																		oldPresets.map((oldPreset) =>
																			oldPreset.ID === preset.ID
																				? {
																						...oldPreset,
																						Theme: e ? 'dark' : 'light',
																				  }
																				: oldPreset
																		)
																	);
																}}
															/>
															<TextField
																value={preset.Name}
																onChange={(e) =>
																	setThemePresets((oldPresets) =>
																		oldPresets.map((oldPreset) =>
																			oldPreset.ID === preset.ID
																				? { ...oldPreset, Name: e.target.value }
																				: oldPreset
																		)
																	)
																}
															/>
														</Box>
													}
												/>
											))}
										</RadioGroup>
									</FormControl>
								</GridInputWrapper>

								{/* <GridInputWrapper
									massUpdating={massUpdating}
									hidden={
										massUpdating &&
										!massUpdateFieldList.includes('Autohide_Nav_Drawer')
									}>
									<FormControlLabel
										control={
											<Checkbox
												checked={
													state.currentData.Autohide_Nav_Drawer === true
														? true
														: false
												}
												onChange={(e) => {
													mountData('Autohide_Nav_Drawer', e.target.checked);
												}}
											/>
										}
										label='Autohide Navigation Drawer'
										//helperText='When disabled, you can minimize/maximize the navigation drawer manually instead of having it trigger by mouseover'
									/>
								</GridInputWrapper> */}
							</GridFormSectionWrapper>
						</ThemeCard>
					</>
				)}

				{currentUser.Admin === 'true' || currentUser.Admin === true ? (
					<ThemeCard header={'Admin'} sx={{ mt: 1 }}>
						<GridFormSectionWrapper>
							<GridInputWrapper>
								<FormControlLabel
									control={
										<Checkbox
											checked={debug}
											onChange={(e) => {
												axiosGetAllRecords({reportName: 'Employees', criteria: 'Active==true'});
											}}
										/>
									}
									label='Debug'
								/>
							</GridInputWrapper>
							<GridInputWrapper
								massUpdating={massUpdating}
								hidden={
									massUpdating &&
									!massUpdateFieldList.includes('Enable_Autosave')
								}>
								<FormControlLabel
									control={
										<Checkbox
											checked={
												state.currentData.Enable_Autosave === true
													? true
													: false
											}
											onChange={(e) => {
												mountData('Enable_Autosave', e.target.checked);
											}}
										/>
									}
									label='Enable Autosave'
								/>
							</GridInputWrapper>
						</GridFormSectionWrapper>
					</ThemeCard>
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

			{/* Form specific children (e.g. Email, Print Wizard) */}
			<RenderPopup
				title={renderPopupData.title}
				open={renderPopupData.title ? true : false}
				onClose={() => setRenderPopupData({})}>
				{renderPopupData.children}
			</RenderPopup>

			{/* Toast messaging in lower right */}
			<ToastMessage data={toastData} defaultLocation={mySettingsModal} />
			<SaveManager formDataState={state} defaultLocation={mySettingsModal} />
		</Box>
	);
};

EmployeeForm.propTypes = {
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
	mySettingsModal: PropTypes.bool,
};

EmployeeForm.defaultProps = {
	loadData: {},
	massUpdating: false,
	massUpdateRecordIds: [],
};

const Wrapper = (props) => {
	return (
		<React.Suspense fallback={<ContextCircularProgressLoader />}>
			<EmployeeForm {...props} />
		</React.Suspense>
	);
};

export default Wrapper;
