import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import {
	Box,
	IconButton,
	ListItem,
	MenuItem,
	TextField,
} from '@mui/material';
import { Close } from '@mui/icons-material';

const FilterRow = ({ index, columns, criteria }) => {
	const [selectedCondition, setSelectedCondition] = useState('');
	const [selectedField, setSelectedField] = useState('');
	const [operatorOptions, setOperatorOptions] = useState([
		'Please select a Field',
	]);
	const [selectedOperator, setSelectedOperator] = useState('');
	
	const [value, setValue] = useState('');
	const [data, setData] = useState(null);

	useEffect(() => {
		if (data) {
			criteria(data);
		}
	}, [data]);

	useEffect(() => {
		if (selectedField) {
			//! If the selected field changes, clear out the current operator;

			setOperatorOptions(selectedField.operators('').map((op) => op.label));
		} else {
			setOperatorOptions(['Please select a Field']);
		}
	}, [selectedField]);

	const onSelectedColumnChanged = (e) => {
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
		if (
			selectedField &&
			Object.keys(selectedField).length > 0 &&
			selectedOperator &&
			(value || value === 0 || value === false) &&
			(index === 0 || selectedCondition)
		) {
			setData(
				`${selectedCondition ? selectedCondition : ''}${
					selectedField
						.operators(value)
						.filter((op) => op.label === selectedOperator)[0].result
				}`
			);
		} else {
			setData(null);
		}
	}, [selectedCondition, selectedField, selectedOperator, value]);

	return (
		<Box
			sx={{
				display: 'flex',
				alignItems: 'center',
				'& .MuiTextField-root': { m: 1, width: '25ch' },
			}}
			component='form'
			noValidate
			autoComplete='off'>
			<IconButton size='small'>
				<Close fontSize='inherit' />
			</IconButton>
			<TextField
				sx={{ visibility: index && index > 0 ? 'visible' : 'hidden' }}
				select
				label='Condition'
				value={selectedCondition ? selectedCondition : ''}
				variant='standard'
				onChange={(e) => setSelectedCondition(e.target.value)}>
				{[
					{ label: 'AND', value: ' && ' },
					{ label: 'OR', value: ' || ' },
				].map((op) => (
					<MenuItem key={op.label} value={op.value}>
						{op.label}
					</MenuItem>
				))}
			</TextField>
			<TextField
				select
				label='Field'
				value={selectedField ? selectedField.valueKey : ''}
				variant='standard'
				onChange={onSelectedColumnChanged}>
				{columns.map((col) => (
					<MenuItem key={col.label} value={col.valueKey}>
						{col.label}
					</MenuItem>
				))}
			</TextField>
			<TextField
				select
				label='Operator'
				value={selectedOperator || ''}
				variant='standard'
				disabled={!selectedField || !selectedField.valueKey}
				onChange={(e) => setSelectedOperator(e.target.value)}>
				{operatorOptions.map((option) => (
					<MenuItem key={option} value={option}>
						{option}
					</MenuItem>
				))}
			</TextField>
			<TextField
				label='Value'
				value={value}
				variant='standard'
				type={
					selectedField && selectedField.type === 'number' ? 'number' : 'text'
				}
				disabled={
					selectedField && selectedOperator
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

FilterRow.propTypes = {
	index: PropTypes.number,
	columns: PropTypes.array.isRequired,
};

export default FilterRow;
