import React from 'react';
import PropTypes from 'prop-types';
import { Box, Button, Typography } from '@mui/material';
import { Autorenew, Close, } from '@mui/icons-material';
import ResponsiveDialog from './ResponsiveDialog';
import DatabaseDefaultIcon from '../Helpers/DatabaseDefaultIcon';
import { LoadingButton } from '@mui/lab';

const ConvertQuoteToSalesOrderDialog = ({
	title,
	open,
	onClose,
	onConvert,
	busy,
}) => {
	return (
		<ResponsiveDialog
			maxWidth='xs'
			title={
				<Box sx={{ display: 'flex' }}>
					<DatabaseDefaultIcon form='Quote' sx={{ mr: 0.75 }} />
					<Typography component='span'>
						Convert Quote{' '}
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
					<LoadingButton
						variant='contained'
						startIcon={<Autorenew />}
						onClick={onConvert}
						loading={busy}>
						Convert
					</LoadingButton>
				</>
			}
			open={open}
			onClose={onClose}>
			<Box>
				Are you sure you want to convert Quote {title} to a Sales Order?
			</Box>
		</ResponsiveDialog>
	);
};

ConvertQuoteToSalesOrderDialog.propTypes = {
	title: PropTypes.string,
	open: PropTypes.bool,
	onClose: PropTypes.func.isRequired,
	onConvert: PropTypes.func.isRequired,
	busy: PropTypes.bool,
};

export default ConvertQuoteToSalesOrderDialog;
