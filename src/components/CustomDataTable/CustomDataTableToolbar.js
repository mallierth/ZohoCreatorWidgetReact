import React from "react";
import PropTypes from "prop-types";
import { omit } from "lodash";
import { Paper } from "@mui/material";
import ToolbarSearch from "./ToolbarSearch";
import ToolbarActions from "./ToolbarActions";

const CustomDataTableToolbar = ({
  //Updated props
  mobileMode,
  numSelected,

  //ToolbarSearch props
  SearchProps,
  hideSearch,

  //ToolbarActions props
  ActionProps,
  hideActions,

  WrapperProps,
}) => {
  return (
    <Paper
      elevation={4}
      {...omit(WrapperProps, "sx")}
      sx={{
        border: (theme) =>
          theme.palette.mode === "dark"
            ? `1px solid ${
                numSelected > 0
                  ? theme.palette.secondary.light
                  : "rgba(81,81,81,1)"
              }`
            : `1px solid ${
                numSelected > 0
                  ? theme.palette.secondary.light
                  : "rgba(224,224,224,1)"
              }`,
        width: "100%",
        overflowX: "hidden",
        p: 1,
        mt: 1,
        //mx: 1,
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        color: "text.primary",
        backgroundColor: numSelected > 0 ? "secondary.light" : "",
        ...WrapperProps.sx,
      }}
    >
      <ToolbarSearch
        hidden={hideSearch}
        mobileMode={mobileMode}
        numSelected={numSelected}
        {...SearchProps}
      />

      <ToolbarActions
        hidden={hideActions}
        mobileMode={mobileMode}
        numSelected={numSelected}
        {...ActionProps}
      />
    </Paper>
  );
};

CustomDataTableToolbar.propTypes = {
  mobileMode: PropTypes.bool,
  numSelected: PropTypes.number,

  hideSearch: PropTypes.bool,
  SearchProps: PropTypes.exact({
    searchBusy: PropTypes.bool,
    hidden: PropTypes.bool,
    disabled: PropTypes.bool,
    defaultValue: PropTypes.string,
    onChange: PropTypes.func,
    ignoreActiveFilters: PropTypes.bool,
    onCheckIgnoreActiveFilters: PropTypes.func,
  }),
  hideActions: PropTypes.bool,
  ActionProps: PropTypes.exact({
    size: PropTypes.oneOf(["small", "medium", "large"]),
    color: PropTypes.string,

    //Views
    onClickViews: PropTypes.func,
    hideViews: PropTypes.bool,
    disableViews: PropTypes.bool,
    hasActiveView: PropTypes.bool,

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
  }),
  WrapperProps: PropTypes.object,
};

CustomDataTableToolbar.defaultProps = {
  SearchProps: {},
  ActionProps: {},
  WrapperProps: {},
};

export default CustomDataTableToolbar;
