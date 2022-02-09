import React from 'react';
import PropTypes from 'prop-types';
import {
	Box,
	Card,
	CardHeader,
	CardContent,
	Divider,
	IconButton,
	Typography,
} from '@mui/material';

const ThemeCard = ({ sx, elevation, header, headerButtons, children }) => {
	return (
		<Card raised sx={{ ...sx }} elevation={elevation}>
			{/* {header ? (
				<>
					<CardHeader
						title={`${header}`}
						sx={{ p: 1, px: 2, fontWeight: 'bold', fontSize: '16px' }}
						action={
							headerButtons
								? headerButtons.map((btn, idx) => (
										<IconButton key={idx} onClick={btn.onClick} size='large'>
											{btn.icon}
										</IconButton>
								  ))
								: null
						}
					/>
					<Divider sx={{ height: 2 }} variant='middle' />
				</>
			) : null} */}

			{/* <CardContent sx={{ m: 1, p: 1, pb: 1, '&:last-child': { pb: 1 } }}>
				<Box>{children}</Box>
			</CardContent> */}
			{header ? (
				<>
					<Box
						sx={{
							display: 'flex',
							alignItems: 'center',
							justifyContent: 'space-between',
						}}>
						<Typography
							variant='h6'
							sx={{ px: 1, pt: 1 }}
							color='text.secondary'>
							{header}
						</Typography>
						{headerButtons ? (
							<Box>{headerButtons.map((headerButton) => headerButton)}</Box>
						) : null}
					</Box>
					<Divider sx={{ height: 1, mx: 1 }} />
				</>
			) : null}
			<CardContent>{children}</CardContent>
		</Card>
	);
};

ThemeCard.propTypes = {
	elevation: PropTypes.number,
	header: PropTypes.string,
	headerButtons: PropTypes.array,
	children: PropTypes.oneOfType([
		PropTypes.object,
		PropTypes.array,
		PropTypes.node,
	]),
	sx: PropTypes.object,
};

ThemeCard.defaultProps = {
	elevation: 4,
	header: '',
	sx: {},
};

export default ThemeCard;
