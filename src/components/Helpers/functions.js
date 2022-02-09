import React from 'react';

export const currency = (data) =>
	intTryParse(data)
		? new Intl.NumberFormat('en-US', {
				style: 'currency',
				currency: 'USD',
		  }).format(data)
		: new Intl.NumberFormat('en-US', {
				style: 'currency',
				currency: 'USD',
		  }).format(0);
export const percent = (data) =>
	intTryParse(data) ? parseFloat(data).toFixed(2) + '%' : '';
export const percentDifference = (data1, data2) =>
	(Math.abs(data1 - data2) / ((data1 + data2) / 2)) * 100;
export const sum = (data, dataKey) => {
	if (Array.isArray(data)) {
		return data.reduce(
			(sum, d) => sum + parseFloat(parseFloat(d[dataKey] || 0).toFixed(2)),
			0
		);
	}

	return 0;
};
export const average = (data, dataKey) => sum(data, dataKey) / data.length;
export const margin = (data) =>
	(sum(data, 'Sell_Price_Total') - sum(data, 'Cost_Total')) /
	sum(data, 'Sell_Price_Total');
export const sellDiscount = (data) =>
	percentDifference(
		sum(data, 'Sell_Price_Subtotal'),
		sum(data, 'Sell_Price_Total')
	);

export const stockCalculation = (
	Quantity_Sold = 0,
	Quantity_Purchased = 0,
	Quantity_Filled = 0
) => {
	let Quantity_Stock = 0;
	let salesOrderAlert = false;
	let productFillAlert = false;
	let glAdjustmentAlert = false;
	let Info = '';
	let Suggestion = '';
	if (Quantity_Sold === Quantity_Purchased) {
		if (Quantity_Filled === Quantity_Sold) {
			//* Sold, purchased, and filled are all equal - no stock used
			Quantity_Stock = 0;
		} else if (Quantity_Filled < Quantity_Sold) {
			//! Alert: Item still needs to be filled
			productFillAlert = true;
			Info = `Filled ${Quantity_Filled}/Sold ${Quantity_Sold}`;
			Suggestion = 'Fill rest of products';
		} else if (Quantity_Filled > Quantity_Sold) {
			//! Alert: Potential Sales Order issue
			salesOrderAlert = true;
			Info = `Filled ${Quantity_Filled}/Sold ${Quantity_Sold}`;
			Suggestion = 'Fix Sales Order(s) Line Item Quantity';
		}
	} else if (Quantity_Sold > Quantity_Purchased) {
		if (Quantity_Filled === Quantity_Sold) {
			//* Sold more than we purchased and every sold item was filled
			Quantity_Stock = Quantity_Filled - Quantity_Purchased;
			Suggestion = 'Legitimate Stock or Potential GL Adjustment';
		} else if (Quantity_Filled < Quantity_Sold) {
			//! Alert: Item still needs to be filled
			productFillAlert = true;
			Info = `Filled ${Quantity_Filled}/Sold ${Quantity_Sold}`;
			Suggestion = 'Fill rest of products';
		} else if (Quantity_Filled > Quantity_Sold) {
			//! Alert: Potential Sales Order issue
			salesOrderAlert = true;
			Info = `Filled ${Quantity_Filled}/Sold ${Quantity_Sold}`;
			Suggestion = 'Fix Sales Order(s) Line Item Quantity';
		}
	} else if (Quantity_Purchased > Quantity_Sold) {
		if (Quantity_Filled === Quantity_Sold && Quantity_Filled === 0) {
			//! We purchased product that wasn't on sales orders and wasn't filled
			//! This is potentially a product that had a GL adjustment and was moved to another project
			glAdjustmentAlert = true;
			Info = `Purchased ${Quantity_Purchased}/Sold ${Quantity_Sold}`;
			Suggestion = 'Potential GL Adjustment';
		} else {
			//! Alert: We purchased more than we sold and the sold quantity > 0. Implies there could be a sales order quantity issue
			salesOrderAlert = true;
			Info = `Purchased ${Quantity_Purchased}/Sold ${Quantity_Sold}`;
			Suggestion = 'Fix Sales Order(s) Line Item Quantity';
		}
	}

	return { Quantity_Stock, Info, Suggestion };
};

export const recalculateCompressedDataSalesTotals = (
	parentDataObject,
	childDataArray
) => {
	let state = { ...parentDataObject };

	//Margin
	state.Margin = margin(childDataArray) * 100;
	//Cost
	state.Cost = sum(childDataArray, 'Cost_Total');
	//Cost_Subtotal
	state.Cost_Subtotal = state.Quantity * sum(childDataArray, 'Cost_Total');
	//Cost_Total
	state.Cost_Total = state.Quantity * sum(childDataArray, 'Cost_Total');
	//Sell_Price_Each
	state.Sell_Price_Each = sum(childDataArray, 'Sell_Price_Total');
	//Sell_Price_Subtotal
	state.Sell_Price_Subtotal =
		state.Quantity * sum(childDataArray, 'Sell_Price_Total');
	//Sell_Price_Total
	state.Sell_Price_Total =
		state.Sell_Price_Subtotal * (1 - state.Discount_Rate / 100);
	//Discount_Dollars
	state.Discount_Dollars =
		state.Sell_Price_Each * state.Quantity -
		state.Sell_Price_Each * state.Quantity * (1 - state.Discount_Rate / 100);

	return state;
};

