import { plurifyFormName } from '../components/Helpers/functions';
import { formatFormData } from '../components/Helpers/CustomHooks';
import axios from 'axios';

export const appName = 'av-professional-services';
export const accessTokenUrl = `https://accounts.zoho.com/oauth/v2/auth?response_type=code&client_id=1000.8O1B2E8IXMK9BZRRN0EGDPNQT601PJ&scope=ZohoCreator.form.CREATE,ZohoCreator.report.CREATE,ZohoCreator.report.READ,ZohoCreator.report.UPDATE,ZohoCreator.report.DELETE,ZohoCreator.meta.form.READ,ZohoCreator.meta.application.READ,ZohoCreator.dashboard.READ&redirect_uri=https://creatorapp.zoho.com/visionpointllc/av-professional-services-v2#Testing&access_type=offline`;

export const getCurrentUser = async (account_id, isDashboard) => {
	const databaseSettingsCreateRecord = await ZOHO.CREATOR.API.addRecord({
		appName,
		formName: 'Database_Information',
		data: { data: {} },
	}).catch((err) => {
		if (err.responseText) {
			const errorResponse = JSON.parse(err.responseText);

			if (errorResponse.message) {
				throw Error(errorResponse.message);
			}
		} else {
			throw Error(JSON.stringify(err));
		}
	});

	console.log(
		'databaseSettingsCreateRecord response',
		databaseSettingsCreateRecord
	);

	const databaseSettingsGetRecord = await ZOHO.CREATOR.API.getRecordById({
		appName,
		reportName: 'All_Database_Information',
		id: databaseSettingsCreateRecord.data.ID,
	}).catch((err) => {
		if (err.responseText) {
			const errorResponse = JSON.parse(err.responseText);

			if (errorResponse.message) {
				throw Error(errorResponse.message);
			}
		} else {
			throw Error(JSON.stringify(err));
		}
	});

	console.log('databaseSettingsGetRecord response', databaseSettingsGetRecord);

	const getEmployeeData = await ZOHO.CREATOR.API.getRecordById({
		appName,
		reportName: 'Employees',
		id: databaseSettingsGetRecord.data.Employee.ID,
	}).catch((err) => {
		if (err.responseText) {
			const errorResponse = JSON.parse(err.responseText);

			if (errorResponse.message) {
				throw Error(errorResponse.message);
			}
		} else {
			throw Error(JSON.stringify(err));
		}
	});

	return {
		employee: getEmployeeData.data,
		databaseInformation: databaseSettingsGetRecord.data,
	};

	//Added in RestAPI response for getCurrentUser in Zoho workflow
	// if(databaseSettingsGetRecord.data.Current_User_Data) {
	// 	return {
	// 		employee: JSON.parse(databaseSettingsGetRecord.data.Current_User_Data),
	// 		databaseInformation: databaseSettingsGetRecord.data,
	// 	};
	// } else {
	// 	const getEmployeeData = await ZOHO.CREATOR.API.getRecordById({
	//    appName,
	// 		reportName: 'Employees',
	// 		id: databaseSettingsGetRecord.data.Employee.ID,
	// 	}).catch((err) => console.error('getCurrentUser getEmployeeData err', err));

	// 	return {
	// 		employee: getEmployeeData.data,
	// 		databaseInformation: databaseSettingsGetRecord.data,
	// 	};
	// }
};

export const getDatabaseInformation = async (args) => {
	if (args) {
		const databaseSettingsCreateRecord = await ZOHO.CREATOR.API.addRecord({
			appName,
			formName: 'Database_Information',
			data: { data: args ? args : {} },
		}).catch((err) =>
			console.error('getCurrentUser databaseSettingsCreateRecord err', err)
		);

		const databaseSettingsGetRecord = await ZOHO.CREATOR.API.getRecordById({
			appName,
			reportName: 'All_Database_Information',
			id: databaseSettingsCreateRecord.data.ID,
		}).catch((err) =>
			console.error('getCurrentUser databaseSettingsGetRecord err', err)
		);

		if (databaseSettingsGetRecord.code === 3000) {
			return databaseSettingsGetRecord.data;
		}
	}
};

