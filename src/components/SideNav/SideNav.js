import React, { useEffect, useState } from "react";
import { useWhyDidYouUpdate } from "use-why-did-you-update";
import { useRecoilState, useRecoilValue } from "recoil";
import PropTypes from "prop-types";
import { styled, useTheme } from "@mui/material/styles";
import useMediaQuery from "@mui/material/useMediaQuery";
import Box from "@mui/material/Box";
import Drawer from "@mui/material/Drawer";
import Typography from "@mui/material/Typography";
import Divider from "@mui/material/Divider";
import IconButton from "@mui/material/IconButton";
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";
import DraggableTab from "./DraggableTab";
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Collapse,
  Container,
  Fade,
  Menu,
  MenuItem,
  Tab,
  Tabs,
  Tooltip,
} from "@mui/material";
import { TreeItem, TreeView } from "@mui/lab";
import { ArrowDropDown, ArrowRight } from "@mui/icons-material";
import {
  sidenavOpenState,
  navBarHeightState,
  applicationTabsState,
  tabBarHeightState,
  appMaxWidthState,
} from "../../recoil/atoms";

import {
  activeApplicationTabState,
  applicationTabLastUuidState,
  currentUserIsAdminState,
} from "../../recoil/selectors";
import MuiNavbar from "../MuiNavbar";
import DatabaseDefaultIcon from "../Helpers/DatabaseDefaultIcon";
import { TransitionGroup } from "react-transition-group";
import { plurifyFormName } from "../Helpers/functions";
import RenderForm from "../Helpers/RenderForm";
import { v4 as uuid } from "uuid";
import {
  Close,
  KeyboardArrowDown,
  KeyboardArrowUp,
  ExpandMore,
} from "@mui/icons-material";
import StyledTreeItem from "./StyledTreeItem";

const navForms = [
  "Account",
  "Opportunity",
  "Project",
  "Quote",
  "Sales_Order",
  "Purchase_Order",
  "Estimate",
  "Price_Book_Item",
  "Contact",
  "Customer_Asset",
  "Customer_Room",
  "Demo",
  "Inventory_Adjustment",
  "Manufacturer",
  "RMA",
  "Serial_Number",
  "Expense",
  "Service_Contract",
  "Service_Order",
  "Subcontractor",
  "Subscription",
  "Task",
  "Time_Entry",
  "Vendor",
  "Priority",
].sort();

const navWizards = [
  //"Change_Order",
  "Purchasing",
  "Product_Filling",
  //"Pick_Ticket",
  //"RMA_Processing",
].sort();

const navAdmin = ["Quote_Line_Item", "Sales_Order_Line_Item", 'Portal_User', 'Service_Request'].sort();

const miniDrawerWidth = (theme) => {
  //theme?.spacing(n) returns a string with px
  return parseInt(theme?.spacing(7)?.replaceAll("px", "")) + 1;
};
const drawerWidth = 240;

const openedMixin = (theme) => ({
  width: drawerWidth,
  transition: theme.transitions.create("width", {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.enteringScreen,
  }),
  overflowX: "hidden",
});

const closedMixin = (theme) => ({
  transition: theme.transitions.create("width", {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.leavingScreen,
  }),
  overflowX: "hidden",
  width: `0px`,
  [theme.breakpoints.up("sm")]: {
    //width: `${miniDrawerWidth(theme)}px`,
    width: `0px`,
  },
});

const Main = styled("main", {
  shouldForwardProp: (prop) => prop !== "open" && prop !== "desktopMode",
})(({ theme, open, desktopMode }) => ({
  //   flexGrow: 1,
  //   marginLeft: 2,
  //   // transition: theme.transitions.create('margin', {
  //   // 	easing: theme.transitions.easing.sharp,
  //   // 	duration: theme.transitions.duration.leavingScreen,
  //   // }),
  //   // marginLeft: `-${drawerWidth + miniDrawerWidth(theme)}px`,
  //   // ...(open && {
  //   // 	transition: theme.transitions.create('margin', {
  //   // 		easing: theme.transitions.easing.easeOut,
  //   // 		duration: theme.transitions.duration.enteringScreen,
  //   // 	}),
  //   //
  //   // }),

  //   transition: theme.transitions.create("width", {
  //     easing: theme.transitions.easing.sharp,
  //     duration: theme.transitions.duration.leavingScreen,
  //   }),
  //   //width: `calc(100vw - ${desktopMode ? 0 : miniDrawerWidth(theme)}px)`,
  //   width: `calc(100vw - 0px)`,
  //   ...(open && {
  //     transition: theme.transitions.create("width", {
  //       easing: theme.transitions.easing.easeOut,
  //       duration: theme.transitions.duration.enteringScreen,
  //     }),
  //     width: `calc(100vw - ${drawerWidth}px)`,
  //   }),
  maxWidth: open && desktopMode ? `calc(100vw - ${drawerWidth}px)` : "100vw", //replaced
  flexGrow: 1,
  paddingLeft: theme.spacing(1),
  paddingRight: theme.spacing(1),
  transition: theme.transitions.create("margin", {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.leavingScreen,
  }),
  marginLeft: desktopMode ? `-${drawerWidth}px` : 0,
  ...(open && {
    transition: theme.transitions.create("margin", {
      easing: theme.transitions.easing.easeOut,
      duration: theme.transitions.duration.enteringScreen,
    }),
    marginLeft: 0,
  }),
}));

