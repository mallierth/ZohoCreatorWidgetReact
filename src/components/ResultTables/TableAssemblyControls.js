import React from 'react';
import { Box, ButtonGroup, Button, Tooltip } from '@mui/material';
import {
    Compress,
    Expand
} from '@mui/icons-material';


const TableAssemblyControls = (props) => {

    const {disabled, disableCompress, disableExpand} = props;
    const {onCompress, onExpand } = props;

    return (
        <ButtonGroup
            disabled={disabled}
            orientation="vertical"
            color="secondary"
            size='small'
            variant="contained"
        >
            <Tooltip arrow title='Collapse Selections into Single Line Item' placement='right'>
                <Button disabled={disableCompress} onClick={onCompress}>
                    <Compress/>
                </Button>
            </Tooltip>
            <Tooltip arrow title='Expand Selection into Multiple Line Items' placement='right'>
                <Button disabled={disableExpand} onClick={onExpand}>
                    <Expand />
                </Button>
            </Tooltip>
        </ButtonGroup>
    );
}

export default TableAssemblyControls;