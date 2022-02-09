import React, { useState, useCallback } from 'react';
import PropTypes from 'prop-types';
import Checkbox from '@mui/material/Checkbox';
import {
	Box,
	FormControlLabel,
	IconButton,
	Menu,
	MenuItem,
	TableCell,
	TableHead,
	TableRow,
	TableSortLabel,
} from '@mui/material';
import { DragIndicator, ViewColumn, Visibility } from '@mui/icons-material';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';

const CustomTableColumnHeader = React.memo(
	({
		columns,
		setColumns,
		rowCount,
		numSelected,
		sortDirection,
		sortColumnKey,
		onSelectAll,
		onColumnSort,
		disableSort,
		enableDragReorder,
		enableCollapseRows,
		enableSingleSelect,
		enableClickToSelect,
	}) => {
		const [anchorEl, setAnchorEl] = useState(null);

		const onColumnMenuClick = (e) => {
			setAnchorEl(e.currentTarget);
		};

		const onColumnMenuClose = () => {
			setAnchorEl(null);
		};

		const onColumnReorder = useCallback(
			(columns) => {
				setColumns((oldVisibleColumns) =>
					JSON.stringify(oldVisibleColumns) === JSON.stringify(columns)
						? [...oldVisibleColumns]
						: [...columns]
				);
			},
			[setColumns]
		);

		const onColumnChange = useCallback(
			(valueKey) => {
				setColumns((oldVisibleColumns) =>
					oldVisibleColumns.map((oldVisibleColumn) =>
						oldVisibleColumn.valueKey === valueKey
							? { ...oldVisibleColumn, visible: !oldVisibleColumn.visible }
							: { ...oldVisibleColumn }
					)
				);
			},
			[setColumns]
		);

		const getDragItemStyle = (isDragging, draggableStyle) => ({
			// some basic styles to make the items look a bit nicer
			//userSelect: "none",
			//padding: 16,
			//margin: `0 0 16px 0`,

			// change background colour if dragging
			opacity: isDragging ? 0 : 1,

			// styles we need to apply on draggables
			...draggableStyle,
		});

		const dragItem = (result) => {
			// dropped outside the list
			if (!result.destination) {
				return;
			}

			const reorder = (list, startIndex, endIndex) => {
				const result = Array.from(list);
				const [removed] = result.splice(startIndex, 1);
				result.splice(endIndex, 0, removed);
				return result;
			};
			onColumnReorder(
				reorder(
					columns.filter((column) => !column.hideSelect),
					result.source.index,
					result.destination.index
				)
			);
		};

		return (
			<TableHead sx={{ position: 'relative' }}>
				<TableRow>
					<TableCell padding='none'>
						<IconButton size='small' onClick={onColumnMenuClick}>
							<Visibility fontSize='inherit' />
						</IconButton>
					</TableCell>

					<TableCell padding='checkbox'>
						{enableSingleSelect ? null : (
							<Checkbox
								indeterminate={numSelected > 0 && numSelected < rowCount}
								checked={rowCount > 0 && numSelected === rowCount}
								onChange={onSelectAll}
							/>
						)}
					</TableCell>

					{enableDragReorder && enableClickToSelect ? (
						<TableCell padding='checkbox' />
					) : null}
					{enableCollapseRows ? <TableCell padding='checkbox' /> : null}

					{columns
						.filter((col) => col.visible)
						.map((col, idx) => {
							return (
								<TableCell
									key={idx}
									align={col.type === 'number' ? 'right' : 'left'}
									padding={col.disablePadding ? 'none' : 'normal'}
									sortDirection={
										!disableSort && sortColumnKey === col.valueKey
											? sortDirection
											: false
									}>
									{!disableSort ? (
										<TableSortLabel
											active={
												sortColumnKey === col.valueKey && !enableDragReorder
											}
											direction={
												sortColumnKey === col.valueKey ? sortDirection : 'asc'
											} //Default sort direction upon first click
											onClick={() => onColumnSort(col.valueKey)}>
											{col.label}
											{sortColumnKey === col.valueKey ? (
												<Box
													component='span'
													sx={{
														border: 0,
														clip: 'rect(0 0 0 0)',
														height: 1,
														margin: -1,
														overflow: 'hidden',
														p: 0,
														position: 'absolute',
														top: 20,
														width: 1,
													}}>
													{sortDirection === 'desc'
														? 'sorted descending'
														: 'sorted ascending'}
												</Box>
											) : null}
										</TableSortLabel>
									) : (
										col.label
									)}
								</TableCell>
							);
						})}
				</TableRow>

				<DragDropContext onDragEnd={dragItem}>
					<Droppable droppableId='droppable'>
						{(provided, snapshot) => (
							<Menu
								ref={provided.innerRef}
								{...provided.droppableProps}
								anchorEl={anchorEl}
								keepMounted
								open={Boolean(anchorEl)}
								onClose={onColumnMenuClose}>
								{columns
									.filter((column) => !column.hideSelect)
									.map((column, index) => (
										<Draggable
											key={column.valueKey}
											draggableId={column.valueKey}
											index={index}>
											{(provided, snapshot) => (
												<MenuItem
													ref={provided.innerRef}
													{...provided.draggableProps}
													onClick={(e) => e.preventDefault()}
													style={getDragItemStyle(
														snapshot.isDragging,
														provided.draggableProps.style
													)}
													disabled={column.disableSelect}>
													<span {...provided.dragHandleProps}>
														<DragIndicator sx={{ cursor: 'grab', mr: 2 }} />
													</span>

													<FormControlLabel
														control={
															<Checkbox
																name={column.valueKey}
																onClick={(e) => e.preventDefault()}
															/>
														}
														label={column.label}
														checked={column.visible}
														onClick={() => onColumnChange(column.valueKey)}
													/>
												</MenuItem>
											)}
										</Draggable>
									))}
								{provided.placeholder}
							</Menu>
						)}
					</Droppable>
				</DragDropContext>
			</TableHead>
		);
	}
);

CustomTableColumnHeader.displayName = 'CustomTableColumnHeader';

CustomTableColumnHeader.propTypes = {
	numSelected: PropTypes.number.isRequired,
	onColumnSort: PropTypes.func.isRequired,
	onSelectAll: PropTypes.func.isRequired,
	sortDirection: PropTypes.oneOf(['asc', 'desc']).isRequired,
	sortColumnKey: PropTypes.string.isRequired,
	rowCount: PropTypes.number.isRequired,
};
export default CustomTableColumnHeader;
