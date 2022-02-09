import React from 'react';

const FormDataContext = React.createContext();
const FormDataSetContext = React.createContext();
const FormDataErrorContext = React.createContext();
const FormDataSetErrorContext = React.createContext();
const FormDataSaveContext = React.createContext();
const FormDataSetSaveContext = React.createContext();
const SuccessfulSaveContext = React.createContext();
const SetSuccessfulSaveContext = React.createContext();

export const DataProvider = (props) => {
	const [data, setData] = React.useState({});
	const [error, setError] = React.useState({});
	const [save, setSave] = React.useState(false);
	const [successfulSaveData, setSuccessfulSaveData] = React.useState(null);

	return (
		<SuccessfulSaveContext.Provider value={successfulSaveData}>
			<SetSuccessfulSaveContext.Provider value={setSuccessfulSaveData}>
				<FormDataSaveContext.Provider value={save}>
					<FormDataSetSaveContext.Provider value={setSave}>
						<FormDataErrorContext.Provider value={error}>
							<FormDataSetErrorContext.Provider value={setError}>
								<FormDataContext.Provider value={data}>
									<FormDataSetContext.Provider value={setData}>
										{props.children}
									</FormDataSetContext.Provider>
								</FormDataContext.Provider>
							</FormDataSetErrorContext.Provider>
						</FormDataErrorContext.Provider>
					</FormDataSetSaveContext.Provider>
				</FormDataSaveContext.Provider>
			</SetSuccessfulSaveContext.Provider>
		</SuccessfulSaveContext.Provider>
	);
};

export const useDataState = () => {
	const dataState = React.useContext(FormDataContext);
	if (typeof dataState === 'undefined') {
		throw new Error('useDataState must be used within a DataProvider');
	}
	return dataState;
};

export const useDataUpdater = () => {
	const setData = React.useContext(FormDataSetContext);
	if (typeof setData === 'undefined') {
		throw new Error('useDataUpdater must be used within a DataProvider');
	}
	const updateData = React.useCallback(
		(newData) => {
			setData(newData);
		},
		[setData]
	);
	return updateData;
};

export const useFormError = () => {
	const errorState = React.useContext(FormDataErrorContext);
	if (typeof errorState === 'undefined') {
		throw new Error('useFormError must be used within a DataProvider');
	}
	return errorState;
};

export const useSetFormError = () => {
	const setError = React.useContext(FormDataSetErrorContext);
	if (typeof setError === 'undefined') {
		throw new Error('useSetFormError must be used within a DataProvider');
	}
	const updateError = React.useCallback(
		(newData) => {
			setError(newData);
		},
		[setError]
	);
	return updateError;
};

export const useSaveState = () => {
	const saveState = React.useContext(FormDataSaveContext);
	if (typeof saveState === 'undefined') {
		throw new Error('useSaveState must be used within a DataProvider');
	}
	return saveState;
};

export const useSetSaveState = () => {
	const setSaveState = React.useContext(FormDataSetSaveContext);
	if (typeof setSaveState === 'undefined') {
		throw new Error('useSetSaveState must be used within a DataProvider');
	}
	const setSave = React.useCallback(
		(newData) => {
			setSaveState(newData);
		},
		[setSaveState]
	);
	return setSave;
};

export const useSuccessfulSaveData = () => {
	const successfulSaveDataState = React.useContext(SuccessfulSaveContext);
	if (typeof successfulSaveDataState === 'undefined') {
		throw new Error('useSuccessfulSaveData must be used within a DataProvider');
	}
	return successfulSaveDataState;
};

export const useSetSuccessfulSaveData = () => {
	const setSuccessfulSaveData = React.useContext(SetSuccessfulSaveContext);
	if (typeof setSuccessfulSaveData === 'undefined') {
		throw new Error(
			'useSetSuccessfulSaveData must be used within a DataProvider'
		);
	}
	const internalSetSuccessfulSaveData = React.useCallback(
		(newData) => {
			setSuccessfulSaveData(newData);
		},
		[setSuccessfulSaveData]
	);
	return internalSetSuccessfulSaveData;
};
