import React from 'react';
import PropTypes from 'prop-types';
import {
	FormatAlignLeft,
	FormatAlignCenter,
	FormatAlignRight,
	FormatAlignJustify,
} from '@mui/icons-material';
import { ToggleButtonGroup, ToggleButton, Tooltip } from '@mui/material';

const RichTextToolbarAlign = ({editor}) => {
	return (
		<ToggleButtonGroup size='small'>
			<Tooltip arrow title='Left Align'>
				<ToggleButton value={'left'} selected={editor ? editor.isActive({ textAlign : 'left' }) : null} onClick={() => editor ? editor.chain().focus().setTextAlign('left').run() : null}>
					<FormatAlignLeft />
				</ToggleButton>
			</Tooltip>
			<Tooltip arrow title='Center Align'>
				<ToggleButton value={'center'} selected={editor ? editor.isActive({ textAlign : 'center' }) : null} onClick={() => editor ? editor.chain().focus().setTextAlign('center').run() : null}>
					<FormatAlignCenter />
				</ToggleButton>
			</Tooltip>
			<Tooltip arrow title='Right Align'>
				<ToggleButton value={'right'} selected={editor ? editor.isActive({ textAlign : 'right' }) : null} onClick={() => editor ? editor.chain().focus().setTextAlign('right').run() : null}>
					<FormatAlignRight />
				</ToggleButton>
			</Tooltip>
			<Tooltip arrow title='Justify'>
				<ToggleButton value={'justify'} selected={editor ? editor.isActive({ textAlign : 'justify' }) : null} onClick={() => editor ? editor.chain().focus().setTextAlign('justify').run() : null}>
					<FormatAlignJustify />
				</ToggleButton>	
			</Tooltip>
		</ToggleButtonGroup>
	);
};

RichTextToolbarAlign.propTypes = {
	editor: PropTypes.object,
};

export default RichTextToolbarAlign;
