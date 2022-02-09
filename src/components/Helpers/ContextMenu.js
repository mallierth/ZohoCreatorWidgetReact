import React from 'react';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import Typography from '@mui/material/Typography';
import { Box, ListItemIcon } from '@mui/material';

export default function ContextMenu({ children, menuItems, disabled }) {
	const [contextMenu, setContextMenu] = React.useState(null);

	const handleContextMenu = (e) => {
		e.preventDefault();
		setContextMenu(
			contextMenu === null
				? {
						mouseX: e.clientX - 2,
						mouseY: e.clientY - 4,
				  }
				: // repeated contextmenu when it is already open closes it with Chrome 84 on Ubuntu
				  // Other native context menus might behave different.
				  // With this behavior we prevent contextmenu from the backdrop to re-locale existing context menus.
				  null
		);
	};

	const handleClose = (menuItem) => {
		if (menuItem.onClick) menuItem.onClick();
		setContextMenu(null);
	};

	return (
		<Box onContextMenu={disabled ? null : (e) => handleContextMenu(e)}>
			{children}
			<Menu
				open={contextMenu !== null}
				onClose={handleClose}
				anchorReference='anchorPosition'
				anchorPosition={
					contextMenu !== null
						? { top: contextMenu.mouseY, left: contextMenu.mouseX }
						: undefined
				}>
				{menuItems.map((menuItem) => (
					<MenuItem key={menuItem.label} onClick={() => handleClose(menuItem)}>
						{menuItem.icon ? (
							<ListItemIcon>{menuItem.icon}</ListItemIcon>
						) : null}
						<Typography variant='inherit'>{menuItem.label}</Typography>
					</MenuItem>
				))}
			</Menu>
		</Box>
	);
}
