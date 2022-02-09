import React from "react";
import PropTypes from "prop-types";
import { useRecoilValue } from "recoil";
import { appMaxWidthState } from "../../recoil/atoms";
import { AppBar, Button, Container, Toolbar } from "@mui/material";

const BottomBar = ({ show, onSave, saveDisabled, onReset, resetDisabled }) => {
  const appMaxWidth = useRecoilValue(appMaxWidthState);
  return (
    <AppBar
      color="inherit"
      position="relative"
      sx={{
        display: show ? "block" : "none",
      }}
    >
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
          <Button onClick={onReset} sx={{ mr: 2 }} disabled={resetDisabled}>
            Reset
          </Button>
          <Button
            onClick={onSave}
            disabled={saveDisabled}
            color="secondary"
            variant="contained"
          >
            Save
          </Button>
        </Toolbar>
      </Container>
    </AppBar>
  );
};

BottomBar.propTypes = {
  show: PropTypes.bool,
  onSave: PropTypes.func.isRequired,
  saveDisabled: PropTypes.bool,
  onReset: PropTypes.func.isRequired,
  resetDisabled: PropTypes.bool,
};

export default BottomBar;
