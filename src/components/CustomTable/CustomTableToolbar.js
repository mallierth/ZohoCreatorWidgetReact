import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { useWhyDidYouUpdate } from 'use-why-did-you-update';
import {
	Box,
	Button,
	ButtonGroup,
	CircularProgress,
	Dialog,
	DialogActions,
	DialogTitle,
	Divider,
	IconButton,
	InputAdornment,
	Grid,
	ListItemIcon,
	ListItemText,
	Menu,
	MenuItem,
	Paper,
	Stack,
	TextField,
	Tooltip,
} from '@mui/material';
import {
	Add,
	AddComment,
	ArrowDownward,
	ArrowUpward,
	Build,
	Compress,
	Delete,
	Edit,
	Expand,
	FileCopy,
	FileDownload,
	MoreVert,
	Search,
	VerticalAlignBottom,
	VerticalAlignTop,
} from '@mui/icons-material';
import { useDebounce } from '../Helpers/CustomHooks';
import { createTheme, ThemeProvider, useTheme } from '@mui/material/styles';
import useMediaQuery from '@mui/material/useMediaQuery';
import DuplicateRecordDialog from '../Modals/DuplicateRecordDialog';
import { getReferenceFormType } from '../Helpers/functions';
import DatabaseDefaultIcon from '../Helpers/DatabaseDefaultIcon';
import LookupField2 from '../FormControls/LookupField2';

const DuplicateQuoteDialog = (props) => {
	return (
		<DuplicateRecordDialog {...props}>{props.children}</DuplicateRecordDialog>
	);
};

DuplicateQuoteDialog.propTypes = {
	formName: PropTypes.string.isRequired,
	open: PropTypes.bool,
	onClose: PropTypes.func.isRequired,
	onDuplicate: PropTypes.func.isRequired,
	children: PropTypes.oneOfType([PropTypes.object, PropTypes.array]),
};