// const Drawer = styled(Drawer, {
//   shouldForwardProp: (prop) => prop !== "open",
// })(({ theme, open }) => ({
//   //   width: drawerWidth,
//   //   flexShrink: 0,
//   //   whiteSpace: "nowrap",
//   //   boxSizing: "border-box",
//   //   zIndex: theme.zIndex.drawer - 1, //added a - 1
//   //   ...(open && {
//   //     ...openedMixin(theme),
//   //     "& .Drawer-paper": openedMixin(theme),
//   //   }),
//   //   ...(!open && {
//   //     ...closedMixin(theme),
//   //     "& .Drawer-paper": closedMixin(theme),
//   //   }),
//   width: drawerWidth,
//   flexShrink: 0,
//   "& .Drawer-paper": {
//     width: drawerWidth,
//     boxSizing: "border-box",
//   },
// }));

const SideNav = ({ renderPage }) => {
  useWhyDidYouUpdate("SideNav", renderPage);
  const appContainer = React.useRef(null);
  const theme = useTheme();
  const desktopMode = useMediaQuery(theme.breakpoints.up("sm"));
  const appMaxWidth = useRecoilValue(appMaxWidthState);
  const navBarHeight = useRecoilValue(navBarHeightState);
  const tabBarHeight = useRecoilValue(tabBarHeightState);
  const currentUserIsAdmin = useRecoilValue(currentUserIsAdminState);
  const [applicationTabs, setApplicationTabs] =
    useRecoilState(applicationTabsState);
  const activeTabUuid = useRecoilValue(activeApplicationTabState);
  const activeTab = applicationTabs.filter(
    (tab) => tab.uuid === activeTabUuid
  )[0];
  const [open, setOpen] = useRecoilState(sidenavOpenState);
  const [tabContextMenu, setTabContextMenu] = useState(null);
  const [tabCurrentContextMenu, setTabCurrentContextMenu] = useState(null);
  const [tabCurrentIndexContextMenu, setTabCurrentIndexContextMenu] =
    useState(null);
  const [navContextMenu, setNavContextMenu] = useState(null);
  const [navContextMenuReportName, setNavContextMenuReportName] = useState({});

  //TreeView 1/19/22
  const [expanded, setExpanded] = useState(["Search", "Wizards"]);
  const [selected, setSelected] = useState("Dashboard");

  const onAppTabChange = (e, newValue) => {
    //setAppTabValue(newValue);

    setApplicationTabs((oldTabs) =>
      oldTabs.map((tab) =>
        tab.uuid === newValue
          ? { ...tab, active: true }
          : { ...tab, active: false }
      )
    );
  };

  useEffect(() => {
    if (activeTab.type === "dashboard") {
      if (activeTab.name) {
        setSelected(activeTab.name);
      }
    } else if (activeTab.type === "wizard") {
      setExpanded((old) =>
        old.includes("Wizards") ? old : [...old, "Wizards"]
      );
      if (activeTab.name) {
        setSelected(activeTab.name);
      }
    } else if (activeTab.type === "form") {
      setExpanded((old) => (old.includes("Search") ? old : [...old, "Search"]));

      if (activeTab.name) {
        setSelected(plurifyFormName(activeTab.name));
      }
    } else {
      setExpanded((old) => (old.includes("Search") ? old : [...old, "Search"]));
      if (activeTab.name) {
        setSelected(activeTab.name);
      }
    }
  }, [activeTab]);

  const handleDrawerOpen = () => {
    setOpen(true);
  };

  const handleDrawerToggle = () => {
    setOpen((old) => !old);
  };

  //! Updates with app tabs
  const onClickOpenInCurrentTab = (event, newValue) => {
    //Update the active app tab with the navigation item clicked on
    //setValue(newValue);
    setApplicationTabs((old) =>
      old.map((o) =>
        o.uuid === activeTabUuid
          ? {
              ...o,
              label: newValue?.name?.replaceAll("_", " "),
              type: newValue?.type,
              name: newValue?.name,
            }
          : o
      )
    );
  };

  //#region //! Navigation Tabs
  const onRightClickNavTab = (e, name, type) => {
    setNavContextMenuReportName({ name, type });
    e.preventDefault();
    setNavContextMenu(
      navContextMenu === null
        ? {
            mouseX: e.clientX + 2,
            mouseY: e.clientY + 4,
          }
        : null
    );
  };

  const onCloseNavContextMenu = () => {
    setNavContextMenuReportName(null);
    setNavContextMenu(null);
  };
  //#endregion

  //#region //! Application Tabs

  const onRightClickTab = (e, tab, i) => {
    setTabCurrentIndexContextMenu(i);
    setTabCurrentContextMenu(tab);
    e.preventDefault();
    setTabContextMenu(
      tabContextMenu === null
        ? {
            mouseX: e.clientX - 2,
            mouseY: e.clientY - 4,
          }
        : null
    );
  };

  const onCloseTabContextMenu = () => {
    setTabCurrentIndexContextMenu(null);
    setTabCurrentContextMenu(null);
    setTabContextMenu(null);
  };

  const onCloseTab = (tab, i) => {
    setApplicationTabs((oldTabs) => {
      const _newTabs = oldTabs.filter((o) => o.uuid !== tab.uuid); //? Filter out the closed tab

      if (_newTabs.filter((newTab) => newTab.active === true).length === 0) {
        //? No active tabs in the new set
        if (i < _newTabs.length) {
          //? The removed i was a valid index within the new array, so set the same tab as active
          return _newTabs.map((newTab, newTabIndex) =>
            newTabIndex === i
              ? { ...newTab, active: true }
              : { ...newTab, active: false }
          );
        } else {
          //? Set the active tab as the last valid index in the _newTabs array
          return _newTabs.map((newTab, newTabIndex) =>
            newTabIndex === _newTabs.lenth - 1
              ? { ...newTab, active: true }
              : { ...newTab, active: false }
          );
        }
      } else {
        return _newTabs; //? There was already an active tab within the remaining tabs, do nothing else
      }
    });
  };

  const onCloseOtherTabs = (tab) => {
    setApplicationTabs((old) =>
      old
        .filter((o) => o.uuid === tab.uuid)
        .map((onlyTab) => ({ ...onlyTab, active: true }))
    );
  };

  const onCloseTabsToTheLeft = (tab, i) => {
    setApplicationTabs((old) =>
      old
        .filter((o, index) => index > i - 1) //? Filter out indexes less than the input
        .map(
          (o, i) => (i === 0 ? { ...o, active: true } : { ...o, active: false }) //? For the leftmost index, set this tab as the active and others to inactive
        )
    );
  };

  const onCloseTabsToTheRight = (tab, i) => {
    setApplicationTabs((old) => {
      const _temp = old.filter((o, index) => index < i + 1); //? Filter out indexes greater than the input
      return _temp.map(
        (o, i) =>
          i === _temp.length - 1
            ? { ...o, active: true }
            : { ...o, active: false } //? For the rightmost index, set this tab as the active and others to inactive
      );
    });
  };

  const onTabReorderDrop = (result) => {
    // dropped outside the list
    if (!result.destination) {
      return;
    }

    const reorder = (list, startIndex, endIndex) => {
      var result = Array.from(list);
      const [removed] = result.splice(startIndex, 1);
      result.splice(endIndex, 0, removed);
      return result;
    };

    setApplicationTabs(
      reorder(applicationTabs, result.source.index, result.destination.index)
    );
  };
  //#endregion

  return (
    <Box sx={{ display: "flex" }}>
      <MuiNavbar
        open={open}
        handleDrawerOpen={handleDrawerOpen}
        handleDrawerToggle={handleDrawerToggle}
      />

      <Drawer
        // onMouseOver={() =>
        //   autoHideNavigation && desktopMode ? handleMouseEnter() : null
        // }
        // onMouseLeave={() =>
        //   autoHideNavigation && desktopMode ? handleMouseLeave() : null
        // }
        onClose={() => setOpen(false)}
        variant={desktopMode ? "persistent" : "temporary"}
        open={open}
        sx={{
          width: drawerWidth,
          flexShrink: 0,
          "& .MuiPaper-root": {
            zIndex: (theme) => (desktopMode ? 0 : theme.zIndex.drawer),
            mt: navBarHeight + "px",
            height: `calc(100vh - ${navBarHeight}px)`,
            backgroundColor: "background.default",
          },
          "& .Drawer-paper": {
            width: drawerWidth,
            boxSizing: "border-box",
          },
        }}
      >
        <TreeView
          expanded={expanded}
          selected={selected}
          onNodeToggle={(e, nodeIds) => setExpanded(nodeIds)}
          onNodeSelect={(e, nodeId) => {
            if (
              nodeId !== "Search" &&
              nodeId !== "Wizards" &&
              nodeId !== "Admin"
            ) {
              setSelected(nodeId);
              const type =
                nodeId === "Dashboard"
                  ? "dashboard"
                  : navForms
                      .map((form) => plurifyFormName(form))
                      .includes(nodeId) ||
                    navAdmin
                      .map((form) => plurifyFormName(form))
                      .includes(nodeId)
                  ? "report"
                  : "wizard";

              setApplicationTabs((old) =>
                old.map((o) =>
                  o.uuid === activeTabUuid
                    ? {
                        ...o,
                        label: nodeId?.replaceAll("_", " "),
                        type,
                        name: nodeId,
                      }
                    : o
                )
              );
            }
          }}
          defaultCollapseIcon={<ArrowDropDown />}
          defaultExpandIcon={<ArrowRight />}
          defaultEndIcon={<div style={{ width: 24 }} />}
          sx={{
            height: "100%",
            pt: 1,
            pr: 1,
            flexGrow: 1,
            width: `${drawerWidth}px`,
            overflowY: "auto",
          }}
        >
          <StyledTreeItem
            nodeId="Dashboard"
            labelText="Dashboard"
            formName="Dashboard"
            onContextMenu={(e) =>
              onRightClickNavTab(e, "Dashboard", "dashboard")
            }
          />
          <StyledTreeItem nodeId="Search" labelText="Search" formName="Search">
            {navForms.map((form) => (
              <StyledTreeItem
                key={form}
                nodeId={plurifyFormName(form)}
                labelText={plurifyFormName(form?.replaceAll("_", " "))}
                formName={form}
                onContextMenu={(e) =>
                  onRightClickNavTab(e, plurifyFormName(form), "report")
                }
              />
            ))}
          </StyledTreeItem>
          <StyledTreeItem
            nodeId="Wizards"
            labelText="Wizards"
            formName="Wizard"
          >
            {navWizards.map((wizard) => (
              <StyledTreeItem
                key={wizard}
                nodeId={wizard}
                labelText={wizard?.replaceAll("_", " ")}
                formName={wizard}
                onContextMenu={(e) => onRightClickNavTab(e, wizard, "wizard")}
              />
            ))}
          </StyledTreeItem>

          {currentUserIsAdmin ? (
            <StyledTreeItem nodeId="Admin" labelText="Admin" formName="Admin">
              {navAdmin.map((form) => (
                <StyledTreeItem
                  key={form}
                  nodeId={plurifyFormName(form)}
                  labelText={plurifyFormName(form?.replaceAll("_", " "))}
                  formName={form}
                  onContextMenu={(e) =>
                    onRightClickNavTab(e, plurifyFormName(form), "report")
                  }
                />
              ))}
            </StyledTreeItem>
          ) : null}
        </TreeView>
      </Drawer>

      {/*
			<DragDropContext onDragEnd={onDragEnd}>
				<Droppable droppableId="1" direction="horizontal">
				{(droppableProvided) => (
					<div
					ref={droppableProvided.innerRef}
					{...droppableProvided.droppableProps}
					>
					<TabList
						onChange={handleChange}
						aria-label="lab API tabs example"
					>
						{tabsOrder.map((tabId, index) => {
						return (
							<DraggableTab
							label={tabs[tabId].label}
							value={tabs[tabId].value}
							index={index}
							key={index}
							/>
						);
						})}
						{droppableProvided.placeholder}
					</TabList>
					</div>
				)}
				</Droppable>
			</DragDropContext>
		*/}

      {/* https://codesandbox.io/s/draggable-mui-tabs-sfpu3 */}

      <Main open={open} desktopMode={desktopMode}>
        <Box
          sx={{
            mt: navBarHeight + "px",
            height: `${navBarHeight}px`,
          }}
        >
          <DragDropContext onDragEnd={onTabReorderDrop}>
            <Droppable droppableId="1" direction="horizontal">
              {(droppableProvided) => (
                <div
                  ref={droppableProvided.innerRef}
                  {...droppableProvided.droppableProps}
                >
                  <Tabs
                    sx={{
                      pt: 1,
                      px: 1,
                      backgroundColor: "tabs.background",
                      height: `${tabBarHeight}px`,
                      ".MuiTabs-flexContainer": { height: "100%" },
                    }}
                    value={activeTabUuid}
                    onChange={onAppTabChange}
                    indicatorColor="primary"
                    textColor="inherit"
                    variant="scrollable"
                  >
                    {applicationTabs?.map((tab, i) => (
                      <DraggableTab
                        key={tab.uuid}
                        draggableId={tab.uuid}
                        index={i}
                        onContextMenu={(e) => onRightClickTab(e, tab, i)}
                        label={tab.label?.replaceAll("_", " ")}
                        value={tab.uuid}
                        icon={
                          <Tooltip title={`Close`}>
                            <IconButton
                              size="small"
                              component="label"
                              onClick={(e) => {
                                e.stopPropagation();
                                onCloseTab(tab, i);
                              }}
                              sx={{
                                display:
                                  applicationTabs.length > 1 ? "flex" : "none",
                                alignItems: "center",
                                visibility:
                                  activeTab.uuid === tab.uuid
                                    ? "visible"
                                    : "hidden",
                              }}
                            >
                              <Close fontSize="inherit" />
                            </IconButton>
                          </Tooltip>
                        }
                        iconPosition="end"
                        sx={{
                          minHeight: 0,
                          backgroundColor:
                            activeTab.uuid === tab.uuid
                              ? "tabs.active"
                              : "tabs.inactive",
                          opacity: activeTab.uuid === tab.uuid ? 1 : 0.5,
                          "&:hover": {
                            opacity: activeTab.uuid === tab.uuid ? 1 : 0.75,
                            "& .MuiSvgIcon-root": {
                              visibility: "visible",
                            },
                          },
                        }}
                      />
                    ))}
                  </Tabs>

                  {droppableProvided.placeholder}
                </div>
              )}
            </Droppable>
          </DragDropContext>

          {/* <Tabs
            sx={{
              pt: 1,
              px: 1,
              backgroundColor: "tabs.background",
              height: `${tabBarHeight}px`,
              ".MuiTabs-flexContainer": { height: "100%" },
            }}
            value={activeTabUuid}
            onChange={onAppTabChange}
            indicatorColor="primary"
            textColor="inherit"
            variant="scrollable"
          >
            {applicationTabs?.map((tab, i) => (
              <Tab
                key={tab.uuid}
                onContextMenu={(e) => onRightClickTab(e, tab, i)}
                label={tab.label?.replaceAll("_", " ")}
                value={tab.uuid}
                icon={
                  <Tooltip title={`Close`}>
                    <IconButton
                      size="small"
                      component="label"
                      onClick={(e) => {
                        e.stopPropagation();
                        onCloseTab(tab, i);
                      }}
                      sx={{
                        display: applicationTabs.length > 1 ? "flex" : "none",
                        alignItems: "center",
                        visibility:
                          activeTab.uuid === tab.uuid ? "visible" : "hidden",
                      }}
                    >
                      <Close fontSize="inherit" />
                    </IconButton>
                  </Tooltip>
                }
                iconPosition="end"
                sx={{
                  minHeight: 0,
                  backgroundColor:
                    activeTab.uuid === tab.uuid
                      ? "tabs.active"
                      : "tabs.inactive",
                  opacity: activeTab.uuid === tab.uuid ? 1 : 0.5,
                  "&:hover": {
                    opacity: activeTab.uuid === tab.uuid ? 1 : 0.75,
                    "& .MuiSvgIcon-root": {
                      visibility: "visible",
                    },
                  },
                }}
              />
            ))}
          </Tabs> */}
        </Box>

        {/* Render Page -> excellent compromise added 1/1/22 - keep reports/wizards in memory, but load forms/dashboard on demand */}
        <Container
          disableGutters
          ref={appContainer}
          sx={{
            maxWidth: { xs: appMaxWidth }, //replaced
            height: window.innerHeight - navBarHeight - tabBarHeight,
            overflowY: "auto",
          }}
        >
          {applicationTabs
            ?.filter(
              (tab) =>
                activeTabUuid === tab.uuid ||
                tab.type === "report" ||
                tab.type === "wizard" ||
                tab.type === "dashboard"
            )
            ?.map((tab) => (
              <Box
                key={tab.uuid}
                hidden={tab.uuid !== activeTabUuid}
                sx={{
                  flexGrow: 1,
                }}
              >
                {tab.type === "report" || tab.type === "dashboard" ? (
                  renderPage(
                    tab.name,
                    window.innerHeight - navBarHeight - tabBarHeight
                  )
                ) : (
                  <RenderForm
                    formName={tab.name}
                    {...tab}
                    maxHeight={window.innerHeight - navBarHeight - tabBarHeight}
                    maxWidth={appContainer?.current?.clientWidth}
                  />
                )}
              </Box>
            ))}
        </Container>
      </Main>

      <Menu
        open={navContextMenu !== null}
        onClose={onCloseNavContextMenu}
        anchorReference="anchorPosition"
        anchorPosition={
          navContextMenu !== null
            ? { top: navContextMenu.mouseY, left: navContextMenu.mouseX }
            : undefined
        }
      >
        <MenuItem
          onClick={(e) => {
            onClickOpenInCurrentTab(e, navContextMenuReportName);
            onCloseNavContextMenu();
          }}
        >
          {`Open ${navContextMenuReportName?.name?.replaceAll(
            "_",
            " "
          )} in Current Tab`}
        </MenuItem>
        <MenuItem
          onClick={() => {
            //Create a new application tab at the end of the current list
            const _uuid = uuid();
            setApplicationTabs((old) => [
              ...old.map((o) => ({ ...o, active: false })),
              {
                uuid: _uuid,
                label: navContextMenuReportName?.name?.replaceAll("_", " "),
                type: navContextMenuReportName?.type,
                name: navContextMenuReportName?.name,
                active: true,
              },
            ]);
            onCloseNavContextMenu();
          }}
        >
          {`Open ${navContextMenuReportName?.name?.replaceAll(
            "_",
            " "
          )} in New Tab`}
        </MenuItem>
      </Menu>

      <Menu
        open={tabContextMenu !== null}
        onClose={onCloseTabContextMenu}
        anchorReference="anchorPosition"
        anchorPosition={
          tabContextMenu !== null
            ? { top: tabContextMenu.mouseY, left: tabContextMenu.mouseX }
            : undefined
        }
      >
        <MenuItem
          onClick={() => {
            applicationTabs.forEach((tab, idx) => {
              if (tab.uuid === tabCurrentContextMenu.uuid) onCloseTab(tab, idx);
            });
            onCloseTabContextMenu();
          }}
          disabled={applicationTabs.length <= 1}
        >
          Close
        </MenuItem>
        <MenuItem
          onClick={() => {
            onCloseOtherTabs(tabCurrentContextMenu);
            onCloseTabContextMenu();
          }}
          disabled={applicationTabs.length <= 1}
        >
          Close Others
        </MenuItem>
        <Divider />
        <MenuItem
          onClick={() => {
            onCloseTabsToTheLeft(
              tabCurrentContextMenu,
              tabCurrentIndexContextMenu
            );
            onCloseTabContextMenu();
          }}
          disabled={!tabCurrentIndexContextMenu || applicationTabs.length <= 1}
        >
          Close to the Left
        </MenuItem>
        <MenuItem
          onClick={() => {
            onCloseTabsToTheRight(
              tabCurrentContextMenu,
              tabCurrentIndexContextMenu
            );
            onCloseTabContextMenu();
          }}
          disabled={
            tabCurrentIndexContextMenu !== null
              ? tabCurrentIndexContextMenu === applicationTabs.length - 1 ||
                applicationTabs.length <= 1
              : true
          }
        >
          Close to the Right
        </MenuItem>
        <Divider />
        <MenuItem
          onClick={() => {
            setApplicationTabs((old) => [
              ...old.map((o) => ({ ...o, active: false })),
              {
                uuid: uuid(),
                label: "Dashboard",
                type: "dashboard",
                name: "Dashboard",
                active: true,
              },
            ]);
            onCloseTabContextMenu();
          }}
        >
          Open a New Tab
        </MenuItem>
      </Menu>
    </Box>
  );
};

SideNav.propTypes = {
  children: PropTypes.oneOfType([PropTypes.object, PropTypes.array]),
};

export default SideNav;
