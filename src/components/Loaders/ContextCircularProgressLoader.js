import React from 'react';
import { useRecoilValue } from 'recoil';
import { Box, CircularProgress } from '@mui/material';
import { navBarHeightState } from '../../recoil/atoms';


const ContextCircularProgessLoader = () => {
	const navBarHeight = useRecoilValue(navBarHeightState);
	return (
		<Box sx={{ height: `calc(100vh - ${navBarHeight}px)` }}>
			<Box
				sx={{
					height: '100%',
					display: 'flex',
					alignItems: 'center',
					justifyContent: 'center',
				}}>
				<CircularProgress />
			</Box>
		</Box>
	);
};

export default ContextCircularProgessLoader;
