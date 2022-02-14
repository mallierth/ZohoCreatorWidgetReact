import React, { useEffect, useRef, useState } from "react";
import PropTypes from "prop-types";
import { useRecoilState, useRecoilValue, useSetRecoilState } from "recoil";
import { omit } from "lodash-es";
import {
  sideNavEnabledState,
  navBarHeightState,
  currentUserState,
  themeState,
  appBreadcrumbState,
  forceRerenderState,
  appMaxWidthState,
  applicationTabsState,
} from "../recoil/atoms";
import {
  currentUserThemeModeState,
  currentUserPrimaryColorState,
  currentUserSecondaryColorState,
  themeModeState,
  themePrimaryColorState,
  themeSecondaryColorState,
  currentUserIdState,
} from "../recoil/selectors";
import { getCurrentUser, updateRecord } from "../apis/ZohoCreator";
import MuiNavbar from "./MuiNavbar";
import {
  createTheme,
  ThemeProvider,
  StyledEngineProvider,
} from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";
import Loader from "./Loader";
import darkScrollbar from "@mui/material/darkScrollbar";
import { Box, Container, Paper } from "@mui/material";
import CustomTable from "./CustomTable/CustomTable";
import RenderForm from "./Helpers/RenderForm";
import PrioritiesKanban from "./Reports/PrioritiesKanban";
import { getAllRecordsSuspense } from "../apis/ZohoCreator";
import { LicenseInfo } from "@mui/x-data-grid-pro";
import SideNav from "./SideNav/SideNav";
import { useErrorHandler } from "react-error-boundary";
import { lighten, darken } from "@mui/material/styles";

//#region //! Report Imports
import AccountReport from "./Reports/AccountReport";
import AttachmentReport from "./Reports/AttachmentReport";
import ContactReport from "./Reports/ContactReport";
import CustomerAssetReport from "./Reports/CustomerAssetReport";
import CustomerRoomReport from "./Reports/CustomerRoomReport";
import DemoReport from "./Reports/DemoReport";
import EmailReport from "./Reports/EmailReport";
import EstimateReport from "./Reports/EstimateReport";
import ExpenseReport from "./Reports/ExpenseReport";
import ManufacturerReport from "./Reports/ManufacturerReport";
import InventoryAdjustmentReport from "./Reports/InventoryAdjustmentReport";
import PriceBookItemReport from "./Reports/PriceBookItemReport";
import OpportunityReport from "./Reports/OpportunityReport";
import ProjectReport from "./Reports/ProjectReport";
import PurchaseOrderReport from "./Reports/PurchaseOrderReport";
import PurchaseReceiveReport from "./Reports/PurchaseReceiveReport";
import QuoteReport from "./Reports/QuoteReport";
import QuoteLineItemReport from "./Reports/QuoteLineItemReport";
import RmaReport from "./Reports/RmaReport";
import SalesOrderReport from "./Reports/SalesOrderReport";
import SalesOrderLineItemReport from "./Reports/SalesOrderLineItemReport";
import SerialNumberReport from "./Reports/SerialNumberReport";
import ServiceContractReport from "./Reports/ServiceContractReport";
import ServiceOrderReport from "./Reports/ServiceOrderReport";
import SubcontractorReport from "./Reports/SubcontractorReport";
import SubscriptionReport from "./Reports/SubscriptionReport";
import TaskReport from "./Reports/TaskReport";
import TimeEntryReport from "./Reports/TimeEntryReport";
import VendorReport from "./Reports/VendorReport";

//#endregion

LicenseInfo.setLicenseKey(
  "cfd89a4ae50972f34543a5275d31950dT1JERVI6Mjk3NDAsRVhQSVJZPTE2NjM4NTU4ODQwMDAsS0VZVkVSU0lPTj0x"
);

const INTERVAL_DURATION = 1000 * 60 * 5; //1000ms * 60s/minute * n desired minutes (5 minutes)

