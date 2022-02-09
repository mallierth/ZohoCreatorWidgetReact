//import { useWhyDidYouUpdate } from 'use-why-did-you-update';
import React, { forwardRef, useEffect, useState } from 'react';
import { omit } from 'lodash-es';
import { InputAdornment, TextField, FormControlLabel, Checkbox, RadioGroup, Radio, Typography } from '@mui/material';
import RichTextField from '../RichText/RichTextField';

import DateAdapter  from '@mui/lab/AdapterDayjs';
import LocalizationProvider from '@mui/lab/LocalizationProvider';
import DatePicker from '@mui/lab/DatePicker';
import DateTimePicker from '@mui/lab/DateTimePicker';
import TimePicker from '@mui/lab/TimePicker';
import { useDataUpdater, useSetFormError } from '../Helpers/FormDataContext';

const Input = forwardRef((props, ref) => {
    const [value, setValue] = useState(props.loadData || props.defaultValue);
    const [error, setError] = useState(props.required && !props.defaultValue);
    const [helperText, setHelperText] = useState(props.helperText);
    const setFormError = useSetFormError();
    //const setUpdatedData = useSetRecoilState(updatedFormDataState);
    const setUpdatedData = useDataUpdater();

    useEffect(() => {
        if(!props.loadData) {
            setValue(props.defaultValue);
        }
        
    }, [props.defaultValue])

    useEffect(() => {
        if(props.onChange) {
            props.onChange(value);
        }

        if(props.characterLimit && value) {
            setError(false);
            setHelperText(`${value ? value.length : 0}/${props.characterLimit} characters`)
        } else if(props.required && !value) {
            setError(true);
            setHelperText('Please enter a value.');
        } else {
            setError(false);
            setHelperText(props.helperText);
        }

        if(value !== props.defaultValue) {
            setUpdatedData(data => ({...data, [props.name]: value}));
        } else if(value === props.defaultValue){
            setUpdatedData(data => omit(data, props.name));
        }

    }, [value]);

    useEffect(() => {
        setFormError(data => ({...data, [props.name]: error}));
    }, [error])

    const handleChange = (value) => {
        if(props.characterLimit && value.length > props.characterLimit) {
            setValue(value.substring(0, props.characterLimit));
        } else {
            setValue(value);
        }
    }

    if(props.richText) {
        return (
            <RichTextField
                initialValue={value}
                onChange={(html) => handleChange(html)}
                size='small'/>
        )
    }

    if(props.date) {
        return (
            <LocalizationProvider dateAdapter={DateAdapter }>
                <DatePicker
                    label={props.label}
                    value={value}
                    onChange={(moment) => moment ? setValue(moment.format('l')) : setValue('')}
                    renderInput={(params) => <TextField fullWidth variant='standard' required={props.required} helperText={helperText} error={error} {...params}/>}
                />
            </LocalizationProvider>
        )
    }

    if(props.time) {
        return (
            <LocalizationProvider dateAdapter={DateAdapter }>
                <TimePicker
                    label={props.label}
                    value={value}
                    onChange={(moment) => moment ? setValue(moment.format('LT')) : setValue('')}
                    renderInput={(params) => <TextField fullWidth variant='standard' required={props.required} helperText={helperText} error={error} {...params}/>}
                />
            </LocalizationProvider>
        )
    }

    if(props.dateTime) {
        return (
            <LocalizationProvider dateAdapter={DateAdapter }>
                <DateTimePicker
                    label={props.label}
                    value={value}
                    onChange={(moment) => moment ? setValue(moment.format('l LT')) : setValue('')}
                    renderInput={(params) => <TextField fullWidth variant='standard' required={props.required} helperText={helperText} error={error} {...params}/>}
                />
            </LocalizationProvider>
        )
    }

    if(props.checkbox) {
        return (
            <FormControlLabel
                checked={value}
                onChange={(e) => setValue(e.target.checked)}
                control={ <Checkbox />}
                label={props.label}
            />
        )
    }

    if(props.radioGroup) {
        return (
            <RadioGroup
                defaultValue='Preset'
                onChange={(e) => handleChange(e.target.value)}
                name='Price_Level_Type'
                value={value}>
                {props.options.map(option => (
                    <Box key={option.label}>
                        <FormControlLabel
                            value={option.value}
                            control={<Radio />}
                            label={option.label}
                        />
                        <Typography>Test Custom Component</Typography>
                    </Box>
                ))}
            </RadioGroup>
        )
    }

    const renderTextField = () => (
        <TextField
            {...omit(props, [
                'helperText',
                'startAdornment',
                'endAdornment',
                'showSearch',
                'singleSelect',
                'clickToSelect',
                'reportName',
                'displayKey',
                'initialSelections',
                'enableCollapseRows',
                'showShiftControls',
                'showAssemblyControls',
                'showEdit',
                'showCommentAdd',
                'showMassUpdate',
                'showDuplicate',
                'showDelete',
                'onSelectedDataChanged',
                'customSelectionMessage',
                'showExport',
                'showColumnSelect',
                'enableSort',
                'defaultOrderBy',
                'pagination',
                'enableDndRows',
                'formName',
                'characterLimit',
                'readOnly',
                'loadData',
                'defaultValue',
            ])}
            helperText={helperText}
            error={error}
            fullWidth={ props.fullWidth === false ? false : true}
            autoComplete='off'
            value={value}
            onChange={(e) => handleChange(e.target.value)}
            ref={ref}
            variant='standard'
            InputProps={{
                startAdornment: props.startAdornment ? <InputAdornment position="start">{props.startAdornment}</InputAdornment>  : null,
                endAdornment: props.endAdornment ? <InputAdornment position="end">{props.endAdornment}</InputAdornment> : null,
                readOnly: props.readOnly ? true : false,
            }}
        >
            {props.children}
        </TextField>
    )
    
    return (
        <>
            { renderTextField() }
        </>
    )
});

Input.displayName = Input;

export default Input;