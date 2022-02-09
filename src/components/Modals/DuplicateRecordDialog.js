import React from 'react';
import PropTypes from 'prop-types';
import { Box, Button, Typography } from '@mui/material';
import { Close, ContentCopy, } from '@mui/icons-material';
import ResponsiveDialog from './ResponsiveDialog';
import DatabaseDefaultIcon from '../Helpers/DatabaseDefaultIcon';
import DocmosisButton from '../FormControls/DocmosisButton';

const DuplicateRecordDialog = ({
	title,
	formName,
	open,
	onClose,
	onDuplicate,
	children,
}) => {
	return (
		<ResponsiveDialog
			maxWidth='lg'
			title={
				<Box sx={{ display: 'flex' }}>
					<DatabaseDefaultIcon form={formName} sx={{ mr: 0.75 }} />
					<Typography component='span'>
						Duplicate Selected {formName.replaceAll('_', ' ')}{' '}
						<Typography component='span' sx={{ fontWeight: 'bold' }}>
							{title}
						</Typography>
					</Typography>
				</Box>
			}
			buttons={
				<>
					<Button variant='outlined' startIcon={<Close />} onClick={onClose}>
						Close
					</Button>
					<Button variant='contained' startIcon={<ContentCopy />} onClick={onDuplicate}>
						Duplicate
					</Button>
				</>
			}
			open={open}
			onClose={onClose}>
			{children}
		</ResponsiveDialog>
	);
};

DuplicateRecordDialog.propTypes = {
	title: PropTypes.string,
	formName: PropTypes.string.isRequired,
	open: PropTypes.bool,
	onClose: PropTypes.func.isRequired,
	onDuplicate: PropTypes.func.isRequired,
	children: PropTypes.oneOfType([PropTypes.object, PropTypes.array]),
};

export default DuplicateRecordDialog;
