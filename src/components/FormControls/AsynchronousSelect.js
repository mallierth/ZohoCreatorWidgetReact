//import { useWhyDidYouUpdate } from 'use-why-did-you-update';
import React, { useState, useEffect } from "react";
import PropTypes from "prop-types";
import { omit } from "lodash-es";
import { TextField, CircularProgress } from "@mui/material";
import { getAllRecords } from "../../apis/ZohoCreator";
import { useDataUpdater, useSetFormError } from "../Helpers/FormDataContext";
import Autocomplete, {
  createFilterOptions,
} from "@mui/material/Autocomplete";
import RenderForm from "../Helpers/RenderForm";

const filter = createFilterOptions();

const AsynchronousSelect = React.memo(
  ({
    name,
    label,
    reportName,
    criteria,
    displayKey,
    multiple,
    allowNew,
    addNewDialogSize,
    formName,
    max,
    defaultValue,
    required,
    ...props
  }) => {
    const [open, setOpen] = useState(false);
    const [dialogOpen, setDialogOpen] = useState(false);
    const [dialogLoadData, setDialogLoadData] = useState({});
    const [options, setOptions] = useState([]);
    const [error, setError] = useState(required && !defaultValue);
    const [helperText, setHelperText] = useState(props.helperText);
    const loading = open && options.length === 0;
    //const value = data[name] ? {name: data[name].display_value, value: data[name].ID } : null;
    const [value, setValue] = useState(multiple ? [] : null);
    const setUpdatedData = useDataUpdater();
    const setFormError = useSetFormError();
    //const setUpdatedData = useSetRecoilState(updatedFormDataState);
    //value, defaultValue, onChange
    /*
    const childFn = useCallback(
        newVal => {
            propsFn ? propsFn(newVal) : () => {};
        }, [childFn]
    )
    */

    useEffect(() => {
      if (multiple && !defaultValue) {
        setValue([]);
      } else if (!multiple && !defaultValue) {
        setValue(null);
      } else if (multiple && defaultValue.length > 0) {
        setValue(defaultValue);
      } else if (Object.keys(defaultValue).length > 0) {
        setValue(defaultValue);
      }
    }, [defaultValue]);

    useEffect(() => {
      if (value && JSON.stringify(value) !== JSON.stringify(defaultValue)) {
        setUpdatedData((data) => ({ ...data, [name]: value }));
      } else if (
        value === null ||
        JSON.stringify(value) === JSON.stringify(defaultValue)
      ) {
        setUpdatedData((data) => omit(data, name));
      }

      if (
        required &&
        ((!multiple && !value) || (multiple && value.length === 0))
      ) {
        setError(true);
        setHelperText("Please enter a value.");
      } else {
        setError(false);
        setHelperText(props.helperText);
      }
    }, [value]);

    useEffect(() => {
      setFormError((data) => ({ ...data, [name]: error }));
    }, [error]);

    useEffect(() => {
      let active = true;

      if (!loading && dialogOpen) {
        return undefined;
      }

      (async () => {
        const response = await getAllRecords(reportName, criteria, 1, 200);
        if (active && response && response.length > 0) {
          let ops = response.map((r) => ({
            display_value: r[displayKey],
            ID: r.ID,
          }));
          setOptions(
            ops.sort((a, b) => (a.display_value > b.display_value ? 1 : -1))
          );
        } else {
          setDialogOpen(true);
        }
      })();

      return () => {
        active = false;
      };
    }, [loading, dialogOpen]);

    return <>
      <Autocomplete
        multiple={multiple}
        disableCloseOnSelect={multiple}
        name={name}
        label={label}
        open={open}
        onOpen={() => {
          setOpen(true);
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
        selectOnFocus
        clearOnBlur
        handleHomeEndKeys
        freeSolo={allowNew}
        value={value}
        //onChange={(e, newVal) => setValue(newVal)}
        onChange={(e, newValue) => {
          //? inputValue basically flags an input as being custom, this functionality is driven by the filterOptions function. The key is arbitrarily named.
          if (typeof newValue === "string") {
            setDialogLoadData({ display_value: newValue });
            setDialogOpen(true);
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
            setDialogLoadData({
              [displayKey]: newValue
                .map((v) => (v.inputValue ? v.inputValue : null))
                .filter((v) => v)[0],
            });
            setDialogOpen(true);
          } else if (newValue && newValue.inputValue) {
            setDialogLoadData({ display_value: newValue.inputValue });
            setDialogOpen(true);
          } else {
            if (!multiple || (multiple && !max)) {
              setValue(newValue);
            } else if (
              multiple &&
              Array.isArray(newValue) &&
              newValue.length <= max
            ) {
              setValue(newValue);
            }
          }
        }}
        filterOptions={(options, params) => {
          const filtered = filter(options, params);

          if (!allowNew) {
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
        renderInput={(params) => (
          <TextField
            {...omit(params, [
              "reportName",
              "displayKey",
              "initialSelections",
              "showShiftControls",
            ])}
            required={required}
            helperText={helperText}
            error={error}
            variant="standard"
            label={label}
            InputProps={{
              ...params.InputProps,
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

      <RenderForm
        openInDialog
        dialogSize={addNewDialogSize}
        dialogTitle={
          value && value.ID
            ? `Edit ${formName.replace("_", " ")}`
            : `Add new ${formName.replace("_", " ")}`
        }
        dialogOpen={dialogOpen}
        id={value ? value.ID : null}
        formName={formName}
        loadData={dialogLoadData}
        setDialogOpen={(state) => setDialogOpen(state)}
      />
    </>;
  }
);

AsynchronousSelect.propTypes = {
  addNewDialogSize: PropTypes.oneOf([
    "xs",
    "sm",
    "md",
    "lg",
    "xl",
    "fullScreen",
  ]),
  allowNew: PropTypes.bool,
  criteria: PropTypes.string,
  defaultValue: PropTypes.oneOfType([PropTypes.array, PropTypes.object]),
  displayKey: PropTypes.string,
  formName: PropTypes.string.isRequired,
  helperText: PropTypes.string,
  label: PropTypes.string.isRequired,
  name: PropTypes.string.isRequired,
  max: PropTypes.number,
  multiple: PropTypes.bool,
  reportName: PropTypes.string.isRequired,
  required: PropTypes.bool,
};

AsynchronousSelect.defaultProps = {
  addNewDialogSize: "md",
  helperText: "",
};

export default AsynchronousSelect;
