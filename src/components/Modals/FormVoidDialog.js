import React from 'react';
import PropTypes from 'prop-types';
import { Box, Button, Typography } from '@mui/material';
import { Block, Close, } from '@mui/icons-material';
import ResponsiveDialog from '../Modals/ResponsiveDialog';
import DatabaseDefaultIcon from '../Helpers/DatabaseDefaultIcon';

const FormVoidDialog = ({ formName, formTitle, open, onClose, onVoid, currentVoidState, currentUserIsAdmin }) => {
	return (
		<ResponsiveDialog
			maxWidth='xs'
			title={
				<Box sx={{ display: 'flex' }}>
					<DatabaseDefaultIcon form={formName} sx={{ mr: 0.75 }} />
					<Typography component='span'>
						{currentUserIsAdmin && currentVoidState ? 'Unvoid' : 'Void'}{' '}
						<Typography component='span' sx={{ fontWeight: 'bold' }}>
							{formTitle}
						</Typography>
					</Typography>
				</Box>
			}
			buttons={
				<>
					<Button variant='outlined' startIcon={<Close />} onClick={onClose}>
						Close
					</Button>
					<Button variant='contained' startIcon={<Block />} onClick={onVoid}>
						{currentUserIsAdmin && currentVoidState ? 'Unvoid' : 'Void'}
					</Button>
				</>
			}
			open={open}
			onClose={onClose}>
			<Box>
				Are you sure you want to {currentUserIsAdmin && currentVoidState ? 'unvoid' : 'void'} {formName?.replaceAll('_', ' ')}{' '}
				{formTitle}?
			</Box>
		</ResponsiveDialog>
	);
};

FormVoidDialog.propTypes = {
    formName: PropTypes.string.isRequired,
    formTitle: PropTypes.string,
    open: PropTypes.bool,
    onClose: PropTypes.func.isRequired,
    onVoid: PropTypes.func.isRequired,
	currentVoidState: PropTypes.bool,
	currentUserIsAdmin: PropTypes.bool,
};

export default FormVoidDialog;
