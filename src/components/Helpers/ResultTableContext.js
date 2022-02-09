import React, { createContext, useContext, useState } from 'react';
import PropTypes from 'prop-types';

const ResultTablePropsContext = createContext();
const SetResultTablePropsContext = createContext();
const ResultTableDataContext = createContext();
const SetResultTableDataContext = createContext();

export const ResultTableProvider = ({ children }) => {
	const [props, setProps] = useState({});
	const [data, setData] = useState([]);

	return (
		<ResultTablePropsContext.Provider value={props}>
			<SetResultTablePropsContext.Provider value={setProps}>
				<ResultTableDataContext.Provider value={data}>
					<SetResultTableDataContext.Provider value={setData}>
						{children}
					</SetResultTableDataContext.Provider>
				</ResultTableDataContext.Provider>
			</SetResultTablePropsContext.Provider>
		</ResultTablePropsContext.Provider>
	);
};
ResultTableProvider.propTypes = {
	children: PropTypes.oneOfType([PropTypes.array, PropTypes.object]),
};

//? Table props
export const useResultTableProps = () => {
	const props = useContext(ResultTablePropsContext);
	if (typeof props === 'undefined') {
		throw new Error('useResultTableProps must be used within a DataProvider');
	}
	return props;
};

//? Set table props
export const useSetResultTableProps = () => {
	const setProps = useContext(SetResultTablePropsContext);
	if (typeof setProps === 'undefined') {
		throw new Error(
			'useSetResultTableProps must be used within a DataProvider'
		);
	}
	const _setProps = React.useCallback(
		(newData) => {
			setProps((oldData) => {
				if (!oldData) {
					return newData;
				}

				if (oldData.toString() !== newData.toString()) {
					return { ...oldData, ...newData };
				}

				return oldData;
			});
		},
		[setProps]
	);
	return _setProps;
};

//? Table data
export const useResultTableData = () => {
	const data = useContext(ResultTableDataContext);
	if (typeof data === 'undefined') {
		throw new Error('useResultTableData must be used within a DataProvider');
	}
	return data;
};
//? Set table data
export const useSetResultTableData = () => {
	const setData = useContext(SetResultTableDataContext);
	if (typeof setData === 'undefined') {
		throw new Error('useSetResultTableData must be used within a DataProvider');
	}
	const _setData = React.useCallback(
		(newData) => {
			setData((oldData) => {
				if (!oldData) {
					return newData;
				}

				if (oldData.toString() !== newData.toString()) {
					return { ...oldData, ...newData };
				}

				return oldData;
			});
		},
		[setData]
	);
	return _setData;
};
