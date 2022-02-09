import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { currentUserIsHelpAdminState } from '../../recoil/selectors';
import {
	Box,
	Dialog,
	DialogActions,
	DialogContent,
	DialogTitle,
	IconButton,
	Slide,
} from '@mui/material';
import { Close } from '@mui/icons-material';
import Accordion from '@mui/material/Accordion';
import AccordionSummary from '@mui/material/AccordionSummary';
import AccordionDetails from '@mui/material/AccordionDetails';
import Typography from '@mui/material/Typography';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import Stepper from '@mui/material/Stepper';
import Step from '@mui/material/Step';
import StepLabel from '@mui/material/StepLabel';
import StepContent from '@mui/material/StepContent';
import Button from '@mui/material/Button';
import Paper from '@mui/material/Paper';
import useMediaQuery from '@mui/material/useMediaQuery';
import { useTheme } from '@mui/material/styles';
import { useFormData, useZohoGetAllRecords } from '../Helpers/CustomHooks';
import HelpDocumentForm from './HelpDocumentForm';
import { useRecoilValue } from 'recoil';
import { getRecordByIdSuspense } from '../../apis/ZohoCreator';

const defaultLoadData = {};

const Transition = React.forwardRef(function Transition(props, ref) {
	return <Slide direction='up' ref={ref} {...props} />;
});

