import React, { useState, useEffect } from "react";
import PropTypes from "prop-types";
import { useRecoilValue } from "recoil";
import {
  AppBar,
  CircularProgress,
  Drawer,
  IconButton,
  TextField,
  Toolbar,
  Typography,
} from "@mui/material";
import { Close } from "@mui/icons-material";
import { formMaxWidthState } from "../../recoil/atoms";
import { getAllRecords } from "../../apis/ZohoCreator";
import Autocomplete, { createFilterOptions } from "@mui/material/Autocomplete";
import RenderForm from "../Helpers/RenderForm";

const filter = createFilterOptions();

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

const AsynchronousSelect = React.memo(
  ({
    name,
    label = name.replaceAll("_", " "),
    formName = name,
    reportName = name.endsWith("y")
      ? name.substring(0, name.length - 1) + "ies"
      : name + "s",
    criteria,
    defaultValue = "",
    onChange,
    freeSolo,
    displayValueKey,
    required,
    multiSelect,
    maxSelections,
    error,
    helperText,
    fullWidth,
    optionData,
    overrideOptions,
    sx,
    readOnly,
  }) => {
    const formMaxWidth = useRecoilValue(formMaxWidthState);
    const [open, setOpen] = useState(false);
    const [formOpen, setFormOpen] = useState(false);
    const [formId, setFormId] = useState(null);
    const [newOptionFormData, setNewOptionFormData] = useState({});
    const [options, setOptions] = useState(overrideOptions);
    const loading = open && options.length === 0;
    //const value = data[name] ? {name: data[name].display_value, value: data[name].ID } : null;
    const [value, setValue] = useState(
      defaultValue ? defaultValue : multiSelect ? [] : null
    );

    useEffect(() => {
      if (overrideOptions) {
        let ops = overrideOptions.map((r) => ({
          display_value: r[displayValueKey],
          ID: r.ID,
        }));
        setOptions(
          ops.sort((a, b) => (a.display_value > b.display_value ? 1 : -1))
        );
      }
    }, [overrideOptions]);

    useEffect(() => {
      console.log("defaultValue", defaultValue);

      //This useEffect enabled a reset from the parent to update the value of the TextField
      if (Array.isArray(defaultValue) && defaultValue.length > 0) {
        const _value = defaultValue.map((v) => ({
          display_value: v[displayValueKey]
            ? v[displayValueKey]
            : v.display_value,
          ID: v.ID,
        }));
        setValue((old) =>
          !old || JSON.stringify(old) !== JSON.stringify(_value) ? _value : old
        );
      } else if (Array.isArray(defaultValue)) {
        setValue([]);
      } else if (typeof defaultValue === "object") {
        const _value = {
          display_value: defaultValue[displayValueKey]
            ? defaultValue[displayValueKey]
            : defaultValue.display_value,
          ID: defaultValue.ID,
        };
        setValue((old) =>
          !old || JSON.stringify(old) !== JSON.stringify(_value) ? _value : old
        );
      } else if (defaultValue === "") {
        setValue(multiSelect ? [] : null);
      }
    }, [defaultValue]);

    useEffect(() => {
      if (
        onChange &&
        JSON.stringify(value === null ? "" : value) !==
          JSON.stringify(defaultValue)
      ) {
        onChange(value === null ? "" : value); //This is to format single selects without a database value
      }
    }, [value]);

    useEffect(() => {
      let active = true;

      if (!loading) {
        return;
      }

      (async () => {
        const response = await getAllRecords(reportName, criteria, 1, 200);
        if (active && response && response.length > 0) {
          if (optionData) optionData = response;
          let ops = response.map((r) => ({
            display_value: r[displayValueKey],
            ID: r.ID,
          }));
          setOptions(
            ops.sort((a, b) => (a.display_value > b.display_value ? 1 : -1))
          );
        } else {
          //setFormOpen(true);
        }
      })();

      return () => {
        active = false;
      };
    }, [loading]);

    const onFormSave = (data) => {
      console.log(
        "AsynchronourSelect > RenderForm > onFormSave > this should update option in list"
      );
      console.log("successfulSaveData:", data);
    };

    const onFormClose = () => {
      setFormId(null);
      setFormOpen(false);
    };

    return (
      <>
        <Autocomplete
          sx={{ display: "inline-flex" }}
          multiple={multiSelect}
          disableCloseOnSelect={multiSelect}
          name={name}
          label={label}
          open={open && !readOnly}
          onOpen={() => {
            setOpen(true && !readOnly);
          }}
          onClose={() => {
            setOpen(false);
          }}
          isOptionEqualToValue={(option, value) =>
            option.display_value === value.display_value
          }
          getOptionLabel={(option) => option.display_value}
          options={options}
          loading={loading}
          //selectOnFocus
          //clearOnBlur
          //handleHomeEndKeys
          value={value}
          freeSolo={freeSolo}
          onChange={(e, newValue) => {
            //? inputValue basically flags an input as being custom, this functionality is driven by the filterOptions function. The key is arbitrarily named.
            if (typeof newValue === "string") {
              setNewOptionFormData({ display_value: newValue });
              setFormOpen(true);
            } else if (
              newValue &&
              Array.isArray(newValue) &&
              newValue
                .map((v) => (v.inputValue ? v.inputValue : null))
                .filter((v) => v) &&
              newValue
                .map((v) => (v.inputValue ? v.inputValue : null))
                .filter((v) => v).length > 0
            ) {
              setNewOptionFormData({
                [displayValueKey]: newValue
                  .map((v) => (v.inputValue ? v.inputValue : null))
                  .filter((v) => v)[0],
              });
              setFormOpen(true);
            } else if (newValue && newValue.inputValue) {
              setNewOptionFormData({ display_value: newValue.inputValue });
              setFormOpen(true);
            } else {
              if (!multiSelect || (multiSelect && !maxSelections)) {
                setValue(newValue);
              } else if (
                multiSelect &&
                Array.isArray(newValue) &&
                newValue.length <= maxSelections
              ) {
                setValue(newValue);
              }
            }
          }}
          filterOptions={(options, params) => {
            const filtered = filter(options, params);

            if (!freeSolo) {
              return filtered;
            }

            //The inputValue key is arbitrarily names but very important - it denotes custom user input in freeForm mode
            if (params.inputValue !== "") {
              filtered.push({
                inputValue: params.inputValue,
                display_value: `Add "${params.inputValue}"`, //Text format displayed to users when searching somethiing not found
              });
            }

            return filtered;
          }}
          fullWidth={fullWidth}
          renderInput={(params) => (
            <TextField
              {...params}
              required={required}
              helperText={helperText}
              error={error}
              label={label}
              fullWidth={fullWidth}
              sx={{ ...sx, }}
              InputProps={{
                ...params.InputProps,
                readOnly,
                endAdornment: (
                  <React.Fragment>
                    {loading ? (
                      <CircularProgress color="inherit" size={20} />
                    ) : null}
                    {params.InputProps.endAdornment}
                  </React.Fragment>
                ),
              }}
            />
          )}
        />

        <Drawer
          sx={{
            "& > .MuiPaper-root": {
              width: "90%",
              height: "100%",
              maxWidth: formMaxWidth,
            },
          }}
          anchor={"right"}
          open={formOpen}
          onClose={onFormClose}
        >
          <AppBar color="primary" enableColorOnDark position="relative">
            <Toolbar
              sx={{ minHeight: { xs: 51 }, justifyContent: "space-between" }}
            >
              <Typography>Title</Typography>
              <IconButton onClick={onFormClose}>
                <Close />
              </IconButton>
            </Toolbar>
          </AppBar>
          <RenderForm
            id={formId}
            formName={formName}
            successfulSaveData={onFormSave}
          />
        </Drawer>
      </>
    );
  }
);

