import React from 'react';
import PropTypes from 'prop-types';
import {
	FormatBold,
	FormatItalic,
	FormatStrikethrough,
	Highlight,
} from '@mui/icons-material';
import { ToggleButtonGroup, ToggleButton, Tooltip } from '@mui/material';

const RichTextToolbarBasicMarks = ({editor}) => {
	return (
		<ToggleButtonGroup size='small'>
            <Tooltip arrow title='Bold'>
                <ToggleButton value={'left'} selected={editor ? editor.isActive('bold') : null} onClick={() => editor ? editor.chain().focus().toggleBold().run() : null}>
                    <FormatBold />
                </ToggleButton>
            </Tooltip>
			
            <Tooltip arrow title='Italicize'>
                <ToggleButton value={'center'} selected={editor ? editor.isActive('italic') : null} onClick={() => editor ? editor.chain().focus().toggleItalic().run() : null}>
                    <FormatItalic />
                </ToggleButton>
            </Tooltip>

            <Tooltip arrow title='Strikethrough'>
                <ToggleButton value={'right'} selected={editor ? editor.isActive('strike') : null} onClick={() => editor ? editor.chain().focus().toggleStrike().run() : null}>
                    <FormatStrikethrough />
                </ToggleButton>
            </Tooltip>

            <Tooltip arrow title='Highlight'>
                <ToggleButton value={'justify'} selected={editor ? editor.isActive('highlight') : null} onClick={() => editor ? editor.chain().focus().toggleHighlight().run() : null}>
                    <Highlight />
                </ToggleButton>
            </Tooltip>
		</ToggleButtonGroup>
	);
};

RichTextToolbarBasicMarks.propTypes = {
	editor: PropTypes.object,
};

export default RichTextToolbarBasicMarks;