const HelpDocs = ({ open, onClose, loadData }) => {
	//const theme = useTheme();
	//const fullScreen = useMediaQuery(theme.breakpoints.down('md'));
	const currentUserIsHelpAdmin = useRecoilValue(currentUserIsHelpAdminState);
	const [data, setData] = useState({
		...defaultLoadData,
		...loadData,
	});
	const [activeStep, setActiveStep] = React.useState(0);
	const [activeAccordion, setActiveAccordion] = useState(false);
	const [mode, setMode] = useState('view'); //view, edit, something else??
	const [formOpen, setFormOpen] = useState(false);
	const [formData, setFormData] = useState(null);

	const [categories, setCategories] = useState([]);

	const dataState = useZohoGetAllRecords(
		'Help_Documents',
		'Status=="Active" || Status=="Flagged for Removal"'
	);

	useEffect(() => {
		console.log('HelpDocs.js dataState', dataState);

		if (dataState.status === 'fetched') {
			const _uniqCategories = [
				...new Set(dataState.data.map((x) => x.Category)),
			];

			//? Create an array of unique category/subcategory data from the database
			_uniqCategories.map((x) => ({
				Category: x.Category,
				Subcategories: [
					...new Set(
						dataState.data
							.filter((y) => y.Category === x.Category)
							.map((x) => x.Subcategory)
					),
				],
			}));

			setCategories(_uniqCategories);
		}
	}, [dataState]);

	useEffect(() => {
		console.log('HelpDocs.js categories', categories);
		if (categories.length === 0 && currentUserIsHelpAdmin) {
			setFormOpen(true);
		}
	}, [categories]);

	useEffect(() => {
		console.log('HelpDocs.js categories', formData);
	}, [formData]);

	const handleAccordionChange = (panel) => (event, isExpanded) => {
		setActiveAccordion(isExpanded ? panel : false);
		handleReset();
	};

	const handleNext = () => {
		setActiveStep((prevActiveStep) => prevActiveStep + 1);
	};

	const handleBack = () => {
		setActiveStep((prevActiveStep) => prevActiveStep - 1);
	};

	const handleReset = () => {
		setActiveStep(0);
	};

	const sections = [
		{
			title: 'General Information',
			subsections: [
				{
					title: 'Application Tabs',
					steps: [
						{
							label: 'Right Clicking on Sidenav Buttons',
							description:
								'The Sidenav is the sectioned area to the left. Try right clicking on different options (Accounts, Contacts, Wizards, etc.) to get the option to open them in a new tab.',
						},
						{
							label: 'Normal Clicking',
							description:
								'If you left click a Sidenav option like normal, it will open in the currently active tab. If you are opening a form, it will open in an overlay over the current report.',
						},
						{
							label: 'A Good Use Case...',
							description:
								'One of the best use cases for these application tabs is mass opening forms from a certain report, e.g. you can select 10 projects from the Projects report, and then right click and open them all in separate tabs.',
						},
						{
							label: 'Changing the Active Application Tab',
							description:
								'You can click an Application Tab just below the top Navbar to change your active tab.',
						},
						{
							label: 'Right Clicking an Application Tab',
							description:
								'Try right clicking an Application Tab to see some relevant options!',
						},
					],
				},
				{
					title: 'Tooltips',
					steps: [
						{
							label: 'Mousing Over Different UI Elements',
							description:
								'In general, the app has mouseover tooltips where things are not very clear, but this is subjective naturally. If you see a place where you have a question, please say something! We want to make the software as easy to use as possible.',
						},
					],
				},
				{
					title: 'Personal Settings',
					steps: [
						{
							label: 'The Navbar',
							description:
								"The Navbar is the colored toolbar at the top of our application with VisionPoint's logo in it. Click the Settings button (gear cog icon) in the top right to check out any personal options. Some examples are dark/light themes and primary/secondary colors.",
						},
						{
							label: 'Part 1: Setting Default Views for a certain Report',
							description:
								'This is an important one. You will want to click the icon that looks a bit like a calculator on the various reports across our database.',
						},
						{
							label: 'Part 2: Setting Default Views for a certain Report',
							description:
								'Once the menu opens up you can click the anchor icon to set a certain view as your personal default.',
						},
						{
							label: 'Part 3: Setting Default Views for a certain Report',
							description:
								'You can also click the edit/pencil icon to bring up the specifics of that filter and edit them. You can either just temporarily apply the customized filter or update the existing one permanently.',
						},
						{
							label: 'Sidenav Options',
							description:
								'There are some customized behaviors that you can mess with in regards to the Sidenav bar on the left of the page. This amounts to controlling the minimized/maximized state of the Sidenav via manual mouse clicks (default behavior) or mouseover. This will be improved on in the future as well. Any suggestions are welcome!',
						},
					],
				},
			],
		},
		{
			title: 'Presales Opportunity and Quote Process',
			subsections: [
				{
					title: 'Part 1: From Sales to Engineering',
					steps: [
						{
							label: 'Sales => Create Opportunity',
							description:
								'Create Opportunity and optionally set the Status to "Started"',
						},
						{
							label: 'Sales => Get Presales Scheduled',
							description:
								'When Presales are scheduled, click "Pending Engineering Review"',
						},
					],
				},
				{
					title: 'Part 2: From Engineering back to Sales',
					steps: [
						{
							label: 'Engineering => Create Quotes',
							description:
								'Create Quotes from the Opportunity. For Opportunities where the current Status is "Pending Engineering Review", Quotes will be created with the Status automatically set to "Open for Engineering"',
						},
						{
							label: 'Engineering => Complete Review',
							description:
								'When all Quotes under a certain Opportunity are clicked to "Engineering Review Complete", a workflow will trigger to update the Opportunity Status to "Engineering Review Complete". This alerts the Sales owner of the Opportunity to draft their proposal',
						},
					],
				},
				{
					title: 'Part 3: From Sales to Scope & Financial Review',
					steps: [
						{
							label: 'Salesperson => Draft Proposal',
							description:
								'Author your proposal, and then click the Opportunity Status "Proposal Review Complete". This triggers a workflow to update ALL Quotes to "Proposal Review Complete" and alerts whomever is doing the Quote Scope Review',
						},
						{
							label: 'Engineering => Scope Review',
							description:
								'Once complete, click Status "Scope Review Complete". This will alert the Sales Manager to proceed with Financial Review',
						},
						{
							label: 'Sales Manager => Financial Review',
							description:
								'Once complete, click Status "Financial Review Complete". Once all Quotes for the Opportunity have this Status, a workflow will trigger to update the Opportunity Status to "Approved for Submittal"',
						},
					],
				},
				{
					title: 'Part 4: Closed Won vs. Closed Lost',
					steps: [
						{
							label: 'Salesman => Closed Won',
							description:
								'Once "Closed Won" is clicked on the Opportunity, a wizard will run that allows one to pick and choose which Quote(s) to mark as "Accepted". Any other Quotes on the Opportunity are Voided',
						},
						{
							label: 'Salesman => Closed Lost',
							description:
								'Once "Closed Lost" is clicked on the Opportunity, all Quotes on the Opportunity are Voided.',
						},
					],
				},
			],
		},
		{
			title: 'QuickBooks Data Synchronization',
			subsections: [
				{
					title: 'Items',
					steps: [
						{
							label: 'Custom Checkbox: Sync to QB',
							description:
								'Make sure the Zoho Books items has the "Sync to QB" custom checkbox checked',
						},
						{
							label: 'GL Accounts',
							description:
								"Make sure the Zoho Books item's Sales and Purchase Accounts have a 100% text match to a QuickBooks GL Account. If QuickBooks has an account code, Zoho Books must have the same code as well",
						},
						{
							label: 'General Info on Line Items',
							description: `We only use 5 Zoho Books items in total for all line items within QuickBooks records: Zoho Freight, Zoho Equipment, Zoho Service, Zoho Subcontractor Labor, and Zoho Stock. These Zoho line items have specific GL Accounts that they correspond with in order to put our Price Book Items on Estimates and Purchase Orders into the correct GL Account. For example, a Crestron HD-MD-400-C-E within Zoho would sync to a QuickBooks PO as Zoho Equipment: Crestron HD-MD-400-C-E so that Finance can still see what line item is what based on a custom Description.`,
						},
					],
				},
			],
		},
		{
			title: 'Quotes',
			subsections: [
				{
					//Accordion 1
					title: 'Processing a Change Order',
					//Stepper Group 1
					steps: [
						{
							label: 'Select campaign settings',
							description: `For each ad campaign that you create, you can control how much
                                    you're willing to spend on clicks and conversions, which networks
                                    and geographical locations you want your ads to show on, and more.`,
						},
						{
							label: 'Create an ad group',
							description:
								'An ad group contains one or more ads which target a shared set of keywords.',
						},
						{
							label: 'Create an ad',
							description: `Try out different ad text to see what brings in the most customers,
                                    and learn how to enhance your ads using features like ad extensions.
                                    If you run into any problems with your ads, find out how to tell if
                                    they're running and how to resolve approval issues.`,
						},
					],
				},
				{
					//Accordion 2
					title: 'Processing a Quote',
					//Stepper Group 2
					steps: [
						{
							label: '',
							description: '',
						},
					],
				},
			],
		},
		{
			title: 'Sales Orders',
			subsections: [
				{
					//Accordion
					title: 'Processing a Change Order',
					//Stepper
					steps: [
						//Steps
						{
							label: '',
							description: '',
						},
					],
				},
			],
		},
	];

	return (
		<Dialog
			fullScreen
			open={open}
			onClose={onClose}
			TransitionComponent={Transition}>
			<DialogTitle
				sx={{
					display: 'flex',
					alignItems: 'center',
					justifyContent: 'space-between',
				}}>
				Help Docs
				<IconButton aria-label='close' onClick={onClose} size='large'>
					<Close />
				</IconButton>
			</DialogTitle>

			<DialogContent dividers>
				{formOpen ? (
					<HelpDocumentForm
						resource={getRecordByIdSuspense('Help_Documents', null)}
						onChange={(d) => setFormData(d)}
					/>
				) : (
					<Box>
						{sections.map((section, i) => (
							<Box sx={{ mt: i > 0 ? 3 : 0 }} key={section.title}>
								<Typography variant='h5'>{section.title}</Typography>

								{section.subsections.map((subsection) => (
									<Accordion
										key={subsection.title}
										expanded={
											activeAccordion === section.title + subsection.title
										}
										onChange={handleAccordionChange(
											section.title + subsection.title
										)}>
										<AccordionSummary expandIcon={<ExpandMoreIcon />}>
											<Typography>{subsection.title}</Typography>
										</AccordionSummary>
										<AccordionDetails>
											<Stepper activeStep={activeStep} orientation='vertical'>
												{subsection.steps.map((step, index) => (
													<Step key={step.label}>
														<StepLabel>{step.label}</StepLabel>
														<StepContent>
															<Typography>{step.description}</Typography>
															<Box sx={{ mb: 2 }}>
																<Button
																	variant='contained'
																	onClick={handleNext}
																	sx={{ mt: 1, mr: 1 }}>
																	{index === subsection.steps.length - 1
																		? 'Finish'
																		: 'Continue'}
																</Button>
																<Button
																	disabled={index === 0}
																	onClick={handleBack}
																	sx={{ mt: 1, mr: 1 }}>
																	Back
																</Button>
															</Box>
														</StepContent>
													</Step>
												))}
											</Stepper>
											{activeStep === subsection.steps.length && (
												<Paper square elevation={0} sx={{ p: 3 }}>
													<Typography>
														All steps completed - you&apos;re finished
													</Typography>
													<Button onClick={handleReset} sx={{ mt: 1, mr: 1 }}>
														Reset
													</Button>
												</Paper>
											)}
										</AccordionDetails>
									</Accordion>
								))}
							</Box>
						))}
					</Box>
				)}
			</DialogContent>

			<DialogActions>
				{formOpen ? (
					<Button onClick={() => console.log('save', formData)} color='primary'>
						Save
					</Button>
				) : (
					<Button onClick={onClose} color='primary'>
						Close
					</Button>
				)}
			</DialogActions>
		</Dialog>
	);
};

HelpDocs.propTypes = {
	open: PropTypes.bool,
	onClose: PropTypes.func.isRequired,
};

export default HelpDocs;
