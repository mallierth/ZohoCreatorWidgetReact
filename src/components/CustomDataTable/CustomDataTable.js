//#region //* Imports
import { useWhyDidYouUpdate } from "use-why-did-you-update";
import React, { useEffect, useRef, useState } from "react";
import PropTypes from "prop-types";
import { v4 as uuidv4 } from "uuid";
import { omit } from "lodash-es";
import { useRecoilState, useRecoilValue } from "recoil";
import ThemeCard from "../ThemeCard";
import { applicationTabsState, currentUserState } from "../../recoil/atoms";
import DatabaseDefaultIcon from "../Helpers/DatabaseDefaultIcon";
import { DataGridPro } from "@mui/x-data-grid-pro";
import { plurifyFormName, getNameFn, intTryParse } from "../Helpers/functions";
import {
  Box,
  Collapse,
  Divider,
  IconButton,
  Grid,
  ListItemIcon,
  Menu,
  MenuItem,
  Paper,
  Stack,
  TextField,
  Tooltip,
  Typography,
} from "@mui/material";
import { Add, Anchor, ContentCopy, Delete, Edit } from "@mui/icons-material";

import {
  useFormData,
  useDebounce,
  useDebouncedEffect,
  useZohoGetAllRecords,
} from "../Helpers/CustomHooks";
import LookupField2 from "../FormControls/LookupField2";
import SaveManager from "../Helpers/SaveManager";
import { useTheme } from "@mui/material/styles";
import useMediaQuery from "@mui/material/useMediaQuery";
import CustomDataGridOverlayDialog from "../Modals/CustomDataGridOverlayDialog";
import RenderForm from "../Helpers/RenderForm";

import CustomDataTableToolbar from "./CustomDataTableToolbar";
import CustomDataTableFilterGraphic from "./CustomDataTableFilterGraphic";
import FilterManager from "./FilterManager";
import FormDeleteDialog from "../Modals/FormDeleteDialog";
import { saveAs } from "file-saver";
import { utils, write } from "xlsx";
import dayjs from "dayjs";
import DuplicateRecordDialog from "../Modals/DuplicateRecordDialog";
import { getReferenceFormType } from "../Helpers/functions";
import ToastMessage from "../ToastMessage/ToastMessage";
import { currentUserIsAdminState } from "../../recoil/selectors";
import { darken, lighten } from "@mui/material/styles";
import RenderPopup from "../Helpers/RenderPopup";
//#endregion

//#region //* Excel Export
const fileType =
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8";
const fileExtension = ".xlsx";

const exportToXlsx = (jsonData, fileName, merges) => {
  let ws = utils.json_to_sheet(jsonData, { cellDates: true });
  if (merges && Array.isArray(merges)) {
    ws["!merges"] = merges;
  }
  const wb = { Sheets: { data: ws }, SheetNames: ["data"] };
  const excelBuffer = write(wb, { bookType: "xlsx", type: "array" });
  const data = new Blob([excelBuffer], { type: fileType });
  saveAs(data, fileName + fileExtension);
};
//#endregion

export const ToolbarTitle = ({ mode, formName, recordName }) => {
  const renderTitle = () => {
    switch (mode) {
      case "massUpdating":
        return (
          <Box sx={{ display: "flex" }}>
            <DatabaseDefaultIcon form={formName} sx={{ mr: 0.75 }} />
            <Typography component="span">
              {plurifyFormName(formName.replaceAll("_", " "))}
            </Typography>
          </Box>
        );
      case "editing":
        return (
          <Box sx={{ display: "flex" }}>
            <DatabaseDefaultIcon form={formName} sx={{ mr: 0.75 }} />
            <Typography
              component="span"
              sx={{ mr: 0.75 }}
            >{`Editing ${formName.replaceAll("_", " ")}`}</Typography>
            {recordName ? (
              <Typography component="span" sx={{ fontWeight: "bold" }}>
                {recordName}
              </Typography>
            ) : null}
          </Box>
        );
      case "adding":
        return (
          <Box sx={{ display: "flex" }}>
            <DatabaseDefaultIcon form={formName} sx={{ mr: 0.75 }} />
            <Typography
              component="span"
              sx={{ mr: 0.75 }}
            >{`Add New ${formName.replaceAll("_", " ")}`}</Typography>
          </Box>
        );
      default:
        return (
          <Box sx={{ width: "100%", display: "flex" }}>
            <DatabaseDefaultIcon form={formName} />
            <Typography sx={{ ml: 2 }}>{plurifyFormName(formName)}</Typography>
          </Box>
        );
    }
  };

  return <>{renderTitle()}</>;
};
ToolbarTitle.propTypes = {
  formName: PropTypes.string.isRequired,
  recordName: PropTypes.string,
  mode: PropTypes.oneOf(["adding", "editing", "massUpdating"]),
};

const ViewMenuItem = ({
  name,
  selected,
  onClickView,
  onClickEditView,
  isDefault,
  onClickToggleDefault,
  disabled,
  addViewVariant,
  onClickAdd,
}) => {
  return (
    <Box>
      {addViewVariant ? (
        <MenuItem>
          <Stack direction="row" spacing={1} alignItems="center">
            <Box>
              <IconButton size="small">
                <Add fontSize="small" color="success" />
              </IconButton>
            </Box>
            <Box sx={{ width: 200 }} onClick={onClickAdd}>
              Add New View
            </Box>
            <Box></Box>
          </Stack>
        </MenuItem>
      ) : (
        <MenuItem selected={selected}>
          <Stack direction="row" spacing={1} alignItems="center">
            <Box>
              <Tooltip arrow placement="left" title="Toggle Default">
                <span>
                  <IconButton
                    size="small"
                    disabled={disabled}
                    onClick={onClickToggleDefault}
                  >
                    <Anchor
                      fontSize="small"
                      color={isDefault ? "primary" : "disabled"}
                    />
                  </IconButton>
                </span>
              </Tooltip>
            </Box>
            <Box sx={{ width: 200 }} onClick={onClickView}>
              {name}
            </Box>
            <Box>
              <Tooltip arrow placement="left" title="Edit">
                <span>
                  <IconButton
                    size="small"
                    disabled={disabled}
                    onClick={onClickEditView}
                  >
                    <Edit fontSize="small" color="action" />
                  </IconButton>
                </span>
              </Tooltip>
            </Box>
          </Stack>
        </MenuItem>
      )}
    </Box>
  );
};
ViewMenuItem.propTypes = {
  name: PropTypes.string,
  selected: PropTypes.bool,
  onClickView: PropTypes.func,
  onClickEditView: PropTypes.func,
  tooltip: PropTypes.string,
  isDefault: PropTypes.bool,
  onClickToggleDefault: PropTypes.func,
  disabled: PropTypes.bool,
  addViewVariant: PropTypes.bool,
  onClickAdd: PropTypes.func,
};

