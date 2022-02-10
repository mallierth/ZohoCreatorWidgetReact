import React from 'react';
import PropTypes from 'prop-types';
import {
	AccountTree,
	AddTask,
	AdminPanelSettings,
	Assignment,
	Attachment,
	AttachMoney,
	AutoFixHigh,
	Biotech,
	Build,
	Business,
	ChangeCircle,
	CommentBank,
	ConfirmationNumber,
	Dashboard,
	Description,
	Devices,
	Email,
	FormatListNumbered,
	GppMaybe,
	Handyman,
	Inventory,
	LocalOffer,
	LocalShipping,
	LocationCity,
	MeetingRoom,
	MonetizationOn,
	MoreTime,
	PendingActions,
	Person,
	PersonOutline,
	PrecisionManufacturing,
	Print,
	RequestQuote,
	Schedule,
	Search,
	ShoppingCart,
	Storage,
	Store,
	Tag,
	TextSnippet,
	Timer,
	VerifiedUser,
	Warehouse,
	Warning,
} from '@mui/icons-material';

const DatabaseDefaultIcon = ({ form, sx, ...others }) => {
	if (!form) return <Warning sx={sx} {...others} />;

	switch (form) {
		case 'Account':
			return <LocationCity sx={sx} {...others} />;
		case 'Admin':
			return <AdminPanelSettings sx={sx} {...others} />;
		case 'Attachment':
			return <Attachment sx={sx} {...others} />;
		case 'Billing_Entity':
		case 'Reference':
			return <LocationCity sx={sx} {...others} />;
		case 'Contact':
			return <Person sx={sx} {...others} />;
		case 'Customer_Asset':
			return <Devices sx={sx} {...others} />;
		case 'Customer_Room':
			return <MeetingRoom sx={sx} {...others} />;
		case 'Dashboard':
			return <Dashboard sx={sx} {...others} />;
		case 'Demo':
			return <Biotech sx={sx} {...others} />;
		case 'Email':
			return <Email sx={sx} {...others} />;
		case 'Estimate':
			return <RequestQuote sx={sx} {...others} />;
		case 'Expense':
			return <AttachMoney sx={sx} {...others} />;
		case 'Inventory_Adjustment':
			return <ChangeCircle sx={sx} {...others} />;
		case 'Lead':
			return <GppMaybe sx={sx} {...others} />;
		case 'Manufacturer':
			return <PrecisionManufacturing sx={sx} {...others} />;
		case 'Note':
			return <TextSnippet sx={sx} {...others} />;
		case 'Opportunity':
			return <Description sx={sx} {...others} />;
		case 'Pick_Ticket':
			return <ConfirmationNumber sx={sx} {...others} />;
		case 'Price_Book_Item':
			return <LocalOffer sx={sx} {...others} />;
		case 'Priority':
			return <PendingActions sx={sx} {...others} />;
		case 'Print':
		case 'Print_Wizard':
			return <Print sx={sx} {...others} />;
		case 'Product_Fill_Wizard':
		case 'Product_Filling':
			return <Storage sx={sx} {...others} />;
		case 'Purchasing_Wizard':
		case 'Purchasing':
			return <ShoppingCart sx={sx} {...others} />;
		case 'Project':
			return <AccountTree sx={sx} {...others} />;
		case 'Project_Audit':
			return <VerifiedUser sx={sx} {...others} />;
		case 'Purchase_Order':
		case 'Purchase_Order_Line_Item':
			return <Store sx={sx} {...others} />;
		case 'Purchase_Receive':
			return <LocalShipping sx={sx} {...others} />;
		case 'Quote':
		case 'Quote_Line_Item':
			return <CommentBank sx={sx} {...others} />;
		case 'RMA':
			return <Build sx={sx} {...others} />;
		case 'Sales_Order':
		case 'Sales_Order_Line_Item':
			return <Inventory sx={sx} {...others} />;
		case 'Search':
			return <Search sx={sx} {...others} />;
		case 'Serial_Number':
			return <FormatListNumbered sx={sx} {...others} />;
		case 'Service_Contract':
			return <Assignment sx={sx} {...others} />;
		case 'Service_Order':
			return <Handyman sx={sx} {...others} />;
		case 'Subcontractor':
			return <PersonOutline sx={sx} {...others} />;
		case 'Subscription':
			return <Timer sx={sx} {...others} />;
		case 'Tag':
			return <Tag sx={sx} {...others} />;
		case 'Task':
			return <AddTask sx={sx} {...others} />;
		case 'Time_Entry':
			return <MoreTime sx={sx} {...others} />;
		case 'Warehouse':
			return <Warehouse sx={sx} {...others} />;
		case 'Wizard':
			return <AutoFixHigh sx={sx} {...others} />;
		case 'Vendor':
			return <Business sx={sx} {...others} />;
		default:
			return <Warning sx={sx} {...others} />;
	}
};

DatabaseDefaultIcon.propTypes = {
	form: PropTypes.oneOfType([PropTypes.string, PropTypes.bool]),
	sx: PropTypes.object,
};

DatabaseDefaultIcon.defaultProps = {};

export default DatabaseDefaultIcon;
