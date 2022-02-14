//import { useWhyDidYouUpdate } from 'use-why-did-you-update';
import React, { useEffect, useRef, useState } from "react";
import PropTypes from "prop-types";
import { useRecoilValue } from "recoil";
import ThemeCard from "../ThemeCard";
import { debugState, currentUserState } from "../../recoil/atoms";
import DatabaseDefaultIcon from "../Helpers/DatabaseDefaultIcon";
import AsynchronousSelect2 from "../FormControls/AsynchronousSelect2";
import { DataGridPro } from "@mui/x-data-grid-pro";
import { sum } from "../Helpers/functions";
import {
  Box,
  Button,
  Chip,
  CircularProgress,
  Divider,
  Grid,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  Paper,
  Radio,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import { Close, DoneAll } from "@mui/icons-material";

import {
  useFormData,
  useDebouncedEffect,
  useZohoGetAllRecords,
} from "../Helpers/CustomHooks";

import FormWrapper from "../FormControls/FormWrapper";
import ToastMessage from "../ToastMessage/ToastMessage";
import SaveManager from "../Helpers/SaveManager";
import { darken, lighten, useTheme } from "@mui/material/styles";
import useMediaQuery from "@mui/material/useMediaQuery";
import ContextCircularProgressLoader from "../Loaders/ContextCircularProgressLoader";
import ResponsiveDialog from "../Modals/ResponsiveDialog";

//#region //TODO Helper functions
const getBackgroundColor = (color, mode) =>
  mode === "dark" ? darken(color, 0.6) : lighten(color, 0.6);

const getHoverBackgroundColor = (color, mode) =>
  mode === "dark" ? darken(color, 0.5) : lighten(color, 0.5);
//#endregion

const priceBookItemGetMax = 100;

const ProductFillWizard = ({
  formName, //Used to require fewer edits between template and specific forms
  setAppBreadcrumb, //If form is fullscreen - when rendered from a table row, this won't be defined
  resource, //Data loaded from the database
  onChange, //Function call raised when data is saved - useful for updating a parent table
  loadData, //When adding a new form, this is the data object that can contain things like: {Account: '123456', Reference: '1234566'}
  massUpdating, //Used to enable mass update mode
  massUpdateRecordIds,
  uuid,
}) => {
  const theme = useTheme();
  const desktopMode = useMediaQuery(theme.breakpoints.up("sm"));
  const currentUser = useRecoilValue(currentUserState);
  const debug = useRecoilValue(debugState);
  const [alerts, setAlerts] = useState({});
  const [data, setData] = useState({
    ...loadData,
    ...resource?.read(),
    Record_Type: "Project",
  });
  const [id, setId] = useState(data.ID);
  const [state, , , mountData, , ,] = useFormData(data, loadData);
  const [
    warehouseStockItemReservationState,
    addWarehouseStockItemReservation,
    updateWarehouseStockItemReservation,
    ,
    ,
    ,
  ] = useFormData({});
  const [lineItemCriteria, setLineItemCriteria] = useState(null);
  const [toastData, setToastData] = useState({});
  const [timelineOpen, setTimelineOpen] = useState(false);
  const [reportCriteria, setReportCriteria] = useState(lineItemCriteria);
  const rowDataState = useZohoGetAllRecords(
    "Sales_Order_Line_Items",
    reportCriteria
  );
  const [rows, setRows] = useState([]);
  const projectDataState = useZohoGetAllRecords(
    "Projects",
    '(Status=="Open" || Status=="Preliminary" || Status=="Pending Closeout") && Category=="Client"'
  );

  const [priceBookItemCriteria, setPriceBookItemCriteria] = useState(null);
  const priceBookItemDataState = useZohoGetAllRecords(
    "Price_Book_Items",
    priceBookItemCriteria
  );

  const [selectionModel, setSelectionModel] = useState([]);
  const [selectedRow, setSelectedRow] = useState(null);

  const [stockCriteria, setStockCriteria] = useState(null);
  const stockDataState = useZohoGetAllRecords(
    "Warehouse_Stock_Items",
    stockCriteria
  );
  const [fillStockValue, setFillStockValue] = useState(0);

  const [reservationsCriteria, setReservationsCriteria] = useState(null);
  const reservationsDataState = useZohoGetAllRecords(
    "Warehouse_Stock_Item_Reservations",
    reservationsCriteria
  );

  const [selectedStockItem, setSelectedStockItem] = useState(null);
  const [selectedReservation, setSelectedReservation] = useState(null);
  const [fillByQuantityDialogOpen, setFillByQuantityDialogOpen] =
    useState(false);

  const priceBookItemGetData = useRef(null);

  useEffect(() => {
    if (rowDataState.status === "fetched") {
      //? Pull current Price_Book_Items
      const _uniqCriteriaArr = [
        ...new Set(
          rowDataState.data.map((row) => `ID==${row.Price_Book_Item.ID}`)
        ),
      ];

      if (_uniqCriteriaArr.length < priceBookItemGetMax) {
        priceBookItemGetData.current = {
          pass: 0,
          requiredPasses: 1,
          criteriaArray: _uniqCriteriaArr,
          complete: false,
          data: [],
        };
        setPriceBookItemCriteria(`(${_uniqCriteriaArr.join(" || ")})`);
      } else {
        priceBookItemGetData.current = {
          pass: 0,
          requiredPasses: Math.ceil(
            _uniqCriteriaArr.length / priceBookItemGetMax
          ),
          criteriaArray: _uniqCriteriaArr,
          complete: false,
          data: [],
        };
        const _pass = priceBookItemGetData?.current?.pass || 0;
        const _start = _pass * priceBookItemGetMax; //pass = 0, _start = 0; pass = 1, _start = 100
        const _end = (_pass + 1) * priceBookItemGetMax - 1; //pass = 0, _end = 99, pass = 1, _end = 199
        setPriceBookItemCriteria(
          `(${_uniqCriteriaArr
            .filter((x, i) => i >= _start && i <= _end)
            .join(" || ")})`
        );
      }
    }
  }, [rowDataState]);

  const getPriceBookItemData = (id) => {
    if (
      priceBookItemGetData?.current?.data.length > 0 &&
      priceBookItemGetData?.current?.data.filter((row) => row.ID === id)
        .length === 1
    ) {
      return priceBookItemGetData.current.data.filter(
        (row) => row.ID === id
      )[0];
    }

    return "";
  };

  //? This process was updated with a useRef for priceBookItemData due to URL constrains on too large of criteria in one go
  useEffect(() => {
    if (priceBookItemDataState.status === "fetched") {
      priceBookItemGetData.current.pass =
        priceBookItemGetData?.current?.pass + 1;
      priceBookItemGetData.current.data = [
        ...priceBookItemGetData.current.data,
        ...priceBookItemDataState.data,
      ]; //? Merge

      if (
        priceBookItemGetData?.current?.pass ===
        priceBookItemGetData?.current?.requiredPasses
      ) {
        priceBookItemGetData.current.complete = true;
        setRows(
          rowDataState.data
            .map((row) => {
              const priceBookItem = getPriceBookItemData(
                row.Price_Book_Item.ID
              );
              return {
                ...row,
                id: row.ID,
                Track_Inventory: priceBookItem.Track_Inventory,
              };
            })
            .filter(
              (row) =>
                row.Track_Inventory === true || row.Track_Inventory === "true"
            ) //? Filtering here with current Price_Book_Item data is the cleanest solution that doesn't rely on formulas
        );
      } else {
        //? Pull next pass of data
        const _pass = priceBookItemGetData?.current?.pass || 0;
        const _start = _pass * priceBookItemGetMax; //pass = 0, _start = 0; pass = 1, _start = 100
        const _end = (_pass + 1) * priceBookItemGetMax - 1; //pass = 0, _end = 99, pass = 1, _end = 199
        const _uniqCriteriaArr = priceBookItemGetData?.current?.criteriaArray;
        setPriceBookItemCriteria(
          `(${_uniqCriteriaArr
            .filter((x, i) => i >= _start && i <= _end)
            .join(" || ")})`
        );
      }
    }
  }, [priceBookItemDataState]);

  useDebouncedEffect(
    () => {
      lineItemCriteria
        ? setReportCriteria(
            `${lineItemCriteria} && Deleted=false && !Sales_Order.Type.contains("Change Order") && Sales_Order.Void_field=false`
          )
        : null;
    },
    [lineItemCriteria],
    2000
  );

  useEffect(() => {
    console.log("reportCriteria", reportCriteria);
    setSelectionModel([]); //Reset selections
    resetFillData();
    setStockCriteria(null);
    setReservationsCriteria(null);
  }, [reportCriteria]);

  //? This is used to immediately reserve a Warehouse_Stock_Item if it is selected and serialized
  useEffect(() => {
    if (selectedStockItem?.Serial_Number) {
      onReserveProduct();
    }
  }, [selectedStockItem]);

  useEffect(() => {
    if (selectedReservation) {
      onReleaseProduct();
    }
  }, [selectedReservation]);

  const getProductCellValue = ({ row }) => {
    let _base =
      row?.Name !== row?.Code ? `${row?.Name} (${row.Code})` : row?.Name;
    _base = row?.Manufacturer ? `${row.Manufacturer} ${_base}` : _base;

    return row?.Description ? `${_base}\n${row?.Description}` : _base;
  };

  useEffect(() => {
    if (selectedRow) {
      console.log("selectedRow", selectedRow);

      //? Fetch Warehouse_Stock_Items
      setStockCriteria(
        `Price_Book_Item==${selectedRow.Price_Book_Item?.ID} && Quantity_in_Stock > 0`
      );

      //? Fetch Warehouse_Stock_Item_Reservations
      if (selectedRow.Uuid) {
        setReservationsCriteria(
          `Sales_Order_Line_Item==${selectedRow.ID} || Sales_Order_Line_Item_Uuid=="${selectedRow.Uuid}"`
        );
      } else {
        setReservationsCriteria(`Sales_Order_Line_Item==${selectedRow.ID}`);
      }
    }
  }, [selectedRow]);

  useEffect(() => {
    console.log("stockDataState", stockDataState);
  }, [stockDataState]);

  useEffect(() => {
    console.log("reservationsDataState", reservationsDataState);

    //? Update the DataGrid Qty Filled column upon successful fetch of reservations from the database. This works well after adding/removing a reservation.
    if (
      reservationsDataState.status === "fetched" &&
      reservationsDataState.criteria.includes(selectedRow?.ID)
    ) {
      setRows((old) =>
        old.map((row) =>
          row.id === selectedRow.ID
            ? {
                ...row,
                Quantity_Reserved: reservationsDataState.data.map(
                  (reservation) =>
                    reservation
                      ? {
                          display_value: reservation.Quantity,
                          ID: reservation.ID,
                        }
                      : ""
                ),
              }
            : row
        )
      );
    }
  }, [reservationsDataState, selectedRow]);

  const renderStockList = () => {
    //! Potential issue where single Warehouse shows up twice

    if (
      Array.isArray(stockDataState?.data) &&
      stockDataState?.data.length > 0
    ) {
      if (
        selectedRow["Price_Book_Item.Serialized"] === true ||
        selectedRow["Price_Book_Item.Serialized"] === "true"
      ) {
        //? Serialized
        if (
          stockDataState?.data
            ?.map((stockItem) =>
              Array.isArray(stockItem?.Serial_Numbers)
                ? stockItem?.Serial_Numbers
                : null
            )
            .filter((stockItem) => stockItem).length === 0
        ) {
          //? Serialized, but no SN's in Stock
          return (
            <ListItem sx={{ textAlign: "center", color: "text.secondary" }}>
              <ListItemText primary="Not in Stock" />
            </ListItem>
          );
        }

        //? Iterate through all Warehouse_Stock_Items and then SN's per item
        return stockDataState?.data?.map((stockItem) =>
          stockItem?.Serial_Numbers.map((serialNumber, index) => (
            <Box key={serialNumber.ID}>
              <ListItem disablePadding>
                <ListItemButton
                  onClick={() => {
                    setSelectedStockItem({
                      ...stockItem,
                      Serial_Number: serialNumber,
                    });
                  }}
                >
                  <DatabaseDefaultIcon form="Warehouse" sx={{ mr: 1 }} />
                  <ListItemText primary={stockItem.Warehouse?.display_value} />
                  <Chip label={serialNumber.display_value} color="success" />
                </ListItemButton>
              </ListItem>
              {index < stockItem?.Serial_Numbers.length - 1 && <Divider />}
            </Box>
          ))
        );
      }

      //? Not Serialized
      return stockDataState?.data?.map((stockItem, index) => (
        <Box key={stockItem.ID}>
          <ListItem disablePadding>
            <ListItemButton
              onClick={() => {
                setSelectedStockItem(stockItem);
                setFillStockValue(
                  parseInt(stockItem?.Quantity_in_Stock || 0) >
                    parseInt(selectedRow?.Quantity || 0)
                    ? selectedRow?.Quantity
                    : stockItem?.Quantity_in_Stock
                );
                setFillByQuantityDialogOpen(true);
              }}
            >
              <DatabaseDefaultIcon form="Warehouse" sx={{ mr: 1 }} />
              <ListItemText primary={stockItem.Warehouse?.display_value} />
              <Chip label={stockItem.Quantity_in_Stock} color="info" />
            </ListItemButton>
          </ListItem>
          {index < stockDataState?.data.length - 1 && <Divider />}
        </Box>
      ));
    }

    return (
      <ListItem sx={{ textAlign: "center", color: "text.secondary" }}>
        <ListItemText primary="Not in Stock" />
      </ListItem>
    );
  };

  const renderReservationList = () => {
    //! Potential issue where single Warehouse shows up twice

    if (
      Array.isArray(reservationsDataState?.data) &&
      reservationsDataState?.data.length > 0
    ) {
      if (
        selectedRow["Price_Book_Item.Serialized"] === true ||
        selectedRow["Price_Book_Item.Serialized"] === "true"
      ) {
        //? Iterate through all Warehouse_Stock_Items and then SN's per item
        return reservationsDataState?.data?.map((reservation, index) => (
          <Box key={reservation.ID}>
            <ListItem disablePadding>
              <ListItemButton
                onClick={() => {
                  setSelectedReservation(reservation);
                }}
              >
                <DatabaseDefaultIcon form="Warehouse" sx={{ mr: 1 }} />
                <ListItemText primary={reservation.Warehouse_Name} />
                <Chip
                  label={reservation.Serial_Number.display_value}
                  color="success"
                />
              </ListItemButton>
            </ListItem>
            {index < reservationsDataState?.data.length - 1 && <Divider />}
          </Box>
        ));
      }

      //? Not Serialized
      return reservationsDataState?.data?.map((reservation, index) => (
        <Box key={reservation.ID}>
          <ListItem disablePadding>
            <ListItemButton onClick={() => setSelectedReservation(reservation)}>
              <DatabaseDefaultIcon form="Warehouse" sx={{ mr: 1 }} />
              <ListItemText primary={reservation.Warehouse_Name} />
              <Chip label={reservation.Quantity} color="info" />
            </ListItemButton>
          </ListItem>
          {index < reservationsDataState?.data.length - 1 && <Divider />}
        </Box>
      ));
    }

    return (
      <ListItem sx={{ textAlign: "center", color: "text.secondary" }}>
        <ListItemText primary="No Reservations" />
      </ListItem>
    );
  };

  const resetFillData = () => {
    setSelectedStockItem(null);
    setSelectedReservation(null);
    setFillStockValue(0);
  };

  const onFillFromStockDialogClose = () => {
    if (warehouseStockItemReservationState.status !== "saving") {
      setFillByQuantityDialogOpen(false);
      resetFillData();
    }
  };

  const onReserveProduct = () => {
    //TODO
    /*
    var data = {
            Sales_Order: row.Sales_Order_ID,
            Sales_Order_Line_Item_Uuid: row.Uuid,
            Quantity: 1,
            Warehouse_Stock_Item: listState.Warehouse_Stock_Items[idx].Warehouse_Stock_Item_ID,
            Serial_Number: listState.Warehouse_Stock_Items[idx].Serial_Number_ID,
            Data: JSON.stringify(listState.Warehouse_Stock_Items[idx])
        };

      var data = {
        Sales_Order: row.Sales_Order_ID,
        Sales_Order_Line_Item_Uuid: row.Uuid,
        Quantity: parseInt($('#quantityToFill').val()) || 0,
        Warehouse_Stock_Item: listState.Warehouse_Stock_Items[idxForQuantityReserve].Warehouse_Stock_Item_ID,
        Data: JSON.stringify(listState.Warehouse_Stock_Items[idxForQuantityReserve])
    };

    //TODO: Create Warehouse Stock Item Reservation record. When clicking in the stock table, we're always creating
    const response = await ZOHO.CREATOR.API.addRecord({ formName: 'Warehouse_Stock_Item_Reservation', data: { data : data }})
        .catch(err => {
            error = true;
        })
    */

    console.log("selectedStockItem", selectedStockItem);

    let data = {
      Sales_Order: selectedRow.Sales_Order.ID,
      Sales_Order_Line_Item: selectedRow.ID,
      Sales_Order_Line_Item_Uuid: selectedRow.Uuid,
      Quantity: selectedStockItem?.Serial_Number ? 1 : fillStockValue,
      Warehouse_Stock_Item: selectedStockItem?.ID,
      Data: JSON.stringify(selectedStockItem),
    };

    //? Selected Warehouse_Stock_Item has a Serial_Number, so add it to data
    if (selectedStockItem?.Serial_Number)
      data.Serial_Number = selectedStockItem?.Serial_Number?.ID;

    console.log("onReserveProduct", data);

    addWarehouseStockItemReservation(
      "Warehouse_Stock_Item_Reservation",
      data,
      () => {
        //? Assume a new reservation was created, refetch data
        setStockCriteria((old) => `(${old})`);
        setReservationsCriteria((old) => `(${old})`);
        onFillFromStockDialogClose();
      }
    );
  };

  const onReleaseProduct = () => {
    /*
    var data = {
      //Sales_Order: row.Sales_Order_ID,
      //Sales_Order_Line_Item_Uuid: row.Uuid,
      Quantity: 0,
      //Warehouse_Stock_Item: listState.Warehouse_Stock_Items[idx].Warehouse_Stock_Item_ID,
      //Serial_Number: listState.Warehouse_Stock_Items[idx].Serial_Number_ID,
      Data: JSON.stringify(listState.Warehouse_Stock_Items[idx])
    };

    //TODO: Create Warehouse Stock Item Reservation record. When clicking in the stock table, we're always creating
    const response = await ZOHO.CREATOR.API.updateRecord({ reportName: 'Warehouse_Stock_Item_Reservations', id: reservations[idx].ID, data: { data : data }})
        .catch(err => {
            error = true;
        })
    */
    //? Updating Quantity to 0 triggers workflows to delete the Warehouse_Stock_Item_Reservation
    let data = {
      Quantity: 0,
      Data: JSON.stringify(selectedReservation),
    };

    console.log("onReleaseProduct", data);

    updateWarehouseStockItemReservation(
      "Warehouse_Stock_Item_Reservations",
      selectedReservation.ID,
      data,
      () => {
        //? Assume a new reservation was created, refetch data
        setStockCriteria((old) => `(${old})`);
        setReservationsCriteria((old) => `(${old})`);
        onFillFromStockDialogClose();
      }
    );
  };

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        backgroundColor: "background.default",
      }}
    >
      <Box sx={{ mt: 1 }}>
        <ThemeCard header={`Select a Reference to Fill Product To`}>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <Box sx={{ display: "flex", alignItems: "baseline" }}>
                <Radio
                  checked={state?.currentData?.Record_Type === "Project"}
                  onChange={(e) => {
                    if (state?.currentData?.Project) {
                      const referenceId = projectDataState.data.filter(
                        (project) =>
                          project.ID === state?.currentData?.Project?.ID
                      )[0].Reference.ID;
                      //No need to debounce this selection
                      setReportCriteria(
                        `Sales_Order.Reference_ID==${referenceId} && Deleted=false && !Sales_Order.Type.contains("Change Order") && Sales_Order.Void_field=false`
                      );
                    }
                    mountData("Record_Type", e.target.value);
                  }}
                  value="Project"
                  name="radio-buttons"
                />
                <Typography component="span">
                  Fill products for a{" "}
                  <Typography component="span" sx={{ fontWeight: "bold" }}>
                    Project
                  </Typography>
                  :
                </Typography>
                <AsynchronousSelect2
                  name="Project"
                  displayValueKey="Name"
                  criteria='(Status=="Open" || Status=="Preliminary" || Status=="Pending Closeout") && Category=="Client"'
                  defaultValue={state.currentData.Project || ""}
                  overrideOptions={projectDataState.data}
                  onChange={(e) => {
                    if (state?.currentData?.Record_Type !== "Project") {
                      mountData("Record_Type", "Project");
                    }
                    mountData("Project", e);
                    const referenceId = projectDataState.data.filter(
                      (project) => project.ID === e.ID
                    )[0].Reference.ID;
                    //No need to debounce this selection
                    setReportCriteria(
                      `Sales_Order.Reference_ID==${referenceId} && Deleted=false && !Sales_Order.Type.contains("Change Order") && Sales_Order.Void_field=false`
                    );
                  }}
                  sx={{ ml: 2, width: 200 }}
                  fullWidth={false}
                />
              </Box>
            </Grid>
            <Grid item xs={12}>
              <Box sx={{ display: "flex", alignItems: "baseline" }}>
                <Radio
                  checked={state?.currentData?.Record_Type === "Sales_Order"}
                  onChange={(e) => {
                    if (state?.currentData?.Sales_Order_Number) {
                      //Fetch instantly
                      setReportCriteria(
                        `Sales_Order.Name.contains("${state?.currentData?.Sales_Order_Number}") && Deleted=false && !Sales_Order.Type.contains("Change Order") && Sales_Order.Void_field=false`
                      );
                    }

                    mountData("Record_Type", e.target.value);
                  }}
                  value="Sales_Order"
                  name="radio-buttons"
                />
                <Typography component="span">
                  Fill products for a{" "}
                  <Typography component="span" sx={{ fontWeight: "bold" }}>
                    Sales Order
                  </Typography>
                  :
                </Typography>
                <TextField
                  label="Sales Order#"
                  value={state?.currentData?.Sales_Order_Number || ""}
                  type="number"
                  onChange={(e) => {
                    if (state?.currentData?.Record_Type !== "Sales_Order") {
                      mountData("Record_Type", "Sales_Order");
                    }
                    mountData("Sales_Order_Number", e.target.value);
                    setLineItemCriteria(
                      `Sales_Order.Name.contains("${e.target.value}")`
                    );
                  }}
                  sx={{ ml: 2, width: 200 }}
                  fullWidth={false}
                />
              </Box>
            </Grid>
            <Grid item xs={12}>
              <Box sx={{ display: "flex", alignItems: "baseline" }}>
                <Radio
                  checked={state?.currentData?.Record_Type === "Service_Order"}
                  onChange={(e) => {
                    if (state?.currentData?.Service_Order_Number) {
                      //Fetch instantly
                      setReportCriteria(
                        `Sales_Order.Reference_Name.startsWith("SO") && Sales_Order.Reference_Name.contains("${state?.currentData?.Service_Order_Number}") && Deleted=false && !Sales_Order.Type.contains("Change Order") && Sales_Order.Void_field=false`
                      );
                    }

                    mountData("Record_Type", e.target.value);
                  }}
                  value="Service_Order"
                  name="radio-buttons"
                />
                <Typography component="span">
                  Fill products for a{" "}
                  <Typography component="span" sx={{ fontWeight: "bold" }}>
                    Service Order
                  </Typography>
                  :
                </Typography>
                <TextField
                  label="Service Order#"
                  value={state?.currentData?.Service_Order_Number || ""}
                  type="number"
                  onChange={(e) => {
                    if (state?.currentData?.Record_Type !== "Service_Order") {
                      mountData("Record_Type", "Service_Order");
                    }
                    mountData("Service_Order_Number", e.target.value);
                    setLineItemCriteria(
                      `Sales_Order.Reference_Name.startsWith("SO") && Sales_Order.Reference_Name.contains("${e.target.value}")`
                    );
                  }}
                  sx={{ ml: 2, width: 200 }}
                  fullWidth={false}
                />
              </Box>
            </Grid>
          </Grid>
        </ThemeCard>

        {desktopMode && (lineItemCriteria || reportCriteria) ? (
          <Grid container spacing={2}>
            <Grid item xs={8}>
              <Paper
                elevation={4}
                sx={{
                  mt: 1,
                  height: window.innerHeight - 2 * 51 - 270 - 8 - 1, //2*51 = navBar and tabBar, 270 = height of sales order selection, 2*8 for py: 1, the 1 is from an inconsistency
                  width: "100%",
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
                }}
              >
                <DataGridPro
                  disableMultipleSelection
                  getRowClassName={({ row }) => {
                    let Quantity_Reserved = Array.isArray(row.Quantity_Reserved)
                      ? sum(row.Quantity_Reserved, "display_value")
                      : 0;
                    return Quantity_Reserved < Number(row.Quantity)
                      ? "error-row"
                      : "";
                  }}
                  sx={{
                    "&.MuiDataGrid-root .MuiDataGrid-cell:focus": {
                      outline: "none",
                    },
                  }}
                  loading={!priceBookItemGetData?.current?.complete}
                  onRowClick={({ row }) =>
                    setSelectedRow((old) =>
                      !old || JSON.stringify(old) !== JSON.stringify(row)
                        ? row
                        : old
                    )
                  }
                  onCellClick={(params, e) => (e.defaultMuiPrevented = true)}
                  onCellDoubleClick={(params, e) =>
                    (e.defaultMuiPrevented = true)
                  }
                  rows={rows}
                  columns={[
                    {
                      field: "Sales_Order",
                      headerName: "Sales Order",
                      description: "Sales Order",
                      valueGetter: ({ row }) =>
                        `${row.Sales_Order.display_value}: ${row["Sales_Order.Description"]}`,
                      flex: 4,
                    },
                    {
                      field: "Product_Info",
                      headerName: "Product Info",
                      valueGetter: getProductCellValue,
                      flex: 5,
                    },
                    {
                      field: "Quantity",
                      headerName: "Qty Needed",
                      type: "number",
                      flex: 0.5,
                    },
                    {
                      field: "Quantity_Reserved",
                      headerName: "Qty Filled",
                      type: "number",
                      valueGetter: ({ row }) => {
                        if (Array.isArray(row.Quantity_Reserved)) {
                          return sum(row.Quantity_Reserved, "display_value");
                        }

                        return 0;
                      },
                      flex: 0.5,
                    },
                  ]}
                  onSelectionModelChange={(newSelectionModel) => {
                    setSelectionModel(newSelectionModel);
                  }}
                  selectionModel={selectionModel}
                />
              </Paper>
            </Grid>
            <Grid item xs={2}>
              <Typography
                textAlign={"center"}
                sx={{ my: 2, fontWeight: "bold", color: "text.secondary" }}
              >
                Stock (Click to Reserve)
              </Typography>
              <Paper elevation={4}>
                {stockDataState.status === "fetched" ? (
                  <List
                    sx={{
                      width: "100%",
                      maxHeight:
                        window.innerHeight - 2 * 51 - 270 - 2 * 16 - 24 - 8 - 1, //2*51 = navBar and tabBar, 270 = height of sales order selection, 2*16 my: 2 on typography, text itself is 24px, pb: 1, 1 for inconsistent
                      overflowY: "auto",
                    }}
                  >
                    {renderStockList()}
                  </List>
                ) : stockDataState.status === "fetching" ? (
                  <Box
                    sx={{
                      display: "flex",
                      justifyContent: "center",
                      width: "100%",
                      py: 2,
                    }}
                  >
                    <CircularProgress />
                  </Box>
                ) : (
                  <Typography textAlign={"center"} sx={{ p: 2 }}>
                    Please select a Line Item
                  </Typography>
                )}
              </Paper>
            </Grid>
            <Grid item xs={2}>
              <Typography
                textAlign={"center"}
                sx={{ my: 2, fontWeight: "bold", color: "text.secondary" }}
              >
                Reserved (Click to Return to Stock)
              </Typography>
              <Paper elevation={4}>
                {reservationsDataState.status === "fetched" ? (
                  <List
                    sx={{
                      width: "100%",
                      maxHeight:
                        window.innerHeight - 2 * 51 - 270 - 2 * 16 - 24 - 8 - 1, //2*51 = navBar and tabBar, 270 = height of sales order selection, 2*16 my: 2 on typography, text itself is 24px, pb: 1, 1 for inconsistent
                      overflowY: "auto",
                    }}
                  >
                    {renderReservationList()}
                  </List>
                ) : reservationsDataState.status === "fetching" ? (
                  <Box
                    sx={{
                      display: "flex",
                      justifyContent: "center",
                      width: "100%",
                      py: 2,
                    }}
                  >
                    <CircularProgress />
                  </Box>
                ) : (
                  <Typography textAlign={"center"} sx={{ p: 2 }}>
                    Please select a Line Item
                  </Typography>
                )}
              </Paper>
            </Grid>
          </Grid>
        ) : lineItemCriteria || reportCriteria ? (
          <Paper></Paper>
        ) : (
          <Typography textAlign={"center"} sx={{ py: 6 }}>
            Please select a Project, Sales Order, or Service Order Reference
            above...
          </Typography>
        )}

        {/* Form Specific Data (e.g. table, graph, etc.) */}

        {/* Tabbed Section */}
      </Box>

      {/* Fill By Quantity Confirmation */}
      <ResponsiveDialog
        maxWidth="sm"
        title="Fill from Stock"
        open={fillByQuantityDialogOpen}
        onClose={onFillFromStockDialogClose}
        buttons={
          <>
            <Button
              variant="outlined"
              startIcon={<Close />}
              onClick={onFillFromStockDialogClose}
            >
              Close
            </Button>
            <Button
              variant="contained"
              startIcon={<DoneAll />}
              onClick={onReserveProduct}
            >
              Fill
            </Button>
          </>
        }
      >
        <Stack spacing={2}>
          <Typography component="span">
            Selected Sales Order:{" "}
            <Typography component="span" fontWeight="bold">
              {selectedRow?.Sales_Order?.display_value}
            </Typography>
          </Typography>
          <Typography component="span">
            Selected Product:{" "}
            <Typography component="span" fontWeight="bold">
              {selectedStockItem?.Price_Book_Item?.display_value}
            </Typography>
          </Typography>
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <Typography component="span">
              Selected Warehouse:{" "}
              <Typography component="span" fontWeight="bold">
                {selectedStockItem?.Warehouse?.display_value}
              </Typography>
            </Typography>

            <TextField
              value={`${selectedStockItem?.Quantity_in_Stock}`}
              fullWidth={false}
              InputProps={{ readOnly: true }}
            />
          </Box>

          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <Typography component="span">Quantity to Fill</Typography>

            <TextField
              value={fillStockValue}
              max={
                parseInt(selectedStockItem?.Quantity_in_Stock || 0) >
                parseInt(selectedRow?.Quantity || 0)
                  ? parseInt(selectedRow?.Quantity || 0)
                  : parseInt(selectedStockItem?.Quantity_in_Stock || 0)
              }
              type="number"
              fullWidth={false}
              onChange={(e) => setFillStockValue(e.target.value)}
            />
          </Box>
        </Stack>
      </ResponsiveDialog>
      {/* Toast messaging in lower right */}
      <ToastMessage data={toastData} />
      <SaveManager formDataState={warehouseStockItemReservationState} />
    </Box>
  );
};

ProductFillWizard.propTypes = {
  formName: PropTypes.string.isRequired,
  id: PropTypes.string,
  loadData: PropTypes.object,
  resource: PropTypes.object,
  setAppBreadcrumb: PropTypes.func,
  onChange: PropTypes.func,
  massUpdating: PropTypes.bool,
  massUpdateRecordIds: PropTypes.array,
  uuid: PropTypes.string,
};

ProductFillWizard.defaultProps = {
  loadData: {},
  massUpdating: false,
  massUpdateRecordIds: [],
};

const Wrapper = (props) => {
  return (
    <React.Suspense fallback={<ContextCircularProgressLoader />}>
      <ProductFillWizard {...props} />
    </React.Suspense>
  );
};

export default Wrapper;
