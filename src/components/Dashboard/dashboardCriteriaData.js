import { v4 as uuidv4 } from 'uuid';
import { getCriteria } from '../CustomDataTable/helperFunctions';

//? The objects exported from this file are stored in views state in CustomTable.js

//#region //! Projects **color='warning'**

//TODO: Quote[Type == "Change Order INTERNAL" && Status == "Engineering Review Complete" && Total < 100] //Doesn't require Review
//TODO: Quote[Type == "Change Order INTERNAL" && Status == "Engineering Review Complete" && Total >= 100] //Requires Finance Review

//TODO: Sales_Order[Type == "Project Order" && (Status == "Waiting for Parts"]
//TODO: Sales_Order[Type == "Project Order" && (Status == "Partially Received"]
//TODO: Sales_Order[Type == "Project Order" && (Status == "Fully Received"]
//#endregion

//#region //! Service **color='error'**
//TODO: RMA[Added_Time >= zoho.currenttime.subDay(7)]
//#endregion

//#region //! Personal **color='primary'**
//TODO: Task[Status == "Complete"]

//#endregion

//#region //? Expenses
//TODO: Expense[Entered_in_QuickBooks == false]
export const expensesNotEnteredInQuickBooks = {
	ID: uuidv4(),
	Name: 'Not Entered in QuickBooks',
	readOnly: true,
	JSON: [
		{
			condition: '',
			field: 'Entered_in_QuickBooks',
			operator: 'equals',
			value: 'false',
			criteriaString: 'Entered_in_QuickBooks == false',
		},
		{
			condition: 'AND',
			field: 'Approved',
			operator: 'equals',
			value: 'true',
			criteriaString: 'Approved == true',
		},
	],
};

//#endregion

//#region //? Opportunities
//TODO: Opportunities[Status != "Closed Won" && Status != "Closed Lost"]
export const opportunitiesOpen = {
	ID: uuidv4(),
	Name: 'Open Opportunities',
	readOnly: true,
	JSON: [
		{
			condition: '',
			field: 'Status',
			operator: 'not equal to',
			value: 'Closed Won',
			criteriaString: 'Status != "Closed Won"',
		},
		{
			condition: 'AND',
			field: 'Status',
			operator: 'not equal to',
			value: 'Closed Lost',
			criteriaString: 'Status != "Closed Lost"',
		},
	],
};

//#endregion

//#region //? Quotes
//TODO: Quote[Type == "Quote" && (Status == "" || Status == null || Status == "Open for Engineering")]
export const quotesNeedEngineeringReview = {
	ID: uuidv4(),
	Name: 'Need Engineering Review',
	readOnly: true,
	JSON: [
		{
			condition: '',
			field: 'Type',
			operator: 'equals',
			value: 'Quote',
			criteriaString: 'Type == "Quote"',
		},
		{
			condition: 'AND',
			field: 'Status',
			operator: 'is empty',
			value: '',
			criteriaString: '(Status == "" || Status == null)',
			childCriteria: [
				{
					condition: 'OR',
					field: 'Status',
					operator: 'contains',
					value: 'Open for Engineering',
					criteriaString: 'Status.contains("Open for Engineering")',
				},
			],
		},
		{
			condition: 'AND',
			field: 'Void_field',
			operator: 'equals',
			value: 'false',
			criteriaString: 'Void_field = false',
		},
	],
};

//TODO: Quote[Type == "Quote" && (Status == "Engineering Review Complete"]
export const quotesNeedProposalReview = {
	ID: uuidv4(),
	Name: 'Need Proposal Review',
	readOnly: true,
	JSON: [
		{
			condition: '',
			field: 'Type',
			operator: 'equals',
			value: 'Quote',
			criteriaString: 'Type == "Quote"',
		},
		{
			condition: 'AND',
			field: 'Status',
			operator: 'contains',
			value: 'Engineering Review Complete',
			criteriaString: 'Status.contains("Engineering Review Complete")',
		},
		{
			condition: 'AND',
			field: 'Void_field',
			operator: 'equals',
			value: 'false',
			criteriaString: 'Void_field = false',
		},
	],
};

//TODO: Quote[Type == "Quote" && (Status == "Proposal Review Complete"]
export const quotesNeedScopeReview = {
	ID: uuidv4(),
	Name: 'Need Scope Review',
	readOnly: true,
	JSON: [
		{
			condition: '',
			field: 'Type',
			operator: 'equals',
			value: 'Quote',
			criteriaString: 'Type == "Quote"',
		},
		{
			condition: 'AND',
			field: 'Status',
			operator: 'contains',
			value: 'Proposal Review Complete',
			criteriaString: 'Status.contains("Proposal Review Complete")',
		},
		{
			condition: 'AND',
			field: 'Void_field',
			operator: 'equals',
			value: 'false',
			criteriaString: 'Void_field = false',
		},
	],
};