const App = () => {
  const handleError = useErrorHandler();
  const sideNavEnabled = useRecoilValue(sideNavEnabledState);
  const [applicationTabs, setApplicationTabs] =
    useRecoilState(applicationTabsState);
  const navBarHeight = useRecoilValue(navBarHeightState);
  const [widgetStatus, setWidgetStatus] = useState({
    loading: true,
    status: "initializing",
  });
  const [params, setParams] = useState(null);
  const [currentUser, setCurrentUser] = useRecoilState(currentUserState);
  const currentUserId = useRecoilValue(currentUserIdState);
  const currentUserThemeMode = useRecoilValue(currentUserThemeModeState);
  const currentUserPrimaryColor = useRecoilValue(currentUserPrimaryColorState);
  const currentUserSecondaryColor = useRecoilValue(
    currentUserSecondaryColorState
  );
  const [theme, setTheme] = useRecoilState(themeState);
  const themeMode = useRecoilValue(themeModeState);
  const themePrimaryColor = useRecoilValue(themePrimaryColorState);
  const themeSecondaryColor = useRecoilValue(themeSecondaryColorState);
  const [themeLoaded, setThemeLoaded] = useState(false);
  const [forcedError, setForcedError] = useState(false);

  const widgetInitDuration = useRef(0);
  const [widgetInitDurationState, setWidgetInitDurationState] = useState(false);
  const [paramIdFormLoaded, setParamIdFormLoaded] = useState(false);

  const lastUserAppState = useRef(null);

  useEffect(() => {
    //setPageType(rootDiv.replace('root', ''));

    (async () => {
      if (!params) {
        await ZOHO.CREATOR.init();
        setWidgetStatus((old) => ({ ...old, status: "initialized" }));
        setParams(await ZOHO.CREATOR.UTIL.getQueryParams());
      }
    })();
  }, []);

  useEffect(() => {
    console.log("applicationTabs change", applicationTabs);

    if (applicationTabs && lastUserAppState.current) {
      const _loadDataOmitKeys = ["Table_HTML"]; //? Object keys to omit from application tab state
      const _applicationTabs = applicationTabs.map((tab) => ({
        ...tab,
        loadData: tab.loadData ? omit(tab.loadData, _loadDataOmitKeys) : {},
      }));

      //Added logic to compare stored tabs against formatted array of objects
      if (
        JSON.stringify(_applicationTabs) !==
        JSON.stringify(lastUserAppState.current)
      ) {
        updateRecord("Employees", currentUserId, {
          Application_Tab_State: JSON.stringify(_applicationTabs),
        });
        lastUserAppState.current = _applicationTabs;
      }
    }
  }, [applicationTabs]);

  // useEffect(() => {
  // 	if (widgetStatus.status === 'finished') {
  // 		return;
  // 	}

  // 	const interval = setInterval(() => {
  // 		setWidgetInitDurationState((old) => !old);
  // 		widgetInitDuration.current++;
  // 	}, 1000);

  // 	return () => clearInterval(interval); // This represents the unmount function, in which you need to clear your interval to prevent memory leaks.
  // }, [widgetStatus]);

  // useEffect(() => {
  // 	const interval = setInterval(() => {
  // 		console.log('App.js interval pulsed');
  // 	}, INTERVAL_DURATION);

  // 	return () => clearInterval(interval); // This represents the unmount function, in which you need to clear your interval to prevent memory leaks.
  // }, []);

  useEffect(() => {
    if (!params) {
      return;
    }
    setWidgetStatus((old) => ({ ...old, status: "params assigned" }));
    (async () => {
      const response = await getCurrentUser(null, true).catch((err) =>
        handleError(err)
      );
      if (response.employee) {
        setCurrentUser(response.employee);
        try {
          setApplicationTabs(
            response.employee.Application_Tab_State
              ? JSON.parse(response.employee.Application_Tab_State)
              : {}
          );
          lastUserAppState.current = JSON.parse(
            response.employee.Application_Tab_State
          );
        } catch (err) {
          setForcedError(err);
        }
      }
      setWidgetStatus((old) => ({
        ...old,
        loading: false,
        status: "finished",
      }));
    })();
  }, [params]);

  useEffect(() => {
    if (forcedError) {
      throw new Error(
        "JSON.parse() failed on current employee's application tab state. Please talk to your system administrator about this issue!"
      );
    }
  }, [forcedError]);

  //? On load, set the theme according to currentUser's settings
  useEffect(() => {
    if (!currentUserId) {
      return;
    }

    setTheme((theme) => ({
      ...theme,
      components: {
        MuiCssBaseline: {
          styleOverrides: {
            body: currentUserThemeMode === "dark" ? darkScrollbar() : null,
          },
        },
        MuiTextField: {
          defaultProps: {
            autoComplete: "off",
            fullWidth: true,
            variant: "standard",
          },
        },
      },
      palette: {
        mode: currentUserThemeMode,
        primary: {
          main: currentUserPrimaryColor
            ? currentUserPrimaryColor
            : theme.palette.primary.main,
        },
        secondary: {
          main: currentUserSecondaryColor
            ? currentUserSecondaryColor
            : theme.palette.secondary.main,
        },
        background: {
          default: currentUserThemeMode === "dark" ? "#121212" : "#eee",
        },
        tabs: {
          active: currentUserThemeMode === "dark" ? "#121212" : "#eee",
          inactive: "transparent",
          background: currentUserThemeMode === "dark" ? "#121212" : "#eee",
        },
      },
      mixins: {
        toolbar: {
          minHeight: navBarHeight,
          "@media (min-width:0px) and (orientation: landscape)": {
            minHeight: navBarHeight,
          },
          "@media (min-width:600px)": {
            minHeight: navBarHeight,
          },
        },
      },
    }));
    setThemeLoaded(true);
  }, [currentUserId]);

  const getWidgetStatusMessage = () => {
    switch (widgetStatus.status) {
      case "initializing":
        return "Requesting Zoho widget initializion...";
      case "initialized":
        return "Zoho widgets initialized!";
      case "params assigned":
        return "Retrieving current user data and your personal settings...";
      case "finished":
        return "Current user data retrieved! Loading the dashboard...";
    }
  };

  const getWidgetSecondaryMessage = () => {
    if (widgetInitDuration.current < 5) {
      return "";
    }

    if (widgetInitDuration.current >= 5 && widgetInitDuration.current < 10) {
      return "This is taking a bit longer than normal...";
    } else if (
      widgetInitDuration.current >= 10 &&
      widgetInitDuration.current <= 15
    ) {
      return "This is taking a lot longer than normal...";
    } else if (
      widgetInitDuration.current >= 15 &&
      widgetInitDuration.current <= 20
    ) {
      return "This is taking QUITE a lot longer than normal...";
    } else if (
      widgetInitDuration.current >= 20 &&
      widgetInitDuration.current <= 25
    ) {
      return "This is taking an excessive amount of time...";
    } else if (
      widgetInitDuration.current >= 25 &&
      widgetInitDuration.current <= 30
    ) {
      return "This is ridiculous, go do something else...";
    } else if (widgetInitDuration.current >= 30) {
      return "Oh, you're still here?";
    }
  };

  const renderPage = (sideNavValue, maxHeight, maxWidth) => {
    switch (sideNavValue) {
      case "Forms":
        if (!params || !params.Type) {
          return <div>Error! No Form type specified via parameter!</div>;
        }

        return (
          <RenderForm
            id={params.ID}
            formName={params.Type}
            maxHeight={maxHeight}
            maxWidth={maxWidth}
          />
        );
      case "Wizard_Change_Order":
      case "Wizard_Product_Filling":
      case "Wizard_Purchasing":
      case "Accounts":
        //Render a record
        if (params.ID) {
          return <RenderForm id={params.ID} formName={"Account"} />;
        }
        //Render a report
        return (
          <React.Suspense fallback={<Loader show />}>
            <AccountReport maxHeight={maxHeight} maxWidth={maxWidth} />
          </React.Suspense>
        );
      case "Attachments":
        //Render a record
        if (params.ID) {
          return <RenderForm id={params.ID} formName={"Attachment"} />;
        }
        //Render a report
        return (
          <React.Suspense fallback={<Loader show />}>
            <AttachmentReport maxHeight={maxHeight} maxWidth={maxWidth} />
          </React.Suspense>
        );
      case "Contacts":
        //Render a record
        if (params.ID) {
          return <RenderForm id={params.ID} formName={"Contact"} />;
        }
        //Render a report
        return (
          <React.Suspense fallback={<Loader show />}>
            <ContactReport maxHeight={maxHeight} maxWidth={maxWidth} />
          </React.Suspense>
        );
      case "Customer_Assets":
        //Render a record
        if (params.ID) {
          return <RenderForm id={params.ID} formName={"Customer_Asset"} />;
        }
        //Render a report
        return (
          <React.Suspense fallback={<Loader show />}>
            <CustomerAssetReport maxHeight={maxHeight} maxWidth={maxWidth} />
          </React.Suspense>
        );
      case "Customer_Rooms":
        //Render a record
        if (params.ID) {
          return <RenderForm id={params.ID} formName={"Customer_Asset"} />;
        }
        //Render a report
        return (
          <React.Suspense fallback={<Loader show />}>
            <CustomerRoomReport maxHeight={maxHeight} maxWidth={maxWidth} />
          </React.Suspense>
        );
      case "Demos":
        //Render a record
        if (params.ID) {
          return <RenderForm id={params.ID} formName={"Demo"} />;
        }
        //Render a report
        return (
          <React.Suspense fallback={<Loader show />}>
            <DemoReport maxHeight={maxHeight} maxWidth={maxWidth} />
          </React.Suspense>
        );
      case "Emails":
        //Render a record
        if (params.ID) {
          return <RenderForm id={params.ID} formName={"Email"} />;
        }
        //Render a report
        return (
          <React.Suspense fallback={<Loader show />}>
            <EmailReport maxHeight={maxHeight} maxWidth={maxWidth} />
          </React.Suspense>
        );
      case "Estimates":
        //Render a record
        if (params.ID) {
          return <RenderForm id={params.ID} formName={"Estimate"} />;
        }
        //Render a report
        return (
          <React.Suspense fallback={<Loader show />}>
            <EstimateReport maxHeight={maxHeight} maxWidth={maxWidth} />
          </React.Suspense>
        );
      case "Expenses":
        //Render a record
        if (params.ID) {
          return <RenderForm id={params.ID} formName={"Expense"} />;
        }
        //Render a report
        return (
          <React.Suspense fallback={<Loader show />}>
            <ExpenseReport maxHeight={maxHeight} maxWidth={maxWidth} />
          </React.Suspense>
        );
      case "Inventory_Adjustments":
        //Render a record
        if (params.ID) {
          return (
            <RenderForm id={params.ID} formName={"Inventory_Adjustment"} />
          );
        }
        //Render a report
        return (
          <React.Suspense fallback={<Loader show />}>
            <InventoryAdjustmentReport
              maxHeight={maxHeight}
              maxWidth={maxWidth}
            />
          </React.Suspense>
        );
      case "Leads":
      case "Manufacturers":
        //Render a record
        if (params.ID) {
          return <RenderForm id={params.ID} formName={"Manufacturer"} />;
        }
        //Render a report
        return (
          <React.Suspense fallback={<Loader show />}>
            <ManufacturerReport maxHeight={maxHeight} maxWidth={maxWidth} />
          </React.Suspense>
        );
      case "Opportunities":
        //Render a record
        if (params.ID) {
          return <RenderForm id={params.ID} formName={"Opportunity"} />;
        }
        //Render a report
        return (
          <React.Suspense fallback={<Loader show />}>
            <OpportunityReport maxHeight={maxHeight} maxWidth={maxWidth} />
          </React.Suspense>
        );
      case "Price_Book_Items":
        //Render a record
        if (params.ID) {
          return <RenderForm id={params.ID} formName={"Price_Book_Item"} />;
        }
        //Render a report
        return (
          <React.Suspense fallback={<Loader show />}>
            <PriceBookItemReport maxHeight={maxHeight} maxWidth={maxWidth} />
          </React.Suspense>
        );
      case "Projects":
        //Render a record
        if (params.ID) {
          return <RenderForm id={params.ID} formName={"Project"} />;
        }
        //Render a report
        return (
          <React.Suspense fallback={<Loader show />}>
            <ProjectReport maxHeight={maxHeight} maxWidth={maxWidth} />
          </React.Suspense>
        );
      case "Priorities":
        return (
          <React.Suspense fallback={<Loader show />}>
            <PrioritiesKanban
              maxHeight={maxHeight}
              maxWidth={maxWidth}
              resource={getAllRecordsSuspense("Priorities", "Archive=false")}
            />
          </React.Suspense>
        );
      case "Purchase_Orders":
        //Render a record
        if (params.ID) {
          return <RenderForm id={params.ID} formName={"Purchase_Order"} />;
        }
        //Render a report
        return (
          <React.Suspense fallback={<Loader show />}>
            <PurchaseOrderReport maxHeight={maxHeight} maxWidth={maxWidth} />
          </React.Suspense>
        );
      case "Purchase_Receives":
        //Render a record
        if (params.ID) {
          return <RenderForm id={params.ID} formName={"Purchase_Receive"} />;
        }
        //Render a report
        return (
          <React.Suspense fallback={<Loader show />}>
            <PurchaseReceiveReport maxHeight={maxHeight} maxWidth={maxWidth} />
          </React.Suspense>
        );
      case "Quotes":
        if (params.ID) {
          return <RenderForm id={params.ID} formName={"Quote"} />;
        }
        //Render a report
        return (
          <React.Suspense fallback={<Loader show />}>
            <QuoteReport maxHeight={maxHeight} maxWidth={maxWidth} />
          </React.Suspense>
        );
      case "Quote_Line_Items":
        if (params.ID) {
          return <RenderForm id={params.ID} formName={"Quote_Line_Item"} />;
        }
        //Render a report
        return (
          <React.Suspense fallback={<Loader show />}>
            <QuoteLineItemReport maxHeight={maxHeight} maxWidth={maxWidth} />
          </React.Suspense>
        );
      case "RMAs":
        //Render a record
        if (params.ID) {
          return <RenderForm id={params.ID} formName={"RMA"} />;
        }
        //Render a report
        return (
          <React.Suspense fallback={<Loader show />}>
            <RmaReport maxHeight={maxHeight} maxWidth={maxWidth} />
          </React.Suspense>
        );
      case "Sales_Orders":
        //Render a record
        if (params.ID) {
          return <RenderForm id={params.ID} formName={"Sales_Order"} />;
        }
        //Render a report
        return (
          <React.Suspense fallback={<Loader show />}>
            <SalesOrderReport maxHeight={maxHeight} maxWidth={maxWidth} />
          </React.Suspense>
        );
      case "Sales_Order_Line_Items":
        if (params.ID) {
          return (
            <RenderForm id={params.ID} formName={"Sales_Order_Line_Item"} />
          );
        }
        //Render a report
        return (
          <React.Suspense fallback={<Loader show />}>
            <SalesOrderLineItemReport
              maxHeight={maxHeight}
              maxWidth={maxWidth}
            />
          </React.Suspense>
        );
      case "Serial_Numbers":
        //Render a record
        if (params.ID) {
          return <RenderForm id={params.ID} formName={"Serial_Number"} />;
        }
        //Render a report
        return (
          <React.Suspense fallback={<Loader show />}>
            <SerialNumberReport maxHeight={maxHeight} maxWidth={maxWidth} />
          </React.Suspense>
        );
      case "Service_Contracts":
        //Render a record
        if (params.ID) {
          return <RenderForm id={params.ID} formName={"Service_Contract"} />;
        }
        //Render a report
        return (
          <React.Suspense fallback={<Loader show />}>
            <ServiceContractReport maxHeight={maxHeight} maxWidth={maxWidth} />
          </React.Suspense>
        );
      case "Service_Orders":
        //Render a record
        if (params.ID) {
          return <RenderForm id={params.ID} formName={"Service_Order"} />;
        }
        //Render a report
        return (
          <React.Suspense fallback={<Loader show />}>
            <ServiceOrderReport maxHeight={maxHeight} maxWidth={maxWidth} />
          </React.Suspense>
        );
      case "Subcontractors":
        //Render a record
        if (params.ID) {
          return <RenderForm id={params.ID} formName={"Subcontractor"} />;
        }
        //Render a report
        return (
          <React.Suspense fallback={<Loader show />}>
            <SubcontractorReport maxHeight={maxHeight} maxWidth={maxWidth} />
          </React.Suspense>
        );
      case "Subscriptions":
        //Render a record
        if (params.ID) {
          return <RenderForm id={params.ID} formName={"Subscription"} />;
        }
        //Render a report
        return (
          <React.Suspense fallback={<Loader show />}>
            <SubscriptionReport maxHeight={maxHeight} maxWidth={maxWidth} />
          </React.Suspense>
        );
      case "Tasks":
        //Render a record
        if (params.ID) {
          return <RenderForm id={params.ID} formName={"Task"} />;
        }
        //Render a report
        return (
          <React.Suspense fallback={<Loader show />}>
            <TaskReport maxHeight={maxHeight} maxWidth={maxWidth} />
          </React.Suspense>
        );
      case "Time_Entries":
        //Render a record
        if (params.ID) {
          return <RenderForm id={params.ID} formName={"Time_Entry"} />;
        }
        //Render a report
        return (
          <React.Suspense fallback={<Loader show />}>
            <TimeEntryReport maxHeight={maxHeight} maxWidth={maxWidth} />
          </React.Suspense>
        );
      case "Vendors":
        //Render a record
        if (params.ID) {
          return <RenderForm id={params.ID} formName={"Vendor"} />;
        }
        //Render a report
        return (
          <React.Suspense fallback={<Loader show />}>
            <VendorReport maxHeight={maxHeight} maxWidth={maxWidth} />
          </React.Suspense>
        );
      default:
        return <RenderForm formName={"Dashboard"} />;
    }
  };

  return (
    <StyledEngineProvider injectFirst>
      <ThemeProvider theme={createTheme(theme)}>
        <CssBaseline />

        {!widgetStatus.loading ? (
          sideNavEnabled ? (
            <SideNav renderPage={renderPage} />
          ) : (
            <>
              <MuiNavbar />
              <Box sx={{ height: navBarHeight }}></Box>

              <Box sx={{ overflow: "auto" }}>{renderPage()}</Box>
            </>
          )
        ) : (
          <Loader
            show
            height={20}
            backgroundColor="black"
            message={getWidgetStatusMessage()}
            secondaryMessage={getWidgetSecondaryMessage()}
          />
        )}
      </ThemeProvider>
    </StyledEngineProvider>
  );
};

App.propTypes = {};

export default App;
