import dayjs from 'dayjs';

export const operators = (type, includeCurrentUser) => {
	switch (type) {
		case 'number':
			return [
				'equals',
				'not equal to',
				'less than',
				'less than or equal to',
				'greater than',
				'greater than or equal to',
				'is empty',
				'is not empty',
			];
		case 'bool':
		case 'boolean':
			return ['equals'];
		case 'date':
		case 'dateTime':
			return [
				'equals',
				'not equal to',
				'is between',
				'is not between',
				'today',
				'tomorrow',
				'starting tomorrow',
				'yesterday',
				'until yesterday',
				'last month',
				'current month',
				'next month',
				'last week',
				'current week',
				'next week',
				'age in days',
				'due in days',
				'is empty',
				'is not empty',
			];
		case 'time':
			return [
				'equals',
				'not equal to',
				'is before',
				'is after',
				'is between',
				'is not between',
				'is empty',
				'is not empty',
			];
		default:
			//catch all = string
			if (includeCurrentUser) {
				return [
					'is me',
					'contains',
					'does not contain',
					'equals',
					'not equal to',
					'starts with',
					'does not start with',
					'ends with',
					'does not end with',
					'is empty',
					'is not empty',
				];
			}
			return [
				'contains',
				'does not contain',
				'equals',
				'not equal to',
				'starts with',
				'does not start with',
				'ends with',
				'does not end with',
				'is empty',
				'is not empty',
			];
	}
};

export const filterValueFieldRenderType = (type, operator) => {
	switch (operator) {
		case 'age in days':
		case 'due in days':
			return 'number';
		default:
			return type;
	}
};

export const filterValueFieldDisabled = (operator) => {
	switch (operator) {
		case 'is me':
		case 'is empty':
		case 'is not empty':
		case 'today':
		case 'tomorrow':
		case 'starting tomorrow':
		case 'yesterday':
		case 'until yesterday':
		case 'last month':
		case 'current month':
		case 'next month':
		case 'last week':
		case 'current week':
		case 'next week':
			return true;
		default:
			return false;
	}
};

export const getCriteria = (type, operator, field, value1, value2) => {
	if (!operator || !field) {
		return '';
	}

	const wrappedValue1 =
		type === 'number' || type === 'bool' || type === 'boolean'
			? value1
			: type === 'date' || type === 'time' || type === 'dateTime'
			? `'${value1}'`
			: `"${value1}"`;

	const wrappedValue2 =
		type === 'number' || type === 'bool' || type === 'boolean'
			? value2
			: type === 'date' || type === 'time' || type === 'dateTime'
			? `'${value2}'`
			: `"${value2}"`;

	const emptyCriteria =
		type === 'number'
			? `${field} == null`
			: type === 'date' || type === 'time' || type === 'dateTime'
			? `(${field} == null || ${field} == '')`
			: `(${field} == null || ${field} == "")`;

	const notEmptyCriteria =
		type === 'number'
			? `${field} != null`
			: type === 'date' || type === 'time' || type === 'dateTime'
			? `(${field} != null && ${field} != '')`
			: `(${field} != null && ${field} != "")`;

	const dayJsFormat = type === 'date' ? 'l' : type === 'time' ? 'LT' : 'l LT';

	switch (operator) {
		case 'is me':
			return `${field} == ${value1}`;
		case 'is empty':
			return emptyCriteria;
		case 'is not empty':
			return notEmptyCriteria;
		case 'equals':
			return `${field} == ${wrappedValue1}`;
		case 'not equal to':
			return `${field} != ${wrappedValue1}`;
		case 'contains':
			return `${field}.contains(${wrappedValue1})`;
		case 'does not contain':
			return `!${field}.contains(${wrappedValue1})`;
		case 'starts with':
			return `${field}.startsWith(${wrappedValue1})`;
		case 'does not start with':
			return `!${field}.startsWith(${wrappedValue1})`;
		case 'ends with':
			return `${field}.endsWith(${wrappedValue1})`;
		case 'does not end with':
			return `!${field}.endsWith(${wrappedValue1})`;

		//type === "number"
		case 'less than':
			return `${field} < ${wrappedValue1}`;
		case 'less than or equal to':
			return `${field} <= ${wrappedValue1}`;
		case 'greater than':
			return `${field} > ${wrappedValue1}`;
		case 'greater than or equal to':
			return `${field} >= ${wrappedValue1}`;

		//type === "date" || "time" || "dateTime"
		case 'is before':
			return `${field} <= ${wrappedValue1}`;
		case 'is after':
			return `${field} >= ${wrappedValue1}`;
		case 'is between':
			return `(${field} >= '${wrappedValue1}' && ${field} <= '${wrappedValue2}')`;
		case 'is not between':
			return `(${field} < '${wrappedValue1}' && ${field} > '${wrappedValue2}')`;
		case 'today':
			return `${field} = '${dayjs().format(dayJsFormat)}'`;
		case 'tomorrow':
			return `${field} = '${dayjs().add(1, 'day').format(dayJsFormat)}'`;
		case 'starting tomorrow':
			return `${field} >= '${dayjs().add(1, 'day').format(dayJsFormat)}'`;
		case 'yesterday':
			return `${field} = '${dayjs().subtract(1, 'day').format(dayJsFormat)}'`;
		case 'until yesterday':
			return `${field} <= '${dayjs().add(1, 'day').format(dayJsFormat)}'`;
		case 'last month':
			return `(${field} >= '${dayjs()
				.subtract(1, 'month')
				.startOf('month')
				.format(dayJsFormat)}' && ${field} <= '${dayjs()
				.subtract(1, 'month')
				.endOf('month')
				.format(dayJsFormat)}')`;
		case 'current month':
			return `(${field} >= '${dayjs()
				.startOf('month')
				.format(dayJsFormat)}' && ${field} <= '${dayjs()
				.endOf('month')
				.format(dayJsFormat)}')`;
		case 'next month':
			return `(${field} >= '${dayjs()
				.add(1, 'month')
				.startOf('month')
				.format(dayJsFormat)}' && ${field} <= '${dayjs()
				.add(1, 'month')
				.endOf('month')
				.format(dayJsFormat)}')`;
		case 'last week':
			return `(${field} >= '${dayjs()
				.subtract(1, 'week')
				.startOf('week')
				.format(dayJsFormat)}' && ${field} <= '${dayjs()
				.subtract(1, 'week')
				.endOf('week')
				.format(dayJsFormat)}')`;
		case 'current week':
			return `(${field} >= '${dayjs()
				.startOf('week')
				.format(dayJsFormat)}' && ${field} <= '${dayjs()
				.endOf('week')
				.format(dayJsFormat)}')`;
		case 'next week':
			return `(${field} >= '${dayjs()
				.add(1, 'week')
				.startOf('week')
				.format(dayJsFormat)}' && ${field} <= '${dayjs()
				.add(1, 'week')
				.endOf('week')
				.format(dayJsFormat)}')`;
		case 'age in days':
			return `(${field} >= '${dayjs()
				.subtract(value1, 'day')
				.startOf('day')
				.format(dayJsFormat)}' && ${field} <= '${dayjs().format(
				dayJsFormat
			)}')`;
		case 'due in days':
			return `(${field} >= '${dayjs().format(
				dayJsFormat
			)}' && ${field} <= '${dayjs()
				.add(value1, 'day')
				.endOf('day')
				.format(dayJsFormat)}')`;
		default:
			throw new Error(
				`Error in /CustomDataGrid/helperfunctions.js => getCriteria: operator ${operator} not matched!`
			);
	}
};
