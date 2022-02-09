import React from 'react';
import PropTypes from 'prop-types';
import { Box, Button, Typography } from '@mui/material';
import { Autorenew, Close } from '@mui/icons-material';
import ResponsiveDialog from './ResponsiveDialog';
import DatabaseDefaultIcon from '../Helpers/DatabaseDefaultIcon';

const OpportunityClosedWonDialog = ({
	title,
	open,
	onClose,
	onClosedWon,
	children,
}) => {
	return (
		<ResponsiveDialog
			maxWidth='xl'
			sx={{ '& .MuiDialogContent-root': { p: 0 } }}
			title={
				<Box sx={{ display: 'flex' }}>
					<DatabaseDefaultIcon form='Opportunity' sx={{ mr: 0.75 }} />
					<Typography component='span'>
						Congratulations on winning Opportunity{' '}
						<Typography component='span' sx={{ fontWeight: 'bold' }}>
							{title}
						</Typography>!
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
						startIcon={<Autorenew />}
						onClick={onClosedWon}>
						Proceed
					</Button>
				</>
			}
			open={open}
			onClose={onClose}>
			{children}
		</ResponsiveDialog>
	);
};

OpportunityClosedWonDialog.propTypes = {
	title: PropTypes.string.isRequired,
	open: PropTypes.bool,
	onClose: PropTypes.func.isRequired,
	onClosedWon: PropTypes.func.isRequired,
	children: PropTypes.oneOfType([PropTypes.object, PropTypes.array]),
};

export default OpportunityClosedWonDialog;
