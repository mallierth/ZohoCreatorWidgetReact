import React, { useEffect, useRef, useState } from 'react';
import PropTypes from 'prop-types';
import RichTextToolbarAlign from './RichTextToolbarAlign';
import RichTextToolbarBasicMarks from './RichTextToolbarBasicMarks';
import RichTextToolbarLists from './RichTextToolbarLists';
import RichTextToolbarCustomButtons from './RichTextToolbarCustomButtons';
import { useEditor, EditorContent } from '@tiptap/react';
import { Node, Extension } from '@tiptap/core';
import StarterKit from '@tiptap/starter-kit';
import Paragraph from '@tiptap/extension-paragraph';
import Highlight from '@tiptap/extension-highlight';
import TextAlign from '@tiptap/extension-text-align';
import Placeholder from '@tiptap/extension-placeholder';
import BulletList from '@tiptap/extension-bullet-list';
import OrderedList from '@tiptap/extension-ordered-list';
import Link from '@tiptap/extension-link';
import ListItem from '@tiptap/extension-list-item';
import Table from '@tiptap/extension-table';
import TableRow from '@tiptap/extension-table-row';
import TableCell from '@tiptap/extension-table-cell';
import TableHeader from '@tiptap/extension-table-header';
import {
	Box,
	FormControl,
	FormHelperText,
	InputLabel,
	Input,
	Paper,
	TextField,
	FilledInput,
} from '@mui/material';
import './RichText.css';
import { v4 as uuid } from 'uuid';

const Div = Node.create({
	name: 'div',
  group: 'block',
  content: 'block*',
  parseHTML() {
    return [
      { tag: 'div' },
    ]
  },
  renderHTML({ HTMLAttributes }) {
    return ['div', HTMLAttributes, 0]
  },
});

const CustomDiv = Div.extend({
	addAttributes() {
		return {
			style: {
				default: '',
				parseHTML: (element) => element.getAttribute('style'),
				renderHTML: (attributes) => ({
					style: attributes.style,
				}),
			},
		};
	},
});

const CustomTable = Table.extend({
	addAttributes() {
		return {
			style: {
				default: '',
				parseHTML: (element) => element.getAttribute('style'),
				renderHTML: (attributes) => ({
					style: attributes.style,
				}),
			},
		};
	},
});

const CustomTableCell = TableCell.extend({
	addAttributes() {
		return {
			style: {
				default: '',
				parseHTML: (element) => element.getAttribute('style'),
				renderHTML: (attributes) => ({
					style: attributes.style,
				}),
			},
		};
	},
});

const CustomTableRow = TableRow.extend({
	addAttributes() {
		return {
			style: {
				default: '',
				parseHTML: (element) => element.getAttribute('style'),
				renderHTML: (attributes) => ({
					style: attributes.style,
				}),
			},
		};
	},
});

const CustomTableHeader = TableHeader.extend({
	addAttributes() {
		return {
			style: {
				default: '',
				parseHTML: (element) => element.getAttribute('style'),
				renderHTML: (attributes) => ({
					style: attributes.style,
				}),
			},
		};
	},
});

const RichTextField = ({
	placeholder,
	defaultValue,
	onChange,
	label,
	autoFocus,
	helperText,
	Component,
	overrideHtml,
	required,
	error,
}) => {
	const [html, setHtml] = useState(null);
	const [update, setUpdate] = useState(null);
	const [focused, setFocused] = useState(Boolean(autoFocus));
	const [hover, setHover] = useState(false);
	const id = useRef(uuid());

	const editor = useEditor({
		extensions: [
			StarterKit,
			Placeholder.configure({
				placeholder,
			}),
			TextAlign.configure({
				types: ['heading', 'paragraph'],
			}),
			Highlight,
			BulletList,
			OrderedList,
			Link,
			ListItem,
			CustomTable,
			CustomTableCell,
			CustomTableRow,
			CustomTableHeader,
      Div,
      CustomDiv,
		],
		placeholder,
		content: defaultValue,
		onUpdate() {
			setUpdate((y) => !y);
		},
		onFocus(e) {
			setFocused(true);
		},
		onBlur(e) {
			setFocused(false);
		},
	});

	useEffect(() => {
		//console.log('editor.schema', editor?.schema);
	}, [editor]);

	useEffect(() => {
		if (overrideHtml && overrideHtml !== html) {
			editor?.commands.setContent(overrideHtml);
			//editor?.commands.fixTables();
		}
	}, [overrideHtml]);

	useEffect(() => {
		if (!editor) return;

		setHtml(editor.getHTML());
	}, [update]);

	useEffect(() => {
		if (!editor) return;

		if (onChange) {
			onChange(html ? html : '');
		}
	}, [html]);

	return (
		<FormControl sx={{ mt: 1 }} fullWidth>
			<InputLabel
				htmlFor={id.current}
				focused={focused}
				sx={{ ml: '-14px' }}
				required={required}
				error={error}>
				{label}
			</InputLabel>
			<Box
				sx={{
					display: 'flex',
					alignItems: 'center',
					justifyContent: 'space-between',
				}}>
				<Box
					sx={{
						display: 'flex',
						mt: 0.5,
						flexWrap: 'wrap',
						'& > *': { mt: 1, mr: 1 },
					}}>
					<RichTextToolbarBasicMarks editor={editor} />
					<RichTextToolbarLists editor={editor} />
					<RichTextToolbarAlign editor={editor} />
					<RichTextToolbarCustomButtons editor={editor} />
				</Box>
				<Box>{Component ? Component : null}</Box>
			</Box>

			{/* <Paper elevation={24} sx={{ px: 1, py: 0.25, mt: 1, }}>
				<EditorContent editor={editor} placeholder={placeholder} />
			</Paper> */}
			<Box
				onMouseOver={() => setHover(true)}
				onMouseLeave={() => setHover(false)}
				sx={{
					px: 1,
					py: 0.25,
					mt: 1,
					zIndex: (theme) => theme.zIndex.drawer + 1,
				}}>
				<EditorContent editor={editor} placeholder={placeholder} />
			</Box>
			{/* <Input id={id.current} sx={{ mt: '-32px', borderBottom: theme => hover ? `2px solid ${theme.palette.mode === 'dark' ? '#fff' : '$000'}` : null }} className={`${focused ? 'Mui-focused' : null}`} tabIndex={-1} value=' '/> */}
			<Input
				id={id.current}
				sx={{
					mt: '-32px',
					borderBottom: (theme) =>
						hover && !focused
							? `1px solid ${theme.palette.action.active}`
							: `1px solid ${theme.palette.action.hover}`,
				}}
				className={focused ? 'Mui-focused' : ''}
				tabIndex={-1}
				value=' '
				error={error}
			/>
			<FormHelperText focused={focused} error={error}>
				{helperText}
			</FormHelperText>
		</FormControl>
	);
};

RichTextField.propTypes = {
	defaultValue: PropTypes.string,
	onChange: PropTypes.func,
	placeholder: PropTypes.string,
	label: PropTypes.string,
	Component: PropTypes.oneOfType([PropTypes.array, PropTypes.object]),
	autoFocus: PropTypes.bool,
	helperText: PropTypes.string,
	overrideHtml: PropTypes.string,
	required: PropTypes.bool,
	error: PropTypes.bool,
};

RichTextField.defaultProps = {
	placeholder: '',
};

export default RichTextField;