const FilterDialogTitle = ({
  valueViewName,
  onViewNameChanged,
  hideActions,
  hideAdd,
  disableAdd,
  onClickAdd,
  hideDuplicate,
  disableDuplicate,
  onClickDuplicate,
  hideDelete,
  disableDelete,
  onClickDelete,
}) => {
  return (
    <Box
      sx={{
        width: "100%",
        display: "flex",
        alignItems: "center",
        justifyContent: "flex-start",
      }}
    >
      <Box>
        <Typography variant="subtitle1" component="span" sx={{ px: 2 }}>
          Saved View Name:
        </Typography>
        <TextField
          sx={{ width: "40ch" }}
          value={valueViewName}
          variant="standard"
          placeholder="To save, please enter a name"
          onChange={onViewNameChanged}
        />
      </Box>
      <Box hidden={hideActions}>
        <Stack direction="row" spacing={2}>
          {/* Duplicate */}
          <Tooltip arrow title={"Duplicate Current View"}>
            <span>
              <IconButton
                onClick={onClickDuplicate}
                sx={{ visibility: hideDuplicate ? "hidden" : "visible" }}
                disabled={disableDuplicate}
              >
                <ContentCopy />
              </IconButton>
            </span>
          </Tooltip>
          {/* Delete */}
          <Tooltip arrow title={`Delete ${valueViewName} from the database`}>
            <span>
              <IconButton
                onClick={onClickDelete}
                sx={{ visibility: hideDelete ? "hidden" : "visible" }}
                disabled={disableDelete}
              >
                <Delete />
              </IconButton>
            </span>
          </Tooltip>
        </Stack>
      </Box>
    </Box>
  );
};
FilterDialogTitle.propTypes = {
  valueViewName: PropTypes.string,
  onViewNameChanged: PropTypes.func,
  hideActions: PropTypes.bool,
  hideAdd: PropTypes.bool,
  disableAdd: PropTypes.bool,
  onClickAdd: PropTypes.func,
  hideDuplicate: PropTypes.bool,
  disableDuplicate: PropTypes.bool,
  onClickDuplicate: PropTypes.func,
  hideDelete: PropTypes.bool,
  disableDelete: PropTypes.bool,
  onClickDelete: PropTypes.func,
};

FilterDialogTitle.defaultProps = {
  valueViewName: "",
};

const getBackgroundColor = (color, mode) =>
  mode === "dark" ? darken(color, 0.6) : lighten(color, 0.6);

const getHoverBackgroundColor = (color, mode) =>
  mode === "dark" ? darken(color, 0.5) : lighten(color, 0.5);

