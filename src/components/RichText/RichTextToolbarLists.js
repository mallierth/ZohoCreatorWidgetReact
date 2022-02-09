import React from 'react';
import PropTypes from 'prop-types';
import {
	FormatListBulleted,
	FormatListNumbered,
} from '@mui/icons-material';
import { ToggleButtonGroup, ToggleButton, Tooltip } from '@mui/material';

const RichTextToolbarLists = ({editor}) => {
	return (
		<ToggleButtonGroup size='small'>
			<Tooltip arrow title='Bulleted List'>
				<ToggleButton value={'left'} selected={editor ? editor.isActive('bulletList') : null} onClick={() => editor ? editor.chain().focus().toggleBulletList().run() : null}>
					<FormatListBulleted />
				</ToggleButton>
			</Tooltip>
			<Tooltip arrow title='Numbered List'>
				<ToggleButton value={'center'} selected={editor ? editor.isActive('orderedList') : null} onClick={() => editor ? editor.chain().focus().toggleOrderedList().run() : null}>
					<FormatListNumbered />
				</ToggleButton>
			</Tooltip>
		</ToggleButtonGroup>
	);
};

RichTextToolbarLists.propTypes = {
	editor: PropTypes.object,
};

export default RichTextToolbarLists;
