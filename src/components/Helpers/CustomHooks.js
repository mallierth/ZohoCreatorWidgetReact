import { omit } from 'lodash-es';
import { useState, useEffect, useRef, useReducer } from 'react';
import {
	flattenCollabsibleLineItemArray,
	intTryParse,
	jsonTryParse,
	currency,
	sum,
	plurifyFormName,
} from '../Helpers/functions';
import { Box, TextField, Typography } from '@mui/material';
import { v4 as uuidv4 } from 'uuid';
import { appName } from '../../apis/ZohoCreator';

export const useFormData = (data = {}, loadData) => {
	const initialState = {
		status: '',
		message: '',
		error: '',
		data: data.ID || !loadData ? {} : loadData,
		history: [],
		currentData: formatZohoDatabaseData(data) || {},
		savedData: formatZohoDatabaseData(data) || {},
		onSuccess: {},
	};

	const [state, dispatch] = useReducer((state, action) => {
		switch (action.type) {
			case 'MOUNT':
				let dataKey = Object.keys(action.payload)[0];
				if (
					((Array.isArray(action.payload[dataKey]) ||
						typeof action.payload[dataKey] === 'object') &&
						JSON.stringify(state.savedData[dataKey]) ===
							JSON.stringify(action.payload[dataKey])) ||
					(Array.isArray(action.payload[dataKey]) &&
						action.payload[dataKey].length === 0 &&
						state.savedData[dataKey] === '')
				) {
					//data will not be mounted since it is already what was last successfully saved
					//! This also accounts [] from currentData to "" on the Zoho back end
					return {
						...state,
						status: 'mounted',
						data: omit(state.data, dataKey),
						currentData: { ...state.savedData, ...omit(state.data, dataKey) },
						onSuccess: null,
					};
				} else if (state.savedData[dataKey] === action.payload[dataKey]) {
					//data will not be mounted since it is already what was last successfully saved
					return {
						...state,
						status: 'mounted',
						data: omit(state.data, dataKey),
						currentData: { ...state.savedData, ...omit(state.data, dataKey) },
						onSuccess: null,
					};
				}
				return {
					...state,
					status: 'mounted',
					data: { ...state.data, ...action.payload },
					currentData: { ...state.savedData, ...state.data, ...action.payload },
					onSuccess: null,
				};
			case 'RESET':
				return {
					...state,
					status: '',
					message: '',
					error: '',
					data: {},
					history: [],
					currentData: formatZohoDatabaseData(data) || {},
					savedData: formatZohoDatabaseData(data) || {},
					onSuccess: {},
				};
			case 'SAVING':
				return {
					...state,
					status: 'saving',
					message: action.message,
					data: action.payload,
					currentData: { ...state.savedData, ...action.payload },
					error: null,
					onSuccess: null,
				};
			case 'SAVED':
				return {
					...state,
					status: 'saved',
					message: action.message,
					data: {},
					savedData: { ...state.savedData, ...action.payload },
					currentData: { ...state.savedData, ...action.payload },
					error: null,
					onSuccess: action.onSuccess,
				};
			case 'ERROR':
				return {
					...state,
					status: 'error',
					message: action.message,
					error: action.payload,
					onSuccess: null,
				};
			case 'WORKFLOW_ERROR':
				return {
					...state,
					status: 'workflow_error',
					message: action.message,
					error: action.payload,
					onSuccess: null,
				};
			case 'VALIDATION_ERROR':
				return {
					...state,
					status: 'validation_error',
					message: action.message,
					error: action.payload,
					onSuccess: null,
				};
			case 'SAVED_WITH_ERRORS':
				return {
					...state,
					status: 'saved_with_errors',
					message: action.message,
					data: action.payload,
					onSuccess: action.onSuccess,
				};
			case 'DELETING':
				return {
					...state,
					status: 'deleting',
					message: action.message,
					data: action.payload,
					savedData: null,
					error: null,
					onSuccess: null,
				};
			case 'DELETED':
				return {
					...state,
					status: 'deleted',
					message: action.message,
					data: {},
					savedData: { ...state.data, ...action.payload },
					error: null,
					onSuccess: action.onSuccess,
				};
			case 'UPLOADED_WITH_ERRORS':
				return {
					...state,
					status: 'uploaded_with_errors',
					message: action.message,
					data: action.payload,
					onSuccess: action.onSuccess,
				};
			case 'UPLOADING':
				return {
					...state,
					status: 'uploading',
					message: action.message,
					data: action.payload,
					error: null,
					onSuccess: null,
				};
			case 'UPLOADED':
				return {
					...state,
					status: 'uploaded',
					message: action.message,
					data: {},
					savedData: { ...state.savedData, ...action.payload },
					currentData: { ...state.savedData, ...action.payload },
					error: null,
					onSuccess: action.onSuccess,
				};
			default:
				return state;
		}
	}, initialState);

	const mountData = (fieldKey, value) => {
		dispatch({ type: 'MOUNT', payload: { [fieldKey]: value } });
	};

	const resetData = () => {
		dispatch({ type: 'RESET' });
	};

	const addRecord = async (formName, data, onSuccess) => {
		if (!formName) {
			dispatch({
				type: 'ERROR',
				payload: 'Error inside CustomHooks.js addRecord: No formName provided!',
			});
			throw new Error(
				'Error inside CustomHooks.js addRecord: No formName provided!'
			);
		}

		if (!data) {
			dispatch({
				type: 'ERROR',
				payload: 'Error inside CustomHooks.js addRecord: No data provided!',
			});
			throw new Error(
				'Error inside CustomHooks.js addRecord: No data provided!'
			);
		}

		dispatch({ type: 'SAVING', payload: data });
		try {
			if (Array.isArray(data)) {
				const errors = [];
				const successes = [];
				const workflowErrors = [];
				const validationErrors = [];
				let i = 0;
				for (var d of data) {
					i++;
					const formattedData = formatFormData(d);
					let successfulUploadObject = {};
					dispatch({
						type: 'SAVING',
						payload: formattedData,
						message: `Creating ${formName.replaceAll('_', ' ')} ${i} of ${
							data.length
						}`,
					});
					const response = await ZOHO.CREATOR.API.addRecord({
						appName,
						formName,
						data: { data: formattedData.data },
					}).catch((err) => {
						console.log('addRecord [] err', err);
						errors.push(err);
					});

					console.log('addRecord [] response', response);

					if (response && response.code === 3000) {
						if (formattedData.files.length > 0) {
							//Need to add files now that record exists
							//! Object shape: { fieldKey: 'Field_Link_Name', recordId: ID, file: jsFile }
							for (let upload of formattedData.files) {
								await uploadFile(
									plurifyFormName(formName),
									response.data.ID,
									upload.fieldKey,
									upload.file,
									(uploadedData) => {
										successfulUploadObject = {
											...successfulUploadObject,
											...uploadedData,
										};
										console.log(
											'CustomHooks.js => onAdd([array]) => uploadFile => success!',
											uploadedData
										);
									}
								);
							}
							if (formName === 'Email') {
								await updateRecord('Emails', response.data.ID, {
									Send_Email_With_Attachments: true,
								});
							}
						}
						const addData = await ZOHO.CREATOR.API.getRecordById({
							appName,
							reportName: plurifyFormName(formName),
							id: response.data.ID,
						});

						successes.push({ ...d, ...addData.data, Added: true });
					} else if (response && response.code === 3001) {
						//! Back end workflow error
						workflowErrors.push(response.error);
					} else if (response && response.code === 3002) {
						//! Back end validation failed
						validationErrors.push(
							Object.keys(response.error).map((key) => response.error[key])
						);
					} else if (response && response.code === 404) {
						errors.push(JSON.parse(response.responseText).message);
					} else {
						console.log('unaccounted for on add error code:', response);
					}
				}

				console.log(
					'addRecord [] successes',
					successes.length === data.length,
					successes
				);

				if (successes.length === data.length) {
					//! 100% Success
					dispatch({
						type: 'SAVED',
						payload: successes,
						onSuccess: onSuccess ? onSuccess(successes) : null,
					});
				} else if (successes.length > 0 && successes.length < data.length) {
					//Partially saved
					dispatch({
						type: 'SAVED_WITH_ERRORS',
						payload: [{ errors, successes, workflowErrors, validationErrors }],
						onSuccess: onSuccess ? onSuccess() : null,
					});
				} else if (errors.length === data.length) {
					//! 100% Errors
					dispatch({ type: 'ERROR', payload: errors });
				} else if (workflowErrors.length === data.length) {
					//! 100% Workflow errors
					dispatch({
						type: 'WORKFLOW_ERROR',
						payload: workflowErrors,
					});
				} else if (validationErrors.length === data.length) {
					//! 100% Validation errors
					dispatch({
						type: 'VALIDATION_ERROR',
						payload: validationErrors,
					});
				}
			} else {
				const formattedData = formatFormData(data);

				console.log('addRecord formattedData', formattedData);
				const response = await ZOHO.CREATOR.API.addRecord({
					appName,
					formName,
					data: { data: formattedData.data },
				}).catch((err) => {
					console.log('addRecord {} err', err);
					dispatch({ type: 'ERROR', payload: err });
				});

				console.log('addRecord {} response', response);

				if (response && response.code === 3000) {
					let successfulUploadObject = {};
					if (formattedData.files.length > 0) {
						//Need to add files now that record exists
						//! Object shape: { fieldKey: 'Field_Link_Name', recordId: ID, file: jsFile }
						for (let upload of formattedData.files) {
							await uploadFile(
								plurifyFormName(formName),
								response.data.ID,
								upload.fieldKey,
								upload.file,
								(uploadedData) => {
									successfulUploadObject = {
										...successfulUploadObject,
										...uploadedData,
									};
									console.log(
										'CustomHooks.js => onAdd({object}) => uploadFile => success!',
										uploadedData
									);
								}
							);
						}
						if (formName === 'Email') {
							await updateRecord('Emails', response.data.ID, {
								Send_Email_With_Attachments: true,
							});
						}
					}

					//This is mainly for any workflows that will execute on create on the back end - things like record Name/Numbers
					const addData = await ZOHO.CREATOR.API.getRecordById({
						appName,
						reportName: plurifyFormName(formName),
						id: response.data.ID,
					});

					dispatch({
						type: 'SAVED',
						payload: { ...data, ...addData.data, Added: true },
						onSuccess: onSuccess
							? onSuccess({ ...data, ...addData.data, Added: true })
							: null,
					});
				} else if (response && response.code === 3001) {
					//! Back end workflow error
					dispatch({
						type: 'WORKFLOW_ERROR',
						payload: response.error,
					});
				} else if (response && response.code === 3002) {
					//! Back end validation failed
					dispatch({
						type: 'VALIDATION_ERROR',
						payload: Object.keys(response.error).map(
							(key) => response.error[key]
						),
					});
				} else if (response && response.code === 404) {
					dispatch({
						type: 'ERROR',
						payload: `Zoho Error Response: ${
							JSON.parse(response.responseText).message
						}`,
					});
				} else {
					console.log('unaccounted for on SAVE error code:', response);
				}
			}
		} catch (error) {
			dispatch({
				type: 'ERROR',
				payload: error.message,
			});
		}
	};

	const updateRecord = async (reportName, id, data, onSuccess) => {
		if (!reportName) {
			dispatch({
				type: 'ERROR',
				payload:
					'Error inside CustomHooks.js updateRecord: No reportName provided!',
			});
			throw new Error(
				'Error inside CustomHooks.js updateRecord: No reportName provided!'
			);
		}

		if (!id) {
			dispatch({
				type: 'ERROR',
				payload: 'Error inside CustomHooks.js updateRecord: No id provided!',
			});
			throw new Error(
				'Error inside CustomHooks.js updateRecord: No id provided!'
			);
		}

		if (!data) {
			dispatch({
				type: 'ERROR',
				payload: 'Error inside CustomHooks.js updateRecord: No data provided!',
			});
			throw new Error(
				'Error inside CustomHooks.js updateRecord: No data provided!'
			);
		}

		dispatch({ type: 'SAVING', payload: data });
		try {
			if (Array.isArray(data)) {
				const errors = [];
				const successes = [];
				const workflowErrors = [];
				const validationErrors = [];

				for (var d of data) {
					const formattedData = formatFormData(d);
					let successfulUploadObject = {};
					if (formattedData.files.length > 0) {
						//Need to add files now that record exists
						//! Object shape: { fieldKey: 'Field_Link_Name', recordId: ID, file: jsFile }
						for (let upload of formattedData.files) {
							await uploadFile(
								reportName,
								d.ID,
								upload.fieldKey,
								upload.file,
								(uploadedData) => {
									successfulUploadObject = {
										...successfulUploadObject,
										...uploadedData,
									};
									console.log(
										'CustomHooks.js => updateRecord([array]) => uploadFile => success!',
										uploadedData
									);
								}
							);
						}
					}

					const response = await ZOHO.CREATOR.API.updateRecord({
						appName,
						reportName,
						id: d.ID,
						data: { data: formattedData.data },
					}).catch((err) => {
						console.log('CustomHooks useFormData updateRecord [] err', err);
						errors.push(err);
					});

					console.log(
						'CustomHooks useFormData updateRecord [] response',
						response
					);

					if (response && response.code === 3000) {
						successes.push({
							...d,
							...response.data,
							...successfulUploadObject,
						});
					} else if (response && response.code === 3001) {
						//! Back end workflow error
						workflowErrors.push(response.error);
					} else if (response && response.code === 3002) {
						//! Back end validation failed
						validationErrors.push(
							Object.keys(response.error).map((key) => response.error[key])
						);
					} else {
						console.log('unaccounted for on add error code:', response);
					}
				}
				if (successes.length === data.length) {
					//! 100% Success
					dispatch({
						type: 'SAVED',
						payload: successes,
						onSuccess: onSuccess ? onSuccess(successes) : null,
					});
				} else if (successes.length > 0 && successes.length < data.length) {
					//Partially saved
					dispatch({
						type: 'SAVED_WITH_ERRORS',
						payload: [{ errors, successes, workflowErrors, validationErrors }],
						onSuccess: onSuccess ? onSuccess() : null,
					});
				} else if (errors.length === data.length) {
					//! 100% Errors
					dispatch({ type: 'ERROR', payload: errors });
				} else if (workflowErrors.length === data.length) {
					//! 100% Workflow errors
					dispatch({
						type: 'WORKFLOW_ERROR',
						payload: workflowErrors,
					});
				} else if (validationErrors.length === data.length) {
					//! 100% Validation errors
					dispatch({
						type: 'VALIDATION_ERROR',
						payload: validationErrors,
					});
				}
			} else {
				const formattedData = formatFormData(data);
				let successfulUploadObject = {};
				if (formattedData.files.length > 0) {
					//Need to add files now that record exists
					//! Object shape: { fieldKey: 'Field_Link_Name', recordId: ID, file: jsFile }
					for (let upload of formattedData.files) {
						await uploadFile(
							reportName,
							id,
							upload.fieldKey,
							upload.file,
							(uploadedData) => {
								successfulUploadObject = {
									...successfulUploadObject,
									...uploadedData,
								};
								console.log(
									'CustomHooks.js => updateRecord({object}) => uploadFile => success!',
									uploadedData
								);
							}
						);
					}
				}
				const response = await ZOHO.CREATOR.API.updateRecord({
					appName,
					reportName,
					id,
					data: { data: formattedData.data },
				}).catch((err) => {
					console.log('CustomHooks useFormData updateRecord {} err', err);
					dispatch({ type: 'ERROR', payload: err });
				});

				console.log(
					'CustomHooks useFormData updateRecord {} response',
					response
				);

				if (response && response.code === 3000) {
					dispatch({
						type: 'SAVED',
						payload: { ...data, ...response.data, ...successfulUploadObject },
						onSuccess: onSuccess
							? onSuccess({
									...data,
									...response.data,
									...successfulUploadObject,
							  })
							: null,
					});
				} else if (response && response.code === 3001) {
					//! Back end workflow error
					dispatch({
						type: 'WORKFLOW_ERROR',
						payload: response.error,
					});
				} else if (response && response.code === 3002) {
					//! Back end validation failed
					dispatch({
						type: 'VALIDATION_ERROR',
						payload: Object.keys(response.error).map(
							(key) => response.error[key]
						),
					});
				} else {
					console.log('unaccounted for on add error code:', response);
				}
			}
		} catch (error) {
			dispatch({
				type: 'ERROR',
				payload: error.message,
			});
		}
	};

	const uploadFile = async (reportName, id, fieldName, file, onSuccess) => {
		//#region
		if (!reportName) {
			dispatch({
				type: 'ERROR',
				payload:
					'Error inside CustomHooks.js uploadFile: No reportName provided!',
			});
			throw new Error(
				'Error inside CustomHooks.js uploadFile: No reportName provided!'
			);
		}

		if (!id) {
			dispatch({
				type: 'ERROR',
				payload: 'Error inside CustomHooks.js uploadFile: No id provided!',
			});
			throw new Error(
				'Error inside CustomHooks.js uploadFile: No id provided!'
			);
		}

		if (!fieldName) {
			dispatch({
				type: 'ERROR',
				payload:
					'Error inside CustomHooks.js uploadFile: No fieldName provided!',
			});
			throw new Error(
				'Error inside CustomHooks.js uploadFile: No fieldName provided!'
			);
		}

		if (!file) {
			dispatch({
				type: 'ERROR',
				payload: 'Error inside CustomHooks.js uploadFile: No file provided!',
			});
			throw new Error(
				'Error inside CustomHooks.js uploadFile: No file provided!'
			);
		}

		if (!(file instanceof File)) {
			dispatch({
				type: 'ERROR',
				payload:
					'Error inside CustomHooks.js uploadFile: Invalid file provided!',
			});
			throw new Error(
				'Error inside CustomHooks.js uploadFile: Invalid file provided!'
			);
		}
		//#endregion

		dispatch({ type: 'UPLOADING', payload: file });
		try {
			const response = await ZOHO.CREATOR.API.uploadFile({
				appName,
				reportName,
				id,
				fieldName,
				file,
			}).catch((err) => {
				dispatch({ type: 'ERROR', payload: err });
			});

			if (response && response.code === 3000) {
				/*
				/api/v2/visionpointllc/av-professional-services/report/Notes/3860683000013962695/File_Upload_0/download?filepath=1639070902419_ZohoCreatorWidgetReact.zip
				*/

				const zohoDownloadUrlEmulation = `/api/v2/visionpointllc/av-professional-services/report/${reportName}/${id}/${fieldName}/download?filepath=${response.data.filepath}`;
				dispatch({
					type: 'UPLOADED',
					payload: { [fieldName]: zohoDownloadUrlEmulation },
					onSuccess: onSuccess
						? onSuccess({ [fieldName]: zohoDownloadUrlEmulation })
						: null,
				});
			} else if (response && response.code === 3001) {
				//! Back end workflow error
				dispatch({
					type: 'WORKFLOW_ERROR',
					payload: response.error,
				});
			} else if (response && response.code === 3002) {
				//! Back end validation failed
				dispatch({
					type: 'VALIDATION_ERROR',
					payload: Object.keys(response.error).map(
						(key) => response.error[key]
					),
				});
			} else {
				console.log('unaccounted for uploadFile error code:', response);
			}
		} catch (error) {
			dispatch({ type: 'ERROR', payload: error.message });
		}
	};

	//Here, ID should be an array, and data should be an object that is used to update all records in the idArray
	const massUpdateRecords = async (reportName, idArray, data, onSuccess) => {
		data = formatFormData(data).data;

		if (!Array.isArray(idArray)) {
			throw new TypeError(
				'When mass updating records, parameter "idArray" should be an array of record IDs.'
			);
		}

		if (Array.isArray(data)) {
			throw new TypeError(
				'When mass updating records, parameter "data" should be an object containing the data that will be applied to all record IDs specified - it is currently an array.'
			);
		}

		if (typeof data !== 'object') {
			throw new TypeError(
				`When mass updating records, parameter "data" should be an object containing the data that will be applied to all record IDs specified - it is currently ${typeof data}`
			);
		}

		dispatch({ type: 'SAVING', payload: data });

		try {
			const errors = [];
			const successes = [];
			const workflowErrors = [];
			const validationErrors = [];

			const formattedData = formatFormData(data);

			for (var id of idArray) {
				const response = await ZOHO.CREATOR.API.updateRecord({
					appName,
					reportName,
					id,
					data: { data: formattedData.data },
				}).catch((err) => {
					errors.push(err);
				});

				if (response && response.code === 3000) {
					successes.push({
						...data,
						ID: id,
					});
				} else if (response && response.code === 3001) {
					//! Back end workflow error
					workflowErrors.push(response.error);
				} else if (response && response.code === 3002) {
					//! Back end validation failed
					validationErrors.push(
						Object.keys(response.error).map((key) => response.error[key])
					);
				} else {
					console.log('unaccounted for on add error code:', response);
				}
			}
			if (successes.length === idArray.length) {
				//! 100% Success
				dispatch({
					type: 'SAVED',
					payload: successes,
					onSuccess: onSuccess ? onSuccess(successes) : null,
				});
			} else if (successes.length > 0 && successes.length < idArray.length) {
				//Partially saved
				dispatch({
					type: 'SAVED_WITH_ERRORS',
					payload: [{ errors, successes, workflowErrors, validationErrors }],
					onSuccess: onSuccess ? onSuccess() : null,
				});
			} else if (errors.length === idArray.length) {
				//! 100% Errors
				dispatch({ type: 'ERROR', payload: errors });
			} else if (workflowErrors.length === idArray.length) {
				//! 100% Workflow errors
				dispatch({
					type: 'WORKFLOW_ERROR',
					payload: workflowErrors,
				});
			} else if (validationErrors.length === idArray.length) {
				//! 100% Validation errors
				dispatch({
					type: 'VALIDATION_ERROR',
					payload: validationErrors,
				});
			}
		} catch (error) {
			dispatch({
				type: 'ERROR',
				payload: error.message,
			});
		}
	};

	const deleteRecords = async (reportName, idArray, onSuccess) => {
		if (!Array.isArray(idArray)) {
			throw new TypeError(
				'When deleting records, parameter "idArray" should be an array of record IDs.'
			);
		}

		console.log('deleteRecords', reportName, idArray, onSuccess);

		try {
			dispatch({ type: 'DELETING', payload: idArray });

			const response = await ZOHO.CREATOR.API.deleteRecord({
				appName,
				reportName,
				criteria: idArray.map((id) => `ID==${id}`).join(' || '),
			}).catch((err) => {
				dispatch({ type: 'ERROR', payload: err });
			});

			console.log('deleteRecords response', response);
			const errors = [];
			const successes = [];
			const workflowErrors = [];
			const validationErrors = [];

			if (response && response.code === 3000) {
				if (response.result && Array.isArray(response.result)) {
					response.result.forEach((deletion) => {
						if (deletion.code === 3000) {
							successes.push(deletion.data);
						} else if (deletion.code === 3001) {
							//! Back end workflow error
							workflowErrors.push(deletion.error);
						} else if (deletion.code === 3002) {
							//! Back end validation failed
							validationErrors.push(deletion.error);
						} else {
							console.log('unaccounted for on delete error code:', deletion);
						}
					});
				}

				if (successes.length === response.result.length) {
					//! 100% Success
					dispatch({
						type: 'DELETED',
						payload: successes,
						onSuccess: onSuccess ? onSuccess(successes) : null,
					});
				} else if (
					successes.length > 0 &&
					successes.length < response.result.length
				) {
					//Partially saved
					dispatch({
						type: 'DELETED_WITH_ERRORS',
						payload: [{ errors, successes, workflowErrors, validationErrors }],
						onSuccess: onSuccess ? onSuccess() : null,
					});
				} else if (errors.length === response.result.length) {
					//! 100% Errors
					dispatch({ type: 'ERROR', payload: errors });
				} else if (workflowErrors.length === response.result.length) {
					//! 100% Workflow errors
					dispatch({
						type: 'WORKFLOW_ERROR',
						payload: workflowErrors,
					});
				} else if (validationErrors.length === response.result.length) {
					//! 100% Validation errors
					dispatch({
						type: 'VALIDATION_ERROR',
						payload: validationErrors,
					});
				}
			} else {
				console.log('unaccounted for on delete error code:', response);
			}
		} catch (error) {
			dispatch({
				type: 'ERROR',
				payload: error.message,
			});
		}
	};

	return [
		state,
		addRecord,
		updateRecord,
		mountData,
		resetData,
		massUpdateRecords,
		deleteRecords,
		uploadFile,
	];
};

