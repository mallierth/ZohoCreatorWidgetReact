import React, { useEffect, useState } from 'react';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import { v4 as uuidv4 } from 'uuid';
import { Box, Grid, Paper, Stack, Typography } from '@mui/material';
import KanbanItem from './KanbanItem';
import KanbanItemWrapper from './KanbanItemWrapper';
import ContextMenu from '../Helpers/ContextMenu';

const reorder = (list, startIndex, endIndex) => {
	const result = Array.from(list);
	const [removed] = result.splice(startIndex, 1);
	result.splice(endIndex, 0, removed);

	return result;
};

/**
 * Moves an item from one list to another list.
 */
const move = (source, destination, droppableSource, droppableDestination) => {
	const sourceClone = Array.from(source);
	const destClone = Array.from(destination);
	const [removed] = sourceClone.splice(droppableSource.index, 1);

	destClone.splice(droppableDestination.index, 0, removed);

	const result = {};
	result[droppableSource.droppableId] = sourceClone;
	result[droppableDestination.droppableId] = destClone;

	return result;
};

const KanbanReport = ({
	panels,
	fieldToPanelNameLink,
	data,
	menuItemOptions,
	onItemDoubleClick,
	onUpdate,
	noData,
	noDataText,
  maxHeight,
}) => {
	const [categories, setCategories] = useState([]); //Array of arrays => each group is an individual array of object data, 4 groups means 4 arrays of data in order

	useEffect(() => {
		if (data) {
			setCategories(data);
		}
	}, [data]);

	const onDragEnd = (result) => {
		const { source, destination } = result;

		// dropped outside the list
		if (!destination) {
			return;
		}
		const sInd = +source.droppableId;
		const dInd = +destination.droppableId;

		if (sInd === dInd) {
			const items = reorder(categories[sInd], source.index, destination.index);
			const newCategories = [...categories];
			newCategories[sInd] = items;

			const tempData = [];
			for (var i = 0; i < panels.length; i++) {
				tempData[i] = [];
				newCategories[i].forEach((d, index) => {
					tempData[i].push({
						...d,
						[fieldToPanelNameLink]: panels[i],
						Priority_Order: index,
					});
				});
			}
			setCategories(tempData);
			if (onUpdate) onUpdate(tempData);
		} else {
			const result = move(
				categories[sInd],
				categories[dInd],
				source,
				destination
			);
			const newCategories = [...categories];
			newCategories[sInd] = result[sInd];
			newCategories[dInd] = result[dInd];

			const tempData = [];
			for (var i = 0; i < panels.length; i++) {
				tempData[i] = [];
				newCategories[i].forEach((d, index) => {
					tempData[i].push({
						...d,
						[fieldToPanelNameLink]: panels[i],
						Priority_Order: index,
					});
				});
			}
			setCategories(tempData);
			if (onUpdate) onUpdate(tempData);
		}
	};

	return (
		<>
			{noData ? (
				<Box
					sx={{
						width: '100%',
						display: 'flex',
						justifyContent: 'center',
						pt: 6,
					}}>
					{noDataText}
				</Box>
			) : (
				<Stack
					direction='row'
					sx={{
						flexWrap: 'wrap',
						justifyContent: 'space-around',
						'.Stack-root>:not(style)+:not(style)': {
							m: { xs: 0 },
							mt: { xs: 2 },
						},
					}}>
					<DragDropContext onDragEnd={onDragEnd}>
						{panels.map((panel, panelIndex) => (
							<Paper
								key={panel}
								elevation={7}
								sx={{ mt: 2, minWidth: 325 + 16 }}>
								<Box
									sx={{
										width: '100%',
										display: 'flex',
										justifyContent: 'center',
									}}>
									<Typography sx={{ p: 2 }}>{panel}</Typography>
								</Box>

								<Box
									sx={{
										maxHeight: maxHeight - 153,
										overflowY: 'auto',
									}}>
									<Droppable droppableId={`${panelIndex}`}>
										{(provided, snapshot) => (
											<Stack
												spacing={2}
												justifyContent='flex-start'
												alignItems='center'
												ref={provided.innerRef}
												{...provided.droppableProps}
												sx={{
													pb: 2,
													minHeight: 160,
													backgroundColor: snapshot.isDraggingOver
														? 'divider'
														: null,
												}}>
												<KanbanItemWrapper
													category={
														categories && Array.isArray(categories)
															? categories[panelIndex]
															: null
													}
													menuItemOptions={menuItemOptions}
													onItemDoubleClick={onItemDoubleClick}
												/>
												{provided.placeholder}
											</Stack>
										)}
									</Droppable>
								</Box>
							</Paper>
						))}
					</DragDropContext>
				</Stack>
			)}
		</>
	);
};
export default KanbanReport;