export const addRecord = async (formName, data, onSuccess) => {
	const formattedData = formatFormData(data);

	const response = await ZOHO.CREATOR.API.addRecord({
		appName,
		formName,
		data: { data: formattedData.data },
	}).catch((err) => {
		console.log('apis/ZohoCreator.js addRecord() err', err);
		return err;
	});

	console.log('apis/ZohoCreator.js addRecord() response', response);

	try {
		if (response && response.code === 3000) {
			//This is mainly for any workflows that will execute on create on the back end - things like record Name/Numbers
			const addData = await ZOHO.CREATOR.API.getRecordById({
				appName,
				reportName: plurifyFormName(formName),
				id: response.data.ID,
			});

			return { ...data, ...addData.data, Added: true };
		} else if (response && response.code === 3001) {
			throw new Error(
				'Error in addRecord: Zoho workflow error! Please contact you system administrator.'
			);
		} else if (response && response.code === 3002) {
			throw new Error(
				'Error in addRecord: Zoho data validation error! Please contact you system administrator.'
			);
		} else if (response && response.code === 404) {
			throw new Error(
				`Zoho Error Response: ${JSON.parse(response.responseText).message}`
			);
		} else {
			throw new Error(
				'Error in addRecord: Unaccounted for error code ' + response.code
			);
		}
	} catch (error) {
		throw new Error('Error in addRecord try/catch: ' + error.message);
	}
};

export const updateRecord = async (reportName, id, data) => {
	if (!reportName) {
		return { error: 'UPDATE_ERROR_NO_REPORTNAME' };
	}

	if (!id) {
		return { error: 'UPDATE_ERROR_NO_ID' };
	}

	if (!data) {
		return { error: 'UPDATE_ERROR_NO_DATA' };
	}

	const response = await ZOHO.CREATOR.API.updateRecord({
		appName,
		reportName,
		id,
		data: { data },
	}).catch((err) => {
		return err;
	});

	if (response && response.code === 3000) {
		//! There could still be a workflow error
		return response.data;
	} else {
		return response;
	}
};

export const getRecordById = async (reportName, id, dataMerge = {}) => {
	if (!reportName) {
		return { error: 'GET_RECORD_BY_ID_ERROR_NO_REPORTNAME' };
	}

	if (!id) {
		return dataMerge;
	}

	const response = await ZOHO.CREATOR.API.getRecordById({
		appName,
		reportName,
		id,
	}).catch((err) => {
		return err;
	});

	if (response && response.code === 3000) {
		//! There could still be a workflow error
		return { ...response.data, ...dataMerge };
	} else {
		return response;
	}
};

const maxRecords = 200; //! Multiple of 200
export const getAllRecords = async (
	reportName,
	criteria,
	page = 1,
	pageSize = 100
) => {
	if (!reportName) {
		return { error: 'GET_ALL_RECORDS_ERROR_NO_REPORTNAME' };
	}

	var maxPage = 1;
	var config;
	var returnArr = [];

	for (var i = 1; i <= maxPage; i++) {
		if (criteria) {
			config = {
				appName,
				reportName: reportName,
				criteria: criteria,
				page: i.toString(),
				pageSize: pageSize,
			};
		} else {
			config = {
				appName,
				reportName: reportName,
				page: i.toString(),
				pageSize: pageSize,
			};
		}

		const response = await ZOHO.CREATOR.API.getAllRecords(config).catch(
			(err) => {
				console.log('ZohoCreator.js getAllRecords err', err);
				if (
					err.responseText &&
					err.responseText.includes('No Data Available')
				) {
				}
				return [];
			}
		);

		if (response && response.code === 3000) {
			console.log('ZohoCreator.js getAllRecords response', response);
			returnArr = [
				...returnArr,
				...response.data.map((data) => ({
					...data,
					Selected: false,
					Expanded: false,
				})),
			];

			if (maxPage < maxRecords / 200 && response.data.length === 200) {
				//There are more pages to pull
				maxPage++;
			} else {
				console.log('ZohoCreator.js getAllRecords returnArr', returnArr);
				return returnArr;
			}
		} else if (response && response.code === 3330) {
			//! Invalid criteria
			return [];
		} else {
			return response;
		}
	}

	return [];
};

