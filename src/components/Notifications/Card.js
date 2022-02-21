import * as React from 'react';
import PropTypes from 'prop-types';
import { styled } from '@mui/material/styles';
import Card from '@mui/material/Card';
import CardHeader from '@mui/material/CardHeader';
import CardMedia from '@mui/material/CardMedia';
import CardContent from '@mui/material/CardContent';
import CardActions from '@mui/material/CardActions';
import Collapse from '@mui/material/Collapse';
import Avatar from '@mui/material/Avatar';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import { red } from '@mui/material/colors';
import FavoriteIcon from '@mui/icons-material/Favorite';
import ShareIcon from '@mui/icons-material/Share';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import { Button, Tooltip } from '@mui/material';
import { Check, VisibilityOff } from '@mui/icons-material';

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
	read,
	onRead,
	onHide,
}) => {
	//! High importance

	//! read graphic - overlay to dim

	return (
		<Card sx={{ maxWidth: 345, opacity: read ? 0.5 : 1 }}>
			<CardHeader
				avatar={
					<Tooltip title={author} arrow>
						<Avatar {...stringAvatar(author)} />
					</Tooltip>
				}
				action={
					<IconButton aria-label='settings'>
						<MoreVertIcon />
					</IconButton>
				}
				title={title}
				subheader={subtitle}
			/>
			<CardContent>
				<Typography variant='body2' color='text.secondary'>
					{content}
				</Typography>
			</CardContent>

			<CardActions>
				<Button size='small' endIcon={<Check />} onClick={onRead}>
					Mark as Read
				</Button>
				<Button size='small' endIcon={<VisibilityOff />} onClick={onHide}>
					Dismiss
				</Button>
			</CardActions>
		</Card>
	);
};

NotificationCard.propTypes = {
	author: PropTypes.string,
	title: PropTypes.string,
	subtitle: PropTypes.string,
	content: PropTypes.string,
	timestamp: PropTypes.string,
    onRead: PropTypes.func,
    onHide: PropTypes.func,
    read: PropTypes.bool,

};

export default NotificationCard;
