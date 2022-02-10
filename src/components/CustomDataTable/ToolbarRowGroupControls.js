import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { Box, IconButton, Menu, Stack, Tooltip } from '@mui/material';
import { Compress, Expand } from '@mui/icons-material';

const TableActionButton = ({
	tooltip,
	Icon,
	disabled,
	onClick,
	color,
	size,
	enableContextMenu,
	contextOptions,
}) => {
	const [contextMenu, setContextMenu] = useState(null);
	return (
		<Tooltip arrow title={tooltip}>
			<span>
				<IconButton
					disabled={disabled}
					onClick={onClick}
					sx={{ color }}
					size={size}
					onContextMenu={(e) => {
						if (enableContextMenu) {
							e.preventDefault();
							setContextMenu(
								contextMenu === null
									? {
											mouseX: e.clientX + 2,
											mouseY: e.clientY + 4,
									  }
									: null
							);
						}
					}}>
					<Icon />
				</IconButton>

				{enableContextMenu ? (
					<Menu
						open={contextMenu !== null}
						onClose={() => setContextMenu(null)}
						anchorReference='anchorPosition'
						anchorPosition={
							contextMenu !== null
								? { top: contextMenu.mouseY, left: contextMenu.mouseX }
								: undefined
						}>
						{contextOptions.map((option) => option)}
					</Menu>
				) : null}
			</span>
		</Tooltip>
	);
};

TableActionButton.propTypes = {
	tooltip: PropTypes.string,
	Icon: PropTypes.object.isRequired,
	disabled: PropTypes.bool,
	onClick: PropTypes.func.isRequired,
	color: PropTypes.string.isRequired,
	size: PropTypes.oneOf(['small', 'medium', 'large']),
	enableContextMenu: PropTypes.bool,
	contextOptions: PropTypes.array,
};

TableActionButton.defaultProps = {
	badgeContent: '',
};

const TableActions = ({
	mobileMode,
	numSelected,
	show,
	disabled,

	size,
	color,

	onCompress,
	hideCompress,
	disableCompress,

	onExpand,
	hideExpand,
	disableExpand,
}) => {
	return (
		<Box sx={{ display: show ? 'block' : 'none' }}>
			{!mobileMode ? (
				<Stack direction='row' spacing={2}>
					{/* Compress */}
					{!hideCompress ? (
						<TableActionButton
							tooltip='Compress selections into single line item'
							disabled={disableCompress || disabled}
							onClick={onCompress}
							Icon={Compress}
							color={color}
							size={size}
						/>
					) : null}

					{/* Expand */}
					{!hideExpand ? (
						<TableActionButton
							tooltip='Expand selection into multiple line items'
							disabled={disableExpand || disabled}
							onClick={onExpand}
							Icon={Expand}
							color={color}
							size={size}
						/>
					) : null}
				</Stack>
			) : null}
		</Box>
	);
};

TableActions.propTypes = {
	mobileMode: PropTypes.bool,
	numSelected: PropTypes.number,
	show: PropTypes.bool,
	size: PropTypes.oneOf(['small', 'medium', 'large']),
	color: PropTypes.string,

	disabled: PropTypes.bool, //global disable

	onCompress: PropTypes.func,
	hideCompress: PropTypes.bool,
	disableCompress: PropTypes.bool,

	onExpand: PropTypes.func,
	hideExpand: PropTypes.bool,
	disableExpand: PropTypes.bool,
};

export default React.memo(TableActions);
