import React, { useState } from "react";
import PropTypes from "prop-types";
import { useRecoilValue } from "recoil";
import {
  navBarHeightState,
  currentUserState,
  formMaxWidthState,
  tabBarHeightState,
} from "../../recoil/atoms";
import {
  Alert,
  Box,
  Container,
  Fab,
  Toolbar,
  useScrollTrigger,
  Zoom,
} from "@mui/material";
import { KeyboardArrowUp } from "@mui/icons-material";
import FormToolbar from "../Timeline/FormToolbar";
import Watermark from "../Helpers/Watermark";

const ScrollTop = (props) => {
  const { children, trigger, onClick } = props;
  // Note that you normally won't need to set the window ref as useScrollTrigger
  // will default to window.
  // This is only being set here because the demo is in an iframe.

  return (
    <Zoom in={trigger}>
      <Box
        onClick={onClick}
        sx={{ position: "absolute", bottom: 20, right: 20 }}
      >
        {children}
      </Box>
    </Zoom>
  );
};

ScrollTop.propTypes = {
  children: PropTypes.element.isRequired,
  id: PropTypes.string,
  trigger: PropTypes.bool,
  onClick: PropTypes.func.isRequired,
};

const FormWrapper = ({
  id,
  viewingInTab,
  alerts,
  disableTimeline,
  timelineOpen,
  setTimelineOpen,
  massUpdating,
  children,
  CustomFormActions,
  overrideHeightShrink,
  disabled,
  disabledText,
  maxHeight,
  renderInModal,
}) => {
  const scrollTarget = React.useRef(null);
  const navBarHeight = useRecoilValue(navBarHeightState);
  const tabBarHeight = useRecoilValue(tabBarHeightState);
  const currentUser = useRecoilValue(currentUserState);
  const formMaxWidth = useRecoilValue(formMaxWidthState);
  const [scrolledToBottom, setScrolledToBottom] = useState(false);

  const getPixelsToSubtract = () => {
    let pixelsToSubtract = viewingInTab ? 16 : 0;

    if (id && !massUpdating && !disableTimeline) {
      //There is a timeline toolbar and not massUpdating or timeline is not disabled
      pixelsToSubtract += 51;
    }

    if (
      !id ||
      currentUser.Enable_Autosave === "false" ||
      currentUser.Enable_Autosave === false ||
      massUpdating
    ) {
      pixelsToSubtract += 51;
    }

    return pixelsToSubtract + overrideHeightShrink;
  };

  return (
    <>
      <Box sx={{ pt: viewingInTab ? 1 : 0, }} />
      {massUpdating || disableTimeline ? null : (
        <FormToolbar
          id={id}
          viewingInTab={viewingInTab}
          open={timelineOpen}
          setOpen={setTimelineOpen}
          CustomFormActions={CustomFormActions}
          renderInModal={renderInModal}
        />
      )}
      {!timelineOpen ? (
        <Container
          disableGutters
          maxWidth="xl"
          sx={{ maxWidth: { xs: formMaxWidth } }}
        >
          {Object.keys(alerts).map((key, idx) => (
            <Alert
              key={idx}
              sx={{ my: 0.5, mx: 1 }}
              variant={alerts[key].variant || "filled"}
              severity={alerts[key].severity || "info"}
              action={alerts[key].action}
            >
              {alerts[key].message}
            </Alert>
          ))}
        </Container>
      ) : null}

      <Box
        ref={scrollTarget}
        sx={{
          height: renderInModal
            ? "100%"
            : `calc(${
                maxHeight ? `${maxHeight}px` : "100vh"
              } - ${getPixelsToSubtract()}px - ${
                Object.keys(alerts).length * (48.02 + 8)
              }px)`,
          overflowY: "auto",
          display: timelineOpen ? "none" : "block",
        }}
        onScroll={(e) =>
          setScrolledToBottom(
            e.target.scrollHeight - e.target.scrollTop === e.target.clientHeight
          )
        }
      >
        {disabled ? (
          <Watermark
            text={disabledText}
            height={
              renderInModal
                ? "100%"
                : `calc(${
                    maxHeight ? `${maxHeight}px` : "100vh"
                  } - ${getPixelsToSubtract()}px - ${
                    Object.keys(alerts).length * (48.02 + 8)
                  }px)`
            }
          />
        ) : null}
        <Container
          disableGutters
          maxWidth="xl"
          sx={{
            p: 1,
            maxWidth: {
              xs: massUpdating ? Math.ceil(formMaxWidth / 2) : formMaxWidth,
            },
            position: "relative",
            backgroundColor: "background.default",
            //pointerEvents: disabled ? 'none' : 'auto',
          }}
        >
          {children}
        </Container>
      </Box>
      <ScrollTop
        trigger={false} //Disabled for now 12/31/21
        scrollTarget={scrollTarget}
        onClick={(e) => {
          if (scrollTarget) {
            //NOT FUCKING WORKING FOR SOME GOD FORSAKEN REASON
            scrollTarget.current.scrollIntoView({
              behavior: "smooth",
              block: "start",
              inline: "start",
            });
          }
        }}
      >
        <Fab color="secondary" size="small">
          <KeyboardArrowUp />
        </Fab>
      </ScrollTop>
    </>
  );
};

FormWrapper.propTypes = {
  id: PropTypes.string,
  viewingInTab: PropTypes.bool,
  alerts: PropTypes.object,
  disableTimeline: PropTypes.bool,
  timelineOpen: PropTypes.bool,
  setTimelineOpen: PropTypes.func,
  massUpdating: PropTypes.bool,
  children: PropTypes.oneOfType([PropTypes.object, PropTypes.array]),
  overrideHeightShrink: PropTypes.number,
  disabled: PropTypes.bool,
  disabledText: PropTypes.string,
  maxHeight: PropTypes.number,
};

FormWrapper.defaultProps = {
  overrideHeightShrink: 0,
  alerts: {},
  maxHeight: window.innerHeight,
};

export default FormWrapper;
