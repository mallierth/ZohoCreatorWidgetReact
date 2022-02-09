import React, { useEffect, useState, useContext } from 'react';
import { useRecoilValue, useRecoilState, useSetRecoilState } from 'recoil';
import { Alert, Box, Container, Fab, Snackbar, Tooltip, Zoom } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { Save } from '@mui/icons-material';
import { currentUserState, updatedFormDataState } from '../../recoil/atoms';
import { useDebounce, useZohoDeleteRecord, } from './CustomHooks';

const GenericDelete = ({reportName, criteria, idArray, onDelete }) => {
    const [deleteState, deleteRecord ] = useZohoDeleteRecord();
    const currentUser = useRecoilValue(currentUserState);
    const [toastOpen, setToastOpen] = useState(false);
    const [toastSeverity, setToastSeverity] = useState('success');
    const [toastMessage, setToastMessage] = useState('');

    const handleToastClose = (e, reason) => {
        if (reason === 'clickaway') {
          return;
        }
    
        setToastOpen(false);
    };

    useEffect(() => {
        if(reportName && criteria) {
            deleteRecord(reportName, criteria, idArray);
        }
    }, [criteria]);

    useEffect(() => {
        switch(deleteState.status) {
            case 'deleting':
                setToastMessage('Attempting to delete data...');
                setToastSeverity('info');
                setToastOpen(true);
            break;
            case 'deleted':
                if(onDelete) onDelete(deleteState.data);

                setToastMessage('Data deleted successfully!');
                setToastSeverity('success');
                setToastOpen(true);
            break;
            case 'error':
                setToastMessage(`Error: ${deleteState.error}`);
                setToastSeverity('error');
                setToastOpen(true);
            break;
            case 'workflow_error':
                setToastMessage(`Workflow error! This is a back-end error in Zoho's code that should be fixable by your system's administrator.`);
                setToastSeverity('warning');
                setToastOpen(true);
            break;
            case 'validation_error':
                setToastMessage(`Validation warning: ${deleteState.error}`);
                setToastSeverity('info');
                setToastOpen(true);
            break;
        }

    }, [deleteState.status])

    return (
        <Snackbar open={toastOpen} autoHideDuration={6000} onClose={handleToastClose}>
            <Alert onClose={handleToastClose} severity={toastSeverity} variant='filled' sx={{ width: '100%' }}>
                {toastMessage}
            </Alert>
        </Snackbar>
    )
}

export default GenericDelete;