//#region Zoho APIs

export const useZohoGetRecordById = (reportName, id) => {
	const cache = useRef({});
	const initialState = {
		status: 'idle',
		error: null,
		data: {},
	};

	const [state, dispatch] = useReducer((state, action) => {
		switch (action.type) {
			case 'FETCHING':
				return { ...state, status: 'fetching' };
			case 'FETCHED':
				return { ...state, status: 'fetched', data: action.payload };
			case 'FETCH_ERROR':
				return { ...state, status: 'error', error: action.payload };
			default:
				return state;
		}
	}, initialState);

	useEffect(() => {
		let cancelRequest = false;
		if (!id) return dataMerge;

		(async () => {
			dispatch({ type: 'FETCHING' });
			try {
				if (cache.current[id]) {
					const data = { ...cache.current[id], ...dataMerge };
					dispatch({ type: 'FETCHED', payload: data });
				} else {
					const response = await ZOHO.CREATOR.API.getRecordById({
						appName,
						reportName,
						id,
					}).catch((err) => {
						if (cancelRequest) return;
						if (
							err.responseText &&
							(err.responseText.includes('No Data Available') ||
								err.responseText.includes(
									'No records found for the given criteria'
								))
						) {
							dispatch({ type: 'FETCHED', payload: [] });
						} else {
							dispatch({ type: 'FETCH_ERROR', payload: err });
						}
					});

					if (response && response.code === 3000) {
						if (cancelRequest) return;
						const data = { ...response.data, ...dataMerge };
						cache.current[id] = data;
						dispatch({ type: 'FETCHED', payload: data });
					} else {
						if (cancelRequest) return;
						dispatch({ type: 'FETCH_ERROR', payload: response });
					}
				}
			} catch (error) {
				if (cancelRequest) return;
				dispatch({ type: 'FETCH_ERROR', payload: error.message });
			}
		})();

		return function cleanup() {
			cancelRequest = true;
		};
	}, [id]);

	return state;
};

