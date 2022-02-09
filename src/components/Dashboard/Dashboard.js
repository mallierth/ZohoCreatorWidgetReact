import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { useRecoilValue } from 'recoil';
import {
	Box,
	CircularProgress,
	Container,
	Grid,
	Paper,
	Typography,
} from '@mui/material';
import { Update } from '@mui/icons-material';
import DashboardCard from './DashboardCard';
import DatabaseDefaultIcon from '../Helpers/DatabaseDefaultIcon';
import {
	appMaxWidthState,
	currentUserState,
	navBarHeightState,
	tabBarHeightState,
} from '../../recoil/atoms';
import ContextCircularProgressLoader from '../Loaders/ContextCircularProgressLoader';
import RenderPopup from '../Helpers/RenderPopup';
import CustomTable from '../CustomTable/CustomTable';
import DashboardSection from './DashboardSection';
import {
	opportunitiesOpen,
	quotesNeedEngineeringReview,
	quotesNeedProposalReview,
	quotesNeedScopeReview,
	quotesNeedFinancialReview,
	quoteChangeOrdersNeedEngineeringReview,
	quoteChangeOrdersNeedFinanceReview,
	quoteChangeOrdersNeedSalesManagerReview,
	projectsOpen,
	salesOrdersNeedsDraftingReview,
	salesOrdersNeedsProgrammingReview,
	salesOrdersNeedsEngineeringReview,
	serviceOrdersOpen,
	serviceOrdersComplete,
	serviceContractsAnnualActive,
	serviceContractsWarrantiesActive,
	serviceContractsLast30Days,
	purchaseOrdersOpen,
	purchaseOrdersPartiallyReceived,
	expensesNotEnteredInQuickBooks,
	timeEntriesCurrentWeek,
} from './dashboardCriteriaData';
import { plurifyFormName } from '../Helpers/functions';
import CustomDataGridOverlayDialog from '../Modals/CustomDataGridOverlayDialog';
import CustomDataTable from '../CustomDataTable/CustomDataTable';
import { columns as quoteColumns } from '../Reports/QuoteReport';
import { columns as opportunityColumns } from '../Reports/OpportunityReport';
import { columns as projectColumns } from '../Reports/ProjectReport';
import { columns as salesOrderColumns } from '../Reports/SalesOrderReport';
import { columns as serviceOrderColumns } from '../Reports/ServiceOrderReport';
import { columns as serviceContractColumns } from '../Reports/ServiceContractReport';
import { columns as purchaseOrderColumns } from '../Reports/PurchaseOrderReport';
import { columns as expenseColumns } from '../Reports/ExpenseReport';
import { columns as timeEntryColumns } from '../Reports/TimeEntryReport';

const Caption = () => {
	return (
		<Box sx={{ display: 'flex', alignItems: 'center' }}>
			<Update sx={{ mr: 0.5 }} /> Just Updated
		</Box>
	);
};

const ReportTitle = ({ formName, title }) => {
	return (
		<Box sx={{ display: 'flex' }}>
			<DatabaseDefaultIcon form={formName} sx={{ mr: 0.75 }} />
			<Typography component='span'>{title}</Typography>
		</Box>
	);
};
ReportTitle.propTypes = {
	formName: PropTypes.string.isRequired,
	title: PropTypes.string.isRequired,
};

