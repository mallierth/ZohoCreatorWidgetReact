import React from 'react';
import PropTypes from 'prop-types';
import makeStyles from '@mui/styles/makeStyles';
import AppBar from '@mui/material/AppBar';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';

const TabPanel = (props) => {
	const { children, value, index, ...other } = props;

	//hidden={value !== index}

	return (
		<>
			{value === index ? (
				children
			) : null}
		</>
	);
};

export default TabPanel;