const CustomTableToolbar = ({
	formName,
	numSelected,
	selections,
	searching,
	enableAdd,
	onAdd,

	enableSearch,
	disableSearch,
	onSearch,

	enableEdit,
	onEdit,

	enableMassUpdate,
	onMassUpdate,

	enableExport,
	onExport,
	disableExport,

	disableDuplicate,
	showDuplicate,
	onDuplicate,

	enableDelete,
	onDelete,

	customSelectionMessage,

	disableFilters,
	FilterManager,

	//lineItemTable section
	enableShiftControls,
	onShiftTop,
	onShiftUp,
	onShiftDown,
	onShiftBottom,

	enableAssemblyControls,
	onCompress,
	onExpand,
	disableCompress,
	disableExpand,

	enableAddComment,
	onAddComment,
}) => {
	//useWhyDidYouUpdate('CustomTableToolbar', props);

	const theme = useTheme();
	const desktopMode = useMediaQuery(theme.breakpoints.up('sm'));
	const desktopModeMd = useMediaQuery(theme.breakpoints.up('md'));
	const [searchValue, setSearchValue] = useState(null);
	const debouncedSearchTerm = useDebounce(searchValue, 500);
	const [mobileSearchDialogOpen, setMobileSearchDialogOpen] = useState(false);
	const [mobileSearchTerm, setMobileSearchTerm] = useState('');
	const [anchorEl, setAnchorEl] = React.useState(null);
	const mobileLineItemControlsMenuOpen = Boolean(anchorEl);
	const [duplicateRecordDialogOpen, setDuplicateRecordDialogOpen] =
		useState(false);
	const [duplicateData, setDuplicateData] = useState({});

	useEffect(() => {
		if (selections.length == 1 && showDuplicate) {
			switch (formName) {
				case 'Quote':
					setDuplicateData((old) => ({
						...old,
						title: `${selections[0]?.Name}: ${selections[0]?.Description}`,
						Account: selections[0]?.Account,
						Reference: selections[0]?.Reference,
						Quantity: old.Quantity || 1,
						ID: selections[0]?.ID,
					}));
					break;
			}
		}
	}, [selections, formName, showDuplicate]);

	useEffect(() => {
		if (debouncedSearchTerm || debouncedSearchTerm === '') {
			onSearch(debouncedSearchTerm);
		}
	}, [debouncedSearchTerm]);

	const onOpenMobileSearch = () => {
		setMobileSearchDialogOpen(true);
	};

	const onMobileSearch = () => {
		setSearchValue(mobileSearchTerm);
		onCloseMobileSearch();
	};

	const onCloseMobileSearch = () => {
		setMobileSearchDialogOpen(false);
	};

	const onOpenMobileLineItemControls = (e) => {
		setAnchorEl(e.currentTarget);
	};

	const onCloseMobileLineItemControlsMenu = () => {
		setAnchorEl(null);
	};

	const _onDuplicate = () => {
		if (onDuplicate && Object.keys(duplicateData).length > 0) {
			onDuplicate(duplicateData);
			setDuplicateRecordDialogOpen(false);
		}
	};

	const buildControls = () => {
		return desktopMode ? (
			<Stack direction='row' spacing={1}>
				{enableShiftControls ? (
					<Stack direction='row' spacing={1}>
						<Tooltip arrow title='Shift to Top' placement='top'>
							<span>
								<IconButton
									disabled={numSelected === 0}
									size='large'
									onClick={onShiftTop ? onShiftTop : null}
									sx={{
										color:
											numSelected > 0
												? 'secondary.contrastText'
												: 'secondary.main',
									}}>
									<VerticalAlignTop />
								</IconButton>
							</span>
						</Tooltip>
						<Tooltip arrow title='Shift Up One Row' placement='top'>
							<span>
								<IconButton
									disabled={numSelected === 0}
									size='large'
									onClick={onShiftUp ? onShiftUp : null}
									sx={{
										color:
											numSelected > 0
												? 'secondary.contrastText'
												: 'secondary.main',
									}}>
									<ArrowUpward />
								</IconButton>
							</span>
						</Tooltip>
						<Tooltip arrow title='Shift Down One Row' placement='top'>
							<span>
								<IconButton
									disabled={numSelected === 0}
									size='large'
									onClick={onShiftDown ? onShiftDown : null}
									sx={{
										color:
											numSelected > 0
												? 'secondary.contrastText'
												: 'secondary.main',
									}}>
									<ArrowDownward />
								</IconButton>
							</span>
						</Tooltip>
						<Tooltip arrow title='Shift to Bottom' placement='top'>
							<span>
								<IconButton
									disabled={numSelected === 0}
									size='large'
									onClick={onShiftBottom ? onShiftBottom : null}
									sx={{
										color:
											numSelected > 0
												? 'secondary.contrastText'
												: 'secondary.main',
									}}>
									<VerticalAlignBottom />
								</IconButton>
							</span>
						</Tooltip>
					</Stack>
				) : null}
				{enableAssemblyControls ? (
					<Stack direction='row' spacing={1}>
						<Divider
							orientation='vertical'
							flexItem
							sx={{
								borderColor:
									numSelected > 0 ? 'secondary.contrastText' : 'secondary.main',
							}}
						/>
						<Tooltip
							arrow
							title='Collapse Selections into Single Line Item'
							placement='top'>
							<span>
								<IconButton
									size='large'
									onClick={onCompress ? onCompress : null}
									disabled={disableCompress}
									sx={{
										color:
											numSelected > 0
												? 'secondary.contrastText'
												: 'secondary.main',
									}}>
									<Compress />
								</IconButton>
							</span>
						</Tooltip>
						<Tooltip
							arrow
							title='Expand Selection into Multiple Line Items'
							placement='top'>
							<span>
								<IconButton
									size='large'
									onClick={onExpand ? onExpand : null}
									disabled={disableExpand}
									sx={{
										color:
											numSelected > 0
												? 'secondary.contrastText'
												: 'secondary.main',
									}}>
									<Expand />
								</IconButton>
							</span>
						</Tooltip>
					</Stack>
				) : null}
				{enableAddComment ? (
					<Stack direction='row' spacing={1}>
						<Divider
							orientation='vertical'
							flexItem
							sx={{
								borderColor:
									numSelected > 0 ? 'secondary.contrastText' : 'secondary.main',
							}}
						/>
						<Tooltip arrow title='Add Comment' placement='top'>
							<span>
								<IconButton
									size='large'
									onClick={onAddComment ? onAddComment : null}
									sx={{
										color:
											numSelected > 0
												? 'secondary.contrastText'
												: 'secondary.main',
									}}>
									<AddComment />
								</IconButton>
							</span>
						</Tooltip>
					</Stack>
				) : null}
			</Stack>
		) : (
			<Stack direction='row' spacing={1}>
				<span>
					<IconButton
						onClick={onOpenMobileLineItemControls}
						sx={{
							color:
								numSelected > 0 ? 'secondary.contrastText' : 'text.primary',
						}}
						size='large'>
						<MoreVert />
					</IconButton>
				</span>
			</Stack>
		);
	};

	return (
		<>
			<Paper
				elevation={numSelected > 0 ? 4 : 0}
				sx={{
					mb: 1,
					px: 1,
					display: 'flex',
					height: 64,
					color: 'text.primary',
					backgroundColor: numSelected > 0 ? 'secondary.light' : 'transparent',
				}}>
				<Stack
					direction='row'
					justifyContent='space-between'
					alignItems='center'
					spacing={0}
					sx={{
						width: '100%',
						flexWrap: 'wrap',
					}}>
					{enableSearch ? (
						<Box>
							<ThemeProvider
								theme={createTheme({
									palette: {
										mode:
											numSelected === 0 && theme.palette.mode === 'dark'
												? 'dark'
												: 'light',
										primary: theme.palette.primary,
										secondary: theme.palette.secondary,
									},
								})}>
								<>
									{desktopMode ? (
										<TextField
											sx={{
												width: '30ch',
												'& label.Mui-focused': {
													color:
														numSelected === 0 && theme.palette.mode === 'dark'
															? 'common.white'
															: 'common.black',
												},
												'& .MuiInput-underline:after': {
													borderBottomColor:
														numSelected === 0 && theme.palette.mode === 'dark'
															? 'common.white'
															: 'common.black',
												},
												'&.Mui-focused fieldset': {
													borderColor:
														numSelected === 0 && theme.palette.mode === 'dark'
															? 'common.white'
															: 'common.black',
												},
											}}
											//size='small'
											label='Search'
											autoFocus
											color='secondary'
											variant='standard'
											onChange={(e) => setSearchValue(e.target.value)}
											disabled={disableSearch}
											InputProps={{
												endAdornment: (
													<InputAdornment position='end'>
														<IconButton
															sx={{
																color:
																	numSelected > 0
																		? 'secondary.contrastText'
																		: 'text.primary',
															}}
															size='large'>
															{searching ? (
																<CircularProgress
																	color='secondary'
																	sx={{
																		color:
																			numSelected > 0
																				? 'common.black'
																				: 'secondary',
																	}}
																	size={20}
																/>
															) : (
																<Search />
															)}
														</IconButton>
													</InputAdornment>
												),
											}}
										/>
									) : (
										<IconButton
											onClick={() => onOpenMobileSearch()}
											sx={{
												color:
													numSelected > 0
														? 'secondary.contrastText'
														: 'text.primary',
											}}
											size='large'>
											{searching ? (
												<CircularProgress
													color='secondary'
													sx={{
														color:
															numSelected > 0 ? 'common.black' : 'secondary',
													}}
													size={20}
												/>
											) : (
												<Search />
											)}
										</IconButton>
									)}
								</>
							</ThemeProvider>
						</Box>
					) : enableShiftControls ||
					  enableAssemblyControls ||
					  enableAddComment ? (
						buildControls()
					) : (
						<Box></Box>
					)}

					{numSelected > 0 ? (
						<Stack direction='row' spacing={2}>
							{enableEdit ? (
								<Tooltip arrow title='Edit'>
									<span>
										<IconButton
											onClick={onEdit}
											sx={{ color: 'secondary.contrastText' }}
											size='large'>
											<Edit />
										</IconButton>
									</span>
								</Tooltip>
							) : null}

							{enableMassUpdate ? (
								<Tooltip
									arrow
									title='Mass Update (Temporarily Disabled 1/1/22)'>
									<span>
										<IconButton
											disabled
											onClick={onMassUpdate}
											sx={{ color: 'secondary.contrastText' }}
											size='large'>
											<Build />
										</IconButton>
									</span>
								</Tooltip>
							) : null}

							{showDuplicate ? (
								<Tooltip arrow title='Duplicate'>
									<span>
										<IconButton
											disabled={disableDuplicate}
											onClick={() => setDuplicateRecordDialogOpen(true)}
											sx={{ color: 'secondary.contrastText' }}
											size='large'>
											<FileCopy />
										</IconButton>
									</span>
								</Tooltip>
							) : null}

							{enableExport ? (
								<Tooltip arrow title='Export to Excel (.xlsx)'>
									<span>
										<IconButton
											onClick={onExport}
											sx={{ color: 'secondary.contrastText' }}
											size='large'>
											<FileDownload />
										</IconButton>
									</span>
								</Tooltip>
							) : null}

							{enableDelete ? (
								<Tooltip arrow title='Delete'>
									<span>
										<IconButton
											onClick={onDelete}
											sx={{ color: 'secondary.contrastText' }}
											size='large'>
											<Delete />
										</IconButton>
									</span>
								</Tooltip>
							) : null}
						</Stack>
					) : (
						<Stack direction='row' spacing={2}>
							{!disableFilters && FilterManager ? FilterManager : null}

							<Tooltip arrow title='Export to Excel (.xlsx)'>
								<span>
									<IconButton
										disabled={disableExport}
										onClick={onExport}
										color='secondary'
										size='large'>
										<FileDownload />
									</IconButton>
								</span>
							</Tooltip>

							<Tooltip arrow title={`Add New ${formName.replaceAll('_', ' ')}`}>
								<span>
									<IconButton onClick={onAdd} color='secondary' size='large'>
										<Add />
									</IconButton>
								</span>
							</Tooltip>
						</Stack>
					)}
				</Stack>
			</Paper>

			{!desktopMode ? (
				<Dialog
					onClose={onCloseMobileSearch}
					open={mobileSearchDialogOpen}
					maxWidth='xl'
					PaperProps={{ sx: { position: 'fixed', top: 0, mt: 6 } }}>
					<DialogTitle>Enter a search term</DialogTitle>
					<Box sx={{ width: '100%', p: 4 }}>
						<TextField
							sx={{
								'& label.Mui-focused': {
									color:
										numSelected === 0 && theme.palette.mode === 'dark'
											? 'common.white'
											: 'common.black',
								},
								'& .MuiInput-underline:after': {
									borderBottomColor:
										numSelected === 0 && theme.palette.mode === 'dark'
											? 'common.white'
											: 'common.black',
								},
								'&.Mui-focused fieldset': {
									borderColor:
										numSelected === 0 && theme.palette.mode === 'dark'
											? 'common.white'
											: 'common.black',
								},
							}}
							fullWidth
							//size='small'
							label='Search'
							autoFocus
							color='secondary'
							variant='standard'
							value={mobileSearchTerm}
							onChange={(e) => setMobileSearchTerm(e.target.value)}
							InputProps={{
								endAdornment: (
									<InputAdornment position='end'>
										<IconButton
											sx={{
												color:
													numSelected > 0
														? 'secondary.contrastText'
														: 'text.primary',
											}}
											size='large'>
											{searching ? (
												<CircularProgress
													color='secondary'
													sx={{
														color:
															numSelected > 0 ? 'common.black' : 'secondary',
													}}
													size={20}
												/>
											) : (
												<Search />
											)}
										</IconButton>
									</InputAdornment>
								),
							}}
						/>
					</Box>
					<DialogActions>
						<Button onClick={onCloseMobileSearch}>Close</Button>
						<Button
							color='secondary'
							variant='contained'
							onClick={onMobileSearch}>
							Search
						</Button>
					</DialogActions>
				</Dialog>
			) : null}

			{!desktopMode ? (
				<Menu
					anchorEl={anchorEl}
					open={mobileLineItemControlsMenuOpen}
					onClose={onCloseMobileLineItemControlsMenu}>
					{enableShiftControls ? (
						<div>
							<MenuItem
								disabled={numSelected === 0}
								onClick={() => {
									if (onShiftTop) {
										onShiftTop();
										onCloseMobileLineItemControlsMenu();
									}
								}}>
								<ListItemIcon>
									<VerticalAlignTop fontSize='small' />
								</ListItemIcon>
								<ListItemText>Shift to Top</ListItemText>
							</MenuItem>
							<MenuItem
								disabled={numSelected === 0}
								onClick={() => {
									if (onShiftUp) {
										onShiftUp();
										onCloseMobileLineItemControlsMenu();
									}
								}}>
								<ListItemIcon>
									<VerticalAlignTop fontSize='small' />
								</ListItemIcon>
								<ListItemText>Shift Up One Row</ListItemText>
							</MenuItem>
							<MenuItem
								disabled={numSelected === 0}
								onClick={() => {
									if (onShiftDown) {
										onShiftDown();
										onCloseMobileLineItemControlsMenu();
									}
								}}>
								<ListItemIcon>
									<VerticalAlignTop fontSize='small' />
								</ListItemIcon>
								<ListItemText>Shift Down One Row</ListItemText>
							</MenuItem>
							<MenuItem
								disabled={numSelected === 0}
								onClick={() => {
									if (onShiftBottom) {
										onShiftBottom();
										onCloseMobileLineItemControlsMenu();
									}
								}}>
								<ListItemIcon>
									<VerticalAlignBottom fontSize='small' />
								</ListItemIcon>
								<ListItemText>Shift to Bottom</ListItemText>
							</MenuItem>
						</div>
					) : null}
					{enableAssemblyControls ? (
						<div>
							<Divider />
							<MenuItem
								disabled={disableCompress}
								onClick={() => {
									if (onCompress) {
										onCompress();
										onCloseMobileLineItemControlsMenu();
									}
								}}>
								<ListItemIcon>
									<Compress fontSize='small' />
								</ListItemIcon>
								<ListItemText>
									Collapse Selections into Single Line Item
								</ListItemText>
							</MenuItem>
							<MenuItem
								disabled={disableExpand}
								onClick={() => {
									if (onExpand) {
										onExpand();
										onCloseMobileLineItemControlsMenu();
									}
								}}>
								<ListItemIcon>
									<Expand fontSize='small' />
								</ListItemIcon>
								<ListItemText>
									Expand Selection into Multiple Line Items
								</ListItemText>
							</MenuItem>
						</div>
					) : null}

					{enableAddComment ? (
						<div>
							<Divider />
							<MenuItem
								onClick={() => {
									if (onAddComment) {
										onAddComment();
										onCloseMobileLineItemControlsMenu();
									}
								}}>
								<ListItemIcon>
									<AddComment fontSize='small' />
								</ListItemIcon>
								<ListItemText>Add Comment</ListItemText>
							</MenuItem>
						</div>
					) : null}
				</Menu>
			) : null}

			{showDuplicate ? (
				<DuplicateQuoteDialog
					title={duplicateData.title}
					formName={formName}
					open={duplicateRecordDialogOpen}
					onClose={() => {
						setDuplicateData({});
						setDuplicateRecordDialogOpen(false);
					}}
					onDuplicate={_onDuplicate}>
					<Grid container spacing={2}>
						<Grid item xs={12}>
							<LookupField2
								name='Account'
								label='Account'
								defaultSortByColumn='Name'
								reportName='Accounts_Report'
								required
								error={!duplicateData?.Account}
								defaultValue={duplicateData?.Account}
								onChange={(e) =>
									setDuplicateData((old) => ({ ...old, Account: e }))
								}
								endAdornment={
									<IconButton edge='end' size='large'>
										<DatabaseDefaultIcon form='Account' />
									</IconButton>
								}
							/>
						</Grid>
						<Grid item xs={12}>
							<LookupField2
								name='Reference'
								label='Reference'
								defaultSortByColumn='Name'
								formName='Billing_Entity'
								reportName='Billing_Entities'
								defaultCriteria={
									duplicateData?.Account
										? `Account==${duplicateData.Account.ID}`
										: ''
								}
								required
								error={!duplicateData?.Reference}
								defaultValue={duplicateData.Reference}
								onChange={(e) =>
									setDuplicateData((old) => ({ ...old, Reference: e }))
								}
								endAdornment={
									<IconButton edge='end' size='large'>
										<DatabaseDefaultIcon
											form={getReferenceFormType(duplicateData)}
										/>
									</IconButton>
								}
								referenceFormName={getReferenceFormType(duplicateData)}
							/>
						</Grid>
						<Grid item xs={12}>
							<TextField
								label='Quantity'
								value={duplicateData.Quantity || 0}
								helperText={
									!duplicateData.Quantity
										? 'Please enter a value for this required field'
										: ''
								}
								error={!duplicateData.Quantity}
								type='number'
								onChange={(e) =>
									setDuplicateData((old) => ({
										...old,
										Quantity: Number(e.target.value),
									}))
								}
								required
							/>
						</Grid>
					</Grid>
				</DuplicateQuoteDialog>
			) : null}
		</>
	);
};