//Format defaultValue to suppose various input combinations
const getDefaultValueCriteria = (defaultValue) => {
	if (!Array.isArray(defaultValue) && defaultValue) {
		if (typeof defaultValue === 'object') {
			defaultValue = [defaultValue.ID];
		} else {
			defaultValue = [defaultValue];
		}
	} else if (Array.isArray(defaultValue)) {
		defaultValue = defaultValue.map((i) => (typeof i === 'object' ? i.ID : i));
	} else {
		defaultValue = [];
	}

	if (defaultValue.length > 0) {
		return {
			criteria: `(${defaultValue
				.map((criteria) => `ID==${criteria}`)
				.join(' || ')})`,
			idArray: defaultValue,
		};
	}

	return {
		criteria: '',
		idArray: [],
	};
};

//! Important
export const useZohoGetAllRecords = (
	reportName,
	criteria,
	defaultValue = [],
	page = 1,
	pageSize = 200
) => {
	const cache = useRef({});
	const test = useRef([]);
	const initialState = {
		status: 'idle',
		error: null,
		data: [],
		pageBeingFetched: 0,
		pageWithError: 0,
	};
	const maxRecords = criteria ? 2000 : pageSize; //! Multiple of 200

	//This sets a cap on database returns when no criteria is specified - really for performance reasons as this is not a really usable return
	if (!criteria) {
		pageSize = 50;
	}

	const [state, dispatch] = useReducer((state, action) => {
		switch (action.type) {
			case 'RESET':
				if (JSON.stringify(state) !== JSON.stringify(initialState)) {
					return { ...initialState };
				}
				return state;
			case 'FETCHING':
				return {
					...state,
					status: 'fetching',
					criteria: action.criteria,
					pageBeingFetched: action.payload,
					pageWithError: 0,
				};
			case 'FETCHED':
				console.warn('Fetched:', test?.current);
				return {
					...state,
					status: 'fetched',
					data: action.payload,
					pageBeingFetched: 0,
					pageWithError: 0,
				};
			case 'FETCH_ERROR':
				return {
					...state,
					status: 'error',
					pageBeingFetched: 0,
					pageWithError: state.pageBeingFetched,
					error: action.payload,
					data: [],
				};
			default:
				return state;
		}
	}, initialState);

	useEffect(() => {
		let cancelRequest = false;
		if (!reportName) return;

		//if (!criteria && criteria !== '') return;
		if (!criteria && criteria !== '') {
			dispatch({ type: 'RESET' });
			return;
		}

		const defaultValueParse = getDefaultValueCriteria(defaultValue);
		let defaultValueCriteria = defaultValueParse.criteria;
		let defaultValueIdArray = defaultValueParse.idArray;

		(async () => {
			dispatch({ type: 'FETCHING', payload: defaultValueCriteria }); //! Generate new uuid here
			if (
				cache.current[
					`${reportName}${criteria}${defaultValueCriteria}${page}${pageSize}`
				]
			) {
				const data =
					cache.current[
						`${reportName}${criteria}${defaultValueCriteria}${page}${pageSize}`
					];
				dispatch({ type: 'FETCHED', payload: data });
			} else {
				var maxPage = 1;
				var config;
				var returnArr = [];
				try {
					//selections/defaultValues
					if (defaultValueIdArray.length > 0) {
						config = {
							appName,
							reportName: reportName,
							criteria: defaultValueCriteria,
							page: page,
							pageSize: pageSize,
						};

						let response = await ZOHO.CREATOR.API.getAllRecords(config).catch(
							(err) => {
								if (cancelRequest) return;
								if (
									err.responseText &&
									(err.responseText.includes('No Data Available') ||
										err.responseText.includes('No records found'))
								) {
									dispatch({ type: 'FETCHED', payload: [] });
								} else {
									dispatch({ type: 'FETCH_ERROR', payload: err });
								}
							}
						);

						if (response && response.code === 3000) {
							returnArr = [
								...returnArr,
								...response.data.map((data) => ({
									...data,
									Selected: true,
									Expanded: false,
								})),
							];

							if (
								maxPage < maxRecords / pageSize &&
								response.data.length === pageSize
							) {
								//There are more pages to pull
								maxPage++;
							} else {
								if (cancelRequest) return;
								// cache.current[
								// 	`${reportName}${criteria}${defaultValueCriteria}${page}${pageSize}`
								// ] = returnArr;
								//dispatch({ type: 'FETCHED', payload: returnArr });
							}
						} else {
							if (cancelRequest) return;
							dispatch({ type: 'FETCH_ERROR', payload: response });
						}
					}

					//Reset maxPage
					maxPage = 1;

					//Regular criteria, exclude IDs from selections/defaultValue
					for (var i = 1; i <= maxPage; i++) {
						if (criteria) {
							config = {
								appName,
								reportName: reportName,
								criteria:
									defaultValueIdArray.length > 0
										? `(${defaultValueIdArray
												.map((dv) => `ID!=${dv}`)
												.join(' && ')}) && (${criteria})`
										: criteria,
								page: i.toString(),
								pageSize: pageSize,
							};
						} else {
							config = {
								appName,
								reportName: reportName,
								criteria:
									defaultValueIdArray.length > 0
										? `(${defaultValueIdArray
												.map((dv) => `ID!=${dv}`)
												.join(' && ')})`
										: '',
								page: i.toString(),
								pageSize: pageSize,
							};
						}
						dispatch({
							type: 'FETCHING',
							payload: `${i}`,
							criteria: config.criteria,
							//! uuid is unchanged for pages fetches
						});
						test.current.push(config);
						let noResults = false;
						let response = await ZOHO.CREATOR.API.getAllRecords(config).catch(
							(err) => {
								console.log('CustomHooks useZohoGetAllRecords() err', err);
								if (cancelRequest) return;
								if (
									err.responseText &&
									(err.responseText.includes('No Data Available') ||
										err.responseText.includes('No records found'))
								) {
									noResults = true;
								} else {
									dispatch({ type: 'FETCH_ERROR', payload: err });
									return;
								}
							}
						);

						console.log(
							'CustomHooks useZohoGetAllRecords() response',
							response
						);

						if (response && response.code === 3000) {
							returnArr = [
								...returnArr,
								...response.data.map((data) => ({
									...data,
									Selected: defaultValueIdArray.includes(data.ID)
										? true
										: false,
									Expanded: false,
								})),
							];

							if (maxPage < maxRecords / 200 && response.data.length === 200) {
								//There are more pages to pull
								maxPage++;
							} else {
								if (cancelRequest) return;
								// cache.current[
								// 	`${reportName}${criteria}${defaultValueCriteria}${page}${pageSize}`
								// ] = returnArr;
								dispatch({ type: 'FETCHED', payload: returnArr });
							}
						} else if (returnArr.length > 0 || noResults) {
							//Implies defaultValue/selections criteria worked, but the search term came up empty
							if (cancelRequest) return;
							// cache.current[
							// 	`${reportName}${criteria}${defaultValueCriteria}${page}${pageSize}`
							// ] = returnArr;
							dispatch({ type: 'FETCHED', payload: returnArr });
						} else {
							if (cancelRequest) return;
							dispatch({ type: 'FETCH_ERROR', payload: response });
						}
					}
				} catch (error) {
					if (cancelRequest) return;
					dispatch({ type: 'FETCH_ERROR', payload: error.message });
				}
			}
		})();

		return function cleanup() {
			cancelRequest = true;
		};
	}, [reportName, criteria, page, pageSize]);

	return state;
};

