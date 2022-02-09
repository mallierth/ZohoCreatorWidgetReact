import React from 'react';
import PropTypes from 'prop-types';
import { Box, Divider, Grid, Paper, Typography } from '@mui/material';
import { RunningWithErrors } from '@mui/icons-material';
import { focusPop } from '../Helpers/animations';

const DashboardCard = ({
	headerText = 'Title',
	subHeaderText,
	dataText = 'Data',
	Caption,
	Icon,
	bgcolor = 'primary.main',
	onClick,
}) => {
	return (
		<Grid item xs={12} md={6} xl={3}>
			<Paper
				elevation={5}
				onClick={() => (onClick ? onClick() : null)}
				sx={focusPop()}>
				<Box sx={{ textAlign: 'right', p: 1, pr: 2 }}>
					<Paper
						sx={{
							float: 'left',
							ml: 1,
							mt: -3,
							bgcolor,
							display: 'flex',
							alignItems: 'center',
							justifyContent: 'center',
							width: '90px',
							p: 3,
							boxShadow: 8,
						}}>
						{Icon ? (
							Icon
						) : (
							<RunningWithErrors fontSize='large' sx={{ color: '#fff' }} />
						)}
					</Paper>
					<Typography variant='subtitle1' sx={{ color: 'text.secondary' }}>
						{headerText}
					</Typography>
					{subHeaderText ? (
						<Typography variant='subtitle1'>{subHeaderText}</Typography>
					) : null}
					<Typography variant='h5'>{dataText}</Typography>
				</Box>
				{Caption ? (
					<>
						<Divider variant='middle' sx={{ pt: 2 }} />
						<Box sx={{ p: 1, px: 2 }}>
							<Typography variant='caption' sx={{ color: 'text.secondary' }}>
								{Caption}
							</Typography>
						</Box>
					</>
				) : null}
			</Paper>
		</Grid>
	);
};

DashboardCard.propTypes = {
	headerText: PropTypes.string,
	subHeaderText: PropTypes.string,
	dataText: PropTypes.string,
	Caption: PropTypes.object,
	bgcolor: PropTypes.string,
	Icon: PropTypes.object,
	onClick: PropTypes.func,
};

export default DashboardCard;
