import React, { useCallback } from 'react';
import { useWhyDidYouUpdate } from 'use-why-did-you-update';
import ResultTableRow from './ResultTableRow';
import ResultTableFooter from './ResultTableFooter';
import { Box, TabeCell, TableCell, TableRow, Tooltip } from '@mui/material';

const TableRowsWrapper = (props) => {
	const {
		tableData,
		setTableData,
		singleSelect,
		visibleColumns,
		clickToSelect,
		enableCollapseRows,
		enableDndRows,
	} = props;
	const { onDoubleClick } = props;
	const onSelect = useCallback(
		(row) => {
			if (singleSelect) {
				// setInitialSelectionsData(oldSelections => {
				//     if(oldSelections) {
				//         oldSelections.map(oldSelection => {
				//             if(oldSelection.ID === row.ID) {
				//                 return row;
				//             } else if(oldSelection.ID !== row.ID && oldSelection.Selected) {
				//                 return {...oldSelection, Selected: false};
				//             } else {
				//                 return oldSelection;
				//             }
				//         })
				//     } else {
				//         return [...[], row];
				//     }
				// })

				//If any row.Selected where
				setTableData((oldRows) =>
					oldRows.map((oldRow) => {
						if (oldRow.ID === row.ID) {
							return row;
						} else if (oldRow.ID !== row.ID && oldRow.Selected) {
							return { ...oldRow, Selected: false };
						} else {
							return oldRow;
						}
					})
				);
			} else {
				// setInitialSelectionsData((oldSelections) => {

				//     if(oldSelections) {

				//         return [...oldSelections, row];
				//     } else {
				//         return [...[], row];
				//     }
				// });

				setTableData((oldRows) =>
					oldRows.map((oldRow) => (oldRow.ID === row.ID ? row : oldRow))
				);
			}
		},
		[setTableData]
	);

	const onExpand = useCallback(
		(row) => {
			setTableData((oldRows) =>
				oldRows.map((oldRow) => (oldRow.ID === row.ID ? row : oldRow))
			);
		},
		[setTableData]
	);

	const onRowDoubleClick = useCallback(
		(row) => {
			onDoubleClick ? onDoubleClick(row) : () => {};
		},
		[onRowDoubleClick]
	);

	useWhyDidYouUpdate('TableRowsWrapper', props);

	const handleFooter = (col) => {
		if (!col.footer) {
			return '';
		}

		if (col.format) {
			return col.format(
				col.footer(
					tableData,
					col.valueKey
				)
			);
		}

		return col.footer(
			tableData,
			col.valueKey
		);
	};

	return (
		<>
			{tableData.map((row, index) => (
					<ResultTableRow
						key={row.ID}
						row={row}
						index={index}
						onSelect={onSelect}
						onExpand={onExpand}
						visibleColumns={visibleColumns}
						clickToSelect={clickToSelect}
						enableCollapseRows={enableCollapseRows}
						enableDndRows={enableDndRows}
						onDoubleClick={onRowDoubleClick}
					/>
				))}
			{visibleColumns.filter((col) => col.visible && col.footer).length > 0 ? (
				<TableRow>
					<TableCell />
					{enableCollapseRows ? <TableCell /> : null}
					{clickToSelect && enableDndRows ? <TableCell /> : null}
					<TableCell />
					{visibleColumns
						.filter((col) => col.visible)
						.map((col) => (
							<TableCell
								align={col.type === 'number' ? 'right' : 'left'}
								key={col.label}>
								{col.footerTooltip ? (
									<Tooltip arrow title={col.footerTooltip} placement="top">
										<Box>{handleFooter(col)}</Box>
									</Tooltip>
								) : (
									handleFooter(col)
								)}
							</TableCell>
						))}
				</TableRow>
			) : null}
		</>
	);
};

export default TableRowsWrapper;