export const useZohoGetAllRecordsTracked = () => {
	const cache = useRef({});
	const initialState = {
		status: 'idle',
		error: null,
		data: [],
	};
	const maxRecords = 200; //! Multiple of 200

	const [state, dispatch] = useReducer((state, action) => {
		switch (action.type) {
			case 'FETCHING':
				return { ...state, status: 'fetching' };
			case 'FETCHED':
				return { ...state, status: 'fetched', data: action.payload };
			case 'FETCH_ERROR':
				return { ...state, status: 'error', error: action.payload };
			default:
				return state;
		}
	}, initialState);

	const test = (reportName, criteria = '', page = 1, pageSize = 200) => {};

	useEffect(() => {
		let cancelRequest = false;
		if (!reportName) return;

		(async () => {
			dispatch({ type: 'FETCHING' });
			if (cache.current[`${reportName}${criteria}${page}${pageSize}`]) {
				const data =
					cache.current[`${reportName}${criteria}${page}${pageSize}`];
				dispatch({ type: 'FETCHED', payload: data });
			} else {
				try {
					var maxPage = 1;
					var config;
					var returnArr = [];

					for (var i = 1; i <= maxPage; i++) {
						if (criteria) {
							config = {
								appName,
								reportName: reportName,
								criteria: criteria,
								page: i.toString(),
								pageSize: pageSize,
							};
						} else {
							config = {
								appName,
								reportName: reportName,
								page: i.toString(),
								pageSize: pageSize,
							};
						}

						const response = await ZOHO.CREATOR.API.getAllRecords(config).catch(
							(err) => {
								if (cancelRequest) return;
								if (
									err.responseText &&
									err.responseText.includes('No Data Available')
								) {
									dispatch({ type: 'FETCHED', payload: [] });
								} else {
									dispatch({ type: 'FETCH_ERROR', payload: err });
								}
							}
						);

						if (response && response.code === 3000) {
							returnArr = [
								...returnArr,
								...response.data.map((data) => ({
									...data,
									Selected: false,
									Expanded: false,
								})),
							];

							if (maxPage < maxRecords / 200 && response.data.length === 200) {
								//There are more pages to pull
								maxPage++;
							} else {
								if (cancelRequest) return;
								cache.current[`${reportName}${criteria}${page}${pageSize}`] =
									returnArr;
								dispatch({ type: 'FETCHED', payload: returnArr });
							}
						} else {
							if (cancelRequest) return;
							dispatch({ type: 'FETCH_ERROR', payload: response });
						}
					}
				} catch (error) {
					if (cancelRequest) return;
					dispatch({ type: 'FETCH_ERROR', payload: error.message });
				}
			}
		})();

		return function cleanup() {
			cancelRequest = true;
		};
	}, [reportName, criteria, page, pageSize]);

	return state;
};

