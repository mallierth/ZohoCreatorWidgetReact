import React, { useCallback } from 'react';
import PropTypes from 'prop-types';
import { useWhyDidYouUpdate } from 'use-why-did-you-update';
import CustomTableRow from './CustomTableRow';
import { Box, TableCell, TableRow, Tooltip, Typography } from '@mui/material';

const CustomTableRowWrapper = ({
	formName,
	reportName,
	rows,
	setRows,
	columns,
	enableSingleSelect,
	enableClickToSelect,
	enableCollapseRows,
	enableDragReorder,
	enableContextMenu,
	onClick,
	onDoubleClick,
	getNameFn,
}) => {
	const onSelect = useCallback(
		(row) => {
			if (enableSingleSelect) {
				setRows((oldRows) =>
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
				setRows((oldRows) =>
					oldRows.map((oldRow) => (oldRow.ID === row.ID ? row : oldRow))
				);
			}
		},
		[setRows]
	);

	const onExpand = useCallback(
		(row) => {
			setRows((oldRows) =>
				oldRows.map((oldRow) => (oldRow.ID === row.ID ? row : oldRow))
			);
		},
		[setRows]
	);

	const _onClick = useCallback(
		(row) => {
			onClick ? onClick(row) : () => {};
		},
		[onClick]
	);

	const _onDoubleClick = useCallback(
		(row) => {
			onDoubleClick ? onDoubleClick(row) : () => {};
		},
		[onDoubleClick]
	);

	const _getNameFn = useCallback(
		(row) => {
			getNameFn ? getNameFn(formName, row) : null;
		},
		[getNameFn]
	);

	const handleFooter = (col) => {
		if (!col.footer) {
			return '';
		}

		if (col.format) {
			return col.format(col.footer(rows, col.valueKey));
		}

		return col.footer(rows, col.valueKey);
	};

	return (
		<>
			{rows.map((row, index) => (
				<CustomTableRow
					key={row.ID}
					row={row}
					formName={formName}
					reportName={reportName}
					index={index}
					onSelect={onSelect}
					onExpand={onExpand}
					columns={columns}
					enableClickToSelect={enableClickToSelect}
					enableCollapseRows={enableCollapseRows}
					enableDragReorder={enableDragReorder}
					enableContextMenu={enableContextMenu}
					onClick={_onClick}
					onDoubleClick={_onDoubleClick}
					getNameFn={getNameFn}
				/>
			))}
			{columns.filter((col) => col.visible && col.footer).length > 0 ? (
				<TableRow>
					<TableCell />
					{enableCollapseRows ? <TableCell /> : null}
					{enableClickToSelect && enableDragReorder ? <TableCell /> : null}
					<TableCell />
					{columns
						.filter((col) => col.visible)
						.map((col) => (
							<TableCell
								align={col.type === 'number' ? 'right' : 'left'}
								key={col.label}>
								{col.footerTooltip ? (
									<Tooltip arrow title={col.footerTooltip} placement='top'>
										<Typography sx={{ fontWeight: 'bold' }}>{handleFooter(col)}</Typography>
									</Tooltip>
								) : (
									<Typography sx={{ fontWeight: 'bold' }}>{handleFooter(col)}</Typography>
								)}
							</TableCell>
						))}
				</TableRow>
			) : null}
		</>
	);
};

CustomTableRowWrapper.propTypes = {
	formName: PropTypes.string,
	reportName: PropTypes.string,
	columns: PropTypes.array.isRequired,
	rows: PropTypes.array.isRequired,
	setRows: PropTypes.func.isRequired,
	enableClickToSelect: PropTypes.bool,
	enableSingleSelect: PropTypes.bool,
	enableCollapseRows: PropTypes.bool,
	enableDragReorder: PropTypes.bool,
	enableContextMenu: PropTypes.bool,
	onClick: PropTypes.func,
	onDoubleClick: PropTypes.func,
	getNameFn: PropTypes.func,
};

export default CustomTableRowWrapper;