const CustomDataGrid = ({
  //#region //* Props
  BackgroundComponent,
  formName,
  reportName = plurifyFormName(formName),
  exportFilename = `${plurifyFormName(
    formName.replaceAll("_", " ")
  )} Export ${dayjs().format("MM-DD-YY")}`,

  forcedCriteria,
  overrideRows, //TODO if needed, may not
  columns,
  filterColumns = columns,
  loadDataOnAddNewRow,
  isLoading,

  //Options
  height,
  hideToolbar,
  hideSearch,
  hideFilters,
  hideFilterGraphic,
  overrideDefaultView, //Primarily for the dashboard to display specific views
  ignoreDefaultView,
  defaultSelections, //for LookupField
  disableOpenOnRowClick,
  disableRowRightClick,

  //Data exposed to the outside
  onChange,

  //Duplication
  duplicateDialogComponent,

  //Search
  SearchProps,
  RowGroupControlProps,
  RowShiftControlProps,
  ActionProps,
  WrapperProps,
  DataGridProps,

  rowFormatter,

  defaultIgnoreActiveFilters,
  //#endregion
}) => {
  //#region //* Declarations

  const [adjustedHeight, setAdjustedHeight] = useState(0);
  const [toastData, setToastData] = useState({});
  const theme = useTheme();
  const mobileMode = useMediaQuery(theme.breakpoints.down("md"));
  const [currentUser, setCurrentUser] = useRecoilState(currentUserState);
  const currentUserIsAdmin = useRecoilValue(currentUserIsAdminState);
  const [updateCurrentUserState, , updateCurrentUser] = useFormData({
    ...currentUser,
  });
  const [applicationTabs, setApplicationTabs] =
    useRecoilState(applicationTabsState);

  //#region //* Data Grid
  const _defaultSelectionsSet = useRef(null);
  const [rows, setRows] = useState([]);
  const [
    rowsFormSaveState,
    addRowRecord,
    updateRowRecord,
    mountRowData,
    resetRowData,
    massUpdateRowRecords,
    deleteRowRecords,
  ] = useFormData({});
  const [selectionModel, setSelectionModel] = useState([]);
  const selections =
    selectionModel.length > 0
      ? rows.filter((row) => selectionModel.includes(row.ID))
      : [];
  //#endregion

  //#region //* Saved Custom/Database Views
  const viewDataState = useZohoGetAllRecords(
    "Record_Views",
    hideFilters ? null : `Form=="${formName}"`
  ); //! Retrieve views ONLY if filters are shown, lifecycle impact
  const [viewSaveState, addView, updateView, , , , deleteViews] = useFormData();
  const [views, setViews] = useState([]);
  const [viewMenuAnchor, setViewMenuAnchor] = useState(null);
  const viewMenuOpen = Boolean(viewMenuAnchor);
  const [activeView, setActiveView] = useState(null);
  const [filterDialogData, setFilterDialogData] = useState({});
  const [ignoreActiveFilters, setIgnoreActiveFilters] = useState(
    defaultIgnoreActiveFilters !== undefined
      ? Boolean(defaultIgnoreActiveFilters)
      : true
  );
  const [activeFilters, setActiveFilters] = useState([]);
  //#endregion

  //#region //* Search & Data Fetching
  const [loading, setLoading] = useState(true);
  const [reportCriteria, setReportCriteria] = useState(null); //* Triggered by search, view change, etc.
  const rowDataState = useZohoGetAllRecords(
    reportName,
    reportCriteria,
    selections.length > 0 ? selections : defaultSelections //This line will prioritize selections after the initial data pull using a defaultSelections, if any
  );
  const [searchTerm, setSearchTerm] = useState(null);
  const debouncedSearchTerm = useDebounce(searchTerm, 500);
  //#endregion

  //#region //* Dialogs
  const [contextMenu, setContextMenu] = useState(null);
  const [contextMenuRow, setContextMenuRow] = useState(null);
  const [rowDialogData, setRowDialogData] = useState(null);
  const rowDialogOpen = Boolean(rowDialogData);
  const [filterDialogOpen, setFilterDialogOpen] = useState(false);
  const [rowDeleteDialogOpen, setRowDeleteDialogOpen] = useState(false);
  const [rowDuplicateDialogOpen, setRowDuplicateDialogOpen] = useState(false);
  const [duplicationState, duplicateRecord] = useFormData();
  const [rowDuplicateData, setRowDuplicateData] = useState({});
  const formData = useRef(null);
  //#endregion

  //#endregion

  //#region //* Body

  //#region //? Data exposed to parent
  // Selections
  useEffect(() => {
    if (onChange) {
      onChange(selections);
    }
  }, [selectionModel]);

  // Loading status
  useEffect(() => {
    if (isLoading) {
      isLoading(loading);
    }
  }, [loading]);
  //#endregion

  //#region //? Search & Data Fetching
  useEffect(() => {
    if (
      !_defaultSelectionsSet.current &&
      defaultSelections &&
      rows.length > 0
    ) {
      if (Array.isArray(defaultSelections)) {
        setSelectionModel(defaultSelections.map((x) => x.ID));
      } else if (typeof defaultSelections === "object") {
        setSelectionModel([defaultSelections.ID]);
      } else {
        setSelectionModel([defaultSelections]);
      }
      _defaultSelectionsSet.current = true;
    }
  }, [defaultSelections, rows]);

  // Debounce Search
  useEffect(() => {
    if (debouncedSearchTerm || debouncedSearchTerm === "") {
      onSearch(debouncedSearchTerm);
    }
  }),
    [debouncedSearchTerm]; //! Any included state here will trigger search on change

  useEffect(() => {
    onSearch(searchTerm || "");
  }, [ignoreActiveFilters]);

  useEffect(() => {
    onSearch(searchTerm || "");
  }, [activeFilters]);

  // Generate searchReportCriteria and then setReportCriteria to initiate search while checking activeFilters
  const onSearch = (term) => {
    if (term) {
      var searchCriteriaArr = [];
      columns
        .filter((column) => column.searchField !== false)
        .forEach((column) => {
          let searchFieldType = column.searchFieldType
            ? column.searchFieldType
            : column.type; //Allows an override - useful for Account column but Account_Name search

          let result =
            searchFieldType === "number"
              ? intTryParse(term)
                ? `=${term}`
                : ""
              : `.contains("${term}")`;

          if (result) {
            if (column.searchField) {
              //A searchField override exists on this column
              if (Array.isArray(column.searchField)) {
                //array => creates an array of each key within searchField array
                searchCriteriaArr = [
                  ...searchCriteriaArr,
                  ...column.searchField.map(
                    (searchKey) => `${searchKey}${result}`
                  ),
                ];
              } else {
                //string => append a string at the end of searchCriteriaArr
                searchCriteriaArr = [
                  ...searchCriteriaArr,
                  `${column.searchField}${result}`,
                ];
              }
            } else {
              //string => append a string at the end of searchCriteriaArr
              searchCriteriaArr = [
                ...searchCriteriaArr,
                `${column.field}${result}`,
              ];
            }
          }
        });

      //? At this point, searchCriteriaArr = ['Account_Name.contains("Liberty")', 'Total==150',]

      const searchReportCriteria = searchCriteriaArr.join(" || "); //? 'Account_Name.contains("Liberty") || Total==150'

      if (ignoreActiveFilters) {
        //Set reportCriteria, include forceCriteria if necessary and search criteria only
        setReportCriteria(
          forcedCriteria
            ? `(${forcedCriteria}) && (${searchReportCriteria})`
            : searchReportCriteria
        );
      } else {
        //Set reportCriteria, include forceCriteria if necessary and search criteria and filter criteria
        const activeFiltersReportCriteria =
          getReportCriteriaFromActiveFilters();
        setReportCriteria(
          forcedCriteria
            ? `(${forcedCriteria}) && (${searchReportCriteria}) && (${activeFiltersReportCriteria})`
            : `(${searchReportCriteria}) && (${activeFiltersReportCriteria})`
        );
      }
    } else if (term === "") {
      //! Temporarily disabled for testing
      if (ignoreActiveFilters && false) {
        //Set reportCriteria, include forceCriteria if necessary and search criteria only
        setReportCriteria(forcedCriteria ? `(${forcedCriteria})` : "");
      } else {
        //Set reportCriteria, include forceCriteria if necessary and search criteria and filter criteria
        const activeFiltersReportCriteria =
          getReportCriteriaFromActiveFilters();

        if (activeFiltersReportCriteria) {
          setReportCriteria(
            forcedCriteria
              ? `(${forcedCriteria}) && (${activeFiltersReportCriteria})`
              : `${activeFiltersReportCriteria}`
          );
        } else {
          setReportCriteria(forcedCriteria || "");
        }
      }
    }
  };

  //? Function to generate Zoho fetch criter from activeFilters
  const getReportCriteriaFromActiveFilters = () => {
    if (activeFilters.length === 0) {
      return "";
    }

    //! Data structure below is detailed within PropTypes
    const _reportCriteria = activeFilters
      .map((af, index) => {
        if (af.childCriteria && Array.isArray(af.childCriteria)) {
          // Wrap the current parent index's criteria string
          if (index === 0) {
            // ( parent.criteriaString ${child.condition === 'AND' ? ' && ' : ' OR ' child.criteriaString})
            return `(${af.criteriaString}${af.childCriteria
              .map((childCriteria) =>
                childCriteria.condition === "AND"
                  ? " && "
                  : " || " + childCriteria.criteriaString
              )
              .join("")})`;
          }

          return `${af.condition === "AND" ? " && " : " || "}${`(${
            af.criteriaString
          }${af.childCriteria
            .map((childCriteria) =>
              childCriteria.condition === "AND"
                ? " && "
                : " || " + childCriteria.criteriaString
            )
            .join("")})`}`;
        } else {
          if (index === 0) {
            return af.criteriaString;
          }

          return `${af.condition === "AND" ? " && " : " || "}${
            af.criteriaString
          }`;
        }
      })
      .join("");

    return _reportCriteria;
  };

  // Row Fetching State, If Fetched, Set Rows
  useEffect(() => {
    console.log("CustomDataTable rowDataState", rowDataState);

    if (rowDataState?.status !== "fetching") {
      setLoading(false);
    } else {
      setLoading(true);
    }

    if (rowDataState.status === "fetched") {
      if (rowFormatter) {
        setRows(
          rowFormatter(rowDataState.data.map((row) => ({ ...row, id: row.ID })))
        );
      } else {
        setRows(rowDataState.data.map((row) => ({ ...row, id: row.ID })));
      }
    }

    if (rowDataState.status === "error") {
      console.log("rowDataState", rowDataState);
      setToastData({
        message: JSON.stringify(rowDataState.error),
        severity: "error",
      });
    }
  }, [rowDataState]);

  //#endregion

  //#region //? Views
  // View Fetching State, If Fetched, setViews
  useEffect(() => {
    if (viewDataState.status === "fetched") {
      setViews(
        overrideDefaultView
          ? [...viewDataState.data, overrideDefaultView]
          : viewDataState.data
      );
    }
  }, [viewDataState]);

  // This useEffect will only trigger when views are first loaded from the database which only happens when hideFilters = false
  useEffect(() => {
    if (
      views.length > 0 &&
      (overrideDefaultView ||
        (currentUser[`${formName}_Default_View`] && !ignoreDefaultView))
    ) {
      //Views have been loaded from the database and the currentUser has a default view defined for this report
      setActiveView(
        overrideDefaultView
          ? overrideDefaultView.ID
          : currentUser[`${formName}_Default_View`].ID
      );
    }
  }, [views, formName, currentUser, overrideDefaultView]); //! If this users default view is updated, it will call this useEffect

  // This useEffect will only trigger when a user selects a new active view or a default active view is activated by views retrieval
  useEffect(() => {
    if (activeView) {
      //When an ID is matched to a view in the list, return the criteria from that view
      const _view = views.filter((view) => view.ID === activeView)[0];

      if (_view.JSON) {
        setActiveFilters(
          typeof _view.JSON === "string" ? JSON.parse(_view.JSON) : _view.JSON
        ); //! Change of activeFilters hits useEffect that triggers onSearch
      } else {
        setActiveFilters([]);
      }
    } else if (searchTerm === null && viewDataState.status === "fetched") {
      //Views have been fetched and there is no activeView
      //This means that no override was present and the currentUser did not have a default view chosen
      onSearch(""); //! Performs a default search right away, searchTerm will still be null on load
    }
  }, [activeView, views]);

  const onClickView = (view) => {
    setActiveView(view.ID);
    onCloseViewMenu();
  };

  const onClickEditView = (view) => {
    setFilterDialogData({
      ID: view.ID,
      Name: view.Name,
      JSON: typeof view.JSON === "string" ? JSON.parse(view.JSON) : view.JSON,
      readOnly: false,
    });
    setFilterDialogOpen(true);
    onCloseViewMenu();
  };

  const onAddView = (jsonData) => {
    const _data = {
      ...filterDialogData,
      Form: formName,
      JSON: JSON.stringify(jsonData),
    };

    addView("Record_View", _data, ({ ID }) => {
      setViews((old) => [...old, { ..._data, JSON: jsonData, ID }]); //Append result to the end of views, JSON will be parsed if necessary
      setActiveView(ID); //TODO: Hope this works with timing
    });
  };

  const onUpdateView = (jsonData, ID) => {
    const _data = {
      ...filterDialogData,
      JSON: JSON.stringify(jsonData),
    };

    updateView("Record_Views", ID, _data, () => {
      setViews((oldViews) =>
        oldViews.map((oldView) =>
          oldView.ID === ID ? { ...oldView, ..._data, JSON: jsonData } : oldView
        )
      ); //Update existing view by ID match
      setActiveView(ID);
    });
  };

  const onViewToggleDefault = (view) => {
    const _updateData = {};
    if (currentUser[`${formName}_Default_View`]?.ID === view.ID) {
      _updateData[`${formName}_Default_View`] = "";
    } else {
      _updateData[`${formName}_Default_View`] = {
        ID: view.ID,
        display_value: view.Name,
      };
    }

    //? Update database and then merge data into current user onSuccess
    updateCurrentUser("Employees", currentUser.ID, _updateData, () => {
      setCurrentUser((oldData) => ({ ...oldData, ..._updateData }));
    });
  };

  const onDeleteView = () => {
    deleteViews("Record_Views", [filterDialogData?.ID], () => {
      setViews((oldViews) =>
        oldViews.filter((oldView) => oldView.ID !== filterDialogData?.ID)
      );
      setFilterDialogData((old) => omit(old, ["ID", "Name"])); //Leave current JSON, but delete the Name/ID that were previously present
    });
  };

  const onCloseViewMenu = () => {
    setViewMenuAnchor(null);
  };
  //#endregion

  //#region //? Filters

  //#endregion

  //#region //? Add
  const onClickAdd = (newTab) => {
    if (newTab) {
      setApplicationTabs((old) => [
        ...old.map((o) => ({ ...o, active: false })),
        {
          uuid: uuidv4(),
          label: `Add New ${formName.replaceAll("_", " ")}`,
          type: "form",
          name: formName,
          loadData: loadDataOnAddNewRow,
          active: true,
        },
      ]);
    } else {
      setRowDialogData({ loadData: loadDataOnAddNewRow, mode: "adding" });
    }
  };
  //#endregion

  //#region //? Edit
  const onClickEdit = () => {
    setRowDialogData({
      ...selections[0],
      mode: "editing",
    });
  };
  //#endregion

  //#region //? Mass Update
  const onClickMassUpdate = () => {
    setRowDialogData({
      mode: "massUpdating",
      massUpdating: true,
      massUpdateRecordIds: selectionModel,
    });
  };
  //#endregion

  //#region //? Delete
  const onClickDelete = () => {
    setRowDeleteDialogOpen(true);
  };

  const onDelete = () => {
    const rowsToDelete = selections;
    deleteRowRecords(
      reportName,
      rowsToDelete.map((row) => row.ID),
      () => {
        setRows((oldRows) =>
          oldRows.filter((oldRow) => !selectionModel.includes(oldRow.ID))
        );
        setSelectionModel([]);
        setRowDeleteDialogOpen(false);
      }
    );
  };
  //#endregion

  //#region //? Export
  const onClickExport = () => {
    try {
      const exportData = selections.length > 0 ? selections : rows;
      const exportColumns = columns.filter(
        (column) =>
          (!column.disableExport && !column.hide) || column.enableExport
      );
      let merges = []; //{s:{c:COLUMN_INDEX, r:ROW_INDEX}, e:{c:COLUMN_INDEX, r:ROW_INDEX}}

      //? Filter out hierarchy children
      const filteredExportData = exportData
        .filter(
          (row) =>
            !row.hierarchy ||
            (Array.isArray(row.hierarchy) && row.hierarchy.length === 1)
        )
        .map((row, index) => {
          let exportRow = {};

          exportColumns.forEach((exportColumn) => {
            if (
              exportColumn.renderCell &&
              !exportColumn.valueFormatter &&
              !exportColumn.valueGetter
            ) {
              throw new Error(
                `Export error: The cell ${row.field} in the grid is set to be rendered and does not have a value formatter set! Talk to your system administrator, this is an oversight that is easily fixed!`
              );
            }

            if (exportColumn.valueFormatter) {
              exportRow[exportColumn.field.replaceAll("_", " ")] =
                exportColumn.valueFormatter({
                  value: row[exportColumn.field],
                  row,
                });
            } else if (exportColumn.valueGetter) {
              exportRow[exportColumn.field.replaceAll("_", " ")] =
                exportColumn.valueGetter({
                  value: row[exportColumn.field],
                  row,
                });
            } else {
              exportRow[exportColumn.field.replaceAll("_", " ")] =
                row[exportColumn.field];
            }
          });

          return exportRow;
        });

      exportToXlsx(
        filteredExportData,
        exportFilename,
        merges.length > 0 ? merges : null
      );
    } catch (error) {
      throw new Error(JSON.stringify(error));
    }
  };
  //#endregion

  //#region //? Duplicate
  const onClickDuplicate = () => {
    setRowDuplicateData(selections[0]);
    setRowDuplicateDialogOpen(true);
  };

  const onDuplicate = () => {
    let _dupeData = [];
    for (let i = 0; i < rowDuplicateData.Duplicate_Quantity; i++) {
      _dupeData.push({
        Form: formName,
        Account: rowDuplicateData.Account,
        Reference: rowDuplicateData.Reference,
        Source_Record_ID: rowDuplicateData.ID,
      });
    }
    console.log("_dupeData", _dupeData);
    duplicateRecord("Duplication_Request", _dupeData, (successes) => {
      const _reportCriteria = reportCriteria;
      setReportCriteria(null);
      setReportCriteria(_reportCriteria);
      const _successes = successes.map(
        ({ Result_Record_ID, Result_Record_Name }, i) => ({
          uuid: uuidv4(),
          label: `${formName?.replaceAll("_", " ")}: ${Result_Record_Name}`,
          type: "form",
          id: Result_Record_ID,
          name: formName,
          active: i === successes.length - 1,
        })
      );
      setApplicationTabs((old) => [
        ...old.map((o) => ({ ...o, active: false })),
        ..._successes,
      ]);
      setRowDuplicateDialogOpen(false);
      //setRowDuplicateData({}); //TODO Temp removing this, might be useful to not do
    });
  };
  //#endregion

  //#region //? Helpers

  const onContextMenu = (e) => {
    e.preventDefault();
    setContextMenu(
      contextMenu === null
        ? { mouseX: event.clientX - 2, mouseY: event.clientY - 4 }
        : null
    );
  };

  const onContextMenuClose = () => {
    setContextMenu(null);
    setContextMenuRow(null);
  };

  //? Set table container height adjustment
  useEffect(() => {
    if (mobileMode && !hideToolbar) {
      setAdjustedHeight(74);
    } else if (mobileMode && hideToolbar) {
      setAdjustedHeight(0);
    } else if (
      !mobileMode &&
      !hideToolbar &&
      !hideFilters &&
      activeFilters.length > 0
    ) {
      setAdjustedHeight(74 + 58);
    } else if (
      !mobileMode &&
      !hideToolbar &&
      (hideFilters || activeFilters.length === 0)
    ) {
      setAdjustedHeight(74);
    } else if (
      !mobileMode &&
      hideToolbar &&
      !hideFilters &&
      activeFilters.length > 0
    ) {
      setAdjustedHeight(58);
    } else if (
      !mobileMode &&
      hideToolbar &&
      (hideFilters || activeFilters.length === 0)
    ) {
      setAdjustedHeight(0);
    } else {
      console.log("CustomDataTable.js => Height adjustment condition not met!");
      console.log("CustomDataTable.js => hideToolbar", hideToolbar);
      console.log("CustomDataTable.js => hideFilters", hideFilters);
      console.log(
        "CustomDataTable.js => activeFilters.length",
        activeFilters.length
      );
      console.log("CustomDataTable.js => mobileMode", mobileMode);
    }
  }, [hideToolbar, hideFilters, activeFilters, mobileMode]);

  // Calculate a column width for small viewports
  const calculateColumnWidth = (flexCoefficient) => {
    if (!flexCoefficient) {
      return 100;
    }

    return 100 * flexCoefficient;
  };
  //#endregion

  //#endregion

  //#region //* Render
  return (
    <>
      {/* DataGrid */}
      <Box sx={{ height, position: "relative" }}>
        {/* Search/Actions Toolbar (Top) */}
        <Collapse in={!hideToolbar} unmountOnExit>
          <CustomDataTableToolbar
            mobileMode={mobileMode}
            numSelected={selectionModel.length}
            hideSearch={hideSearch}
            SearchProps={{
              ...SearchProps,
              searchBusy: rowDataState?.status === "fetching",
              disabled: SearchProps.disabled,
              onChange: (value) => setSearchTerm(value),
              ignoreActiveFilters,
              onCheckIgnoreActiveFilters: (value) =>
                setIgnoreActiveFilters(value),
            }}
            RowGroupControlProps={{
              ...RowGroupControlProps,
              size: "large",
              color:
                selectionModel.length > 0
                  ? "secondary.contrastText"
                  : "secondary.main",
              disabled:
                RowGroupControlProps.disabled ||
                rowDataState?.status === "fetching",

              disableCompress:
                RowGroupControlProps.disableCompress ||
                selections.length === 0 ||
                !RowGroupControlProps?.canCompress(selections),
              onCompress: () => {
                //TODO
                setRows(RowGroupControlProps?.onCompressFormatter(selections));
              },

              disableExpand:
                RowGroupControlProps.disableExpand ||
                selections.length === 0 ||
                !RowGroupControlProps?.canExpand(selections),
              onExpand: () => {
                //TODO
                setRows(RowGroupControlProps?.onExpandFormatter(selections));
              },
            }}
            RowShiftControlProps={{
              ...RowShiftControlProps,
              size: "large",
              color:
                selectionModel.length > 0
                  ? "secondary.contrastText"
                  : "secondary.main",
              disabled:
                RowShiftControlProps.disabled ||
                rowDataState?.status === "fetching",

              disableShiftTop:
                RowShiftControlProps.disableShiftTop || selections.length === 0,
              onShiftTop: () => {
                //TODO
              },
              disableShiftUp:
                RowShiftControlProps.disableShiftUp || selections.length === 0,
              onShiftUp: () => {
                //TODO
              },
              disableShiftDown:
                RowShiftControlProps.disableShiftDown ||
                selections.length === 0,
              onShiftDown: () => {
                //TODO
              },
              disableShiftBottom:
                RowShiftControlProps.disableShiftBottom ||
                selections.length === 0,
              onShiftBottom: () => {
                //TODO
              },
            }}
            ActionProps={{
              ...ActionProps,
              size: "large",
              color:
                selectionModel.length > 0
                  ? "secondary.contrastText"
                  : "secondary.main",

              //Views
              onClickViews: (e) => setViewMenuAnchor(e.currentTarget),
              disableViews:
                ActionProps.disableViews ||
                viewDataState?.status === "fetching",
              hideViews:
                ActionProps.hideViews || hideFilters || selections.length > 0,
              hasActiveView: Boolean(activeView),

              //Filters
              onClickFilters: () => {
                setFilterDialogData((old) =>
                  old
                    ? {
                        ID: "",
                        Name: "",
                        JSON:
                          typeof old.JSON === "string"
                            ? JSON.parse(old.JSON)
                            : old.JSON,
                        readOnly: false,
                      }
                    : {}
                );
                setFilterDialogOpen(true);
              },
              disableFilters:
                ActionProps.disableFilters ||
                viewDataState?.status === "fetching",
              hideFilters:
                ActionProps.hideFilters || hideFilters || selections.length > 0,

              //Add
              onClickAdd,

              //Edit
              onClickEdit,
              disableEdit:
                ActionProps.disableEdit || rowDataState?.status === "fetching",
              hideEdit: ActionProps.hideEdit || selections.length === 0,
              //Mass Update
              onClickMassUpdate,
              disableMassUpdate: reportName !== "Customer_Assets", //TODO Temporary
              hideMassUpdate:
                ActionProps.hideMassUpdate || selections.length === 0,
              //Delete
              onClickDelete,
              disableDelete: !currentUserIsAdmin, //TODO open this up
              hideDelete: ActionProps.hideDelete || selections.length === 0,
              //Export
              onClickExport,
              disableExport: ActionProps.disableExport || rows.length === 0,

              //Duplicate
              onClickDuplicate,
              disableDuplicate:
                ActionProps.disableDuplicate || selections.length !== 1,
              showDuplicate: ActionProps.showDuplicate && selections.length > 0,
            }}
            WrapperProps={{}}
          />
        </Collapse>

        {/* Filter Visual Toolbar */}
        <Collapse
          in={!mobileMode && !hideFilterGraphic && activeFilters.length > 0}
          unmountOnExit
        >
          <CustomDataTableFilterGraphic
            mobileMode={mobileMode}
            numSelected={selections.length}
            columns={filterColumns}
            activeFilters={activeFilters}
            onFilterClick={() => setFilterDialogOpen(true)}
            onFilterClose={(index) =>
              setActiveFilters((oldFilters) =>
                oldFilters.filter((oldFilter, i) => i !== index)
              )
            } //Always going to be a parent
            onFilterClearAll={() => {
              setActiveView(null);
              setActiveFilters([]);
            }}
            disabled={rowDataState.status === "fetching"}
            WrapperProps={{}}
          />
        </Collapse>
        {/* Table */}
        <BackgroundComponent
          sx={{
            my: 1,
            "& .action-row": {
              bgcolor: (theme) =>
                getBackgroundColor(
                  theme.palette.action.selected,
                  theme.palette.mode
                ),
              "&:hover": {
                bgcolor: (theme) =>
                  getHoverBackgroundColor(
                    theme.palette.action.selected,
                    theme.palette.mode
                  ),
              },
            },
            "& .success-row": {
              bgcolor: (theme) =>
                getBackgroundColor(
                  theme.palette.success.light,
                  theme.palette.mode
                ),
              "&:hover": {
                bgcolor: (theme) =>
                  getHoverBackgroundColor(
                    theme.palette.success.light,
                    theme.palette.mode
                  ),
              },
            },
            "& .info-row": {
              bgcolor: (theme) =>
                getBackgroundColor(
                  theme.palette.info.light,
                  theme.palette.mode
                ),
              "&:hover": {
                bgcolor: (theme) =>
                  getHoverBackgroundColor(
                    theme.palette.info.light,
                    theme.palette.mode
                  ),
              },
            },
            "& .warning-row": {
              bgcolor: (theme) =>
                getBackgroundColor(
                  theme.palette.warning.light,
                  theme.palette.mode
                ),
              "&:hover": {
                bgcolor: (theme) =>
                  getHoverBackgroundColor(
                    theme.palette.warning.light,
                    theme.palette.mode
                  ),
              },
            },
            "& .error-row": {
              bgcolor: (theme) =>
                getBackgroundColor(
                  theme.palette.error.light,
                  theme.palette.mode
                ),
              "&:hover": {
                bgcolor: (theme) =>
                  getHoverBackgroundColor(
                    theme.palette.error.light,
                    theme.palette.mode
                  ),
              },
            },
            ...WrapperProps.sx,
            height: `${height - adjustedHeight}px`,
            transition: theme.transitions.create("height", {
              easing: theme.transitions.easing.sharp,
              duration: theme.transitions.duration.enteringScreen,
            }),
          }}
          {...omit(WrapperProps, "sx")}
        >
          <DataGridPro
            {...omit(DataGridProps, ["sx", "componentsProps"])}
            sx={{
              "&.MuiDataGrid-root .MuiDataGrid-cell:focus": {
                outline: "none",
              },
              "& .MuiDataGrid-cell:hover": {
                color: "primary.main",
              },
              ...DataGridProps?.sx,
            }}
            components={{
              ...DataGridProps?.components,
            }}
            componentsProps={{
              ...DataGridProps?.componentsProps,
              footer: {
                rows: selections.length > 0 ? selections : rows,
              },
              row: {
                onContextMenu: disableRowRightClick
                  ? null
                  : (e) => {
                      setContextMenuRow(
                        rows.filter(
                          (row) =>
                            row.ID === e.currentTarget.getAttribute("data-id")
                        )[0]
                      );
                      onContextMenu(e);
                    },
                style: {
                  cursor: disableRowRightClick ? "auto" : "context-menu",
                },
              },
            }}
            disableColumnMenu
            onCellClick={(params, e) => (e.defaultMuiPrevented = true)}
            onCellDoubleClick={(params, e) => (e.defaultMuiPrevented = true)}
            onRowClick={({ row }, e) => {
              if (disableOpenOnRowClick || rowDataState.status === "fetching") {
                //Toggle selection

                if (DataGridProps?.disableMultipleSelection) {
                  setSelectionModel((old) =>
                    old.length === 0
                      ? [...old, row.id]
                      : old[0] !== row.ID
                      ? [row.id]
                      : []
                  );
                } else {
                  setSelectionModel((old) =>
                    old.includes(row.id)
                      ? old.filter((o) => o !== row.id)
                      : [...old, row.id]
                  );
                }

                e.defaultMuiPrevented = true;
              } else {
                setRowDialogData({ ...row, mode: "editing" });
              }
            }}
            loading={loading}
            rows={rows}
            rowHeight={DataGridProps?.rowHeight ? DataGridProps?.rowHeight : 30}
            columns={
              mobileMode
                ? columns
                    .filter((column) => !column.hide)
                    .map((column) => ({
                      ...omit(column, "flex"),
                      width: calculateColumnWidth(column.flex),
                    }))
                : columns
            }
            onSelectionModelChange={(model, details) =>
              DataGridProps?.disableMultipleSelection && model.length > 1
                ? setSelectionModel(model[1])
                : setSelectionModel(model)
            }
            selectionModel={selectionModel}
          />
        </BackgroundComponent>

        {/* Overlay => Open a Form */}
        {/* <CustomDataGridOverlayDialog
					open={rowDialogOpen}
					onClose={() => setRowDialogData(null)}
					width='80%'
					title={
						<ToolbarTitle
							mode={rowDialogData?.mode}
							formName={formName}
							recordName={
								rowDialogData?.ID ? getNameFn(formName, rowDialogData) : ''
							}
						/>
					}>
					<RenderForm
						formName={formName}
						{...rowDialogData}
						maxHeight={height - theme.mixins.toolbar.minHeight}
					/>
				</CustomDataGridOverlayDialog> */}

        {/* Overlay => Filter Edit Page */}
        <CustomDataGridOverlayDialog
          open={filterDialogOpen}
          onClose={() => setFilterDialogOpen(false)}
          edge="start"
          color="secondary"
          title={
            <FilterDialogTitle
              valueViewName={filterDialogData?.Name}
              onViewNameChanged={(e) =>
                setFilterDialogData((old) =>
                  old ? { ...old, Name: e.target.value } : old
                )
              }
              hideActions={!filterDialogData?.ID}
              onClickDuplicate={() =>
                console.log("TODO: onClickDuplicate view")
              }
              disableDelete={filterDialogData?.readOnly}
              onClickDelete={onDeleteView}
            />
          }
        >
          <FilterManager
            height={height}
            columns={filterColumns}
            data={filterDialogData}
            onApplyFilter={(e) => {
              setActiveFilters(e);
              setFilterDialogOpen(false);
            }}
            onClearAllFilters={() => {
              setActiveFilters([]);
              setFilterDialogData({});
              setFilterDialogOpen(false);
            }}
            onSave={(jsonData, ID) => {
              if (!ID) {
                //Add
                onAddView(jsonData);
              } else {
                //Update
                onUpdateView(jsonData, ID);
              }
            }}
            onClose={() => setFilterDialogOpen(false)}
          />
        </CustomDataGridOverlayDialog>
      </Box>

      <RenderPopup
        maxWidth={rowDialogData?.mode === "massUpdating" ? 800 : null}
        open={rowDialogOpen}
        onClose={() => {
          if (formData?.current?.ID) {
            if (
              rows.filter((row) => row.ID === formData?.current?.ID).length ===
              0
            ) {
              //Prepend
              setRows((old) => [
                { ...formData?.current, id: formData?.current.ID },
                ...old,
              ]);
            } else {
              //Update Existing
              setRows((old) =>
                old.map((row) =>
                  row.ID === formData?.current?.ID
                    ? { ...row, ...formData?.current }
                    : row
                )
              );
            }
          }
          formData.current = null;
          setRowDialogData(null);
        }}
        title={
          <ToolbarTitle
            mode={rowDialogData?.mode}
            formName={formName}
            recordName={
              rowDialogData?.ID ? getNameFn(formName, rowDialogData) : ""
            }
          />
        }
      >
        <RenderForm
          formName={formName}
          {...rowDialogData}
          onChange={(data) => (formData.current = data)}
          onMassUpdate={(data) =>
            setRows((oldRows) =>
              oldRows.map((row) =>
                selectionModel.includes(row.ID) ? { ...row, ...data } : row
              )
            )
          }
          maxHeight={
            window.innerHeight - theme.mixins.toolbar.minHeight * 3 - 16
          }
        />
      </RenderPopup>

      {/* Row Context Menu */}
      <Menu
        open={contextMenu !== null}
        onClose={onContextMenuClose}
        anchorReference="anchorPosition"
        anchorPosition={
          contextMenu !== null
            ? { top: contextMenu.mouseY, left: contextMenu.mouseX }
            : undefined
        }
        componentsProps={{
          root: {
            onContextMenu: (e) => {
              e.preventDefault();
              onContextMenuClose();
            },
          },
        }}
      >
        <MenuItem
          onClick={() => {
            //Edit in current tab (summon overlay)
            setRowDialogData({ ...contextMenuRow, mode: "editing" });
            onContextMenuClose();
          }}
        >
          <ListItemIcon>
            <Edit />
          </ListItemIcon>
          <Typography variant="inherit">
            Edit{" "}
            <Typography component="span" sx={{ fontWeight: "bold" }}>
              {getNameFn(formName, contextMenuRow)}
            </Typography>
          </Typography>
        </MenuItem>

        <MenuItem
          onClick={() => {
            //Edit in new tab
            setApplicationTabs((old) => [
              ...old.map((o) => ({ ...o, active: false })),
              {
                uuid: uuidv4(),
                label: `${formName?.replaceAll("_", " ")}: ${getNameFn(
                  formName,
                  contextMenuRow
                )}`,
                type: "form",
                id: contextMenuRow.ID,
                name: formName,
                loadData: contextMenuRow,
                active: true,
              },
            ]);
            onContextMenuClose();
          }}
        >
          <ListItemIcon>
            <Edit />
          </ListItemIcon>
          <Typography variant="inherit">
            Edit{" "}
            <Typography component="span" sx={{ fontWeight: "bold" }}>
              {getNameFn(formName, contextMenuRow)}
            </Typography>{" "}
            in a New Tab
          </Typography>
        </MenuItem>

        {selections.length > 0 ? (
          <MenuItem
            onClick={() => {
              //Edit selections in one tab per selection
              const _selections = selections.map((selection, i) => ({
                uuid: uuidv4(),
                label: `${formName?.replaceAll("_", " ")}: ${getNameFn(
                  formName,
                  selection
                )}`,
                type: "form",
                id: selection.ID,
                name: formName,
                loadData: selection,
                active: i === selections.length - 1,
              }));
              setApplicationTabs((old) => [
                ...old.map((o) => ({ ...o, active: false })),
                ..._selections,
              ]);
              onContextMenuClose();
            }}
          >
            <ListItemIcon>
              <Edit />
            </ListItemIcon>
            <Typography variant="inherit">
              Edit selection(s) in{" "}
              <Typography component="span" sx={{ fontWeight: "bold" }}>
                {selections.length}
              </Typography>{" "}
              New Tab(s)
            </Typography>
          </MenuItem>
        ) : null}
      </Menu>

      {/* Views Menu */}
      <Menu
        anchorEl={viewMenuAnchor}
        open={viewMenuOpen}
        onClose={() => setViewMenuAnchor(null)}
      >
        {views && Array.isArray(views)
          ? views.map((view) => (
              <ViewMenuItem
                key={view.ID}
                name={view.Name}
                selected={view.ID === activeView}
                onClickView={() => onClickView(view)}
                onClickEditView={() => onClickEditView(view)}
                isDefault={
                  currentUser[`${formName}_Default_View`]?.ID === view.ID
                }
                onClickToggleDefault={() => onViewToggleDefault(view)}
                disabled={view.readOnly}
              />
            ))
          : null}
        <Divider />
        <ViewMenuItem
          addViewVariant
          onClickAdd={() => {
            //setFilterDialogData({}) //TODO this might work out well = either use existing settings or have a clean slate if there aren't any
            setFilterDialogOpen(true);
          }}
        />
      </Menu>

      {/* Row Delete Dialog */}
      <FormDeleteDialog
        formName={formName}
        formTitle={getNameFn(formName, selections)}
        open={rowDeleteDialogOpen}
        onClose={() => setRowDeleteDialogOpen(false)}
        onDelete={onDelete}
      />

      {duplicateDialogComponent
        ? duplicateDialogComponent(
            rowDuplicateData,
            setRowDuplicateData,
            rowDuplicateDialogOpen,
            () => {
              setRowDuplicateData({});
              setRowDuplicateDialogOpen(false);
            },
            onDuplicate
          )
        : null}

      {/* Delete Rows Toast */}
      <SaveManager formDataState={rowsFormSaveState} />

      {/* View Save Toast */}
      <SaveManager formDataState={viewSaveState} />

      {/* Toggle Default View User State */}
      <SaveManager formDataState={updateCurrentUserState} />

      {/* Duplicate Record Save State */}
      <SaveManager formDataState={duplicationState} />

      {/* General Comms */}
      <ToastMessage data={toastData} />
    </>
  );
  //#endregion
};

