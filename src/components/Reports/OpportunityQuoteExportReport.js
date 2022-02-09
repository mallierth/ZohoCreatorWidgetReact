import React, { useEffect, useState } from "react";
import PropTypes from "prop-types";
import { useRecoilValue } from "recoil";
import { Box, Tooltip, Typography } from "@mui/material";
import {
  Category,
  Forum,
  MoneyOff,
  PriceCheck,
  Settings,
  Timer,
  Warning,
} from "@mui/icons-material";
import DatabaseDefaultIcon from "../Helpers/DatabaseDefaultIcon";
import CustomTable from "../CustomTable/CustomTable";
import DataGridGroupToggleButton from "../CustomDataTable/DataGridGroupToggleButton";
import CustomDataTable from "../CustomDataTable/CustomDataTable";
import { sum, currency, intTryParse, percent } from "../Helpers/functions";

//? Report Filter Columns
export const columns = [
  {
    field: "Quote",
    flex: 1,
    valueGetter: ({ value }) => value.display_value || "",
  },
  {
    field: "Type",
    headerName: "",
    align: "center",
    width: 50,
    valueOptions: [
      "Goods",
      "Service",
      "Assembly",
      "Comment",
      "Contingency",
      "Credit",
    ],
    valueFormatter: ({ value }) => value,
    valueParser: (value) => value,
    renderCell: ({ row }) => {
      switch (row.Type) {
        case "Goods":
          return (
            <Tooltip arrow title="Goods" placement="right">
              <Settings color="primary" />
            </Tooltip>
          );
        case "Service":
          return (
            <Tooltip arrow title="Service" placement="right">
              <Timer color="secondary" />
            </Tooltip>
          );
        case "Assembly":
          return (
            <Tooltip arrow title="Assembly" placement="right">
              <Category color="success" />
            </Tooltip>
          );
        case "Comment":
          return (
            <Tooltip arrow title="Comment" placement="right">
              <Forum color="info" />
            </Tooltip>
          );
        case "Contingency":
          return (
            <Tooltip arrow title="Contingency" placement="right">
              <PriceCheck color="warning" />
            </Tooltip>
          );
        case "Credit":
          return (
            <Tooltip arrow title="Credit" placement="right">
              <MoneyOff color="error" />
            </Tooltip>
          );
        default:
          return (
            <Tooltip arrow title="Credit" placement="right">
              <Warning />
            </Tooltip>
          );
      }
    },
  },
  {
    field: "Manufacturer",
    flex: 2,
  },
  {
    field: "Product",
    flex: 5,
    valueGetter: ({ row }) => getProductInfo(row),
    renderCell: ({ row }) => getProductInfoRendered(row),
  },
  {
    field: "Description",
    flex: 5,
    hide: true,
    enableExport: true,
  },
  {
    field: "Quantity",
    type: "number",
    flex: 1,
    valueGetter: ({ row }) => row.Type === 'Comment' ? '' : row.Quantity,
  },
  {
    field: "Cost",
    type: "number",
    flex: 1,
    valueFormatter: ({ value }) => currency(value),
    valueGetter: ({ row }) => row.Type === 'Comment' ? '' : row.Cost,
  },
  {
    field: "Cost_Total",
    headerName: "Cost Total",
    type: "number",
    flex: 1,
    valueFormatter: ({ value }) => currency(value),
    valueGetter: ({ row }) => row.Type === 'Comment' ? '' : row.Cost_Total,
  },
  {
    field: "Sell_Price_Each",
    headerName: "Sell Price Each",
    type: "number",
    flex: 1,
    valueFormatter: ({ value }) => currency(value),
    valueGetter: ({ row }) => row.Type === 'Comment' ? '' : row.Sell_Price_Each,
  },
  {
    field: "Sell_Price_Total",
    headerName: "Sell Price Total",
    type: "number",
    flex: 1,
    valueFormatter: ({ value }) => currency(value),
    valueGetter: ({ row }) => row.Type === 'Comment' ? '' : row.Sell_Price_Total,
  },
  {
    field: "Margin",
    headerName: "Margin (%)",
    type: "number",
    flex: 1,
    valueFormatter: ({ value }) => percent(value),
    valueGetter: ({ row }) => row.Type === 'Comment' ? '' : row.Margin,
  },
];