AsynchronousSelect.displayName = "AsynchronousSelect";

AsynchronousSelect.propTypes = {
  name: PropTypes.string.isRequired,
  label: PropTypes.string, //Default: use name.replaceAll(' ', '');
  formName: PropTypes.string, //Default: use name.replaceAll(' ', '_');
  reportName: PropTypes.string, //Default: use name.replaceAll(' ', '_') + 's';
  criteria: PropTypes.string, //Default: use name.replaceAll(' ', '_') + 's';
  onChange: PropTypes.func,
  defaultValue: PropTypes.oneOfType([
    PropTypes.object,
    PropTypes.array,
    PropTypes.string,
  ]),
  required: PropTypes.bool,
  multiSelect: PropTypes.bool,
  //defaultSortByColumn: PropTypes.string.isRequired,
  displayValueKey: PropTypes.string.isRequired,
  startAdornment: PropTypes.element,
  endAdornment: PropTypes.element,
  freeSolo: PropTypes.bool,
  maxSelections: PropTypes.number,
  error: PropTypes.bool,
  helperText: PropTypes.string,
  fullWidth: PropTypes.bool,
  overrideOptions: PropTypes.array,
  sx: PropTypes.object,
};

AsynchronousSelect.defaultProps = {
  multiSelect: false,
  freeSolo: false,
  maxSelections: 10,
  error: false,
  fullWidth: true,
  overrideOptions: [],
  sx: {},
};

export default AsynchronousSelect;
