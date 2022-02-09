import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { Box, IconButton, TextField } from '@mui/material';
import { Close, }from '@mui/icons-material';

const HelpStep = ({ step, onChange, onClose }) => {
	const [title, setTitle] = useState(step.Title);
	const [content, setContent] = useState(step.Content);

	useEffect(() => {
		setTitle(step.Title);
		setContent(step.Content);
	}, [step]);

	useEffect(() => {
		if (title !== step.Title && content !== step.Content) {
			onChange({ Title: title, Content: content });
		}
	}, [title, content]);

	return (
		<Box
			sx={{
                pt: 2,
				display: 'flex',
				alignItems: 'center',
				justifyContent: 'space-between',
			}}>
			<TextField
				label='Title'
				value={title}
				required
				onChange={(e) => setTitle(e.target.value)}
				sx={{
					px: 1,
				}}
			/>

			<TextField
				label='Content'
				value={content}
				required
				multiline
				onChange={(e) => setContent(e.target.value)}
				placeholder='Enter help text...'
				sx={{
					px: 1,
				}}
			/>

			<IconButton aria-label='close' onClick={onClose}>
				<Close />
			</IconButton>
		</Box>
	);
};

HelpStep.propTypes = {
	step: PropTypes.shape({
		Title: PropTypes.string,
		Content: PropTypes.string,
	}),
	onChange: PropTypes.func,
    onClose: PropTypes.func,
};

export default HelpStep;
