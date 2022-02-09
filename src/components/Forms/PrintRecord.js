import React, { useEffect, useRef, useState } from 'react';
import PropTypes from 'prop-types';
import { useRecoilValue } from 'recoil';
import { appMaxWidthState, currentUserState } from '../../recoil/atoms';
import printFieldsState from '../../recoil/printFieldAtom';
import { intTryParse } from '../Helpers/functions';
import dayjs from 'dayjs';
import {
	AppBar,
	Box,
	Button,
	Checkbox,
	Container,
	FormControlLabel,
	FormHelperText,
	Grid,
	Paper,
	Stack,
	TextField,
	Toolbar,
} from '@mui/material';
import { FileDownload } from '@mui/icons-material';
import FormWrapper from '../FormControls/FormWrapper';
import { generateDocument } from '../../apis/docmosis';
import { LoadingButton } from '@mui/lab';
import DocmosisButton from '../FormControls/DocmosisButton';
import { omit } from 'lodash-es';
import RichTextField from '../RichText/RichTextField';

const getProductInfo = (row) => {
	switch (row.Type) {
		case 'Comment':
			return `Comment: ${row.Description}`;
		case 'Assembly':
			return `${row.Name}`;
		default:
			return `${row.Manufacturer ? row.Manufacturer + ' ' : ''}${
				row.Name !== row.Code ? `${row.Name} (${row.Code})` : row.Name
			}`;
	}
};

const dataFormatter = (data) => {
	let formattedObject = {};
	Object.keys(data).forEach((key) => {
		if (Array.isArray(data[key]) && !key.includes('_Line_Items')) {
			formattedObject[key] = data[key]
				.map((child) =>
					typeof child === 'object' ? child.display_value : child
				)
				.join(', ');
		}
		if (Array.isArray(data[key]) && key.includes('_Line_Items')) {
			//! Custom Table rows
			formattedObject[key] = data[key]
				.filter(
					(row) =>
						row.Type !== 'Comment' &&
						(row.Collapsible_Child === false ||
							row.Collapsible_Child === 'false')
				)
				.map((row) => ({
					...row,
					Product_Info: getProductInfo(row),
				}));
		} else if (typeof data[key] === 'object') {
			formattedObject[key] = data[key].display_value;
		} else if (intTryParse(data[key] && !key.includes('Zip'))) {
			formattedObject[key] = parseFloat(data[key]);
		} else {
			formattedObject[key] = data[key];
		}
	});

	//Special formatting - address
	if (Object.keys(data).filter((key) => key.includes('Account.'))) {
		let temp = [];
		if (data['Account.Shipping_Address_Street']) {
			temp.push(data['Account.Shipping_Address_Street']);
		}

		if (
			data['Account.Shipping_Address_City'] &&
			data['Account.Shipping_Address_State']
		) {
			temp.push(
				`${data['Account.Shipping_Address_City']}, ${data['Account.Shipping_Address_State']} ${data['Account.Shipping_Address_Zip_Code']}`
			);
		} else if (data['Account.Shipping_Address_City']) {
			temp.push(
				`${data['Account.Shipping_Address_City']} ${data['Account.Shipping_Address_Zip_Code']}`
			);
		} else if (data['Account.Shipping_Address_State']) {
			temp.push(
				`${data['Account.Shipping_Address_State']} ${data['Account.Shipping_Address_Zip_Code']}`
			);
		} else {
			temp.push(data['Account.Shipping_Address_Zip_Code']);
		}

		formattedObject.Address = temp.join('\n');
	}

	return formattedObject;
};

