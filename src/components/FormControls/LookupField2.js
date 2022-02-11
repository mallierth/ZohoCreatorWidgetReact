import React, { useEffect, useState } from "react";
import { useRecoilValue, useRecoilState } from "recoil";
import PropTypes from "prop-types";
import { useZohoGetAllRecords } from "../Helpers/CustomHooks";
import {
  AppBar,
  Box,
  Breadcrumbs,
  Button,
  Container,
  Dialog,
  Drawer,
  IconButton,
  InputAdornment,
  Link,
  TextField,
  Toolbar,
  Typography,
  Paper,
} from "@mui/material";
import {
  Close,
  MenuOpen,
  OpenInBrowser,
  OpenInNew,
  Tab,
} from "@mui/icons-material";
import {
  appMaxWidthState,
  currentUserState,
  applicationTabsState,
} from "../../recoil/atoms";
import useMediaQuery from "@mui/material/useMediaQuery";
import ContextMenu from "../Helpers/ContextMenu";
import DatabaseDefaultIcon from "../Helpers/DatabaseDefaultIcon";
import CustomTable from "../CustomTable/CustomTable";
import * as columns from "../CustomDataTable/columns";
import * as filterColumns from "../CustomDataTable/filterColumns";
import { useTheme } from "@mui/material/styles";
import {
  camelize,
  plurifyFormName,
  startsWithVowel,
} from "../Helpers/functions";
import RenderPopup from "../Helpers/RenderPopup";
import RenderForm from "../Helpers/RenderForm";
import { getNameFn } from "../Helpers/functions";
import { v4 as uuid } from "uuid";
import CustomDataGridOverlayDialog from "../Modals/CustomDataGridOverlayDialog";
import CustomDataTable, {
  ToolbarTitle,
} from "../CustomDataTable/CustomDataTable";
import ResponsiveDialog from "../Modals/ResponsiveDialog";
const formatValue = (value) => {
  if (!value) return;

  if (Array.isArray(value)) {
    return value.map((dv) => dv.display_value).join(", ");
  } else if (typeof value === "object") {
    return value.display_value;
  } else {
    return value;
  }
};

