import React, { useCallback, useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { Box, IconButton, ListItem, MenuItem, TextField } from '@mui/material';
import { Close } from '@mui/icons-material';

const CustomTableFilterRowChild = ({
	index,
	columns,
	rowData,
	onChange,
	onFilterClose,
	showError = false,
	child,
}) => {
	const [selectedCondition, setSelectedCondition] = useState('');
	const [selectedField, setSelectedField] = useState('');
	const [operatorOptions, setOperatorOptions] = useState('');
	const [selectedOperator, setSelectedOperator] = useState('');
	const [value, setValue] = useState('');
	const [data, setData] = useState(null);
	const [updating, setUpdating] = useState(true);

	const [errorSelectedCondition, setErrorSelectedCondition] = useState(false);
	const [errorSelectedField, setErrorSelectedField] = useState(false);
	const [errorSelectedOperator, setErrorSelectedOperator] = useState(false);
	const [errorValue, setErrorValue] = useState(false);

	useEffect(() => {
		setUpdating(true);
		const col = columns.filter((col) => col.valueKey === rowData.field)[0];
		setSelectedCondition((old) =>
			old !== rowData.condition ? rowData.condition : old
		);
		setSelectedField((old) =>
			JSON.stringify(old) !== JSON.stringify(col) ? col : old
		);

		if (!col) {
			setOperatorOptions('');
		} else {
			setOperatorOptions((old) =>
				JSON.stringify(old) !==
				JSON.stringify(col.operators('').map((op) => op.label))
					? col.operators('').map((op) => op.label)
					: old
			);
		}

		setSelectedOperator((old) =>
			old !== rowData.operator ? rowData.operator : old
		);
		setValue((old) => (old !== rowData.value ? rowData.value : old));
		setUpdating(false);
	}, [rowData]);

	useEffect(() => {
		if (updating) {
			return;
		}

		if (onChange) {
			onChange(index, data);
		}
	}, [data]);

	useEffect(() => {
		if (updating) {
			return;
		}

		if (selectedField) {
			//! If the selected field changes, clear out the current operator;
			setOperatorOptions((oldField) => {
				//If type is changing, clear out current values
				if (
					JSON.stringify(oldField) !==
					JSON.stringify(selectedField.operators('').map((op) => op.label))
				) {
					setSelectedOperator('');
					setValue('');
					return selectedField.operators('').map((op) => op.label);
				}

				return oldField;
			});
		} else {
			setOperatorOptions(['Please select a Field']);
		}
	}, [selectedField]);

	const onSelectedColumnChanged = (e) => {
		if (updating) {
			return;
		}

		setSelectedField((oldField) => {
			if (!oldField) {
				return {
					...columns.filter((col) => col.valueKey === e.target.value)[0],
				};
			} else if (oldField.toString() === e.target.value.toString()) {
				return oldField;
			}

			return { ...columns.filter((col) => col.valueKey === e.target.value)[0] };
		});
	};

	useEffect(() => {
		if (updating) {
			return;
		}

		if(index > 0 && !selectedCondition) {
			setErrorSelectedCondition(true);
		} else {
			setErrorSelectedCondition(false);
		}

		setErrorSelectedField(!selectedField ? true : false);
		setErrorSelectedOperator(!selectedOperator ? true : false);

		if(selectedField && selectedOperator) {
			const field = selectedField.operators('').filter((op) => op.label === selectedOperator)[0];
			if (!field.disableValue && !value) {
				setErrorValue(true);
			} else {
				setErrorValue(false);
			}
		} else {
			setErrorValue(true);
		}
		

		setData({
			...rowData,
			condition: selectedCondition,
			field: selectedField ? selectedField.valueKey : '',
			operator: selectedOperator,
			value: value,
			criteriaString:
				selectedField &&
				selectedField
					.operators(value)
					.filter((op) => op.label === selectedOperator).length > 0
					? selectedField
							.operators(value)
							.filter((op) => op.label === selectedOperator)[0].result
					: '',
		});
	}, [selectedCondition, selectedField, selectedOperator, value]);

	return (
		<Box
			sx={{
				display: 'flex',

				alignItems: 'center',
				'& .MuiTextField-root': { m: 1, width: '15ch' },
			}}>
			<IconButton size='small' onClick={() => onFilterClose(index)}>
				<Close fontSize='inherit' />
			</IconButton>
			<TextField
				sx={{ visibility: index && index > 0 ? 'visible' : 'hidden' }}
				error={showError && errorSelectedCondition}
				select
				label='Condition'
				value={selectedCondition ? selectedCondition : ''}
				variant='standard'
				color='secondary'
				onChange={(e) => setSelectedCondition(e.target.value)}>
				{['AND', 'OR'].map((op) => (
					<MenuItem key={op} value={op}>
						{op}
					</MenuItem>
				))}
			</TextField>
			<TextField
				select
				error={showError && errorSelectedField}
				label='Field'
				value={selectedField ? selectedField.valueKey : ''}
				variant='standard'
				color='secondary'
				onChange={onSelectedColumnChanged}>
				{columns.map((col) => (
					<MenuItem key={col.label} value={col.valueKey}>
						{col.label}
					</MenuItem>
				))}
			</TextField>
			<TextField
				select={
					operatorOptions && Array.isArray(operatorOptions) ? true : false
				}
				error={showError && errorSelectedOperator}
				label='Operator'
				value={selectedOperator || ''}
				variant='standard'
				color='secondary'
				disabled={!selectedField || !selectedField.valueKey}
				onChange={(e) => setSelectedOperator(e.target.value)}>
				{operatorOptions && Array.isArray(operatorOptions)
					? operatorOptions.map((option) => (
							<MenuItem key={option} value={option}>
								{option}
							</MenuItem>
					  ))
					: null}
			</TextField>
			<TextField
				label='Value'
				error={showError && errorValue}
				value={value}
				color='secondary'
				variant='standard'
				type={
					selectedField && selectedField.type === 'number' ? 'number' : 'text'
				}
				disabled={
					selectedField &&
					selectedOperator &&
					selectedField
						.operators('')
						.filter((op) => op.label === selectedOperator).length > 0
						? selectedField
								.operators('')
								.filter((op) => op.label === selectedOperator)[0].disableValue
						: true
				}
				onChange={(e) => setValue(e.target.value)}
			/>
		</Box>
	);
};

CustomTableFilterRowChild.propTypes = {
	index: PropTypes.number,
	columns: PropTypes.array.isRequired,
};

export default CustomTableFilterRowChild;
