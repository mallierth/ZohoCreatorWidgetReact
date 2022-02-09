import React, { useEffect, useState } from 'react';
import { useRecoilState, useRecoilValue } from 'recoil';
import PropTypes from 'prop-types';
import {
	AppBar,
	Badge,
	Box,
	Button,
	ButtonGroup,
	Divider,
	Drawer,
	Fab,
	IconButton,
	Menu,
	MenuItem,
	Paper,
	Stack,
	TextField,
	Toolbar,
	Tooltip,
	Typography,
} from '@mui/material';
import {
	Add,
	Anchor,
	ArrowDropDown,
	ConstructionOutlined,
	ContentCopy,
	Delete,
	Edit,
	FilterAlt,
	FilterList,
	LibraryAdd,
	Save,
	Star,
	StarBorder,
	TableView,
} from '@mui/icons-material';
import { yellow } from '@mui/material/colors';
import { currentUserState, themeState } from '../../recoil/atoms';
import CustomTableFilterRow from './CustomTableFilterRow';
import CustomTableFilterRowChild from './CustomTableFilterRowChild';
import GenericSave from '../Helpers/GenericSave';
import GenericDelete from '../Helpers/GenericDelete';
import { createTheme, ThemeProvider, useTheme } from '@mui/material/styles';
import useMediaQuery from '@mui/material/useMediaQuery';

