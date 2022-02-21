import React from 'react';
import PropTypes from 'prop-types';
import {
	getRecordByIdSuspense,
	getDatabaseInformationSuspense,
} from '../../apis/ZohoCreator';

//#region //* Form Imports
import AccountForm2 from '../Forms/AccountForm2';
import AttachmentForm from '../Forms/AttachmentForm';
import ContactForm from '../Forms/ContactForm';
import CustomerAssetForm from '../Forms/CustomerAssetForm';
import CustomerRoomForm from '../Forms/CustomerRoomForm';
import Dashboard from '../Dashboard/Dashboard';
import DemoForm from '../Forms/DemoForm';
import EmailForm from '../Forms/EmailForm';
import EmployeeForm from '../Forms/EmployeeForm';
import EstimateForm from '../Forms/EstimateForm';
import EstimateLineItemForm from '../Forms/EstimateLineItemForm';
import ExpenseForm from '../Forms/ExpenseForm';
import InventoryAdjustmentForm from '../Forms/InventoryAdjustmentForm';
import InventoryAdjustmentLineItemForm from '../Forms/InventoryAdjustmentLineItemForm';
import ManufacturerForm from '../Forms/ManufacturerForm';
import NoteForm from '../Forms/NoteForm';
import OpportunityForm from '../Forms/OpportunityForm';
import PortalUserForm from '../Forms/PortalUserForm';
import PriorityForm from '../Forms/PriorityForm';
import PurchaseOrderForm from '../Forms/PurchaseOrderForm';
import PurchaseOrderLineItemForm from '../Forms/PurchaseOrderLineItemForm';
import PurchaseReceiveForm from '../Forms/PurchaseReceiveForm';
import PurchaseReceiveLineItemForm from '../Forms/PurchaseReceiveLineItemForm';
import QuoteForm2 from '../Forms/QuoteForm2';
import QuoteLineItemForm2 from '../Forms/QuoteLineItemForm2';
import RmaForm from '../Forms/RmaForm';
import PriceBookItemForm from '../Forms/PriceBookItemForm';
import ProjectForm2 from '../Forms/ProjectForm2';
import SalesOrderForm from '../Forms/SalesOrderForm';
import SalesOrderLineItemForm from '../Forms/SalesOrderLineItemForm';
import SerialNumberForm from '../Forms/SerialNumberForm';
import ServiceContractForm from '../Forms/ServiceContractForm';
import ServiceOrderForm from '../Forms/ServiceOrderForm';
import SubcontractorForm from '../Forms/SubcontractorForm';
import SubscriptionForm from '../Forms/SubscriptionForm';
import TagForm from '../Forms/TagForm';
import TaskForm from '../Forms/TaskForm';
import TimeEntryForm from '../Forms/TimeEntryForm';
import VendorForm from '../Forms/VendorForm';
//#endregion

//#region Wizards
import ProductFillWizard from '../Wizards/ProductFillWizard';
import PurchasingWizard from '../Wizards/PurchasingWizard';
import { plurifyFormName } from './functions';

//#endRegion