export const useZohoSaveRecord = () => {
	const initialState = {
		status: 'idle',
		error: null,
		data: {},
	};

	const [state, dispatch] = useReducer((state, action) => {
		switch (action.type) {
			case 'SAVING':
				return {
					...state,
					status: 'saving',
					data: action.payload,
					error: null,
				};
			case 'SAVED':
				return {
					...state,
					status: 'saved',
					data: { ...state.data, ...action.payload },
					error: null,
				};
			case 'SAVE_ERROR':
				return { ...state, status: 'error', error: action.payload };
			case 'SAVE_WORKFLOW_ERROR':
				return { ...state, status: 'workflow_error', error: action.payload };
			case 'SAVE_VALIDATION_ERROR':
				return { ...state, status: 'validation_error', error: action.payload };
			case 'SAVED_WITH_ERRORS':
				return { ...state, status: 'saved_with_errors', data: action.payload };
			default:
				return state;
		}
	}, initialState);

	const addRecord = async (formName, data) => {
		data = formatFormData(data).data;

		dispatch({ type: 'SAVING', payload: data });
		try {
			const response = await ZOHO.CREATOR.API.addRecord({
				appName,
				formName,
				data: { data },
			}).catch((err) => {
				dispatch({ type: 'SAVE_ERROR', payload: err });
			});

			if (response && response.code === 3000) {
				dispatch({ type: 'SAVED', payload: { ...response.data, Added: true } });
			} else if (response && response.code === 3001) {
				//! Back end workflow error
				dispatch({ type: 'SAVE_WORKFLOW_ERROR', payload: response.error });
			} else if (response && response.code === 3002) {
				//! Back end validation failed
				dispatch({
					type: 'SAVE_VALIDATION_ERROR',
					payload: Object.keys(response.error).map(
						(key) => response.error[key]
					),
				});
			} else {
				console.log('unaccounted for on SAVE error code:', response);
			}
		} catch (error) {
			dispatch({ type: 'SAVE_ERROR', payload: error.message });
		}
	};

	const updateRecord = async (reportName, id, data) => {
		data = formatFormData(data).data;

		dispatch({ type: 'SAVING', payload: data });
		try {
			if (Array.isArray(data)) {
				const errors = [];
				const successes = [];
				const workflowErrors = [];
				const validationErrors = [];

				for (var d of data) {
					const response = await ZOHO.CREATOR.API.updateRecord({
						appName,
						reportName,
						id: d.ID,
						data: { data: omit(d, 'ID') },
					}).catch((err) => {
						errors.push(err);
					});

					if (response && response.code === 3000) {
						successes.push({ ...d, ...response.data });
					} else if (response && response.code === 3001) {
						//! Back end workflow error
						workflowErrors.push(response.error);
					} else if (response && response.code === 3002) {
						//! Back end validation failed
						validationErrors.push(
							Object.keys(response.error).map((key) => response.error[key])
						);
					} else {
						console.log('unaccounted for on add error code:', response);
					}
				}
				if (successes.length === data.length) {
					//! 100% Success
					dispatch({ type: 'SAVED', payload: successes });
				} else if (successes.length > 0 && successes.length < data.length) {
					//Partially saved
					dispatch({
						type: 'SAVED_WITH_ERRORS',
						payload: [{ errors, successes, workflowErrors, validationErrors }],
					});
				} else if (errors.length === data.length) {
					//! 100% Errors
					dispatch({ type: 'SAVE_ERROR', payload: errors });
				} else if (workflowErrors.length === data.length) {
					//! 100% Workflow errors
					dispatch({ type: 'SAVE_WORKFLOW_ERROR', payload: workflowErrors });
				} else if (validationErrors.length === data.length) {
					//! 100% Validation errors
					dispatch({
						type: 'SAVE_VALIDATION_ERROR',
						payload: validationErrors,
					});
				}
			} else {
				const response = await ZOHO.CREATOR.API.updateRecord({
					appName,
					reportName,
					id,
					data: { data },
				}).catch((err) => {
					dispatch({ type: 'SAVE_ERROR', payload: err });
				});

				if (response && response.code === 3000) {
					dispatch({ type: 'SAVED', payload: response.data });
				} else if (response && response.code === 3001) {
					//! Back end workflow error
					dispatch({ type: 'SAVE_WORKFLOW_ERROR', payload: response.error });
				} else if (response && response.code === 3002) {
					//! Back end validation failed
					dispatch({
						type: 'SAVE_VALIDATION_ERROR',
						payload: Object.keys(response.error).map(
							(key) => response.error[key]
						),
					});
				} else {
					console.log('unaccounted for on add error code:', response);
				}
			}
		} catch (error) {
			dispatch({ type: 'UPDATE_ERROR', payload: error.message });
		}
	};

	return [state, addRecord, updateRecord];
};

export const useZohoDeleteRecord = () => {
	const initialState = {
		status: 'idle',
		error: null,
		data: {},
	};

	const [state, dispatch] = useReducer((state, action) => {
		switch (action.type) {
			case 'DELETING':
				return { ...state, status: 'deleting', data: action.payload };
			case 'DELETED':
				return { ...state, status: 'deleted', data: action.payload };
			case 'DELETE_ERROR':
				return { ...state, status: 'error', error: action.payload };
			case 'DELETE_WORKFLOW_ERROR':
				return { ...state, status: 'workflow_error', error: action.payload };
			case 'DELETE_VALIDATION_ERROR':
				return { ...state, status: 'validation_error', error: action.payload };
			default:
				return state;
		}
	}, initialState);

	const deleteRecord = async (reportName, criteria, idArray) => {
		dispatch({ type: 'DELETING', payload: criteria });
		try {
			const response = await ZOHO.CREATOR.API.deleteRecord({
				appName,
				reportName,
				criteria,
			}).catch((err) => {
				console.log(err);
				if (err.responseText) {
					const thisErr = JSON.parse(err.responseText);
					dispatch({ type: 'DELETE_ERROR', payload: thisErr.message });
				}
			});

			if (response && response.code === 3000) {
				dispatch({ type: 'DELETED', payload: idArray });
			} else if (response && response.code === 3001) {
				//! Back end workflow error
				dispatch({ type: 'DELETE_WORKFLOW_ERROR', payload: response.error });
			} else if (response && response.code === 3002) {
				//! Back end validation failed
				dispatch({
					type: 'DELETE_VALIDATION_ERROR',
					payload: Object.keys(response.error).map(
						(key) => response.error[key]
					),
				});
			} else {
				console.log('unaccounted for on DELETE error code:', response);
			}
		} catch (error) {
			dispatch({ type: 'DELETE_ERROR', payload: error.message });
		}
	};

	return [state, deleteRecord];
};

export const formatFormData = (data) => {
	let fileUploadFields = [];

	let keyExclusions = ['Serial_Numbers_to_Remove'];

	//! Format data
	//! Filter out ID keys, mostly as a result of merging a save response with an ID with the original data object to save
	if (data && Array.isArray(data)) {
		//? Data is an array of objects, iterate through each entry in array
		data = data.map((formData) => {
			Object.keys(formData)
				.filter((key) => key !== 'ID')
				.forEach((key) => {
					if (key.includes('.')) {
						keyExclusions.push(key);
					} else if (formData[key] instanceof FileList) {
						//FileList
						for (var file of formData[key]) {
							fileUploadFields.push({
								fieldKey: key,
								recordId: formData.ID,
								file,
							});
						}
					} else if (formData[key] instanceof File) {
						//File
						fileUploadFields.push({
							fieldKey: key,
							recordId: formData.ID,
							file: formData[key],
						});
					} else if (
						Array.isArray(formData[key]) &&
						!keyExclusions.includes(key)
					) {
						formData = {
							...formData,
							[key]: formData[key].map((d) =>
								typeof d === 'object' ? d.ID : d
							),
						};
					} else if (
						typeof formData[key] === 'object' &&
						formData[key] === null
					) {
						//nulls register as objects, so have to exclude
						formData[key] = ''; //replace null will empty string
					} else if (
						typeof formData[key] === 'object' &&
						!keyExclusions.includes(key)
					) {
						//nulls register as objects, so have to exclude
						formData = { ...formData, [key]: formData[key].ID };
					}
				});
			return omit(formData, [
				...fileUploadFields.map(
					(fieldUploadField) => fieldUploadField.fieldKey
				),
				...keyExclusions,
			]);
		});
	} else if (data) {
		Object.keys(data)
			.filter((key) => key !== 'ID') //Filter out formula fields with . in the key
			.forEach((key) => {
				if (key.includes('.')) {
					keyExclusions.push(key);
				} else if (data[key] instanceof FileList) {
					//FileList
					fileUploadFields.push({
						fieldKey: key,
						recordId: data.ID,
						files: data[key],
					});
				} else if (data[key] instanceof File) {
					//File
					fileUploadFields.push({
						fieldKey: key,
						recordId: data.ID,
						file: data[key],
					});
				} else if (Array.isArray(data[key]) && !keyExclusions.includes(key)) {
					data = {
						...data,
						[key]: data[key].map((d) => (typeof d === 'object' ? d.ID : d)),
					};
				} else if (typeof data[key] === 'object' && data[key] === null) {
					//nulls register as objects, so have to exclude
					data[key] = ''; //replace null will empty string
				} else if (
					typeof data[key] === 'object' &&
					!keyExclusions.includes(key)
				) {
					data = { ...data, [key]: data[key].ID };
				}
			});
		data = omit(data, [
			...fileUploadFields.map((fieldUploadField) => fieldUploadField.fieldKey),
			...keyExclusions,
		]);
	}

	console.log('CustomHooks.js formatFormData', data);
	return {
		data,
		files: fileUploadFields,
	};
};