//TODO: Quote[Type == "Quote" && (Status == "Scope Review Complete"]
export const quotesNeedFinancialReview = {
	ID: uuidv4(),
	Name: 'Need Financial Review',
	readOnly: true,
	JSON: [
		{
			condition: '',
			field: 'Type',
			operator: 'equals',
			value: 'Quote',
			criteriaString: 'Type == "Quote"',
		},
		{
			condition: 'AND',
			field: 'Status',
			operator: 'contains',
			value: 'Scope Review Complete',
			criteriaString: 'Status.contains("Scope Review Complete")',
		},
		{
			condition: 'AND',
			field: 'Void_field',
			operator: 'equals',
			value: 'false',
			criteriaString: 'Void_field = false',
		},
	],
};

//TODO: Quote[Type.contains("Change Order") && (Status == "" || Status == null || Status == "Open for Engineering")] //Ready for Engineering
export const quoteChangeOrdersNeedEngineeringReview = {
	ID: uuidv4(),
	Name: 'Change Orders: Need Engineering Review',
	readOnly: true,
	JSON: [
		{
			condition: '',
			field: 'Type',
			operator: 'contains',
			value: 'Change Order',
			criteriaString: 'Type.contains("Change Order")',
		},
		{
			condition: 'AND',
			field: 'Status',
			operator: 'is empty',
			value: '',
			criteriaString: '(Status == "" || Status == null)',
			childCriteria: [
				{
					condition: 'OR',
					field: 'Status',
					operator: 'contains',
					value: 'Open for Engineering',
					criteriaString: 'Status.contains("Open for Engineering")',
				},
			],
		},
		{
			condition: 'AND',
			field: 'Void_field',
			operator: 'equals',
			value: 'false',
			criteriaString: 'Void_field = false',
		},
	],
};

//TODO: Quote[Type.contains("Change Order INTERNAL") && Total >= 100 && Status.contains("Engineering Review Complete")] //Needs Financial Review
export const quoteChangeOrdersNeedFinanceReview = {
	ID: uuidv4(),
	Name: 'Change Orders: Need Finance Review',
	readOnly: true,
	JSON: [
		{
			condition: '',
			field: 'Type',
			operator: 'contains',
			value: 'Change Order INTERNAL',
			criteriaString: 'Type.contains("Change Order INTERNAL")',
		},
		{
			condition: 'AND',
			field: 'Total',
			operator: 'greater than or equal to',
			value: '100',
			criteriaString: 'Total >= 100',
		},
		{
			condition: 'AND',
			field: 'Status',
			operator: 'contains',
			value: 'Engineering Review Complete',
			criteriaString: 'Status.contains("Engineering Review Complete")',
		},
		{
			condition: 'AND',
			field: 'Void_field',
			operator: 'equals',
			value: 'false',
			criteriaString: 'Void_field = false',
		},
	],
};

//TODO: Quote[Type == "Change Order EXTERNAL" && Status.contains("Engineering Review Complete")] //Needs Sales Manager Review
export const quoteChangeOrdersNeedSalesManagerReview = {
	ID: uuidv4(),
	Name: 'Change Orders: Need Sales Manager Review',
	readOnly: true,
	JSON: [
		{
			condition: '',
			field: 'Type',
			operator: 'contains',
			value: 'Change Order EXTERNAL',
			criteriaString: 'Type.contains("Change Order EXTERNAL")',
		},
		{
			condition: 'AND',
			field: 'Status',
			operator: 'contains',
			value: 'Engineering Review Complete',
			criteriaString: 'Status.contains("Engineering Review Complete")',
		},
		{
			condition: 'AND',
			field: 'Void_field',
			operator: 'equals',
			value: 'false',
			criteriaString: 'Void_field = false',
		},
	],
};

//#endregion

//#region //? Projects
//TODO: Project[Category == "Client" && (Status == "Open" || Status == "Pending Closeout")]
export const projectsOpen = {
	ID: uuidv4(),
	Name: 'Open Projects',
	readOnly: true,
	JSON: [
		{
			condition: '',
			field: 'Category',
			operator: 'contains',
			value: 'Client',
			criteriaString: 'Category.contains("Client")',
		},
		{
			condition: 'AND',
			field: 'Status',
			operator: 'equals',
			value: 'Open',
			criteriaString: 'Status=="Open"',
			childCriteria: [
				{
					condition: 'OR',
					field: 'Status',
					operator: 'equals',
					value: 'Pending Closeout',
					criteriaString: 'Status=="Pending Closeout"',
				},
			],
		},
	],
};

