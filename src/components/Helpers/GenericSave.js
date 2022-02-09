import React, { useEffect, useState, useContext } from 'react';
import { useRecoilValue, useRecoilState, useSetRecoilState } from 'recoil';
import { Alert, Box, Container, Fab, Snackbar, Tooltip, Zoom } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { Save } from '@mui/icons-material';
import { currentUserState, updatedFormDataState } from '../../recoil/atoms';
import { useZohoSaveRecord, useDebounce, } from './CustomHooks';

//@1982 window.innerWidth, I should be ~right: 280px
//(window.innerWidth - containerMaxWidth(1440)) / 2 = offset

const GenericSave = ({id, updatedData, formName, reportName, onSave, autosaver, debounceTime = 1500 }) => {
    const [saveState, addRecord, updateRecord ] = useZohoSaveRecord();
    const currentUser = useRecoilValue(currentUserState);
    const [toastOpen, setToastOpen] = useState(false);
    const [toastSeverity, setToastSeverity] = useState('success');
    const [toastMessage, setToastMessage] = useState('');
    const autoSaveData = useDebounce(updatedData, debounceTime);

    useEffect(() => {

        if(!updatedData) return;

        if(Array.isArray(updatedData) && updatedData.length > 0) {
            updateRecord(reportName, id, updatedData);
        } else {
            if(id && Object.keys(updatedData).length > 0 && (currentUser.Enable_Autosave === true || currentUser.Enable_Autosave === 'true' || autosaver)) {
                updateRecord(reportName, id, updatedData);
            } else if(!id && Object.keys(updatedData).length > 0 && (currentUser.Enable_Autosave === true || currentUser.Enable_Autosave === 'true' || autosaver)) {
                addRecord(formName, updatedData);
            }
        }
        
    }, [autoSaveData])

    const handleToastClose = (e, reason) => {
        if (reason === 'clickaway') {
          return;
        }
    
        setToastOpen(false);
    };

    useEffect(() => {
        switch(saveState.status) {
            case 'saving':
                setToastMessage(`Saving data to ${reportName.replaceAll('_', ' ')} report...`);
                setToastSeverity('info');
                setToastOpen(true);
            break;
            case 'saved':
                if(onSave) onSave(saveState.data);
                setToastMessage(`Successfully saved data to ${reportName.replaceAll('_', ' ')} report!`);
                setToastSeverity('success');
                setToastOpen(true);
            break;
            case 'error':
                setToastMessage(`Error: ${saveState.error}`);
                setToastSeverity('error');
                setToastOpen(true);
            break;
            case 'workflow_error':
                setToastMessage(`Workflow error! This is a back-end error in Zoho's code that should be fixable by your system's administrator.`);
                setToastSeverity('warning');
                setToastOpen(true);
            break;
            case 'validation_error':
                setToastMessage(`Validation warning: ${saveState.error}`);
                setToastSeverity('info');
                setToastOpen(true);
            break;
        }

    }, [saveState.status])

    return (
        <Snackbar open={toastOpen} autoHideDuration={6000} onClose={handleToastClose}>
            <Alert onClose={handleToastClose} severity={toastSeverity} variant='filled' sx={{ width: '100%' }}>
                {toastMessage}
            </Alert>
        </Snackbar>
    )
}

export default GenericSave;