export const formNames = [
	'Account',
	'Account_Industry',
	'Attachment',
	'Contact',
	'Contact_Profile',
	'Customer_Asset',
	'Customer_Room',
	'Demo',
	'Email',
	'Employee',
	'Estimate',
	'Estimate_Line_Item',
	'Expense',
	'Inventory_Adjustment',
	'Inventory_Adjustment_Line_Item',
	'Lead',
	'Manufacturer',
	'Note',
	'Opportunity',
	'Price_Book_Item',
	'Priority',
	'Project',
	'Purchase_Order',
	'Purchase_Order_Line_Item',
	'Purchase_Receive',
	'Purchase_Receive_Line_Item',
	'Quote',
	'Quote_Line_Item',
	'RMA',
	'Sales_Order',
	'Sales_Order_Line_Item',
	'Serial_Number',
	'Service_Contract',
	'Service_Order',
	'Subcontractor',
	'Subscription',
	'Tag',
	'Task',
	'Time_Entry',
	'Vendor',
	'Warehouse',
	'Warehouse_Stock_Item',
	'Warehouse_Stock_Item_Reservation',
];

const formatZohoDatabaseData = (data) => {
	//! Format data
	const keyExclusions = ['Number', 'Zip_Code'];

	//! Filter out ID keys, mostly as a result of merging a save response with an ID with the original data object to save
	if (data && Array.isArray(data)) {
		//? Data is an array of objects, iterate through each entry in array
		data = data.map((formData) => {
			Object.keys(formData).forEach((key) => {
				if (formData[key] === 'true') {
					formData[key] = true;
				} else if (formData[key] === 'false') {
					formData[key] = false;
				} else if (
					intTryParse(formData[key]) &&
					key !== 'ID' &&
					!key.endsWith('_ID') &&
					!keyExclusions.includes(key) &&
					!formNames.includes(key)
				) {
					formData[key] = parseFloat(formData[key]);
				}
			});
			return formData;
		});
	} else if (data) {
		Object.keys(data).forEach((key) => {
			if (data[key] === 'true') {
				data[key] = true;
			} else if (data[key] === 'false') {
				data[key] = false;
			} else if (
				intTryParse(data[key]) &&
				key !== 'ID' &&
				!key.endsWith('_ID') &&
				!keyExclusions.includes(key) &&
				!formNames.includes(key)
			) {
				data[key] = parseFloat(data[key]);
			}
		});
	}

	return data;
};

//#endregion

//#region General
export const useDebounce = (value, delay) => {
	// State and setters for debounced value
	const [debouncedValue, setDebouncedValue] = useState(value);
	useEffect(
		() => {
			// Update debounced value after delay
			const handler = setTimeout(() => {
				setDebouncedValue(value);
			}, delay);
			// Cancel the timeout if value changes (also on delay change or unmount)
			// This is how we prevent debounced value from updating if value is changed ...
			// .. within the delay period. Timeout gets cleared and restarted.
			return () => {
				clearTimeout(handler);
			};
		},
		[value, delay] // Only re-call effect if value or delay changes
	);
	return debouncedValue;
};

