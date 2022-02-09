import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import {
	Box,
	Button,
	Dialog,
	DialogActions,
	DialogContent,
	DialogTitle,
	IconButton,
	InputAdornment,
	TextField,
} from '@mui/material';
import { Close } from '@mui/icons-material';
import ResultTable from '../ResultTables/ResultTable';
import { omit } from 'lodash-es';
import { useWhyDidYouUpdate } from 'use-why-did-you-update';
import ContextMenu from '../Helpers/ContextMenu';
import RenderForm from '../Helpers/RenderForm';
import {
	useDataState,
	useDataUpdater,
	useSetFormError,
} from '../Helpers/FormDataContext';

const formatValue = (value) => {
	if (!value) return;

	if (Array.isArray(value)) {
		return value.map((dv) => dv.display_value).join(', ');
	} else if (typeof value === 'object') {
		return value.display_value;
	} else {
		return value;
	}
};

const LookupField = ({ defaultValue, loadData, ...props }) => {
	useWhyDidYouUpdate('LookupField', props);

	const [tableDialogOpen, setTableDialogOpen] = useState(false);
	const [recordDialogOpen, setRecordDialogOpen] = useState(false);
	const [selections, setSelections] = useState([]);
	const [saveBtnDisabled] = useState(false);
	const [value, setValue] = useState(formatValue(loadData || defaultValue));
	const [error, setError] = useState(props.required && !props.defaultValue);
	const [helperText, setHelperText] = useState(props.helperText);
	const setFormError = useSetFormError();
	const setUpdatedData = useDataUpdater();
	const updatedData = useDataState();

	useEffect(() => {
		if (!loadData) {
			setValue(formatValue(defaultValue));
		} else {
			setUpdatedData((data) => ({ ...data, [props.name]: loadData }));
		}
	}, [defaultValue]);

	useEffect(() => {
		setFormError((data) => ({ ...data, [props.name]: error }));
	}, [error]);

	useEffect(() => {
		setSelections(defaultValue);
	}, [defaultValue]);

	const handleSaveClick = () => {
		//TODO: Update data state from recoil
		if (selections.length === 0) {
			setValue('');
			setUpdatedData((data) => ({ ...data, [props.name]: '' }));
		} else if (props.singleSelect) {
			//? Return single object formatted like Zoho does when retrieving data for consistency
			setUpdatedData((data) => ({
				...data,
				[props.name]: {
					...{},
					ID: selections[0].ID,
					display_value: selections[0][props.displayKey],
				},
			}));
			if (typeof selections[0][props.displayKey] === 'object') {
				setValue(selections[0][props.displayKey].display_value);
			} else {
				setValue(selections[0][props.displayKey]);
			}
		} else {
			//? Return array of objects formatted like Zoho does when retrieving data for consistency
			setUpdatedData((data) => ({
				...data,
				[props.name]: selections.map((s) => ({
					...{},
					ID: s.ID,
					display_value: s[props.displayKey],
				})),
			}));
			setValue(
				selections
					.map((d) => {
						if (typeof d[props.displayKey] === 'object') {
							return d[props.displayKey].display_value;
						} else {
							return d[props.displayKey];
						}
					})
					.join(', ')
			);
		}

		setTableDialogOpen(false);
	};

	useEffect(() => {
		if (props.required && !value) {
			setError(true);
			setHelperText('Please enter a value.');
		} else {
			setError(false);
			setHelperText(props.helperText);
		}
	}, [value]);

	const handleRecordSaveClick = () => {
		console.log('save to database and query for updates?');

		setRecordDialogOpen(false);
	};

	const handleSelectedDataChanged = (name, selections) => {
		setSelections(selections);
	};

	useEffect(() => {
		if (props.onChange) {
			if (!selections) return;

			if (props.singleSelect) {
				props.onChange(selections[0]);
			} else {
				props.onChange(selections);
			}
		}
	}, [selections]);

	const handleInputClicked = (e) => {
		e.stopPropagation();
		setTableDialogOpen(true);
	};

	const handleOpenInPopupClick = () => {
		setRecordDialogOpen(true);
	};

	const handleOpenInNewTabClick = () => {
		console.log('handleOpenInNewTabClick');
	};

	const handleOpenInCurrentTabClick = () => {
		console.log('handleOpenInCurrentTabClick');
	};

	const tableDefaultValue = () => {
		if (updatedData && updatedData[props.name]) {
			return updatedData[props.name];
		} else if (loadData) {
			return loadData;
		} else {
			return defaultValue;
		}
	};

	return (
		<div>
			<ContextMenu
				menuItems={[
					{ label: 'Open/Edit in New Popup', onClick: handleOpenInPopupClick },
					{ label: 'Open/Edit in New Tab', onClick: handleOpenInNewTabClick },
					{
						label: 'Open/Edit in Current Tab',
						onClick: handleOpenInCurrentTabClick,
					},
				]}>
				<Box onClick={(e) => handleInputClicked(e)}>
					<TextField
						label={props.label}
						multiline={!props.singleSelect}
						value={value}
						required={props.required}
						error={error}
						helperText={helperText}
						onClick={(e) => e.preventDefault()}
						onChange={(e) => e.preventDefault()}
						variant='standard'
						fullWidth
						autoComplete='off'
						InputProps={{
							startAdornment: props.startAdornment ? (
								<InputAdornment position='start'>
									{props.startAdornment}
								</InputAdornment>
							) : null,
							endAdornment: props.endAdornment ? (
								<InputAdornment position='end'>
									{props.endAdornment}
								</InputAdornment>
							) : null,
						}}
					/>
				</Box>
			</ContextMenu>

			<Dialog
				onClose={() => setTableDialogOpen(false)}
				open={tableDialogOpen}
				maxWidth='xl'
				fullWidth>
				<DialogTitle
					sx={{
						display: 'flex',
						alignItems: 'center',
						justifyContent: 'space-between',
					}}>
					{props.label}
					<IconButton
						aria-label='close'
						onClick={() => setTableDialogOpen(false)}
						size='large'>
						<Close />
					</IconButton>
				</DialogTitle>
				<DialogContent dividers sx={{ p: 2 }}>
					<ResultTable
						{...omit(props, ['onSelectedDataChanged', 'defaultValue'])}
						defaultValue={tableDefaultValue()} //Checks for clear case on updatedData. If cleared, return null as updatedValue. If not, return the updatedValue or defaultValue.
						onSelectedDataChanged={(name, selections) =>
							handleSelectedDataChanged(name, selections)
						}
					/>
				</DialogContent>
				<DialogActions>
					<Button onClick={() => setTableDialogOpen(false)}>Close</Button>
					<Button
						onClick={handleSaveClick}
						color='secondary'
						variant='contained'
						disabled={saveBtnDisabled}>
						Save
					</Button>
				</DialogActions>
			</Dialog>

			<Dialog
				onClose={() => setRecordDialogOpen(false)}
				open={recordDialogOpen}
				maxWidth='xl'
				fullWidth>
				<DialogTitle
					sx={{
						display: 'flex',
						alignItems: 'center',
						justifyContent: 'space-between',
					}}>
					Editing {props.formName.replaceAll('_', ' ')}
					<IconButton
						aria-label='close'
						onClick={() => setRecordDialogOpen(false)}
						size='large'>
						<Close />
					</IconButton>
				</DialogTitle>
				<DialogContent dividers>
					<RenderForm
						openInDialog
						id={selections && selections.length > 0 ? selections.ID : null}
						dialogLoadData={props.dialogLoadData}
						formName={props.formName}
					/>
				</DialogContent>
				<DialogActions>
					<Button onClick={() => setRecordDialogOpen(false)}>Close</Button>
					<Button
						onClick={handleRecordSaveClick}
						color='secondary'
						variant='contained'
						disabled={saveBtnDisabled}>
						Save
					</Button>
				</DialogActions>
			</Dialog>
		</div>
	);
};

LookupField.propTypes = {
	defaultValue: PropTypes.oneOfType([
		PropTypes.object,
		PropTypes.array,
		PropTypes.string,
	]),
	dialogLoadData: PropTypes.object,
	displayKey: PropTypes.string,
	endAdornment: PropTypes.element,
	formName: PropTypes.string.isRequired,
	label: PropTypes.string.isRequired,
	loadData: PropTypes.object,
	name: PropTypes.string.isRequired,
	singleSelect: PropTypes.bool,
	sortBySelected: PropTypes.bool,
	startAdornment: PropTypes.element,
};

LookupField.defaultProps = {
	defaultValue: null,
};

export default LookupField;