const PrintRecord = ({
	reportName,
	outputFileName,
	data,
	rows,
	defaultShowLineItemDetails,
	uuid,
	maxHeight,
}) => {
	const downloadRef = useRef(null);
	const appMaxWidth = useRecoilValue(appMaxWidthState);
	const currentUser = useRecoilValue(currentUserState);
	const [formData, setFormData] = useState({
		...dataFormatter(data),
		Todays_Date: dayjs().format('l'),
		Author: currentUser.Full_Name,
	}); //Probably will need a formatter here to flatten objects
	const [base64Data, setBase64Data] = useState(null);
	const [showLineItemDetails, setShowLineItemDetails] = useState(
		Boolean(defaultShowLineItemDetails)
	);
	const [busy, setBusy] = useState(false);
	const printFieldsAtom = useRecoilValue(printFieldsState);
	const printFields = printFieldsAtom[reportName]
		? printFieldsAtom[reportName]
		: [];
	const topLeftAndRightSections =
		printFields.filter((field) => field.section === 'topLeft').length > 0 &&
		printFields.filter((field) => field.section === 'topRight').length > 0;
	const topSectionOnly =
		!topLeftAndRightSections &&
		printFields.filter((field) => field.section === 'top').length > 0;
	const topLeftSectionOnly =
		printFields.filter((field) => field.section === 'topLeft').length > 0 &&
		printFields.filter((field) => field.section === 'topRight').length === 0;
	const topRightSectionOnly =
		printFields.filter((field) => field.section === 'topLeft').length === 0 &&
		printFields.filter((field) => field.section > 'topRight').length === 0;

	const lineItemDetailSelect =
		printFields.filter((field) => field.section === 'lineItemDetailSelect')
			.length > 0;

	const bottomLeftAndRightSections =
		printFields.filter((field) => field.section === 'bottomLeft').length > 0 &&
		printFields.filter((field) => field.section === 'bottomRight').length > 0;
	const bottomSectionOnly =
		!bottomLeftAndRightSections &&
		printFields.filter((field) => field.section === 'bottom').length > 0;
	const bottomLeftSectionOnly =
		printFields.filter((field) => field.section === 'bottomLeft').length > 0 &&
		printFields.filter((field) => field.section === 'bottomRight').length === 0;
	const bottomRightSectionOnly =
		printFields.filter((field) => field.section === 'bottomLeft').length ===
			0 &&
		printFields.filter((field) => field.section > 'bottomRight').length === 0;

	useEffect(() => {
		console.log('Print Wizard data changed:', formData);
	}, [formData]);

	useEffect(() => {
		setFormData((old) => ({
			...old,
			Include_Product_Info: showLineItemDetails,
		}));
	}, [showLineItemDetails]);

	const onChange = (value, key) => {
		setFormData((old) => (old[key] !== value ? { ...old, [key]: value } : old));
	};

	useEffect(() => {
		if (base64Data) {
			downloadRef.current.click();
		}
	}, [base64Data]);

	return (
		<Box
			sx={{
				display: 'flex',
				flexDirection: 'column',
				backgroundColor: (theme) =>
					theme.palette.mode === 'light' ? 'background.default' : '',
			}}>
			<Box sx={{ maxHeight: maxHeight, overflowY: 'auto' }}>
				<Stack spacing={2}>
					{topLeftAndRightSections ||
					topLeftSectionOnly ||
					topRightSectionOnly ? (
						<Grid container>
							<Grid item xs={12} sm={6}>
								{/* Top Left */}
								<Paper sx={{ p: 2, m: 1 }}>
									<Stack spacing={2}>
										{printFields
											.filter((field) => field.section === 'topLeft')
											.map((field) =>
												field.richText ? (
													<RichTextField
														key={field.label}
														label={field.label}
														helperText={field.helperText || ''}
														defaultValue={
															formData[
																field.label
																	.replaceAll(' ', '_')
																	.replaceAll('&_', '')
																	.replaceAll('Date', 'Date_field')
															]
														}
														onChange={(e) =>
															onChange(
																e,
																field.label
																	.replaceAll(' ', '_')
																	.replaceAll('&_', '')
																	.replaceAll('Date', 'Date_field')
															)
														}
													/>
												) : (
													<TextField
														key={field.label}
														label={field.label}
														helperText={field.helperText || ''}
														multiline={field.multiline}
														value={
															formData[
																field.label
																	.replaceAll(' ', '_')
																	.replaceAll('&_', '')
																	.replaceAll('Date', 'Date_field')
															]
														}
														onChange={(e) =>
															onChange(
																e.target.value,
																field.label
																	.replaceAll(' ', '_')
																	.replaceAll('&_', '')
																	.replaceAll('Date', 'Date_field')
															)
														}
													/>
												)
											)}
									</Stack>
								</Paper>
							</Grid>
							<Grid item xs={12} sm={6}>
								{/* Top Right */}
								<Paper sx={{ p: 2, m: 1 }}>
									<Stack spacing={2}>
										{printFields
											.filter((field) => field.section === 'topRight')
											.map((field) =>
												field.richText ? (
													<RichTextField
														key={field.label}
														label={field.label}
														helperText={field.helperText || ''}
														defaultValue={
															formData[
																field.label
																	.replaceAll(' ', '_')
																	.replaceAll('&_', '')
																	.replaceAll('Date', 'Date_field')
															]
														}
														onChange={(e) =>
															onChange(
																e,
																field.label
																	.replaceAll(' ', '_')
																	.replaceAll('&_', '')
																	.replaceAll('Date', 'Date_field')
															)
														}
													/>
												) : (
													<TextField
														key={field.label}
														label={field.label}
														helperText={field.helperText || ''}
														multiline={field.multiline}
														value={
															formData[
																field.label
																	.replaceAll(' ', '_')
																	.replaceAll('&_', '')
																	.replaceAll('Date', 'Date_field')
															]
														}
														onChange={(e) =>
															onChange(
																e.target.value,
																field.label
																	.replaceAll(' ', '_')
																	.replaceAll('&_', '')
																	.replaceAll('Date', 'Date_field')
															)
														}
													/>
												)
											)}
									</Stack>
								</Paper>
							</Grid>
						</Grid>
					) : topSectionOnly ? (
						<Grid container>
							<Grid item xs={12}>
								<Paper sx={{ p: 2, m: 1 }}>
									<Stack spacing={2}>
										{printFields
											.filter((field) => field.section === 'top')
											.map((field) =>
												field.richText ? (
													<RichTextField
														key={field.label}
														label={field.label}
														helperText={field.helperText || ''}
														defaultValue={
															formData[
																field.label
																	.replaceAll(' ', '_')
																	.replaceAll('&_', '')
																	.replaceAll('Date', 'Date_field')
															]
														}
														onChange={(e) =>
															onChange(
																e,
																field.label
																	.replaceAll(' ', '_')
																	.replaceAll('&_', '')
																	.replaceAll('Date', 'Date_field')
															)
														}
													/>
												) : (
													<TextField
														key={field.label}
														label={field.label}
														helperText={field.helperText || ''}
														multiline={field.multiline}
														value={
															formData[
																field.label
																	.replaceAll(' ', '_')
																	.replaceAll('&_', '')
																	.replaceAll('Date', 'Date_field')
															]
														}
														onChange={(e) =>
															onChange(
																e.target.value,
																field.label
																	.replaceAll(' ', '_')
																	.replaceAll('&_', '')
																	.replaceAll('Date', 'Date_field')
															)
														}
													/>
												)
											)}
									</Stack>
								</Paper>
							</Grid>
						</Grid>
					) : null}

					{/* Line Item Detail Checkbox */}
					{lineItemDetailSelect ? (
						<Grid container>
							<Grid item xs={12}>
								<Paper sx={{ p: 2, m: 1 }}>
									<Stack spacing={2}>
										{printFields
											.filter(
												(field) => field.section === 'lineItemDetailSelect'
											)
											.map((field) => (
												<Box key={field.label}>
													<FormControlLabel
														control={
															<Checkbox
																checked={showLineItemDetails}
																onChange={(e) =>
																	setShowLineItemDetails((old) =>
																		old !== e.target.checked
																			? e.target.checked
																			: old
																	)
																}
															/>
														}
														label={field.label}
													/>
													<FormHelperText>{field.helperText}</FormHelperText>
												</Box>
											))}
									</Stack>
								</Paper>
							</Grid>
						</Grid>
					) : null}

					{/* Bottom Section */}
					{bottomLeftAndRightSections ||
					bottomLeftSectionOnly ||
					bottomRightSectionOnly ? (
						<Grid container>
							<Grid item xs={12} sm={6}>
								{/* Bottom Left */}
								<Paper sx={{ p: 2, m: 1 }}>
									<Stack spacing={2}>
										{printFields
											.filter((field) => field.section === 'bottomLeft')
											.map((field) =>
												field.richText ? (
													<RichTextField
														key={field.label}
														label={field.label}
														helperText={field.helperText || ''}
														defaultValue={
															formData[
																field.label
																	.replaceAll(' ', '_')
																	.replaceAll('&_', '')
																	.replaceAll('Date', 'Date_field')
															]
														}
														onChange={(e) =>
															onChange(
																e,
																field.label
																	.replaceAll(' ', '_')
																	.replaceAll('&_', '')
																	.replaceAll('Date', 'Date_field')
															)
														}
													/>
												) : (
													<TextField
														key={field.label}
														label={field.label}
														helperText={field.helperText || ''}
														multiline={field.multiline}
														value={
															formData[
																field.label
																	.replaceAll(' ', '_')
																	.replaceAll('&_', '')
																	.replaceAll('Date', 'Date_field')
															]
														}
														onChange={(e) =>
															onChange(
																e.target.value,
																field.label
																	.replaceAll(' ', '_')
																	.replaceAll('&_', '')
																	.replaceAll('Date', 'Date_field')
															)
														}
													/>
												)
											)}
									</Stack>
								</Paper>
							</Grid>

							<Grid item xs={12} sm={6}>
								{/* Bottom Right */}
								<Paper sx={{ p: 2, m: 1 }}>
									<Stack spacing={2}>
										{printFields
											.filter((field) => field.section === 'bottomRight')
											.map((field) =>
												field.richText ? (
													<RichTextField
														key={field.label}
														label={field.label}
														helperText={field.helperText || ''}
														defaultValue={
															formData[
																field.label
																	.replaceAll(' ', '_')
																	.replaceAll('&_', '')
																	.replaceAll('Date', 'Date_field')
															]
														}
														onChange={(e) =>
															onChange(
																e,
																field.label
																	.replaceAll(' ', '_')
																	.replaceAll('&_', '')
																	.replaceAll('Date', 'Date_field')
															)
														}
													/>
												) : (
													<TextField
														key={field.label}
														label={field.label}
														helperText={field.helperText || ''}
														multiline={field.multiline}
														value={
															formData[
																field.label
																	.replaceAll(' ', '_')
																	.replaceAll('&_', '')
																	.replaceAll('Date', 'Date_field')
															]
														}
														onChange={(e) =>
															onChange(
																e.target.value,
																field.label
																	.replaceAll(' ', '_')
																	.replaceAll('&_', '')
																	.replaceAll('Date', 'Date_field')
															)
														}
													/>
												)
											)}
									</Stack>
								</Paper>
							</Grid>
						</Grid>
					) : bottomSectionOnly ? (
						<Grid container>
							<Grid item xs={12} sm={6}>
								{/* Bottom Right */}
								<Paper sx={{ p: 2, m: 1 }}>
									<Stack spacing={2}>
										{printFields
											.filter((field) => field.section === 'bottom')
											.map((field) =>
												field.richText ? (
													<RichTextField
														key={field.label}
														label={field.label}
														helperText={field.helperText || ''}
														defaultValue={
															formData[
																field.label
																	.replaceAll(' ', '_')
																	.replaceAll('&_', '')
																	.replaceAll('Date', 'Date_field')
															]
														}
														onChange={(e) =>
															onChange(
																e,
																field.label
																	.replaceAll(' ', '_')
																	.replaceAll('&_', '')
																	.replaceAll('Date', 'Date_field')
															)
														}
													/>
												) : (
													<TextField
														key={field.label}
														label={field.label}
														helperText={field.helperText || ''}
														multiline={field.multiline}
														value={
															formData[
																field.label
																	.replaceAll(' ', '_')
																	.replaceAll('&_', '')
																	.replaceAll('Date', 'Date_field')
															]
														}
														onChange={(e) =>
															onChange(
																e.target.value,
																field.label
																	.replaceAll(' ', '_')
																	.replaceAll('&_', '')
																	.replaceAll('Date', 'Date_field')
															)
														}
													/>
												)
											)}
									</Stack>
								</Paper>
							</Grid>
						</Grid>
					) : null}
				</Stack>
			</Box>

			<AppBar color='inherit' position='relative'>
				<Container
					maxWidth='xl'
					disableGutters
					sx={{ maxWidth: { xs: appMaxWidth } }}>
					<Toolbar
						sx={{
							minHeight: { xs: 51 },
							display: 'flex',
							justifyContent: 'flex-end',
						}}>
						<DocmosisButton
							type='word'
							templatePath={`${reportName}/${reportName}.docx`}
							outputFileName={`${outputFileName}.doc`}
							data={formData}
						/>
						<DocmosisButton
							type='pdf'
							templatePath={`${reportName}/${reportName}.docx`}
							outputFileName={`${outputFileName}.pdf`}
							data={formData}
						/>
					</Toolbar>
				</Container>
			</AppBar>
		</Box>
	);
};

PrintRecord.propTypes = {
	reportName: PropTypes.string.isRequired,
	data: PropTypes.object.isRequired,
	defaultShowLineItemDetails: PropTypes.bool,
	uuid: PropTypes.string,
	maxHeight: PropTypes.number,
};

export default PrintRecord;