const RenderForm = ({ id, formName, ...others }) => {
	const reportName = formName === 'Account' ? 'Accounts_Report' : plurifyFormName(formName);

	switch (formName) {
		case 'Account':
			return (
				<AccountForm2
					formName={formName}
					databaseInformationResource={
						id ? getDatabaseInformationSuspense({ Account: id }) : null
					}
					resource={getRecordByIdSuspense(reportName, id)}
					{...others}
				/>
			);
		case 'Attachment':
			return (
				<AttachmentForm
					formName={formName}
					databaseInformationResource={
						id ? getDatabaseInformationSuspense({ Account: id }) : null
					}
					resource={getRecordByIdSuspense(reportName, id)}
					{...others}
				/>
			);
		case 'Contact':
			return (
				<ContactForm
					formName={formName}
					resource={getRecordByIdSuspense(reportName, id)}
					{...others}
				/>
			);
		case 'Customer_Asset':
			return (
				<CustomerAssetForm
					formName={formName}
					resource={getRecordByIdSuspense(reportName, id)}
					{...others}
				/>
			);
		case 'Customer_Room':
			return (
				<CustomerRoomForm
					formName={formName}
					resource={getRecordByIdSuspense(reportName, id)}
					{...others}
				/>
			);
		case 'Dashboard':
			return (
				<Dashboard
					databaseInformationResource={getDatabaseInformationSuspense({
						Is_Dashboard: true,
					})}
					{...others}
				/>
			);
		case 'Demo':
			return (
				<DemoForm
					formName={formName}
					resource={getRecordByIdSuspense(reportName, id)}
					{...others}
				/>
			);
		case 'Email':
			return (
				<EmailForm
					formName={formName}
					resource={getRecordByIdSuspense(reportName, id)}
					{...others}
				/>
			);
		case 'Employee':
			return (
				<EmployeeForm
					formName={formName}
					resource={getRecordByIdSuspense(reportName, id)}
					{...others}
				/>
			);
		case 'Estimate':
			return (
				<EstimateForm
					formName={formName}
					resource={getRecordByIdSuspense(reportName, id)}
					{...others}
				/>
			);
		case 'Estimate_Line_Item':
			return (
				<EstimateLineItemForm
					formName={formName}
					resource={getRecordByIdSuspense(reportName, id)}
					{...others}
				/>
			);
		case 'Expense':
			return (
				<ExpenseForm
					formName={formName}
					resource={getRecordByIdSuspense(reportName, id)}
					{...others}
				/>
			);
		case 'Inventory_Adjustment':
			return (
				<InventoryAdjustmentForm
					formName={formName}
					resource={getRecordByIdSuspense(reportName, id)}
					{...others}
				/>
			);
		case 'Inventory_Adjustment_Line_Item':
			return (
				<InventoryAdjustmentLineItemForm
					formName={formName}
					resource={getRecordByIdSuspense(reportName, id)}
					{...others}
				/>
			);
		case 'Manufacturer':
			return (
				<ManufacturerForm
					formName={formName}
					resource={getRecordByIdSuspense(reportName, id)}
					{...others}
				/>
			);
		case 'Note':
			return (
				<NoteForm
					formName={formName}
					resource={getRecordByIdSuspense(reportName, id)}
					{...others}
				/>
			);
		case 'Opportunity':
			return (
				<OpportunityForm
					formName={formName}
					resource={getRecordByIdSuspense(reportName, id)}
					{...others}
				/>
			);
		case 'Portal_User':
			return (
				<PortalUserForm
					formName={formName}
					resource={getRecordByIdSuspense(reportName, id)}
					{...others}
				/>
			);
		case 'Price_Book_Item':
			return (
				<PriceBookItemForm
					formName={formName}
					resource={getRecordByIdSuspense(reportName, id)}
					{...others}
				/>
			);

		case 'Priority':
			return (
				<PriorityForm
					formName={formName}
					resource={getRecordByIdSuspense(reportName, id)}
					{...others}
				/>
			);
		case 'Project':
			return (
				<ProjectForm2
					formName={formName}
					resource={getRecordByIdSuspense(reportName, id)}
					{...others}
				/>
			);
		case 'Purchase_Order':
			return (
				<PurchaseOrderForm
					formName={formName}
					resource={getRecordByIdSuspense(reportName, id)}
					{...others}
				/>
			);
		case 'Purchase_Order_Line_Item':
			return (
				<PurchaseOrderLineItemForm
					formName={formName}
					resource={getRecordByIdSuspense(reportName, id)}
					{...others}
				/>
			);
		case 'Purchase_Receive':
			return (
				<PurchaseReceiveForm
					formName={formName}
					resource={getRecordByIdSuspense(reportName, id)}
					{...others}
				/>
			);
		case 'Purchase_Receive_Line_Item':
			return (
				<PurchaseReceiveLineItemForm
					formName={formName}
					resource={getRecordByIdSuspense(reportName, id)}
					{...others}
				/>
			);
		case 'Quote':
			return (
				<QuoteForm2
					formName={formName}
					resource={getRecordByIdSuspense(reportName, id)}
					{...others}
				/>
			);
		case 'Quote_Line_Item':
			return (
				<QuoteLineItemForm2
					formName={formName}
					resource={getRecordByIdSuspense(reportName, id)}
					{...others}
				/>
			);
		case 'RMA':
			return (
				<RmaForm
					formName={formName}
					resource={getRecordByIdSuspense(reportName, id)}
					{...others}
				/>
			);
		case 'Sales_Order':
			return (
				<SalesOrderForm
					formName={formName}
					resource={getRecordByIdSuspense(reportName, id)}
					{...others}
				/>
			);
		case 'Sales_Order_Line_Item':
			return (
				<SalesOrderLineItemForm
					formName={formName}
					resource={getRecordByIdSuspense(reportName, id)}
					{...others}
				/>
			);
		case 'Serial_Number':
			return (
				<SerialNumberForm
					formName={formName}
					resource={getRecordByIdSuspense(reportName, id)}
					{...others}
				/>
			);
		case 'Service_Contract':
			return (
				<ServiceContractForm
					formName={formName}
					resource={getRecordByIdSuspense(reportName, id)}
					{...others}
				/>
			);
		case 'Service_Order':
			return (
				<ServiceOrderForm
					formName={formName}
					resource={getRecordByIdSuspense(reportName, id)}
					{...others}
				/>
			);
		case 'Subcontractor':
			return (
				<SubcontractorForm
					formName={formName}
					resource={getRecordByIdSuspense(reportName, id)}
					{...others}
				/>
			);
		case 'Subscription':
			return (
				<SubscriptionForm
					formName={formName}
					resource={getRecordByIdSuspense(reportName, id)}
					{...others}
				/>
			);
		case 'Tag':
			return (
				<TagForm
					formName={formName}
					resource={getRecordByIdSuspense(reportName, id)}
					{...others}
				/>
			);
		case 'Task':
			return (
				<TaskForm
					formName={formName}
					resource={getRecordByIdSuspense(reportName, id)}
					{...others}
				/>
			);
		case 'Time_Entry':
			return (
				<TimeEntryForm
					formName={formName}
					resource={getRecordByIdSuspense(reportName, id)}
					{...others}
				/>
			);
		case 'Vendor':
			return (
				<VendorForm
					formName={formName}
					resource={getRecordByIdSuspense(reportName, id)}
					{...others}
				/>
			);

		case 'Product_Filling':
			return <ProductFillWizard formName={formName} {...others} />;

		case 'Purchasing':
			return <PurchasingWizard formName={formName} {...others} />;

		default:
			if (!formName) {
				throw new Error(`Form name not provided to RenderForm.js`);
			} else {
				throw new Error(
					`Form name "${formName}" was not matched in RenderForm.js`
				);
			}
	}
};

RenderForm.propTypes = {
	id: PropTypes.string,
	formName: PropTypes.string,
	setAppBreadcrumb: PropTypes.func,
	loadData: PropTypes.object,
	massUpdating: PropTypes.bool,
	massUpdateRecordIds: PropTypes.array,
	openInDialog: PropTypes.bool,
	dialogOpen: PropTypes.bool,
	setDialogOpen: PropTypes.func,
	dialogTitle: PropTypes.string,
	dialogSize: PropTypes.string,
	onChange: PropTypes.func,
	successfulSaveData: PropTypes.func,
	parentForm: PropTypes.string,
};

RenderForm.defaultProps = {
	loadData: {},
	massUpdating: false,
	massUpdateRecordIds: [],
};

export default React.memo(RenderForm);