//#region //* PropTypes
CustomDataGrid.propTypes = {
  //General
  BackgroundComponent: PropTypes.object,
  formName: PropTypes.string.isRequired,
  reportName: PropTypes.string,
  exportFilename: PropTypes.string,
  forcedCriteria: PropTypes.string, //! Always enforced if defined
  overrideRows: PropTypes.array,
  columns: PropTypes.arrayOf(
    PropTypes.shape({
      searchField: PropTypes.oneOfType([
        PropTypes.string,
        PropTypes.bool,
        PropTypes.array,
      ]), //added this property for scenarios when field is lookup field but want to to search a formula field, set to false to omit field from search
      disableExport: PropTypes.bool, //Allows to have a visible column not be possible to export
      enableExport: PropTypes.bool, //Allows for a hidden column to only be used for an export
    })
  ).isRequired,
  filterColumns: PropTypes.arrayOf(
    PropTypes.shape({
      searchField: PropTypes.oneOfType([
        PropTypes.string,
        PropTypes.bool,
        PropTypes.array,
      ]), //added this property for scenarios when field is lookup field but want to to search a formula field, set to false to omit field from search
    })
  ),
  loadDataOnAddNewRow: PropTypes.object, //Used to send default data like Parent_ID, Account, etc.
  isLoading: PropTypes.func,

  //Options
  height: PropTypes.number.isRequired,
  hideToolbar: PropTypes.bool,
  hideSearch: PropTypes.bool,
  hideFilters: PropTypes.bool,
  hideFilterGraphic: PropTypes.bool,
  ignoreDefaultView: PropTypes.bool,
  overrideDefaultView: PropTypes.exact({
    ID: PropTypes.string,
    Name: PropTypes.string,
    readOnly: PropTypes.bool,
    JSON: PropTypes.arrayOf(
      PropTypes.exact({
        condition: PropTypes.oneOf(["", "AND", "OR"]),
        field: PropTypes.string,
        operator: PropTypes.string,
        value: PropTypes.oneOfType([PropTypes.string, PropTypes.bool]),
        value2: PropTypes.oneOfType([PropTypes.string, PropTypes.bool]),
        criteriaString: PropTypes.string,
        childCriteria: PropTypes.arrayOf(
          PropTypes.exact({
            condition: PropTypes.oneOf(["", "AND", "OR"]),
            field: PropTypes.string,
            operator: PropTypes.string,
            value: PropTypes.oneOfType([PropTypes.string, PropTypes.bool]),
            value2: PropTypes.oneOfType([PropTypes.string, PropTypes.bool]),
            criteriaString: PropTypes.string,
          })
        ),
      })
    ),
  }),
  defaultSelections: PropTypes.oneOfType([
    PropTypes.object,
    PropTypes.array,
    PropTypes.string,
  ]),
  disableOpenOnRowClick: PropTypes.bool,
  disableRowRightClick: PropTypes.bool,

  onChange: PropTypes.func,

  rowFormatter: PropTypes.func,
  duplicateDialogComponent: PropTypes.func, //(data, setData, open, onClose, onDuplicate)
  defaultIgnoreActiveFilters: PropTypes.bool,

  SearchProps: PropTypes.shape({
    searchBusy: PropTypes.bool,
    hidden: PropTypes.bool,
    disabled: PropTypes.bool,
    defaultValue: PropTypes.string,
    onChange: PropTypes.func,

    ignoreActiveFilters: PropTypes.bool,
    onCheckIgnoreActiveFilters: PropTypes.func,
  }), //Useful for the sx prop on

  RowGroupControlProps: PropTypes.shape({
    show: PropTypes.bool, //default hidden
    disabled: PropTypes.bool, //global disable

    hideCompress: PropTypes.bool,
    disableCompress: PropTypes.bool,
    canCompress: PropTypes.func, //Selections are fed to this function with a bool result
    onCompressFormatter: PropTypes.func,

    hideExpand: PropTypes.bool,
    disableExpand: PropTypes.bool,
    canExpand: PropTypes.func, //Selections are fed to this function with a bool result
    onExpandFormatter: PropTypes.func,
  }),
  RowShiftControlProps: PropTypes.shape({
    show: PropTypes.bool, //default hidden
    disabled: PropTypes.bool, //global disable

    onShiftTop: PropTypes.func,
    hideShiftTop: PropTypes.bool,
    disableShiftTop: PropTypes.bool,

    onShiftUp: PropTypes.func,
    hideShiftUp: PropTypes.bool,
    disableShiftUp: PropTypes.bool,

    onShiftDown: PropTypes.func,
    hideShiftDown: PropTypes.bool,
    disableShiftDown: PropTypes.bool,

    onShiftBottom: PropTypes.func,
    hideShiftBottom: PropTypes.bool,
    disableShiftBottom: PropTypes.bool,
  }),

  ActionProps: PropTypes.shape({
    hidden: PropTypes.bool,
    size: PropTypes.oneOf(["small", "medium", "large"]),
    color: PropTypes.string,

    //Views
    onClickViews: PropTypes.func,
    hideViews: PropTypes.bool,
    disableViews: PropTypes.bool,

    //Filters
    onClickFilters: PropTypes.func,
    hideFilters: PropTypes.bool,
    disableFilters: PropTypes.bool,

    //Add
    onClickAdd: PropTypes.func,
    hideAdd: PropTypes.bool, //default shown
    disableAdd: PropTypes.bool,

    //Edit
    onClickEdit: PropTypes.func,
    hideEdit: PropTypes.bool, //default shown
    disableEdit: PropTypes.bool,

    //Mass Update
    onClickMassUpdate: PropTypes.func,
    hideMassUpdate: PropTypes.bool, //default shown
    disableMassUpdate: PropTypes.bool,

    //Delete
    onClickDelete: PropTypes.func,
    hideDelete: PropTypes.bool, //default shown
    disableDelete: PropTypes.bool,

    //Export
    onClickExport: PropTypes.func,
    hideExport: PropTypes.bool, //default shown
    disableExport: PropTypes.bool,

    //Duplicate
    onClickDuplicate: PropTypes.func,
    showDuplicate: PropTypes.bool, //default hidden
    disableDuplicate: PropTypes.bool,
  }), //Useful for the sx prop on
  WrapperProps: PropTypes.object, //Useful for the sx prop on
  DataGridProps: PropTypes.object, //Exposes any DataGrid props directly to the outside if needed
};

CustomDataGrid.defaultProps = {
  BackgroundComponent: Paper,
  loadDataOnAddNewRow: {},
  SearchProps: {},
  RowGroupControlProps: {
    canCompress: () => {},
    canExpand: () => {},
  },
  RowShiftControlProps: {},
  ActionProps: {},
  WrapperProps: {},
  DataGridProps: {},
};
//#endregion
export default CustomDataGrid;
