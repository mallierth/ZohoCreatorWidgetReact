import React from 'react';
import PropTypes from 'prop-types';
import { lockUiState } from '../../recoil/atoms';
import { Backdrop, CircularProgress } from '@mui/material';
import { useRecoilValue } from 'recoil';

const LockUi = () => {
	const lockUi = useRecoilValue(lockUiState);

	return (
		<Backdrop
			sx={{ color: '#fff', zIndex: (theme) => theme.zIndex.drawer + 1 }}
			open={lockUi.open}>
			<CircularProgress color='inherit' />
		</Backdrop>
	);
};

LockUi.propTypes = {};

export default LockUi;