const CustomTableFilterManager = ({
	size = 'small',
	color = 'secondary',
	variant = 'outlined',
	loading,
	columns,
	selectedOption,
	onAddView,
	onDeleteView,
	formName,
	views,
	activeView,
	setActiveView,
	activeFilters,
	setActiveFilters,
	edit = false,
	overrideDialogZindex,
}) => {
	//const theme = useRecoilValue(themeState);
	const theme = useTheme();
	const desktopModeMd = useMediaQuery(theme.breakpoints.up('md'));
	const [_activeFilters, _setActiveFilters] = useState([]);
	const [currentUser, setCurrentUser] = useRecoilState(currentUserState);
	const [open, setOpen] = useState(false);
	const [anchorEl, setAnchorEl] = React.useState(null);
	const [error, setError] = useState(false);
	const [saveData, setSaveData] = useState(null);
	const [updateUserData, setUpdateUserData] = useState(null);
	const [deleteData, setDeleteData] = useState(null);
	const [mountedData, setMountedData] = useState(null);
	const activeViewName =
		views &&
		Array.isArray(views) &&
		activeView &&
		views.filter((v) => v.ID === activeView).length > 0
			? views.filter((v) => v.ID === activeView)[0].Name
			: '';
	const isReadOnly =
		views &&
		Array.isArray(views) &&
		activeView &&
		views.filter((v) => v.ID === activeView).length > 0
			? views.filter((v) => v.ID === activeView)[0].readOnly
			: false;
	const [_activeViewName, _setActiveViewName] = useState('');
	const menuOpen = Boolean(anchorEl);

	useEffect(() => {
		_setActiveViewName(activeViewName);
	}, [activeViewName]);

	useEffect(() => {
		if (edit) {
			setMountedData({
				Form: formName,
				Name: _activeViewName,
				JSON: _activeFilters,
				ID: activeView,
			});
			setOpen(true);
		}
	}, [edit]);

	useEffect(() => {
		if (!Array.isArray(activeFilters) || activeFilters.length === 0) {
			_setActiveFilters([
				...[],
				{
					condition: '',
					field: '',
					operator: '',
					value: '',
					criteriaString: '',
				},
			]);
		} else {
			/*
			//! Perform a check to see if applied criteria matches an existing view
			if(views && Array.isArray(views) && views.filter(v => JSON.stringify(v.JSON) === JSON.stringify(activeFilters)).length > 0) {
				const _view = views.filter(v => JSON.stringify(v.JSON) === JSON.stringify(activeFilters))[0];
				setActiveView(_view.ID);
			} else {
				
			}
			*/
			_setActiveFilters(activeFilters);
		}
	}, [activeFilters]);

	const toggleDrawer = (e, open) => {
		if (e.type === 'keydown' && (e.key === 'Tab' || e.key === 'Shift')) {
			return;
		}

		setOpen(open);

		if (!open) {
			setMountedData(null);
		}
	};

	const filterRowErrorCheck = (data, index, isChild) => {
		if (((!isChild && index > 0) || isChild) && !data.condition) return true;
		if (!data.field) return true;
		if (!data.operator) return true;

		const col = columns.filter((col) => col.valueKey === data.field)[0];
		const field = col
			.operators('')
			.filter((op) => op.label === data.operator)[0];

		if (!field.disableValue && !data.value) {
			return true;
		}

		return false;
	};

	const checkError = () => {
		//TODO check validity
		var err = false;
		mountedData.JSON.forEach((d, i) => {
			let childErr = false;
			if (d.childCriteria && Array.isArray(d.childCriteria)) {
				d.childCriteria.forEach((cd, ci) => {
					if (filterRowErrorCheck(cd, ci)) {
						return (childErr = true);
					}
				});
			}
			if (childErr) {
				return (err = true);
			}

			if (filterRowErrorCheck(d, i)) {
				return (err = true);
			}
		});

		return err;
	};

	const onFilterApply = (e) => {
		//Check validity
		if (!checkError()) {
			//! Perform a check to see if applied criteria matches an existing view
			if (
				views &&
				Array.isArray(views) &&
				views.filter(
					(v) => JSON.stringify(v.JSON) === JSON.stringify(mountedData.JSON)
				).length > 0
			) {
				setActiveView(mountedData.ID);
			} else {
				setActiveFilters(mountedData.JSON);
			}

			setOpen(false);
		} else {
			setError(true);
			setTimeout(() => {
				setError(false);
			}, 3000);
		}
	};

	const onAddViewRequest = () => {
		//Check validity
		if (!checkError()) {
			//TODO Open dialog to name view and optionally set as default
			setSaveData(
				mountedData
					? { ...mountedData, JSON: JSON.stringify(mountedData.JSON) }
					: null
			);
		} else {
			setError(true);
			setTimeout(() => {
				setError(false);
			}, 3000);
		}
	};

	//Select a view
	const handleViewClick = (view) => {
		setActiveView('');
		setActiveView(view.ID);
		onMenuClose();
	};

	const onViewToggleDefault = (view) => {
		//TODO Update Employee
		setCurrentUser((user) => {
			if (
				user[`${formName}_Default_View`] &&
				user[`${formName}_Default_View`].ID === view.ID
			) {
				setUpdateUserData({
					[`${formName}_Default_View`]: '',
				});
				return { ...user, [`${formName}_Default_View`]: '' };
			}

			setUpdateUserData({
				[`${formName}_Default_View`]: { ID: view.ID, display_value: view.Name },
			});

			return {
				...user,
				[`${formName}_Default_View`]: { ID: view.ID, display_value: view.Name },
			};
		});
	};

	const onMenuClose = () => {
		setAnchorEl(null);
	};

	const onAddFilterParentRow = () => {
		setMountedData((old) => ({
			...old,
			JSON: [
				...old.JSON,
				{
					condition: old.JSON.length > 0 ? 'AND' : '',
					field: '',
					operator: '',
					value: '',
					criteriaString: '',
				},
			],
		}));
	};

	const onAddFilterChildRow = (parentIndex) => {
		setMountedData((old) => ({
			...old,
			JSON: old.JSON.map((o, i) => {
				if (i !== parentIndex) {
					return o;
				} else if (o.childCriteria && Array.isArray(o.childCriteria)) {
					return {
						...o,
						childCriteria: [
							...o.childCriteria,
							{
								condition: 'OR',
								field: '',
								operator: '',
								value: '',
								criteriaString: '',
							},
						],
					};
				} else {
					return {
						...o,
						childCriteria: [
							{
								condition: 'OR',
								field: '',
								operator: '',
								value: '',
								criteriaString: '',
							},
						],
					};
				}
			}),
		}));
	};

	const onFilterClose = (index, parentIndex) => {
		if (parentIndex || parentIndex === 0) {
			//! Working with a child, keep it simple and filter out index
			setMountedData((old) => ({
				...old,
				JSON: old.JSON.map((d, i) => {
					if (i === parentIndex) {
						return {
							...d,
							childCriteria: d.childCriteria.filter((c, ci) => ci !== index),
						};
					}

					return d;
				}),
			}));
		} else {
			if (mountedData.JSON.length <= 1) {
				//If this is the first and only entry currently displaying, clear the data
				setMountedData((old) => ({
					...old,
					JSON: [
						...[],
						{
							condition: '',
							field: '',
							operator: '',
							value: '',
							criteriaString: '',
						},
					],
				}));
			} else {
				const newData = mountedData.JSON.filter((el, i) =>
					i !== index ? el : null
				).filter((el) => el);
				setMountedData((old) => ({
					...old,
					JSON: newData.map((d, i) => (i === 0 ? { ...d, condition: '' } : d)),
				})); //Force clear this condition at new index 0
			}
		}
	};

	const onCriteriaChanged = (index, criteriaObject, parentIndex) => {
		if (parentIndex || parentIndex === 0) {
			//! Criteria changed for a child
			//TODO update parent criteriaString to include child

			setMountedData((old) => ({
				...old,
				JSON:
					old.JSON && Array.isArray(old.JSON)
						? old.JSON.map((d, i) => {
								if (
									i !== parentIndex ||
									JSON.stringify(d) === JSON.stringify(old.JSON[parentIndex])
								) {
									return d;
								} else {
									return { ...d, childCriteria: criteriaObject };
								}
						  })
						: [
								...[],
								{
									condition: '',
									field: '',
									operator: '',
									value: '',
									criteriaString: '',
								},
						  ],
			}));
		} else {
			// Equality check here to see if there is legitimate change
			setMountedData((old) => ({
				...old,
				JSON:
					old.JSON && Array.isArray(old.JSON)
						? old.JSON.map((d, i) => {
								if (
									i !== index ||
									JSON.stringify(d) === JSON.stringify(criteriaObject)
								) {
									return d;
								} else {
									return { ...criteriaObject };
								}
						  })
						: [
								...[],
								{
									condition: '',
									field: '',
									operator: '',
									value: '',
									criteriaString: '',
								},
						  ],
			}));
		}
	};

	const onFilterEdit = (view) => {
		//setActiveView(view.ID);
		setMountedData(view);
		setOpen(true);
		onMenuClose();
	};

	//! Determine functionality for dynamic mountedData
	const onFilterCustomize = () => {
		if (activeView) {
			setMountedData({
				ID: activeView,
				Form: formName,
				Name: _activeViewName,
				JSON: _activeFilters,
			});
		} else if (_activeFilters.length > 0) {
			setMountedData({
				ID: '',
				Form: formName,
				Name: '',
				JSON: _activeFilters,
			});
		} else {
			setMountedData({
				Form: formName,
				Name: '',
				JSON: [
					{
						condition: '',
						field: '',
						operator: '',
						value: '',
						criteriaString: '',
					},
				],
			});
		}

		setOpen(true);
	};

	const onFilterAdd = () => {
		setMountedData({
			Form: formName,
			Name: '',
			JSON: [
				{
					condition: '',
					field: '',
					operator: '',
					value: '',
					criteriaString: '',
				},
			],
		});
		setOpen(true);
		onMenuClose();
	};

	const onDeleteViewRequest = () => {
		setDeleteData(
			mountedData && mountedData.ID ? `ID == ${mountedData.ID}` : ''
		);
	};

	useEffect(() => {
		console.log('mountedData change', mountedData);
	}, [mountedData]);

	return (
		<>
			{desktopModeMd ? (
				<>
					<Tooltip arrow title='Saved Custom Views'>
						<IconButton
							onClick={(e) => setAnchorEl(e.currentTarget)}
							color='secondary'
							size='large'>
							<TableView />
						</IconButton>
					</Tooltip>
					<Tooltip arrow title='Open Filter/View Editor'>
						<IconButton
							onClick={() => onFilterCustomize()}
							color='secondary'
							size='large'>
							<FilterAlt />
						</IconButton>
					</Tooltip>
				</>
			) : (
				<Tooltip arrow title='Saved Custom Views'>
					<IconButton
						onClick={(e) => setAnchorEl(e.currentTarget)}
						color='secondary'
						size='large'>
						<Badge badgeContent={_activeFilters.length} color='primary'>
							<FilterAlt />
						</Badge>
					</IconButton>
				</Tooltip>
			)}

			<Menu anchorEl={anchorEl} open={menuOpen} onClose={onMenuClose}>
				{views && Array.isArray(views)
					? views.map((view, index) => (
							<MenuItem
								selected={activeView && view.ID === activeView}
								key={view.ID}>
								<Stack direction='row' spacing={1} alignItems='center'>
									<Box>
										<Tooltip arrow placement='left' title='Default'>
											<span>
												<IconButton
													size='small'
													disabled={view.readOnly}
													onClick={() => onViewToggleDefault(view)}>
													{currentUser[`${formName}_Default_View`] &&
													view.ID ===
														currentUser[`${formName}_Default_View`].ID ? (
														<Anchor fontSize='small' color='primary' />
													) : (
														<Anchor fontSize='small' color='disabled' />
													)}
												</IconButton>
											</span>
										</Tooltip>
									</Box>
									<Box
										sx={{ width: 200 }}
										onClick={() => handleViewClick(view)}>
										{view.Name}
									</Box>
									<Box>
										<Tooltip arrow placement='left' title='Edit'>
											<span>
												<IconButton
													size='small'
													disabled={view.readOnly}
													onClick={() => onFilterEdit(view)}>
													<Edit fontSize='small' color='action' />
												</IconButton>
											</span>
										</Tooltip>
									</Box>
								</Stack>
							</MenuItem>
					  ))
					: null}

				{views && Array.isArray(views) && views.length > 0 ? <Divider /> : null}

				<MenuItem>
					<Stack direction='row' spacing={1} alignItems='center'>
						<Box>
							<IconButton size='small'>
								<Add fontSize='small' color='success' />
							</IconButton>
						</Box>
						<Box sx={{ width: 200 }} onClick={onFilterAdd}>
							Add New
						</Box>
						<Box></Box>
					</Stack>
				</MenuItem>
			</Menu>

			<Drawer
				anchor={'right'}
				open={open}
				onClose={(e) => toggleDrawer(e, false)}
				sx={{
					'& .MuiDrawer-paper': {
						display: 'flex',
						justifyContent: 'space-between',
					},
					'& > .MuiPaper-root': {
						maxWidth: '90%',
						height: '100%',
					},
					zIndex: (theme) =>
						overrideDialogZindex ? theme.zIndex.modal + 1 : theme.zIndex.drawer,
				}}>
				<AppBar color='secondary' enableColorOnDark position='relative'>
					<Toolbar sx={{ minHeight: { xs: 51 } }}>
						<ThemeProvider
							theme={createTheme({
								palette: {
									mode: 'light',
									primary: theme.palette.primary,
									secondary: theme.palette.secondary,
								},
							})}>
							<Box
								sx={{
									width: '100%',
									display: 'flex',
									alignItems: 'center',
									justifyContent: 'space-between',
								}}>
								<Box>
									<Typography
										variant='subtitle1'
										component='span'
										sx={{ px: 2 }}>
										Saved View Name:
									</Typography>
									<TextField
										sx={{ width: '40ch' }}
										value={
											mountedData && mountedData.Name ? mountedData.Name : ''
										}
										variant='standard'
										//helperText={mountedData && mountedData.Name ? '' : 'Please provide a name to save this view to the database'}
										placeholder='To save, please enter a name'
										onChange={(e) =>
											setMountedData((old) =>
												old ? { ...old, Name: e.target.value } : old
											)
										}
									/>
								</Box>
								<Stack direction='row' spacing={2}>
									<Tooltip arrow title={'Add New View'}>
										<IconButton
											onClick={() => {}}
											sx={{
												visibility:
													mountedData && mountedData.ID ? 'visible' : 'none',
											}}>
											<Add />
										</IconButton>
									</Tooltip>
									<Tooltip arrow title={'Duplicate Current View'}>
										<IconButton
											onClick={() => {}}
											sx={{
												visibility:
													mountedData && mountedData.ID ? 'visible' : 'none',
											}}>
											<ContentCopy />
										</IconButton>
									</Tooltip>
									<Tooltip
										arrow
										title={`Delete "${
											mountedData ? mountedData.Name : ''
										}" from the database`}>
										<span>
											<IconButton
												onClick={onDeleteViewRequest}
												disabled={isReadOnly}
												sx={{
													visibility:
														mountedData && mountedData.ID ? 'visible' : 'none',
												}}>
												<Delete />
											</IconButton>
										</span>
									</Tooltip>
								</Stack>
							</Box>
						</ThemeProvider>
					</Toolbar>
				</AppBar>
				<Box
					sx={{
						px: 2,
						pt: 2,
						height: '100%',
						display: 'flex',
						flexDirection: 'column',
						justifyContent: 'space-between',
					}}>
					<Box component='form' autoComplete='off' noValidate>
						{mountedData && mountedData.JSON && Array.isArray(mountedData.JSON)
							? mountedData.JSON.map((op, index) => (
									<Box key={index}>
										<CustomTableFilterRow
											index={index}
											columns={columns}
											rowData={op}
											onChange={onCriteriaChanged}
											onFilterClose={onFilterClose}
											showError={error}
										/>
										{op.childCriteria &&
										Array.isArray(op.childCriteria) &&
										op.childCriteria.length > 0
											? op.childCriteria.map((childOp, childIndex) => (
													<CustomTableFilterRow
														key={childIndex}
														index={childIndex}
														columns={columns}
														rowData={childOp}
														onChange={onCriteriaChanged}
														onFilterClose={onFilterClose}
														showError={error}
														child
														parentIndex={index}
													/>
											  ))
											: null}

										{index <= mountedData.JSON.length - 1 &&
										mountedData.JSON.length > 1 ? (
											<Box
												sx={{
													pt: 1,
													width: '100%',
													display: 'flex',
													alignItems: 'center',
													justifyContent: 'flex-end',
												}}>
												<Tooltip
													arrow
													title='For more advanced use cases, click this button to add a child filter that will be wrapped in parenthesis with the parent'>
													<Fab
														color='secondary'
														size='small'
														onClick={() => onAddFilterChildRow(index)}>
														<Add />
													</Fab>
												</Tooltip>
											</Box>
										) : null}
									</Box>
							  ))
							: null}
						<Button
							sx={{ mt: 2 }}
							color='secondary'
							variant='contained'
							startIcon={<Add />}
							onClick={onAddFilterParentRow}>
							More
						</Button>
					</Box>
					<Stack
						direction='row'
						spacing={2}
						justifyContent='flex-end'
						sx={{ m: 2 }}>
						<Button onClick={(e) => toggleDrawer(e, false)}>Close</Button>
						<Button
							color='secondary'
							onClick={onAddViewRequest}
							disabled={
								isReadOnly ? true : mountedData ? !mountedData.Name : true
							}>
							{mountedData && mountedData.ID
								? `Update "${mountedData.Name}"`
								: 'Save as New Custom View'}
						</Button>
						<Button
							color='secondary'
							variant='contained'
							onClick={onFilterApply}>
							Apply Filters
						</Button>
					</Stack>
				</Box>
			</Drawer>

			<GenericSave
				reportName='Record_Views'
				formName='Record_View'
				id={mountedData ? mountedData.ID : null}
				updatedData={saveData}
				autosaver
				debounceTime={0}
				onSave={(data) => {
					if (onAddView) {
						onAddView(data);
					}
					setMountedData((old) => ({
						...old,
						ID: data.ID,
					}));
				}}
			/>

			<GenericSave
				reportName='Employees'
				formName='Employee'
				id={currentUser ? currentUser.ID : null}
				updatedData={updateUserData}
				autosaver
				debounceTime={500}
				onSave={(data) => {
					console.log('user data saved!', data);
				}}
			/>

			<GenericDelete
				reportName='Record_Views'
				criteria={deleteData}
				idArray={mountedData ? mountedData.ID : null}
				onDelete={(data) => {
					if (onDeleteView) {
						onDeleteView(data);
					}
					setOpen(false);
				}}
			/>
		</>
	);
};

CustomTableFilterManager.propTypes = {
	size: PropTypes.string,
	color: PropTypes.string,
	columns: PropTypes.array.isRequired,
	selectedOption: PropTypes.func,
};

export default CustomTableFilterManager;