const LookupField = ({
  name,
  label = name.replaceAll("_", " "),
  formName = name,
  reportName = name.endsWith("y")
    ? name.substring(0, name.length - 1) + "ies"
    : name + "s", //Opportunity => Opportunit + ies
  defaultCriteria,
  defaultValue = "",
  onChange,
  defaultSortByColumn,
  displayValueKey = defaultSortByColumn,
  required,
  multiSelect,
  startAdornment,
  endAdornment,
  error,
  helperText,
  overrideDialogZindex,
  disableContextMenu,
  referenceFormName,

  maxHeight,
}) => {
  const theme = useTheme();
  const desktopMode = useMediaQuery(theme.breakpoints.up("sm"));
  const [applicationTabs, setApplicationTabs] =
    useRecoilState(applicationTabsState);
  const [tableDialogOpen, setTableDialogOpen] = useState(false);
  const [formDialog, setFormDialog] = useState({
    open: false,
    ID: "",
    lookupFieldDisplayText: "",
  });
  const [selections, setSelections] = useState([]);
  const [saveBtnDisabled, setSaveBtnDisabled] = useState(true);
  const [value, setValue] = useState(
    defaultValue ? formatValue(defaultValue) : ""
  );

  const referenceChildDataState = useZohoGetAllRecords(
    referenceFormName ? plurifyFormName(referenceFormName) : null,
    defaultValue
      ? Array.isArray(defaultValue)
        ? defaultValue.map((value) => `Reference==${value.ID}`).join(" || ")
        : typeof defaultValue === "object"
        ? `Reference==${defaultValue.ID}`
        : `Reference==${defaultValue}`
      : null
  );

  const appMaxWidth = useRecoilValue(appMaxWidthState);

  const handleInputClicked = (e) => {
    e.stopPropagation();
    setTableDialogOpen(true);
  };

  useEffect(() => {
    //This useEffect enabled a reset from the parent to update the value of the TextField
    if (Array.isArray(defaultValue) && defaultValue.length > 0) {
      setValue(
        defaultValue
          .map((v) =>
            v[displayValueKey] ? v[displayValueKey] : v.display_value
          )
          .join(", ")
      );
    } else if (Array.isArray(defaultValue)) {
      setValue("");
    } else if (typeof defaultValue === "object") {
      setValue(
        defaultValue[displayValueKey]
          ? defaultValue[displayValueKey]
          : defaultValue.display_value
      );
    } else if (defaultValue === "") {
      setValue("");
    }
  }, [defaultValue]);

  const _onChange = (data) => {
    setSelections(data);

    //Note the required bool here
    if (
      (Array.isArray(data) && required && data.length === 0) ||
      !Array.isArray(data)
    ) {
      setSaveBtnDisabled(true);
    } else {
      setSaveBtnDisabled(false);
    }
  };

  const onSave = () => {
    if (onChange && selections.length === 0) {
      onChange("");
    } else if (onChange && multiSelect) {
      onChange(
        selections.map((selection) => ({
          ID: selection.ID,
          display_value: selection[displayValueKey],
        }))
      );
    } else if (onChange) {
      onChange({
        ID: selections[0].ID,
        display_value: selections[0][displayValueKey],
      });
    }

    setTableDialogOpen(false);
  };

  const formatDrawerTitle = () => {
    if (multiSelect) {
      //Select Accounts
      return `Select ${
        label.endsWith("y")
          ? `${label.substring(0, label.length - 1)}ies`
          : label.endsWith("s")
          ? label
          : `${label}s`
      }`;
    }

    //Select an Account
    if (startsWithVowel(label)) {
      return `Select an ${label}`;
    }

    //Select a Quote
    return `Select a ${label}`;
  };

  const getDrawerTitle = (formName) => {
    return (
      <Box sx={{ display: "flex" }}>
        <DatabaseDefaultIcon form={formName} sx={{ mr: 0.75 }} />
        <Typography
          component="span"
          sx={{ mr: 0.75 }}
        >{`Editing ${formName.replaceAll("_", " ")}`}</Typography>
        <Typography component="span" sx={{ fontWeight: "bold" }}>
          {formDialog.lookupFieldDisplayText}
        </Typography>
      </Box>
    );
  };

  const renderMenuItems = () => {
    let referenceChildData = referenceChildDataState?.data || []; //! Always an array

    if (selections.length > 0) {
      //Need to have to menuItems per selection
      let _returnArr = [];
      selections.map((selection) => {
        //Open in Drawer
        // _returnArr.push({
        //   label: `Open ${
        //     referenceFormName
        //       ? referenceFormName?.replaceAll("_", " ")
        //       : referenceFormName
        //       ? referenceFormName?.replaceAll("_", " ")
        //       : formName?.replaceAll("_", " ")
        //   }: ${getNameFn(
        //     referenceFormName ? referenceFormName : formName,
        //     selection
        //   )}`,
        //   icon: (
        //     <DatabaseDefaultIcon
        //       form={referenceFormName ? referenceFormName : formName}
        //     />
        //   ),
        //   onClick: () =>
        //     setFormDialog({
        //       open: true,
        //       ID: referenceFormName
        //         ? referenceChildData.filter(
        //             (ref) => ref?.Reference?.ID === selection.ID
        //           )[0].ID
        //         : selection.ID,
        //       lookupFieldDisplayText: getNameFn(
        //         referenceFormName ? referenceFormName : formName,
        //         selection
        //       ),
        //     }),
        // });

        //Open in Current Tab
        // _returnArr.push({
        //   label: `Open ${
        //     referenceFormName
        //       ? referenceFormName?.replaceAll("_", " ")
        //       : formName?.replaceAll("_", " ")
        //   }: ${getNameFn(
        //     referenceFormName ? referenceFormName : formName,
        //     selection
        //   )} in Current Tab`,
        //   icon: <Tab />,
        //   onClick: () =>
        //     setApplicationTabs((old) => [
        //       ...old,
        //       {
        //         uuid: uuid(),
        //         label: `${
        //           referenceFormName
        //             ? referenceFormName?.replaceAll("_", " ")
        //             : formName?.replaceAll("_", " ")
        //         }: ${getNameFn(
        //           referenceFormName ? referenceFormName : formName,
        //           selection
        //         )}`,
        //         type: "form",
        //         id: referenceFormName
        //           ? referenceChildData.filter(
        //               (ref) => ref?.Reference?.ID === selection.ID
        //             )[0].ID
        //           : selection.ID,
        //         formName: referenceFormName ? referenceFormName : formName,
        //         reportName: referenceFormName
        //           ? plurifyFormName(referenceFormName)
        //           : reportName,
        //         loadData: referenceFormName
        //           ? referenceChildData.filter(
        //               (ref) => ref?.Reference?.ID === selection.ID
        //             )[0]
        //           : selection,
        //       },
        //     ]),
        // });

        //Open in New Tab
        _returnArr.push({
          label: `Open ${
            referenceFormName
              ? referenceFormName?.replaceAll("_", " ")
              : formName?.replaceAll("_", " ")
          }: ${getNameFn(
            referenceFormName ? referenceFormName : formName,
            selection
          )} in a New Tab`,
          icon: <Tab />,
          onClick: () =>
            setApplicationTabs((old) => [
              ...old.map((o) => ({ ...o, active: false })),
              {
                uuid: uuid(),
                label: `${
                  referenceFormName
                    ? referenceFormName?.replaceAll("_", " ")
                    : formName?.replaceAll("_", " ")
                }: ${getNameFn(
                  referenceFormName ? referenceFormName : formName,
                  selection
                )}`,
                type: "form",
                id: referenceFormName
                  ? referenceChildData.filter(
                      (ref) => ref?.Reference?.ID === selection.ID
                    )[0].ID
                  : selection.ID,
                name: referenceFormName ? referenceFormName : formName,
                formName: referenceFormName ? referenceFormName : formName,
                reportName: referenceFormName
                  ? plurifyFormName(referenceFormName)
                  : reportName,
                loadData: referenceFormName
                  ? referenceChildData.filter(
                      (ref) => ref?.Reference?.ID === selection.ID
                    )[0]
                  : selection,
                active: true,
              },
            ]),
        });
      });

      return _returnArr;
    }

    if (defaultValue) {
      let _returnArr = [];
      if (Array.isArray(defaultValue)) {
        //Open in Drawer
        defaultValue.map((value) => {
          // _returnArr.push({
          //   label: `Open ${
          //     referenceFormName
          //       ? referenceFormName?.replaceAll("_", " ")
          //       : formName?.replaceAll("_", " ")
          //   }: ${value.display_value}`,
          //   icon: (
          //     <DatabaseDefaultIcon
          //       form={referenceFormName ? referenceFormName : formName}
          //     />
          //   ),
          //   onClick: () =>
          //     setFormDialog({
          //       open: true,
          //       ID: referenceFormName
          //         ? referenceChildData.filter(
          //             (ref) => ref?.Reference?.ID === value.ID
          //           )[0].ID
          //         : value.ID,
          //       lookupFieldDisplayText: value.display_value,
          //     }),
          // });

          //Open in New Tab
          _returnArr.push({
            label: `Open ${
              referenceFormName
                ? referenceFormName?.replaceAll("_", " ")
                : formName?.replaceAll("_", " ")
            }: ${value.display_value} in a New Tab`,
            icon: <Tab />,
            onClick: () =>
              setApplicationTabs((old) => [
                ...old.map((o) => ({ ...o, active: false })),
                {
                  uuid: uuid(),
                  label: `${
                    referenceFormName
                      ? referenceFormName?.replaceAll("_", " ")
                      : formName?.replaceAll("_", " ")
                  }: ${value.display_value}`,
                  type: "form",
                  id: referenceFormName
                    ? referenceChildData.filter(
                        (ref) => ref?.Reference?.ID === value.ID
                      )[0].ID
                    : value.ID,
                  name: referenceFormName ? referenceFormName : formName,
                  formName: referenceFormName ? referenceFormName : formName,
                  reportName: referenceFormName
                    ? plurifyFormName(referenceFormName)
                    : reportName,
                  loadData: referenceFormName
                    ? referenceChildData.filter(
                        (ref) => ref?.Reference?.ID === value.ID
                      )[0]
                    : value,
                  active: true,
                },
              ]),
          });
        });

        return _returnArr;
      } else if (typeof defaultValue === "object") {
        let _returnArr = [];
        //Open in Drawer
        // _returnArr.push({
        //   label: `Open ${
        //     referenceFormName
        //       ? referenceFormName?.replaceAll("_", " ")
        //       : formName?.replaceAll("_", " ")
        //   }: ${defaultValue.display_value}`,
        //   icon: (
        //     <DatabaseDefaultIcon
        //       form={referenceFormName ? referenceFormName : formName}
        //     />
        //   ),
        //   onClick: () =>
        //     setFormDialog({
        //       open: true,
        //       ID: referenceFormName
        //         ? referenceChildData.filter(
        //             (ref) => ref?.Reference?.ID === defaultValue.ID
        //           )[0].ID
        //         : defaultValue.ID,
        //       lookupFieldDisplayText: defaultValue.display_value,
        //     }),
        // });

        //Open in New Tab
        _returnArr.push({
          label: `Open ${
            referenceFormName
              ? referenceFormName?.replaceAll("_", " ")
              : formName?.replaceAll("_", " ")
          }: ${defaultValue.display_value} in a New Tab`,
          icon: <Tab />,
          onClick: () =>
            setApplicationTabs((old) => [
              ...old.map((o) => ({ ...o, active: false })),
              {
                uuid: uuid(),
                label: `${
                  referenceFormName
                    ? referenceFormName?.replaceAll("_", " ")
                    : formName?.replaceAll("_", " ")
                }: ${defaultValue.display_value}`,
                type: "form",
                id: referenceFormName
                  ? referenceChildData.filter(
                      (ref) => ref?.Reference?.ID === defaultValue.ID
                    )[0].ID
                  : defaultValue.ID,
                name: referenceFormName ? referenceFormName : formName,
                formName: referenceFormName ? referenceFormName : formName,
                reportName: referenceFormName
                  ? plurifyFormName(referenceFormName)
                  : reportName,
                loadData: referenceFormName
                  ? referenceChildData.filter(
                      (ref) => ref?.Reference?.ID === defaultValue.ID
                    )[0]
                  : defaultValue,
                active: true,
              },
            ]),
        });

        return _returnArr;
      }
    }

    //console.error('LookupField2 renderMenuItems: no conditions met!');
    return [];
  };

  return (
    <>
      {disableContextMenu || referenceFormName === false ? (
        <Box
          onClick={(e) => handleInputClicked(e)}
          className={formDialog.open ? "LookupField-open" : ""}
        >
          <TextField
            name={name}
            label={label}
            value={value}
            error={error}
            required={required}
            helperText={helperText}
            onClick={(e) => e.preventDefault()}
            onChange={(e) => e.preventDefault()}
            InputProps={{
              startAdornment: startAdornment ? (
                <InputAdornment position="start">
                  {startAdornment}
                </InputAdornment>
              ) : null,
              endAdornment: endAdornment ? (
                <InputAdornment position="end">{endAdornment}</InputAdornment>
              ) : null,
            }}
          />
        </Box>
      ) : (
        <ContextMenu
          menuItems={[
            ...[
              {
                label: `Update ${label} Field`,
                icon: <MenuOpen />,
                onClick: () => setTableDialogOpen(true),
              },
            ],
            ...renderMenuItems(),
          ]}
        >
          <Box
            onClick={(e) => handleInputClicked(e)}
            className={formDialog.open ? "LookupField-open" : ""}
          >
            <TextField
              name={name}
              label={label}
              value={value}
              error={error}
              required={required}
              helperText={helperText}
              onClick={(e) => e.preventDefault()}
              onChange={(e) => e.preventDefault()}
              InputProps={{
                startAdornment: startAdornment ? (
                  <InputAdornment position="start">
                    {startAdornment}
                  </InputAdornment>
                ) : null,
                endAdornment: endAdornment ? (
                  <InputAdornment position="end">{endAdornment}</InputAdornment>
                ) : null,
              }}
            />
          </Box>
        </ContextMenu>
      )}

      <RenderPopup
        open={tableDialogOpen}
        onClose={() => setTableDialogOpen(false)}
        overrideDialogZindex={overrideDialogZindex}
        title={
          <Breadcrumbs
            sx={{
              display: { xs: "none", sm: "flex" },
              color: "primary.contrastText",
            }}
          >
            <Link
              sx={{ display: "flex", alignItems: "center" }}
              color="inherit"
              underline="none"
            >
              <DatabaseDefaultIcon form={formName} sx={{ mr: 1 }} />
              {formatDrawerTitle()}
            </Link>
          </Breadcrumbs>
        }
      >
        <>
          <CustomDataTable
            formName={formName}
            reportName={reportName}
            forcedCriteria={defaultCriteria}
            defaultSelections={defaultValue}
            height={
              window.innerHeight - 4 * theme.mixins.toolbar.minHeight - 32
            }
            disableOpenOnRowClick
            DataGridProps={{
              checkboxSelection: true,
              disableMultipleSelection: !multiSelect,
            }}
            WrapperProps={{
              elevation: 4,
            }}
            columns={
              columns[`${camelize(formName.replaceAll("_", ""))}Columns`]
            }
            filterColumns={
              filterColumns[
                `${camelize(formName.replaceAll("_", ""))}FilterColumns`
              ]
            }
            onChange={_onChange}
          />
          <Box sx={{ pt: 2 }}></Box>

          <AppBar color="inherit" position="relative" sx={{ bottom: 0 }}>
            <Container
              maxWidth="xl"
              disableGutters
              sx={{ maxWidth: { xs: appMaxWidth } }}
            >
              <Toolbar
                sx={{
                  minHeight: { xs: 51 },
                  display: "flex",
                  justifyContent: "flex-end",
                }}
              >
                <Button
                  onClick={() => setTableDialogOpen(false)}
                  sx={{ mr: 2 }}
                >
                  Close
                </Button>
                <Button
                  onClick={onSave}
                  disabled={saveBtnDisabled}
                  color="secondary"
                  variant="contained"
                >
                  Save
                </Button>
              </Toolbar>
            </Container>
          </AppBar>
        </>
      </RenderPopup>

      {/* <ResponsiveDialog
        sixe="xl"
        open={tableDialogOpen}
        onClose={() => setTableDialogOpen(false)}
        title={
          <Box sx={{ width: "100%", display: "flex" }}>
            <DatabaseDefaultIcon form={formName} />
            <Typography sx={{ ml: 2 }}>{formatDrawerTitle()}</Typography>
          </Box>
        }
        color='secondary'
        disableContentPadding
      >
        <>
          <CustomDataTable
            formName={formName}
            reportName={reportName}
            forcedCriteria={defaultCriteria}
            defaultSelections={defaultValue}
            height={window.innerHeight - 5 * theme.mixins.toolbar.minHeight - 16}
            DataGridProps={{
              checkboxSelection: true,
              disableSelectionOnClick: true,
              disableMultipleSelection: !multiSelect,
            }}
            WrapperProps={{
              elevation: 4,
            }}
            columns={
              columns[`${camelize(formName.replaceAll("_", ""))}Columns`]
            }
            filterColumns={
              filterColumns[
                `${camelize(formName.replaceAll("_", ""))}FilterColumns`
              ]
            }
            onChange={_onChange}
          />

          <AppBar color="inherit" position="relative">
            <Container
              maxWidth="xl"
              disableGutters
              sx={{ maxWidth: { xs: appMaxWidth } }}
            >
              <Toolbar
                sx={{
                  minHeight: { xs: 51 },
                  display: "flex",
                  justifyContent: "flex-end",
                }}
              >
                <Button
                  onClick={() => setTableDialogOpen(false)}
                  sx={{ mr: 2 }}
                >
                  Close
                </Button>
                <Button
                  onClick={onSave}
                  disabled={saveBtnDisabled}
                  color="secondary"
                  variant="contained"
                >
                  Save
                </Button>
              </Toolbar>
            </Container>
          </AppBar>
        </>
      </ResponsiveDialog> */}

      {/* <RenderPopup
        open={formDialog.open}
        onClose={() => setFormDialog((old) => ({ ...old, open: false }))}
        overrideDialogZindex={overrideDialogZindex}
        title={getDrawerTitle(referenceFormName ? referenceFormName : formName)}
      >
        <RenderForm
          id={formDialog.ID}
          formName={referenceFormName ? referenceFormName : formName}
          maxHeight={maxHeight}
        />
      </RenderPopup> */}

      <CustomDataGridOverlayDialog
        width="100%"
        open={formDialog.open}
        onClose={() => setFormDialog((old) => ({ ...old, open: false }))}
        title={getDrawerTitle(referenceFormName ? referenceFormName : formName)}
      >
        <RenderForm
          id={formDialog.ID}
          formName={referenceFormName ? referenceFormName : formName}
          onChange={() => {}}
          maxHeight={maxHeight}
        />
      </CustomDataGridOverlayDialog>
    </>
  );
};

LookupField.propTypes = {
  name: PropTypes.string.isRequired, //Required to produce formName
  label: PropTypes.string, //Default: use name.replaceAll(' ', '');
  formName: PropTypes.string, //Default: use name.replaceAll(' ', '_');
  reportName: PropTypes.string, //Default: use name.replaceAll(' ', '_') + 's';
  onChange: PropTypes.func,
  defaultValue: PropTypes.oneOfType([
    PropTypes.object,
    PropTypes.array,
    PropTypes.string,
  ]),
  required: PropTypes.bool,
  multiSelect: PropTypes.bool,
  defaultSortByColumn: PropTypes.string.isRequired,
  displayValueKey: PropTypes.string,
  startAdornment: PropTypes.element,
  endAdornment: PropTypes.element,
  error: PropTypes.bool,
  helperText: PropTypes.string,
  overrideDialogZindex: PropTypes.bool,
  disableContextMenu: PropTypes.bool,
  defaultCriteria: PropTypes.string,
  referenceFormName: PropTypes.oneOfType([PropTypes.bool, PropTypes.string]),
};

LookupField.defaultProps = {
  multiSelect: false,
};

export default LookupField;
