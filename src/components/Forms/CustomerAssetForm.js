//import { useWhyDidYouUpdate } from 'use-why-did-you-update';
import React, { useEffect, useRef, useState } from "react";
import PropTypes from "prop-types";
import { useRecoilValue } from "recoil";
import { omit } from "lodash";
import ThemeCard from "../ThemeCard";
import TabbedSection from "../TabbedSection/TabbedSection";
import { debugState, currentUserState } from "../../recoil/atoms";
import * as Columns from "../../recoil/columnAtoms";
import DatabaseDefaultIcon from "../Helpers/DatabaseDefaultIcon";
import LookupField2 from "../FormControls/LookupField2";
import AsynchronousSelect2 from "../FormControls/AsynchronousSelect2";
import BottomBar from "../Helpers/BottomBar";
import {
  copyTextToClipboard,
  camelize,
  intTryParse,
  plurifyFormName,
} from "../Helpers/functions";
import {
  Autocomplete,
  Box,
  Button,
  CircularProgress,
  Divider,
  Grid,
  IconButton,
  ListItemIcon,
  ListItemText,
  Menu,
  MenuItem,
  Paper,
  Tab,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Tooltip,
  Typography,
} from "@mui/material";
import {
  Block,
  DeleteForever,
  Email,
  ExpandMore,
  FactCheck,
  MoreVert,
  Print,
  Share,
} from "@mui/icons-material";
import TabbedSectionHeader from "../TabbedSection/TabbedSectionHeader";
import GridFormSectionWrapper from "../FormControls/GridFormSectionWrapper";
import GridInputWrapper from "../FormControls/GridInputWrapper";
import TabbedSectionContent from "../TabbedSection/TabbedSectionContent";
import StatusGraphic from "../FormControls/StatusGraphic";
import { useFormData, useDebouncedEffect } from "../Helpers/CustomHooks";
import CustomTable from "../CustomTable/CustomTable";
import FormWrapper from "../FormControls/FormWrapper";
import ToastMessage from "../ToastMessage/ToastMessage";
import SaveManager from "../Helpers/SaveManager";
import { useTheme } from "@mui/material/styles";
import useMediaQuery from "@mui/material/useMediaQuery";
import RenderPopup from "../Helpers/RenderPopup";
import RenderForm from "../Helpers/RenderForm";
import ConfirmationDialog from "../Helpers/ConfirmationDialog";
import ContextCircularProgressLoader from "../Loaders/ContextCircularProgressLoader";
import TextFieldDateTime from "../FormControls/TextFieldDateTime";

import NoteReport from "../Reports/NoteReport";
import EmailReport from "../Reports/EmailReport";
import AttachmentReport from "../Reports/AttachmentReport";

//#region //TODO Mass update fields available
const massUpdateCapableFieldKeys = [
  { label: "Comment", value: "Comment" },
  { label: "Price Book Item", value: "Price_Book_Item" },
  { label: "Quantity", value: "Quantity" },
  { label: "Customer Room", value: "Customer_Room" },
  { label: "Account", value: "Account" },
  { label: "Service Contract", value: "Service_Contract" },
  { label: "Purchase Date", value: "Purchase_Date" },
  { label: "Purchase Order", value: "Purchase_Order" },
  { label: "Sales Order", value: "Sales_Order" },
];

const defaultLoadData = {
  Name: "",
  Description: "",
  Comment: "",
  Price_Book_Item: "",
  Serial_Number: "",
  Quantity: "",
  Customer_Room: "",
  Account: "",
  Service_Contract: "",
  Purchase_Date: "",
  Purchase_Price: "",
  Purchase_Order: "",
  Sales_Order: "",
};
//#endregion

//#region //TODO Helper functions

//#endregion

