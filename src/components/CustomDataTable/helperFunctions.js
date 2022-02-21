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
				'n days old or more',
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
		case 'n days old or more':
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

export const getCriteria = (
	columnDef,
	type,
	operator,
	field,
	value1,
	value2
) => {
	if (!operator || !field) {
		return '';
	}

	if (columnDef) {
		console.log('getCriteria() columnDef', columnDef);
	}

	const searchField = columnDef?.searchField ? columnDef.searchField : field;
	const searchFieldIsArray = Array.isArray(searchField);

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
			? searchFieldIsArray
				? `(${searchField.map((x) => `${x} == null`).join(' || ')})`
				: `${searchField} == null`
			: type === 'date' || type === 'time' || type === 'dateTime'
			? searchFieldIsArray
				? `(${searchField
						.map((x) => `(${x} == null || ${x} == '')`)
						.join(' || ')})`
				: `(${searchField} == null || ${searchField} == '')`
			: searchFieldIsArray
			? `(${searchField
					.map((x) => `(${x} == null || ${x} == "")`)
					.join(' || ')})`
			: `(${searchField} == null || ${searchField} == "")`;

	const notEmptyCriteria =
		type === 'number'
			? searchFieldIsArray
				? `(${searchField.map((x) => `${x} != null`).join(' && ')})`
				: `${searchField} != null`
			: type === 'date' || type === 'time' || type === 'dateTime'
			? searchFieldIsArray
				? `(${searchField
						.map((x) => `(${x} != null && ${x} != '')`)
						.join(' && ')})`
				: `(${searchField} != null && ${searchField} != '')`
			: searchFieldIsArray
			? `(${searchField
					.map((x) => `(${x} != null && ${x} != "")`)
					.join(' && ')})`
			: `(${searchField} != null && ${searchField} != "")`;

	const dayJsFormat = type === 'date' ? 'l' : type === 'time' ? 'LT' : 'l LT';

	switch (operator) {
		case 'is me':
			return `${searchField} == ${value1}`;
		case 'is empty':
			return emptyCriteria;
		case 'is not empty':
			return notEmptyCriteria;
		case 'equals':
			return searchFieldIsArray
				? `(${searchField.map((x) => `${x} == ${wrappedValue1}`).join(' || ')})`
				: `${searchField} == ${wrappedValue1}`;
		case 'not equal to':
			return searchFieldIsArray
				? `(${searchField.map((x) => `${x} != ${wrappedValue1}`).join(' && ')})`
				: `${searchField} != ${wrappedValue1}`;
		case 'contains':
			return searchFieldIsArray
				? `(${searchField
						.map((x) => `${x}.contains(${wrappedValue1})`)
						.join(' || ')})`
				: `${searchField}.contains(${wrappedValue1})`;
		case 'does not contain':
			return searchFieldIsArray
				? `(${searchField
						.map((x) => `!${x}.contains(${wrappedValue1})`)
						.join(' && ')})`
				: `!${searchField}.contains(${wrappedValue1})`;
		case 'starts with':
			return searchFieldIsArray
				? `(${searchField
						.map((x) => `${x}.startsWith(${wrappedValue1})`)
						.join(' || ')})`
				: `${searchField}.startsWith(${wrappedValue1})`;
		case 'does not start with':
			return searchFieldIsArray
				? `(${searchField
						.map((x) => `!${x}.startsWith(${wrappedValue1})`)
						.join(' && ')})`
				: `!${searchField}.startsWith(${wrappedValue1})`;
		case 'ends with':
			return searchFieldIsArray
				? `(${searchField
						.map((x) => `${x}.endsWith(${wrappedValue1})`)
						.join(' || ')})`
				: `${searchField}.endsWith(${wrappedValue1})`;
		case 'does not end with':
			return searchFieldIsArray
				? `(${searchField
						.map((x) => `!${x}.endsWith(${wrappedValue1})`)
						.join(' && ')})`
				: `!${searchField}.endsWith(${wrappedValue1})`;

		//type === "number"
		case 'less than':
			return searchFieldIsArray
				? `(${searchField.map((x) => `${x} < ${wrappedValue1}`).join(' || ')})`
				: `${searchField} < ${wrappedValue1}`;
		case 'less than or equal to':
			return searchFieldIsArray
				? `(${searchField.map((x) => `${x} <= ${wrappedValue1}`).join(' || ')})`
				: `${searchField} <= ${wrappedValue1}`;
		case 'greater than':
			return searchFieldIsArray
				? `(${searchField.map((x) => `${x} > ${wrappedValue1}`).join(' || ')})`
				: `${searchField} > ${wrappedValue1}`;
		case 'greater than or equal to':
			return searchFieldIsArray
				? `(${searchField.map((x) => `${x} >= ${wrappedValue1}`).join(' || ')})`
				: `${searchField} >= ${wrappedValue1}`;

		//type === "date" || "time" || "dateTime"
		case 'is before':
			return searchFieldIsArray
				? `(${searchField.map((x) => `${x} <= ${wrappedValue1}`).join(' || ')})`
				: `${searchField} <= ${wrappedValue1}`;
		case 'is after':
			return searchFieldIsArray
				? `(${searchField.map((x) => `${x} >= ${wrappedValue1}`).join(' || ')})`
				: `${searchField} >= ${wrappedValue1}`;
		case 'is between':
			return searchFieldIsArray
				? `(${searchField
						.map(
							(x) =>
								`(${x} >= '${wrappedValue1}' && ${x} <= '${wrappedValue2}')`
						)
						.join(' || ')})`
				: `(${searchField} >= '${wrappedValue1}' && ${searchField} <= '${wrappedValue2}')`;
		case 'is not between':
			return searchFieldIsArray
				? `(${searchField
						.map(
							(x) => `(${x} < '${wrappedValue1}' && ${x} > '${wrappedValue2}')`
						)
						.join(' && ')})`
				: `(${searchField} < '${wrappedValue1}' && ${searchField} > '${wrappedValue2}')`;
		case 'today':
			return `${searchField} = '${dayjs().format(dayJsFormat)}'`;
		case 'tomorrow':
			return `${searchField} = '${dayjs().add(1, 'day').format(dayJsFormat)}'`;
		case 'starting tomorrow':
			return `${searchField} >= '${dayjs().add(1, 'day').format(dayJsFormat)}'`;
		case 'yesterday':
			return `${searchField} = '${dayjs()
				.subtract(1, 'day')
				.format(dayJsFormat)}'`;
		case 'until yesterday':
			return `${searchField} <= '${dayjs().add(1, 'day').format(dayJsFormat)}'`;
		case 'last month':
			return `(${searchField} >= '${dayjs()
				.subtract(1, 'month')
				.startOf('month')
				.format(dayJsFormat)}' && ${searchField} <= '${dayjs()
				.subtract(1, 'month')
				.endOf('month')
				.format(dayJsFormat)}')`;
		case 'current month':
			return `(${searchField} >= '${dayjs()
				.startOf('month')
				.format(dayJsFormat)}' && ${searchField} <= '${dayjs()
				.endOf('month')
				.format(dayJsFormat)}')`;
		case 'next month':
			return `(${searchField} >= '${dayjs()
				.add(1, 'month')
				.startOf('month')
				.format(dayJsFormat)}' && ${searchField} <= '${dayjs()
				.add(1, 'month')
				.endOf('month')
				.format(dayJsFormat)}')`;
		case 'last week':
			return `(${searchField} >= '${dayjs()
				.subtract(1, 'week')
				.startOf('week')
				.format(dayJsFormat)}' && ${searchField} <= '${dayjs()
				.subtract(1, 'week')
				.endOf('week')
				.format(dayJsFormat)}')`;
		case 'current week':
			return `(${searchField} >= '${dayjs()
				.startOf('week')
				.format(dayJsFormat)}' && ${searchField} <= '${dayjs()
				.endOf('week')
				.format(dayJsFormat)}')`;
		case 'next week':
			return `(${searchField} >= '${dayjs()
				.add(1, 'week')
				.startOf('week')
				.format(dayJsFormat)}' && ${searchField} <= '${dayjs()
				.add(1, 'week')
				.endOf('week')
				.format(dayJsFormat)}')`;
		case 'age in days':
			return `(${searchField} >= '${dayjs()
				.subtract(value1, 'day')
				.startOf('day')
				.format(dayJsFormat)}' && ${searchField} <= '${dayjs().format(
				dayJsFormat
			)}')`;
		case 'n days old or more':
			return `(${searchField} <= '${dayjs()
				.subtract(value1, 'day')
				.startOf('day')
				.format(dayJsFormat)}')`;
		case 'due in days':
			return `(${searchField} >= '${dayjs().format(
				dayJsFormat
			)}' && ${searchField} <= '${dayjs()
				.add(value1, 'day')
				.endOf('day')
				.format(dayJsFormat)}')`;
		default:
			throw new Error(
				`Error in /CustomDataGrid/helperfunctions.js => getCriteria: operator ${operator} not matched!`
			);
	}
};
