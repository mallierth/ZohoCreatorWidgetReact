import React, { useCallback, useState, useEffect, useRef } from 'react';
import PropTypes from 'prop-types';
import { v4 as uuid } from 'uuid';
import { useWhyDidYouUpdate } from 'use-why-did-you-update';
import { DragDropContext, Droppable } from 'react-beautiful-dnd';
import { Box, Fade, Slide } from '@mui/material';
import { useZohoGetAllRecords, useFormData } from '../Helpers/CustomHooks';
import { useRecoilValue, useRecoilState } from 'recoil';
import { omit } from 'lodash-es';
import {
	navBarHeightState,
	tabBarHeightState,
	currentUserState,
	customAssemblyLineItemIdState,
	formMaxWidthState,
	debugState,
	applicationTabsState,
} from '../../recoil/atoms';
import * as Columns from '../../recoil/columnAtoms';
import CustomTableColumnHeader from './CustomTableColumnHeader';
import CustomTableRowWrapper from './CustomTableRowWrapper';
import CustomTableToolbar from './CustomTableToolbar';
import CustomTableFilterManager from './CustomTableFilterManager';
import CustomTableFilterGraphic from './CustomTableFilterGraphic';
import ToastMessage from '../ToastMessage/ToastMessage';
import ThemeCard from '../ThemeCard';
import {
	Accordion,
	AccordionDetails,
	AccordionSummary,
	AppBar,
	Button,
	Checkbox,
	Container,
	FormControlLabel,
	Grid,
	IconButton,
	InputAdornment,
	LinearProgress,
	List,
	ListItem,
	ListItemButton,
	ListItemIcon,
	ListItemText,
	Menu,
	MenuItem,
	Paper,
	Popover,
	Stack,
	Switch,
	TableContainer,
	Table,
	TableBody,
	TableCell,
	TableRow,
	TextField,
	Toolbar,
	Tooltip,
	Typography,
} from '@mui/material';
import {
	AttachMoney,
	Close,
	Compress,
	Edit,
	Expand,
	OpenInNew,
	Search,
	SearchOff,
	UnfoldLess,
	UnfoldMore,
} from '@mui/icons-material';
import RenderForm from '../Helpers/RenderForm';
import RenderPopup from '../Helpers/RenderPopup';
import { useTheme, alpha } from '@mui/material/styles';
import useMediaQuery from '@mui/material/useMediaQuery';
import DatabaseDefaultIcon from '../Helpers/DatabaseDefaultIcon';
import {
	camelize,
	intTryParse,
	plurifyFormName,
	sum,
	margin as marginCalc,
	recalculateCompressedDataSalesTotals,
	currency,
	percent,
	getNameFn,
} from '../Helpers/functions';
import WizardDialog from '../Wizards/WizardDialog';
import WizardStep from '../Wizards/WizardStep';
import EstimateLineItemForm from '../Forms/EstimateLineItemForm';
import InventoryAdjustmentLineItemForm from '../Forms/InventoryAdjustmentLineItemForm';
import QuoteLineItemForm2 from '../Forms/QuoteLineItemForm2';
import SalesOrderLineItemForm from '../Forms/SalesOrderLineItemForm';
import PurchaseOrderLineItemForm from '../Forms/PurchaseOrderLineItemForm';
import PurchaseReceiveLineItemForm from '../Forms/PurchaseReceiveLineItemForm';
import { getAllRecords, getRecordByIdSuspense } from '../../apis/ZohoCreator';
import ConfirmationDialog from '../Helpers/ConfirmationDialog';
import SaveManager from '../Helpers/SaveManager';
import ToolbarTitle from '../Helpers/ToolbarTitle';
import { saveAs } from 'file-saver';
import { utils, write } from 'xlsx';
import CustomDataTable from '../CustomDataTable/CustomDataTable';
import PriceBookItemReport from '../Reports/PriceBookItemReport';

//#region //! Excel Export
const fileType =
	'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8';
const fileExtension = '.xlsx';

const exportToXlsx = (jsonData, fileName, merges) => {
	let ws = utils.json_to_sheet(jsonData, { cellDates: true });
	if (merges && Array.isArray(merges)) {
		ws['!merges'] = merges;
	}
	const wb = { Sheets: { data: ws }, SheetNames: ['data'] };
	const excelBuffer = write(wb, { bookType: 'xlsx', type: 'array' });
	const data = new Blob([excelBuffer], { type: fileType });
	saveAs(data, fileName + fileExtension);
};

const exportHtmlTable = (tableRef, fileName) => {
	//var tbl = document.getElementById('export-sheetjs');
	var wb = utils.table_to_book(tableRef.current);
	const excelBuffer = write(wb, { bookType: 'xlsx', type: 'array' });
	const data = new Blob([excelBuffer], { type: fileType });
	saveAs(data, fileName + fileExtension);
};
//#endregion

//! Useful Dimensions
const padding = 16;
const margin = 16;
const toolbarHeight = 72;
const tableFooterHeight = 48;
const filterGraphicHeight = 40;
const tabTableHeight = 450;
const lineItemTableHeightAdjustment = 28;