//#region //TODO Custom actions in form toolbar
const CustomFormActions = ({
  currentData,
  currentUser,
  onCopyDirectUrl,
  onOpenPickTicket,
  onOpenPrintWizard,
  onOpenSendEmail,
  onVoid,
  onDelete,
}) => {
  const theme = useTheme();
  const desktopMode = useMediaQuery(theme.breakpoints.up("sm"));
  const [anchorEl, setAnchorEl] = useState(null);
  const [open, setOpen] = useState(false);

  const onClose = () => {
    setAnchorEl(null);
    setOpen(false);
  };

  const onOpen = (e) => {
    setAnchorEl(e.currentTarget);
    setOpen(true);
  };

  const _onCopyDirectUrl = () => {
    onClose();
    onCopyDirectUrl();
  };

  const _onOpenPickTicket = () => {
    onClose();
    onOpenPickTicket();
  };

  const _onOpenPrintWizard = () => {
    onClose();
    onOpenPrintWizard();
  };

  const _onOpenSendEmail = () => {
    onClose();
    onOpenSendEmail();
  };

  const _onVoid = () => {
    onClose();
    onVoid();
  };

  const _onDelete = () => {
    onClose();
    onDelete();
  };

  useEffect(() => {
    desktopMode ? onClose() : null;
  }, [desktopMode]);

  return (
    <>
      {desktopMode ? (
        <Button
          //variant='contained'
          onClick={onOpen}
          startIcon={<ExpandMore />}
        >
          Actions
        </Button>
      ) : (
        <Tooltip arrow title={"Actions"}>
          <IconButton onClick={onOpen} color="inherit" size="small">
            <MoreVert />
          </IconButton>
        </Tooltip>
      )}

      <Menu anchorEl={anchorEl} open={open} onClose={onClose}>
        {/* Copy Direct Link/Print/Email */}
        {/* <MenuItem onClick={_onCopyDirectUrl}>
					<ListItemIcon>
						<Share color='success' fontSize='small' />
					</ListItemIcon>
					<ListItemText>Copy Direct Link</ListItemText>
				</MenuItem> */}
        {/* <MenuItem onClick={_onOpenPrintWizard}>
					<ListItemIcon>
						<Print color='success' fontSize='small' />
					</ListItemIcon>
					<ListItemText>Print Wizard</ListItemText>
				</MenuItem> */}
        <MenuItem onClick={_onOpenSendEmail}>
          <ListItemIcon>
            <Email color="success" fontSize="small" />
          </ListItemIcon>
          <ListItemText>Send Email</ListItemText>
        </MenuItem>
        <Divider />
        {/* Record Specific Options */}
        {/* <MenuItem onClick={_onOpenPickTicket}>
					<ListItemIcon>
						<FactCheck color='info' fontSize='small' />
					</ListItemIcon>
					<ListItemText>Pick Ticket</ListItemText>
				</MenuItem>
				<Divider /> */}
        {/* Void/Delete Options */}
        {/* <MenuItem onClick={_onVoid}>
					<ListItemIcon>
						<Block color='warning' fontSize='small' />
					</ListItemIcon>
					<ListItemText>Cancel/Void</ListItemText>
				</MenuItem> */}
        <MenuItem onClick={_onDelete}>
          <ListItemIcon>
            <DeleteForever color="error" fontSize="small" />
          </ListItemIcon>
          <ListItemText>Delete</ListItemText>
        </MenuItem>
      </Menu>
    </>
  );
};

CustomFormActions.propTypes = {
  currentData: PropTypes.object,
  currentUser: PropTypes.object,
  onCopyDirectUrl: PropTypes.func,
  onOpenPickTicket: PropTypes.func,
  onOpenPrintWizard: PropTypes.func,
  onOpenSendEmail: PropTypes.func,
  onVoid: PropTypes.func,
  onDelete: PropTypes.func,
};
//#endregion