//#endregion

//#region //? Purchase Orders
//TODO: Purchase_Order[Status == "Open" || Status == "Approved" || Status == "Issued"]
export const purchaseOrdersOpen = {
	ID: uuidv4(),
	Name: 'Open',
	readOnly: true,
	JSON: [
		{
			condition: '',
			field: 'Status',
			operator: 'equals',
			value: 'Open',
			criteriaString: 'Status == "Open"',
		},
		{
			condition: 'OR',
			field: 'Status',
			operator: 'equals',
			value: 'Approved',
			criteriaString: 'Status == "Approved"',
		},
		{
			condition: 'OR',
			field: 'Status',
			operator: 'equals',
			value: 'Issued',
			criteriaString: 'Status == "Issued"',
		},
	],
};

//TODO: Purchase_Order[Status != "Closed"]
export const purchaseOrdersPartiallyReceived = {
	ID: uuidv4(),
	Name: 'Partially Received',
	readOnly: true,
	JSON: [
		{
			condition: '',
			field: 'Status',
			operator: 'equals',
			value: 'Partially Received',
			criteriaString: 'Status == "Partially Received"',
		},
	],
};

//#endregion

//#region //? Sales Orders
//TODO: Sales_Order[Type == "Project Order" && (Status == "" || Status == null || Status == "Open for Drafting") && Void_field == false]
export const salesOrdersNeedsDraftingReview = {
	ID: uuidv4(),
	Name: 'Open for Drafting',
	readOnly: true,
	JSON: [
		{
			condition: '',
			field: 'Type',
			operator: 'equals',
			value: 'Project Order',
			criteriaString: 'Type=="Project Order"',
		},
		{
			condition: 'AND',
			field: 'Status',
			operator: 'equals',
			value: 'Open for Drafting',
			criteriaString: 'Status=="Open for Drafting"',
		},
		{
			condition: 'AND',
			field: 'Void_field',
			operator: 'equals',
			value: 'false',
			criteriaString: 'Void_field==false',
		},
	],
};

//TODO: Sales_Order[Type == "Project Order" && Status == "Drafting Review Complete" && Void_field == false]
export const salesOrdersNeedsProgrammingReview = {
	ID: uuidv4(),
	Name: 'Needs Programming Review',
	readOnly: true,
	JSON: [
		{
			condition: '',
			field: 'Type',
			operator: 'equals',
			value: 'Project Order',
			criteriaString: 'Type=="Project Order"',
		},
		{
			condition: 'AND',
			field: 'Status',
			operator: 'equals',
			value: 'Drafting Review Complete',
			criteriaString: 'Status == "Drafting Review Complete"',
		},
		{
			condition: 'AND',
			field: 'Void_field',
			operator: 'equals',
			value: 'false',
			criteriaString: 'Void_field==false',
		},
	],
};

//TODO: Sales_Order[Type == "Project Order" && Status == "Programming Review Complete" && Void_field == false]
export const salesOrdersNeedsEngineeringReview = {
	ID: uuidv4(),
	Name: 'Needs Engineering Review',
	readOnly: true,
	JSON: [
		{
			condition: '',
			field: 'Type',
			operator: 'equals',
			value: 'Project Order',
			criteriaString: 'Type=="Project Order"',
		},
		{
			condition: 'AND',
			field: 'Status',
			operator: 'equals',
			value: 'Programming Review Complete',
			criteriaString: 'Status == "Programming Review Complete"',
		},
		{
			condition: 'AND',
			field: 'Void_field',
			operator: 'equals',
			value: 'false',
			criteriaString: 'Void_field==false',
		},
	],
};

//#endregion

//#region //? Service Contracts
//TODO: Service_Contract[Type != "A - 1st Year Job Warranty (VMA)" && Status == "Active"]
export const serviceContractsAnnualActive = {
	ID: uuidv4(),
	Name: 'Active (Annual)',
	readOnly: true,
	JSON: [
		{
			condition: '',
			field: 'Type',
			operator: 'not equal to',
			value: 'A - 1st Year Job Warranty (VMA)',
			criteriaString: 'Type!="A - 1st Year Job Warranty (VMA)"',
		},
		{
			condition: 'AND',
			field: 'Status',
			operator: 'equals',
			value: 'Active',
			criteriaString: 'Status=="Active"',
		},
	],
};

