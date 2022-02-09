import React, { useState } from 'react';
import { useWhyDidYouUpdate } from 'use-why-did-you-update';
import { Draggable } from 'react-beautiful-dnd';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableRow from '@mui/material/TableRow';
import {
	Checkbox,
	IconButton,
	Collapse,
	Box,
	Typography,
	TableHead,
} from '@mui/material';
import { Add, DragIndicator, Remove } from '@mui/icons-material';
import { lighten, alpha } from '@mui/material/styles';

import makeStyles from '@mui/styles/makeStyles';

const ResultTableRow = React.memo((props) => {
	useWhyDidYouUpdate('ResultTableRow', props);

	const { enableCollapseRows, clickToSelect } = props;
	const { onSelect, onExpand, onDoubleClick } = props; //handleClick, handleExpand
	const { row, index, visibleColumns } = props;
	const { enableDndRows } = props;

	const handleClick = () => {
		const updatedRow = { ...row };
		updatedRow.Selected = !updatedRow.Selected;
		onSelect(updatedRow);
	};

	const handleExpand = () => {
		const updatedRow = { ...row };
		updatedRow.Expanded = !updatedRow.Expanded;
		onExpand(updatedRow);
	};

	const handleDoubleClick = r => {
		onDoubleClick(r);
	};

	//console.log('ResultTableRow.js render', props);

	const handleValueFormat = (row, col) => {
		var value;
		if (typeof row[col.valueKey] === 'object') {
			value = row[col.valueKey].display_value;
		} else {
			value = row[col.valueKey];
		}

		if (col.icon) {
			return col.icon(value);
		}

		if (col.format) {
			return col.format(value);
		}

		return value;
	};

	const handleCommentTypeIconCell = () => {

		const col = visibleColumns.filter(col => col.valueKey === 'Type')[0];

		return (
			<TableCell
				padding={col.disablePadding ? 'none' : 'normal'}
				align={col.type === 'number' || col.type === 'currency' ? 'right' : 'left'}>
				{handleValueFormat(row, col)}
			</TableCell>
		)
	}

	return (
		<>
			<Draggable
				draggableId={row.ID}
				index={index}
				isDragDisabled={!enableDndRows}>
				{(provided, snapshot) => (
					<TableRow
						ref={provided.innerRef}
						{...provided.draggableProps}
						{...(clickToSelect ? null : provided.dragHandleProps)}
						hover
						role='checkbox'
						tabIndex={-1}
						selected={row.Selected}
						sx={{ backgroundColor: (theme) => row.Type === 'Comment' ? alpha(theme.palette.info.main, 0.15) : 'none'}}
						onClick={(e) =>
							clickToSelect ? handleClick() : e.preventDefault()
						}
						onDoubleClick={(e) =>
							clickToSelect ? e.preventDefault() : handleDoubleClick(row)
						}>
						<TableCell padding='none' />

						{enableDndRows && clickToSelect ? (
							<TableCell padding='none'>
								<span {...provided.dragHandleProps}>
									<DragIndicator sx={{ cursor: 'grab' }} />
								</span>
							</TableCell>
						) : null}

						{enableCollapseRows &&
						Array.isArray(row.Collapsible_Line_Items) &&
						row.Collapsible_Line_Items.length > 0 ? (
							<TableCell padding='none' onClick={handleExpand}>
								<IconButton size='small'>
									{row.Expanded ? <Remove /> : <Add />}
								</IconButton>
							</TableCell>
						) : enableCollapseRows ? (
							<TableCell padding='none' />
						) : null}

						<TableCell
							padding='checkbox'
							onClick={handleClick}
							onDoubleClick={(e) => e.preventDefault()}>
							<Checkbox checked={row.Selected} />
						</TableCell>

						{row.Type === 'Comment' ? (
							<>
								{handleCommentTypeIconCell()}
								<TableCell
									sx={{ userSelect: 'none'  }}
									colSpan={visibleColumns.filter((col) => col.visible).length}>
									<Typography>{row.Description}</Typography>
								</TableCell>
							</>
						) : (
							visibleColumns
								.filter((col) => col.visible)
								.map((col, idx) => (
									<TableCell
										key={idx}
										padding={col.disablePadding ? 'none' : 'normal'}
										sx={{ userSelect: 'none' }}
										align={col.type === 'number' || col.type === 'currency'  ? 'right' : 'left'}>
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
				<TableRow sx={{ visibility: row.Expanded ? 'visible' : 'collapse' }}>
					<TableCell
						style={{ paddingBottom: 0, paddingTop: 0 }}
						colSpan={visibleColumns.filter((col) => col.visible).length + 3}>
						<Collapse in={row.Expanded} timeout='auto' unmountOnExit>
							<Box sx={{ m: 1 }}>
								<Table size='small'>
									<TableHead>
										<TableRow sx={{ backgroundColor: (theme) => theme.palette.mode === 'dark' ? alpha(theme.palette.background.paper, 0.5) : theme.palette.divider }}>
											{visibleColumns
												.filter((col) => col.visible)
												.map((col, idx) => {
													return (
														<TableCell
															key={idx}
															align={col.type === 'number' || col.type === 'currency'  ? 'right' : 'left'}
															padding={col.disablePadding ? 'none' : 'normal'}>
															{col.label}
														</TableCell>
													);
												})}
										</TableRow>
									</TableHead>
									<TableBody>
										{row.Collapsible_Line_Items.map((collapseRow) => (
											<TableRow key={collapseRow.ID} sx={{ backgroundColor: (theme) => theme.palette.mode === 'dark' ? alpha(theme.palette.background.paper, 0.5) : theme.palette.divider, cursor: 'pointer' }}>
												{visibleColumns
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
																		col.type === 'number' || col.type === 'currency' ? 'right' : 'left'
																	}>
																	{handleValueFormat(collapseRow, col)}
																</TableCell>
															);
														} else {
															return (
																<TableCell
																	key={idx}
																	onDoubleClick={(e) =>
																		clickToSelect ? e.preventDefault() : handleDoubleClick(collapseRow)
																	}
																	padding={
																		col.disablePadding ? 'none' : 'normal'
																	}
																	align={
																		col.type === 'number' || col.type === 'currency' ? 'right' : 'left'
																	}>
																	{handleValueFormat(collapseRow, col)}
																</TableCell>
															);
														}
													})}
											</TableRow>
										))}
									</TableBody>
								</Table>
							</Box>
						</Collapse>
					</TableCell>
				</TableRow>
			) : null}
		</>
	);
});

ResultTableRow.displayName = 'ResultTableRow';

export default ResultTableRow;