export const uploadFile = async (reportName, id, fieldName, file) => {
	if (!reportName) {
		return { error: 'UPLOAD_FILE_ERROR_NO_REPORTNAME' };
	}

	if (!id) {
		return { error: 'UPLOAD_FILE_ERROR_NO_ID' };
	}

	if (!fieldName) {
		return { error: 'UPLOAD_FILE_ERROR_NO_FIELDNAME' };
	}

	if (!file) {
		return { error: 'UPLOAD_FILE_ERROR_NO_FILE' };
	}

	const response = await ZOHO.CREATOR.API.uploadFile({
		appName,
		reportName,
		id,
		fieldName,
		file,
	}).catch((err) => {
		return { error: err };
	});

	if (response && response.code === 3000) {
		//! There could still be a workflow error

		return response.data;
	} else {
		return response;
	}
};

export const deleteRecord = async (reportName, criteria) => {
	const response = await ZOHO.CREATOR.API.deleteRecord({
		appName,
		reportName,
		criteria,
	}).catch((err) => {
		return { error: err };
	});

	if (response && response.code === 3000) {
		//! There could still be a workflow error

		return response.data;
	} else {
		return response;
	}
};

//#region Suspense Testing
export const getDatabaseInformationSuspense = (args) => {
	return wrapPromise(getDatabaseInformation(args));
};

export const getRecordByIdSuspense = (reportName, id, dataMerge) => {
	return wrapPromise(getRecordById(reportName, id, dataMerge));
};

export const getAllRecordsSuspense = (reportName, criteria, page, pageSize) => {
	return wrapPromise(getAllRecords(reportName, criteria, page, pageSize));
};

const wrapPromise = (promise) => {
	let status = 'pending';
	let result;
	let suspender = promise.then(
		(r) => {
			status = 'success';
			result = r;
		},
		(e) => {
			status = 'error';
			result = e;
		}
	);
	return {
		read() {
			if (status === 'pending') {
				throw suspender;
			} else if (status === 'error') {
				throw result;
			} else if (status === 'success') {
				return result;
			}
		},
	};
};

//#endregion

//#region //? Axios Wrappers

const CLIENT_ID = `1000.8O1B2E8IXMK9BZRRN0EGDPNQT601PJ`;
const CLIENT_SECRET = `40f6cc281382c0852ea006b8983094af38977a088c`;

export const generateAccessToken = async (code) => {

	/*
		Navigate to this URL accessTokenUrl
		User interacts from the browser, redirects to server URL
		Using the code URL parameter, generate an access/refresh token tracked via a background service
	*/

	if(!code) {
		throw new Error(
			'Error within apis/ZohoCreator.js! A code was not provided to generateAccessToken()'
		);
	}

	return await axios.post(
		'https://accounts.zoho.com/oauth/v2/token',
		{
			grant_type: 'authorization_code',
			client_id: CLIENT_ID,
			client_secret: CLIENT_SECRET,
			redirect_uri:
				'https://creatorapp.zoho.com/visionpointllc/av-professional-services-v2#Testing',
			code,
		}
	);
};

const zohoWidgetApi = axios.create({
	baseURL:
		'https://creator.zoho.com/api/v2/visionpointllc/av-professional-services/',
	timeout: 1000,
	headers: {
		//Authorization: `Zoho-oauthtoken ${CLIENT_CODE}`,
	},
});

export const axiosGetAllRecords = async ({
	reportName,
	criteria = '',
	page = 1,
	pageSize = 200,
}) => {
	//view/{reportName}}?criteria=Status%3D%3D%22Active%22%20%7C%7C%20Status%3D%3D%22Flagged%20for%20Removal%22&from=1&limit=200

	if (!reportName) {
		throw new Error(
			'Error within apis/ZohoCreator.js! A report name was not provided to the axios wrapper getAllRecords()'
		);
	}

	const response = await zohoWidgetApi.get(`report/${reportName}`, {
		appName,
		criteria: encodeURIComponent(criteria),
		from: page,
		limit: pageSize,
	});

	console.log('ZohoCreator.js axios getAllRecords() response', response);
};

//#endregion
