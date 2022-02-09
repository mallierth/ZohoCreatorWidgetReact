import React, { useEffect, useState } from "react";
import PropTypes from "prop-types";
import { useRecoilValue } from "recoil";
import { Box, Button, Stack, Typography } from "@mui/material";
import { FileDownload } from "@mui/icons-material";
import DatabaseDefaultIcon from "../Helpers/DatabaseDefaultIcon";
import CustomTable from "../CustomTable/CustomTable";
import CustomDataTable from "../CustomDataTable/CustomDataTable";
import {
  sum,
  currency,
  intTryParse,
  zohoFilenameParserFromDownloadUrl,
  zohoDownloadUrlParser,
} from "../Helpers/functions";

//? Report Filter Columns
export const columns = [
  {
    field: "Note",
    flex: 5,
    renderCell: ({ value }) => (
      <Box
        sx={{ maxHeight: "150px", overflowY: "auto" }}
        dangerouslySetInnerHTML={{ __html: value }}
      ></Box>
    ),
  },
  {
    field: "Employee",
    headerName: "Author",
    searchField: "Employee_Full_Name",
    flex: 2,
    valueGetter: ({ value }) => value.display_value || "",
  },
  {
    field: "Added_Time",
    headerName: "Created",
    flex: 2,
    type: "dateTime",
  },
  {
    field: "File_Upload",
    headerName: "Attachments",
    searchField: false,
    flex: 5,
    renderCell: ({ row }) => (
      <Stack spacing={1}>
        {row.File_Upload_0 ? (
          <Button
            color="info"
            startIcon={<FileDownload />}
            onClick={(e) => {
              e.stopPropagation();
              const link = document.createElement("a");
              link.download = zohoFilenameParserFromDownloadUrl(
                row.File_Upload_0
              );
              link.href = zohoDownloadUrlParser(row.File_Upload_0);
              link.click();
            }}
          >
            {zohoFilenameParserFromDownloadUrl(row.File_Upload_0)}
          </Button>
        ) : null}
        {row.File_Upload_1 ? (
          <Button
            color="info"
            startIcon={<FileDownload />}
            onClick={(e) => {
              e.stopPropagation();
              const link = document.createElement("a");
              link.download = zohoFilenameParserFromDownloadUrl(
                row.File_Upload_1
              );
              link.href = zohoDownloadUrlParser(row.File_Upload_1);
              link.click();
            }}
          >
            {zohoFilenameParserFromDownloadUrl(row.File_Upload_1)}
          </Button>
        ) : null}
        {row.File_Upload_2 ? (
          <Button
            color="info"
            startIcon={<FileDownload />}
            onClick={(e) => {
              e.stopPropagation();
              const link = document.createElement("a");
              link.download = zohoFilenameParserFromDownloadUrl(
                row.File_Upload_2
              );
              link.href = zohoDownloadUrlParser(row.File_Upload_2);
              link.click();
            }}
          >
            {zohoFilenameParserFromDownloadUrl(row.File_Upload_2)}
          </Button>
        ) : null}
        {row.File_Upload_3 ? (
          <Button
            color="info"
            startIcon={<FileDownload />}
            onClick={(e) => {
              e.stopPropagation();
              const link = document.createElement("a");
              link.download = zohoFilenameParserFromDownloadUrl(
                row.File_Upload_3
              );
              link.href = zohoDownloadUrlParser(row.File_Upload_3);
              link.click();
            }}
          >
            {zohoFilenameParserFromDownloadUrl(row.File_Upload_3)}
          </Button>
        ) : null}
        {row.File_Upload_4 ? (
          <Button
            color="info"
            startIcon={<FileDownload />}
            onClick={(e) => {
              e.stopPropagation();
              const link = document.createElement("a");
              link.download = zohoFilenameParserFromDownloadUrl(
                row.File_Upload_4
              );
              link.href = zohoDownloadUrlParser(row.File_Upload_4);
              link.click();
            }}
          >
            {zohoFilenameParserFromDownloadUrl(row.File_Upload_4)}
          </Button>
        ) : null}
      </Stack>
    ),
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

const NoteReport = ({ maxHeight, variant, forcedCriteria, loadData }) => {
  return (
    <CustomDataTable
      formName="Note"
      forcedCriteria={forcedCriteria}
      height={maxHeight - 16}
      loadDataOnAddNewRow={loadData}
      DataGridProps={{
        checkboxSelection: true,
        disableSelectionOnClick: true,
      }}
      WrapperProps={{
        elevation: 4,
      }}
      columns={columns}
      filterColumns={filterColumns}
      hideFilters={variant === "tab"}
      hideSearch={variant === "tab"}
    />
  );
};

NoteReport.propTypes = {
  maxHeight: PropTypes.number,
  forcedCriteria: PropTypes.string,
  loadData: PropTypes.object,
  variant: PropTypes.oneOf(["tab"]),
};

export default NoteReport;
