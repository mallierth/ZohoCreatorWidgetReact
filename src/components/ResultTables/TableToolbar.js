import React, { useCallback } from 'react';
import PropTypes from 'prop-types';
import { useWhyDidYouUpdate } from 'use-why-did-you-update';
import {
	Box,
	Button,
	IconButton,
	Stack,
	Toolbar,
	Tooltip,
	Typography,
} from '@mui/material';
import {
	Add,
	Build,
	Delete,
	Edit,
	FileCopy,
	FileDownload,
	FilterAlt,
	Search,
} from '@mui/icons-material';
import {
	FormControl,
	InputLabel,
	Input,
	InputAdornment,
} from '@mui/material';
import ExportButton from '../FormControls/ExcelExport';
import TableFilterManager from './TableFilterManager';

const TableToolbar = React.memo((props) => {
	useWhyDidYouUpdate('TableToolbar', props);
	const {
		onAddClicked,
		onEditClicked,
		onMassUpdateClicked,
		onDuplicateClicked,
		onDeleteClicked,
		numSelected,
		searchTerm,
	} = props;
	const {
		formName,
		onSearch,
		showSearch,
		showEdit,
		showMassUpdate,
		showDuplicate,
		showDelete,
		customSelectionMessage,
		showExport,
		visibleColumns,
		disableFilters,
		//savedViews,
		//setSavedViews,
		viewState,
		setActiveView,
		setSaveView,
		setFilters,
	} = props;

	const onToolbarEditClicked = useCallback(() => {
		onEditClicked();
	}, [onEditClicked]);

	const onToolbarAddClicked = useCallback(() => {
		onAddClicked();
	}, [onAddClicked]);

	return (
        <Toolbar
			sx={{
				p: 1,
				color: 'text.primary',
				backgroundColor: numSelected > 0 ? 'secondary.light' : 'none',
			}}>
			{showSearch ? (
				<Box sx={{ pr: 2 }}>
					<FormControl sx={{ display: { xs: 'none', sm: 'inline-flex' } }}>
						<InputLabel
							sx={{
								color:
									numSelected > 0 ? 'secondary.contrastText' : 'text.primary',
							}}>
							Search
						</InputLabel>
						<Input
							autoFocus
							value={searchTerm}
							onChange={(e) => onSearch(e.target.value)}
							endAdornment={
								<InputAdornment position='end'>
									<IconButton
                                        sx={{
											color:
												numSelected > 0
													? 'secondary.contrastText'
													: 'text.primary',
										}}
                                        size="large">
										<Search />
									</IconButton>
								</InputAdornment>
							}
						/>
					</FormControl>
					<IconButton
                        sx={{
							color:
								numSelected > 0 ? 'secondary.contrastText' : 'text.primary',
							display: { xs: 'inline-flex', sm: 'none' },
						}}
                        size="large">
						<Search />
					</IconButton>
				</Box>
			) : null}

			<Box
				sx={{
					display: 'flex',
					flex: 'auto',
					justifyContent: numSelected > 0 ? 'space-between' : 'flex-end',
					alignItems: 'center',
				}}>
				{numSelected > 0 ? (
					<Typography
						sx={{ color: 'secondary.contrastText' }}
						color='inherit'
						variant='subtitle1'
						component='div'>
						{numSelected} selected{' '}
						{customSelectionMessage ? customSelectionMessage : null}
					</Typography>
				) : null}

				{numSelected > 0 ? (
					<Stack direction='row' spacing={2}>
						{showEdit ? (
							<Tooltip arrow title='Edit'>
								<IconButton
                                    onClick={onToolbarEditClicked}
                                    sx={{ color: 'secondary.contrastText' }}
                                    size="large">
									<Edit />
								</IconButton>
							</Tooltip>
						) : null}

						{showMassUpdate ? (
							<Tooltip arrow title='Mass Update'>
								<IconButton
                                    onClick={onMassUpdateClicked}
                                    sx={{ color: 'secondary.contrastText' }}
                                    size="large">
									<Build />
								</IconButton>
							</Tooltip>
						) : null}

						{showDuplicate ? (
							<Tooltip arrow title='Duplicate'>
								<IconButton
                                    onClick={onDuplicateClicked}
                                    sx={{ color: 'secondary.contrastText' }}
                                    size="large">
									<FileCopy />
								</IconButton>
							</Tooltip>
						) : null}

						{showDelete ? (
							<Tooltip arrow title='Delete'>
								<IconButton
                                    onClick={onDeleteClicked}
                                    sx={{ color: 'secondary.contrastText' }}
                                    size="large">
									<Delete />
								</IconButton>
							</Tooltip>
						) : null}

						{showExport ? (
							<ExportButton
								jsonData={[
									{ Col1: 1, Col2: 2 },
									{ Col1: 3, Col2: 4 },
								]}
								fileName='TestExport'>
								<Tooltip arrow title='Export to Excel (.xlsx)'>
									<IconButton sx={{ color: 'secondary.contrastText' }} size="large">
										<FileDownload />
									</IconButton>
								</Tooltip>
							</ExportButton>
						) : null}
					</Stack>
				) : (
					<Stack direction='row' spacing={2}>
						{disableFilters ? null : (
							<TableFilterManager
								color='secondary'
								selectedOption={(e) => console.log(e)}
								size='small'
								columns={visibleColumns}
								//savedViews={savedViews}
								//setSavedViews={setSavedViews}
								viewState={viewState}
								setActiveView={setActiveView}
								setSaveView={setSaveView}
								setFilters={setFilters}
								formName={formName}
							/>
						)}

						<Button
							variant='contained'
							size='small'
							color='secondary'
							startIcon={<Add />}
							onClick={onToolbarAddClicked}>
							New {formName.replaceAll('_', ' ')}
						</Button>
					</Stack>
				)}
			</Box>
		</Toolbar>
    );
});

TableToolbar.propTypes = {
	numSelected: PropTypes.number.isRequired,
};

TableToolbar.displayName = 'TableToolbar';

export default TableToolbar;
