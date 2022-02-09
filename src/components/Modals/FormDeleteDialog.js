import React from 'react';
import PropTypes from 'prop-types';
import {
	Box,
	Button,
	List,
	ListItem,
	ListItemText,
	Typography,
} from '@mui/material';
import { Close, DeleteForever } from '@mui/icons-material';
import ResponsiveDialog from './ResponsiveDialog';
import DatabaseDefaultIcon from '../Helpers/DatabaseDefaultIcon';
import { plurifyFormName } from '../Helpers/functions';

const FormDeleteDialog = ({ formName, formTitle, open, onClose, onDelete }) => {
	return (
		<ResponsiveDialog
			maxWidth='xs'
			title={
				<Box sx={{ display: 'flex' }}>
					<DatabaseDefaultIcon form={formName} sx={{ mr: 0.75 }} />
					<Typography component='span'>
						Delete{' '}
						<Typography component='span' sx={{ fontWeight: 'bold' }}>
							{Array.isArray(formTitle)
								? `Multiple ${plurifyFormName(formName).replaceAll('_', ' ')}`
								: formTitle}
						</Typography>
					</Typography>
				</Box>
			}
			buttons={
				<>
					<Button variant='outlined' startIcon={<Close />} onClick={onClose}>
						Close
					</Button>
					<Button
						variant='contained'
						startIcon={<DeleteForever />}
						onClick={onDelete}>
						Delete
					</Button>
				</>
			}
			open={open}
			onClose={onClose}>
			<Box>
				{Array.isArray(formTitle) ? (
					<>
						<Typography>
							Are you sure you want to DELETE the following{' '}
							{plurifyFormName(formName).replaceAll('_', ' ')}?
						</Typography>
						<List dense sx={{ py: 2 }}>
							{formTitle.map((title) => (
								<ListItem key={title}>
									<ListItemText primary={title} />
								</ListItem>
							))}
						</List>
					</>
				) : (
					<Typography>
						Are you sure you want to DELETE {formName?.replaceAll('_', ' ')}{' '}
						{formTitle}?
					</Typography>
				)}
			</Box>
		</ResponsiveDialog>
	);
};

FormDeleteDialog.propTypes = {
	formName: PropTypes.string.isRequired,
	formTitle: PropTypes.oneOfType([PropTypes.string, PropTypes.array]),
	open: PropTypes.bool,
	onClose: PropTypes.func.isRequired,
	onDelete: PropTypes.func.isRequired,
};

export default FormDeleteDialog;
