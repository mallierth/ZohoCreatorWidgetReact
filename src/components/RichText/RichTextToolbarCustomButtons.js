import React from 'react';
import PropTypes from 'prop-types';
import { useRecoilValue } from 'recoil';
import {
	PersonAddAlt,
	MoreTime,
} from '@mui/icons-material';
import { ToggleButtonGroup, ToggleButton, Tooltip } from '@mui/material';
import { currentUserState } from '../../recoil/atoms';
import dayjs from 'dayjs';

//06/18/2020 02:09:08 PM, Jason Polick

const RichTextToolbarLists = ({editor}) => {

    const currentUser = useRecoilValue(currentUserState);

	return (
		<ToggleButtonGroup size='small'>
			<Tooltip arrow title='Insert Timestamp Only'>
				<ToggleButton value={'left'} onClick={() => editor ? editor.commands.insertContent(`${dayjs().format('l LT')}: `) : null}>
					<MoreTime />
				</ToggleButton>
			</Tooltip>
            <Tooltip arrow title='Insert Name and Timestamp'>
				<ToggleButton value={'left'} onClick={() => editor ? editor.commands.insertContent(`${dayjs().format('l LT')}, ${currentUser.Full_Name}: `) : null}>
					<PersonAddAlt />
				</ToggleButton>
			</Tooltip>
		</ToggleButtonGroup>
	);
};

RichTextToolbarLists.propTypes = {
	editor: PropTypes.object,
};

export default RichTextToolbarLists;
