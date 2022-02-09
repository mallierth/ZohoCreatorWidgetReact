import React from 'react';
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

const ResultTableFooter = React.memo((props) => {
	useWhyDidYouUpdate('ResultTableFooter', props);

	const { enableCollapseRows, clickToSelect } = props;
	const { onSelect, onExpand, onDoubleClick } = props; //handleClick, handleExpand
	const { row, index, visibleColumns, tableSubData } = props;
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

	const handleDoubleClick = () => {
		onDoubleClick(row);
	};

	//console.log('ResultTableFooter.js render', props);

	const handleValueFormat = (row, col) => {
    var value;
		if (typeof row[col.valueKey] === 'object') {
			value = row[col.valueKey].display_value;
		} else {
			value = row[col.valueKey];
		}

    if(col.icon) {
      return col.icon(value);
    }

    if(col.format) {
      return col.format(value);
    }

    return value;
	};

	return (
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
					onClick={(e) => (clickToSelect ? handleClick() : e.preventDefault())}
					onDoubleClick={(e) =>
						clickToSelect ? e.preventDefault() : handleDoubleClick(e)
					}>
					{enableDndRows && clickToSelect ? (
						<TableCell padding='checkbox'>
							<span {...provided.dragHandleProps}>
								<DragIndicator sx={{ cursor: 'grab' }} />
							</span>
						</TableCell>
					) : null}

					{enableCollapseRows &&
					tableSubData.filter((subRow) => subRow.Assembly_ID == row.Assembly_ID)
						.length > 0 ? (
						<TableCell padding='checkbox' onClick={handleExpand}>
							<IconButton size='small'>
								{row.Expanded ? <Remove /> : <Add />}
							</IconButton>
						</TableCell>
					) : enableCollapseRows ? (
						<TableCell />
					) : null}

					<TableCell
						padding='checkbox'
						onClick={handleClick}
						onDoubleClick={(e) => e.preventDefault()}>
						<Checkbox checked={row.Selected} />
					</TableCell>

					{visibleColumns
						.filter((col) => col.visible)
						.map((col, idx) => {
							if (idx === 0) {
								return (
									<TableCell
										key={idx}
										component='th'
										scope='row'
										padding={col.disablePadding ? 'none' : 'normal'}
										align={col.type === 'number' ? 'right' : 'left'}>
										{handleValueFormat(row, col)}
									</TableCell>
								);
							} else {
								return (
									<TableCell
										key={idx}
										padding={col.disablePadding ? 'none' : 'normal'}
										align={col.type === 'number' ? 'right' : 'left'}>
										{handleValueFormat(row, col)}
									</TableCell>
								);
							}
						})}

					{enableCollapseRows ? (
						<TableRow>
							<TableCell
								style={{ paddingBottom: 0, paddingTop: 0 }}
								colSpan={6}>
								<Collapse in={row.Expanded} timeout='auto' unmountOnExit>
									<Box margin={1}>
										<Typography variant='h6' gutterBottom component='div'>
											Subtable Title
										</Typography>

										<Table size='small'>
											<TableHead>
												<TableRow>
													<TableCell>Dessert C0</TableCell>
													<TableCell align='right'>Calories C1</TableCell>
													<TableCell align='right'>Fat C2</TableCell>
													<TableCell align='right'>Carbs C3</TableCell>
													<TableCell align='right'>Protein C4</TableCell>
												</TableRow>
											</TableHead>
											<TableBody>
												{tableSubData
													.filter(
														(subRow) => subRow.Assembly_ID == row.Assembly_ID
													)
													.map((subRow) => (
														<TableRow key={subRow.ID}>
															<TableCell component='th' scope='row'>
																{subRow.name}
															</TableCell>
															<TableCell align='right'>
																{subRow.calories}
															</TableCell>
															<TableCell align='right'>{subRow.fat}</TableCell>
															<TableCell align='right'>
																{subRow.carbs}
															</TableCell>
															<TableCell align='right'>
																{subRow.protein}
															</TableCell>
														</TableRow>
													))}
											</TableBody>
										</Table>
									</Box>
								</Collapse>
							</TableCell>
						</TableRow>
					) : null}
				</TableRow>
			)}
		</Draggable>
	);
});

ResultTableFooter.displayName = 'ResultTableFooter';

export default ResultTableFooter;
