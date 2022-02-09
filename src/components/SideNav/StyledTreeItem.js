import * as React from "react";
import PropTypes from "prop-types";
import Box from "@mui/material/Box";
import TreeItem, { treeItemClasses } from "@mui/lab/TreeItem";
import Typography from "@mui/material/Typography";
import DatabaseDefaultIcon from "../Helpers/DatabaseDefaultIcon";
import { styled, useTheme } from "@mui/material/styles";
import useMediaQuery from "@mui/material/useMediaQuery";

const StyledTreeItemRoot = styled(TreeItem)(({ theme }) => ({
  color: theme.palette.text.secondary,
  [`& .${treeItemClasses.content}`]: {
    color: theme.palette.text.secondary,
    borderTopRightRadius: theme.spacing(2),
    borderBottomRightRadius: theme.spacing(2),
    paddingRight: theme.spacing(1),
    fontWeight: theme.typography.fontWeightMedium,
    "&.Mui-expanded": {
      fontWeight: theme.typography.fontWeightRegular,
    },
    "&:hover": {
      backgroundColor: theme.palette.action.hover,
    },
    // "&.Mui-focused, &.Mui-selected, &.Mui-selected.Mui-focused": {
    //   backgroundColor: `var(--tree-view-bg-color, ${theme.palette.action.selected})`,
    //   color: "var(--tree-view-color)",
    // },
    "&.Mui-focused": {
      backgroundColor: "inherit",
      color: "inherit",
    },
    "&.Mui-selected": {
      backgroundColor: `var(--tree-view-bg-color, ${theme.palette.action.selected})`,
      color: "var(--tree-view-color)",
    },
    [`& .${treeItemClasses.label}`]: {
      fontWeight: "inherit",
      color: "inherit",
    },
  },
  [`& .${treeItemClasses.group}`]: {
    marginLeft: 0,
    [`& .${treeItemClasses.content}`]: {
      paddingLeft: theme.spacing(2),
    },
  },
}));

const StyledTreeItem = (props) => {
  const { bgColor, color, formName, labelInfo, labelText, onContextMenu, ...other } = props;
  const theme = useTheme();
  const desktopMode = useMediaQuery(theme.breakpoints.up("sm"));

  return (
    <StyledTreeItemRoot
      onContextMenu={(e) => onContextMenu ? onContextMenu(e) : null}
      label={
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            p: desktopMode ? 0.5 : 2,
            pr: 0,
          }}
        >
          <DatabaseDefaultIcon form={formName} color="inherit" sx={{ mr: 1 }} />
          <Typography
            variant="body2"
            sx={{ fontWeight: "inherit", flexGrow: 1 }}
          >
            {labelText}
          </Typography>
          <Typography variant="caption" color="inherit">
            {labelInfo}
          </Typography>
        </Box>
      }
      style={{
        "--tree-view-color": color,
        "--tree-view-bg-color": bgColor,
      }}
      {...other}
    />
  );
};

StyledTreeItem.propTypes = {
  bgColor: PropTypes.string,
  color: PropTypes.string,
  formName: PropTypes.string,
  labelInfo: PropTypes.string,
  labelText: PropTypes.string.isRequired,
  onContextMenu: PropTypes.func,
};

export default StyledTreeItem;