export const recalculateCompressedDataPurchaseTotals = (
	parentDataObject,
	childDataArray
) => {
	let state = { ...parentDataObject };

	//Cost
	state.Cost = sum(childDataArray, 'Cost_Total');
	//Cost_Subtotal
	state.Cost_Subtotal = state.Quantity * sum(childDataArray, 'Cost_Total');
	//Cost_Total
	(state.Cost_Total = state.Cost_Subtotal * (1 - state.Discount_Rate / 100)),
		//Discount_Dollars
		(state.Discount_Dollars =
			state.Cost * state.Quantity -
			state.Cost * state.Quantity * (1 - state.Discount_Rate / 100));

	return state;
};

export const startsWithVowel = (s) => {
	if (typeof s !== 'string') {
		return false;
	}

	var vowelRegex = '^[aieouAIEOU].*';
	return s.match(vowelRegex) ? true : false;
};

export const getReferenceFormType = (data) => {
	const _referenceName = data?.Reference?.Name
		? data?.Reference?.Name
		: data?.Reference?.display_value;

	//Special Exclusions
	if (
		_referenceName === 'Other' ||
		_referenceName === 'PTO' ||
		_referenceName === 'Holiday' ||
		_referenceName === 'Stock'
	) {
		return false;
	}

	//OP => Opportunity
	if (_referenceName?.startsWith('OP')) {
		return 'Opportunity';
	}

	//W || SC => Service_Contract
	if (_referenceName?.startsWith('W') || _referenceName?.startsWith('SC')) {
		return 'Service_Contract';
	}

	//SO => Service_Order
	if (_referenceName?.startsWith('SO')) {
		return 'Service_Order';
	}

	//I || D || P => Project
	if (
		_referenceName?.startsWith('P') ||
		_referenceName?.startsWith('D') ||
		_referenceName?.startsWith('I')
	) {
		return 'Project';
	}

	return false;
};

export const getNameFn = (formName, row) => {
	if (!row) return '';

	switch (formName) {
		case 'Price_Book_Item':
			switch (row.Type) {
				case 'Comment':
					return `Comment: ${row.Description}`;
				case 'Assembly':
					return `${row.Name} Assembly`;
				default:
					let _manufacturer = '';
					if (row.Manufacturer && typeof row.Manufacturer === 'object') {
						_manufacturer = row.Manufacturer.display_value;
					} else if (row.Manufacturer) {
						_manufacturer = row.Manufacturer;
					}
					return `${_manufacturer ? _manufacturer + ' ' : ''}${
						row.Name !== row.Code ? `${row.Name} (${row.Code})` : row.Name
					}`;
			}
		case 'Quote_Line_Item':
		case 'Purchase_Order_Line_Item':
		case 'Purchase_Receive_Line_Item':
		case 'Sales_Order_Line_Item':
		case 'Estimate_Line_Item':
			switch (row.Type) {
				case 'Comment':
					return `Comment: ${row.Description}`;
				case 'Assembly':
					return `${row.Name} Assembly`;
				default:
					return `${row.Manufacturer ? row.Manufacturer + ' ' : ''}${
						row.Name !== row.Code ? `${row.Name} (${row.Code})` : row.Name
					}`;
			}
		case 'Note':
			return `by ${row.Employee_Full_Name} at ${row.Time}`;
		case 'Serial_Number':
			return row.Value;
		case 'Contact':
			return row.First_Name + ' ' + row.Last_Name;
		case 'RMA':
			return row.Number;
		case 'Subscription':
			return `${
				row.Accounts
					? row.Accounts.map((account) => account.display_value).join(', ')
					: ''
			}(Type: ${row.Type})`;
		case 'Task':
		case 'Time_Entry':
			return row.Title;
		default:
			return row.Name;
	}
};

export async function copyTextToClipboard(text) {
	if ('clipboard' in navigator) {
		return await navigator.clipboard.writeText(text);
	} else {
		return document.execCommand('copy', true, text);
	}
}

export function camelize(str) {
	return str
		.replace(/(?:^\w|[A-Z]|\b\w)/g, function (word, index) {
			return index === 0 ? word.toLowerCase() : word.toUpperCase();
		})
		.replace(/\s+/g, '');
}

export const intTryParse = (str) => {
	if (typeof str === 'number') return true;
	if (typeof str !== 'string') return false; // we only process strings!
	return (
		!isNaN(str) && // use type coercion to parse the _entirety_ of the string (`parseFloat` alone does not do this)...
		!isNaN(parseFloat(str))
	); // ...and ensure strings of whitespace fail
};

export const dateTryParse = (s) => {
	try {
		Date.parse(s);
	} catch (e) {
		return false;
	}
	return true;
};

