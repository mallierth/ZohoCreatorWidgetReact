import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import {
	AppBar,
	Box,
	Checkbox,
	Container,
	FormControlLabel,
	IconButton,
	Menu,
	MenuItem,
	Stack,
	Toolbar,
	Tooltip,
	Typography,
} from '@mui/material';
import { Add, FilterAlt } from '@mui/icons-material';

import RenderForm from '../Helpers/RenderForm';
import RenderPopup from '../Helpers/RenderPopup';
import KanbanReport from '../KanbanReport/KanbanReport';
import { forceRerenderState } from '../../recoil/atoms';
import { useSetRecoilState } from 'recoil';
import GenericSave from '../Helpers/GenericSave';
import GenericDelete from '../Helpers/GenericDelete';
import DatabaseDefaultIcon from '../Helpers/DatabaseDefaultIcon';

const priorityStatuses = [
	'To Do',
	'In Progress',
	'Waiting for Info',
	'Pending Review',
	'Done',
];

const initialFilters = [
	{
		label: 'My Priorities',
		customFilterFn: (data, currentUser) =>
			data.map((priority) =>
				priority.Employees.filter((employee) => employee.ID === currentUser.ID)
			),
		selections: [],
		active: false,
	},
	{
		label: 'Employee(s)',
		customFilterFn: (data, employees) =>
			data.map((priority) =>
				priority.Employees.filter((employee) =>
					employees.includes(employee.display_value)
				)
			),
		selections: [], //! List of Employees
		active: false,
	},
	{
		label: 'Tags(s)',
		customFilterFn: (data, tags) =>
			data.map((priority) =>
				priority.Tags.filter((tag) => tags.includes(tag.display_value))
			),
		selections: [], //! List of Tags
		active: false,
	},
];

const formatData = (data) => {
	var tempData = [];
	for (var i = 0; i < priorityStatuses.length; i++) {
		if (data.filter((d) => d.Status === priorityStatuses[i]).length > 0) {
			tempData[i] = data.filter((d) => d.Status === priorityStatuses[i]);
		} else {
			tempData[i] = [];
		}
	}
	return tempData;
};

