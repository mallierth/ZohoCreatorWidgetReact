import React, { useState, useEffect, useCallback } from 'react';
import PropTypes from 'prop-types';
import { useRecoilValue } from 'recoil';
import { DragDropContext, Droppable } from 'react-beautiful-dnd';
import { useWhyDidYouUpdate } from 'use-why-did-you-update';
import {
	Alert,
	Box,
	Grid,
	IconButton,
	Snackbar,
	Stack,
	Typography,
} from '@mui/material';
import { Add } from '@mui/icons-material';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TablePagination from '@mui/material/TablePagination';
import TableRow from '@mui/material/TableRow';
import TableToolbar from './TableToolbar';
import TableHeader from './TableHeader';
import TableShiftControls from './TableShiftControls';
import TableAssemblyControls from './TableAssemblyControls';
import TableLoader from './TableLoader';
import TableRowsWrapper from './TableRowsWrapper';
import Skeleton from '@mui/material/Skeleton';
import { getAllRecords, getAllRecordsSuspense } from '../../apis/ZohoCreator';
import {
	useZohoGetAllRecords,
	useZohoDeleteRecord,
} from '../Helpers/CustomHooks';
import RenderForm from '../Helpers/RenderForm';
import intTryParse from '../Helpers/intTryParse';
import {
	currentUserState,
	customAssemblyLineItemIdState,
} from '../../recoil/atoms';
import ConfirmationDialog from '../Helpers/ConfirmationDialog';
import TableAddComment from './TableAddComment';
import { useTableViewManager, useZohoSaveRecord } from '../Helpers/CustomHooks';
import { omit } from 'lodash-es';
import { ResultTableProvider } from '../Helpers/ResultTableContext';

//#region //* Sorting
function descendingComparator(a, b, orderBy, sortBySelected) {
	if (typeof a[orderBy] === 'object') {
		a = { ...a, [orderBy]: a[orderBy].display_value };
	}

	if (typeof b[orderBy] === 'object') {
		b = { ...b, [orderBy]: b[orderBy].display_value };
	}

	if (sortBySelected) {
		if (b.Selected < a.Selected) {
			return -1;
		}
		if (b.Selected > a.Selected) {
			if (b.Selected === a.Selected) {
				if (b[orderBy] < a[orderBy]) {
					return -1;
				}
				if (b[orderBy] > a[orderBy]) {
					return 1;
				}
				return 0;
			} else {
				return -1;
			}
		}
		return 0;
	} else {
		if (b[orderBy] < a[orderBy]) {
			return -1;
		}
		if (b[orderBy] > a[orderBy]) {
			return 1;
		}
		return 0;
	}
}

function getComparator(order, orderBy, sortBySelected) {
	return order === 'desc'
		? (a, b) => descendingComparator(a, b, orderBy, sortBySelected)
		: (a, b) => -descendingComparator(a, b, orderBy, sortBySelected);
}

function stableSort(array, comparator) {
	if (Array.isArray(array) && array.length > 0) {
		const stabilizedThis = array.map((el, index) => [el, index]);
		stabilizedThis.sort((a, b) => {
			const order = comparator(a[0], b[0]);
			if (order !== 0) return order;
			return a[1] - b[1];
		});
		return stabilizedThis.map((el) => el[0]);
	} else {
		return [];
	}
}
//#endregion

const formatCollapseData = (data) => {
	if (!Array.isArray(data)) {
		return [];
	}

	return data
		.filter((d) => d.Collapsible_Child === 'false' || !d.Collapsible_Child)
		.map((d) => {
			if (d.Collapsible_Parent !== 'false' && d.Collapsible_Parent) {
				return {
					...d,
					Collapsible_Line_Items: d.Collapsible_Line_Items.map((c) => {
						return data.filter((st) => st.ID === c.ID)[0];
					}),
				};
			}

			return { ...d };
		})
		.filter((d) => d);
};

/*
const isDefault = (userId, zohoUserList) => {
	if (!Array.isArray(zohoUserList)) {
		return false;
	}

	return zohoUserList.filter((user) => user.ID === userId).length > 0;
};

const isFavorite = (userId, zohoUserList) => {
	if (!Array.isArray(zohoUserList)) {
		return false;
	}

	return zohoUserList.filter((user) => user.ID === userId).length > 0;
};

const formatSavedViews = (userId, data) => {
	if (!Array.isArray(data)) {
		return [];
	}

	return data.map((r) => ({
		name: r.Name,
		filtersArray: JSON.parse(r.Criteria_2),
		isDefault: isDefault(userId, r.Default_View),
		isFavorite: isFavorite(userId, r.Favorite_View),
		isActive: isDefault(userId, r.Default_View),
		ID: r.ID,
	}));
};
*/

