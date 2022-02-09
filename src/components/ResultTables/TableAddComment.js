import React from 'react';
import { Box, ButtonGroup, Button, Tooltip } from '@mui/material';
import {
    AddComment
} from '@mui/icons-material';

const TableShiftControls = (props) => {

    const { disabled, disableAddComment } = props;
    const { onCommentAddClicked  } = props;

    return (
        <ButtonGroup
            disabled={disabled}
            orientation="vertical"
            color="secondary"
            size='small'
            variant="contained"
        >
            <Tooltip arrow title='Add Comment' placement='right'>
                <Button disabled={disableAddComment} onClick={onCommentAddClicked}>
                    <AddComment />
                </Button>
            </Tooltip>
            
        </ButtonGroup>
    )
}

export default TableShiftControls;