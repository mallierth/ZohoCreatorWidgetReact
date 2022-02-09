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
		field: 'Number',
		flex: 1,
		type: 'number',
		hide: true,
	},
	{
		field: 'Name',
		flex: 1,
	},
	{
		field: 'Alias',
		flex: 3,
	},
	{
		field: 'Account',
		searchField: 'Account_Name',
		flex: 2,
		valueGetter: ({ value }) => value.display_value || '',
	},
	{
		field: 'Owner',
		flex: 2,
	},
	{
		field: 'Type',
		flex: 1.5,
		valueOptions: [
			'Design and Build',
			'Box Sale',
			'Design **ONLY**',
			'Build **ONLY**',
			'Service',
			'Hosted',
			'Service Contract',
		],
	},
	{
		field: 'Status',
		flex: 2,
		valueOptions: (params) => {
			switch (params?.Type) {
				case 'Service Contract':
				case 'Service':
					return [
						'Started',
						'Pending Service Dept. Review',
						'Service Dept. Review Complete',
						'Closed Won',
						'Closed Lost',
					];
				case 'Box Sale':
					return [
						'Started',
						'Proposal Draft Complete',
						'Approved for Submittal',
						'Closed Won',
						'Closed Lost',
					];
				default:
					return [
						'Started',
						'Pending Engineering Review',
						'Engineering Review Complete',
						'Proposal Draft Complete',
						'Approved for Submittal',
						'Closed Won',
						'Closed Lost',
					];
			}
		},
	},
	{
		field: 'Amount',
		searchFie: false,
		type: 'number',
		flex: 1,
		valueFormatter: ({ value }) => currency(value),
	},
	{
		field: 'Closing_Date',
		headerName: 'Closing Date',
		searchField: false,
		flex: 1,
		type: 'date',
	},
];

//? Add columns that will be used only for filtering
export const filterColumns = [
	...columns,
	{
		field: 'Description',
	},
	{
		field: 'Source',
		valueOptions: [
			'ALA',
			'Call In',
			'CDC',
			'Cold Call',
			'Corenet',
			'DiscoverOrg',
			'Existing Client',
			'External Referral',
			'ILTA',
			'LinkedIn',
			'Referral',
			'Trade Journal',
			'Trade Show',
			'Web',
		],
	},
].sort((a, b) => {
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

const OpportunityReport = ({
	maxHeight,
	variant,
	forcedCriteria,
	loadData,
}) => {
	return (
		<CustomDataTable
			formName='Opportunity'
			height={maxHeight - 16}
			forcedCriteria={forcedCriteria} //! add
			loadDataOnAddNewRow={loadData} //! add
			DataGridProps={{
				checkboxSelection: true,
				disableSelectionOnClick: true,
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

OpportunityReport.propTypes = {
	maxHeight: PropTypes.number,
	forcedCriteria: PropTypes.string,
	loadData: PropTypes.object,
	variant: PropTypes.oneOf(['tab']),
};

export default OpportunityReport;
