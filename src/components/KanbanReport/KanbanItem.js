import React, { useRef } from "react";
import { Draggable } from "react-beautiful-dnd";
import {
    Avatar,
    AvatarGroup,
    Box,
    Card,
    CardActions,
    CardContent,
    CardHeader,
    Chip,
    Fab,
    IconButton,
    Menu,
    MenuItem,
    Stack,
    Tooltip,
    Typography,
} from '@mui/material';
import {
    MoreVert,
    Schedule,
} from '@mui/icons-material'


function stringToColor(string) {
    let hash = 0;
    let i;

    /* eslint-disable no-bitwise */
    for (i = 0; i < string.length; i += 1) {
        hash = string.charCodeAt(i) + ((hash << 5) - hash);
    }

    let color = '#';

    for (i = 0; i < 3; i += 1) {
        const value = (hash >> (i * 8)) & 0xff;
        color += `00${value.toString(16)}`.substr(-2);
    }
    /* eslint-enable no-bitwise */

    return color;
}

function stringAvatar(name) {
    name = name.trim();
    return {
        sx: {
            bgcolor: stringToColor(name),
        },
        children: `${name.split(' ')[0][0]}${name.split(' ')[1][0]}`,
    };
}

const KanbanItem = React.memo((props) => {
    const [anchorEl, setAnchorEl] = React.useState(null);
    const open = Boolean(anchorEl);
    const { id, index, menuItemOptions } = props; //Requirements for Draggable
    const { users, tags, title, subheader, description, dueDate, onItemDoubleClick } = props;

    const handleClose = (menuItem) => {
        setAnchorEl(null);
        if(menuItem && menuItem.onClick) {
            menuItem.onClick(id);
        }
    }

    return <>
        <Draggable draggableId={id} index={index}>
            {(provided, snapshot) => (
                <Card
                    raised elevation={20}
                    sx={{width: 325, userSelect: "none"}}
                    ref={provided.innerRef}
                    {...provided.draggableProps}
                    {...provided.dragHandleProps}
                    onDoubleClick={() => onItemDoubleClick(id)}
                >
                    <CardHeader
                        avatar={tags ? 
                            <Stack direction='row' sx={{ pointerEvents: 'none', flexWrap: 'wrap', maxWidth: '260px', '.Stack-root>:not(style)+:not(style)': {ml:  { xs: 1 }, mt: {xs: 1}} }}>
                                {tags.map(tag => (
                                    <Chip key={tag.label} label={tag.label} color={tag.color || 'info'} size='small' sx={{ mt: 1, ml: 1}} />
                                ))}
                            </Stack>
                        :
                            <Typography variant='body1'>No tags provided</Typography>}
                        action={
                            menuItemOptions ? 
                                <IconButton
                                    sx={{ mr: 1, mt: 1 }}
                                    onClick={(e) => setAnchorEl(e.currentTarget)}
                                    size="large">
                                    <MoreVert />
                                </IconButton>
                            : null}
                        //title={ title ? title : null } titleTypographyProps={{ variant: 'body1' }}
                        //subheader={ subheader ? subheader : null }
                        sx={{ p: 0, pb: 1 }}
                    />
                    <CardContent sx={{ px: 1, pb: 1, pt: 0 }}>
                        <Typography variant="body2" color="text.primary">{description}</Typography>
                    </CardContent>

                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', px: 1, pb: 1 }}>
                        {dueDate ?
                            <Tooltip title='Due Date' arrow>
                                <Chip icon={<Schedule />} size="small" sx={{ pointerEvents: 'none' }} label={dueDate} />
                            </Tooltip>
                        :
                            null
                        }
                        
                        <Box sx={{ flex: 'grow' }}></Box>

                        {users ?
                            <AvatarGroup max={3}>
                                {users ? users.map((user, i) => (
                                    <Tooltip key={i} title={user} arrow>
                                        <Avatar {...stringAvatar(user)} />
                                    </Tooltip>
                                )) : null}
                            </AvatarGroup>
                        :
                            null
                        }
                    </Box>
                </Card>
            )}
        </Draggable>
        <Menu anchorEl={anchorEl} open={open} onClose={handleClose}>
            {menuItemOptions ? 
                menuItemOptions.map(menuItem => (
                    <MenuItem key={menuItem.label} onClick={() => handleClose(menuItem)}>{menuItem.label}</MenuItem>
                ))
            : null }
        </Menu>
    </>;

})

export default KanbanItem;