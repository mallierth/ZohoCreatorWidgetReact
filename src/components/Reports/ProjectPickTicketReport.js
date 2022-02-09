import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { useRecoilValue } from 'recoil';
import { Box, Typography } from '@mui/material';
import DatabaseDefaultIcon from '../Helpers/DatabaseDefaultIcon';
import CustomTable from '../CustomTable/CustomTable';
import CustomDataTable from '../CustomDataTable/CustomDataTable';
import { sum, currency, intTryParse } from '../Helpers/functions';

//? Report Filter Columns
export const columns = [
	{
		field: 'Sales_Order',
		headerName: 'Sales Order',
		flex: 1,
		valueGetter: ({ value }) => value.display_value || '',
	},
	{
		field: 'Sales_Order.Description',
		headerName: 'Room',
		flex: 3,
	},
	{
		field: 'Quantity',
		type: 'number',
		flex: 1,
	},
	{
		field: 'Product',
		flex: 4,
		valueGetter: ({ row }) => {
			let manufacturer = row.Manufacturer ? row.Manufacturer + ' ' : '';
			let nameCode =
				row.Name === row.Code ? row.Name : `${row.Name} (${row.Code})`;

			if (row.Code === 'Custom') {
				return row.Description;
			}

			return manufacturer + nameCode;
		},
	},
	{
		field: 'Notes',
		flex: 3,
	},
];

//? Add columns that will be used only for filtering
export const filterColumns = [...columns].sort((a, b) => {
	if (
		a.headerName
			? a.headerName
			: a.field < b.headerName
			? b.headerName
			: b.field
	) {
		return -1;
	} else if (
		a.headerName
			? a.headerName
			: a.field > b.headerName
			? b.headerName
			: b.field
	) {
		return 1;
	} else {
		return 0;
	}
});

const CustomFooter = ({ rows }) => {
	const total = sum(rows, 'Total');

	return (
		<Box
			sx={{
				p: 1,
				display: 'flex',
				alignItems: 'center',
				justifyContent: 'space-between',
			}}>
			<Box
				sx={{ display: 'flex', '& > *': { pr: 1 }, color: 'text.secondary' }}>
				<Typography variant='body1'>Total: {currency(total)}</Typography>
			</Box>
			<Box>
				<Typography variant='body2'>Total Rows: {rows.length}</Typography>
			</Box>
		</Box>
	);
};
CustomFooter.propTypes = {
	rows: PropTypes.array.isRequired,
};

const ProjectPickTicketReport = ({
	maxHeight,
	variant,
	forcedCriteria,
	loadData,
	referenceId,
	phaseId,
}) => {
	return (
		<CustomDataTable
			disableOpenOnRowClick
			hideFilterGraphic
			formName='Sales_Order_Line_Item'
			forcedCriteria={
				forcedCriteria ||
				(phaseId
					? `Phase==${phaseId}`
					: `Sales_Order.Reference_ID==${referenceId}`) +
					`&& Sales_Order.Type=="Project Order" && Sales_Order.Void_field==false && Deleted=false && (Type=="Services" || Type=="Goods") && !Name.contains("OFE - Owner Furn. Equip")`
			}
			height={maxHeight - 16}
			loadDataOnAddNewRow={loadData} //! add
			DataGridProps={{
				checkboxSelection: true,
				disableSelectionOnClick: true,
				getRowClassName: ({ row }) =>
					row.Void_field === true || row.Void_field === 'true'
						? `error-row`
						: '',
				components: {
					Footer: CustomFooter,
				},
			}}
			SearchProps={{
				hidden: true,
			}}
			ActionProps={{
				hideViews: true,
				hideAdd: true,
				hideMassUpdate: true,
				hideDelete: true,
			}}
			WrapperProps={{
				elevation: 4,
			}}
			columns={columns}
			filterColumns={filterColumns}
			hideFilters={variant === 'tab'} //! add
			hideSearch={variant === 'tab'} //! add
		/>
	);
};

ProjectPickTicketReport.propTypes = {
	maxHeight: PropTypes.number,
	forcedCriteria: PropTypes.string,
	loadData: PropTypes.object,
	variant: PropTypes.oneOf(['tab']),
	referenceId: PropTypes.string.isRequired, //Reference ID
	phaseId: PropTypes.string, //Project ID
};

export default ProjectPickTicketReport;