const CustomTable = React.memo(
	({
		//CSS customization
		tabTable, //baseHeight = 400px
		lookupFieldTable, //baseHeight = window.innerHeight - 51 for bottom bar
		lineItemTable,
		onLineItemOrderChanged,
		lineItemDataState,
		lineItemDispatch,
		lineItemDefaultCriteria,
		overrideHeight,
		overrideDialogZindex,
		moveableModal,

		//Database requirements
		formName,
		reportName = plurifyFormName(formName),
		defaultCriteria,
		columnsOverride,

		//Initially for Dashboard functions
		overrideDefaultView,

		//Table configuration options
		enableAdd,
		enableEdit,
		enableDelete,
		enableSearch = tabTable || lineItemTable ? false : true,
		enableMassUpdate,
		enableExport,
		exportFilename = `Zoho ${formName.replaceAll('_', ' ')} Export`,
		showDuplicate,
		enableCollapseRows,
		enableSingleSelect,
		enableClickToSelect,
		enableDragReorder,
		enablePagination,
		enableContextMenu,
		disableSort = lineItemTable ? true : false,
		disableFilters = tabTable || lineItemTable ? true : false,
		disableDefaultView,
		hideToolbar,

		//Line item table props
		enableShiftControls,
		enableAssemblyControls,
		enableAddComment,

		//for Lookup field - represents array of row object(s), not just ID/display_value per row
		defaultValue,
		onChange,

		//Table data preferences
		defaultSortByColumn,
		defaultSortDirection,
		customSortOrder,

		//To load a record by default
		recordId,

		//As of 11/29/21, this is only for line item table
		parentId,
		parentFormData,
	}) => {
		useWhyDidYouUpdate('CustomTable.js', {
			//CSS customization
			tabTable, //baseHeight = 400px
			lookupFieldTable, //baseHeight = window.innerHeight - 51 for bottom bar
			lineItemTable,
			onLineItemOrderChanged,
			overrideHeight,
			overrideDialogZindex,

			//Database requirements
			formName,
			reportName,
			defaultCriteria,

			//Initially for Dashboard functions
			overrideDefaultView,

			//Table configuration options
			enableAdd,
			enableEdit,
			enableDelete,
			enableSearch,
			enableMassUpdate,
			enableExport,
			exportFilename,
			showDuplicate,
			enableCollapseRows,
			enableSingleSelect,
			enableClickToSelect,
			enableDragReorder,
			enablePagination,
			enableContextMenu,
			disableSort,
			disableFilters,
			disableDefaultView,

			//Line item table props
			enableShiftControls,
			enableAssemblyControls,
			enableAddComment,

			//for Lookup field - represents array of row object(s), not just ID/display_value per row
			defaultValue,
			onChange,

			//Table data preferences
			defaultSortByColumn,
			defaultSortDirection,
			customSortOrder,

			//To load a record by default
			recordId,

			//As of 11/29/21, this is only for line item table
			parentId,
			parentFormData,
		});
		const formContainerRef = useRef(null);
		const formMaxHeightRef = useRef(null);
		const [applicationTabs, setApplicationTabs] =
			useRecoilState(applicationTabsState);
		const tableRef = useRef(null);
		const scrollBottomRef = useRef(null);
		const theme = useTheme();
		const desktopMode = useMediaQuery(theme.breakpoints.up('sm'));
		const debug = useRecoilValue(debugState);
		const navBarHeight = useRecoilValue(navBarHeightState);
		const tabBarHeight = useRecoilValue(tabBarHeightState);
		const currentUser = useRecoilValue(currentUserState);
		const formMaxWidth = useRecoilValue(formMaxWidthState);
		const [columns, setColumns] = useRecoilState(
			Columns[`${camelize(formName.replaceAll('_', ''))}ColumnsState`]
		); //TODO: wizard line items may or may not be used, unsure 10/26/21
		const [onAddFormData, setOnAddFormData] = useState({});
		const visibleColumns = columns.filter((column) => column.visible);
		const [loading, setLoading] = useState(true);
		const [views, setViews] = useState(null);
		const [activeView, setActiveView] = useState(null);
		const [viewCriteria, setViewCriteria] = useState(null);
		const viewDataState = useZohoGetAllRecords('Record_Views', viewCriteria); //* Retrieve data from database
		const [activeFilters, setActiveFilters] = useState([]);
		const [reportCriteria, setReportCriteria] = useState(null); //* Triggered by search, view change, etc.
		const [openFilterDrawer, setOpenFilterDrawer] = useState(false);
		const [rows, setRows] = useState([]);
		const selections = rows.filter((row) => row && row.Selected === true);
		const rowDataState = useZohoGetAllRecords(
			reportName,
			reportCriteria,
			selections.length > 0 ? selections : defaultValue //This line will prioritize selections after the initial data pull using a defaultValue, if any
		); //* Retrieve data from database
		const viewID = useRef(null);
		const [sortDirection, setSortDirection] = useState(defaultSortDirection);
		const [sortColumnKey, setSortColumnKey] = useState(defaultSortByColumn);
		const [customLineItemSortOrder, setCustomLineItemSortOrder] = useState([]);
		const [paginationPage, setPaginationPage] = useState(0);
		const [paginationRowsPerPage, setPaginationRowsPerPage] = useState(25);
		const [searchTerm, setSearchTerm] = useState(null);
		const [tableHeight, setTableHeight] = useState(
			overrideHeight
				? overrideHeight
				: tabTable
				? tabTableHeight
				: lineItemTable
				? window.innerHeight -
				  navBarHeight * 3 - //App level AppBar, Form level AppBar, Timeline Toolbar,
				  tabBarHeight * 2 - //App level Tabs, Form level Tabs
				  (hideToolbar ? 0 : toolbarHeight) -
				  tableFooterHeight -
				  padding -
				  margin -
				  lineItemTableHeightAdjustment
				: lookupFieldTable
				? window.innerHeight -
				  navBarHeight * 2 - //AppBar & BottomBar
				  (hideToolbar ? 0 : toolbarHeight) - //Search Toolbar
				  tableFooterHeight -
				  padding -
				  margin
				: window.innerHeight -
				  navBarHeight -
				  tabBarHeight - //Search Toolbar
				  (hideToolbar ? 0 : toolbarHeight) -
				  tableFooterHeight -
				  padding -
				  margin
		);
		const [massUpdating, setMassUpdating] = useState(false);
		const [wizard, setWizard] = useState({ activeStep: 0 });
		const [wizardOpen, setWizardOpen] = useState(false);
		const wizardLineItemData = useRef({});
		const disableSearch = useRef(true);
		const [toastData, setToastData] = useState({});
		const [confirmationDialogOpen, setConfirmationDialogOpen] = useState(false);
		const [confirmationDialogData, setConfirmationDialogData] = useState({});
		const customAssemblyLineItemId = useRecoilValue(
			customAssemblyLineItemIdState
		);
		const [
			saveState,
			addRecord,
			updateRecord,
			mountData,
			resetData,
			massUpdateRecords,
			deleteRecords,
		] = useFormData({});
		const [duplicationState, duplicateRecord] = useFormData();
		const [contextMenu, setContextMenu] = useState(null);
		const [lineItemTableDetailsExpanded, setLineItemTableDetailsExpanded] =
			useState(false);

		useEffect(() => {
			console.log(
				'CustomTable formName changed - set columns again?',
				formName,
				columns
			);
		}, [formName, columns]);

		//*Form dialog/drawer
		const [formOpen, setFormOpen] = useState(false);
		const [formId, setFormId] = useState(recordId);
		const formData = useRef({});
		('');
		const [title, setTitle] = useState(null);

		const emptyRows = enablePagination
			? paginationRowsPerPage -
			  Math.min(
					paginationRowsPerPage,
					rows.length - paginationPage * paginationRowsPerPage
			  )
			: 0;

		useEffect(() => {
			if (columns && Array.isArray(columns) && columns.length > 0) {
				//Include Parent_ID loadData if defined
				const temp = parentId
					? { ...parentFormData, Parent_ID: parentId }
					: { ...parentFormData };
				columns.forEach((column) => {
					//! Allowing nulls here lets me clear date/dateTime/time pickers
					if (column.defaultValue !== undefined) {
						if (column.defaultValue === 'currentUser') {
							temp[column.valueKey] = {
								ID: currentUser.ID,
								display_value: currentUser.Full_Name,
							};
						} else {
							temp[column.valueKey] =
								typeof column.defaultValue === 'function'
									? column.defaultValue()
									: column.defaultValue;
						}
					} else if (!temp[column.valueKey]) {
						//! Special cases for default values
						switch (column.type) {
							case 'bool':
							case 'boolean':
								temp[column.valueKey] = false;
								break;
							default:
								temp[column.valueKey] = '';
						}
					}
				});
				setOnAddFormData((old) =>
					!old || JSON.stringify(old) !== JSON.stringify(temp) ? temp : old
				);
			}
		}, [columns]);

		useEffect(() => {
			//? Clear formData
			formData.current = {};
			setFormOpen(false);
			setTitle(null);
			setFormId(null);
			setMassUpdating(false);
		}, [reportName]);

		//#region //? Saved/Custom views
		//! This useEffect will set initial report criteria prioritizing a default view for the current user,
		//! then default criteria defined by the parent form, then an empty string
		useEffect(() => {
			let test = 0;

			if (!views && !disableFilters) {
				//Custom Views not yet retrieved, trigger an update to viewCriteria which in turn updated custom hook useZohoGetAllRecords()
				setViewCriteria(`Form=="${formName}"`);
				test = 1;
			} else if (disableDefaultView) {
				setReportCriteria(defaultCriteria ? defaultCriteria : '');
				test = 11;
			} else if (
				!disableFilters &&
				!reportCriteria &&
				reportCriteria !== '' &&
				!activeView &&
				overrideDefaultView
			) {
				//If overrideDefaultView is present after retrieving views from the database, assign it here
				setActiveView(overrideDefaultView.ID);
				test = 111;
			} else if (
				!disableFilters &&
				!reportCriteria &&
				reportCriteria !== '' &&
				!activeView &&
				currentUser[`${formName}_Default_View`]
			) {
				//Check for a default view for the current user
				setActiveView(currentUser[`${formName}_Default_View`].ID);
				test = 2;
			} else if (
				views &&
				(views.length === 0 || !activeView) &&
				!reportCriteria &&
				reportCriteria !== ''
			) {
				//There are no views, set a default search parameter

				//TODO: One option for a defaultValue search if there are views but no default view
				setReportCriteria(defaultCriteria ? defaultCriteria : '');
				test = 3;
			} else if (views && Array.isArray(views) && viewID.current) {
				//Hoping this is always only relevant to inserting a new view at runtime
				setActiveView(viewID.current);
				viewID.current = null;
				test = 4;
			} else {
				test = 5;
				setReportCriteria(defaultCriteria ? defaultCriteria : '');
			}

			console.log('test', test);
		}, [views, defaultCriteria]);

		const onAddView = (view) => {
			console.log('CustomTable onAddView()', view);
			//! Set saved view as active
			viewID.current = view.ID;
			setViews((old) => {
				if (old && Array.isArray(old)) {
					if (old.filter((o) => o.ID === view.ID).length === 1) {
						//Update
						return old.map((o) =>
							o.ID === view.ID
								? { ...o, ...view, JSON: JSON.parse(view.JSON) }
								: o
						);
					} else {
						//Insert and sort
						const _view = [...old, { ...view, JSON: JSON.parse(view.JSON) }];
						return _view.sort(
							(a, b) => _view.indexOf(a.Name) - _view.indexOf(b.Name)
						);
					}
				} else {
					return [...[], { ...view, JSON: JSON.parse(view.JSON) }];
				}
			});
		};

		const onDeleteView = (id) => {
			console.log('CustomTable onDeleteView()', id);

			if (id && activeView === id) {
				//! The currently active view is about to be deleted
				if (currentUser[`${formName}_Default_View`]) {
					//! Fallback to user's default view if available
					setActiveView(currentUser[`${formName}_Default_View`].ID);
				} else {
					//! Fallback to default criteria as last resort
					setActiveView('');
					setReportCriteria(defaultCriteria ? defaultCriteria : '');
				}
			}
			setViews((old) => {
				if (old && Array.isArray(old)) {
					if (id && Array.isArray(id)) {
						return old.filter((o) => o.ID !== id[0]);
					} else if (id) {
						return old.filter((o) => o.ID !== id);
					}
				} else {
					return [];
				}
			});
		};

		//! Active view changed, set the active filters which will trigger a new database query
		useEffect(() => {
			if (activeView) {
				//When an ID is matched to a view in the list, return the criteria from that view
				const _view = views
					.map((v) => (v.ID === activeView ? { ...v } : null))
					.filter((v) => v)[0];

				if (_view.JSON) {
					setActiveFilters(_view.JSON);
				} else {
					setActiveFilters([]);
				}
			} else {
				//TODO temporariliy removing this. On load, this kills some logic
				//setReportCriteria('');
			}
		}, [activeView]);

		//! Active filters changed, trigger database query
		useEffect(() => {
			if (
				activeFilters &&
				Array.isArray(activeFilters) &&
				activeFilters.length > 0
			) {
				if (desktopMode) {
					setTableHeight(
						overrideHeight
							? overrideHeight
							: tabTable
							? tabTableHeight - filterGraphicHeight
							: lineItemTable
							? window.innerHeight -
							  navBarHeight * 3 - //App level AppBar, Form level AppBar, Timeline Toolbar,
							  tabBarHeight * 2 - //App level Tabs, Form level Tabs
							  (hideToolbar ? 0 : toolbarHeight) -
							  tableFooterHeight -
							  padding -
							  margin -
							  filterGraphicHeight -
							  lineItemTableHeightAdjustment
							: lookupFieldTable
							? window.innerHeight -
							  navBarHeight * 2 - //AppBar & BottomBar
							  (hideToolbar ? 0 : toolbarHeight) - //Search Toolbar
							  tableFooterHeight -
							  padding -
							  margin -
							  filterGraphicHeight
							: window.innerHeight -
							  navBarHeight -
							  tabBarHeight - //Search Toolbar
							  (hideToolbar ? 0 : toolbarHeight) -
							  tableFooterHeight -
							  padding -
							  margin -
							  filterGraphicHeight
					);
				} else {
					setTableHeight(
						overrideHeight
							? overrideHeight
							: tabTable
							? tabTableHeight
							: lineItemTable
							? window.innerHeight -
							  navBarHeight * 3 - //App level AppBar, Form level AppBar, Timeline Toolbar,
							  tabBarHeight * 2 - //App level Tabs, Form level Tabs
							  (hideToolbar ? 0 : toolbarHeight) -
							  tableFooterHeight -
							  padding -
							  margin -
							  lineItemTableHeightAdjustment
							: lookupFieldTable
							? window.innerHeight -
							  navBarHeight * 2 - //AppBar & BottomBar
							  (hideToolbar ? 0 : toolbarHeight) - //Search Toolbar
							  tableFooterHeight -
							  padding -
							  margin
							: window.innerHeight -
							  navBarHeight -
							  tabBarHeight - //Search Toolbar
							  (hideToolbar ? 0 : toolbarHeight) -
							  tableFooterHeight -
							  padding -
							  margin
					);
				}

				//TODO If there is an activeView, see if these filters differ from that view. If so, clear out the activeView
				if (activeView) {
					const _view = views
						.map((v) => (v.ID === activeView ? { ...v } : null))
						.filter((v) => v)[0];

					if (
						_view.JSON &&
						JSON.stringify(_view.JSON) !== JSON.stringify(activeFilters)
					) {
						setActiveView(null);
					}
				}

				//Rebuild criteria string from current criteria object
				setReportCriteria(getReportCriteriaFromActiveFilters());
			} else if (
				activeFilters &&
				Array.isArray(activeFilters) &&
				activeFilters.length === 0 &&
				(reportCriteria || reportCriteria === '')
			) {
				//! Need to be careful on this condition to not hit the initial case where length === 0
				setReportCriteria(defaultCriteria ? defaultCriteria : '');
				setActiveView(null);
			}

			if (
				activeFilters &&
				Array.isArray(activeFilters) &&
				activeFilters.length === 0
			) {
				setTableHeight(
					overrideHeight
						? overrideHeight
						: tabTable
						? tabTableHeight
						: lineItemTable
						? window.innerHeight -
						  navBarHeight * 3 - //App level AppBar, Form level AppBar, Timeline Toolbar,
						  tabBarHeight * 2 - //App level Tabs, Form level Tabs
						  (hideToolbar ? 0 : toolbarHeight) -
						  tableFooterHeight -
						  padding -
						  margin -
						  lineItemTableHeightAdjustment
						: lookupFieldTable
						? window.innerHeight -
						  navBarHeight * 2 - //AppBar & BottomBar
						  (hideToolbar ? 0 : toolbarHeight) - //Search Toolbar
						  tableFooterHeight -
						  padding -
						  margin
						: window.innerHeight -
						  navBarHeight -
						  tabBarHeight - //Search Toolbar
						  (hideToolbar ? 0 : toolbarHeight) -
						  tableFooterHeight -
						  padding -
						  margin
				);
			}
		}, [activeFilters, desktopMode]);

		const getReportCriteriaFromActiveFilters = () => {
			const _reportCriteria = activeFilters
				.map((af, index) => {
					if (af.childCriteria && Array.isArray(af.childCriteria)) {
						//! Wrap the current parent index's criteria string
						if (index === 0) {
							// ( parent.criteriaString ${child.condition === 'AND' ? ' && ' : ' OR ' child.criteriaString})
							return `(${af.criteriaString}${af.childCriteria
								.map((childCriteria) =>
									childCriteria.condition === 'AND'
										? ' && '
										: ' || ' + childCriteria.criteriaString
								)
								.join('')})`;
						}

						return `${af.condition === 'AND' ? ' && ' : ' || '}${`(${
							af.criteriaString
						}${af.childCriteria
							.map((childCriteria) =>
								childCriteria.condition === 'AND'
									? ' && '
									: ' || ' + childCriteria.criteriaString
							)
							.join('')})`}`;
					} else {
						if (index === 0) {
							return af.criteriaString;
						}

						return `${af.condition === 'AND' ? ' && ' : ' || '}${
							af.criteriaString
						}`;
					}
				})
				.join('');

			if (_reportCriteria.length > 0) {
				return `${
					defaultCriteria ? `(${defaultCriteria}) && ` : ''
				}(${_reportCriteria})`;
			}
		};

		//Check for views being fetched from the database
		useEffect(() => {
			if (viewDataState.status === 'fetched') {
				let _views = [];

				//When views are fetched, trigger an update to views which
				if (viewDataState.data.length > 0) {
					_views = viewDataState.data.map((v) => {
						if (v.JSON) {
							return { ...v, JSON: JSON.parse(v.JSON) };
						}

						return { ...v };
					});
				} else {
					_views = viewDataState.data;
				}

				//! Added for Dashboard functionality
				if (overrideDefaultView) {
					_views = [..._views, overrideDefaultView];
				}

				setViews(_views);
			}
		}, [viewDataState]);
		//#endregion

		useEffect(() => {
			switch (rowDataState.status) {
				case 'idle':
					break;
				case 'fetching':
					if (
						rowDataState.pageBeingFetched > 1 &&
						!lineItemTable &&
						!tabTable
					) {
						setToastData({
							message: `Fetching page ${rowDataState.pageBeingFetched} of results from the database...`,
							severity: 'info',
						});
					}
					setLoading(true);
					break;
				case 'fetched':
					/*
					if (!lineItemTable && !tabTable) {
						setToastData({
							message: `${rowDataState.data.length} record(s) were fetched from the database!`,
							severity: 'success',
						});
					}
          */

					let formattedData = formatCollapseData(rowDataState.data);
					//console.log('formattedData', formattedData);
					let sortedRows = sortData(formattedData);
					//console.log('sortedRows', sortedRows);
					if (sortedRows.length === 0 && rowDataState.data.length > 0) {
						console.error(
							`The sortData(rowDataState.data) returned 0 results, but ${rowDataState.data.length} record(s) were returned from the database. This is probably because the column definition isn't fully filled out of has an error.`
						);
					}
					if (disableSearch.current) {
						disableSearch.current = false;
					}
					setRows(sortedRows);
					setLoading(false);
					break;
				case 'error':
					if (rowDataState.error) {
						console.error('Zoho err: ', rowDataState.error);
						setToastData({
							message: `Zoho Error: ${rowDataState.error.message}`,
							severity: 'error',
						});
					} else if (!lineItemTable && !tabTable) {
						setToastData({ message: 'No results found!', severity: 'info' });
					}

					setRows(rowDataState.data);
					setLoading(false);
					break;
				default:
					console.error('rowDataState error:', rowDataState);
					break;
			}
		}, [rowDataState]);

		useEffect(() => {
			if (!loading && onChange && rows && Array.isArray(rows)) {
				onChange(rows.filter((row) => row.Selected));
			}

			//console.log('CustomTable.js rows change', rows);

			//Converted this portion of code to update state to not excessively trigger renders
			// if (onLineItemOrderChanged && rows && Array.isArray(rows) && !debug) {
			//   const newOrder = rows
			//     .filter(
			//       (row) => row.Collapsible_Child === "false" || !row.Collapsible_Child
			//     )
			//     .map((row) => row.ID);
			//   setCustomLineItemSortOrder((old) => {
			//     if (old && JSON.stringify(old) !== JSON.stringify(newOrder)) {
			//       return newOrder;
			//     }

			//     return old;
			//   });
			// }

			if (lineItemDispatch) {
				lineItemDispatch({ type: 'ROWS_UPDATE', payload: rows });
			}
		}, [rows]);

		useEffect(() => {
			//Used upon first getting a legitimate props value, and also in the event of a reset
			if (
				customSortOrder &&
				Array.isArray(customSortOrder) &&
				customSortOrder.length > 0
			) {
				setCustomLineItemSortOrder((old) => {
					if (old && JSON.stringify(old) !== JSON.stringify(customSortOrder)) {
						return customSortOrder;
					}

					return old;
				});
			}
		}, [customSortOrder]);

		useEffect(() => {
			if (
				customLineItemSortOrder &&
				Array.isArray(customLineItemSortOrder) &&
				customLineItemSortOrder.length > 0 &&
				onLineItemOrderChanged
			) {
				onLineItemOrderChanged(customLineItemSortOrder);
			}

			if (customLineItemSortOrder) {
				setRows((oldRows) =>
					JSON.stringify(oldRows) !== JSON.stringify(sortData(oldRows))
						? sortData(oldRows)
						: oldRows
				);
			}
		}, [customLineItemSortOrder]);

		const formatCollapseData = (rowData) => {
			if (!Array.isArray(rowData)) {
				return [];
			}

			return rowData
				.filter(
					(row) => row.Collapsible_Child === 'false' || !row.Collapsible_Child
				)
				.map((row) => {
					if (
						row.Collapsible_Parent !== 'false' &&
						row.Collapsible_Parent &&
						Array.isArray(row.Collapsible_Line_Items)
					) {
						return {
							...row,
							Collapsible_Line_Items: row.Collapsible_Line_Items.map(
								(child) => rowData.filter((row) => row.ID === child.ID)[0]
							),
						};
					}

					//row isn't a collapsible child, as such, it shouldn't have any Collapsible_Line_Items
					if (
						row.Collapsible_Line_Items &&
						Array.isArray(row.Collapsible_Line_Items) &&
						row.Collapsible_Line_Items.length > 0
					) {
						return {
							...row,
							Collapsible_Line_Items: '',
						};
					}

					return row;
				})
				.filter((row) => row);
		};

		const onAddAssembly = (priceBookItems, parentData) => {
			//Format childData into a line item from a price book item
			let childData = priceBookItems.map((priceBookItem) => {
				console.log(
					'CustomTable.js onAddAssembly() priceBookItem',
					priceBookItem
				);
				return {
					...omit(priceBookItem, 'ID'),
					[formName.replaceAll('_Line_Item', '')]: parentId,
					Price_Book_Item: priceBookItem.ID,
					Quantity: 0,
					Cost: intTryParse(priceBookItem.Cost)
						? parseFloat(priceBookItem.Cost)
						: 0,
					Cost_Subtotal: 0,
					Cost_Total: 0,
					Sell_Price_Each: intTryParse(priceBookItem.Sell_Price)
						? parseFloat(priceBookItem.Sell_Price)
						: 0,
					Sell_Price_Subtotal: 0,
					Sell_Price_Total: 0,
					Margin: intTryParse(priceBookItem.Sell_Price)
						? ((parseFloat(priceBookItem.Sell_Price) -
								(intTryParse(priceBookItem.Cost)
									? parseFloat(priceBookItem.Cost)
									: 0)) /
								parseFloat(priceBookItem.Sell_Price)) *
						  100
						: 25.0,
					Price_Level_Type: intTryParse(priceBookItem.Sell_Price)
						? 'Custom'
						: 'Preset',
					Discount_Rate: 0,
					Discount_Dollars: 0,
					Collapsible_Parent: false,
					Collapsible_Child: true,
				};
			});

			console.log('CustomTable.js onAddAssembly() childData', childData);

			//Add children to database
			addRecord(formName, childData, (payloadArr) => {
				//If add children successful, add parent to database
				addRecord(
					formName,
					{ ...parentData, Collapsible_Line_Items: payloadArr },
					(response) => {
						//If all operations are successful, update table
						console.log(
							'CustomTable.js onAddAssembly() parentData',
							parentData
						);
						console.log('CustomTable.js onAddAssembly() response', response);
						setRows((oldRows) => [
							...oldRows,
							{
								...parentData,
								...response,
								Collapsible_Line_Items: payloadArr,
								Expanded: true,
							},
						]);

						setWizardOpen(false);
						wizardLineItemData.current = {}; //Reset Wizard Data
					}
				);
			});
		};

		const onAddConfirm = (data) => {
			console.log('onAddConfirm data', data);

			//Dashes within an ID represent a temporary ID from uuidv4
			if (data.ID && !data.ID.includes('-')) {
				updateRecord(reportName, data.ID, data, () => {
					//Update rows
					setRows((oldRows) =>
						oldRows.map((oldRow) =>
							oldRow.ID === data.ID ? { ...oldRow, ...data } : oldRow
						)
					);
					setWizardOpen(false);
					wizardLineItemData.current = {}; //Reset Wizard Data
				});
			} else {
				if (data.Type === 'Assembly') {
					console.log('Adding in Assembly from database', data);

					//Get childRow information from Price Book Items
					const criteria = data.Collapsible_Line_Items.map(
						(child) => `ID == ${child.ID}`
					).join(' || ');
					getAllRecords('Price_Book_Items', criteria).then((priceBookItems) => {
						console.log(
							'CustomTable.js onAddConfirm() priceBookItems',
							priceBookItems
						);
						onAddAssembly(priceBookItems, data);
					});

					//Create records for each childRow with relevant data
				} else {
					addRecord(formName, data, (response) => {
						//Add row
						setRows((oldRows) => [...oldRows, { ...data, ...response }]);
						setWizardOpen(false);
						wizardLineItemData.current = {}; //Reset Wizard Data
					});
				}
			}
		};

		const onAdd = () => {
			if (lineItemTable) {
				setWizard({
					title: 'Add New Line Item',
					activeStep: 0,
					loadData: {},
					onClickFinish: 'onAddConfirm',
				});
				setWizardOpen(true);
			} else {
				setTitle(<ToolbarTitle formName={formName} mode='adding' />);
				formData.current = { ...formData.current, ID: null };
				setFormId(null);
				setFormOpen(true);
			}
		};

		const onAddCommentConfirm = (data) => {
			console.log('onAddComment data', data);

			//Dashes within an ID represent a temporary ID from uuidv4
			if (data.ID && !data.ID.includes('-')) {
				updateRecord(reportName, data.ID, data, () => {
					//Update rows
					setRows((oldRows) =>
						oldRows.map((oldRow) =>
							oldRow.ID === data.ID ? { ...oldRow, ...data } : oldRow
						)
					);
					setWizardOpen(false);
					wizardLineItemData.current = {}; //Reset Wizard Data
				});
			} else {
				addRecord(formName, data, (response) => {
					//Add row
					setRows((oldRows) => [...oldRows, ...[{ ...data, ...response }]]);
					setWizardOpen(false);
					wizardLineItemData.current = {}; //Reset Wizard Data
				});
			}
		};

		const onAddComment = () => {
			setWizard({
				title: 'Add Comment',
				activeStep: 1,
				hideNavigation: true,
				loadData: {
					Type: 'Comment',
					Price_Book_Item: {
						ID: '3860683000009188042',
						display_value: 'Comment',
					},
				},
				onClickFinish: 'onAddCommentConfirm',
			});
			setWizardOpen(true);
		};

		const onEditConfirm = (data) => {
			//Dashes within an ID represent a temporary ID from uuidv4
			if (data.ID && !data.ID.includes('-')) {
				if (
					data.Collapsible_Child === 'true' ||
					data.Collapsible_Child === true
				) {
					//Trigger update on parent within database and row, trigger update on child row
					if (
						rows.filter(
							(row) =>
								Array.isArray(row.Collapsible_Line_Items) &&
								row.Collapsible_Line_Items.filter(
									(childRow) => childRow.ID === data.ID
								).length === 1
						)
					) {
						//Find parentRow
						let parentRow = rows.filter(
							(row) =>
								Array.isArray(row.Collapsible_Line_Items) &&
								row.Collapsible_Line_Items.filter(
									(childRow) => childRow.ID === data.ID
								).length > 0
						)[0];

						//Update parentRow.Collapsible_Line_Items
						parentRow = {
							...parentRow,
							Collapsible_Line_Items: parentRow.Collapsible_Line_Items.map(
								(childRow) => (childRow.ID === data.ID ? data : childRow)
							),
						};

						//Recalculate math to update parent
						parentRow = recalculateCompressedDataSalesTotals(
							parentRow,
							parentRow.Collapsible_Line_Items
						);

						console.log(
							'CustomTable.js onEditConfirm() updateRecord (child)',
							reportName,
							data.ID,
							data
						);

						//Update child row
						updateRecord(reportName, data.ID, data, (success) => {
							console.log(
								'CustomTable.js onEditConfirm() updateRecord (child success)',
								success
							);
							//Child update successful, update parent row
							console.log(
								'CustomTable.js onEditConfirm() updateRecord (parent)',
								reportName,
								parentRow.ID,
								parentRow
							);
							updateRecord(reportName, parentRow.ID, parentRow, (success) => {
								console.log(
									'CustomTable.js onEditConfirm() updateRecord (parent success)',
									success
								);
								//Update parent & child row in table
								setRows((oldRows) =>
									oldRows.map((oldRow) =>
										oldRow.ID === parentRow.ID
											? { ...oldRow, ...parentRow, Expanded: true }
											: oldRow
									)
								);
								setWizardOpen(false);
								wizardLineItemData.current = {}; //Reset Wizard Data
							});
						});
					} else {
						throw new Error(
							'Error: Parent Row containing Child Row ID not found!'
						);
					}
				} else {
					console.log(
						'CustomTable.js onEditConfirm() updateRecord (normal)',
						reportName,
						data.ID,
						data
					);
					updateRecord(reportName, data.ID, data, (success) => {
						console.log(
							'CustomTable.js onEditConfirm() updateRecord (normal success)',
							success
						);
						//Update rows
						setRows((oldRows) =>
							oldRows.map((oldRow) =>
								oldRow.ID === data.ID ? { ...oldRow, ...data } : oldRow
							)
						);
						setWizardOpen(false);
						wizardLineItemData.current = {}; //Reset Wizard Data
					});
				}
			} else {
				addRecord(formName, data, (response) => {
					//Add row
					setRows((oldRows) => [...oldRows, ...[{ ...data, ...response }]]);
					setWizardOpen(false);
					wizardLineItemData.current = {}; //Reset Wizard Data
				});
			}
		};

		const onEdit = () => {
			if (lineItemTable) {
				setWizard({
					title: 'Edit Line Item',
					activeStep: 1,
					hideNavigation: true,
					loadData: selections[0],
					onClickFinish: 'onEditConfirm',
				});
				setWizardOpen(true);
			} else {
				setTitle(
					<ToolbarTitle
						formName={formName}
						recordName={getNameFn(formName, selections[0])}
						mode='editing'
					/>
				);
				formData.current = { ...formData.current, ID: selections[0].ID };
				setFormId(selections[0].ID);
				setFormOpen(true);
			}
		};

		const onDoubleClickConfirm = (data) => {
			//Dashes within an ID represent a temporary ID from uuidv4
			if (data.ID && !data.ID.includes('-')) {
				if (
					data.Collapsible_Child === 'true' ||
					data.Collapsible_Child === true
				) {
					//Trigger update on parent within database and row, trigger update on child row
					if (
						rows.filter(
							(row) =>
								Array.isArray(row.Collapsible_Line_Items) &&
								row.Collapsible_Line_Items.filter(
									(childRow) => childRow.ID === data.ID
								).length === 1
						).length === 1
					) {
						//Find parentRow
						let parentRow = rows.filter(
							(row) =>
								Array.isArray(row.Collapsible_Line_Items) &&
								row.Collapsible_Line_Items.filter(
									(childRow) => childRow.ID === data.ID
								).length === 1
						)[0];

						//Update parentRow.Collapsible_Line_Items
						parentRow = {
							...parentRow,
							Collapsible_Line_Items: parentRow.Collapsible_Line_Items.map(
								(childRow) => (childRow.ID === data.ID ? data : childRow)
							),
						};

						//Recalculate math to update parent
						parentRow = recalculateCompressedDataSalesTotals(
							parentRow,
							parentRow.Collapsible_Line_Items
						);

						console.log(
							'CustomTable.js onDoubleClickConfirm() updateRecord (child)',
							reportName,
							data.ID,
							data
						);
						//Update child row
						updateRecord(reportName, data.ID, data, (success) => {
							console.log(
								'CustomTable.js onDoubleClickConfirm() updateRecord (child success)',
								success
							);
							//Child update successful, update parent row
							console.log(
								'CustomTable.js onDoubleClickConfirm() updateRecord (parent)',
								reportName,
								parentRow.ID,
								parentRow
							);
							updateRecord(reportName, parentRow.ID, parentRow, (success) => {
								console.log(
									'CustomTable.js onDoubleClickConfirm() updateRecord (parent success)',
									success
								);
								//Update parent & child row in table
								setRows((oldRows) =>
									oldRows.map((oldRow) =>
										oldRow.ID === parentRow.ID
											? { ...oldRow, ...parentRow, Expanded: true }
											: oldRow
									)
								);
								setWizardOpen(false);
								wizardLineItemData.current = {}; //Reset Wizard Data
							});
						});
					} else {
						throw new Error(
							'Error: Parent Row containing Child Row ID not found!'
						);
					}
				} else {
					console.log(
						'CustomTable.js onDoubleClickConfirm() updateRecord (normal)',
						reportName,
						data.ID,
						data
					);
					updateRecord(reportName, data.ID, data, (success) => {
						console.log(
							'CustomTable.js onDoubleClickConfirm() updateRecord (normal success)',
							success
						);
						//Update rows
						setRows((oldRows) =>
							oldRows.map((oldRow) =>
								oldRow.ID === data.ID ? { ...oldRow, ...data } : oldRow
							)
						);
						setWizardOpen(false);
						wizardLineItemData.current = {}; //Reset Wizard Data
					});
				}
			} else {
				addRecord(formName, data, (response) => {
					//Add row
					setRows((oldRows) => [...oldRows, ...[{ ...data, ...response }]]);
					setWizardOpen(false);
					wizardLineItemData.current = {}; //Reset Wizard Data
				});
			}
		};

		const onDoubleClick = (row) => {
			if (lineItemTable) {
				setWizard({
					title: 'Edit Line Item',
					activeStep: 1,
					hideNavigation: true,
					loadData: row,
					onClickFinish: 'onDoubleClickConfirm',
				});
				setWizardOpen(true);
			} else {
				//TODO Not sure on implementation here - maybe fn passed in from parent implementation
			}
		};

		const onDelete = () => {
			setConfirmationDialogData({
				title: `Confirm Deletion of ${reportName.replaceAll('_', ' ')}`,
				confirmButtonColor: 'error',
				confirmButtonText: 'Delete',
				children: (
					<Box sx={{ p: 2 }}>
						<Typography>
							Are you sure you want to delete the {selections.length} selected{' '}
							{selections.length === 1
								? formName.replaceAll('_', ' ')
								: reportName.replaceAll('_', ' ')}
							?
						</Typography>
						{getNameFn ? (
							<Box
								sx={{
									mx: 1,
								}}
								component='ul'>
								{selections.map((selection) => (
									<li key={selection.ID}>
										<Typography>{getNameFn(formName, selection)}</Typography>
									</li>
								))}
							</Box>
						) : null}
					</Box>
				),
				onConfirm: () => {
					if (reportName === 'Inventory_Line_Items') {
						setRows((oldRows) => oldRows.filter((oldRow) => !oldRow.Selected));
						setConfirmationDialogOpen(false);
					} else if (lineItemTable) {
						let flatSelectionsArr = [];

						//Check if parent
						selections.forEach((selection) => {
							if (
								(selection.Collapsible_Parent === true ||
									selection.Collapsible_Parent === 'true') &&
								Array.isArray(selection.Collapsible_Line_Items)
							) {
								selection.Collapsible_Line_Items.forEach((child) =>
									flatSelectionsArr.push(child)
								);
							}

							flatSelectionsArr.push(selection); //Always push the parent
						});

						if (!debug) {
							massUpdateRecords(
								reportName,
								flatSelectionsArr.map((selection) => selection.ID),
								{ Deleted: true },
								() => {
									//Remove rows from table
									setRows((oldRows) =>
										oldRows.filter((oldRow) => !oldRow.Selected)
									);
									setConfirmationDialogOpen(false);
								}
							);
						} else {
							console.warn('Debug enabled: simulating record deletion');
							//Remove rows from table
							setRows((oldRows) =>
								oldRows.filter((oldRow) => !oldRow.Selected)
							);
							setConfirmationDialogOpen(false);
						}
					} else {
						if (!debug) {
							//Delete record from database
							deleteRecords(
								reportName,
								selections.map((selection) => selection.ID),
								() => {
									//Remove rows from table
									setRows((oldRows) =>
										oldRows.filter((oldRow) => !oldRow.Selected)
									);
									setConfirmationDialogOpen(false);
								}
							);
						} else {
							console.warn('Debug enabled: simulating record deletion');
							//Remove rows from table
							setRows((oldRows) =>
								oldRows.filter((oldRow) => !oldRow.Selected)
							);
							setConfirmationDialogOpen(false);
						}
					}
				},
			});

			setConfirmationDialogOpen(true);
		};

		const onSearch = (term) => {
			if ((term || term === '') && searchTerm !== term) {
				var formattedSearchArr = [];
				columns.forEach((column) => {
					if (column.type === 'number' && intTryParse(term)) {
						formattedSearchArr = [
							...formattedSearchArr,
							...column.searchKey.map((key) => `${key}=${term}`),
						];
					} else if (column.type !== 'number') {
						formattedSearchArr = [
							...formattedSearchArr,
							...column.searchKey.map((key) => `${key}.contains("${term}")`),
						];
					}
				});

				const formattedSearchTerm = '(' + formattedSearchArr.join(' || ') + ')';
				setSearchTerm(
					`${
						defaultCriteria ? `(${defaultCriteria}) && ` : ''
					}${formattedSearchTerm}`
				);
			}
		};

		useEffect(() => {
			if (searchTerm || searchTerm === '') {
				const _filterCriteria = getReportCriteriaFromActiveFilters();
				if (_filterCriteria) {
					//? There are filter criteria active and a search term
					setReportCriteria(`${_filterCriteria} && ${searchTerm}`);
				} else {
					//? There is only a search term
					setReportCriteria(searchTerm);
				}
			}
		}, [searchTerm, activeFilters]);

		const onMassUpdate = () => {
			setTitle(<ToolbarTitle formName={formName} mode='massUpdating' />);
			setMassUpdating(true);
			setFormOpen(true);
		};

		const onExport = () => {
			const exportData = selections.length > 0 ? selections : rows;
			const exportColumns = visibleColumns.filter(
				(column) => !column.hideSelect
			);
			let merges = []; //{s:{c:COLUMN_INDEX, r:ROW_INDEX}, e:{c:COLUMN_INDEX, r:ROW_INDEX}}

			const filteredExportData = exportData.map((row, index) => {
				let exportRow = {};

				//! Merge row criteria
				if (lineItemTable && row.Type === 'Comment') {
					const firstColumnKey = exportColumns[0].valueKey;
					//Use the Description field's value for this merge row's text
					exportRow[firstColumnKey.replaceAll('_', ' ')] = row.Description;
					//{s:{c:COLUMN_INDEX, r:ROW_INDEX}, e:{c:COLUMN_INDEX, r:ROW_INDEX}}
					merges.push({
						s: { c: 0, r: index + 1 }, //+1 Offset on index is to account for the header row that xlsx adds
						e: { c: exportColumns.length - 1, r: index + 1 },
					});
				} else {
					exportColumns.forEach((exportColumn) => {
						if (Array.isArray(row[exportColumn.valueKey])) {
							row[exportColumn.valueKey]
								.map((cellValue) => {
									if (typeof cellValue === 'object') {
										return cellValue.display_value;
									}
									return cellValue;
								})
								.join(', ');
						} else if (
							typeof row[exportColumn.valueKey] === 'object' &&
							exportColumn.type !== 'file'
						) {
							return row[exportColumn.valueKey].display_value;
						}

						exportRow[exportColumn.valueKey.replaceAll('_', ' ')] =
							exportColumn.exportFormat
								? exportColumn.exportFormat(row[exportColumn.valueKey])
								: exportColumn.format
								? exportColumn.format(row[exportColumn.valueKey])
								: row[exportColumn.valueKey];
					});
				}

				return exportRow;
			});

			exportToXlsx(
				filteredExportData,
				exportFilename,
				merges.length > 0 ? merges : null
			);
			//exportHtmlTable(tableRef, 'HTML testing');
		};

		const onDuplicate = (data) => {
			let _dupeData = [];
			for (let i = 1; i < data.Quantity; i++) {
				_dupeData.push({
					Form: formName,
					Account: data.Account,
					Reference: data.Reference,
					Source_Record_ID: data.ID,
				});
			}

			console.log('onDuplicate _dupeData', _dupeData);
			setToastData({
				message: 'Duplication log is untested - talk to Matt! Returning...',
			});

			return;
			duplicateRecord('Duplication_Requests', _dupeData, (successes) => {
				const _successes = successes.map(
					({ Result_Record_ID, Result_Record_Name }, i) => ({
						uuid: uuid(),
						label: `${formName?.replaceAll('_', ' ')}: ${getNameFn(
							formName,
							Result_Record_Name
						)}`,
						type: 'form',
						id: Result_Record_ID,
						name: formName,
						active: i === successes.length - 1,
					})
				);
				setApplicationTabs((old) => [
					...old.map((o) => ({ ...o, active: false })),
					..._successes,
				]);
			});
		};

		const onFilterClose = (data, parentIndex) => {
			if (parentIndex || parentIndex === 0) {
				setActiveFilters((old) =>
					old.map((o, i) => {
						if (i !== parentIndex) {
							return o;
						}

						return {
							...o,
							childCriteria: o.childCriteria.filter(
								(c) => c.criteriaString !== data.criteriaString
							),
						};
					})
				);
			} else {
				setActiveFilters((old) =>
					old.filter((o) => o.criteriaString !== data.criteriaString)
				);
			}
		};

		const onFilterClearAll = () => {
			deselectAllRows();
			setActiveFilters([]);
		};

		const deselectAllRows = () => {
			if (selections.length > 0) {
				setRows((oldRows) =>
					oldRows.map((oldRow) =>
						oldRow.Selected ? { ...oldRow, Selected: false } : oldRow
					)
				);
			}
		};

		const onFilterChipClick = () => {
			setOpenFilterDrawer(true);

			setTimeout(() => {
				setOpenFilterDrawer(false);
			}, 10);
		};

		const onSelectAll = (e) => {
			if (e.target.checked) {
				setRows((old) =>
					old.map((row) => (row.Selected ? row : { ...row, Selected: true }))
				);
				return;
			}
			setRows((old) =>
				old.map((row) => (!row.Selected ? row : { ...row, Selected: false }))
			);
		};

		//! Sorting
		useEffect(() => {
			if (rows.length > 0) {
				setRows(sortData(rows));
			}
		}, [sortDirection, sortColumnKey]); //removed customSortOrder

		const columnCount = () => {
			//! Always show a checkbox and a column for the column selected, so offset by +2
			let baseCount = columns.filter((col) => col.visible).length + 2;

			if (enableCollapseRows) {
				//Column with expand more icon
				baseCount++;
			}

			if (enableClickToSelect && enableDragReorder) {
				//Need the column with grab icon
				baseCount++;
			}

			return baseCount;
		};

		//? Default sort direction is set in <CustomTableColumnHeader /> - this section has no bearing on default sorting
		const onColumnSort = (property) => {
			const isAsc = sortColumnKey === property && sortDirection === 'asc';
			setSortDirection(isAsc ? 'desc' : 'asc'); //Requested column is already sorted by desc, toggle to desc
			setSortColumnKey(property);
		};

		const sortData = (rows) => {
			let temp = [];

			if (
				rows.length > 0 &&
				!disableSort &&
				columns.filter((column) => column.valueKey === sortColumnKey).length > 0
			) {
				//! Matching column to sort key
				const column = columns.filter(
					(column) => column.valueKey === sortColumnKey
				)[0];

				if (column.type === 'number') {
					if (sortDirection === 'asc') {
						temp = rows.slice().sort((a, b) => {
							return parseFloat(a[sortColumnKey] || 0) >
								parseFloat(b[sortColumnKey] || 0)
								? 1
								: parseFloat(a[sortColumnKey] || 0) <
								  parseFloat(b[sortColumnKey] || 0)
								? -1
								: 0;
						});
					} else {
						temp = rows.slice().sort((a, b) => {
							return parseFloat(a[sortColumnKey] || 0) <
								parseFloat(b[sortColumnKey] || 0)
								? 1
								: parseFloat(a[sortColumnKey] || 0) >
								  parseFloat(b[sortColumnKey] || 0)
								? -1
								: 0;
						});
					}
				} else if (column.type === 'date') {
					//Format MM/DD/YYYY convert to YYYYMMDD
					const formatDate = (mmDdYyyy) => {
						if (mmDdYyyy) {
							const month = mmDdYyyy.split('/')[0];
							const day = mmDdYyyy.split('/')[1];
							const year = mmDdYyyy.split('/')[2];

							return year + month + day;
						}
					};

					if (sortDirection === 'asc') {
						temp = rows.slice().sort(function (a, b) {
							const tempA = formatDate(a[sortColumnKey]);
							const tempB = formatDate(b[sortColumnKey]);

							return tempA > tempB ? 1 : tempA < tempB ? -1 : 0;
						});
					} else {
						temp = rows.slice().sort(function (a, b) {
							const tempA = formatDate(a[sortColumnKey]);
							const tempB = formatDate(b[sortColumnKey]);

							return tempA < tempB ? 1 : tempA > tempB ? -1 : 0;
						});
					}
				} else if (column.type === 'dateTime') {
					//Format as Date()
					const formatDate = (data) => {
						return new Date(data ? data : '01/01/1970 12:00 AM');
					};

					if (sortDirection === 'asc') {
						temp = rows.slice().sort(function (a, b) {
							const dateA = formatDate(a[sortColumnKey]);
							const dateB = formatDate(b[sortColumnKey]);

							return dateA - dateB;
						});
					} else {
						temp = rows.slice().sort(function (a, b) {
							const dateA = formatDate(a[sortColumnKey]);
							const dateB = formatDate(b[sortColumnKey]);

							return dateB - dateA;
						});
					}
				} else if (column.type === 'time') {
					//Format as Date()
					const formatDate = (data) => {
						return new Date(data ? data : '12:00 AM');
					};

					if (sortDirection === 'asc') {
						temp = rows.slice().sort(function (a, b) {
							const dateA = formatDate(a[sortColumnKey]);
							const dateB = formatDate(b[sortColumnKey]);

							return dateA - dateB;
						});
					} else {
						temp = rows.slice().sort(function (a, b) {
							const dateA = formatDate(a[sortColumnKey]);
							const dateB = formatDate(b[sortColumnKey]);

							return dateB - dateA;
						});
					}
				} else if (column.type === 'string') {
					if (sortDirection === 'asc') {
						temp = rows.slice().sort((a, b) => {
							if (typeof a[sortColumnKey] === 'object') {
								return a[sortColumnKey].display_value >
									b[sortColumnKey].display_value
									? 1
									: a[sortColumnKey].display_value <
									  b[sortColumnKey].display_value
									? -1
									: 0;
							}

							return a[sortColumnKey] > b[sortColumnKey]
								? 1
								: a[sortColumnKey] < b[sortColumnKey]
								? -1
								: 0;
						});
					} else {
						temp = rows.slice().sort((a, b) => {
							if (typeof a[sortColumnKey] === 'object') {
								return a[sortColumnKey].display_value <
									b[sortColumnKey].display_value
									? 1
									: a[sortColumnKey].display_value >
									  b[sortColumnKey].display_value
									? -1
									: 0;
							}

							return a[sortColumnKey] < b[sortColumnKey]
								? 1
								: a[sortColumnKey] > b[sortColumnKey]
								? -1
								: 0;
						});
					}
				} else {
					console.log(`sorting by UNMATCHED column.type: ${column.type}`);
				}

				return [
					...temp.filter((row) => row.Selected),
					...temp.filter((row) => !row.Selected),
				];
			} else if (
				rows.length > 0 &&
				customLineItemSortOrder &&
				Array.isArray(customLineItemSortOrder) &&
				customLineItemSortOrder.length > 0
			) {
				temp = rows.slice().sort((a, b) => {
					return customLineItemSortOrder.indexOf(a.ID) >
						customLineItemSortOrder.indexOf(b.ID)
						? 1
						: customLineItemSortOrder.indexOf(a.ID) <
						  customLineItemSortOrder.indexOf(b.ID)
						? -1
						: 0;
				});
				console.log('sortData temp', temp);
				return temp;
			}

			return rows;
		};

		const onDragReorderDropRow = (result) => {
			// dropped outside the list
			if (!result.destination) {
				return;
			}

			const reorder = (list, startIndex, endIndex) => {
				var result = Array.from(list);
				const [removed] = result.splice(startIndex, 1);
				result.splice(endIndex, 0, removed);
				return result;
			};

			setRows(reorder(rows, result.source.index, result.destination.index));
		};

		//TODO Intial attempt at opening a default record
		useEffect(() => {
			if (recordId) {
				setTitle(
					<ToolbarTitle
						formName={formName}
						recordName={getNameFn(formName, selections[0])}
						mode='editing'
					/>
				);
				formData.current = { ...formData.current, ID: recordId };
				setFormId(recordId);
				setFormOpen(true);
			}
		}, [recordId]);

		const onClick = (row) => {
			if (getNameFn) {
				setTitle(getNameFn(formName, row));
			}
			setTitle(
				<ToolbarTitle
					formName={formName}
					recordName={getNameFn(formName, row)}
					mode='editing'
				/>
			);
			formData.current = { ...formData.current, ID: row.ID };
			setFormId(row.ID);
			setFormOpen(true);
		};

		const onFormClose = () => {
			formData.current = { ...formData.current, Selected: false };
			if (formData.current.ID) {
				if (rows.filter((row) => row.ID === formData.current.ID).length === 0) {
					console.log('CustomTable onFormSave, prepending:', formData.current);

					//Prepend
					setRows((old) => [formData.current, ...old]);
				} else {
					console.log(
						'CustomTable onFormSave, updating existing:',
						formData.current
					);
					//Update Existing
					setRows((old) =>
						old.map((row) =>
							row.ID === formData.current.ID
								? { ...row, ...formData.current }
								: row
						)
					);
				}
			}

			//Update rows and reset useRef
			formData.current = {};

			setFormOpen(false);
			setTitle(null);
			setFormId(null);
			setMassUpdating(false);
		};

		const onFormSave = (data) => {
			//If the current data didn't have an ID and now does, update the record title
			if (!formData.current.ID && data.ID) {
				setTitle(
					<ToolbarTitle
						formName={formName}
						recordName={getNameFn(formName, data)}
						mode='editing'
					/>
				);
			}
			formData.current = data;

			// if (rows.filter((row) => row.ID === data.ID).length === 0) {
			// 	console.log('CustomTable onFormSave, prepending:', data);

			// 	//Prepend
			// 	setRows((old) => [data, ...old]);
			// } else {
			// 	console.log('CustomTable onFormSave, updating existing:', data);
			// 	//Update Existing

			// 	setRows((old) =>
			// 		old.map((row) => (row.ID === data.ID ? { ...row, ...data } : row))
			// 	);
			// }
		};

		//#region //! Shift controls
		const onShiftTop = () => {
			const selectionIndexes = rows
				.map((row, i) => (row.Selected ? i : null))
				.filter((i) => i === 0 || i);
			const result = Array.from(rows);
			selectionIndexes.forEach((selectedIndex, i) => {
				const newIndex = i;
				if (newIndex >= 0 && !result[newIndex].Selected) {
					const [removedRow] = result.splice(selectedIndex, 1);
					result.splice(newIndex, 0, removedRow);
				}
			});
			setRows(result);
		};

		const onShiftUp = () => {
			const selectionIndexes = rows
				.map((row, i) => (row.Selected ? i : null))
				.filter((i) => i === 0 || i);
			const result = Array.from(rows);
			selectionIndexes.forEach((selectedIndex) => {
				const newIndex = selectedIndex - 1;
				if (newIndex >= 0 && !result[newIndex].Selected) {
					const [removedRow] = result.splice(selectedIndex, 1);
					result.splice(newIndex, 0, removedRow);
				}
			});
			setRows(result);
		};

		const onShiftDown = () => {
			const selectionIndexes = rows
				.map((row, i) => (row.Selected ? i : null))
				.filter((i) => i === 0 || i);
			const result = Array.from(rows);
			selectionIndexes.forEach((selectedIndex) => {
				const newIndex = selectedIndex + 1;
				if (newIndex <= result.length - 1 && !result[newIndex].Selected) {
					const [removedRow] = result.splice(selectedIndex, 1);
					result.splice(newIndex, 0, removedRow);
				}
			});
			setRows(result);
		};

		const onShiftBottom = () => {
			const selectionIndexes = rows
				.map((row, i) => (row.Selected ? i : null))
				.filter((i) => i === 0 || i);
			const result = Array.from(rows);
			selectionIndexes.reverse().forEach((selectedIndex, i) => {
				const newIndex = result.length - 1 - i;
				if (newIndex <= result.length - 1 && !result[newIndex].Selected) {
					const [removedRow] = result.splice(selectedIndex, 1);
					result.splice(newIndex, 0, removedRow);
				}
			});
			setRows(result);
		};
		//#endregion

		//#region //! Expand/Collapse Controls
		useEffect(() => {
			//console.log('CustomTable.js saveState changed: ', saveState);
			switch (saveState.status) {
				case 'saved':
					if (saveState.onSuccess) {
						saveState.onSuccess(saveState.savedData.ID);
					}

					break;
				case 'deleted':
					if (saveState.onSuccess) {
						saveState.onSuccess();
					}
					break;
			}
		}, [saveState]);

		// useEffect(() => {
		// 	if (confirmationDialogData) {
		// 		console.log('confirmationDialogData', confirmationDialogData);

		// 		if (
		// 			confirmationDialogData.title === 'Compress Line Items Into Assembly'
		// 		) {
		// 			if (
		// 				!confirmationDialogData.Name ||
		// 				!confirmationDialogData.Description
		// 			) {
		// 				setConfirmationDialogData((old) =>
		// 					old.disableConfirmationButton
		// 						? old
		// 						: {
		// 								...old,
		// 								disableConfirmationButton: true,
		// 						  }
		// 				);
		// 			} else {
		// 				setConfirmationDialogData((old) =>
		// 					!old.disableConfirmationButton
		// 						? old
		// 						: {
		// 								...old,
		// 								disableConfirmationButton: false,
		// 								onConfirm: onCompressConfirm,
		// 						  }
		// 				);
		// 			}
		// 		}
		// 	}
		// }, [confirmationDialogData]);

		const onCompressConfirm = (parentData, { childData, childDataIds }) => {
			massUpdateRecords(
				reportName,
				childData.map((child) => child.ID),
				{
					Collapsible_Child: true,
					Collapsible_Parent: false,
					Collapsible_Line_Items: '',
				},
				() => {
					//Add Parent
					addRecord(formName, parentData, (parentRecordId) => {
						setRows((oldRows) => [
							...oldRows.filter((row) => !childDataIds.includes(row.ID)),
							{ ...parentData, ID: parentRecordId.ID, Selected: false },
						]);
						//setConfirmationDialogData({});
						setWizardOpen(false);
					});
				}
			);
		};

		const onCompress = () => {
			const childData = selections.filter(
				(selection) =>
					(selection.Collapsible_Parent === 'false' ||
						selection.Collapsible_Parent === false) &&
					selection.Type !== 'Comment'
			);

			setWizard({
				title: 'Compress Selected Line Items into an Assembly',
				activeStep: 1,
				hideNavigation: true,
				loadData: {
					Type: 'Assembly',
					Price_Book_Item: customAssemblyLineItemId,
					Quantity: 1,
					Cost: sum(childData, 'Cost_Total'),
					Margin: marginCalc(childData) * 100,
					Price_Level_Type: 'Custom',
					Collapsible_Parent: true,
					Collapsible_Child: false,
					Collapsible_Line_Items: childData,
				},
				childData,
				childDataIds: childData.map((child) => child.ID),
				onClickFinish: 'onCompressConfirm',
			});
			setWizardOpen(true);
		};

		const onExpand = () => {
			//Grab Collapsible_Line_Items for the selection
			const childDataArr = rows
				.filter(
					(row) =>
						(row.Collapsible_Parent === 'true' ||
							row.Collapsible_Parent === true) &&
						row.Selected
				)
				.map((row) =>
					row.Collapsible_Line_Items.map((childRow) => ({
						...childRow,
						Selected: false,
						Collapsible_Child: false,
						Collapsible_Parent: false,
					}))
				);

			var childData = [];
			childDataArr.forEach((arr) => arr.forEach((row) => childData.push(row)));

			const childDataIds = childData.map((child) => child.ID);
			const parentData = rows.filter(
				(row) =>
					(row.Collapsible_Parent === 'true' ||
						row.Collapsible_Parent === true) &&
					row.Selected
			);

			const parentDataIds = parentData.map((row) => row.ID);

			//Update Children
			massUpdateRecords(
				reportName,
				childDataIds,
				{
					Collapsible_Child: false,
					Collapsible_Parent: false,
				},
				() => {
					//Delete parent line item(s) and append children to end of rows
					deleteRecords(reportName, parentDataIds, () =>
						setRows((oldRows) => [
							...oldRows.filter((row) => !parentDataIds.includes(row.ID)),
							...childData,
						])
					);
				}
			);
		};

		const canExpand = (rows) => {
			let canExpand = false;

			rows.forEach((row) => {
				if (row.Collapsible_Parent !== 'false' && row.Collapsible_Parent) {
					canExpand = true;
				}
			});

			return canExpand;
		};

		const canCompress = (rows) => {
			const compressableRows = rows
				.map(
					(row) =>
						(row.Collapsible_Parent === 'false' || !row.Collapsible_Parent) &&
						row.Type !== 'Comment'
				)
				.filter((row) => row);

			//make sure there are at least 2 compressable rows
			return compressableRows.length > 1;
		};

		//#endregion

		//#region //! Right click menu for selections
		const handleContextMenu = (e) => {
			e.preventDefault();
			setContextMenu(
				contextMenu === null
					? {
							mouseX: e.clientX - 2,
							mouseY: e.clientY - 4,
					  }
					: // repeated contextmenu when it is already open closes it with Chrome 84 on Ubuntu
					  // Other native context menus might behave different.
					  // With this behavior we prevent contextmenu from the backdrop to re-locale existing context menus.
					  null
			);
		};

		const handleContextMenuClose = (menuItem) => {
			if (menuItem.onClick) menuItem.onClick();
			setContextMenu(null);
		};

		const menuItems = [
			{
				label: 'Edit in New Tabs',
				icon: <Edit />,
				onClick: () => {
					const _selections = selections.map((selection, i) => ({
						uuid: uuid(),
						label: `${formName?.replaceAll('_', ' ')}: ${getNameFn(
							formName,
							selection
						)}`,
						type: 'form',
						id: selection.ID,
						name: formName,
						loadData: selection,
						active: i === selections.length - 1,
					}));
					setApplicationTabs((old) => [
						...old.map((o) => ({ ...o, active: false })),
						..._selections,
					]);
				},
			},
		];

		//#endregion

		return (
			<>
				<Box sx={{ p: 1, my: 1, position: 'relative' }} ref={formMaxHeightRef}>
					{!hideToolbar ? (
						<CustomTableToolbar
							formName={formName}
							numSelected={selections.length}
							selections={selections}
							searching={rowDataState.status === 'fetching' ? true : false}
							disableSearch={disableSearch.current}
							enableAdd={enableAdd}
							onAdd={onAdd}
							enableEdit={enableEdit}
							onEdit={onEdit}
							enableDelete={enableDelete}
							onDelete={onDelete}
							enableSearch={enableSearch}
							onSearch={onSearch}
							enableMassUpdate={enableMassUpdate}
							onMassUpdate={onMassUpdate}
							enableExport={enableExport}
							onExport={onExport}
							disableExport={rows.length === 0}
							disableDuplicate={selections.length !== 1}
							showDuplicate={showDuplicate}
							onDuplicate={onDuplicate}
							disableFilters={disableFilters}
							FilterManager={
								<CustomTableFilterManager
									loading={loading}
									formName={formName}
									columns={columns}
									onAddView={onAddView}
									onDeleteView={onDeleteView}
									views={views}
									setViews={setViews}
									activeView={activeView}
									setActiveView={setActiveView}
									activeFilters={activeFilters}
									setActiveFilters={setActiveFilters}
									edit={openFilterDrawer}
									overrideDialogZindex={overrideDialogZindex}
								/>
							}
							enableShiftControls={enableShiftControls}
							onShiftTop={onShiftTop}
							onShiftUp={onShiftUp}
							onShiftDown={onShiftDown}
							onShiftBottom={onShiftBottom}
							enableAssemblyControls={enableAssemblyControls}
							onCompress={onCompress}
							onExpand={onExpand}
							disableCompress={lineItemTable && !canCompress(selections)}
							disableExpand={lineItemTable && !canExpand(selections)}
							enableAddComment={enableAddComment}
							onAddComment={onAddComment}
						/>
					) : null}
					{activeFilters.length > 0 ? (
						<CustomTableFilterGraphic
							loading={loading}
							onFilterClick={onFilterChipClick}
							onFilterClose={onFilterClose}
							activeFilters={activeFilters}
							onFilterClearAll={onFilterClearAll}
						/>
					) : null}

					<TableContainer sx={{ height: tableHeight }}>
						<Table
							sx={{ minWidth: 750 }}
							stickyHeader
							size='small'
							ref={tableRef}>
							<CustomTableColumnHeader
								columns={columns}
								setColumns={setColumns}
								rowCount={rows.length}
								numSelected={
									rows && Array.isArray(rows)
										? rows.filter((row) => row.Selected).length
										: 0
								}
								sortDirection={sortDirection}
								sortColumnKey={sortColumnKey}
								onSelectAll={onSelectAll}
								onColumnSort={onColumnSort}
								disableSort={disableSort}
								enableDragReorder={enableDragReorder}
								enableCollapseRows={enableCollapseRows}
								enableSingleSelect={enableSingleSelect}
								enableClickToSelect={enableClickToSelect}
							/>

							<DragDropContext onDragEnd={onDragReorderDropRow}>
								<Droppable droppableId='table'>
									{(provided) => (
										<TableBody
											ref={provided.innerRef}
											{...provided.droppableProps}
											onContextMenu={
												selections.length === 0
													? null
													: (e) => handleContextMenu(e)
											}>
											{loading ? (
												<TableRow>
													<TableCell colSpan={columnCount()}>
														<LinearProgress color='secondary' />
													</TableCell>
												</TableRow>
											) : rows.length > 0 ? (
												<CustomTableRowWrapper
													formName={formName}
													reportName={reportName}
													rows={rows}
													setRows={setRows}
													columns={columns}
													enableSingleSelect={enableSingleSelect}
													enableClickToSelect={enableClickToSelect}
													enableCollapseRows={enableCollapseRows}
													enableDragReorder={enableDragReorder}
													enableContextMenu={enableContextMenu}
													onClick={onClick}
													onDoubleClick={onDoubleClick}
													getNameFn={getNameFn ? getNameFn : null}
												/>
											) : (
												<TableRow>
													<TableCell
														colSpan={columnCount()}
														sx={{ borderBottom: 'none' }}>
														<Box
															sx={{
																width: '100%',
																display: 'flex',
																flexDirection: 'column',
																alignItems: 'center',
															}}>
															<Box
																sx={{
																	display: 'flex',
																	alignItems: 'center',
																	mt: 2,
																}}>
																<SearchOff
																	sx={{ fontSize: 60, mx: 2 }}
																	color='secondary'
																/>
																<Typography
																	sx={{
																		color: 'secondary.main',
																		fontSize: '40px',
																	}}>
																	Sorry, no results found! :(
																</Typography>
															</Box>
															{currentUser.Admin === true ||
															currentUser.Admin === 'true' ? (
																<Typography sx={{ py: 2, color: 'info.light' }}>
																	Current criteria: {reportCriteria}
																</Typography>
															) : null}
														</Box>
													</TableCell>
												</TableRow>
											)}

											{emptyRows > 0 && (
												<TableRow style={{ height: 33 * emptyRows }}>
													<TableCell colSpan={columnCount()} />
												</TableRow>
											)}
											{provided.placeholder}
										</TableBody>
									)}
								</Droppable>
							</DragDropContext>
						</Table>
					</TableContainer>

					<Accordion
						sx={{
							pointerEvents: lineItemDataState ? 'auto' : 'none',
							'&:before': { visibility: 'hidden' },
							'&.Mui-expanded': { my: 0 },
						}}
						expanded={lineItemTableDetailsExpanded}
						onChange={() => {
							setLineItemTableDetailsExpanded((old) => !old);
							setTimeout(() => {
								scrollBottomRef.current.scrollIntoView({
									behavior: 'smooth',
								});
							}, 350);
						}}>
						<AccordionSummary sx={{ height: '28px' }}>
							{lineItemDataState ? (
								<DetailsFooter
									state={lineItemDataState}
									dispatch={lineItemDispatch}
									expanded={lineItemTableDetailsExpanded}
								/>
							) : (
								<Box
									sx={{
										width: '100%',
										display: 'flex',
										justifyContent: 'space-between',
										alignItems: 'center',
									}}>
									<Typography
										sx={{ color: 'text.primary', fontWeight: 'bold' }}
										variant='subtitle1'>
										{selections.length > 0
											? `${selections.length} selected`
											: loading
											? 'Retrieving data from the database...'
											: `${rows.length} records retrieved`}
									</Typography>
								</Box>
							)}
						</AccordionSummary>
						<AccordionDetails>
							{lineItemDataState ? (
								<DetailsFooterAccordion
									state={lineItemDataState}
									dispatch={lineItemDispatch}
								/>
							) : null}
						</AccordionDetails>
					</Accordion>
					{/* <Fade
						in={formOpen && !lineItemTable}
						container={formContainerRef.current}>
						<Box
							sx={{
								position: 'absolute',
								top: 0,
								ml: -1,
								height: '100%',
								width: '100%',
								zIndex: 10,
								overflow: 'hidden',
								backgroundColor: (theme) =>
									theme.palette.mode === 'dark'
										? 'rgba(0,0,0,0.75)'
										: 'rgba(0,0,0,0.5)',
								display: 'flex',
								justifyContent: 'flex-end',
							}}
							onClick={onFormClose}
							ref={formContainerRef}>
							<Slide
								in={formOpen && !lineItemTable}
								direction='left'
								container={formContainerRef.current}
								mountOnEnter
								unmountOnExit>
								<Box
									sx={{
										height: '100%',
										width: massUpdating ? '60%' : '92.5%',
										backgroundColor: 'background.default',
									}}
									onClick={(e) => e.stopPropagation()}>
									<AppBar
										color={'primary'}
										enableColorOnDark
										position='relative'>
										<Toolbar
											sx={{
												minHeight: { xs: navBarHeight },
												px: { xs: 1 },
												justifyContent: 'space-between',
											}}>
											{title ? title : <Box></Box>}
											<IconButton onClick={onFormClose} color='inherit'>
												<Close />
											</IconButton>
										</Toolbar>
									</AppBar>
									<RenderForm
										id={formId}
										formName={formName}
										loadData={onAddFormData}
										onChange={onFormSave}
										massUpdating={formOpen && massUpdating}
										massUpdateRecordIds={selections.map(
											(selection) => selection.ID
										)}
										maxHeight={
											formMaxHeightRef?.current?.clientHeight
												? formMaxHeightRef?.current?.clientHeight - navBarHeight
												: formMaxHeightRef?.current?.clientHeight
										}
									/>
								</Box>
							</Slide>
						</Box>
					</Fade> */}

					<Box ref={scrollBottomRef}></Box>
				</Box>

				<RenderPopup
					open={formOpen && !lineItemTable}
					onClose={onFormClose}
					title={title ? title : <Box></Box>}>
					<RenderForm
						id={formId}
						formName={formName}
						loadData={onAddFormData}
						onChange={onFormSave}
						massUpdating={formOpen && massUpdating}
						massUpdateRecordIds={selections.map((selection) => selection.ID)}
						maxHeight={
							formMaxHeightRef?.current?.clientHeight
								? formMaxHeightRef?.current?.clientHeight - navBarHeight
								: formMaxHeightRef?.current?.clientHeight
						}
					/>
				</RenderPopup>

				{lineItemTable ? (
					<WizardDialog
						title={wizard.title || 'wizard.title not defined'}
						hideContentPaperBackground
						overrideDialogZindex
						open={wizardOpen}
						hideNavigation={wizard.hideNavigation}
						onClose={() => {
							setWizardOpen(false);
							wizardLineItemData.current = {};
						}}
						activeStep={wizard.activeStep}
						overrideDisableNext={
							wizard.activeStep === 0 &&
							(!wizard.loadData || wizard.loadData.length === 0)
						}
						overrideDisableFinish={wizard.overrideDisableFinish}
						setActiveStep={(e) =>
							setWizard((old) => ({ ...old, activeStep: e }))
						}
						onClickFinish={() => {
							switch (wizard.onClickFinish) {
								case 'onAddConfirm':
									onAddConfirm(wizardLineItemData.current, wizard);
									break;
								case 'onDoubleClickConfirm':
									onDoubleClickConfirm(wizardLineItemData.current);
									break;
								case 'onCompressConfirm':
									onCompressConfirm(wizardLineItemData.current, wizard);
									break;
								case 'onAddCommentConfirm':
									onAddCommentConfirm(wizardLineItemData.current);
									break;
								case 'onEditConfirm':
									onEditConfirm(wizardLineItemData.current);
									break;
							}
						}}>
						{reportName === 'Inventory_Adjustment_Line_Items' ? (
							<WizardStep title='Select a Warehouse Stock Item'>
								<Container maxWidth='xl' disableGutters>
									<Paper elevation={3}>
										<CustomTable
											overrideHeight={
												desktopMode
													? window.innerHeight - 500
													: window.innerHeight -
													  navBarHeight -
													  tabBarHeight -
													  12 -
													  padding -
													  32 -
													  64 -
													  8 -
													  28 -
													  margin -
													  64
											}
											formName='Warehouse_Stock_Item'
											defaultSortByColumn='Name'
											defaultSortDirection='desc'
											enableClickToSelect
											enableContextMenu
											enableSingleSelect
											onChange={(warehouseStockItemData) =>
												setWizard((old) => ({
													...old,
													activeStep: warehouseStockItemData.length
														? old.activeStep + 1
														: old.activeStep,
													loadData:
														warehouseStockItemData.length > 0
															? {
																	...omit(warehouseStockItemData[0], 'ID'),
																	Warehouse_Stock_Item:
																		warehouseStockItemData[0].ID,
															  }
															: {},
												}))
											}
											//overrideDialogZindex
										/>
									</Paper>
								</Container>
							</WizardStep>
						) : reportName === 'Purchase_Receive_Line_Items' ? (
							<WizardStep title='Select a Purchase Order Line Item'>
								<Container maxWidth='xl' disableGutters>
									<Paper elevation={3}>
										<CustomTable
											overrideHeight={
												desktopMode
													? window.innerHeight - 500
													: window.innerHeight -
													  navBarHeight -
													  tabBarHeight -
													  12 -
													  padding -
													  32 -
													  64 -
													  8 -
													  28 -
													  margin -
													  64
											}
											formName='Purchase_Order_Line_Item'
											defaultCriteria={lineItemDefaultCriteria}
											defaultSortByColumn='Name'
											defaultSortDirection='desc'
											enableClickToSelect
											enableContextMenu
											//enableSingleSelect
											onChange={(purchaseOrderLineItemData) =>
												setWizard((old) => ({
													...old,
													activeStep: purchaseOrderLineItemData.length
														? old.activeStep + 1
														: old.activeStep,
													loadData: purchaseOrderLineItemData, //Bit different than the others, sending array of selections in
												}))
											}
											overrideDialogZindex
										/>
									</Paper>
								</Container>
							</WizardStep>
						) : (
							<WizardStep title='Select a Price Book Item'>
								<PriceBookItemReport
									maxHeight={600}
									variant='lookupField'
									onChange={(priceBookItemData) =>
										setWizard((old) => ({
											...old,
											activeStep: priceBookItemData.length
												? old.activeStep + 1
												: old.activeStep,
											loadData:
												priceBookItemData.length > 0
													? {
															...omit(priceBookItemData[0], 'ID'),
															Price_Book_Item: priceBookItemData[0].ID,
													  }
													: {},
										}))
									}
								/>

								{/* <Container maxWidth='xl' disableGutters>
									<Paper elevation={3}>
										<CustomTable
											overrideHeight={
												desktopMode
													? window.innerHeight - 500
													: window.innerHeight -
													  navBarHeight -
													  tabBarHeight -
													  12 -
													  padding -
													  32 -
													  64 -
													  8 -
													  28 -
													  margin -
													  64
											}
											formName='Price_Book_Item'
											defaultSortByColumn='Name'
											defaultSortDirection='desc'
											enableClickToSelect
											enableContextMenu
											enableSingleSelect
											onChange={(priceBookItemData) =>
												setWizard((old) => ({
													...old,
													activeStep: priceBookItemData.length
														? old.activeStep + 1
														: old.activeStep,
													loadData:
														priceBookItemData.length > 0
															? {
																	...omit(priceBookItemData[0], 'ID'),
																	Price_Book_Item: priceBookItemData[0].ID,
															  }
															: {},
												}))
											}
											overrideDialogZindex
										/>
									</Paper>
								</Container> */}
							</WizardStep>
						)}
						<WizardStep title='Edit Details' disablePadding>
							{reportName === 'Quote_Line_Items' ? (
								<QuoteLineItemForm2
									formName='Quote_Line_Item'
									resource={getRecordByIdSuspense('Quote_Line_Items', null)}
									loadData={wizard.loadData}
									onChange={(e) => {
										//console.log('Wizard data onChange', e);
										wizardLineItemData.current = {
											...e,
											[formName.replaceAll('_Line_Item', '')]: parentId,
										}; //Any data forced to be a part of database save/add
									}}
									hasError={(hasError) => {
										if (wizard.overrideDisableFinish !== hasError) {
											setWizard((old) => ({
												...old,
												overrideDisableFinish: hasError,
											}));
										}
									}}
								/>
							) : reportName === 'Sales_Order_Line_Items' ? (
								<SalesOrderLineItemForm
									formName='Sales_Order_Line_Item'
									resource={getRecordByIdSuspense(
										'Sales_Order_Line_Items',
										null
									)}
									loadData={wizard.loadData}
									onChange={(e) => {
										//console.log('Wizard data onChange', e);
										wizardLineItemData.current = {
											...e,
											[formName.replaceAll('_Line_Item', '')]: parentId,
										}; //Any data forced to be a part of database save/add
									}}
									hasError={(hasError) => {
										if (wizard.overrideDisableFinish !== hasError) {
											setWizard((old) => ({
												...old,
												overrideDisableFinish: hasError,
											}));
										}
									}}
								/>
							) : reportName === 'Purchase_Order_Line_Items' ? (
								<PurchaseOrderLineItemForm
									formName='Purchase_Order_Line_Item'
									resource={getRecordByIdSuspense(
										'Purchase_Order_Line_Items',
										null
									)}
									loadData={wizard.loadData}
									onChange={(e) => {
										//console.log('Wizard data onChange', e);
										wizardLineItemData.current = {
											...e,
											[formName.replaceAll('_Line_Item', '')]: parentId,
										}; //Any data forced to be a part of database save/add
									}}
									hasError={(hasError) => {
										if (wizard.overrideDisableFinish !== hasError) {
											setWizard((old) => ({
												...old,
												overrideDisableFinish: hasError,
											}));
										}
									}}
								/>
							) : reportName === 'Estimate_Line_Items' ? (
								<EstimateLineItemForm
									formName='Estimate_Line_Item'
									resource={getRecordByIdSuspense('Estimate_Line_Items', null)}
									loadData={wizard.loadData}
									onChange={(e) => {
										//console.log('Wizard data onChange', e);
										wizardLineItemData.current = {
											...e,
											[formName.replaceAll('_Line_Item', '')]: parentId,
										}; //Any data forced to be a part of database save/add
									}}
									hasError={(hasError) => {
										if (wizard.overrideDisableFinish !== hasError) {
											setWizard((old) => ({
												...old,
												overrideDisableFinish: hasError,
											}));
										}
									}}
								/>
							) : reportName === 'Inventory_Adjustment_Line_Items' ? (
								<InventoryAdjustmentLineItemForm
									formName='Inventory_Adjustment_Line_Item'
									resource={getRecordByIdSuspense(
										'Inventory_Adjustment_Line_Items',
										null
									)}
									loadData={wizard.loadData}
									onChange={(e) => {
										console.log(
											'Inventory_Adjustment_Line_Items Wizard data onChange',
											e
										);
										wizardLineItemData.current = {
											...e,
											Parent_Uuid: parentId,
										}; //Any data forced to be a part of database save/add
									}}
									hasError={(hasError) => {
										if (wizard.overrideDisableFinish !== hasError) {
											setWizard((old) => ({
												...old,
												overrideDisableFinish: hasError,
											}));
										}
									}}
								/>
							) : reportName === 'Purchase_Receive_Line_Items' ? (
								<PurchaseReceiveLineItemForm
									formName='Purchase_Receive_Line_Item'
									resource={getRecordByIdSuspense(
										'Purchase_Receive_Line_Items',
										null
									)}
									loadData={wizard.loadData}
									onChange={(e) => {
										//console.log('Wizard data onChange', e);
										wizardLineItemData.current = {
											...e,
											[formName.replaceAll('_Line_Item', '')]: parentId,
										}; //Any data forced to be a part of database save/add
									}}
									hasError={(hasError) => {
										if (wizard.overrideDisableFinish !== hasError) {
											setWizard((old) => ({
												...old,
												overrideDisableFinish: hasError,
											}));
										}
									}}
								/>
							) : null}
						</WizardStep>
					</WizardDialog>
				) : null}

				{/* // <RenderPopup
          //   title={title}
          //   maxWidth={massUpdating ? Math.ceil(formMaxWidth / 2) : formMaxWidth}
          //   open={formOpen}
          //   onClose={onFormClose}
          //   moveableModal={lineItemTable || moveableModal}
          //   overrideDialogZindex={overrideDialogZindex}
          // >
          //   <RenderForm
          //     id={formId}
          //     formName={formName}
          //     loadData={onAddFormData}
          //     onChange={onFormSave}
          //     massUpdating={formOpen && massUpdating}
          //     massUpdateRecordIds={selections.map((selection) => selection.ID)}
          //   />
          // </RenderPopup> */}

				<ConfirmationDialog
					{...confirmationDialogData}
					open={confirmationDialogOpen}
					onBack={() => setConfirmationDialogOpen(false)}
					onConfirm={() => confirmationDialogData.onConfirm()}
					loading={
						saveState.status === 'saving' || saveState.status === 'deleting'
					}
				/>

				<Menu
					open={contextMenu !== null}
					onClose={handleContextMenuClose}
					anchorReference='anchorPosition'
					anchorPosition={
						contextMenu !== null
							? { top: contextMenu.mouseY, left: contextMenu.mouseX }
							: undefined
					}>
					{menuItems.map((menuItem) => (
						<MenuItem
							key={menuItem.label}
							onClick={() => handleContextMenuClose(menuItem)}>
							{menuItem.icon ? (
								<ListItemIcon>{menuItem.icon}</ListItemIcon>
							) : null}
							<Typography variant='inherit'>{menuItem.label}</Typography>
						</MenuItem>
					))}
				</Menu>

				<ToastMessage data={toastData} />
				<SaveManager formDataState={saveState} />
			</>
		);
	}
);

CustomTable.displayName = 'CustomTable';

CustomTable.propTypes = {
	tabTable: PropTypes.bool,
	lookupFieldTable: PropTypes.bool,
	lineItemTable: PropTypes.bool,
	onLineItemOrderChanged: PropTypes.func,
	lineItemDataState: PropTypes.object,
	lineItemDispatch: PropTypes.func,
	lineItemDefaultCriteria: PropTypes.string,
	formName: PropTypes.string.isRequired,
	reportName: PropTypes.string,
	defaultCriteria: PropTypes.string,
	overrideDefaultView: PropTypes.shape({
		ID: PropTypes.string,
		Name: PropTypes.string,
		readOnly: PropTypes.bool,
		JSON: PropTypes.array,
	}),
	hideToolbar: PropTypes.bool,
	moveableModal: PropTypes.bool,
	enableAdd: PropTypes.bool,
	enableEdit: PropTypes.bool,
	enableDelete: PropTypes.bool,
	enableSearch: PropTypes.bool,
	enableMassUpdate: PropTypes.bool,
	enableExport: PropTypes.bool,
	exportFilename: PropTypes.string,
	showDuplicate: PropTypes.bool,
	enableCollapseRows: PropTypes.bool,
	enableSingleSelect: PropTypes.bool,
	enableClickToSelect: PropTypes.bool,
	enableDragReorder: PropTypes.bool,
	enablePagination: PropTypes.bool,
	enableContextMenu: PropTypes.bool,
	enableShiftControls: PropTypes.bool,
	enableAssemblyControls: PropTypes.bool,
	enableAddComment: PropTypes.bool,
	disableSort: PropTypes.bool,
	disableFilters: PropTypes.bool,
	disableDefaultView: PropTypes.bool, //Useful for the tables specific to Account filtering
	defaultValue: PropTypes.oneOfType([
		PropTypes.object,
		PropTypes.array,
		PropTypes.string,
	]),
	onChange: PropTypes.func,
	defaultSortByColumn: PropTypes.string.isRequired,
	defaultSortDirection: PropTypes.oneOf(['asc', 'desc']),
	customSortOrder: PropTypes.oneOfType([PropTypes.string, PropTypes.array]),
	recordId: PropTypes.string,
	parentId: PropTypes.string,
	parentFormData: PropTypes.object,
	overrideHeight: PropTypes.number,
	overrideDialogZindex: PropTypes.bool,
	overrideModalZindex: PropTypes.bool,
};

CustomTable.defaultProps = {
	tabTable: false,
	lookupFieldTable: false,
	defaultCriteria: '',
	defaultValue: '',

	//Set default options to emulate most of the tables in the database for non Quotes/Sales Orders/Purchase Orders/Estimates
	enableAdd: true,
	enableEdit: true,
	enableDelete: true,
	enableMassUpdate: true,
	enableExport: true,
	enableCollapseRows: false,
	enableSingleSelect: false,
	enableClickToSelect: false,
	enableDragReorder: false,
	enableContextMenu: true,
	enablePagination: false,
	disableDefaultView: false,
	defaultSortByColumn: 'Name',
	defaultSortDirection: 'asc',

	parentFormData: {},
};

export default CustomTable;

//#region //! Detail Accordion (As of 12/6/21, mainly for lineItemTables)
const DetailsFooter = ({ state, expanded }) => {
	const theme = useTheme();
	const desktopMode = useMediaQuery(theme.breakpoints.up('sm'));

	return (
		<Box
			sx={{
				width: '100%',
				display: 'flex',
				alignItems: 'center',
				justifyContent: 'space-between',
			}}>
			<Box sx={{ display: 'flex', alignItems: 'center' }}>
				{expanded ? (
					<>
						<IconButton sx={{ mr: 2 }} color='secondary'>
							<Compress />
						</IconButton>
						{desktopMode ? (
							<Typography component='span' sx={{ color: 'secondary.main' }}>
								Click to{' '}
								<Typography
									component='span'
									sx={{
										fontWeight: 'bold',
										fontStyle: 'italic',
										color: 'inherit',
									}}>
									hide
								</Typography>{' '}
								details
							</Typography>
						) : null}
					</>
				) : (
					<>
						<IconButton sx={{ mr: 2 }} color='secondary'>
							<Expand />
						</IconButton>
						{desktopMode ? (
							<Typography component='span' sx={{ color: 'secondary.main' }}>
								Click to{' '}
								<Typography
									component='span'
									sx={{
										fontWeight: 'bold',
										fontStyle: 'italic',
										color: 'inherit',
									}}>
									see more
								</Typography>{' '}
								details
							</Typography>
						) : null}
					</>
				)}
			</Box>

			<Box>
				{expanded ? (
					<TextField
						sx={{ width: '20ch' }}
						color='secondary'
						label='Subtotal'
						value={state.Subtotal}
						type='number'
						inputProps={{ readOnly: true }}
						InputProps={{
							endAdornment: (
								<InputAdornment position='end'>
									<Typography sx={{ mx: 1 }} variant='h6'>
										$
									</Typography>
								</InputAdornment>
							),
						}}
						onClick={(e) => e.stopPropagation()}
					/>
				) : (
					<TextField
						sx={{ width: '20ch' }}
						color='secondary'
						label='Total'
						value={state.Total}
						type='number'
						inputProps={{ readOnly: true }}
						InputProps={{
							endAdornment: (
								<InputAdornment position='end'>
									<Typography sx={{ mx: 1 }} variant='h6'>
										$
									</Typography>
								</InputAdornment>
							),
						}}
					/>
				)}
			</Box>
		</Box>
	);
};
DetailsFooter.propTypes = {
	state: PropTypes.object,
	dispatch: PropTypes.func,
	expanded: PropTypes.bool,
};
DetailsFooter.defaultProps = {
	state: {},
	dispatch: () => {},
};

const DetailsFooterAccordion = ({ state, dispatch }) => {
	const theme = useTheme();
	const desktopMode = useMediaQuery(theme.breakpoints.up('sm'));
	const [discountByRate, setDiscountByRate] = useState(true);
	const [anchorEl, setAnchorEl] = useState(null);

	return (
		<Stack spacing={2} alignItems='flex-end' justifyContent='center'>
			<Box sx={{ display: 'flex', alignItems: 'center' }}>
				{anchorEl ? (
					<TaxPopover
						anchorEl={anchorEl}
						state={state}
						onClose={() => setAnchorEl(null)}
						dispatch={dispatch}
					/>
				) : null}
				<Button
					color='secondary'
					onClick={(e) => setAnchorEl(e.currentTarget)}
					endIcon={<OpenInNew />}
					sx={{ mr: 1.5 }}>
					Tax Info
				</Button>

				<TextField
					color='secondary'
					sx={{ width: '20ch' }}
					label='Tax (%)'
					value={state.Tax_Rate}
					type='number'
					step='0.005'
					helperText={`${currency(state.Tax)}`}
					onChange={(e) =>
						dispatch({
							type: 'TAX_RATE',
							payload: intTryParse(e.target.value)
								? parseFloat(e.target.value)
								: 0,
						})
					}
					InputProps={{
						endAdornment: (
							<InputAdornment position='end'>
								<Typography sx={{ mx: 1 }} variant='h6'>
									%
								</Typography>
							</InputAdornment>
						),
					}}
				/>
			</Box>
			<Box sx={{ display: 'flex' }}>
				<FormControlLabel
					sx={{ mr: 1 }}
					control={
						<Switch
							color='secondary'
							checked={discountByRate}
							onChange={(e) => setDiscountByRate(e.target.checked)}
						/>
					}
					label={desktopMode ? 'Percent Discount' : '%'}
					labelPlacement='start'
				/>

				<TextField
					color='secondary'
					sx={{
						display: discountByRate ? 'inline-flex' : 'none',
						width: '20ch',
					}}
					label='Discount (%)'
					value={state.Discount_Rate}
					helperText={`${currency(state.Discount)}`}
					type='number'
					step='0.01'
					onChange={(e) =>
						dispatch({
							type: 'DISCOUNT_RATE',
							payload: intTryParse(e.target.value)
								? parseFloat(e.target.value)
								: 0,
						})
					}
					InputProps={{
						endAdornment: (
							<InputAdornment position='end'>
								<Typography sx={{ mx: 1 }} variant='h6'>
									%
								</Typography>
							</InputAdornment>
						),
					}}
				/>

				<TextField
					color='secondary'
					sx={{
						display: discountByRate ? 'none' : 'inline-flex',
						width: '20ch',
					}}
					label='Discount ($)'
					value={state.Discount}
					helperText={`${percent(state.Discount_Rate)}`}
					type='number'
					step='0.01'
					onChange={(e) =>
						dispatch({
							type: 'DISCOUNT_DOLLARS',
							payload: intTryParse(e.target.value)
								? parseFloat(e.target.value)
								: 0,
						})
					}
					InputProps={{
						endAdornment: (
							<InputAdornment position='end'>
								<Typography sx={{ mx: 1 }} variant='h6'>
									$
								</Typography>
							</InputAdornment>
						),
					}}
				/>
			</Box>

			<Box>
				<TextField
					color='secondary'
					sx={{
						width: '20ch',
					}}
					label='Shipping'
					value={state.Shipping}
					type='number'
					step='0.01'
					onChange={(e) =>
						dispatch({
							type: 'SHIPPING',
							payload: intTryParse(e.target.value)
								? parseFloat(e.target.value)
								: 0,
						})
					}
					InputProps={{
						endAdornment: (
							<InputAdornment position='end'>
								<Typography sx={{ mx: 1 }} variant='h6'>
									$
								</Typography>
							</InputAdornment>
						),
					}}
				/>
			</Box>

			<Box>
				<TextField
					color='secondary'
					sx={{ width: '20ch' }}
					label='Total'
					value={state.Total}
					type='number'
					inputProps={{ readOnly: true }}
					InputProps={{
						endAdornment: (
							<InputAdornment position='end'>
								<Typography sx={{ mx: 1 }} variant='h6'>
									$
								</Typography>
							</InputAdornment>
						),
					}}
				/>
			</Box>
		</Stack>
	);
};
DetailsFooterAccordion.propTypes = {
	state: PropTypes.object,
	dispatch: PropTypes.func,
};

DetailsFooterAccordion.defaultProps = {
	state: {},
	dispatch: () => {},
};

const TaxPopover = ({ anchorEl, onClose, state, dispatch }) => {
	const open = Boolean(anchorEl);

	return (
		<Popover
			open={open}
			anchorEl={anchorEl}
			anchorOrigin={{
				vertical: 'center',
				horizontal: 'left',
			}}
			transformOrigin={{
				vertical: 'center',
				horizontal: 'right',
			}}
			onClose={onClose}>
			<ThemeCard header='Tax Information' elevation={8}>
				<Grid container spacing={2}>
					<Grid item xs={12}>
						<FormControlLabel
							control={
								<Checkbox
									color='secondary'
									checked={state.Tax_Goods}
									onChange={(e) =>
										dispatch({
											type: 'TAX_GOODS',
											payload: e.target.checked,
										})
									}
									disabled={state.Tax_Exempt}
								/>
							}
							label='Tax Goods'
						/>
						<FormControlLabel
							control={
								<Checkbox
									color='secondary'
									checked={state.Tax_Services}
									onChange={(e) =>
										dispatch({
											type: 'TAX_SERVICES',
											payload: e.target.checked,
										})
									}
									disabled={state.Tax_Exempt}
								/>
							}
							label='Tax Services'
						/>
						<FormControlLabel
							control={
								<Checkbox
									color='secondary'
									checked={state.Tax_Freight}
									onChange={(e) =>
										dispatch({
											type: 'TAX_FREIGHT',
											payload: e.target.checked,
										})
									}
									disabled={state.Tax_Exempt}
								/>
							}
							label='Tax Freight'
						/>
					</Grid>

					<Grid item xs={12}>
						<FormControlLabel
							control={
								<Checkbox
									color='secondary'
									checked={state.Tax_Exempt}
									onChange={(e) =>
										dispatch({
											type: 'TAX_EXEMPT',
											payload: e.target.checked,
										})
									}
									disabled={
										state.Tax_Goods || state.Tax_Services || state.Tax_Freight
									}
								/>
							}
							label='Tax Exempt'
						/>
						{state.Tax_Exempt ? (
							<TextField
								color='secondary'
								label='Tax Exempt Cert#'
								value={state.Tax_Exempt_Certification}
								onChange={(e) =>
									dispatch({
										type: 'TAX_EXEMPT_CERTIFICATION',
										payload: e.target.value,
									})
								}
							/>
						) : null}
					</Grid>
				</Grid>
			</ThemeCard>
		</Popover>
	);
};
//#endregion
