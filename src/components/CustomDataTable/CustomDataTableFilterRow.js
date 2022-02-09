import React, { useEffect, useState } from "react";
import PropTypes from "prop-types";
import {
  Box,
  Checkbox,
  IconButton,
  MenuItem,
  TextField,
} from "@mui/material";
import { Close } from "@mui/icons-material";
import TextFieldDateTime from "../FormControls/TextFieldDateTime";
import {
  operators,
  filterValueFieldRenderType,
  filterValueFieldDisabled,
  getCriteria,
} from "./helperFunctions";

/**
 * State will be managed internally and publish updates via an onChange function.
 * jsonData prop will be updated when a successful save of a view is triggered
 */

const CustomDataTableFilterRow = ({
  hideClose,
  fieldOptions,
  jsonData,
  onChange,
  onClose,
  error,
  onError,
  ignoreConditionError,
  child,
}) => {
  const [conditionValue, setConditionValue] = useState(jsonData.condition);
  const [fieldValue, setFieldValue] = useState(jsonData.field);
  const fieldValueDefinition =
    fieldOptions.filter((op) => op.field === fieldValue).length > 0
      ? fieldOptions.filter((op) => op.field === fieldValue)[0]
      : {};
  const operatorOptions = operators(fieldValueDefinition?.type);
  const [operatorValue, setOperatorValue] = useState(jsonData.operator);
  const valueFieldToRender = filterValueFieldRenderType(
    fieldValueDefinition.type,
    operatorValue
  );
  const [value, setValue] = useState(jsonData.value);
  const [value2, setValue2] = useState(jsonData.value2); //TODO
  const operatorDisabled =
    (!ignoreConditionError && !conditionValue) || !fieldValue;
  const valueDisabled =
    (!ignoreConditionError && !conditionValue) ||
    !fieldValue ||
    !operatorValue ||
    filterValueFieldDisabled(operatorValue);

  const [data, setData] = useState(jsonData); //Internal jsonData state, changes are published

  const [conditionError, setConditionError] = useState(false);
  const [fieldError, setFieldError] = useState(false);
  const [operatorError, setOperatorError] = useState(false);
  const [valueError, setValueError] = useState(false);

  //? Trigger change to outside if data has been legitimately updated
  useEffect(() => {
    if (onChange) {
      onChange(data);
    }
  }, [jsonData, data, onChange]);

  //? Selected oeprator changed
  useEffect(() => {
    const criteriaString = getCriteria(
      valueFieldToRender,
      operatorValue,
      fieldValue,
      value,
      value2
    );
    const _data = {
      ...data,
      condition: conditionValue,
      operator: operatorValue,
      field: fieldValue,
      value,
      value2,
      criteriaString,
    };
    setData((oldData) =>
      !oldData || JSON.stringify(oldData) !== JSON.stringify(_data)
        ? _data
        : oldData
    );
  }, [
    conditionValue,
    fieldValue,
    operatorValue,
    value,
    value2,
    data,
    valueFieldToRender,
  ]);

  //? Errors
  useEffect(() => {
    if (ignoreConditionError && (fieldError || operatorError || valueError)) {
      onError(true);
    } else if (conditionError || fieldError || operatorError || valueError) {
      onError(true);
    } else {
      onError(false);
    }
  }, [conditionError, fieldError, operatorError, valueError]);

  return (
    <Box
      sx={{
        display: "flex",
        alignItems: "center",
        justifyContent: child ? "flex-end" : "normal",
        "& .MuiTextField-root": { m: 1, width: child ? "17.5ch" : "25ch" },
      }}
    >
      {/* Close Button */}
      <IconButton size="small" onClick={() => onClose()}>
        <Close fontSize="inherit" />
      </IconButton>

      {/* Condition AND/OR */}
      <TextField
        sx={{ visibility: hideClose ? "hidden" : "visible" }}
        error={error && conditionError && !ignoreConditionError}
        select
        label="Condition"
        value={conditionValue}
        variant="standard"
        color="secondary"
        onChange={(e) => setConditionValue(e.target.value)}
      >
        {["AND", "OR"].map((op) => (
          <MenuItem key={op} value={op}>
            {op}
          </MenuItem>
        ))}
      </TextField>

      {/* Selectable Form Fields  */}
      <TextField
        select
        error={error && !fieldValue}
        label="Field"
        value={fieldValue}
        variant="standard"
        color="secondary"
        onChange={(e) => setFieldValue(e.target.value)}
      >
        {fieldOptions.map((col) => (
          <MenuItem key={col.field} value={col.field}>
            {col.headerName ? col.headerName : col?.field?.replaceAll("_", " ")}
          </MenuItem>
        ))}
      </TextField>

      {/* Operators Options for Selected Form Field */}
      <TextField
        select={Boolean(operatorOptions && Array.isArray(operatorOptions))}
        error={error && operatorError}
        label="Operator"
        value={operatorValue}
        variant="standard"
        color="secondary"
        disabled={operatorDisabled}
        onChange={(e) => setOperatorValue(e.target.value)}
      >
        {operatorOptions && Array.isArray(operatorOptions)
          ? operatorOptions.map((option) => (
              <MenuItem key={option} value={option}>
                {option}
              </MenuItem>
            ))
          : null}
      </TextField>

      {/* Value - Changes based on Operator */}
      {valueFieldToRender === "bool" ? (
        <Checkbox
          checked={Boolean(value)}
          color="secondary"
          disabled={valueDisabled}
          onChange={(e) => setValue(e.target.checked)}
        />
      ) : valueFieldToRender === "date" ||
        valueFieldToRender === "time" ||
        valueFieldToRender === "dateTime" ? (
        <TextFieldDateTime
          label="Value"
          error={error && valueError}
          value={value}
          color="secondary"
          variant="standard"
          type={valueFieldToRender}
          disabled={valueDisabled}
          onChange={(e) => setValue(e)}
        />
      ) : (
        <TextField
          select={Boolean(
            fieldValueDefinition?.valueOptions &&
              (Array.isArray(fieldValueDefinition.valueOptions) ||
                typeof fieldValueDefinition.valueOptions === "function")
          )}
          label="Value"
          error={error && valueError}
          value={value || ""}
          color="secondary"
          variant="standard"
          type={valueFieldToRender === "number" ? "number" : "text"}
          disabled={valueDisabled}
          onChange={(e) => setValue(e.target.value)}
        >
          {fieldValueDefinition.valueOptions &&
          Array.isArray(fieldValueDefinition.valueOptions)
            ? fieldValueDefinition.valueOptions.map((option) => (
                <MenuItem key={option} value={option}>
                  {option}
                </MenuItem>
              ))
            : fieldValueDefinition?.valueOptions &&
              typeof fieldValueDefinition.valueOptions === "function"
            ? fieldValueDefinition.valueOptions().map((option) => (
                <MenuItem key={option} value={option}>
                  {option}
                </MenuItem>
              ))
            : null}
        </TextField>
      )}
    </Box>
  );
};

CustomDataTableFilterRow.propTypes = {
  fieldOptions: PropTypes.array.isRequired,

  hideClose: PropTypes.bool,

  onChange: PropTypes.func.isRequired,
  onClose: PropTypes.func.isRequired,
  error: PropTypes.bool,
  onError: PropTypes.func.isRequired,
  ignoreConditionError: PropTypes.bool,
  child: PropTypes.bool,

  jsonData: PropTypes.exact({
    condition: PropTypes.oneOf(["", "AND", "OR"]),
    field: PropTypes.string,
    operator: PropTypes.string,
    value: PropTypes.string,
    value2: PropTypes.string,
    criteriaString: PropTypes.string,
    childCriteria: PropTypes.arrayOf(
      PropTypes.exact({
        condition: PropTypes.oneOf(["", "AND", "OR"]),
        field: PropTypes.string,
        operator: PropTypes.string,
        value: PropTypes.string,
        value2: PropTypes.string,
        criteriaString: PropTypes.string,
      })
    ),
  }),
};

export default CustomDataTableFilterRow;
