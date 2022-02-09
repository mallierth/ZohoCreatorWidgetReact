import React, { useCallback, useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import {
	Box,
	Checkbox,
	IconButton,
	ListItem,
	MenuItem,
	TextField,
} from '@mui/material';
import { Close } from '@mui/icons-material';
import TextFieldDateTime from '../FormControls/TextFieldDateTime';
import { currentUserState } from '../../recoil/atoms';
import { useRecoilValue } from 'recoil';

const CustomTableFilterRow = ({
	index,
	columns,
	rowData,
	onChange,
	onFilterClose,
	showError = false,
	child,
	parentIndex,
}) => {
  const currentUser = useRecoilValue(currentUserState);
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
	const [fullOperatorOptions, setFullOperatorOptions] = useState([]);
	const selectedOperatorObject =
		fullOperatorOptions.length > 0 &&
		fullOperatorOptions.filter((op) => op.label === selectedOperator).length > 0
			? fullOperatorOptions.filter((op) => op.label === selectedOperator)[0]
			: {};

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
			setFullOperatorOptions([]);
		} else {
			setFullOperatorOptions(col.operators(''));

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
			onChange(index, data, parentIndex);
		}
	}, [data]);

	useEffect(() => {
		if (updating) {
			return;
		}

		console.log('CustomTableFilterRow.js selectedField', selectedField);

		if (selectedField) {
			//! If the selected field changes, clear out the current operator;
			setOperatorOptions((oldField) => {
				//If type is changing, clear out current values
				if (
					JSON.stringify(oldField) !==
					JSON.stringify(selectedField.operators('').map((op) => op.label))
				) {
					return selectedField.operators('').map((op) => op.label);
				}

				return oldField;
			});
			// setValue(selectedField.type === 'bool' ? false : '');
			// setSelectedOperator(
			// 	selectedField.operators('').length === 1
			// 		? selectedField.operators('')[0].label
			// 		: ''
			// );
		}
	}, [selectedField]);

	const onSelectedColumnChanged = (e) => {
		if (updating) {
			return;
		}

		setSelectedField((oldField) => {
			if (!oldField || oldField.toString() !== e.target.value.toString()) {
				const newField = columns.filter(
					(col) => col.valueKey === e.target.value
				)[0];
				setValue(newField.type === 'bool' ? false : '');
				setSelectedOperator(
					newField.operators('').length === 1
						? newField.operators('')[0].label
						: ''
				);
				return newField;
			}

			return oldField;
		});
	};

	useEffect(() => {
		if (updating) {
			return;
		}

		if (index > 0 && !selectedCondition) {
			setErrorSelectedCondition(true);
		} else {
			setErrorSelectedCondition(false);
		}

		setErrorSelectedField(!selectedField ? true : false);
		setErrorSelectedOperator(!selectedOperator ? true : false);

		if (selectedField && selectedOperator) {
			const field = selectedField
				.operators('')
				.filter((op) => op.label === selectedOperator)[0];
			if (!field?.disableValue && !value && value !== 0 && value !== false) {
				setErrorValue(true);
			} else {
				setErrorValue(false);
			}
		} else {
			setErrorValue(true);
		}

    console.log('value', value);

    const getCriteriaString = (result) => {
      if(typeof result === 'function') {
        return result();
      }

      return result;
    }

		setData({
			...rowData,
			condition: selectedCondition,
			field: selectedField?.valueKey,
			operator: selectedOperator,
			value: value,
			criteriaString:
				selectedField
					?.operators(value, selectedOperatorObject?.provideCurrentUser ? currentUser : null)
					?.filter((op) => op.label === selectedOperator).length > 0
					? getCriteriaString(selectedField
							.operators(value, selectedOperatorObject?.provideCurrentUser ? currentUser : null)
							.filter((op) => op.label === selectedOperator)[0].result)
					: '',
		});
	}, [selectedCondition, selectedField, selectedOperator, value]);

	const getType = () => {
		//? renderType is an override to do things like render a number field within a date type
		if (selectedOperatorObject?.renderType) {
			return selectedOperatorObject?.renderType;
		}

		if (
			selectedField?.type === 'bool' ||
			selectedField?.type === 'boolean' ||
			selectedField?.type === 'checkbox'
		) {
			return 'bool';
		}

		return selectedField?.type;
	};

	return (
		<Box
			sx={{
				display: 'flex',
				alignItems: 'center',
				justifyContent: child ? 'flex-end' : 'normal',
				'& .MuiTextField-root': { m: 1, width: child ? '17.5ch' : '25ch' },
			}}>
			<IconButton
				size='small'
				onClick={() => onFilterClose(index, parentIndex)}>
				<Close fontSize='inherit' />
			</IconButton>
			<TextField
				sx={{
					visibility: (index && index > 0) || child ? 'visible' : 'hidden',
				}}
				error={showError && errorSelectedCondition}
				select
				label='Condition'
				value={selectedCondition || ''}
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
				value={selectedField?.valueKey || ''}
				variant='standard'
				color='secondary'
				onChange={onSelectedColumnChanged}>
				{columns.map((col) => (
					<MenuItem key={col.valueKey} value={col.valueKey}>
						{col.filterLabel ? col.filterLabel : col.label}
					</MenuItem>
				))}
			</TextField>
			<TextField
				select={Boolean(operatorOptions && Array.isArray(operatorOptions))}
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
			{getType() === 'bool' ? (
				<Checkbox
					checked={Boolean(value)}
					color='secondary'
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
					onChange={(e) => setValue(e.target.checked)}
				/>
			) : getType() === 'date' ||
			  getType() === 'time' ||
			  getType() === 'dateTime' ? (
				<TextFieldDateTime
					label='Value'
					error={showError && errorValue}
					value={value || ''}
					color='secondary'
					variant='standard'
					type={getType()}
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
					onChange={(e) => setValue(e)}
				/>
			) : (
				<TextField
					select={Boolean(
						selectedField &&
							selectedField.options &&
							(Array.isArray(selectedField.options) ||
								typeof selectedField.options === 'function')
					)}
					label='Value'
					error={showError && errorValue}
					value={value || ''}
					color='secondary'
					variant='standard'
					type={getType() === 'number' ? 'number' : 'text'}
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
					onChange={(e) => setValue(e.target.value)}>
					{selectedField &&
					selectedField.options &&
					Array.isArray(selectedField.options)
						? selectedField.options.map((option) => (
								<MenuItem key={option} value={option}>
									{option}
								</MenuItem>
						  ))
						: selectedField &&
						  selectedField.options &&
						  typeof selectedField.options === 'function'
						? selectedField.options().map((option) => (
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

CustomTableFilterRow.propTypes = {
	index: PropTypes.number,
	columns: PropTypes.array.isRequired,
};

export default CustomTableFilterRow;
