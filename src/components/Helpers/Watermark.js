import React from 'react';
import PropTypes from 'prop-types';
import { Box, Typography } from '@mui/material';

const Watermark = ({ height, text, severity }) => {
	return (
		<Box
			sx={{
                position: 'absolute',
				display: 'flex',
				justifyContent: 'center',
				alignItems: 'center',
				width: '100%',
				height: height,
				zIndex: theme => theme.zIndex.tooltip + 1,
				pointerEvents: 'none',
				backgroundColor: "common.black",
				opacity: 0.4,
			}}>
			<Typography
				sx={{  
                    color: `${severity}.main`,
					transform: 'rotate(-20deg)',
					fontSize: '15vw',
				}}>
				{text}
			</Typography>
		</Box>
	);
};

Watermark.propTypes = {
	text: PropTypes.string,
	height: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    severity: PropTypes.oneOf(['error', 'info', 'success', 'warning', ]),
};

Watermark.defaultProps = {
	text: 'DISABLED',
	height: '100vh',
    severity: 'info',
};

export default Watermark;