//TODO: Service_Contract[Type == "A - 1st Year Job Warranty (VMA)" && Status == "Active"]
export const serviceContractsWarrantiesActive = {
	ID: uuidv4(),
	Name: 'Active (1st Year Warranty)',
	readOnly: true,
	JSON: [
		{
			condition: '',
			field: 'Type',
			operator: 'equals',
			value: 'A - 1st Year Job Warranty (VMA)',
			criteriaString: 'Type!="A - 1st Year Job Warranty (VMA)"',
		},
		{
			condition: 'AND',
			field: 'Status',
			operator: 'equals',
			value: 'Active',
			criteriaString: 'Status=="Active"',
		},
	],
};

//TODO: Service_Contract[Added_Time >= zoho.currenttime.subDay(30) && Status == "Active"]
export const serviceContractsLast30Days = {
	ID: uuidv4(),
	Name: 'Created in last 30 Days',
	readOnly: true,
	JSON: [
		{
			condition: '',
			field: 'Added_Time',
			operator: 'age in days',
			value: '30',
			criteriaString: getCriteria(
				'dateTime',
				'age in days',
				'Added_Time',
				'30'
			),
		},
		{
			condition: 'AND',
			field: 'Status',
			operator: 'equals',
			value: 'Active',
			criteriaString: 'Status=="Active"',
		},
	],
};

//#endregion

//#region //? Service Orders
//TODO: Service_Order[(Status == "Open" || Status == "" || Status == null) && (Type=="PM Visit" || Type=="Phone Support" ||Type=="Phone to Onsite" ||Type=="Remote to Onsite" ||Type=="Service Call - Onsite")]
export const serviceOrdersOpen = {
	ID: uuidv4(),
	Name: 'Open',
	readOnly: true,
	JSON: [
		{
			condition: '',
			field: 'Status',
			operator: 'equals',
			value: 'Open',
			criteriaString: 'Status=="Open"',
			// childCriteria: [
			// 	{
			// 		condition: 'OR',
			// 		field: 'Status',
			// 		operator: 'is empty',
			// 		value: '',
			// 		criteriaString: '(Status == "" || Status == null)',
			// 	},
			// ],
		},

		{
			condition: 'AND',
			field: 'Type',
			operator: 'equals',
			value: 'PM Visit',
			criteriaString: 'Type=="PM Visit"',
			childCriteria: [
				{
					condition: 'OR',
					field: 'Type',
					operator: 'equals',
					value: 'Phone Support',
					criteriaString: 'Type=="Phone Support"',
				},
				{
					condition: 'OR',
					field: 'Type',
					operator: 'equals',
					value: 'Phone to Onsite',
					criteriaString: 'Type=="Phone to Onsite"',
				},
				{
					condition: 'OR',
					field: 'Type',
					operator: 'equals',
					value: 'Remote to Onsite',
					criteriaString: 'Type=="Remote to Onsite"',
				},
				{
					condition: 'OR',
					field: 'Type',
					operator: 'equals',
					value: 'Service Call - Onsite',
					criteriaString: 'Type=="Service Call - Onsite"',
				},
			],
		},
	],
};

//TODO: Service_Order[Status == "Complete"]
export const serviceOrdersComplete = {
	ID: uuidv4(),
	Name: 'Completed',
	readOnly: true,
	JSON: [
		{
			condition: '',
			field: 'Status',
			operator: 'equals',
			value: 'Complete',
			criteriaString: 'Status=="Complete"',
		},
	],
};

//#endregion

//#region //? Time Entries
//TODO: Time_Entry[Employee == me && Date_field >= zoho.currentdate.toStartOfWeek() && Date_field <= zoho.currentdate.toStartOfWeek().addWeek(1).subDay(1)].sum(Actual_Hours);
export const timeEntriesCurrentWeek = (currentUser) => ({
	ID: uuidv4(),
	Name: 'Hours Worked this Week',
	readOnly: true,
	JSON: [
		{
			condition: '',
			field: 'Date_field',
			operator: 'current week',
			value: '',
			criteriaString: getCriteria('dateTime', 'current week', 'Date_field', ''),
		},
		{
			condition: 'AND',
			field: 'Employee',
			operator: 'is me',
			value: currentUser.ID,
			criteriaString: `Employee==${currentUser?.ID}`,
		},
	],
});

//#endregion