const PrioritiesKanban = ({ setAppBreadcrumb, resource, maxHeight }) => {
	const [filterAnchorEl, setFilterAnchorEl] = React.useState(null);
	const [recordId, setRecordId] = useState(null);
	const filterMenuOpen = Boolean(filterAnchorEl);
	const [formattedData, setFormattedData] = useState(null);
	const [formAddOpen, setFormAddOpen] = useState(false);
	const [filters] = useState(initialFilters); //[] by default
	//const //setForceRerender = useSetRecoilState(forceRerenderState);
	const [saveData, setSaveData] = useState(null);
	const [deleteData, setDeleteData] = useState(null);
	const data = resource.read();
	const baseUrl =
		'https://creatorapp.zoho.com/visionpointllc/av-professional-services/#Page:';
	const pageName = 'Priorities1';

	useEffect(() => {
		if (setAppBreadcrumb) {
			setAppBreadcrumb([
				{
					href: baseUrl + pageName,
					icon: <DatabaseDefaultIcon form='Priority' sx={{ mr: 1 }} />,
					label: 'Priorities',
				},
			]);
		}
	}, [setAppBreadcrumb]);

	useEffect(() => {
		if (data) {
			const filteredData = data;

			//! Check for active filters

			setFormattedData(formatData(filteredData));
		}
	}, [data, filters]);

	useEffect(() => {
		if (!formAddOpen) {
			setRecordId(null);
			//setForceRerender((d) => !d);
		}
	}, [formAddOpen]);

	const handleCleanup = () => {
		setRecordId(null);
		//setForceRerender((d) => !d);
	};

	const handleFilterClose = () => {
		//const selectedFilter = filters.splice(idx, 0);
		//selectedFilter.active = !selectedFilter.active;
		//setFilters(f => f.splice(idx, 0, selectedFilter));
		setFilterAnchorEl(null);
	};

	const menuItemOptions = [
		{ label: 'Edit', onClick: (id) => onClickEdit(id) },
		{ label: 'Send Email Reminder (NYI)', onClick: (id) => onClickEmail(id) },
		{ label: 'Archive', onClick: (id) => onClickArchive(id) },
		{ label: 'Delete', onClick: (id) => onClickDelete(id) },
	];

	const onClickEdit = (id) => {
		setRecordId(id);
		setFormAddOpen(true);
	};

	const onClickEmail = (id) => {
		setRecordId(id);
	};

	const onClickArchive = (id) => {
		setRecordId(id);
		setSaveData({ Archive: true });
	};

	const onClickDelete = (id) => {
		setDeleteData(`ID=${id}`);
	};

	const onDelete = () => {
		setDeleteData(null);
		//setForceRerender((d) => !d);
	};

	const onDragUpdate = (updatedData) => {
		//! Needs to be formatted into a single array where each entry has an ID

		setSaveData((oldData) => {
			if (
				JSON.stringify(oldData) !==
				JSON.stringify([
					...updatedData[0],
					...updatedData[1],
					...updatedData[2],
					...updatedData[3],
					...updatedData[4],
				])
			) {
				return [
					...updatedData[0],
					...updatedData[1],
					...updatedData[2],
					...updatedData[3],
					...updatedData[4],
				];
			} else if (oldData) {
				return oldData;
			} else {
				return formattedData;
			}
		});
	};

	return (
		<Box sx={{}}>
			<AppBar
				position='relative'
				sx={{
					//top: 51,
					'& .MuiPaper-root': { boxShadow: 'none' },
					backgroundColor: 'background.paper',
				}}>
				<Container maxWidth='xl' disableGutters>
					<Toolbar sx={{ justifyContent: 'space-between' }}>
						<Typography></Typography>
						<Box sx={{ flex: 'grow' }} />
						<Stack direction='row' spacing={2}>
							<Tooltip title='Add New Priority' arrow>
								<IconButton onClick={() => setFormAddOpen(true)} size='large'>
									<Add />
								</IconButton>
							</Tooltip>
							<Tooltip title='Filters (NYI)' arrow>
								<IconButton
									onClick={(e) => setFilterAnchorEl(e.currentTarget)}
									size='large'>
									<FilterAlt />
								</IconButton>
							</Tooltip>
						</Stack>
					</Toolbar>
				</Container>
			</AppBar>

			<KanbanReport
                maxHeight={maxHeight}
				panels={priorityStatuses}
				fieldToPanelNameLink='Status'
				data={formattedData}
				menuItemOptions={menuItemOptions}
				onItemDoubleClick={(id) => onClickEdit(id)}
				onUpdate={onDragUpdate}
				noData={!data || data.length === 0}
				noDataText={
					<Box>
						<Typography variant='h4' align='center' paragraph>
							There are currently no Priorities scheduled
						</Typography>
						<Typography
							variant='subtitle1'
							sx={{
								color: 'text.secondary',
								display: 'flex',
								alignItems: 'center',
								justifyContent: 'center',
							}}
							paragraph>
							Please click the{' '}
							<IconButton
								sx={{ mx: 1 }}
								onClick={() => setFormAddOpen(true)}
								size='large'>
								<Add />
							</IconButton>{' '}
							button at the top of the page to begin adding Priorities!
						</Typography>
					</Box>
				}
			/>

			<Menu
				anchorEl={filterAnchorEl}
				open={filterMenuOpen}
				onClose={() => handleFilterClose()}>
				{filters.map((filter, idx) => (
					<MenuItem key={filter.label} onClick={(e) => e.preventDefault()}>
						<FormControlLabel
							control={<Checkbox onClick={(e) => e.preventDefault()} />}
							label={filter.label}
							checked={filter.active}
							onClick={() => handleFilterClose(idx)}
						/>
					</MenuItem>
				))}
			</Menu>

			<RenderPopup
				title={
					<Box sx={{ display: 'flex' }}>
						<DatabaseDefaultIcon form={'Priority'} sx={{ mr: 0.75 }} />
						<Typography component='span'>{`${
							recordId ? 'Edit' : 'Add'
						} Priority`}</Typography>
					</Box>
				}
				open={formAddOpen}
				onClose={() => setFormAddOpen(false)}>
				<RenderForm
					formName='Priority'
					id={recordId}
					maxHeight={maxHeight - 51}
				/>
			</RenderPopup>

			<GenericSave
				id={recordId}
				updatedData={saveData}
				reportName='Priorities'
				autosaver
				onSave={handleCleanup}
			/>
			<GenericDelete
				reportName='Priorities'
				criteria={deleteData}
				onDelete={onDelete}
			/>
		</Box>
	);
};

PrioritiesKanban.propTypes = {
	setAppBreadcrumb: PropTypes.func,
	resource: PropTypes.object,
	maxHeight: PropTypes.number,
};

export default PrioritiesKanban;
