import React from 'react';
import PropTypes from 'prop-types';
import { Box, Button, Typography } from '@mui/material';
import { Close, FileDownload } from '@mui/icons-material';
import ResponsiveDialog from './ResponsiveDialog';
import DatabaseDefaultIcon from '../Helpers/DatabaseDefaultIcon';
import DocmosisButton from '../FormControls/DocmosisButton';

const GenerateProposalDialog = ({
	title,
	open,
	onClose,
	printData,
	children,
}) => {
	return (
		<ResponsiveDialog
			title={
				<Box sx={{ display: 'flex' }}>
					<DatabaseDefaultIcon form='Print' sx={{ mr: 0.75 }} />
					<Typography component='span'>
						Generate Proposal Document for{' '}
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
					<DocmosisButton
						type='word'
						templatePath='Opportunities/Proposal v1.docx'
						outputFileName={title}
						data={printData}
					/>
				</>
			}
			open={open}
			onClose={onClose}>
			{children}
		</ResponsiveDialog>
	);
};

GenerateProposalDialog.propTypes = {
	printData: PropTypes.object,
	title: PropTypes.string.isRequired,
	open: PropTypes.bool,
	onClose: PropTypes.func.isRequired,

	children: PropTypes.oneOfType([PropTypes.object, PropTypes.array]),
};

export default GenerateProposalDialog;
