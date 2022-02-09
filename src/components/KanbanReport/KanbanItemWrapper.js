import React, { useCallback, useEffect } from 'react';
import { useWhyDidYouUpdate } from 'use-why-did-you-update';
import KanbanItem from './KanbanItem';

const KanbanItemWrapper = ({
	category,
	menuItemOptions,
	onItemDoubleClick,
}) => {
	const onClickItemEdit = useCallback(
		(id) => {
			onClickEdit ? onClickEdit(id) : () => {};
		},
		[onClickItemEdit]
	);

	const onClickItemEmail = useCallback(
		(id) => {
			onClickEmail ? onClickEmail(id) : () => {};
		},
		[onClickItemEmail]
	);

	return (
		<>
			{category && Array.isArray(category) && category.length > 0
				? category.map((item, index) => (
						<KanbanItem
							key={item.ID}
							id={item.ID}
							index={index}
							users={
								Array.isArray(item.Employees)
									? item.Employees.map((employee) =>
											employee.display_value.trim()
									  )
									: null
							}
							tags={
								Array.isArray(item.Tags)
									? item.Tags.map((tag) => ({
											label: tag.display_value.trim(),
											color: tag.color ? tag.color : null,
									  }))
									: null
							}
							title={item.Title}
							subheader={item.Subtitle}
							description={item.Description}
							dueDate={item.Due_Date}
							menuItemOptions={menuItemOptions}
							onItemDoubleClick={onItemDoubleClick}
						/>
				  ))
				: null}
		</>
	);
};

export default KanbanItemWrapper;