const ResultTable = React.memo((props) => {
	useWhyDidYouUpdate('ResultTable', props);
	const data = props.resource.read();
	const {
		columns,
		defaultOrderBy,
		clickToSelect,
		singleSelect,
		enableSort,
		enableCollapseRows,
		showSearch,
		showShiftControls,
		showAssemblyControls,
		showEdit,
		showCommentAdd,
		showMassUpdate,
		showDuplicate,
		showDelete,
		showExport,
		pagination,
		customSelectionMessage,
		tableHeight,
		enableDndRows,
		dialogSize,
		dialogLoadData,
		parentId,
		sortBySelected,
		deleteFnOverride,
		lineItemOrderChanged,
		overrideOrder,
		reportName,
		criteria,
		formName,
		name,
		onSelectedDataChanged,
		onDoubleClick,
		doubleClickToEdit,
		defaultValue,
		disableFilters,

		//savedViews,
		//setSavedViews,
		viewState,
		setActiveView,
		setSaveView,
		setFilters,
	} = props;
	const currentUser = useRecoilValue(currentUserState);
	const [initialSelectionsData, setInitialSelectionsData] = useState(null);
	//const classes = useStyles(props);
	const [order, setOrder] = useState('asc');
	const [orderBy, setOrderBy] = useState(defaultOrderBy);
	const [expanded] = useState([]);
	const [page, setPage] = useState(0);
	const [rowsPerPage, setRowsPerPage] = useState(25);
	const [tableData, setTableData] = useState(formatCollapseData(data));
	//const [savedViews, setSavedViews] = useState(formatSavedViews(currentUser.ID, props.savedViews));
	const [visibleColumns, setVisibleColumns] = useState(columns);
	const [loading, setLoading] = useState(!showSearch); //! This *could* work out ok - line item tables should load by default, all others have search
	const [searching, setSearching] = useState(false);
	const [searchTerm, setSearchTerm] = useState(null);
	const [dialogOpen, setDialogOpen] = useState(false);
	const [recordId, setRecordId] = useState(null);
	//const { status, data } = useZohoGetAllRecords(reportName, criteria, 1, 200);

	const [deleteConfirmDialogOpen, setDeleteConfirmDialogOpen] = useState(false);
	const [toastOpen, setToastOpen] = useState(false);
	const [toastSeverity, setToastSeverity] = useState('success');
	const [toastMessage, setToastMessage] = useState('');
	const [deleteState, deleteRecord] = useZohoDeleteRecord();
	const [addComment, setAddComment] = useState(false);
	const [saveState, addRecord, updateRecord] = useZohoSaveRecord();
	const customAssemblyLineItemId = useRecoilValue(
		customAssemblyLineItemIdState
	);

	/*
	useEffect(() => {
		if(savedViews) {
			console.log('Saved views: ', savedViews);
		}
	}, [savedViews]);

	//! Get custom views
	useEffect(() => {
		if(reportName) {
			
			(async () => {
				const response = await getAllRecords(
					'Record_Views',
					`Form=="${formName}" && Criteria_2 != null && Criteria_2 != ""`,
					1,
					200
				);
				
				if(Array.isArray(response)) {
					setSavedViews(
						response.map(r => ({
							name: r.Name,
							filter: JSON.parse(r.Criteria_2),
							isDefault: isDefault(currentUser.ID, r.Default_View),
							isFavorite: isFavorite(currentUser.ID, r.Favorite_View),
						}))
					);
				}
			})()
		}
	}, [reportName])
	*/

	useEffect(() => {
		switch (saveState.status) {
			case 'saving':
				setToastMessage('Saving data...');
				setToastSeverity('info');
				setToastOpen(true);
				break;
			case 'saved':
				if (
					saveState.data.Added &&
					saveState.data.Price_Book_Item == customAssemblyLineItemId
				) {
					onAddRecordPerformCompression(saveState.data);
				}

				setToastMessage('Data saved successfully!');
				setToastSeverity('success');
				setToastOpen(true);

				break;
			case 'error':
				setToastMessage(`Error: ${saveState.error}`);
				setToastSeverity('error');
				setToastOpen(true);
				break;
			case 'workflow_error':
				setToastMessage(
					`Workflow error! This is a back-end error in Zoho's code that should be fixable by your system's administrator.`
				);
				setToastSeverity('warning');
				setToastOpen(true);
				break;
			case 'validation_error':
				setToastMessage(`Validation warning: ${saveState.error}`);
				setToastSeverity('info');
				setToastOpen(true);
				break;
		}
	}, [saveState.status]);

	const columnCount = () => {
		//! Always show a checkbox, so offset by +1
		if (enableCollapseRows && clickToSelect && enableDndRows) {
			return visibleColumns.filter((col) => col.visible).length + 3;
		}

		if (enableCollapseRows && !clickToSelect && enableDndRows) {
			return visibleColumns.filter((col) => col.visible).length + 2;
		}

		if (clickToSelect && enableDndRows) {
			return visibleColumns.filter((col) => col.visible).length + 2;
		}

		return visibleColumns.filter((col) => col.visible).length + 1;
	};

	useEffect(() => {
		console.log('useEffect() deleteConfirmDialogOpen', deleteConfirmDialogOpen);
	}, [deleteConfirmDialogOpen]);

	/*
	useEffect(() => {
		setLoading(status === 'fetching');
		if (status === 'fetched') {
			//!Filter out children
			const loadTableData = data
				.filter((d) => d.Collapsible_Child === 'false' || !d.Collapsible_Child)
				.map((d) => {
					if (d.Collapsible_Parent !== 'false' && d.Collapsible_Parent) {
						return {
							...d,
							Collapsible_Line_Items: d.Collapsible_Line_Items.map((c) => {
								return data.filter((st) => st.ID === c.ID)[0];
							}),
						};
					}

					return d;
				})
				.filter((d) => d);

			setTableData(
				overrideOrder ? overrideOrder(loadTableData) : loadTableData
			);
		}
	}, [status]);
	*/

	//! Fix for when selecting a view, need to update table data
	useEffect(() => {
		setTableData(
			overrideOrder
				? overrideOrder(formatCollapseData(data))
				: formatCollapseData(data)
		);
	}, [data]);

	useEffect(() => {
		console.log('deleteState', deleteState.status, deleteState);
		switch (deleteState.status) {
			case 'deleting':
				setToastMessage(`Deleting dat...`);
				setToastSeverity('info');
				setToastOpen(true);
				break;
			case 'deleted':
				setTableData((rows) =>
					rows.filter((row) => !deleteState.data.includes(row.ID))
				); //Filter out deleted row IDs
				setDeleteConfirmDialogOpen(false);
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
				setToastMessage(
					`Workflow error! This is a back-end error in Zoho's code that should be fixable by your system's administrator.`
				);
				setToastSeverity('warning');
				setToastOpen(true);
				break;
			case 'validation_error':
				setToastMessage(`Validation warning: ${deleteState.error}`);
				setToastSeverity('info');
				setToastOpen(true);
				break;
		}
	}, [deleteState.status]);

	const handleToastClose = (e, reason) => {
		if (reason === 'clickaway') {
			return;
		}

		setToastOpen(false);
	};

	//! Search
	const search = () => {
		setSearching(true);
		var formattedSearchArr = [];
		columns.forEach((column) => {
			if (column.type === 'number' && intTryParse(searchTerm)) {
				formattedSearchArr = [
					...formattedSearchArr,
					...column.searchKey.map((key) => `${key}=${searchTerm || ''}`),
				];
			} else if (column.type !== 'number') {
				formattedSearchArr = [
					...formattedSearchArr,
					...column.searchKey.map(
						(key) => `${key}.contains("${searchTerm || ''}")`
					),
				];
			}
		});

		const formattedSearchTerm = '(' + formattedSearchArr.join(' || ') + ')';

		console.log('formattedSearchTerm', formattedSearchTerm);

		//TODO In order to support initial selections and also searching with a current selection
		//TODO I think I need to integrate the initial selections as input tableData on load

		(async () => {
			console.log(
				'about to search:',
				defaultValue,
				initialSelectionsData,
				criteria
			);

			if (defaultValue && !initialSelectionsData) {
				const formattedDefaultValue = !Array.isArray(defaultValue)
					? [...[], defaultValue]
					: defaultValue;
				const initialSelectsCriteria =
					'(' +
					formattedDefaultValue.map((dv) => `ID==${dv.ID}`).join('||') +
					')';
				const initialSelectsExclusions =
					'(' +
					formattedDefaultValue.map((dv) => `ID!=${dv.ID}`).join('&&') +
					')';
				const response = await getAllRecords(
					reportName,
					criteria
						? `${criteria} && ${initialSelectsExclusions} && ${formattedSearchTerm}`
						: `${initialSelectsExclusions} && ${formattedSearchTerm}`,
					1,
					200
				);

				const initialSelectionsResponse = await getAllRecords(
					reportName,
					initialSelectsCriteria,
					1,
					200
				);
				setInitialSelectionsData(
					initialSelectionsResponse.map((d) => ({ ...d, Selected: true }))
				);
				setTableData([
					...initialSelectionsResponse.map((d) => ({ ...d, Selected: true })),
					...response,
				]);
			} else if (initialSelectionsData && initialSelectionsData.length > 0) {
				const initialSelectsExclusions =
					'(' +
					initialSelectionsData.map((d) => `ID!=${d.ID}`).join('&&') +
					')';
				const response = await getAllRecords(
					reportName,
					criteria
						? `${criteria} && ${initialSelectsExclusions} && ${formattedSearchTerm}`
						: `${initialSelectsExclusions} && ${formattedSearchTerm}`,
					1,
					200
				);
				setTableData([
					...initialSelectionsData.filter((d) => d.Selected),
					...response,
				]);
			} else {
				const response = await getAllRecords(
					reportName,
					criteria
						? `${criteria} && ${formattedSearchTerm}`
						: formattedSearchTerm,
					1,
					200
				);
				setTableData(response);
			}

			setSearching(false);
		})();
	};

	//! Searches on load, this triggers initial data pull when showSearch = true
	useEffect(() => {
		console.log('searchTerm:', searchTerm);
		if (!showSearch || searchTerm === null) {
			return;
		}

		const debounceId = setTimeout(() => {
			search();
		}, 500);

		return () => {
			//* Cleanup => on initial render, this is returned and React holds a ref
			//* On subsequent renders, this cleanup function is invoked first, then useEffect invoked again and so on
			clearTimeout(debounceId);
		};
	}, [searchTerm]);

	useEffect(() => {
		if (!tableData) {
			return;
		}

		setInitialSelectionsData(tableData.filter((row) => row.Selected));
		if (onSelectedDataChanged) {
			onSelectedDataChanged(
				name,
				tableData.filter((row) => row.Selected)
			);
		}

		if (lineItemOrderChanged) {
			lineItemOrderChanged(tableData.map((row) => row.ID));
		}
	}, [tableData]);

	useEffect(() => {
		setTableData(tableData.map((row) => ({ ...row, Selected: false })));
	}, [expanded]);

	const handleRequestSort = (event, property) => {
		const isAsc = orderBy === property && order === 'asc';
		setOrder(isAsc ? 'desc' : 'asc');
		setOrderBy(property);
	};

	const handleSelectAllClickEdit = (event) => {
		if (event.target.checked) {
			setTableData(tableData.map((row) => ({ ...row, Selected: true })));
			return;
		}
		setTableData(tableData.map((row) => ({ ...row, Selected: false })));
	};

	const handleChangePage = (event, newPage) => {
		setPage(newPage);
	};

	const handleChangeRowsPerPage = (event) => {
		setRowsPerPage(parseInt(event.target.value, 10));
		setPage(0);
	};

	const onSearch = useCallback(
		(searchTerm) => {
			setSearchTerm((oldSearchTerm) =>
				oldSearchTerm !== searchTerm ? searchTerm : oldSearchTerm
			);
		},
		[setSearchTerm]
	);

	const emptyRows = pagination
		? rowsPerPage - Math.min(rowsPerPage, tableData.length - page * rowsPerPage)
		: 0;

	const reorder = (list, startIndex, endIndex) => {
		var result = Array.from(list);
		const [removed] = result.splice(startIndex, 1);
		result.splice(endIndex, 0, removed);
		return result;
	};

	const handleDragRowDrop = (result) => {
		// dropped outside the list
		if (!result.destination) {
			return;
		}

		const reorderedTableData = reorder(
			tableData,
			result.source.index,
			result.destination.index
		);

		console.log('reorderedTableData', reorderedTableData);

		setTableData(reorderedTableData);
	};

	const handleTableDataParams =
		enableDndRows || showShiftControls
			? tableData
			: stableSort(
					tableData,
					getComparator(order, orderBy, sortBySelected)
			  ).slice(
					pagination ? page * rowsPerPage : 0,
					pagination ? page * rowsPerPage + rowsPerPage : tableData.length
			  );

	//#region //! Actions
	const onCompress = () => {
		//! First, add a new form Line Item with Price_Book_Item: customAssemblyLineItemId, then get this ID and assign within table
		const childData = tableData
			.filter((row) => row.Selected)
			.map((row) => ({
				...row,
				Selected: false,
				Collapsible_Parent: false,
				Collapsible_Child: true,
			}));

		var parentData = {
			[formName.replaceAll('_Line_Item', '')]: parentId,
			Price_Book_Item: customAssemblyLineItemId,
			Quantity: 1,
			Type: 'Assembly',
			Code: 'Double click to set a Name',
			Name: 'Double click to set a Name',
			Manufacturer: '',
			Custom_Code: 'Double click to set a Name',
			Custom_Name: 'Double click to set a Name',
			Custom_Manufacturer: '',
			Description: 'Double click to set a Description',
			Collapsible_Line_Items: childData,
			Collapsible_Parent: true,
			Collapsible_Child: false,
			Price_Level_Type: 'Custom',
		};

		columns.forEach((col) => {
			if (col.collapseFormula) {
				parentData[col.valueKey] = col.collapseFormula(childData, col.valueKey);
			} else if (!parentData[col.valueKey] && parentData[col.valueKey] !== '') {
				parentData[col.valueKey] = col.valueKey;
			}
		});

		//Update Children
		updateRecord(reportName, null, childData);

		//Add Parent
		addRecord(formName, parentData);
	};

	const onAddRecordPerformCompression = (data) => {
		data.Collapsible_Line_Items = tableData
			.filter((row) => row.Selected)
			.map((row) => ({
				...row,
				Selected: false,
				Collapsible_Parent: false,
				Collapsible_Child: true,
			}));

		setTableData((oldTableData) => {
			return [...oldTableData.filter((row) => !row.Selected), data];
		});
	};

	const onExpand = () => {
		//Grab Collapsible_Line_Items for the selection
		const childData = tableData
			.filter((row) => row.Selected)
			.map((row) =>
				row.Collapsible_Line_Items.map((childRow) => ({
					...childRow,
					Selected: false,
					Collapsible_Child: false,
					Collapsible_Parent: false,
				}))
			);

		console.log('onExpand()', childData);

		//Update Children
		updateRecord(reportName, null, childData);

		//Delete parent line item
		deleteRecord(
			reportName,
			`ID==${tableData.filter((row) => row.Selected)[0].ID}`,
			tableData.filter((row) => row.Selected).map((row) => row.ID)
		);

		setTableData((oldTableData) => {
			return [...oldTableData.filter((row) => !row.Selected), childData];
		});
	};

	const onShiftTop = () => {
		const selectionIndexes = tableData
			.map((row, i) => (row.Selected ? i : null))
			.filter((i) => i === 0 || i);
		const result = Array.from(tableData);
		selectionIndexes.forEach((selectedIndex, i) => {
			const newIndex = i;
			if (newIndex >= 0 && !result[newIndex].Selected) {
				const [removedRow] = result.splice(selectedIndex, 1);
				result.splice(newIndex, 0, removedRow);
			}
		});
		setTableData(result);
	};

	const onShiftUp = () => {
		const selectionIndexes = tableData
			.map((row, i) => (row.Selected ? i : null))
			.filter((i) => i === 0 || i);
		const result = Array.from(tableData);
		selectionIndexes.forEach((selectedIndex) => {
			const newIndex = selectedIndex - 1;
			if (newIndex >= 0 && !result[newIndex].Selected) {
				const [removedRow] = result.splice(selectedIndex, 1);
				result.splice(newIndex, 0, removedRow);
			}
		});
		setTableData(result);
	};

	const onShiftDown = () => {
		const selectionIndexes = tableData
			.map((row, i) => (row.Selected ? i : null))
			.filter((i) => i === 0 || i);
		const result = Array.from(tableData);
		selectionIndexes.forEach((selectedIndex) => {
			const newIndex = selectedIndex + 1;
			if (newIndex <= result.length - 1 && !result[newIndex].Selected) {
				const [removedRow] = result.splice(selectedIndex, 1);
				result.splice(newIndex, 0, removedRow);
			}
		});
		setTableData(result);
	};

	const onShiftBottom = () => {
		const selectionIndexes = tableData
			.map((row, i) => (row.Selected ? i : null))
			.filter((i) => i === 0 || i);
		const result = Array.from(tableData);
		selectionIndexes.reverse().forEach((selectedIndex, i) => {
			const newIndex = result.length - 1 - i;
			if (newIndex <= result.length - 1 && !result[newIndex].Selected) {
				const [removedRow] = result.splice(selectedIndex, 1);
				result.splice(newIndex, 0, removedRow);
			}
		});
		setTableData(result);
	};

	const onAddClicked = () => {
		setAddComment(false);
		setRecordId(null);
		setDialogOpen(true);
	};

	const onEditClicked = () => {
		setRecordId(tableData.filter((row) => row.Selected)[0].ID);
		setDialogOpen(true);
	};

	const onCommentAddClicked = () => {
		//Add a record and then get it's ID?
		setAddComment(true);
		setRecordId(null);
		setDialogOpen(true);
	};

	const onMassUpdateClicked = () => {
		alert(
			'TODO: Mass update modal for relevant form with enabled/disabled mass update controls'
		);
	};

	const onDuplicateClicked = () => {
		alert('TODO: Duplication confirmation popup');
	};

	const onDeleteClicked = () => {
		setDeleteConfirmDialogOpen(true);
	};
	//#endregion

	useWhyDidYouUpdate('ResultTable', props);

	const handleDelete = () => {
		const criteria =
			'(' +
			tableData
				.filter((row) => row.Selected)
				.map((row) => `ID==${row.ID}`)
				.join(' || ') +
			')';
		const idArray = tableData
			.filter((row) => row.Selected)
			.map((row) => row.ID);
		deleteRecord(reportName, criteria, idArray);
	};

	const handleRowDoubleClick = (row) => {
		if (onDoubleClick) {
			onDoubleClick(row);
		}

		if (doubleClickToEdit) {
			setRecordId(row.ID);
			setDialogOpen(true);
		}
	};

	const handleFormSave = useCallback(
		(data) => {
			if (data && typeof data === 'object' && Object.keys(data).length > 0) {
				setTableData((rows) => {
					if (data.Collapsible_Parent !== 'false' && data.Collapsible_Parent) {
						//Update
						return rows.map((row) =>
							row.ID === data.ID
								? { ...row, ...omit(data, 'Collapsible_Line_Items') }
								: row
						);
					} else if (rows.filter((row) => row.ID === data.ID).length > 0) {
						//Update
						return rows.map((row) =>
							row.ID === data.ID ? { ...row, ...data } : row
						);
					} else {
						//Insert
						return [...rows, { ...data, Selected: false }];
					}
				});
			}
		},
		[handleFormSave]
	);

	const internalSetDialogOpen = useCallback(
		(state) => {
			setDialogOpen(state);
		},
		[internalSetDialogOpen]
	);

	const skeletonTable = () => {
		if (loading) {
			return (
                <Skeleton
					variant="rectangular"
					width='100%'
					height={`${window.innerHeight - 400}px`}
				/>
            );
		} else {
			return <>
                <TableToolbar
                    numSelected={tableData.filter((row) => row.Selected).length}
                    showSearch={showSearch && tableData.length > 0}
                    showEdit={showEdit}
                    onSearch={onSearch}
                    showMassUpdate={showMassUpdate}
                    showDuplicate={showDuplicate}
                    showDelete={showDelete}
                    customSelectionMessage={customSelectionMessage}
                    showExport={showExport}
                    visibleColumns={visibleColumns}
                    onAddClicked={onAddClicked}
                    onEditClicked={onEditClicked}
                    onMassUpdateClicked={onMassUpdateClicked}
                    onDuplicateClicked={onDuplicateClicked}
                    onDeleteClicked={onDeleteClicked}
                    formName={formName}
                    disableFilters={disableFilters}
                    //savedViews={savedViews}
                    //setSavedViews={setSavedViews}
                    viewState={viewState}
                    setActiveView={setActiveView}
                    setSaveView={setSaveView}
                    setFilters={setFilters}
                />
                {tableData.length > 0 ? (
                    <TableContainer
                        sx={{
                            height: tableHeight ? tableHeight : window.innerHeight - 400,
                        }}>
                        <Table sx={{ minWidth: 750 }} stickyHeader size='small'>
                            <TableHeader
                                enableCollapseRows={enableCollapseRows}
                                numSelected={tableData.filter((row) => row.Selected).length}
                                order={order}
                                orderBy={orderBy}
                                onSelectAllClick={handleSelectAllClickEdit}
                                onRequestSort={handleRequestSort}
                                rowCount={tableData.length}
                                singleSelect={singleSelect}
                                clickToSelect={clickToSelect}
                                visibleColumns={visibleColumns}
                                setVisibleColumns={setVisibleColumns}
                                enableSort={enableSort}
                                enableDndRows={enableDndRows}
                            />
                            <DragDropContext onDragEnd={handleDragRowDrop}>
                                <Droppable droppableId='table'>
                                    {(provided) => (
                                        <TableBody
                                            ref={provided.innerRef}
                                            {...provided.droppableProps}>
                                            {searching ? (
                                                <TableRow>
                                                    <TableCell colSpan={columnCount()}>
                                                        <TableLoader />
                                                    </TableCell>
                                                </TableRow>
                                            ) : (
                                                <TableRowsWrapper
                                                    tableData={handleTableDataParams}
                                                    setTableData={setTableData}
                                                    visibleColumns={visibleColumns}
                                                    clickToSelect={clickToSelect}
                                                    singleSelect={singleSelect}
                                                    enableCollapseRows={enableCollapseRows}
                                                    enableDndRows={enableDndRows}
                                                    onDoubleClick={handleRowDoubleClick}
                                                />
                                            )}

                                            {emptyRows > 0 && (
                                                <TableRow style={{ height: 33 * emptyRows }}>
                                                    <TableCell colSpan={columnCount()} />
                                                </TableRow>
                                            )}

                                            {
                                                //Footer
                                            }

                                            {provided.placeholder}
                                        </TableBody>
                                    )}
                                </Droppable>
                            </DragDropContext>
                        </Table>
                    </TableContainer>
                ) : (
                    <Box
                        sx={{
                            width: '100%',
                            display: 'flex',
                            justifyContent: 'center',
                            pt: 6,
                        }}>
                        <Box>
                            <Typography variant='h4' align='center' paragraph>
                                No results from the {reportName.replaceAll('_', ' ')} table
                                {criteria &&
                                (currentUser.Admin === 'true' ||
                                    currentUser.Developer === 'true')
                                    ? ` where ${criteria}`
                                    : ''}
                                !
                            </Typography>
                            <Typography
                                variant='subtitle1'
                                sx={{
                                    color: 'text.secondary',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                }}
                                paragraph>
                                Please click the{' '}
                                <IconButton sx={{ mx: 1 }} onClick={onAddClicked} size="large">
                                    <Add />
                                </IconButton>{' '}
                                button above to add a new {formName.replaceAll('_', ' ')}!
                            </Typography>
                        </Box>
                    </Box>
                )}

                {pagination && tableData.length > 0 ? (
                    <TablePagination
                        rowsPerPageOptions={[25, 50, 100, 200]}
                        component='div'
                        count={tableData.length}
                        rowsPerPage={rowsPerPage}
                        page={page}
                        onPageChange={handleChangePage}
                        onRowsPerPageChange={handleChangeRowsPerPage}
                    />
                ) : null}

                <RenderForm
                    openInDialog
                    dialogOpen={dialogOpen}
                    setDialogOpen={internalSetDialogOpen}
                    dialogTitle={
                        recordId
                            ? `Edit ${formName.replaceAll('_', ' ')}`
                            : `Add new $ ${formName.replaceAll('_', ' ')}`
                    }
                    dialogSize={dialogSize}
                    loadData={dialogLoadData}
                    parentId={parentId}
                    id={recordId}
                    formName={formName}
                    successfulSaveData={handleFormSave}
                    internalProps={{ isComment: addComment }}
                />
            </>;
		}
	};

	const skeletonComment = () => {
		if (loading) {
			return (
                <Box>
					<Skeleton variant="rectangular" width='57px' height='38px' />
				</Box>
            );
		} else {
			return (
				<TableAddComment
					disabled={searching || loading}
					disableAddComment={false}
					onCommentAddClicked={onCommentAddClicked}
				/>
			);
		}
	};

	const skeletonShiftControls = () => {
		if (loading) {
			return (
                <Box>
					<Skeleton variant="rectangular" width='57px' height='38px' />
					<Skeleton variant="rectangular" width='57px' height='38px' />
					<Skeleton variant="rectangular" width='57px' height='38px' />
					<Skeleton variant="rectangular" width='57px' height='38px' />
				</Box>
            );
		} else {
			return (
				<TableShiftControls
					disabled={
						searching ||
						loading ||
						tableData.filter((row) => row.Selected).length === 0
					}
					disableShiftTop={false}
					disableShiftUp={false}
					disableShiftDown={false}
					disableShiftBottom={false}
					onShiftTop={onShiftTop}
					onShiftUp={onShiftUp}
					onShiftDown={onShiftDown}
					onShiftBottom={onShiftBottom}
				/>
			);
		}
	};

	const skeletonAssemblyControls = () => {
		if (loading) {
			return (
                <Box>
					<Skeleton variant="rectangular" width='57px' height='38px' />
					<Skeleton variant="rectangular" width='57px' height='38px' />
				</Box>
            );
		} else {
			return (
				<TableAssemblyControls
					disabled={
						searching ||
						loading ||
						tableData.filter((row) => row.Selected).length === 0
					}
					disableCompress={
						tableData.filter(
							(row) =>
								row.Selected &&
								(row.Collapsible_Parent === 'false' ||
									row.Collapsible_Parent === false)
						).length < 2 ||
						tableData.filter((row) => row.Selected && row.Type === 'Comment')
							.length > 0 ||
						tableData.filter((row) => row.Selected && row.Type === 'Assembly')
							.length > 0
					}
					disableExpand={
						tableData.filter(
							(row) =>
								row.Selected &&
								row.Collapsible_Parent !== 'false' &&
								row.Collapsible_Parent
						).length !== 1 ||
						tableData.filter((row) => row.Selected && row.Type !== 'Assembly')
							.length > 0
					}
					onCompress={onCompress}
					onExpand={onExpand}
				/>
			);
		}
	};

	return (
		<Box>
			{(showCommentAdd || showShiftControls || showAssemblyControls) &&
			tableData.length > 0 ? (
				<Grid container spacing={2}>
					<Grid item xs='auto' sx={{ display: { xs: 'none', xl: 'flex' } }}>
						<Stack direction='column' spacing={2}>
							<Box sx={{ height: 116 }}></Box>
							{showCommentAdd ? skeletonComment() : null}
							{showShiftControls ? skeletonShiftControls() : null}
							{showAssemblyControls ? skeletonAssemblyControls() : null}
						</Stack>
					</Grid>
					<Grid item xs>
						{skeletonTable()}
					</Grid>
				</Grid>
			) : (
				<Box sx={{ width: '100%' }}>{skeletonTable()}</Box>
			)}

			<ConfirmationDialog
				title='Confirm Deletion'
				open={deleteConfirmDialogOpen}
				setOpen={(state) => setDeleteConfirmDialogOpen(state)}
				onConfirm={
					deleteFnOverride
						? deleteFnOverride(tableData.filter((row) => row.Selected))
						: handleDelete
				}>
				<Typography>Testing body</Typography>
			</ConfirmationDialog>

			<Snackbar
				open={toastOpen}
				autoHideDuration={6000}
				onClose={handleToastClose}>
				<Alert
					onClose={handleToastClose}
					severity={toastSeverity}
					variant='filled'
					sx={{ width: '100%' }}>
					{toastMessage}
				</Alert>
			</Snackbar>
		</Box>
	);
});

