import React from 'react';
import PropTypes from 'prop-types';
import { Box, Typography } from '@mui/material';
import DatabaseDefaultIcon from '../Helpers/DatabaseDefaultIcon';
import { plurifyFormName } from './functions';

const ToolbarTitle = ({ mode, formName, recordName }) => {
	const renderTitle = () => {
		switch (mode) {
			case 'massUpdating':
				return (
					<Box sx={{ display: 'flex' }}>
						<DatabaseDefaultIcon form={formName} sx={{ mr: 0.75 }} />
						<Typography component='span'>
							{plurifyFormName(formName.replaceAll('_', ' '))}
						</Typography>
					</Box>
				);
			case 'editing':
				return (
					<Box sx={{ display: 'flex' }}>
						<DatabaseDefaultIcon form={formName} sx={{ mr: 0.75 }} />
						<Typography
							component='span'
							sx={{ mr: 0.75 }}>{`Editing ${formName.replaceAll(
							'_',
							' '
						)}`}</Typography>
						{recordName ? (
							<Typography component='span' sx={{ fontWeight: 'bold' }}>
								{recordName}
							</Typography>
						) : null}
					</Box>
				);
			case 'adding':
				return (
					<Box sx={{ display: 'flex' }}>
						<DatabaseDefaultIcon form={formName} sx={{ mr: 0.75 }} />
						<Typography
							component='span'
							sx={{ mr: 0.75 }}>{`Add New ${formName.replaceAll(
							'_',
							' '
						)}`}</Typography>
					</Box>
				);
			default:
				return (
					<Box sx={{ width: '100%', display: 'flex' }}>
						<DatabaseDefaultIcon form={formName} />
						<Typography sx={{ ml: 2 }}>{plurifyFormName(formName)}</Typography>
					</Box>
				);
		}
	};

	return <>{renderTitle()}</>;
};

ToolbarTitle.propTypes = {
	formName: PropTypes.string.isRequired,
	recordName: PropTypes.string,
	mode: PropTypes.oneOf(['adding', 'editing', 'massUpdating']),
};

export default ToolbarTitle;
