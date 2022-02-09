import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import ToastMessage from '../ToastMessage/ToastMessage';

const defaultAutoHideDuration = 5000;

const SaveManager = ({ formDataState, email, defaultLocation }) => {
	const [toastData, setToastData] = useState({});
	const [autoHideDuration, setAutoHideDuration] = useState(defaultAutoHideDuration);

	useEffect(() => {
		switch (formDataState.status) {
			case 'uploading':
				setAutoHideDuration(null);
				setToastData({
					message: formDataState.message ? formDataState.message : 'Uploading files to database...',
					severity: 'info',
					color: 'secondary.light',
				});
				break;
			case 'uploaded':
				setAutoHideDuration(defaultAutoHideDuration);
				setToastData({
					message: formDataState.message ? formDataState.message : 'Files uploaded successfully!',
					severity: 'success',
					color: 'primary.light',
				});
				break;
			case 'saving':
				setAutoHideDuration(null);
				setToastData({
					message: formDataState.message ? formDataState.message : email ? 'Working on sending email...' : 'Saving data to database...',
					severity: 'info',
				});
				break;
			case 'saved':
				setAutoHideDuration(defaultAutoHideDuration);
				setToastData({
					message: formDataState.message ? formDataState.message : email ? 'Email sent successfully!' : 'Data saved successfully!',
					severity: 'success',
				});
				break;
			case 'deleting':
				setAutoHideDuration(null);
				setToastData({
					message: formDataState.message ? formDataState.message : 'Deleting data in database...',
					severity: 'info',
				});
				break;
			case 'deleted':
				setAutoHideDuration(defaultAutoHideDuration);
				setToastData({
					message: formDataState.message ? formDataState.message : 'Data deleted successfully!',
					severity: 'success',
				});
				break;
			case 'workflow_error':
				setAutoHideDuration(defaultAutoHideDuration);
				setToastData({
					message: formDataState.message ? formDataState.message : `Data save forcibly interrupted by a Zoho workflow, please contact your system's administrator!`,
					severity: 'warning',
				});
				break;
			case 'validation_error':
				setAutoHideDuration(defaultAutoHideDuration);
				setToastData({
					message: formDataState.message ? formDataState.message : 'Error saving data: form data validation failed!',
					severity: 'error',
				});
				break;
			case 'saved_with_errors':
				setAutoHideDuration(defaultAutoHideDuration);
				setToastData({
					message: formDataState.message ? formDataState.message : 'Data saved but with errors... hmm...',
					severity: 'warning',
				});
				break;
			case 'error':
				setAutoHideDuration(defaultAutoHideDuration);
				setToastData({
					message: formDataState.message ? formDataState.message : `Error saving data: ${formDataState.error}`,
					severity: 'error',
				});
				break;
		}
	}, [formDataState]);

	return <ToastMessage data={toastData} autoHideDuration={autoHideDuration} defaultLocation={defaultLocation} />;
};

SaveManager.propTypes = {
    formDataState: PropTypes.shape({
        status: PropTypes.string,
        error: PropTypes.oneOfType([
            PropTypes.string,
            PropTypes.object,
            PropTypes.array,
        ]),
		message: PropTypes.string,
    }),
	email: PropTypes.bool,
	defaultLocation: PropTypes.bool,
}

export default SaveManager;
