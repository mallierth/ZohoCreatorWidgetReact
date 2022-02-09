import React, { useState, useCallback } from 'react';
import PropTypes from 'prop-types';
import TableCell from '@mui/material/TableCell';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import TableSortLabel from '@mui/material/TableSortLabel';
import Checkbox from '@mui/material/Checkbox';
import {
	Box,
	FormControlLabel,
	IconButton,
	Menu,
	MenuItem,
} from '@mui/material';
import { DragIndicator, ViewColumn, Visibility } from '@mui/icons-material';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
/*
const headCells = [
    { id: 'name', type === 'number': false, disablePadding: true, label: 'Dessert (100g serving)' },
    { id: 'calories', type === 'number': true, disablePadding: false, label: 'Calories' },
    { id: 'fat', type === 'number': true, disablePadding: false, label: 'Fat (g)' },
    { id: 'carbs', type === 'number': true, disablePadding: false, label: 'Carbs (g)' },
    { id: 'protein', type === 'number': true, disablePadding: false, label: 'Protein (g)' },
];
*/

const TableHeader = React.memo(
	({
		enableDndRows,
		visibleColumns,
		enableSort,
		enableCollapseRows,
		onSelectAllClick,
		order,
		orderBy,
		numSelected,
		rowCount,
		onRequestSort,
		singleSelect,
		clickToSelect,

		setVisibleColumns,
	}) => {
		const [columnSelectAnchorEl, setColumnSelectAnchorEl] = useState(null);

		const createSortHandler = (property) => (event) => {
			onRequestSort(event, property);
		};

		const handleColumnSelectClick = (e) => {
			setColumnSelectAnchorEl(e.currentTarget);
		};

		const handleColumnSelectClose = () => {
			setColumnSelectAnchorEl(null);
		};

		const handleVisibleColumnReorder = useCallback(
			(visibleColumns) => {
				setVisibleColumns((oldVisibleColumns) =>
					JSON.stringify(oldVisibleColumns) === JSON.stringify(visibleColumns)
						? [...oldVisibleColumns]
						: [...visibleColumns]
				);
			},
			[setVisibleColumns]
		);

		const handleVisibleColumnChange = useCallback(
			(valueKey) => {
				setVisibleColumns((oldVisibleColumns) =>
					oldVisibleColumns.map((oldVisibleColumn) =>
						oldVisibleColumn.valueKey === valueKey
							? { ...oldVisibleColumn, visible: !oldVisibleColumn.visible }
							: { ...oldVisibleColumn }
					)
				);
			},
			[setVisibleColumns]
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
			handleVisibleColumnReorder(
				reorder(
					visibleColumns.filter((column) => !column.hideSelect),
					result.source.index,
					result.destination.index
				)
			);
		};

		return (
			<TableHead sx={{ position: 'relative' }}>
				<TableRow>
					<TableCell padding='none'>
						<IconButton size='small' onClick={handleColumnSelectClick}>
							<Visibility fontSize='inherit' />
						</IconButton>
					</TableCell>

					{enableDndRows && clickToSelect ? (
						<TableCell padding='none' />
					) : null}
					{enableCollapseRows ? <TableCell padding='none' /> : null}

					<TableCell padding='checkbox'>
						{singleSelect ? null : (
							<Checkbox
								indeterminate={numSelected > 0 && numSelected < rowCount}
								checked={rowCount > 0 && numSelected === rowCount}
								onChange={onSelectAllClick}
							/>
						)}
					</TableCell>

					{visibleColumns
						.filter((col) => col.visible)
						.map((col, idx) => {
							return (
								<TableCell
									key={idx}
									align={col.type === 'number' ? 'right' : 'left'}
									padding={col.disablePadding ? 'none' : 'normal'}
									sortDirection={
										enableSort && orderBy === col.valueKey ? order : false
									}>
									{enableSort ? (
										<TableSortLabel
											active={orderBy === col.valueKey && !enableDndRows}
											direction={orderBy === col.valueKey ? order : 'asc'}
											onClick={createSortHandler(col.valueKey)}>
											{col.label}
											{orderBy === col.valueKey ? (
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
													{order === 'desc'
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
								anchorEl={columnSelectAnchorEl}
								keepMounted
								open={Boolean(columnSelectAnchorEl)}
								onClose={handleColumnSelectClose}>
								{visibleColumns
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
														onClick={() =>
															handleVisibleColumnChange(column.valueKey)
														}
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

TableHeader.displayName = 'TableHeader';

TableHeader.propTypes = {
	numSelected: PropTypes.number.isRequired,
	onRequestSort: PropTypes.func.isRequired,
	onSelectAllClick: PropTypes.func.isRequired,
	order: PropTypes.oneOf(['asc', 'desc']).isRequired,
	orderBy: PropTypes.string.isRequired,
	rowCount: PropTypes.number.isRequired,
};
export default TableHeader;