export const useDebouncedEffect = (effect, deps, delay) => {
	useEffect(() => {
		const handler = setTimeout(() => effect(), delay);

		return () => clearTimeout(handler);
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [...(deps || []), delay]);
};

export const useCalculateSalesTotals = (formName, data) => {
	const initialState = {
		Name:
			data && data.Name
				? data.Name
				: data && data.Type === 'Comment'
				? 'Comment'
				: '',
		Code:
			data && data.Code
				? data.Code
				: data && data.Type === 'Comment'
				? 'Comment'
				: '',
		Manufacturer:
			data && data.Manufacturer && typeof data.Manufacturer === 'object'
				? data.Manufacturer.display_value
				: data.Manufacturer
				? data.Manufacturer
				: '',
		Price_Book_Item: data && data.Price_Book_Item ? data.Price_Book_Item : '',
		Type: data && data.Type ? data.Type : '',
		ID: data && data.ID ? data.ID : uuidv4(), //Temporary ID to ensure no key errors and immediate DND behavior without waiting for database response
		Description:
			data && data.Description
				? data.Description
				: data.Type === 'Comment'
				? ''
				: '',
		Custom_Name: data && data.Custom_Name ? data.Custom_Name : '',
		Quantity:
			data && data.Quantity && intTryParse(data.Quantity)
				? parseInt(data.Quantity)
				: 1,
		Cost:
			data && data.Cost && intTryParse(data.Cost) ? parseFloat(data.Cost) : 0.0,
		Cost_Subtotal:
			data && data.Cost_Subtotal && intTryParse(data.Cost_Subtotal)
				? parseFloat(data.Cost_Subtotal)
				: 0.0,
		Sell_Price_Each:
			data && data.Sell_Price_Each && intTryParse(data.Sell_Price_Each)
				? parseFloat(data.Sell_Price_Each)
				: 0.0,
		Sell_Price_Subtotal:
			data && data.Sell_Price_Subtotal && intTryParse(data.Sell_Price_Subtotal)
				? parseFloat(data.Sell_Price_Subtotal)
				: 0.0,
		Discount_Rate:
			data && data.Discount_Rate && intTryParse(data.Discount_Rate)
				? parseFloat(data.Discount_Rate)
				: 0.0,
		Discount_Dollars:
			data && data.Discount_Dollars && intTryParse(data.Discount_Dollars)
				? parseFloat(data.Discount_Dollars)
				: 0.0,
		Cost_Total:
			data && data.Cost_Total && intTryParse(data.Cost_Total)
				? parseFloat(data.Cost_Total)
				: 0.0,
		Sell_Price_Total:
			data && data.Sell_Price_Total && intTryParse(data.Sell_Price_Total)
				? parseFloat(data.Sell_Price_Total)
				: 0.0,
		//! Prioritize an existing Margin first. If not present, look for a Sell Price on the PBI. Default is 25% if all else fails
		Margin:
			data && data.Margin && intTryParse(data.Margin)
				? parseFloat(data.Margin)
				: data && data.Sell_Price && intTryParse(data.Sell_Price)
				? ((parseFloat(data.Sell_Price) -
						(intTryParse(data.Cost) ? parseFloat(data.Cost) : 0)) /
						parseFloat(data.Sell_Price)) *
				  100
				: formName === 'Purchase_Order_Line_Item'
				? 0
				: 25.0,
		Preset_Margin:
			data && data.Margin && intTryParse(data.Margin)
				? parseFloat(data.Margin)
				: 25.0,
		Custom_Margin:
			data && data.Margin && intTryParse(data.Margin)
				? parseFloat(data.Margin)
				: 25.0,
		//Prioritize and existing Price Level Type first. If not present, if the PBI is an assembly or has a Sell Price defined, use Custom. If all else fails, Preset.
		Price_Level_Type:
			data && data.Price_Level_Type
				? data.Price_Level_Type
				: data &&
				  data.Type &&
				  (data.Type === 'Assembly' ||
						(data.Sell_Price && intTryParse(data.Sell_Price)))
				? 'Custom'
				: 'Preset',
		Collapsible_Child:
			data && data.Collapsible_Child ? data.Collapsible_Child : false,
		Collapsible_Parent:
			data && data.Collapsible_Parent
				? data.Collapsible_Parent
				: data && data.Type
				? data.Type === 'Assembly'
				: false,
		Collapsible_Line_Items:
			data && data.Collapsible_Line_Items
				? data.Collapsible_Line_Items
				: data && data.Assembly_Price_Book_Items
				? data.Assembly_Price_Book_Items
				: '',
		Selected: false,
	};

	const [state, dispatch] = useReducer((state, action) => {
		switch (action.type) {
			case 'DESCRIPTION':
				return { ...state, Description: action.payload };
			case 'MANUFACTURER':
				return { ...state, Manufacturer: action.payload };
			case 'CODE':
			case 'NAME':
				return {
					...state,
					Name: action.payload,
					Code: action.payload,
				};
			case 'QUANTITY':
				//! Update Quantity
				//! Update Sell Price Subtotal
				//! Update Sell Price Total
				//! Update Cost Subtotal
				//! Update Cost Total
				return {
					...state,
					Quantity: action.payload,
					Sell_Price_Subtotal: state.Sell_Price_Each * action.payload,
					Sell_Price_Total:
						state.Sell_Price_Each *
						action.payload *
						(1 - state.Discount_Rate / 100),
					Cost_Subtotal: state.Cost * action.payload,
					Cost_Total: state.Cost * action.payload,
					Discount_Dollars:
						state.Sell_Price_Each * action.payload -
						state.Sell_Price_Each *
							action.payload *
							(1 - state.Discount_Rate / 100),
				};
			case 'COST':
				//! Update Sell Price Each
				//! Update Sell Price Subtotal
				//! Update Sell Price Total
				//! Update Cost
				//! Update Cost Subtotal
				//! Update Cost Total
				return {
					...state,
					Sell_Price_Each: action.payload / (1 - state.Margin / 100),
					Sell_Price_Subtotal:
						(action.payload / (1 - state.Margin / 100)) * state.Quantity,
					Sell_Price_Total:
						(action.payload / (1 - state.Margin / 100)) *
						state.Quantity *
						(1 - state.Discount_Rate / 100),
					Cost: action.payload,
					Cost_Subtotal: action.payload * state.Quantity,
					Cost_Total: action.payload * state.Quantity,
				};
			case 'COST_SUBTOTAL':
				//! Update Sell Price Each
				//! Update Sell Price Subtotal
				//! Update Sell Price Total
				//! Update Cost
				//! Update Cost Subtotal
				//! Update Cost Total
				return {
					...state,
					Sell_Price_Each:
						action.payload / state.Quantity / (1 - state.Margin / 100),
					Sell_Price_Subtotal:
						(action.payload / state.Quantity / (1 - state.Margin / 100)) *
						state.Quantity,
					Sell_Price_Total:
						(action.payload / state.Quantity / (1 - state.Margin / 100)) *
						state.Quantity *
						(1 - state.Discount_Rate / 100),
					Cost: action.payload / state.Quantity,
					Cost_Subtotal: action.payload,
					Cost_Total: action.payload,
				};
			case 'SELL_PRICE_EACH':
				//! Update Margin
				//! Update Sell Price Each
				//! Update Sell Price Subtotal
				//! Update Sell Price Total
				return {
					...state,
					Price_Level_Type: 'Custom',
					Custom_Margin: ((action.payload - state.Cost) / action.payload) * 100,
					Margin: ((action.payload - state.Cost) / action.payload) * 100,
					Sell_Price_Each: action.payload,
					Sell_Price_Subtotal: action.payload * state.Quantity,
					Sell_Price_Total:
						action.payload * state.Quantity * (1 - state.Discount_Rate / 100),
				};
			case 'SELL_PRICE_SUBTOTAL':
				//! Update Margin
				//! Update Sell Price Each
				//! Update Sell Price Subtotal
				//! Update Sell Price Total
				return {
					...state,
					Price_Level_Type: 'Custom',
					Custom_Margin:
						((action.payload / state.Quantity - state.Cost) / action.payload) *
						100,
					Margin:
						((action.payload / state.Quantity - state.Cost) / action.payload) *
						100,
					Sell_Price_Each: action.payload / state.Quantity,
					Sell_Price_Subtotal: action.payload,
					Sell_Price_Total: action.payload * (1 - state.Discount_Rate / 100),
				};
			case 'DISCOUNT_RATE':
				//! Update Discount Rate
				//! Update Discount Dollars
				//! Update Sell Price Total
				return {
					...state,
					Discount_Rate: action.payload,
					Discount_Dollars:
						state.Sell_Price_Subtotal -
						state.Sell_Price_Subtotal * (1 - action.payload / 100),
					Sell_Price_Total:
						state.Sell_Price_Subtotal * (1 - action.payload / 100),
				};
			case 'DISCOUNT_DOLLARS':
				//! Update Discount Rate
				//! Update Discount Dollars
				//! Update Sell Price Total
				return {
					...state,
					Discount_Rate: (action.payload / state.Sell_Price_Subtotal) * 100,
					Discount_Dollars: action.payload,
					Sell_Price_Total: state.Sell_Price_Subtotal - action.payload,
				};
			case 'CUSTOM_MARGIN':
				//! Update Margin
				//! Update Sell Price Each
				//! Update Sell Price Subtotal
				//! Update Sell Price Total
				return {
					...state,
					Price_Level_Type: 'Custom',
					Custom_Margin: action.payload,
					Margin: action.payload,
					Sell_Price_Each: state.Cost / (1 - action.payload / 100),
					Sell_Price_Subtotal:
						(state.Cost / (1 - action.payload / 100)) * state.Quantity,
					Sell_Price_Total:
						(state.Cost / (1 - action.payload / 100)) *
						state.Quantity *
						(1 - state.Discount_Rate / 100),
				};
			case 'PRESET_MARGIN':
				//! Update Margin
				//! Update Sell Price Each
				//! Update Sell Price Subtotal
				//! Update Sell Price Total
				return {
					...state,
					Price_Level_Type: 'Preset',
					Preset_Margin: action.payload,
					Margin: action.payload,
					Sell_Price_Each: state.Cost / (1 - action.payload / 100),
					Sell_Price_Subtotal:
						(state.Cost / (1 - action.payload / 100)) * state.Quantity,
					Sell_Price_Total:
						(state.Cost / (1 - action.payload / 100)) *
						state.Quantity *
						(1 - state.Discount_Rate / 100),
				};
			case 'PRICE_LEVEL_TYPE':
				return {
					...state,
					Price_Level_Type: action.payload,
					Margin:
						action.payload === 'Preset'
							? state.Preset_Margin
							: state.Custom_Margin,
					Sell_Price_Each:
						state.Cost /
						(1 -
							(action.payload === 'Preset'
								? state.Preset_Margin / 100
								: state.Custom_Margin / 100)),
					Sell_Price_Subtotal:
						(state.Cost /
							(1 -
								(action.payload === 'Preset'
									? state.Preset_Margin / 100
									: state.Custom_Margin / 100))) *
						state.Quantity,
					Sell_Price_Total:
						(state.Cost /
							(1 -
								(action.payload === 'Preset'
									? state.Preset_Margin / 100
									: state.Custom_Margin / 100))) *
						state.Quantity *
						(1 - state.Discount_Rate / 100),
				};
			case 'RESET':
				return initialState;
			default:
				return state;
		}
	}, initialState);

	return [state, dispatch];
};

export const useCalculatePurchaseTotals = (Cost = 0.0) => {
	const initialState = {
		Description: 'No Description Provided',
		Quantity: 1,
		Cost,
		Cost_Subtotal: 0.0,
		Discount_Rate: 0.0,
		Discount_Dollars: 0.0,
		Cost_Total: 0.0,
	};

	const [state, dispatch] = useReducer((state, action) => {
		switch (action.type) {
			case 'DATA_MERGE':
				return { ...state, ...action.payload };
			case 'DESCRIPTION':
				return { ...state, Description: action.payload };
			case 'QUANTITY':
				//! Update Quantity
				//! Update Cost Subtotal
				//! Update Cost Total
				return {
					...state,
					Quantity: action.payload,
					Cost_Subtotal: state.Cost * action.payload,
					Cost_Total:
						state.Cost * action.payload * (1 - state.Discount_Rate / 100),
					Discount_Dollars:
						state.Cost * action.payload -
						state.Cost * action.payload * (1 - state.Discount_Rate / 100),
				};
			case 'COST':
				//! Update Cost
				//! Update Cost Subtotal
				//! Update Cost Total
				return {
					...state,
					Cost: action.payload,
					Cost_Subtotal: action.payload * state.Quantity,
					Cost_Total:
						action.payload * state.Quantity * (1 - state.Discount_Rate / 100),
				};
			case 'COST_SUBTOTAL':
				//! Update Cost
				//! Update Cost Subtotal
				//! Update Cost Total
				return {
					...state,
					Cost: action.payload / state.Quantity,
					Cost_Subtotal: action.payload,
					Cost_Total: action.payload * (1 - state.Discount_Rate / 100),
				};
			case 'DISCOUNT_RATE':
				//! Update Discount Rate
				//! Update Discount Dollars
				//! Update Cost Total
				return {
					...state,
					Discount_Rate: action.payload,
					Discount_Dollars:
						state.Sell_Price_Subtotal -
						state.Sell_Price_Subtotal * (1 - action.payload / 100),
					Cost_Total: state.Cost_Subtotal * (1 - action.payload / 100),
				};
			case 'DISCOUNT_DOLLARS':
				//! Update Discount Rate
				//! Update Discount Dollars
				//! Update Cost Total
				return {
					...state,
					Discount_Rate: (action.payload / state.Sell_Price_Subtotal) * 100,
					Discount_Dollars: action.payload,
					Cost_Total: state.Cost_Subtotal - action.payload,
				};
			case 'RESET':
				return initialState;
			default:
				return state;
		}
	}, initialState);

	return [state, dispatch];
};

//Sits at the form level, so data will be a data retrieve from database
//Data will be the data at the Quote/Sales Order/Purchase Order/Estimate/Purchase Receive level
export const useCustomTableLineItemFormData = (formName, data) => {
	data = formatZohoDatabaseData(data);
	const initialState = {
		formName,
		Subtotal:
			data && data.Subtotal && intTryParse(data.Subtotal)
				? parseFloat(data.Subtotal)
				: 0.0,
		Discount_Rate:
			data && data.Discount_Rate && intTryParse(data.Discount_Rate)
				? parseFloat(data.Discount_Rate)
				: 0.0,
		Discount:
			data && data.Discount && intTryParse(data.Discount)
				? parseFloat(data.Discount)
				: 0.0,
		Tax_Goods: data && (data.Tax_Goods === 'true' || data.Tax_Goods === true),
		Tax_Services:
			data && (data.Tax_Services === 'true' || data.Tax_Services === true),
		Tax_Freight:
			data && (data.Tax_Freight === 'true' || data.Tax_Freight === true),
		Out_of_State:
			data && (data.Out_of_State === 'true' || data.Out_of_State === true),
		Tax_Exempt:
			data && (data.Tax_Exempt === 'true' || data.Tax_Exempt === true),
		Tax_Exempt_Certification:
			data && data.Tax_Exempt_Certification
				? data.Tax_Exempt_Certification
				: '',
		Tax_Rate:
			data && data.Tax_Rate && intTryParse(data.Tax_Rate)
				? parseFloat(data.Tax_Rate)
				: 0.0,
		Tax: data && data.Tax && intTryParse(data.Tax) ? parseFloat(data.Tax) : 0.0,
		Shipping:
			data && data.Shipping && intTryParse(data.Shipping)
				? parseFloat(data.Shipping)
				: 0.0,
		Total:
			data && data.Total && intTryParse(data.Total)
				? parseFloat(data.Total)
				: 0.0,
		Line_Item_Order:
			data && data.Line_Item_Order ? JSON.parse(data.Line_Item_Order) : [],
		rows: [],
		flatRows: [],
		expanded: false,
	};

	const calculateTotal = (
		formName,
		flatRows,
		subtotal,
		shipping,
		taxRate,
		taxGoods,
		taxServices,
		taxFreight,
		discountRate
	) => {
		let _total = subtotal * (1 - discountRate / 100); //! Shipping excluded at this point and added at the return. Taxes are applied after any discounts
		let _goodsTaxes = 0;
		let _servicesTaxes = 0;
		let _freightTaxes = 0;
		let _discountDollars = subtotal - _total;

		//parseFloat(total_sum * (1 - discountRate / 100) + shippingCost)
		if (taxGoods) {
			_goodsTaxes =
				sum(
					flatRows.filter((row) => row.Type === 'Goods'),
					formName === 'Purchase_Order' ? 'Cost_Total' : 'Sell_Price_Total'
				) *
				(taxRate / 100);
			_total += _goodsTaxes;
		}

		if (taxServices) {
			_servicesTaxes =
				sum(
					flatRows.filter((row) => row.Type === 'Service'),
					formName === 'Purchase_Order' ? 'Cost_Total' : 'Sell_Price_Total'
				) *
				(taxRate / 100);
			_total += _servicesTaxes;
		}

		if (taxFreight) {
			_freightTaxes =
				(sum(
					flatRows.filter((row) => row.Type === 'Freight'),
					formName === 'Purchase_Order' ? 'Cost_Total' : 'Sell_Price_Total'
				) +
					shipping) *
				(taxRate / 100);
			_total += _freightTaxes;
		}

		return {
			Total: parseFloat(parseFloat(_total + shipping).toFixed(2)),
			Tax_Dollars: parseFloat(
				parseFloat(_goodsTaxes + _servicesTaxes + _freightTaxes).toFixed(2)
			),
			Discount_Dollars: parseFloat(parseFloat(_discountDollars).toFixed(2)),
		};
	};

	const [state, dispatch] = useReducer((state, action) => {
		let totals = {};
		switch (action.type) {
			case 'ROWS_UPDATE':
				console.log('ROWS_UPDATE action.payload', action.payload);

				if (
					!state.rows ||
					JSON.stringify(state.rows) !== JSON.stringify(action.payload)
				) {
					let flatRows = flattenCollabsibleLineItemArray(action.payload);
					let Subtotal = sum(
						flatRows,
						state.formName === 'Purchase_Order'
							? 'Cost_Total'
							: 'Sell_Price_Total'
					);

					totals = calculateTotal(
						state.formName,
						flatRows,
						Subtotal,
						state.Shipping,
						state.Tax_Rate,
						state.Tax_Goods,
						state.Tax_Services,
						state.Tax_Freight,
						state.Discount_Rate
					);

					//! Check for line item order change from previous state
					if (
						JSON.stringify(state.rows.map((row) => row.ID)) !==
						JSON.stringify(action.payload.map((row) => row.ID))
					) {
						return {
							...state,
							rows: action.payload,
							flatRows,
							Line_Item_Order: action.payload.map((row) => row.ID),
							Subtotal: parseFloat(parseFloat(Subtotal).toFixed(2)), //Format update 1/1/22
							Discount: totals.Discount_Dollars,
							Tax: totals.Tax_Dollars,
							Total: totals.Total,
						};
					}
					return {
						...state,
						rows: action.payload,
						flatRows,
						Subtotal: parseFloat(parseFloat(Subtotal).toFixed(2)), //Format update 1/1/22
						Discount: totals.Discount_Dollars,
						Tax: totals.Tax_Dollars,
						Total: totals.Total,
					};
				}
				return state;
			case 'TAX_RATE':
				totals = calculateTotal(
					state.formName,
					state.flatRows,
					state.Subtotal,
					state.Shipping,
					intTryParse(action.payload) ? parseFloat(action.payload) : 0,
					state.Tax_Goods,
					state.Tax_Services,
					state.Tax_Freight,
					state.Discount_Rate
				);
				return {
					...state,
					Tax_Rate: intTryParse(action.payload)
						? parseFloat(action.payload)
						: 0,
					Tax: totals.Tax_Dollars,
					Total: totals.Total,
				};
			case 'DISCOUNT_DOLLARS':
				totals = calculateTotal(
					state.formName,
					state.flatRows,
					state.Subtotal,
					state.Shipping,
					state.Tax_Rate,
					state.Tax_Goods,
					state.Tax_Services,
					state.Tax_Freight,
					(parseFloat(action.payload) / state.Subtotal) * 100
				);

				return {
					...state,
					Discount_Rate: (parseFloat(action.payload) / state.Subtotal) * 100,
					Discount: totals.Discount_Dollars,
					Tax: totals.Tax_Dollars,
					Total: totals.Total,
				};
			case 'DISCOUNT_RATE':
				totals = calculateTotal(
					state.formName,
					state.flatRows,
					state.Subtotal,
					state.Shipping,
					state.Tax_Rate,
					state.Tax_Goods,
					state.Tax_Services,
					state.Tax_Freight,
					parseFloat(action.payload)
				);
				return {
					...state,
					Discount_Rate: parseFloat(action.payload),
					Discount: totals.Discount_Dollars,
					Total: totals.Total,
				};
			case 'SHIPPING':
				totals = calculateTotal(
					state.formName,
					state.flatRows,
					state.Subtotal,
					intTryParse(action.payload) ? parseFloat(action.payload) : 0,
					state.Tax_Rate,
					state.Tax_Goods,
					state.Tax_Services,
					state.Tax_Freight,
					state.Discount_Rate
				);
				return {
					...state,
					Shipping: intTryParse(action.payload)
						? parseFloat(action.payload)
						: 0,
					Tax: totals.Tax_Dollars,
					Total: totals.Total,
				};
			case 'TAX_GOODS':
				totals = calculateTotal(
					state.formName,
					state.flatRows,
					state.Subtotal,
					state.Shipping,
					state.Tax_Rate,
					action.payload,
					state.Tax_Services,
					state.Tax_Freight,
					state.Discount_Rate
				);
				return {
					...state,
					Tax_Goods: action.payload,
					Tax_Exempt: action.payload ? false : state.Tax_Exempt,
					Tax: totals.Tax_Dollars,
					Total: totals.Total,
				};
			case 'TAX_SERVICES':
				totals = calculateTotal(
					state.formName,
					state.flatRows,
					state.Subtotal,
					state.Shipping,
					state.Tax_Rate,
					state.Tax_Goods,
					action.payload,
					state.Tax_Freight,
					state.Discount_Rate
				);
				return {
					...state,
					Tax_Services: action.payload,
					Tax_Exempt: action.payload ? false : state.Tax_Exempt,
					Tax: totals.Tax_Dollars,
					Total: totals.Total,
				};
			case 'TAX_FREIGHT':
				totals = calculateTotal(
					state.formName,
					state.flatRows,
					state.Subtotal,
					state.Shipping,
					state.Tax_Rate,
					state.Tax_Goods,
					state.Tax_Services,
					action.payload,
					state.Discount_Rate
				);
				return {
					...state,
					Tax_Freight: action.payload,
					Tax_Exempt: action.payload ? false : state.Tax_Exempt,
					Tax: totals.Tax_Dollars,
					Total: totals.Total,
				};
			case 'TAX_EXEMPT':
				totals = calculateTotal(
					state.formName,
					state.flatRows,
					state.Subtotal,
					state.Shipping,
					state.Tax_Rate,
					action.payload ? false : state.Tax_Goods,
					action.payload ? false : state.Tax_Services,
					action.payload ? false : state.Tax_Freight,
					state.Discount_Rate
				);
				return {
					...state,
					Tax_Goods: action.payload ? false : state.Tax_Goods,
					Tax_Services: action.payload ? false : state.Tax_Services,
					Tax_Freight: action.payload ? false : state.Tax_Freight,
					Tax_Exempt: action.payload,
					Tax: totals.Tax_Dollars,
					Total: totals.Total,
				};
			case 'TAX_EXEMPT_CERTIFICATION':
				totals = calculateTotal(
					state.formName,
					state.flatRows,
					state.Subtotal,
					state.Shipping,
					state.Tax_Rate,
					action.payload ? false : state.Tax_Goods,
					action.payload ? false : state.Tax_Services,
					action.payload ? false : state.Tax_Freight,
					state.Discount_Rate
				);
				return {
					...state,
					Tax_Goods: action.payload ? false : state.Tax_Goods,
					Tax_Services: action.payload ? false : state.Tax_Services,
					Tax_Freight: action.payload ? false : state.Tax_Freight,
					Tax_Exempt: action.payload ? true : state.Tax_Exempt,
					Tax_Exempt_Certification: action.payload,
					Tax: totals.Tax_Dollars,
					Total: totals.Total,
				};
			default:
				return state;
		}
	}, initialState);

	return [state, dispatch];
};

//#endregion
