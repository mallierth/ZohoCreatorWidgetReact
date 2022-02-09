import React from 'react';
import PropTypes from 'prop-types';
import { Box, Grid, Paper, Typography } from '@mui/material';

import ContextCircularProgressLoader from '../Loaders/ContextCircularProgressLoader';

const Dashboard = ({ title, color = 'info.light', children, sx }) => {
	return (
		<Box sx={{ pl: 2, pt: 4, ...sx }}>
			<Paper sx={{ p: 2, mb: 1 }} elevation={3}>
				<Paper
					sx={{
						width: 'auto',
						ml: -4,
						mt: -4,
						p: 1,
						bgcolor: color,
						position: 'relative',
					}}>
					<Typography
						variant='h5'
						sx={{
							color: (theme) =>
								theme.palette.mode === 'dark' ? '#000' : '#fff',
						}}>
						{title}
					</Typography>
				</Paper>
				<Grid container spacing={4} rowSpacing={8} sx={{ pt: 4 }}>
					{children}
				</Grid>
			</Paper>
		</Box>
	);
};

Dashboard.propTypes = {
	title: PropTypes.string,
	children: PropTypes.oneOfType([
		PropTypes.object,
		PropTypes.array,
		PropTypes.string,
	]),
	color: PropTypes.string,
	sx: PropTypes.object,
};

const Wrapper = (props) => {
	return (
		<React.Suspense fallback={<ContextCircularProgressLoader />}>
			<Dashboard {...props} />
		</React.Suspense>
	);
};

export default Wrapper;
