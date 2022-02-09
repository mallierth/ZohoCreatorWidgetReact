import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { useRecoilValue } from 'recoil';
import { Box, Typography } from '@mui/material';
import { GridActionsCellItem } from '@mui/x-data-grid';
import DatabaseDefaultIcon from '../Helpers/DatabaseDefaultIcon';
import CustomTable from '../CustomTable/CustomTable';
import CustomDataTable from '../CustomDataTable/CustomDataTable';
import { sum, currency, intTryParse } from '../Helpers/functions';
import { ContactMail, ManageAccounts } from '@mui/icons-material';
import RenderForm from '../Helpers/RenderForm';
import ResponsiveDialog from '../Modals/ResponsiveDialog';

//? Report Filter Columns
export const columns = [
	{
		field: 'Employees',
		searchField: 'Employees_Full_Names',
		flex: 2,
		valueGetter: ({ value }) =>
			value.map((v) => v.display_value).join(', ') || '',
	},
	{
		field: 'Reference',
		searchField: 'Reference_Name',
		flex: 2,
		valueGetter: ({ value }) => value.display_value || '',
	},
	{
		field: 'Type',
		searchField: 'Type.Name',
		flex: 2,
		valueGetter: ({ value }) => value.display_value || '',
	},
	{
		field: 'Start',
		type: 'dateTime',
		flex: 2,
	},
	{
		field: 'End',
		type: 'dateTime',
		flex: 2,
	},
	{
		field: 'Description',
		searchField: false,
		flex: 5,
		renderCell: ({ value }) => (
			<Box
				sx={{ maxHeight: '150px', overflowY: 'auto' }}
				dangerouslySetInnerHTML={{ __html: value }}></Box>
		),
	},
];

//? Add columns that will be used only for filtering
export const filterColumns = [...columns].sort((a, b) => {
	if (
		a.headerName
			? a.headerName
			: a.field < b.headerName
			? b.headerName
			: b.field
	) {
		return -1;
	} else if (
		a.headerName
			? a.headerName
			: a.field > b.headerName
			? b.headerName
			: b.field
	) {
		return 1;
	} else {
		return 0;
	}
});

const TaskReport = ({
	maxHeight,
	variant,
	forcedCriteria,
	loadData,
	showActions,
}) => {
	const [alertClientDialogOpen, setAlertClientDialogOpen] = useState(false);
	const [alertTechDialogOpen, setAlertTechDialogOpen] = useState(false);
	const [data, setData] = useState({});

	return (
		<>
			<CustomDataTable
				formName='Task'
				height={maxHeight - 16}
				forcedCriteria={forcedCriteria}
				loadDataOnAddNewRow={loadData}
				DataGridProps={{
					checkboxSelection: true,
					disableSelectionOnClick: true,
					rowHeight: 150,
				}}
				WrapperProps={{
					elevation: 4,
				}}
				columns={
					showActions
						? [
								...columns,
								{
									field: 'Actions',
									searchField: false,
									flex: 0.5,
									type: 'actions',
									getActions: (params) => [
										<GridActionsCellItem
											key={params.id}
											icon={<ContactMail />}
											onClick={() => {
												setData(params.row);
												setAlertClientDialogOpen(true);
											}}
											label='Alert Client'
										/>,
										<GridActionsCellItem
											key={params.id}
											icon={<ManageAccounts />}
											onClick={() => {
												setData(params.row);
												setAlertTechDialogOpen(true);
											}}
											label='Alert Tech'
										/>,
									],
								},
						  ]
						: columns
				}
				filterColumns={filterColumns}
				hideFilters={variant === 'tab'} //! add
				hideSearch={variant === 'tab'} //! add
			/>

			<ResponsiveDialog
				sx={{ '& .MuiDialogContent-root': { p: 0 } }}
				title={
					<Box sx={{ display: 'flex' }}>
						<DatabaseDefaultIcon form={'Task'} sx={{ mr: 0.75 }} />
						<Typography component='span'>
							Send Client Alert for{' '}
							<Typography component='span' sx={{ fontWeight: 'bold' }}>
								{data.Title}
							</Typography>
						</Typography>
					</Box>
				}
				open={alertClientDialogOpen}
				onClose={() => {
					setAlertClientDialogOpen(false);
					setData({});
				}}>
				<RenderForm
					formName='Email'
					loadData={{
						...loadData,
						Form: 'Task',
						Task: data.ID,
						Subject_field: '',
						Cc: '',
						To: '',
						Message: '',
						From_Update: 'Support',
						Default_Template_Name: 'Onsite Appointment for Client',
					}}
					onChange={() => console.log('Email sent??')}
					parentForm={'Task'}
					maxHeight={maxHeight - 51}
				/>
			</ResponsiveDialog>

			<ResponsiveDialog
				sx={{ '& .MuiDialogContent-root': { p: 0 } }}
				title={
					<Box sx={{ display: 'flex' }}>
						<DatabaseDefaultIcon form={'Task'} sx={{ mr: 0.75 }} />
						<Typography component='span'>
							Send Technician Alert for{' '}
							<Typography component='span' sx={{ fontWeight: 'bold' }}>
								{data.Title}
							</Typography>
						</Typography>
					</Box>
				}
				open={alertTechDialogOpen}
				onClose={() => {
					setAlertTechDialogOpen(false);
					setData({});
				}}>
				<RenderForm
					formName='Email'
					loadData={{
						...loadData,
						Form: 'Task',
						Task: data.ID,
						Subject_field: '',
						Cc: '',
						To: data.Employees,
						Message: '',
						From_Update: 'Support',
						Default_Template_Name: 'Onsite Appointment for Tech',
					}}
					onChange={() => console.log('Email sent??')}
					parentForm={'Task'}
					maxHeight={maxHeight - 51}
				/>
			</ResponsiveDialog>
		</>
	);
};

TaskReport.propTypes = {
	showActions: PropTypes.bool,
	maxHeight: PropTypes.number,
	forcedCriteria: PropTypes.string,
	loadData: PropTypes.object,
	variant: PropTypes.oneOf(['tab']),
};

TaskReport.defaultProps = {
	forcedCriteria: '',
};

export default TaskReport;
