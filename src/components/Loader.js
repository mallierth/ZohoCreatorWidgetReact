import React from 'react';
import Backdrop from '@mui/material/Backdrop';
import CircularProgress from '@mui/material/CircularProgress';
import Zoom from '@mui/material/Zoom';
import { Box, LinearProgress, Typography } from '@mui/material';

const color = '#BF97C6';

const Loader = ({
	message,
	secondaryMessage,
	height = 4,
	show,
	backgroundColor = 'transparent',
}) => {
	//background.paper
	return (
		<Backdrop
			sx={{
				backgroundColor: backgroundColor,
				color: '#fff',
				zIndex: (theme) => theme.zIndex.drawer + 1,
				flexDirection: 'column',
			}}
			open={show}>
			{/* <CircularProgress color='inherit' />
      <Typography variant='h4' gutterBottom sx={{ position: 'absolute', bottom: 0 }}>
				{message}
			</Typography> */}

			<Typography variant='h4' sx={{ color: color, m: 4 }} component='div'>
				{message}
			</Typography>
			<Typography
				variant='subtitle1'
				sx={{ color: 'rgba(255,255,2255,0.7)' }}
				component='div'>
				{secondaryMessage}
			</Typography>
			<Box sx={{ position: 'absolute', bottom: 0, width: '100%' }}>
				<LinearProgress color='inherit' sx={{ color: color, height: height }} />
			</Box>
		</Backdrop>
	);
};

export default Loader;
