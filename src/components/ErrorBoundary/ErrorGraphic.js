import React from 'react';
import { Backdrop, Typography } from '@mui/material';

const ErrorGraphic = ({error}) => {

	return (
		<Backdrop
			open
			sx={{
				p: 4,
				backgroundColor: 'grey.400',
				zIndex: (theme) => theme.zIndex.drawer + 1,
				flexDirection: 'column',
			}}>
			<Typography
				variant='h4'
				component='div'
				sx={{
					color: 'error.light',
					m: 4,
				}}>
				{'Sorry, an error occurred :('}
			</Typography>
			<Typography
				variant='h6'
				component='div'
				sx={{
					color: 'error.light',
				}}>
				{error.toString()}
			</Typography>
			{/* <Typography
				variant='subtitle1'
				component='div'
				sx={{
					color: 'error.light',
				}}>
				{errorInfo.toString()}
			</Typography> */}
		</Backdrop>
	);
};

export default ErrorGraphic;