const CustomerAssetForm = ({
  formName, //Used to require fewer edits between template and specific forms
  setAppBreadcrumb, //If form is fullscreen - when rendered from a table row, this won't be defined
  resource, //Data loaded from the database
  onChange, //Function call raised when data is saved - useful for updating a parent table
  loadData, //When adding a new form, this is the data object that can contain things like: {Account: '123456', Reference: '1234566'}
  massUpdating, //Used to enable mass update mode
  massUpdateRecordIds,
  onMassUpdate,
  uuid,
  maxHeight,
}) => {
  const currentUser = useRecoilValue(currentUserState);
  const columns = useRecoilValue(
    Columns[`${camelize(formName.replaceAll("_", ""))}ColumnsState`]
  );
  const debug = useRecoilValue(debugState);
  const [alerts, setAlerts] = useState({});
  const [data, setData] = useState({
    ...defaultLoadData,
    ...loadData,
    ...resource.read(),
  });
  const [id, setId] = useState(data.ID);
  const baseUrl = `https://creatorapp.zoho.com/visionpointllc/av-professional-services/#Page:Search?Type=${formName}&ID=${id}`;
  const [recordTitle, setRecordTitle] = useState("");
  const [
    state,
    addRecord,
    updateRecord,
    mountData,
    resetData,
    massUpdateRecords,
  ] = useFormData(data, { ...defaultLoadData, ...loadData });

  const [massUpdateFieldList, setMassUpdateFieldList] = useState([]);
  const requiredFields = useRef(columns.filter((column) => column.required));
  const [error, setError] = useState({});
  const [toastData, setToastData] = useState({});
  const [confirmationDialogOpen, setConfirmationDialogOpen] = useState(false);
  const [confirmationDialogData, setConfirmationDialogData] = useState({});
  const [timelineOpen, setTimelineOpen] = useState(false);
  const [tabValue, setTabValue] = useState("Notes");
  const [renderPopupData, setRenderPopupData] = useState({});
  const hasError = Object.keys(error).length > 0;

  //! Record title when accessed via direct URL
  useEffect(() => {
    if (setAppBreadcrumb) {
      const title = () => {
        if (id) {
          return recordTitle;
        } else {
          return `Add New ${formName.replaceAll("_", "")}`;
        }
      };

      setAppBreadcrumb([
        {
          href: "",
          icon: <DatabaseDefaultIcon form={formName} sx={{ mr: 0.75 }} />,
          label: plurifyFormName(formName),
        },
        {
          href: "",
          icon: <DatabaseDefaultIcon form={formName} sx={{ mr: 0.75 }} />,
          label: title(),
        },
      ]);
    }
  }, [recordTitle]);

  //#region //! Update parent table row if applicable
  useEffect(() => {
    if (onChange) {
      onChange(state.savedData);
    }

    if (
      hasError &&
      (!id ||
        currentUser.Enable_Autosave === false ||
        currentUser.Enable_Autosave === "false")
    ) {
      isValid();
    }
  }, [state]);
  //#endregion

  //#region //! Data save/autosave/reset/validity
  //! Debounced effect to raise onAutoSave() every 2 seconds
  useDebouncedEffect(
    () =>
      Object.keys(state.data).length > 0 &&
      (currentUser.Enable_Autosave === true ||
        currentUser.Enable_Autosave === "true") &&
      !massUpdating &&
      id
        ? onAutoSave()
        : null,
    [state.data, id],
    2000
  );

  //! Raised by useDebouncedEffect
  const onAutoSave = () => {
    if (!id) {
      return;
    }

    if (isValid()) {
      if (debug) {
        setToastData({
          message: `DEBUG ENABLED: AutoSave called with valid form data!`,
          severity: "info",
        });
      } else {
        if (id) {
          updateRecord(plurifyFormName(formName), id, state.data);
        }
      }
    } else {
      setToastData({
        message: `Please enter a value for all required fields`,
        severity: "warning",
      });
    }
  };

  //! Manual Save
  const onSave = () => {
    if (isValid() || massUpdating) {
      if (debug) {
        setToastData({
          message: `DEBUG ENABLED: Save manually called with valid form data!`,
          severity: "info",
        });
      } else {
        if (id) {
          updateRecord(plurifyFormName(formName), id, state.data);
        } else if (massUpdating) {
          //massUpdateFieldList is a list of keys to include in massUpdate

          let _temp = {};
          massUpdateFieldList.forEach(key => _temp[key] = state?.currentData[key]);
          massUpdateRecords(
            plurifyFormName(formName),
            massUpdateRecordIds,
            _temp,
            () => {
              onMassUpdate(_temp);
            }
          );
        } else {
          addRecord(formName, state.data, (response) => setId(response.ID));
        }
      }
    } else {
      setToastData({
        message: `Please enter a value for all required fields`,
        severity: "warning",
      });
    }
  };

  const onReset = () => {
    if (!massUpdating) {
      resetData();
      setError({});
      setData(state.savedData);
    } else {
      setMassUpdateFieldList([]);
    }
  };

  const isValid = () => {
    console.log("errorCheck requiredFields", requiredFields.current);
    let _error = {};

    if (requiredFields.current.length > 0) {
      requiredFields.current.forEach((field) => {
        if (
          !state.currentData[field.valueKey] ||
          state.currentData[field.valueKey] === 0 ||
          (Array.isArray(state.currentData[field.valueKey]) &&
            state.currentData[field.valueKey].length === 0)
        ) {
          _error[field.valueKey] = true;
        }
      });
    }

    setError(_error);
    return Object.keys(_error).length === 0; //if _error = {}, returns true
  };
  //#endregion

  //#region //! Commands exposed by Actions dropdown
  const onCopyDirectUrl = async () => {
    copyTextToClipboard(baseUrl)
      .then(() =>
        setToastData({
          message: "Direct link copied to clipboard!",
          severity: "success",
        })
      )
      .catch(() =>
        setToastData({
          message: "Error copying text to clipboard",
          severity: "error",
        })
      );
  };

  const onVoid = () => {
    setConfirmationDialogData({
      title: `Cancel ${formName.replaceAll("_", " ")}`,
      onConfirm: () => console.log("Void => Confirm"),
      confirmButtonColor: "warning",
      children: <Typography>Are you sure you want to cancel?</Typography>,
    });
  };

  const onDelete = () => {
    setConfirmationDialogData({
      title: `Delete ${formName.replaceAll("_", " ")}`,
      onConfirm: () => console.log("Delete => Confirm"),
      confirmButtonColor: "error",
      children: (
        <Typography>
          Are you sure you want to delete this {formName.replaceAll("_", " ")}?
        </Typography>
      ),
    });
  };
  //#endregion

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        backgroundColor: "background.default",
      }}
    >
      <FormWrapper
        id={id}
        viewingInTab={Boolean(uuid)}
        alerts={alerts}
        timelineOpen={timelineOpen}
        setTimelineOpen={setTimelineOpen}
        massUpdating={massUpdating}
        maxHeight={maxHeight}
        CustomFormActions={
          <CustomFormActions
            currentData={state.currentData}
            currentUser={currentUser}
            onCopyDirectUrl={onCopyDirectUrl}
            onOpenSendEmail={() => {}}
            onVoid={onVoid}
            onDelete={onDelete}
          />
        }
      >
        {/* Status bar if applicable */}
        {!massUpdating &&
        columns.filter((column) => column.valueKey === "Status")[0].options()
          .length > 0 ? (
          <StatusGraphic
            statuses={columns
              .filter((column) => column.valueKey === "Status")[0]
              .options()}
            value={state.currentData.Status}
            onChange={(statusText) => mountData("Status", statusText)}
          />
        ) : null}
        {massUpdating ? (
          <Box sx={{ width: "100%", px: 2, pt: 2 }}>
            <Autocomplete
              multiple
              disableCloseOnSelect
              options={massUpdateCapableFieldKeys.sort(
                (a, b) => a.label - b.label
              )}
              getOptionLabel={(option) => option.label}
              isOptionEqualToValue={(option, value) =>
                option.value === value.value
              }
              onChange={(e, newValue) =>
                setMassUpdateFieldList(newValue.map((v) => v.value))
              }
              value={massUpdateCapableFieldKeys.filter((option) =>
                massUpdateFieldList.includes(option.value) ? option : null
              )}
              renderInput={(params) => (
                <TextField
                  {...params}
                  variant="standard"
                  label="Fields to Mass Update"
                  placeholder={
                    massUpdateFieldList.length === 0 ? "Select field(s)" : ""
                  }
                />
              )}
            />
          </Box>
        ) : null}

        {massUpdating && massUpdateFieldList.length === 0 ? (
          <Box sx={{ width: "100%", py: 6 }}>
            <Typography align="center" sx={{ color: "text.secondary" }}>
              Please select at least one field from the dropdown above to begin
            </Typography>
          </Box>
        ) : (
          <ThemeCard
            header={
              massUpdating ? null : `${formName.replaceAll("_", " ")} Details`
            }
          >
            <GridFormSectionWrapper>
              <GridInputWrapper
                massUpdating={massUpdating}
                hidden={massUpdating && !massUpdateFieldList.includes("Name")}
              >
                <TextField
                  label="Name"
                  value={state.currentData.Name}
                  helperText={
                    error.Name
                      ? "Please enter a value for this required field"
                      : ""
                  }
                  required
                  error={error.Name}
                  onChange={(e) => mountData("Name", e.target.value)}
                />
              </GridInputWrapper>

              <GridInputWrapper
                massUpdating={massUpdating}
                hidden={
                  massUpdating && !massUpdateFieldList.includes("Description")
                }
              >
                <TextField
                  label="Description"
                  value={state.currentData.Description}
                  helperText={
                    error.Description
                      ? "Please enter a value for this required field"
                      : ""
                  }
                  required
                  error={error.Description}
                  multiline
                  onChange={(e) => mountData("Description", e.target.value)}
                />
              </GridInputWrapper>
              <GridInputWrapper
                massUpdating={massUpdating}
                hidden={
                  massUpdating && !massUpdateFieldList.includes("Comment")
                }
              >
                <TextField
                  label="Comment"
                  value={state.currentData.Comment}
                  onChange={(e) => mountData("Comment", e.target.value)}
                />
              </GridInputWrapper>
              <GridInputWrapper
                massUpdating={massUpdating}
                hidden={
                  massUpdating &&
                  !massUpdateFieldList.includes("Price_Book_Item")
                }
              >
                <LookupField2
                  name="Price_Book_Item"
                  label="Price Book Item"
                  defaultSortByColumn="Name"
                  defaultValue={state.currentData.Price_Book_Item}
                  onChange={(e) => mountData("Price_Book_Item", e)}
                  endAdornment={
                    <IconButton edge="end" size="large">
                      <DatabaseDefaultIcon form="Price_Book_Item" />
                    </IconButton>
                  }
                />
              </GridInputWrapper>
              <GridInputWrapper
                massUpdating={massUpdating}
                hidden={
                  massUpdating && !massUpdateFieldList.includes("Serial_Number")
                }
              >
                <LookupField2
                  name="Serial_Number"
                  label="Serial Number"
                  defaultSortByColumn="Name"
                  defaultValue={state.currentData.Serial_Number}
                  onChange={(e) => mountData("Serial_Number", e)}
                  endAdornment={
                    <IconButton edge="end" size="large">
                      <DatabaseDefaultIcon form="Serial_Number" />
                    </IconButton>
                  }
                />
              </GridInputWrapper>
              <GridInputWrapper
                massUpdating={massUpdating}
                hidden={
                  massUpdating && !massUpdateFieldList.includes("Quantity")
                }
              >
                <TextField
                  label="Quantity"
                  value={state.currentData.Quantity}
                  helperText={
                    error.Quantity
                      ? "Please enter a value for this required field"
                      : ""
                  }
                  required
                  error={error.Quantity}
                  type="number"
                  onChange={(e) => mountData("Quantity", e.target.value)}
                />
              </GridInputWrapper>
              <GridInputWrapper
                massUpdating={massUpdating}
                hidden={
                  massUpdating && !massUpdateFieldList.includes("Customer_Room")
                }
              >
                <LookupField2
                  name="Customer_Room"
                  label="Customer Room"
                  defaultSortByColumn="Name"
                  defaultValue={state.currentData.Customer_Room}
                  onChange={(e) => mountData("Customer_Room", e)}
                  endAdornment={
                    <IconButton edge="end" size="large">
                      <DatabaseDefaultIcon form="Customer_Room" />
                    </IconButton>
                  }
                />
              </GridInputWrapper>
              <GridInputWrapper
                massUpdating={massUpdating}
                hidden={
                  massUpdating && !massUpdateFieldList.includes("Account")
                }
              >
                <LookupField2
                  name="Account"
                  label="Account"
                  formName="Account"
                  reportName="Accounts_Report"
                  defaultSortByColumn="Name"
                  defaultValue={state.currentData.Account}
                  helperText={
                    error.Account
                      ? "Please enter a value for this required field"
                      : ""
                  }
                  required
                  error={error.Account}
                  onChange={(e) => mountData("Account", e)}
                  endAdornment={
                    <IconButton edge="end" size="large">
                      <DatabaseDefaultIcon form="Account" />
                    </IconButton>
                  }
                />
              </GridInputWrapper>
              <GridInputWrapper
                massUpdating={massUpdating}
                hidden={
                  massUpdating &&
                  !massUpdateFieldList.includes("Service_Contract")
                }
              >
                <LookupField2
                  name="Service_Contract"
                  label="Service Contract"
                  defaultSortByColumn="Name"
                  defaultValue={state.currentData.Service_Contract}
                  onChange={(e) => mountData("Service_Contract", e)}
                  endAdornment={
                    <IconButton edge="end" size="large">
                      <DatabaseDefaultIcon form="Service_Contract" />
                    </IconButton>
                  }
                />
              </GridInputWrapper>

              <GridInputWrapper
                massUpdating={massUpdating}
                hidden={
                  massUpdating && !massUpdateFieldList.includes("Purchase_Date")
                }
              >
                <TextFieldDateTime
                  type="date"
                  label="Purchase Date"
                  value={state.currentData.Purchase_Date}
                  onChange={(e) => mountData("Purchase_Date", e)}
                />
              </GridInputWrapper>

              <GridInputWrapper
                massUpdating={massUpdating}
                hidden={
                  massUpdating &&
                  !massUpdateFieldList.includes("Purchase_Price")
                }
              >
                <TextField
                  label="Purchase Price"
                  type="number"
                  value={state.currentData.Purchase_Price}
                  onChange={(e) => mountData("Purchase_Price", e.target.value)}
                />
              </GridInputWrapper>

              <GridInputWrapper
                massUpdating={massUpdating}
                hidden={
                  massUpdating &&
                  !massUpdateFieldList.includes("Purchase_Order")
                }
              >
                <LookupField2
                  name="Purchase_Order"
                  label="Purchase Order"
                  defaultSortByColumn="Name"
                  defaultValue={state.currentData.Purchase_Order}
                  onChange={(e) => mountData("Purchase_Order", e)}
                  endAdornment={
                    <IconButton edge="end" size="large">
                      <DatabaseDefaultIcon form="Purchase_Order" />
                    </IconButton>
                  }
                />
              </GridInputWrapper>

              <GridInputWrapper
                massUpdating={massUpdating}
                hidden={
                  massUpdating && !massUpdateFieldList.includes("Sales_Order")
                }
              >
                <LookupField2
                  name="Sales_Order"
                  label="Sales Order"
                  defaultSortByColumn="Name"
                  defaultValue={state.currentData.Sales_Order}
                  onChange={(e) => mountData("Sales_Order", e)}
                  endAdornment={
                    <IconButton edge="end" size="large">
                      <DatabaseDefaultIcon form="Sales_Order" />
                    </IconButton>
                  }
                />
              </GridInputWrapper>
            </GridFormSectionWrapper>
          </ThemeCard>
        )}

        {id && !massUpdating ? (
          <TabbedSection>
            <TabbedSectionHeader
              value={tabValue}
              onTabChanged={(e, tabIndex) => setTabValue(tabIndex)}
            >
              <Tab label="Notes" value="Notes" />
              <Tab label="Emails" value="Emails" />
              <Tab label="Attachments" value="Attachments" />
            </TabbedSectionHeader>

            <TabbedSectionContent>
              {tabValue === "Notes" ? (
                <NoteReport
                  variant="tab"
                  maxHeight={600}
                  forcedCriteria={`Parent_ID=="${id}"`}
                  loadData={{ Parent_ID: id }}
                />
              ) : tabValue === "Emails" ? (
                <EmailReport
                  variant="tab"
                  maxHeight={600}
                  forcedCriteria={`Parent_ID=="${id}"`}
                  loadData={{ Parent_ID: id }}
                />
              ) : tabValue === "Attachments" ? (
                <AttachmentReport
                  variant="tab"
                  maxHeight={600}
                  forcedCriteria={`Parent_ID=="${id}"`}
                  loadData={{ Parent_ID: id }}
                />
              ) : null}
            </TabbedSectionContent>
          </TabbedSection>
        ) : null}
      </FormWrapper>

      <BottomBar
        show={
          !id ||
          currentUser.Enable_Autosave === false ||
          currentUser.Enable_Autosave === "false"
            ? true
            : false
        }
        onSave={onSave}
        saveDisabled={
          massUpdating ? massUpdateFieldList.length === 0 :
          (state.data && Object.keys(state.data).length === 0) ||
          Object.values(error).includes(true) ||
          state.status === "saving" ||
          state.status === "deleting"
        }
        onReset={onReset}
        resetDisabled={
          (state.data && Object.keys(state.data).length === 0) ||
          state.status === "saving" ||
          state.status === "deleting"
        }
      />

      {/* Form specific action confirmation (e.g. Void, Delete) */}
      <ConfirmationDialog
        open={confirmationDialogOpen}
        title={confirmationDialogData.title}
        onBack={() => setConfirmationDialogOpen(false)}
        onConfirm={confirmationDialogData.onConfirm}
        confirmButtonColor={confirmationDialogData.confirmButtonColor}
      >
        {confirmationDialogData.children}
      </ConfirmationDialog>

      {/* Form specific children (e.g. Email, Print Wizard) */}
      <RenderPopup
        title={renderPopupData.title}
        open={renderPopupData.title ? true : false}
        onClose={() => setRenderPopupData({})}
      >
        {renderPopupData.children}
      </RenderPopup>

      {/* Toast messaging in lower right */}
      <ToastMessage data={toastData} />
      <SaveManager formDataState={state} />
    </Box>
  );
};

CustomerAssetForm.propTypes = {
  formName: PropTypes.string.isRequired,
  id: PropTypes.string,
  loadData: PropTypes.object,
  resource: PropTypes.object,
  setAppBreadcrumb: PropTypes.func,
  onChange: PropTypes.func,
  massUpdating: PropTypes.bool,
  massUpdateRecordIds: PropTypes.array,
  uuid: PropTypes.string,
  maxHeight: PropTypes.number,
  onMassUpdate: PropTypes.func,
};

CustomerAssetForm.defaultProps = {
  loadData: {},
  massUpdating: false,
  massUpdateRecordIds: [],
};

const Wrapper = (props) => {
  return (
    <React.Suspense fallback={<ContextCircularProgressLoader />}>
      <CustomerAssetForm {...props} />
    </React.Suspense>
  );
};

export default Wrapper;
