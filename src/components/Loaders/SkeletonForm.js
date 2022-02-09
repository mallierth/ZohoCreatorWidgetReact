import React from 'react';
import PropTypes from 'prop-types';
import { Box, Grid, Skeleton, TextField } from '@mui/material';

export const SkeletonForm = ({ fieldCount }) => {
	return (
		<Box sx={{ px: 1 }}>
			<Grid
				container
				rowSpacing={{ xs: 4, md: 4 }}
				columnSpacing={4}
				sx={{ mt: { xs: 0 } }}>
				{Array.from('x'.repeat(fieldCount)).map((x, i) => (
					<Grid item xs={12} md={6} key={i}>
						<Skeleton sx={{ display: 'flex' }} height={50}>
						</Skeleton>
					</Grid>
				))}
			</Grid>
		</Box>
	);
};

SkeletonForm.propTypes = {
	fieldCount: PropTypes.number,
};

SkeletonForm.defaultProps = {
	fieldCount: 1,
};

export default SkeletonForm;
