import React, { useRef, useState } from 'react';
import PropTypes from 'prop-types';
import { v4 as uuid } from 'uuid';
import { useRecoilState } from 'recoil';
import { applicationTabsState } from '../../recoil/atoms';
import { useWhyDidYouUpdate } from 'use-why-did-you-update';
import { Draggable } from 'react-beautiful-dnd';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableRow from '@mui/material/TableRow';
import {
	Button,
	Checkbox,
	IconButton,
	Collapse,
	Box,
	Link,
	ListItemIcon,
	Menu,
	MenuItem,
	Typography,
	TableHead,
} from '@mui/material';
import {
	Add,
	DragIndicator,
	Edit,
	FileDownload,
	Remove,
} from '@mui/icons-material';
import { alpha } from '@mui/material/styles';
import RenderPopup from '../Helpers/RenderPopup';
import RenderForm from '../Helpers/RenderForm';
import DatabaseDefaultIcon from '../Helpers/DatabaseDefaultIcon';
import {
	zohoDownloadUrlParser,
	zohoFilpathParserFromDownloadUrl,
	zohoFilenameParserFromDownloadUrl,
} from '../Helpers/functions';

const CustomTableRow = React.memo(
	({
		formName,
		reportName,
		row,
		index,
		onSelect,
		onExpand,
		columns,
		enableCollapseRows,
		enableClickToSelect,
		enableDragReorder,
		enableContextMenu,
		onClick,
		onDoubleClick,
		getNameFn,
	}) => {
		// useWhyDidYouUpdate('CustomTableRow.js', {
		// 	formName,
		// 	reportName,
		// 	row,
		// 	index,
		// 	onSelect,
		// 	onExpand,
		// 	columns,
		// 	enableCollapseRows,
		// 	enableClickToSelect,
		// 	enableDragReorder,
		// 	enableContextMenu,
		// 	onClick,
		// 	onDoubleClick,
		// 	getNameFn,
		// });

		const [applicationTabs, setApplicationTabs] =
			useRecoilState(applicationTabsState);
		const valueRef = useRef(null);
		const [contextMenu, setContextMenu] = useState(null);
		const [formDialog, setFormDialog] = useState(false);
		const _onSelect = () => {
			const updatedRow = { ...row };
			updatedRow.Selected = !updatedRow.Selected;
			onSelect(updatedRow);
		};

		const _onExpand = () => {
			const updatedRow = { ...row };
			updatedRow.Expanded = !updatedRow.Expanded;
			onExpand(updatedRow);
		};

		const _onDoubleClick = (r) => {
			onDoubleClick(r);
		};

		//console.log('CustomTableRow.js render', props);

		const handleValueFormat = (row, col) => {
			var value;
			if (Array.isArray(row[col.valueKey])) {
				value = row[col.valueKey]
					.map((el) => {
						if (typeof el === 'object') {
							return el.display_value;
						} else {
							return el;
						}
					})
					.join(', ');
			} else if (typeof row[col.valueKey] === 'object') {
				value = row[col.valueKey].display_value;
			} else {
				value = row[col.valueKey];
			}

			if (col.icon) {
				return col.icon(value);
			}

			if (col.format) {
				//["123159","98789798"]
				//["3860683000014066200","3860683000009265072"]

				return col.format(value);
			}

			//file
			if (col.type === 'file') {
				return (
					<>
						{row[col.valueKey] ? (
							<Button
								color='info'
								startIcon={<FileDownload />}
								onClick={(e) => {
									e.stopPropagation();
									const link = document.createElement('a');
									link.download = zohoFilenameParserFromDownloadUrl(
										row[col.valueKey]
									);
									link.href = zohoDownloadUrlParser(row[col.valueKey]);
									link.click();
								}}>
								{zohoFilenameParserFromDownloadUrl(row[col.valueKey])}
							</Button>
						) : null}
					</>
				);
			}

			if (col.type === 'html') {
				return (
					<Box
						sx={{ maxHeight: '150px', overflowY: 'auto' }}
						dangerouslySetInnerHTML={{ __html: row[col.valueKey] }}></Box>
				);
			}

			return value;
		};

		const handleCommentTypeIconCell = () => {
			const col = columns.filter((col) => col.valueKey === 'Type')[0];

			if (col) {
				return (
					<TableCell
						padding={col.disablePadding ? 'none' : 'normal'}
						align={
							col.type === 'number' || col.type === 'currency'
								? 'right'
								: 'left'
						}>
						{handleValueFormat(row, col)}
					</TableCell>
				);
			}

			return <TableCell></TableCell>;
		};

		const handleContextMenu = (e) => {
			e.preventDefault();
			setContextMenu(
				contextMenu === null
					? {
							mouseX: e.clientX - 2,
							mouseY: e.clientY - 4,
					  }
					: // repeated contextmenu when it is already open closes it with Chrome 84 on Ubuntu
					  // Other native context menus might behave different.
					  // With this behavior we prevent contextmenu from the backdrop to re-locale existing context menus.
					  null
			);
		};

		const handleContextMenuClose = (menuItem) => {
			if (menuItem.onClick) menuItem.onClick();
			setContextMenu(null);
		};

		const menuItems = [
			{
				label: 'Edit',
				icon: <Edit />,
				onClick: () => setFormDialog(true),
			},
			{
				label: 'Edit in New Tab',
				icon: <Edit />,
				onClick: () => {
					setApplicationTabs((old) => [
						...old,
						{
							uuid: uuid(),
							label: `${formName?.replaceAll('_', ' ')}: ${getNameFn(formName, row)}`,
							type: 'form',
							id: row.ID,
							name: formName,
							loadData: row,
						},
					]);
				},
			},
		];

		const getDrawerTitle = () => {
			return (
				<Box sx={{ display: 'flex' }}>
					<DatabaseDefaultIcon form={formName} sx={{ mr: 0.75 }} />
					<Typography
						component='span'
						sx={{ mr: 0.75 }}>{`Editing ${formName.replaceAll(
						'_',
						' '
					)}`}</Typography>
					<Typography component='span' sx={{ fontWeight: 'bold' }}>
						{getNameFn ? getNameFn(row) : null}
					</Typography>
				</Box>
			);
		};

		return (
			<>
				<Draggable
					draggableId={row.ID}
					index={index}
					isDragDisabled={!enableDragReorder}>
					{(provided) => (
						<TableRow
							ref={provided.innerRef}
							{...provided.draggableProps}
							{...(enableClickToSelect ? null : provided.dragHandleProps)}
							onContextMenu={
								!enableContextMenu || row.Selected
									? null
									: (e) => handleContextMenu(e)
							}
							hover
							role='checkbox'
							tabIndex={-1}
							selected={row.Selected}
							sx={{
								backgroundColor: (theme) =>
									row.Type === 'Comment'
										? alpha(theme.palette.info.main, 0.15)
										: 'none',
							}}
							onClick={(e) =>
								enableClickToSelect ? _onSelect() : e.preventDefault()
							}
							onDoubleClick={(e) =>
								enableClickToSelect ? e.preventDefault() : _onDoubleClick(row)
							}>
							<TableCell padding='none' />

							<TableCell
								padding='checkbox'
								onClick={_onSelect}
								onDoubleClick={(e) => e.preventDefault()}>
								<Checkbox checked={row.Selected} />
							</TableCell>

							{enableDragReorder && enableClickToSelect ? (
								<TableCell padding='none'>
									<span {...provided.dragHandleProps}>
										<DragIndicator sx={{ cursor: 'grab' }} />
									</span>
								</TableCell>
							) : null}

							{enableCollapseRows &&
							Array.isArray(row.Collapsible_Line_Items) &&
							row.Collapsible_Line_Items.length > 0 ? (
								<TableCell padding='none' onClick={_onExpand}>
									<IconButton size='small'>
										{row.Expanded ? <Remove /> : <Add />}
									</IconButton>
								</TableCell>
							) : enableCollapseRows ? (
								<TableCell padding='none' />
							) : null}

							{row.Type === 'Comment' ? (
								<>
									{handleCommentTypeIconCell()}
									<TableCell
										sx={{ userSelect: 'none' }}
										colSpan={columns.filter((col) => col.visible).length}>
										<Typography>{row.Description}</Typography>
									</TableCell>
								</>
							) : (
								columns
									.filter((col) => col.visible)
									.map((col, idx) => (
										<TableCell
											key={idx}
											ref={valueRef}
											onClick={(e) =>
												onClick && !enableClickToSelect
													? onClick(row)
													: e.preventDefault()
											}
											padding={col.disablePadding ? 'none' : 'normal'}
											sx={{ userSelect: 'none' }}
											align={
												col.type === 'number' || col.type === 'currency'
													? 'right'
													: 'left'
											}>
											{handleValueFormat(row, col)}
										</TableCell>
									))
							)}
						</TableRow>
					)}
				</Draggable>

				{enableCollapseRows &&
				Array.isArray(row.Collapsible_Line_Items) &&
				row.Collapsible_Line_Items.length > 0 ? (
					<TableRow>
						<TableCell
							style={{ paddingBottom: 0, paddingTop: 0 }}
							colSpan={columns.filter((col) => col.visible).length + 3}>
							<Collapse in={row.Expanded}>
								<Box sx={{ m: 1 }}>
									<Table size='small'>
										<TableHead>
											<TableRow
												sx={{
													backgroundColor: (theme) =>
														theme.palette.mode === 'dark'
															? alpha(theme.palette.background.paper, 0.5)
															: theme.palette.divider,
												}}>
												{columns
													.filter((col) => col.visible)
													.map((col, idx) => {
														return (
															<TableCell
																key={idx}
																align={
																	col.type === 'number' ||
																	col.type === 'currency'
																		? 'right'
																		: 'left'
																}
																padding={
																	col.disablePadding ? 'none' : 'normal'
																}>
																{col.label}
															</TableCell>
														);
													})}
											</TableRow>
										</TableHead>
										{Array.isArray(row.Collapsible_Line_Items) &&
										row.Collapsible_Line_Items.length > 0 ? (
											<TableBody>
												{row.Collapsible_Line_Items.map((collapseRow) => (
													<TableRow
														key={collapseRow.ID}
														sx={{
															backgroundColor: (theme) =>
																theme.palette.mode === 'dark'
																	? alpha(theme.palette.background.paper, 0.5)
																	: theme.palette.divider,
															cursor: 'pointer',
														}}>
														{columns
															.filter((col) => col.visible)
															.map((col, idx) => {
																if (idx === 0) {
																	return (
																		<TableCell
																			key={idx}
																			component='th'
																			scope='row'
																			padding={
																				col.disablePadding ? 'none' : 'normal'
																			}
																			align={
																				col.type === 'number' ||
																				col.type === 'currency'
																					? 'right'
																					: 'left'
																			}>
																			{handleValueFormat(collapseRow, col)}
																		</TableCell>
																	);
																} else {
																	return (
																		<TableCell
																			key={idx}
																			onDoubleClick={(e) =>
																				enableClickToSelect
																					? e.preventDefault()
																					: _onDoubleClick(collapseRow)
																			}
																			padding={
																				col.disablePadding ? 'none' : 'normal'
																			}
																			align={
																				col.type === 'number' ||
																				col.type === 'currency'
																					? 'right'
																					: 'left'
																			}>
																			{handleValueFormat(collapseRow, col)}
																		</TableCell>
																	);
																}
															})}
													</TableRow>
												))}
											</TableBody>
										) : null}
									</Table>
								</Box>
							</Collapse>
						</TableCell>
					</TableRow>
				) : null}

				<Menu
					open={contextMenu !== null}
					onClose={handleContextMenuClose}
					anchorReference='anchorPosition'
					anchorPosition={
						contextMenu !== null
							? { top: contextMenu.mouseY, left: contextMenu.mouseX }
							: undefined
					}>
					{menuItems.map((menuItem) => (
						<MenuItem
							key={menuItem.label}
							onClick={() => handleContextMenuClose(menuItem)}>
							{menuItem.icon ? (
								<ListItemIcon>{menuItem.icon}</ListItemIcon>
							) : null}
							<Typography variant='inherit'>{menuItem.label}</Typography>
						</MenuItem>
					))}
				</Menu>

				<RenderPopup
					open={formDialog}
					onClose={() => setFormDialog(false)}
					//overrideDialogZindex
					title={getDrawerTitle(formName)}>
					<RenderForm
						id={row.ID}
						formName={formName}
						onChange={(data) =>
							console.log('CustomTableRow.js data changed:', data)
						}
					/>
				</RenderPopup>
			</>
		);
	}
);

CustomTableRow.propTypes = {
	formName: PropTypes.string,
	reportName: PropTypes.string,
	row: PropTypes.object.isRequired,
	index: PropTypes.number.isRequired,
	onSelect: PropTypes.func,
	onExpand: PropTypes.func,
	columns: PropTypes.array.isRequired,
	enableCollapseRows: PropTypes.bool,
	enableClickToSelect: PropTypes.bool,
	enableDragReorder: PropTypes.bool,
	enableContextMenu: PropTypes.bool,
	onClick: PropTypes.func,
	onDoubleClick: PropTypes.func,
	getNameFn: PropTypes.func,
};

CustomTableRow.displayName = 'CustomTableRow';

export default CustomTableRow;
