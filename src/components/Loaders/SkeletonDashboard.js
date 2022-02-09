import React from 'react';
import PropTypes from 'prop-types';
import { useRecoilValue } from 'recoil';
import { Box, Container, Grid, Skeleton, TextField } from '@mui/material';
import { Update } from '@mui/icons-material';
import { appMaxWidthState } from '../../recoil/atoms';
import DatabaseDefaultIcon from '../Helpers/DatabaseDefaultIcon';
import DashboardCard from '../Dashboard/DashboardCard';

const Caption = () => {
	return (
		<Box sx={{ display: 'flex', alignItems: 'center' }}>
			<Update sx={{ mr: 0.5 }} />
		</Box>
	);
};

export const SkeletonDashboard = ({ fieldCount }) => {
	const appMaxWidth = useRecoilValue(appMaxWidthState);
	return (
		<Container
			maxWidth='xl'
			disableGutters
			sx={{ maxWidth: { xs: appMaxWidth } }}>
			<Box sx={{ pl: 2, pt: 4 }}>
				<Grid container spacing={4} rowSpacing={8} sx={{ pt: 4 }}>
					{Array.from('x'.repeat(fieldCount)).map((x, i) => (
						<Grid item xs={12} md={6} xl={3} key={i}>
							<Skeleton>
								<DashboardCard
									Icon={
										<DatabaseDefaultIcon
											form='Dashboard'
											fontSize='large'
											sx={{ color: '#fff' }}
										/>
									}
									headerText='Open Opportunities'
									dataText='98'
									Caption={<Caption />}
									bgcolor='info.light'
								/>
							</Skeleton>
						</Grid>
					))}
				</Grid>
			</Box>
		</Container>
	);
};

SkeletonDashboard.propTypes = {
	fieldCount: PropTypes.number,
};

SkeletonDashboard.defaultProps = {
	fieldCount: 1,
};

export default SkeletonDashboard;
