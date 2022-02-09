import React from 'react';
import PropTypes from 'prop-types';
import { Box, Paper, Tabs } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import useMediaQuery from '@mui/material/useMediaQuery';

const TabbedSectionHeader = ({
	value,
	onTabChanged,
	indicatorColor,
	textColor,
	children,
}) => {
	const theme = useTheme();
	const desktopMode = useMediaQuery(theme.breakpoints.up('sm'));

	return (
		<Paper sx={{ mt: 1, mx: 1 }} elevation={4}>
			<Tabs
				value={value}
				onChange={onTabChanged}
				indicatorColor={indicatorColor}
				textColor={textColor}
				variant={desktopMode ? 'scrollable' : 'fullWidth'}
				scrollButtons='auto'>
				{children}
			</Tabs>
		</Paper>
	);
};

TabbedSectionHeader.propTypes = {
	value: PropTypes.oneOfType([PropTypes.number, PropTypes.string]).isRequired,
	onTabChanged: PropTypes.func.isRequired,
	indicatorColor: PropTypes.oneOf(['primary', 'secondary']),
	textColor: PropTypes.oneOf(['inherit', 'primary', 'secondary']),
	children: PropTypes.oneOfType([PropTypes.object, PropTypes.array]),
};

TabbedSectionHeader.defaultProps = {
	indicatorColor: 'primary',
	textColor: 'primary',
};

export default TabbedSectionHeader;
