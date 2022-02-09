//#region //* Imports
//import { useWhyDidYouUpdate } from 'use-why-did-you-update';
import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { omit } from 'lodash-es';
import { Box, Button, Fab, Paper, Toolbar, Tooltip } from '@mui/material';
import { Add } from '@mui/icons-material';
import {
	operators,
	filterValueFieldRenderType,
	filterValueFieldDisabled,
	getCriteria,
} from './helperFunctions';
import CustomDataTableFilterRow from './CustomDataTableFilterRow2';
//#endregion

const jsonFilterFirstRowDefaultData = [
	{
		condition: '',
		field: '',
		operator: '',
		value: '',
		value2: '',
		criteriaString: '',
	},
];

const jsonFilterRowDefaultData = [
	{
		condition: 'AND',
		field: '',
		operator: '',
		value: '',
		value2: '',
		criteriaString: '',
	},
];

const jsonFilterChildRowDefaultData = {
	condition: 'OR',
	field: '',
	operator: '',
	value: '',
	value2: '',
	criteriaString: '',
};

const FilterManager = ({
	height,
	columns,
	data,
	onApplyFilter,
	onClearAllFilters,
	onSave,
	onClose,
}) => {
	const [jsonData, setJsonData] = useState(
		data?.JSON || jsonFilterFirstRowDefaultData
	);
	const [errorObject, setErrorObject] = useState({});
	const hasError = Object.keys(errorObject).length > 0;
	const [showError, setShowError] = useState(false);

	useEffect(() => {
		console.log('FilterManager jsonData', jsonData);
	}, [jsonData]);

	//? If hasError changed while currently showing error, update show error if necessary
	useEffect(() => {
		console.log('FilterManager showError', showError);

		if (showError && !hasError) {
			setShowError(false);
		}
	}, [hasError, showError]);

	const onAddFilterRow = () => {
		setJsonData((old) => [...old, ...jsonFilterRowDefaultData]);
	};

	const onUpdateFilterRow = (index, data) => {
		console.log('onUpdateFilterRow data', data);

		setJsonData((oldFilters) =>
			oldFilters.map((oldFilter, i) => {
				if (i === index) {
					//? Return the existing parent with updated data at the relevant index
					return {
						...oldFilter,
						...data,
					};
				}

				//? Return the old parent
				return oldFilter;
			})
		);
	};

	const onRemoveFilterRow = (index) => {
		setJsonData((oldFilters) => {
			if (oldFilters.filter((oldFilter, i) => index !== i).length > 0) {
				return oldFilters.filter((oldFilter, i) => index !== i);
			}

			return jsonFilterFirstRowDefaultData;
		});
	};

	const onAddChildFilterRow = (index) => {
		setJsonData((oldFilters) =>
			oldFilters.map((oldFilter, i) => {
				if (i !== index) {
					return oldFilter;
				} else if (Array.isArray(jsonData[index]?.childCriteria)) {
					return {
						...oldFilter,
						childCriteria: [
							...oldFilter.childCriteria,
							jsonFilterChildRowDefaultData,
						],
					};
				} else {
					return {
						...oldFilter,
						childCriteria: [jsonFilterChildRowDefaultData],
					};
				}
			})
		);
	};

	const onUpdateChildFilterRow = (index, childIndex, data) => {
		setJsonData((oldFilters) =>
			oldFilters.map((oldFilter, i) => {
				if (i === index) {
					//? Return the existing childCriteria merged with updated data param at relevant index
					return {
						...oldFilter,
						childCriteria: oldFilter.childCriteria.map(
							(oldChildFilter, childI) =>
								childI === childIndex
									? { ...oldChildFilter, ...data }
									: oldChildFilter
						),
					};
				}

				//? Return the old parent
				return oldFilter;
			})
		);
	};

	const onRemoveChildFilterRow = (index, childIndex) => {
		setJsonData((oldFilters) =>
			oldFilters.map((oldFilter, i) => {
				if (i === index) {
					if (oldFilter.childCriteria.length === 1) {
						//? Remove the childCriteria entirely because array length === 1
						return omit(oldFilter, 'childCriteria');
					}

					//? Return the existing childCriteria minus the child @ childIndex param
					return {
						...oldFilter,
						childCriteria: oldFilter.childCriteria.filter(
							(oldChildFilter, childI) => childI !== childIndex
						),
					};
				}

				//? Return the old parent
				return oldFilter;
			})
		);
	};

	//#region //* Render
	return (
		<Box
			sx={{
				px: 2,
				pt: 2,
				display: 'flex',
				flexDirection: 'column',
				justifyContent: 'space-between',
			}}>
			<Box
				sx={{
					height: (theme) =>
						`${height - 2 * theme.mixins.toolbar.minHeight - 16}px`,
					overflowY: 'auto',
				}}>
				{jsonData?.map((op, index) => (
					<Box key={index}>
						{/* Parent Row */}
						<CustomDataTableFilterRow
							jsonData={op}
							hideClose={index === 0}
							ignoreConditionError={index === 0}
							fieldOptions={columns}
							onChange={(e) => onUpdateFilterRow(index, e)}
							onClose={() => onRemoveFilterRow(index)}
							// conditionError={Boolean(index > 0 && !op.condition)}
							// fieldError={Boolean(op.field === '')}
							// operatorError={Boolean(op.operator === '')}
							// valueError={Boolean(
							// 	!op.value &&
							// 		op.value !== false &&
							// 		filterValueFieldDisabled(op.operator)
							// )}
							hasError={(e) => {
								if (e) {
									//Contains error
									setErrorObject((oldErrorObj) => ({
										...oldErrorObj,
										[`parent_${index}`]: true,
									}));
								} else {
									setErrorObject((oldErrorObj) =>
										omit(oldErrorObj, `parent_${index}`)
									);
								}
							}}
							showError={showError}
						/>
						{/* Child Data at Parent Row Index */}
						{Array.isArray(op?.childCriteria)
							? op.childCriteria.map((childOp, childIndex) => (
									<CustomDataTableFilterRow
										key={childIndex}
										jsonData={childOp}
										fieldOptions={columns}
										onChange={(e) =>
											onUpdateChildFilterRow(index, childIndex, e)
										}
										onClose={() => onRemoveChildFilterRow(index, childIndex)}
										// conditionError={index > 0 && !childOp.condition}
										// fieldError={!childOp.field}
										// operatorError={!childOp.operator}
										// valueError={
										// 	!childOp.value &&
										// 	childOp.value !== false &&
										// 	filterValueFieldDisabled(childOp.operator)
										// }
										hasError={(e) => {
											if (e) {
												//Contains error
												setErrorObject((oldErrorObj) => ({
													...oldErrorObj,
													[`child_${childIndex}`]: true,
												}));
											} else {
												setErrorObject((oldErrorObj) =>
													omit(oldErrorObj, `child_${childIndex}`)
												);
											}
										}}
										showError={showError}
										child
									/>
							  ))
							: null}

						{/* Add Child Row */}
						{index <= jsonData?.length - 1 && jsonData?.length > 1 ? (
							<Box
								sx={{
									pt: 1,
									width: '100%',
									display: 'flex',
									alignItems: 'center',
									justifyContent: 'flex-end',
								}}>
								<Tooltip
									arrow
									title='For more advanced use cases, click this button to add a child filter that will be wrapped in parenthesis with the parent'>
									<Fab
										color='secondary'
										size='small'
										onClick={() => onAddChildFilterRow(index)}>
										<Add />
									</Fab>
								</Tooltip>
							</Box>
						) : null}
					</Box>
				))}
				<Button
					sx={{ mt: 2 }}
					color='secondary'
					variant='contained'
					startIcon={<Add />}
					onClick={onAddFilterRow}>
					More
				</Button>
			</Box>
			<Toolbar
				sx={{
					display: 'flex',
					justifyContent: 'flex-end',
					'& > *': { mr: 1 },
				}}>
				<Button onClick={onClose}>Close</Button>
				<Button
					color='secondary'
					onClick={() => {
						setJsonData(jsonFilterFirstRowDefaultData);
						onClearAllFilters();
					}}>
					Clear All Filters
				</Button>
				<Button
					color='secondary'
					disabled={showError}
					onClick={() => {
						if (hasError) {
							setShowError(true);
						} else {
							onSave(jsonData, data.ID);
						}
					}}>
					{data?.ID ? `Update ${data?.Name}` : 'Save as New Custom View'}
				</Button>
				<Button
					color='secondary'
					variant='contained'
					disabled={showError}
					onClick={() => {
						if (hasError) {
							setShowError(true);
						} else {
							onApplyFilter(jsonData);
						}
					}}>
					Apply Filters
				</Button>
			</Toolbar>
		</Box>
	);
	//#endregion
};

//#region //* PropTypes
FilterManager.propTypes = {
	height: PropTypes.number.isRequired,
	columns: PropTypes.array.isRequired,
	onChange: PropTypes.func,
	onApplyFilter: PropTypes.func.isRequired,
	onClearAllFilters: PropTypes.func.isRequired,
	onSave: PropTypes.func.isRequired,
	onClose: PropTypes.func.isRequired,

	data: PropTypes.exact({
		ID: PropTypes.string,
		Name: PropTypes.string,
		readOnly: PropTypes.bool,
		JSON: PropTypes.arrayOf(
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
	}),
};

FilterManager.defaultProps = {
	BackgroundComponent: Paper,
};
//#endregion
export default FilterManager;
