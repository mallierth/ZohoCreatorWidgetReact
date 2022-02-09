import React, { useEffect, useRef, useState } from 'react';
import PropTypes from 'prop-types';
import {
	alpha,
	Box,
	Button,
	Divider,
	InputLabel,
	Paper,
	Tooltip,
	Typography,
} from '@mui/material';
import { Delete, FileDownload, FileUpload } from '@mui/icons-material';
import {
	zohoDownloadUrlParser,
	zohoFilpathParserFromDownloadUrl,
	zohoFilenameParserFromDownloadUrl,
} from '../Helpers/functions';

const FileUploadField = ({ multiple, value, onChange, label, accept }) => {
	const uploadRef = useRef(null);
	const downloadRef = useRef(null);
	const [dragging, setDragging] = useState(false);
	const [downloadUrl, setDownloadUrl] = useState();
	const [filePath, setFilePath] = useState();
	const [fileName, setFileName] = useState();
	const [hover, setHover] = useState(false);

	useEffect(() => {
		if (value instanceof FileList) {
			//File is being uploaded during current session, so it is an instanceof FileList
			setDownloadUrl('');
			setFilePath('');
			setFileName(value[0].name); //FileList[0] = instanceof File
		} else if (value instanceof File) {
			//File is being uploaded during current session, so it is an instanceof FileList
			setDownloadUrl('');
			setFilePath('');
			setFileName(value.name); //FileList[0] = instanceof File
		} else {
			//Parse values from Zoho database
			setDownloadUrl((old) =>
				old !== zohoDownloadUrlParser(value)
					? zohoDownloadUrlParser(value)
					: old
			);
			setFilePath((old) =>
				old !== zohoFilpathParserFromDownloadUrl(value)
					? zohoFilpathParserFromDownloadUrl(value)
					: old
			);
			setFileName((old) =>
				old !== zohoFilenameParserFromDownloadUrl(value)
					? zohoFilenameParserFromDownloadUrl(value)
					: old
			);
		}
	}, [value]);

	// useEffect(() => {
	// 	console.log('FileUploadField.js downloadUrl', downloadUrl);
	// 	console.log('FileUploadField.js filePath', filePath);
	// 	console.log('FileUploadField.js fileName', fileName);
	// }, [downloadUrl, filePath, fileName]);

	const onFileChange = (e) => {
		if (!e) {
			uploadRef.current.value = null;
			onChange ? onChange('') : undefined;
		} else {
			onChange ? onChange(e) : undefined;
		}
	};

	const onDragEnter = (e) => {
		e.preventDefault();
		e.stopPropagation();
		if (e.dataTransfer.items && e.dataTransfer.items.length > 0) {
			setDragging(true);
		}
	};

	const onDragLeave = (e) => {
		e.preventDefault();
		e.stopPropagation();
		setDragging(false);
	};

	const onDragOver = (e) => {
		e.preventDefault();
		e.stopPropagation();
		setDragging((old) => (old ? old : true));
	};

	const onDrop = (e) => {
		e.preventDefault();
		e.stopPropagation();

		if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
			onFileChange({ ...e, target: { ...{}, files: e.dataTransfer.files } });
			e.dataTransfer.clearData();
			setDragging(false);
		}
	};

	return (
		<Box
			sx={{ display: 'flex', alignItems: 'center' }}
			onMouseOver={() => setHover(true)}
			onMouseLeave={() => setHover(false)}>
			{label ? (
				<Typography sx={{ mr: 2, color: hover ? 'text.primary' : 'text.secondary' }}>{label}</Typography>
			) : null}
			<Box
				sx={{
					flex: 'auto',
					height: '100%',
					display: 'flex',
					alignItems: 'center',
					border: (theme) =>
						`${dragging ? '2px dashed' : '2px solid'} ${theme.palette.divider}`,
					borderRadius: 1,
					backgroundColor: (theme) =>
						dragging ? alpha(theme.palette.info.light, 0.15) : 'transparent',
				}}
				onClick={() => uploadRef.current.click()}
				onDragEnter={onDragEnter}
				onDragLeave={onDragLeave}
				onDragOver={onDragOver}
				onDrop={onDrop}>
				<Tooltip arrow title='Click to Upload an Attachment'>
					<span>
						<Button
							color='info'
							sx={{ height: '100%' }}
							variant='text'
							startIcon={<FileUpload />}
							component='span'
							onClick={(e) => {
								uploadRef.current.click();
								e.stopPropagation();
							}}
							disabled={
								downloadUrl
									? true
									: uploadRef.current
									? Boolean(uploadRef.current.value)
									: false
							}>
							Upload
							<input
								hidden
								ref={uploadRef}
								type='file'
								multiple={multiple}
								onChange={onFileChange}
								accept={accept.join(', ')}
							/>
						</Button>
					</span>
				</Tooltip>
				<Divider
					orientation='vertical'
					flexItem
					sx={{ pointerEvents: 'none' }}
				/>
				<Typography sx={{ flex: 'auto', color: 'info.light', px: 2 }}>
					{fileName}
				</Typography>
				<Divider
					orientation='vertical'
					flexItem
					sx={{ pointerEvents: 'none' }}
				/>
				<Tooltip arrow title='Click to Download Current Attachment'>
					<span>
						<Button
							color='info'
							sx={{ height: '100%' }}
							disabled={!downloadUrl}
							variant='text'
							startIcon={<FileDownload />}
							component='span'
							onClick={(e) => {
								downloadRef.current.click();
								e.stopPropagation();
							}}>
							Download
							<a
								hidden
								ref={downloadRef}
								download={fileName}
								href={downloadUrl}
							/>
						</Button>
					</span>
				</Tooltip>
				<Divider
					orientation='vertical'
					flexItem
					sx={{ pointerEvents: 'none' }}
				/>
				<Tooltip arrow title='Click to Remove Current Attachment'>
					<span>
						<Button
							color='error'
							sx={{ height: '100%' }}
							variant='text'
							startIcon={<Delete />}
							component='span'
							onClick={(e) => {
								onFileChange();
								e.stopPropagation();
							}}
							disabled={!fileName}>
							Remove
						</Button>
					</span>
				</Tooltip>
			</Box>
		</Box>
	);
};

FileUploadField.propTypes = {
	// reportName: PropTypes.string,
	// parentId: PropTypes.string,
	// fieldKey: PropTypes.string,
	// filePath: PropTypes.string,

	value: PropTypes.oneOfType([PropTypes.string, PropTypes.object]), //string if loading a form with a saved file, JS file object if uploading in current session
	multiple: PropTypes.bool,
	onChange: PropTypes.func,
	accept: PropTypes.array,
};

FileUploadField.defaultProps = {
	accept: ['All Files (*.*)'],
}

export default FileUploadField;
