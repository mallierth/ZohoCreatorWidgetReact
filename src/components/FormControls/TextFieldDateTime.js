//import { useWhyDidYouUpdate } from 'use-why-did-you-update';
import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { TextField } from '@mui/material';
import DateAdapter from '@mui/lab/AdapterDayjs';
import LocalizationProvider from '@mui/lab/LocalizationProvider';
import DatePicker from '@mui/lab/DatePicker';
import DateTimePicker from '@mui/lab/DateTimePicker';
import TimePicker from '@mui/lab/TimePicker';
import { useWhyDidYouUpdate } from 'use-why-did-you-update';
import dayjs from 'dayjs';

const TextFieldDateTime = ({
	label,
	type,
	value,
	onChange,
	error,
	required,
	disabled,
	InputProps,
	helperText,
}) => {
	const [timeValue, setTimeValue] = useState(value ? dayjs(`${dayjs().format('L')} ${value}`).format('L LT') : null);

	useEffect(() => {
		if(type === 'time') {
			console.log('value change', value, timeValue);
			setTimeValue(value ? dayjs(`${dayjs().format('L')} ${value}`).format('L LT') : null);
		}
	}, [value])

	return (
		<LocalizationProvider dateAdapter={DateAdapter}>
			{type === 'date' ? (
				<DatePicker
					label={label}
					value={value}
					onChange={(newValue) =>
						newValue ? onChange(newValue.format('l')) : onChange('')
					}
					disabled={disabled}
					readOnly={InputProps?.readOnly}
					renderInput={(params) => (
						<TextField
							{...params}
							required={required}
							error={error}
							disabled={disabled}
							helperText={
								helperText ? helperText : params?.inputProps?.placeholder
							}
						/>
					)}
				/>
			) : type === 'time' ? (
				<TimePicker
					label={label}
					value={timeValue}
					onChange={(newValue) => newValue ? onChange(newValue.format('hh:mm:[00] A')) : onChange('')}
					disabled={disabled}
					readOnly={InputProps?.readOnly}
					renderInput={(params) => (
						<TextField
							{...params}
							required={required}
							error={error}
							disabled={disabled}
							helperText={
								helperText ? helperText : params?.inputProps?.placeholder
							}
						/>
					)}
				/>
			) : (
				<DateTimePicker
					label={label}
					value={value}
					onChange={(newValue) =>
						newValue ? onChange(newValue.format('MM/DD/YYYY hh:mm:[00] A')) : onChange('')
					}
					disabled={disabled}
					readOnly={InputProps?.readOnly}
					renderInput={(params) => (
						<TextField
							{...params}
							required={required}
							error={error}
							disabled={disabled}
							helperText={
								helperText ? helperText : params?.inputProps?.placeholder
							}
						/>
					)}
				/>
			)}
		</LocalizationProvider>
	);
};

TextFieldDateTime.propTypes = {
	label: PropTypes.string,
	type: PropTypes.oneOf(['date', 'time', 'dateTime']).isRequired,
	value: PropTypes.string,
	onChange: PropTypes.func,
	error: PropTypes.bool,
	required: PropTypes.bool,
	InputProps: PropTypes.object,
	helperText: PropTypes.string,
};

export default TextFieldDateTime;
