import * as React from "react";
import PropTypes from "prop-types";
import Tab from "@mui/material/Tab";
import { Draggable } from "react-beautiful-dnd";
import { DragIndicator } from "@mui/icons-material";

const DraggableTab = ({draggableId, index, ...others}) => {
  return (
    <Draggable draggableId={draggableId} index={index}>
      {(draggableProvided) => (
        <div
          ref={draggableProvided.innerRef}
          {...draggableProvided.draggableProps}
        >
          <span {...draggableProvided.dragHandleProps}>
            <DragIndicator fontSize="small" />
          </span>
          <Tab {...others} />
        </div>
      )}
    </Draggable>
  );
};

DraggableTab.propTypes = {
  index: PropTypes.number.isRequired,
  draggableId: PropTypes.string.isRequired,
};

export default DraggableTab;