CustomTableToolbar.propTypes = {
	numSelected: PropTypes.number.isRequired,
	selections: PropTypes.array,
	formName: PropTypes.string.isRequired,
	searching: PropTypes.bool,
	enableAdd: PropTypes.bool,
	onAdd: PropTypes.func,

	enableSearch: PropTypes.bool,
	disableSearch: PropTypes.bool,
	onSearch: PropTypes.func,

	enableEdit: PropTypes.bool,
	onEdit: PropTypes.func,

	enableMassUpdate: PropTypes.bool,
	onMassUpdate: PropTypes.func,

	enableExport: PropTypes.bool,
	onExport: PropTypes.func,
	disableExport: PropTypes.bool,

	disableDuplicate: PropTypes.bool,
	showDuplicate: PropTypes.bool,
	onDuplicate: PropTypes.func,

	enableDelete: PropTypes.bool,
	onDelete: PropTypes.func,

	customSelectionMessage: PropTypes.bool,

	disableFilters: PropTypes.bool,
	FilterManager: PropTypes.object,

	enableShiftControls: PropTypes.bool,
	onShiftTop: PropTypes.func,
	onShiftUp: PropTypes.func,
	onShiftDown: PropTypes.func,
	onShiftBottom: PropTypes.func,
	enableAssemblyControls: PropTypes.bool,
	onCompress: PropTypes.func,
	onExpand: PropTypes.func,
	disableCompress: PropTypes.bool,
	disableExpand: PropTypes.bool,
	enableAddComment: PropTypes.bool,
	onAddComment: PropTypes.func,
};

CustomTableToolbar.defaultProps = {
	numSelected: 0,
	formName: '',
};

CustomTableToolbar.displayName = 'CustomTableToolbar';

export default CustomTableToolbar;
