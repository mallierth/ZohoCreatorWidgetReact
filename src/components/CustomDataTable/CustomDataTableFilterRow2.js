import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { Box, Checkbox, IconButton, MenuItem, TextField } from '@mui/material';
import { Close } from '@mui/icons-material';
import TextFieldDateTime from '../FormControls/TextFieldDateTime';
import {
	operators,
	filterValueFieldRenderType,
	filterValueFieldDisabled,
	getCriteria,
} from './helperFunctions';
import { useRecoilValue } from 'recoil';
import { currentUserIdState } from '../../recoil/selectors';

/**
 * State will be managed internally and publish updates via an onChange function.
 * jsonData prop will be updated when a successful save of a view is triggered
 */

const CustomDataTableFilterRow = ({
	hideClose,
	fieldOptions,
	jsonData,
	onChange,
	onClose,
	showError,
	hasError,
	ignoreConditionError,

	// conditionError,
	// fieldError,
	// operatorError,
	// valueError,
	child,
}) => {
	const currentUserId = useRecoilValue(currentUserIdState);
	const conditionValue = jsonData.condition;
	const fieldValue = jsonData.field;
	const fieldValueDefinition =
		fieldOptions.filter((op) => op.field === fieldValue).length > 0
			? fieldOptions.filter((op) => op.field === fieldValue)[0]
			: {};
	const includeCurrentUserCriteria = fieldValue === 'Employee' || fieldValue === 'Employees' || fieldValue === 'Owner';
	const operatorOptions = operators(fieldValueDefinition?.type, includeCurrentUserCriteria);
	const operatorValue = jsonData.operator;
	const valueFieldToRender = filterValueFieldRenderType(
		fieldValueDefinition?.type,
		operatorValue
	);
	const value = jsonData.value;
	const value2 = jsonData.value2; //TODO

	const operatorDisabled =
		(!ignoreConditionError && !conditionValue) || !fieldValue;
	const valueDisabled =
		(!ignoreConditionError && !conditionValue) ||
		!fieldValue ||
		!operatorValue ||
		filterValueFieldDisabled(operatorValue);

	const conditionError = !ignoreConditionError && !conditionValue;
	const fieldError = !fieldValue;
	const operatorError = !operatorValue;
	const valueError = !valueDisabled && !value && value !== false && value !== 0;
	//const value2Error = !valueDisabled && !value2;

	//? Errors
	useEffect(() => {
		hasError(conditionError || fieldError || operatorError || valueError);
	}, [conditionError, fieldError, operatorError, valueError]);

	return (
		<Box
			sx={{
				display: 'flex',
				alignItems: 'center',
				justifyContent: child ? 'flex-end' : 'normal',
				'& .MuiTextField-root': { m: 1, width: child ? '17.5ch' : '25ch' },
			}}>
			{/* Close Button */}
			<IconButton size='small' onClick={onClose}>
				<Close fontSize='inherit' />
			</IconButton>

			{/* Condition AND/OR */}
			<TextField
				sx={{ visibility: hideClose ? 'hidden' : 'visible' }}
				error={showError && conditionError && !ignoreConditionError}
				select
				label='Condition'
				value={conditionValue}
				variant='standard'
				color='secondary'
				onChange={(e) =>
					onChange({
						...jsonData,
						condition: e.target.value,
					})
				}>
				{['AND', 'OR'].map((op) => (
					<MenuItem key={op} value={op}>
						{op}
					</MenuItem>
				))}
			</TextField>

			{/* Selectable Form Fields  */}
			<TextField
				select
				error={showError && fieldError}
				label='Field'
				value={fieldValue}
				variant='standard'
				color='secondary'
				onChange={(e) =>
					onChange({
						...jsonData,
						field: e.target.value,
						criteriaString: getCriteria(
							valueFieldToRender,
							jsonData.operator,
							e.target.value,
							operatorValue === 'is me' ? currentUserId : jsonData.value,
							jsonData.value2
						),
					})
				}>
				{fieldOptions.map((col) => (
					<MenuItem key={col.field} value={col.field}>
						{col.headerName ? col.headerName : col?.field?.replaceAll('_', ' ')}
					</MenuItem>
				))}
			</TextField>

			{/* Operators Options for Selected Form Field */}
			<TextField
				select={Boolean(operatorOptions && Array.isArray(operatorOptions))}
				error={showError && operatorError}
				label='Operator'
				value={operatorValue}
				variant='standard'
				color='secondary'
				disabled={operatorDisabled}
				onChange={(e) =>
					onChange({
						...jsonData,
						operator: e.target.value,
						value: e.target.value === 'is me' ? currentUserId : jsonData.value,
						criteriaString: getCriteria(
							valueFieldToRender,
							e.target.value,
							jsonData.field,
							e.target.value === 'is me' ? currentUserId : jsonData.value,
							jsonData.value2
						),
					})
				}>
				{operatorOptions && Array.isArray(operatorOptions)
					? operatorOptions.map((option) => (
							<MenuItem key={option} value={option}>
								{option}
							</MenuItem>
					  ))
					: null}
			</TextField>

			{/* Value - Changes based on Operator */}
			{valueFieldToRender === 'bool' || valueFieldToRender === 'boolean' ? (
				<Checkbox
					checked={Boolean(value)}
					color='secondary'
					disabled={valueDisabled}
					onChange={(e) =>
						onChange({
							...jsonData,
							value: e.target.checked,
							criteriaString: getCriteria(
								valueFieldToRender,
								jsonData.operator,
								jsonData.field,
								e.target.checked,
								jsonData.value2
							),
						})
					}
				/>
			) : valueFieldToRender === 'date' ||
			  valueFieldToRender === 'time' ||
			  valueFieldToRender === 'dateTime' ? (
				<TextFieldDateTime
					label='Value'
					error={showError && valueError}
					value={value}
					color='secondary'
					variant='standard'
					type={valueFieldToRender}
					disabled={valueDisabled}
					onChange={(e) =>
						onChange({
							...jsonData,
							value: e,
							criteriaString: getCriteria(
								valueFieldToRender,
								jsonData.operator,
								jsonData.field,
								e.target.value,
								jsonData.value2
							),
						})
					}
				/>
			) : (
				<TextField
					select={Boolean(
						fieldValueDefinition?.valueOptions &&
							(Array.isArray(fieldValueDefinition.valueOptions) ||
								typeof fieldValueDefinition.valueOptions === 'function')
					)}
					label='Value'
					error={showError && valueError}
					value={value || ''}
					color='secondary'
					variant='standard'
					type={valueFieldToRender === 'number' ? 'number' : 'text'}
					disabled={valueDisabled}
					onChange={(e) =>
						onChange({
							...jsonData,
							value: operatorValue === 'is me' ? currentUserId : e.target.value,
							criteriaString: getCriteria(
								valueFieldToRender,
								jsonData.operator,
								jsonData.field,
								operatorValue === 'is me' ? currentUserId : e.target.value,
								jsonData.value2
							),
						})
					}>
					{fieldValueDefinition.valueOptions &&
					Array.isArray(fieldValueDefinition.valueOptions)
						? fieldValueDefinition.valueOptions.map((option) => (
								<MenuItem key={option} value={option}>
									{option}
								</MenuItem>
						  ))
						: fieldValueDefinition?.valueOptions &&
						  typeof fieldValueDefinition.valueOptions === 'function'
						? fieldValueDefinition.valueOptions().map((option) => (
								<MenuItem key={option} value={option}>
									{option}
								</MenuItem>
						  ))
						: null}
				</TextField>
			)}
		</Box>
	);
};

CustomDataTableFilterRow.propTypes = {
	fieldOptions: PropTypes.array.isRequired,

	hideClose: PropTypes.bool,

	onChange: PropTypes.func.isRequired,
	onClose: PropTypes.func.isRequired,
	showError: PropTypes.bool,
	hasError: PropTypes.func.isRequired,
	ignoreConditionError: PropTypes.bool,
	conditionError: PropTypes.bool,
	fieldError: PropTypes.bool,
	operatorError: PropTypes.bool,
	valueError: PropTypes.bool,
	child: PropTypes.bool,

	jsonData: PropTypes.exact({
		condition: PropTypes.oneOf(['', 'AND', 'OR']),
		field: PropTypes.string,
		operator: PropTypes.string,
		value: PropTypes.string,
		value2: PropTypes.string,
		criteriaString: PropTypes.string,
		childCriteria: PropTypes.arrayOf(
			PropTypes.exact({
				condition: PropTypes.oneOf(['', 'AND', 'OR']),
				field: PropTypes.string,
				operator: PropTypes.string,
				value: PropTypes.string,
				value2: PropTypes.string,
				criteriaString: PropTypes.string,
			})
		),
	}),
};

export default CustomDataTableFilterRow;