const Dashboard = ({ setAppBreadcrumb, databaseInformationResource }) => {
	const scrollRef = React.useRef(null);
	const navBarHeight = useRecoilValue(navBarHeightState);
	const tabBarHeight = useRecoilValue(tabBarHeightState);
	const appMaxWidth = useRecoilValue(appMaxWidthState);
	const currentUser = useRecoilValue(currentUserState);
	const [open, setOpen] = useState(false);
	const [reportData, setReportData] = useState({
		title: '',
		formName: '',
		defaultSortByColumn: '',
		defaultSortDirection: 'desc',
		getNameFn: null, //() => {}
		overrideDefaultView: null, //{ID:'', Name: '', JSON: []}
		columns: [],
	});
	const [databaseInformation, setDatabaseInformation] = useState(
		databaseInformationResource ? databaseInformationResource.read() : {}
	);

	useEffect(() => {
		if (setAppBreadcrumb) {
			setAppBreadcrumb([
				{
					//href: baseUrl + pageName,
					icon: <DatabaseDefaultIcon form='Dashboard' sx={{ mr: 1 }} />,
					label: 'Dashboard',
				},
			]);
		}
	}, [setAppBreadcrumb]);

	useEffect(() => {
		console.log('Dashboard databaseInformation', databaseInformation);
	}, [databaseInformation]);

	return (
		<Container
			maxWidth='xl'
			disableGutters
			sx={{
				maxWidth: { xs: appMaxWidth },
				pt: 1,
			}}>
			<Box
				ref={scrollRef}
				sx={{
					overflowY: open ? 'hidden' : 'auto',
					maxHeight: `${
						window.innerHeight - navBarHeight - tabBarHeight - 8
					}px`,
					position: 'relative',
					pr: 1,
				}}>
				<DashboardSection title='Sales' color='info.light'>
					<DashboardCard
						Icon={
							<DatabaseDefaultIcon
								form='Opportunity'
								fontSize='large'
								sx={{
									color: (theme) =>
										theme.palette.mode === 'dark' ? '#000' : '#fff',
								}}
							/>
						}
						headerText='Opportunities'
						subHeaderText='Open Opportunities'
						dataText={databaseInformation.Open_Opportunities}
						bgcolor='info.light'
						onClick={() => {
							setReportData({
								title: (
									<ReportTitle
										formName='Opportunity'
										title='Open Opportunities'
									/>
								),
								formName: 'Opportunity',
								defaultSortByColumn: 'Number',
								defaultSortDirection: 'desc',
								getNameFn: (row) => row.Name, //() => {}
								overrideDefaultView: opportunitiesOpen,
								columns: opportunityColumns,
							});
							setOpen(true);
						}}
					/>

					<DashboardCard
						Icon={
							<DatabaseDefaultIcon
								form='Quote'
								fontSize='large'
								sx={{
									color: (theme) =>
										theme.palette.mode === 'dark' ? '#000' : '#fff',
								}}
							/>
						}
						headerText='Quotes'
						subHeaderText='Need Engineering Review'
						dataText={databaseInformation.Quotes_Need_Engineering_Review}
						bgcolor='info.light'
						onClick={() => {
							setReportData({
								title: (
									<ReportTitle
										formName='Quote'
										title='Quotes Needing Engineering Review'
									/>
								),
								formName: 'Quote',
								defaultSortByColumn: 'Number',
								defaultSortDirection: 'desc',
								getNameFn: (row) => row.Name,
								overrideDefaultView: quotesNeedEngineeringReview,
								columns: quoteColumns,
							});
							setOpen(true);
						}}
					/>

					<DashboardCard
						Icon={
							<DatabaseDefaultIcon
								form='Quote'
								fontSize='large'
								sx={{
									color: (theme) =>
										theme.palette.mode === 'dark' ? '#000' : '#fff',
								}}
							/>
						}
						headerText='Quotes'
						subHeaderText='Need Proposal Review'
						dataText={databaseInformation.Quotes_Need_Proposal_Review}
						bgcolor='info.light'
						onClick={() => {
							setReportData({
								title: (
									<ReportTitle
										formName='Quote'
										title='Quotes Needing Proposal Review'
									/>
								),
								formName: 'Quote',
								defaultSortByColumn: 'Number',
								defaultSortDirection: 'desc',
								getNameFn: (row) => row.Name, //() => {}
								overrideDefaultView: quotesNeedProposalReview, //{ID:'', Name: '', JSON: []}
								columns: quoteColumns,
							});
							setOpen(true);
						}}
					/>

					<DashboardCard
						Icon={
							<DatabaseDefaultIcon
								form='Quote'
								fontSize='large'
								sx={{
									color: (theme) =>
										theme.palette.mode === 'dark' ? '#000' : '#fff',
								}}
							/>
						}
						headerText='Quotes'
						subHeaderText='Need Scope Review'
						dataText={databaseInformation.Quotes_Need_Scope_Review}
						bgcolor='info.light'
						onClick={() => {
							setReportData({
								title: (
									<ReportTitle
										formName='Quote'
										title='Quotes Needing Scope Review'
									/>
								),
								formName: 'Quote',
								defaultSortByColumn: 'Number',
								defaultSortDirection: 'desc',
								getNameFn: (row) => row.Name, //() => {}
								overrideDefaultView: quotesNeedScopeReview, //{ID:'', Name: '', JSON: []}
								columns: quoteColumns,
							});
							setOpen(true);
						}}
					/>

					<DashboardCard
						Icon={
							<DatabaseDefaultIcon
								form='Quote'
								fontSize='large'
								sx={{
									color: (theme) =>
										theme.palette.mode === 'dark' ? '#000' : '#fff',
								}}
							/>
						}
						headerText='Quotes'
						subHeaderText='Need Financial Review'
						dataText={databaseInformation.Quotes_Need_Financial_Review}
						bgcolor='info.light'
						onClick={() => {
							setReportData({
								title: (
									<ReportTitle
										formName='Quote'
										title='Quotes Needing Financial Review'
									/>
								),
								formName: 'Quote',
								defaultSortByColumn: 'Number',
								defaultSortDirection: 'desc',
								getNameFn: (row) => row.Name, //() => {}
								overrideDefaultView: quotesNeedFinancialReview, //{ID:'', Name: '', JSON: []}
								columns: quoteColumns,
							});
							setOpen(true);
						}}
					/>

					<DashboardCard
						Icon={
							<DatabaseDefaultIcon
								form='Quote'
								fontSize='large'
								sx={{
									color: (theme) =>
										theme.palette.mode === 'dark' ? '#000' : '#fff',
								}}
							/>
						}
						headerText='Quote Change Orders'
						subHeaderText='Need Engineering Review'
						dataText={databaseInformation.CO_Quotes_Need_Engineering_Review}
						bgcolor='info.main'
						onClick={() => {
							setReportData({
								title: (
									<ReportTitle
										formName='Quote'
										title='Quote Change Orders Needing Engineering Review'
									/>
								),
								formName: 'Quote',
								defaultSortByColumn: 'Number',
								defaultSortDirection: 'desc',
								getNameFn: (row) => row.Name, //() => {}
								overrideDefaultView: quoteChangeOrdersNeedEngineeringReview, //{ID:'', Name: '', JSON: []}
								columns: quoteColumns,
							});
							setOpen(true);
						}}
					/>

					<DashboardCard
						Icon={
							<DatabaseDefaultIcon
								form='Quote'
								fontSize='large'
								sx={{
									color: (theme) =>
										theme.palette.mode === 'dark' ? '#000' : '#fff',
								}}
							/>
						}
						headerText='Quote Change Orders'
						subHeaderText='Need Finance Review'
						dataText={databaseInformation.CO_Quotes_Need_Finance_Review}
						bgcolor='info.main'
						onClick={() => {
							setReportData({
								title: (
									<ReportTitle
										formName='Quote'
										title='Quote Change Orders Needing Finance Review'
									/>
								),
								formName: 'Quote',
								defaultSortByColumn: 'Number',
								defaultSortDirection: 'desc',
								getNameFn: (row) => row.Name, //() => {}
								overrideDefaultView: quoteChangeOrdersNeedFinanceReview, //{ID:'', Name: '', JSON: []}
								columns: quoteColumns,
							});
							setOpen(true);
						}}
					/>

					<DashboardCard
						Icon={
							<DatabaseDefaultIcon
								form='Quote'
								fontSize='large'
								sx={{
									color: (theme) =>
										theme.palette.mode === 'dark' ? '#000' : '#fff',
								}}
							/>
						}
						headerText='Quote Change Orders'
						subHeaderText='Need Sales Manager Review'
						dataText={databaseInformation.CO_Quotes_Need_Sales_Manager_Review}
						bgcolor='info.main'
						onClick={() => {
							setReportData({
								title: (
									<ReportTitle
										formName='Quote'
										title='Quote Change Orders Needing Sales Manager Review'
									/>
								),
								formName: 'Quote',
								defaultSortByColumn: 'Number',
								defaultSortDirection: 'desc',
								getNameFn: (row) => row.Name, //() => {}
								overrideDefaultView: quoteChangeOrdersNeedSalesManagerReview, //{ID:'', Name: '', JSON: []}
								columns: quoteColumns,
							});
							setOpen(true);
						}}
					/>
				</DashboardSection>

				<DashboardSection title='Projects' color='warning.light' sx={{ pt: 8 }}>
					<DashboardCard
						Icon={
							<DatabaseDefaultIcon
								form='Project'
								fontSize='large'
								sx={{
									color: (theme) =>
										theme.palette.mode === 'dark' ? '#000' : '#fff',
								}}
							/>
						}
						headerText='Projects'
						subHeaderText='Open Projects'
						dataText={databaseInformation.Open_Projects}
						bgcolor='warning.light'
						onClick={() => {
							setReportData({
								title: <ReportTitle formName='Project' title='Open Projects' />,
								formName: 'Project',
								defaultSortByColumn: 'Number',
								defaultSortDirection: 'desc',
								getNameFn: (row) => row.Name, //() => {}
								overrideDefaultView: projectsOpen,
								columns: projectColumns,
							});
							setOpen(true);
						}}
					/>

					<DashboardCard
						Icon={
							<DatabaseDefaultIcon
								form='Sales_Order'
								fontSize='large'
								sx={{
									color: (theme) =>
										theme.palette.mode === 'dark' ? '#000' : '#fff',
								}}
							/>
						}
						headerText='Sales Orders'
						subHeaderText='Need Drafting Review'
						dataText={databaseInformation.Sales_Orders_Need_Drafting_Review}
						bgcolor='warning.light'
						onClick={() => {
							setReportData({
								title: (
									<ReportTitle
										formName='Sales_Order'
										title='Need Drafting Review'
									/>
								),
								formName: 'Sales_Order',
								defaultSortByColumn: 'Number',
								defaultSortDirection: 'desc',
								getNameFn: (row) => row.Name, //() => {}
								overrideDefaultView: salesOrdersNeedsDraftingReview,
								columns: salesOrderColumns,
							});
							setOpen(true);
						}}
					/>

					<DashboardCard
						Icon={
							<DatabaseDefaultIcon
								form='Sales_Order'
								fontSize='large'
								sx={{
									color: (theme) =>
										theme.palette.mode === 'dark' ? '#000' : '#fff',
								}}
							/>
						}
						headerText='Sales Orders'
						subHeaderText='Need Programming Review'
						dataText={databaseInformation.Sales_Orders_Need_Programming_Review}
						bgcolor='warning.light'
						onClick={() => {
							setReportData({
								title: (
									<ReportTitle
										formName='Sales_Order'
										title='Need Programming Review'
									/>
								),
								formName: 'Sales_Order',
								defaultSortByColumn: 'Number',
								defaultSortDirection: 'desc',
								getNameFn: (row) => row.Name, //() => {}
								overrideDefaultView: salesOrdersNeedsProgrammingReview,
								columns: salesOrderColumns,
							});
							setOpen(true);
						}}
					/>

					<DashboardCard
						Icon={
							<DatabaseDefaultIcon
								form='Sales_Order'
								fontSize='large'
								sx={{
									color: (theme) =>
										theme.palette.mode === 'dark' ? '#000' : '#fff',
								}}
							/>
						}
						headerText='Sales Orders'
						subHeaderText='Need Engineering Review'
						dataText={databaseInformation.Sales_Orders_Need_Engineering_Review}
						bgcolor='warning.light'
						onClick={() => {
							setReportData({
								title: (
									<ReportTitle
										formName='Sales_Order'
										title='Need Engineering Review'
									/>
								),
								formName: 'Sales_Order',
								defaultSortByColumn: 'Number',
								defaultSortDirection: 'desc',
								getNameFn: (row) => row.Name, //() => {}
								overrideDefaultView: salesOrdersNeedsEngineeringReview,
								columns: salesOrderColumns,
							});
							setOpen(true);
						}}
					/>
				</DashboardSection>

				<DashboardSection title='Service' color='error.light' sx={{ pt: 8 }}>
					<DashboardCard
						Icon={
							<DatabaseDefaultIcon
								form='Service_Order'
								fontSize='large'
								sx={{
									color: (theme) =>
										theme.palette.mode === 'dark' ? '#000' : '#fff',
								}}
							/>
						}
						headerText='Service Orders'
						subHeaderText='Open'
						dataText={databaseInformation.Open_Service_Orders}
						bgcolor='error.light'
						onClick={() => {
							setReportData({
								title: (
									<ReportTitle
										formName='Service_Order'
										title='Open Service Orders'
									/>
								),
								formName: 'Service_Order',
								defaultSortByColumn: 'Number',
								defaultSortDirection: 'desc',
								getNameFn: (row) => row.Name, //() => {}
								overrideDefaultView: serviceOrdersOpen,
								columns: serviceOrderColumns,
							});
							setOpen(true);
						}}
					/>

					<DashboardCard
						Icon={
							<DatabaseDefaultIcon
								form='Service_Order'
								fontSize='large'
								sx={{
									color: (theme) =>
										theme.palette.mode === 'dark' ? '#000' : '#fff',
								}}
							/>
						}
						headerText='Service Orders'
						subHeaderText='Completed'
						dataText={databaseInformation.Completed_Service_Orders}
						bgcolor='error.light'
						onClick={() => {
							setReportData({
								title: (
									<ReportTitle
										formName='Service_Order'
										title='Completed Service Orders'
									/>
								),
								formName: 'Service_Order',
								defaultSortByColumn: 'Number',
								defaultSortDirection: 'desc',
								getNameFn: (row) => row.Name, //() => {}
								overrideDefaultView: serviceOrdersComplete,
								columns: serviceOrderColumns,
							});
							setOpen(true);
						}}
					/>

					<DashboardCard
						Icon={
							<DatabaseDefaultIcon
								form='Service_Contract'
								fontSize='large'
								sx={{
									color: (theme) =>
										theme.palette.mode === 'dark' ? '#000' : '#fff',
								}}
							/>
						}
						headerText='Service Contracts'
						subHeaderText='Active Annual Contracts'
						dataText={databaseInformation.Active_Actual_Service_Contracts}
						bgcolor='error.light'
						onClick={() => {
							setReportData({
								title: (
									<ReportTitle
										formName='Service_Contract'
										title='Active Annual Service Contracts'
									/>
								),
								formName: 'Service_Contract',
								defaultSortByColumn: 'Number',
								defaultSortDirection: 'desc',
								getNameFn: (row) => row.Name, //() => {}
								overrideDefaultView: serviceContractsAnnualActive,
								columns: serviceContractColumns,
							});
							setOpen(true);
						}}
					/>

					<DashboardCard
						Icon={
							<DatabaseDefaultIcon
								form='Service_Contract'
								fontSize='large'
								sx={{
									color: (theme) =>
										theme.palette.mode === 'dark' ? '#000' : '#fff',
								}}
							/>
						}
						headerText='Service Contracts'
						subHeaderText='Active Warranties'
						dataText={
							databaseInformation.Active_1st_Year_Warranty_Service_Contracts
						}
						bgcolor='error.light'
						onClick={() => {
							setReportData({
								title: (
									<ReportTitle
										formName='Service_Contract'
										title='Active Warranties'
									/>
								),
								formName: 'Service_Contract',
								defaultSortByColumn: 'Number',
								defaultSortDirection: 'desc',
								getNameFn: (row) => row.Name, //() => {}
								overrideDefaultView: serviceContractsWarrantiesActive,
								columns: serviceContractColumns,
							});
							setOpen(true);
						}}
					/>

					<DashboardCard
						Icon={
							<DatabaseDefaultIcon
								form='Service_Contract'
								fontSize='large'
								sx={{
									color: (theme) =>
										theme.palette.mode === 'dark' ? '#000' : '#fff',
								}}
							/>
						}
						headerText='Service Contracts'
						subHeaderText='Created in Last 30 Days'
						dataText={
							databaseInformation.Service_Contracts_Created_in_Last_30_Days
						}
						bgcolor='error.light'
						onClick={() => {
							setReportData({
								title: (
									<ReportTitle
										formName='Service_Contract'
										title='Created in Last 30 Days'
									/>
								),
								formName: 'Service_Contract',
								defaultSortByColumn: 'Number',
								defaultSortDirection: 'desc',
								getNameFn: (row) => row.Name, //() => {}
								overrideDefaultView: serviceContractsLast30Days,
								columns: serviceContractColumns,
							});
							setOpen(true);
						}}
					/>
				</DashboardSection>

				<DashboardSection
					title='Purchasing, Receiving & Finance'
					color='success.light'
					sx={{ pt: 8 }}>
					<DashboardCard
						Icon={
							<DatabaseDefaultIcon
								form='Purchase_Order'
								fontSize='large'
								sx={{
									color: (theme) =>
										theme.palette.mode === 'dark' ? '#000' : '#fff',
								}}
							/>
						}
						headerText='Purchase Orders'
						subHeaderText='Open'
						dataText={databaseInformation.Open_Purchase_Orders}
						bgcolor='success.light'
						onClick={() => {
							setReportData({
								title: <ReportTitle formName='Purchase_Order' title='Open' />,
								formName: 'Purchase_Order',
								defaultSortByColumn: 'Number',
								defaultSortDirection: 'desc',
								getNameFn: (row) => row.Name, //() => {}
								overrideDefaultView: purchaseOrdersOpen,
								columns: purchaseOrderColumns,
							});
							setOpen(true);
						}}
					/>

					<DashboardCard
						Icon={
							<DatabaseDefaultIcon
								form='Purchase_Order'
								fontSize='large'
								sx={{
									color: (theme) =>
										theme.palette.mode === 'dark' ? '#000' : '#fff',
								}}
							/>
						}
						headerText='Purchase Orders'
						subHeaderText='Partially Received'
						dataText={databaseInformation.Purchase_Orders_Partially_Received}
						bgcolor='success.light'
						onClick={() => {
							setReportData({
								title: (
									<ReportTitle
										formName='Purchase_Order'
										title='Partially Received Purchase Orders'
									/>
								),
								formName: 'Purchase_Order',
								defaultSortByColumn: 'Number',
								defaultSortDirection: 'desc',
								getNameFn: (row) => row.Name, //() => {}
								overrideDefaultView: purchaseOrdersPartiallyReceived,
								columns: purchaseOrderColumns,
							});
							setOpen(true);
						}}
					/>

					<DashboardCard
						Icon={
							<DatabaseDefaultIcon
								form='Expense'
								fontSize='large'
								sx={{
									color: (theme) =>
										theme.palette.mode === 'dark' ? '#000' : '#fff',
								}}
							/>
						}
						headerText='Expenses'
						subHeaderText='Not Entered in QuickBooks'
						dataText={databaseInformation.QuickBooks_Unentered_Expenses}
						bgcolor='success.light'
						onClick={() => {
							setReportData({
								title: (
									<ReportTitle
										formName='Expense'
										title='Expenses Not Entered in QuickBooks'
									/>
								),
								formName: 'Expense',
								defaultSortByColumn: 'Number',
								defaultSortDirection: 'desc',
								getNameFn: (row) => row.Name, //() => {}
								overrideDefaultView: expensesNotEnteredInQuickBooks,
								columns: expenseColumns,
							});
							setOpen(true);
						}}
					/>
				</DashboardSection>

				<DashboardSection title='Personal' color='primary.main' sx={{ pt: 8 }}>
					<DashboardCard
						Icon={
							<DatabaseDefaultIcon
								form='Time_Entry'
								fontSize='large'
								sx={{
									color: (theme) =>
										theme.palette.mode === 'dark' ? '#000' : '#fff',
								}}
							/>
						}
						headerText='Time Entries'
						subHeaderText='Hours Worked this Week'
						dataText={databaseInformation.Time_Entry_Hours_This_Week}
						bgcolor='primary.main'
						onClick={() => {
							setReportData({
								title: (
									<ReportTitle
										formName='Time_Entry'
										title={"This Week's Time Entries"}
									/>
								),
								formName: 'Time_Entry',
								defaultSortByColumn: 'Number',
								defaultSortDirection: 'desc',
								getNameFn: (row) => row.Name, //() => {}
								overrideDefaultView: timeEntriesCurrentWeek(currentUser),
								columns: timeEntryColumns,
								loadData: {
									Employee: {
										display_value: currentUser.Full_Name,
										ID: currentUser.ID,
									},
									Reason: currentUser.Default_Time_Entry_Reason,
								},
							});
							setOpen(true);
						}}
					/>
				</DashboardSection>
			</Box>

			{/* Overlay => Open a Form */}
			<RenderPopup
				open={open}
				onClose={() => setOpen(false)}
				title={reportData.title}>
				<CustomDataTable
					formName={reportData.formName}
					columns={reportData.columns}
					height={window.innerHeight - 3 * navBarHeight - 24}
					overrideDefaultView={reportData.overrideDefaultView}
					loadDataOnAddNewRow={reportData.loadData}
					DataGridProps={{
						checkboxSelection: true,
						disableSelectionOnClick: true,
					}}
				/>
			</RenderPopup>

			{/* <RenderPopup
				title={reportData.title}
				open={open}
				onClose={() => setOpen(false)}>
				<Container
					maxWidth='xl'
					disableGutters
					sx={{ maxWidth: { xs: appMaxWidth }, px: 1 }}>
					<CustomDataTable
						formName={reportData.formName}
						columns={reportData.columns}
						height={window.innerHeight - navBarHeight - 16}
						overrideDefaultView={reportData.overrideDefaultView}
						DataGridProps={{
							checkboxSelection: true,
							disableSelectionOnClick: true,
						}}
					/>
				</Container>
			</RenderPopup> */}
		</Container>
	);
};

Dashboard.propTypes = {};

const Wrapper = (props) => {
	return (
		<React.Suspense fallback={<ContextCircularProgressLoader />}>
			<Dashboard {...props} />
		</React.Suspense>
	);
};

export default Wrapper;
