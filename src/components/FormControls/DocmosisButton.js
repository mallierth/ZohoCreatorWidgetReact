import React, { useEffect, useRef, useState } from 'react';
import PropTypes from 'prop-types';
import { useRecoilValue } from 'recoil';
import { currentUserState } from '../../recoil/atoms';
import { intTryParse } from '../Helpers/functions';
import dayjs from 'dayjs';
import { Box } from '@mui/material';
import { FileDownload } from '@mui/icons-material';
import { generateDocument } from '../../apis/docmosis';
import { LoadingButton } from '@mui/lab';
import ToastMessage from '../ToastMessage/ToastMessage';

const DocmosisButton = ({
	type,
	templatePath,
	outputFileName,
	data,
	disabled,
	ButtonProps,
}) => {
	const downloadRef = useRef(null);
	const currentUser = useRecoilValue(currentUserState);
	const [_data, setData] = useState({
		...data,
		Todays_Date: dayjs().format('l'),
		Author: currentUser.Full_Name,
	});
	const [base64Data, setBase64Data] = useState(null);
	const [busy, setBusy] = useState(false);
	const [toastData, setToastData] = useState({});

	useEffect(() => {
		console.log('DocmosisButton :', data);
		setData(old => ({...old, ...data}));
	}, [data]);

	useEffect(() => {
		if (base64Data) {
			downloadRef.current.click();
		}
	}, [base64Data]);

	return (
		<>
			<a download={outputFileName} href={base64Data} ref={downloadRef} hidden />
			{type === 'word' ? (
				<LoadingButton
					loading={busy}
					onClick={async () => {
						setBusy(true);
						setToastData({
							message: 'Issuing request to docmosis...',
							severity: 'info',
						});
						const response = await generateDocument(
							templatePath,
							`${outputFileName}.doc`,
							_data,
							currentUser.Full_Name
						);
						console.log('docmosis response: ', response);
						if (response.data && response.data.succeeded) {
							setToastData({
								message: 'Request successful! Downloading record...',
								severity: 'success',
							});
							setBase64Data(
								'data:application/doc;base64,' + response.data.resultFile
							);
						} else {
							//! Error
							setToastData({
								message: 'Error! Docmosis request failed...',
								severity: 'error',
							});
						}
						setBusy(false);
					}}
					disabled={disabled || !data}
					startIcon={<FileDownload />}
					color='primary'
					variant='contained'>
					Word Doc
				</LoadingButton>
			) : null}

			{type === 'pdf' ? (
				<LoadingButton
					sx={{ ml: 1 }}
					loading={busy}
					onClick={async () => {
						setBusy(true);
						const response = await generateDocument(
							templatePath,
							`${outputFileName}.pdf`,
							_data,
							currentUser.Full_Name
						);
						console.log('docmosis response: ', response);
						if (response.data && response.data.succeeded) {
							setToastData({
								message: 'Request successful! Downloading record...',
								severity: 'success',
							});
							setBase64Data((old) =>
								!old ||
								old !==
									'data:application/pdf;base64,' + response.data.resultFile
									? 'data:application/pdf;base64,' + response.data.resultFile
									: old
							);
						} else {
							//! Error
							setToastData({
								message: 'Error! Docmosis request failed...',
								severity: 'error',
							});
						}
						setBusy(false);
					}}
					disabled={disabled || !data}
					startIcon={<FileDownload />}
					color='primary'
					variant='contained'>
					PDF
				</LoadingButton>
			) : null}

			<ToastMessage data={toastData} defaultLocation />
		</>
	);
};

DocmosisButton.propTypes = {
	type: PropTypes.oneOf(['word', 'pdf']).isRequired,
	templatePath: PropTypes.string.isRequired,
	data: PropTypes.object,
	outputFileName: PropTypes.string, //ends with .pdf or .doc (.docx will not work!)
	disabled: PropTypes.bool,
};

export default DocmosisButton;
