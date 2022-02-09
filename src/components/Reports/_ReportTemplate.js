import React, { useEffect } from 'react';
import PropTypes from 'prop-types';
import { useRecoilValue } from 'recoil';
import { Container, Paper } from '@mui/material';
import DatabaseDefaultIcon from '../Helpers/DatabaseDefaultIcon';
import CustomTable from '../CustomTable/CustomTable';
import { appMaxWidthState } from '../../recoil/atoms';

const _ReportTemplate = ({ setAppBreadcrumb }) => {
	const appMaxWidth = useRecoilValue(appMaxWidthState);
	useEffect(() => {
		if (setAppBreadcrumb) {
			setAppBreadcrumb([
				{
					//href: baseUrl + pageName,
					icon: <DatabaseDefaultIcon form='Project' sx={{ mr: 1 }} />,
					label: 'Projects',
				},
			]);
		}
	}, [setAppBreadcrumb]);

	return (
		<Container
			maxWidth='xl'
			disableGutters
			sx={{ maxWidth: { xs: appMaxWidth } }}>
			<Paper elevation={3}>
				<CustomTable
					formName='Project'
					defaultSortByColumn='Number'
					defaultSortDirection='asc'
					getNameFn={(row) => row.Name}
				/>
			</Paper>
		</Container>
	);
};

_ReportTemplate.propTypes = {
	setAppBreadcrumb: PropTypes.func.isRequired,
};

export default _ReportTemplate;