//? Add columns that will be used only for filtering
export const filterColumns = [...columns].sort((a, b) => {
  if (
    a.headerName
      ? a.headerName
      : a.field < b.headerName
      ? b.headerName
      : b.field
  ) {
    return -1;
  } else if (
    a.headerName
      ? a.headerName
      : a.field > b.headerName
      ? b.headerName
      : b.field
  ) {
    return 1;
  } else {
    return 0;
  }
});

const CustomFooter = ({ rows }) => {
  const total = sum(rows, "Total");

  return (
    <Box
      sx={{
        p: 1,
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
      }}
    >
      <Box
        sx={{ display: "flex", "& > *": { pr: 1 }, color: "text.secondary" }}
      >
        <Typography variant="body1">Total: {currency(total)}</Typography>
      </Box>
      <Box>
        <Typography variant="body2">Total Rows: {rows.length}</Typography>
      </Box>
    </Box>
  );
};
CustomFooter.propTypes = {
  rows: PropTypes.array.isRequired,
};

const getProductInfo = (row) => {
  let manufacturer = row.Manufacturer ? row.Manufacturer + " " : "";
  let nameCode = row.Name === row.Code ? row.Name : `${row.Name} (${row.Code})`;

  if (row.Code === "Custom") {
    return row.Description;
  }

  return manufacturer + nameCode;
};

const getProductInfoRendered = (row) => {
  let nameCode = row.Name === row.Code ? row.Name : `${row.Name} (${row.Code})`;

  if (row.Type === "Comment") {
    return (
      <Typography variant="body2">{row.Description}</Typography>
    );
  }

  return (
    <Box sx={{ display: "grid" }}>
      <Typography variant="body2" sx={{ fontWeight: "bold" }}>
        {nameCode}
      </Typography>
      <Typography
        variant="caption"
        sx={{ color: "secondary", fontStyle: "italic" }}
      >
        {row.Description}
      </Typography>
    </Box>
  );
};

const OpportunityQuoteExportReport = ({
  maxHeight,
  variant,
  forcedCriteria,
  loadData,
  referenceId,
  phaseId,
  exportFilename,
}) => {
  return (
    <CustomDataTable
      disableOpenOnRowClick
      hideFilterGraphic
      formName="Quote_Line_Item"
      forcedCriteria={
        forcedCriteria ||
        (phaseId ? `Phase==${phaseId}` : `Quote.Reference_ID==${referenceId}`) +
          `&& Quote.Void_field==false && Deleted=false`
      }
      height={maxHeight - 16}
      loadDataOnAddNewRow={loadData} //! add
      rowFormatter={(rows) =>
        rows.map((row) => {
          if (
            row.Collapsible_Child === true ||
            row.Collapsible_Child === "true"
          ) {
            //? Child (should be contained within a parent's Collapsible_Line_Items)
            const _parent = rows.filter(
              (d) =>
                Array.isArray(d.Collapsible_Line_Items) &&
                d.Collapsible_Line_Items.map((x) => x.ID).includes(row.ID)
            )[0];

            return { ...row, hierarchy: [_parent.ID, row.ID] };
          }

          return { ...row, hierarchy: [row.ID] };
        })
      }
      exportFilename={exportFilename}
      DataGridProps={{
        rowHeight: 44,
        checkboxSelection: true,
        disableSelectionOnClick: true,
        getRowClassName: ({ row }) => {
          if (row.hierarchy.length > 1) {
            return "action-row";
          }
          if (row.Type === "Comment") {
            return "info-row";
          }
        },
        treeData: true,
        getTreeDataPath: (row) => row.hierarchy,
        groupingColDef: {
          headerName: "",
          width: 50,
          align: "center",
          renderCell: (params) => <DataGridGroupToggleButton {...params} />,
        },
        components: {
          Footer: CustomFooter,
        },
      }}
      SearchProps={{
        hidden: true,
      }}
      ActionProps={{
        hideViews: true,
        hideAdd: true,
        hideMassUpdate: true,
        hideDelete: true,
      }}
      WrapperProps={{
        elevation: 4,
      }}
      columns={columns}
      filterColumns={filterColumns}
      hideFilters={variant === "tab"} //! add
      hideSearch={variant === "tab"} //! add
    />
  );
};

OpportunityQuoteExportReport.propTypes = {
  maxHeight: PropTypes.number,
  forcedCriteria: PropTypes.string,
  loadData: PropTypes.object,
  variant: PropTypes.oneOf(["tab"]),
  referenceId: PropTypes.string.isRequired, //Reference ID
  phaseId: PropTypes.string, //Project ID
  exportFilename: PropTypes.string,
};

export default OpportunityQuoteExportReport;
