import React from 'react';
import PropTypes from 'prop-types';
import { omit } from 'lodash-es';
import { Box, Chip, Paper, Stack } from '@mui/material';

const CustomTableFilterGraphic = ({
	mobileMode,
	numSelected,
	columns,

	activeFilters,
	onFilterClick,
	onFilterClose,
	onFilterClearAll,
	disabled,
	WrapperProps,
}) => {
	const getChipLabel = (data) => {
		if (data.operator === 'is me') {
			return `${data.field.replaceAll('_', ' ')} ${data.operator}`;
		}

		let fieldLabel = data.field;

		if (
			columns.filter((column) => column.field === data.field).length === 1 &&
			columns.filter((column) => column.field === data.field)[0].headerName
		) {
			fieldLabel = columns.filter((column) => column.field === data.field)[0]
				.headerName;
		}

		const criteriaString = `${fieldLabel.replaceAll('_', ' ')} ${
			data.operator
		} ${
			data.value || data.value === 0 || data.value === false
				? ' ' + data.value
				: ''
		}`;

		if (data.childCriteria && Array.isArray(data.childCriteria)) {
			return `${criteriaString} ${data.childCriteria
				.map((d) => ` ${d.condition} ${getChipLabel(d)}`)
				.join('')}`;
		}

		return criteriaString;
	};

	return (
		<Paper
			elevation={4}
			{...omit(WrapperProps, 'sx')}
			sx={{
				border: (theme) =>
					theme.palette.mode === 'dark'
						? `1px solid rgba(81,81,81,1)`
						: `1px solid rgba(224,224,224,1)`,
				width: '100%',
				overflowX: 'hidden',
				p: 1,
				mt: 1,
				//mx: 1,
				display: 'flex',
				justifyContent: 'space-between',
				color: 'text.primary',
				...WrapperProps.sx,
			}}>
			<Box sx={{ maxHeight: '40px' }}>
				<Stack
					direction='row'
					spacing={0}
					sx={{
						'& > *:not(:first-of-type)': { mx: 0.5 },
						'& > *:first-of-type': { mr: 0.5 },
					}}>
					{Array.isArray(activeFilters)
						? activeFilters.map((af, index) =>
								af ? (
									<Box key={index}>
										<Chip
											onClick={() => onFilterClick(af)}
											sx={{
												backgroundColor: 'secondary.light',
												color: 'rgba(0,0,0,0.87)',
											}}
											size='medium'
											label={`${getChipLabel(af)}`}
											onDelete={() => onFilterClose(index)}
											disabled={disabled}
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
								onClick={onFilterClearAll}
								color='error'
								size='medium'
								variant='outlined'
								label={`Clear All`}
								disabled={disabled}
							/>
						</Box>
					) : null}
				</Stack>
			</Box>
		</Paper>
	);
};

CustomTableFilterGraphic.propTypes = {
	columns: PropTypes.array.isRequired,
	mobileMode: PropTypes.bool,
	numSelected: PropTypes.number,

	activeFilters: PropTypes.arrayOf(
		PropTypes.exact({
			condition: PropTypes.oneOf(['', 'AND', 'OR']),
			field: PropTypes.string,
			operator: PropTypes.string,
			value: PropTypes.oneOfType([PropTypes.string, PropTypes.bool]),
			value2: PropTypes.oneOfType([PropTypes.string, PropTypes.bool]),
			criteriaString: PropTypes.string,
			childCriteria: PropTypes.arrayOf(
				PropTypes.exact({
					condition: PropTypes.oneOf(['', 'AND', 'OR']),
					field: PropTypes.string,
					operator: PropTypes.string,
					value: PropTypes.oneOfType([PropTypes.string, PropTypes.bool]),
					value2: PropTypes.oneOfType([PropTypes.string, PropTypes.bool]),
					criteriaString: PropTypes.string,
				})
			),
		})
	),
	onFilterClick: PropTypes.func,
	onFilterClose: PropTypes.func,
	onFilterClearAll: PropTypes.func,
	disabled: PropTypes.bool,
	WrapperProps: PropTypes.shape({
		sx: PropTypes.object,
	}),
};

export default CustomTableFilterGraphic;
