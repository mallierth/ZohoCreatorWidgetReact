import React from 'react';
import { ButtonGroup, Button, Tooltip } from '@mui/material';
import {
    ArrowDownward,
    ArrowUpward,
    VerticalAlignBottom,
    VerticalAlignTop,
} from '@mui/icons-material';

const TableShiftControls = (props) => {

    const { disabled, disableShiftTop, disableShiftUp, disableShiftDown, disableShiftBottom } = props;
    const { onShiftTop, onShiftUp, onShiftDown, onShiftBottom  } = props;

    return (
        <ButtonGroup
            disabled={disabled}
            orientation="vertical"
            color="secondary"
            size='small'
            variant="contained"
        >
            <Tooltip arrow title='Shift to Top' placement='right'>
                <Button disabled={disableShiftTop} onClick={onShiftTop}>
                    <VerticalAlignTop />
                </Button>
            </Tooltip>
            <Tooltip arrow title='Shift Up One Row' placement='right'>
                <Button disabled={disableShiftUp} onClick={onShiftUp}>
                    <ArrowUpward />
                </Button>
            </Tooltip>
            <Tooltip arrow title='Shift Down One Row' placement='right'>
                <Button disabled={disableShiftDown} onClick={onShiftDown}>
                    <ArrowDownward />
                </Button>
            </Tooltip>
            <Tooltip arrow title='Shift to Bottom' placement='right'>
                <Button disabled={disableShiftBottom} onClick={onShiftBottom}>
                    <VerticalAlignBottom />
                </Button>
            </Tooltip>
        </ButtonGroup>
    )
}

export default TableShiftControls;