export const jsonTryParse = (s) => {
	try {
		JSON.parse(s);
	} catch (e) {
		return false;
	}
	return true;
};

export const plurifyFormName = (formName) => {
	if (!formName) return '';

	if (formName.endsWith('y')) {
		return formName.substring(0, formName.length - 1) + 'ies';
	}

	return formName + 's';
};

export function childrenCount(children) {
	return React.Children.toArray(children).filter((child) =>
		React.isValidElement(child)
	).length;
}

export const marginOptions = [
	{
		label: '0% (Cost)',
		value: 0,
	},
	{
		label: '10%',
		value: 10,
	},
	{
		label: '15%',
		value: 15,
	},
	{
		label: '20%',
		value: 20,
	},
	{
		label: '25% (Default)',
		value: 25,
	},
	{
		label: '30%',
		value: 30,
	},
	{
		label: '35%',
		value: 35,
	},
	{
		label: '40%',
		value: 40,
	},
	{
		label: '45%',
		value: 45,
	},
	{
		label: '50%',
		value: 50,
	},
];

export const flattenCollabsibleLineItemArray = (data) => {
	let flatArr = [];
	if (Array.isArray(data) && data.length > 0) {
		data
			.filter((row) => row.Type !== 'Comment')
			.forEach((row) => {
				if (
					row.Collapsible_Line_Items &&
					Array.isArray(row.Collapsible_Line_Items)
				) {
					//! These quantity alterations are to account for the parent row have a quantity
					row.Collapsible_Line_Items.forEach((child) =>
						flatArr.push({
							...child,
							Quantity:
								parseInt(child.Quantity || 0) * parseInt(row.Quantity || 0),
							Sell_Price_Subtotal:
								parseFloat(child.Sell_Price_Subtotal || 0) *
								parseInt(row.Quantity || 0),
							Sell_Price_Total:
								parseFloat(child.Sell_Price_Total || 0) *
								parseInt(row.Quantity || 0),
							Cost_Subtotal:
								parseFloat(child.Cost_Subtotal || 0) *
								parseInt(row.Quantity || 0),
							Cost_Total:
								parseFloat(child.Cost_Total || 0) * parseInt(row.Quantity || 0),
							Discount_Dollars:
								parseFloat(child.Discount_Dollars || 0) *
								parseInt(row.Quantity || 0),
						})
					);
				} else {
					flatArr.push(row);
				}
			});
	}

	return flatArr;
};

const zohoExportBaseUrl =
	'https://creatorexport.zoho.com/file/visionpointllc/av-professional-services';
export const zohoDownloadUrlParser = (apiStringResponse) => {
	// /api/v2/visionpointllc/av-professional-services/report/Notes/3860683000013962695/File_Upload_0/download?filepath=1639070902419_ZohoCreatorWidgetReact.zip

	if (
		apiStringResponse &&
		apiStringResponse.split('/') &&
		apiStringResponse.split('/').length > 0
	) {
		const splitArr = apiStringResponse.split('/');
		//[6] => REPORT_LINK_NAME
		//[7] => RECORD_ID
		//[8] => FIELD_LINK_NAME

		return `${zohoExportBaseUrl}/${splitArr[6]}/${splitArr[7]}/${
			splitArr[8]
		}/${splitArr[9].replaceAll('filepath=', 'filepath=/')}`;
	}

	return '';
};

export const zohoFilpathParserFromDownloadUrl = (apiStringResponse) => {
	// /api/v2/visionpointllc/av-professional-services/report/Notes/3860683000013962695/File_Upload_0/download?filepath=1639070902419_ZohoCreatorWidgetReact.zip
	if (
		apiStringResponse &&
		apiStringResponse.split('/') &&
		apiStringResponse.split('/').length > 0
	) {
		const splitArr = apiStringResponse.split('/');
		//[8] => download?filepath=FILEID_FILENAME
		return splitArr[9].replaceAll('download?filepath=', ''); //FILEID_FILENAME
	}

	return '';
};

export const zohoFilenameParserFromDownloadUrl = (apiStringResponse) => {
	// /api/v2/visionpointllc/av-professional-services/report/Notes/3860683000013962695/File_Upload_0/download?filepath=1639070902419_ZohoCreatorWidgetReact.zip
	if (
		apiStringResponse &&
		apiStringResponse.split('/') &&
		apiStringResponse.split('/').length > 0
	) {
		const filePath = zohoFilpathParserFromDownloadUrl(apiStringResponse);
		return filePath.replaceAll(`${filePath.split('_')[0]}_`, ''); //FILENAME
	}

	return '';
};

export const urltoFile = async (url, filename) => {
	var arr = url.split(','),
		mime = arr[0].match(/:(.*?);/)[1],
		bstr = atob(arr[1]),
		n = bstr.length,
		u8arr = new Uint8Array(n);

	while (n--) {
		u8arr[n] = bstr.charCodeAt(n);
	}

	return new File([u8arr], filename, { type: mime });
};
