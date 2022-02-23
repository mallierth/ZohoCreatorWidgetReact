import * as React from 'react';
import PropTypes from 'prop-types';
import Card from '@mui/material/Card';
import CardHeader from '@mui/material/CardHeader';
import CardContent from '@mui/material/CardContent';
import CardActions from '@mui/material/CardActions';
import Avatar from '@mui/material/Avatar';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import { Box, Button, Divider, Tooltip } from '@mui/material';
import { omit } from 'lodash-es';
import {
	MarkEmailRead,
	MarkEmailUnread,
	PriorityHigh,
	Update,
	VisibilityOff,
} from '@mui/icons-material';

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

const NotificationCard = ({
	author,
	title,
	subtitle,
	content,
	timestamp,
	timestampTooltip,
	read,
	onRead,
	onHide,
	variant,
	highImportance,

	applicationTabData,
	onAction,
}) => {
	//! High importance

	//! read graphic - overlay to dim

	return (
		<Card
			sx={{
				opacity: read ? 0.5 : 1,
				m: 1,
				border: variant ? 1 : 0,
				borderColor: variant ? `${variant}.main` : null,
			}}>
			<CardHeader
				avatar={
					<Tooltip title={author} arrow>
						<Avatar {...stringAvatar(author)} />
					</Tooltip>
				}
				action={
					<>
						{highImportance ? (
							<IconButton>
								<PriorityHigh sx={{ color: 'error.main' }} />
							</IconButton>
						) : null}
					</>
				}
				title={title}
				subheader={subtitle}
			/>
			<CardContent>
				<Typography variant='body2' color='text.secondary'>
					{content}
				</Typography>
				{applicationTabData && Array.isArray(applicationTabData)
					? applicationTabData.map((tab) => (
							<Box
								key={tab.label}
								sx={{ display: 'flex', justifyContent: 'flex-end' }}>
								<Button onClick={() => onAction(omit(tab, 'actionText'))}>
									{tab.actionText}
								</Button>
							</Box>
					  ))
					: null}
			</CardContent>
			<Divider variant='middle' />
			<Box
				sx={{
					py: 1,
					px: 2,
					display: 'flex',
					alignItems: 'center',
					justifyContent: 'space-between',
				}}>
				<Tooltip title={timestampTooltip}>
					<Typography
						variant='caption'
						sx={{
							color: 'text.secondary',
							display: 'flex',
							alignItems: 'center',
						}}>
						<Update sx={{ mr: 0.5 }} />
						{timestamp}
					</Typography>
				</Tooltip>

				<CardActions sx={{ p: 0 }}>
					<Tooltip title={`Mark as ${read ? 'Unread' : 'Read'}`}>
						<IconButton size='small' onClick={onRead}>
							{read ? <MarkEmailUnread /> : <MarkEmailRead />}
						</IconButton>
					</Tooltip>
					<Tooltip title='Dismiss'>
						<IconButton size='small' onClick={onHide}>
							<VisibilityOff />
						</IconButton>
					</Tooltip>
				</CardActions>
			</Box>
		</Card>
	);
};

NotificationCard.propTypes = {
	author: PropTypes.string,
	title: PropTypes.string,
	subtitle: PropTypes.oneOfType([PropTypes.string, PropTypes.object]),
	content: PropTypes.string,
	timestamp: PropTypes.oneOfType([PropTypes.string, PropTypes.object]),
	timestampTooltip: PropTypes.string,
	onRead: PropTypes.func,
	onHide: PropTypes.func,
	read: PropTypes.bool,
	variant: PropTypes.oneOf(['info', 'error', 'success', 'warning', null]),
	highImportance: PropTypes.bool,

	applicationTabData: PropTypes.oneOfType([PropTypes.array, PropTypes.string, ]),
	onAction: PropTypes.func,
};

export default NotificationCard;
