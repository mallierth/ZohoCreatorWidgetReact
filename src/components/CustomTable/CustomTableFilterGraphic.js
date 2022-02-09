import React from 'react';
import PropTypes from 'prop-types';
import { Box, Chip, Stack, Toolbar } from '@mui/material';
import { createTheme, ThemeProvider, useTheme } from '@mui/material/styles';
import useMediaQuery from '@mui/material/useMediaQuery';

const CustomTableFilterGraphic = ({
	activeFilters,
	onFilterClick,
	onFilterClose,
	onFilterClearAll,
	loading,
}) => {
	const theme = useTheme();
	const desktopMode = useMediaQuery(theme.breakpoints.up('md'));
	const getChipLabel = (data) => {
		const criteriaString = `${data.field.replaceAll('_', ' ')} ${
			data.operator
		} ${data.value || data.value === 0 || data.value === false ? ' ' + data.value : ''}`;

		if (data.childCriteria && Array.isArray(data.childCriteria)) {
			return `${criteriaString} ${data.childCriteria
				.map((d) => ` ${d.condition} ${getChipLabel(d)}`)
				.join('')}`;
		}

		return criteriaString;
	};

	return (
		<Box
			sx={{
				width: '100%',
				display: { xs: 'none', sm: 'block' },
				overflowX: 'auto',
			}}>
			<Box sx={{ maxHeight: '40px' }}>
				<Stack
					direction='row'
					spacing={0}
					sx={{
						'& > *:not(:first-of-type)': { mx: 0.5, mb: 1 },
						'& > *:first-of-type': { mr: 0.5, mb: 1 },
					}}>
					{activeFilters && Array.isArray(activeFilters)
						? activeFilters.map((af, index) =>
								af ? (
									<Box key={index}>
										<Chip
											onClick={loading ? null : () => onFilterClick(af)}
											sx={{
												backgroundColor: 'secondary.light',
												color: 'rgba(0,0,0,0.87)',
											}}
											size='medium'
											label={`${getChipLabel(af)}`}
											onDelete={loading ? null : () => onFilterClose(af)}
										/>
									</Box>
								) : null
						  )
						: null}

					{activeFilters &&
					Array.isArray(activeFilters) &&
					activeFilters.length > 0 ? (
						<Box>
							<Chip
								onClick={loading ? null : () => onFilterClearAll()}
								color='error'
								size='medium'
								variant='outlined'
								label={`Clear All`}
							/>
						</Box>
					) : null}
				</Stack>
			</Box>
		</Box>
	);
};

export default CustomTableFilterGraphic;