ResultTable.propTypes = {
	columns: PropTypes.array.isRequired,
	clickToSelect: PropTypes.bool,
	criteria: PropTypes.string,
	customSelectionMessage: PropTypes.string,
	defaultOrderBy: PropTypes.string.isRequired,
	defaultValue: PropTypes.oneOfType([
		PropTypes.object,
		PropTypes.array,
		PropTypes.string,
	]),
	dialogLoadData: PropTypes.object,
	dialogSize: PropTypes.string,
	formName: PropTypes.string.isRequired,
	enableDndRows: PropTypes.bool,
	enableSort: PropTypes.bool,
	enableCollapseRows: PropTypes.bool,
	loadData: PropTypes.object,
	name: PropTypes.string,
	onDoubleClick: PropTypes.func,
	onSelectedDataChanged: PropTypes.func,
	pagination: PropTypes.bool,
	parentId: PropTypes.string,
	reportName: PropTypes.string.isRequired,
	//savedViews: PropTypes.array.isRequired,
	//setSavedViews: PropTypes.func.isRequired,
	showAssemblyControls: PropTypes.bool,
	showCommentAdd: PropTypes.bool,
	showDuplicate: PropTypes.bool,
	showDelete: PropTypes.bool,
	showEdit: PropTypes.bool,
	showExport: PropTypes.bool,
	showMassUpdate: PropTypes.bool,
	showShiftControls: PropTypes.bool,
	showSearch: PropTypes.bool,
	sortBySelected: PropTypes.bool,
	singleSelect: PropTypes.bool,
	tableHeight: PropTypes.number,
};
ResultTable.defaultProps = {
	columns: [],
};

ResultTable.displayName = 'ResultTable';

const ResultTableWrapper = React.memo((props) => {
	useWhyDidYouUpdate('ResultTableWrapper', props);
	
	const [viewState, setActiveView, setSaveView, setFilters] =
		useTableViewManager(props.resource.read(), props.formName, props.criteria); //! Formatted internally
	const [criteria, setCriteria] = useState(viewState.criteriaString);

	useEffect(() => {
		console.log('viewState.criteriaString', viewState.criteriaString);
		setCriteria(oldCriteria => oldCriteria !== viewState.criteriaString ? viewState.criteriaString : oldCriteria);
	}, [viewState.criteriaString]);

	useEffect(() => {
		console.log('criteria', criteria);
	}, [criteria]);

	return (
		<ResultTableProvider>
			<ResultTable
				{...props}
				//savedViews={savedViews}
				//setSavedViews={setSavedViews}
				viewState={viewState.savedViews}
				setActiveView={setActiveView}
				setSaveView={setSaveView}
				setFilters={setFilters}
				resource={getAllRecordsSuspense(props.reportName, criteria)}
			/>
		</ResultTableProvider>
	);
});
ResultTableWrapper.displayName = 'ResultTableWrapper';
export default ResultTableWrapper;
