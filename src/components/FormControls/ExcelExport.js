import React from 'react';
import PropTypes from 'prop-types';
import { Box } from '@mui/material';
import { saveAs } from 'file-saver';
import { json_to_sheet, write } from 'xlsx';

const ExcelExport = ({ jsonData, fileName, children }) => {
	const fileType =
		'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8';
	const fileExtension = '.xlsx';

	const exportToXlsx = (jsonData, fileName) => {
		const ws = json_to_sheet(jsonData);
		const wb = { Sheets: { data: ws }, SheetNames: ['data'] };
		const excelBuffer = write(wb, { bookType: 'xlsx', type: 'array' });
		const data = new Blob([excelBuffer], { type: fileType });
		saveAs(data, fileName + fileExtension);
	};

	return (
		<Box component='span' onClick={() => exportToXlsx(jsonData, fileName)}>
			{children}
		</Box>
	);
};

ExcelExport.propTypes = {
	jsonData: PropTypes.array,
	fileName: PropTypes.string,
	children: PropTypes.object,
};

export default ExcelExport;
