import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import Timeline from '@mui/lab/Timeline';
import TimelineItem from '@mui/lab/TimelineItem';
import TimelineSeparator from '@mui/lab/TimelineSeparator';
import TimelineConnector from '@mui/lab/TimelineConnector';
import TimelineContent from '@mui/lab/TimelineContent';
import TimelineOppositeContent from '@mui/lab/TimelineOppositeContent';
import TimelineDot from '@mui/lab/TimelineDot';
import Typography from '@mui/material/Typography';
import { Badge, Box, LinearProgress, Tooltip } from '@mui/material';
import ContextCircularProgessLoader from '../Loaders/ContextCircularProgressLoader';
import {
	AddCircleOutline,
	Block,
	DeleteForever,
	Edit,
	Merge,
	ReportProblem,
} from '@mui/icons-material';
import { useZohoGetAllRecords } from '../Helpers/CustomHooks';

const TimeLineContent = ({ id }) => {
	//const timelineData = useRecoilValue(timelineDataState);
	const timelineDataState = useZohoGetAllRecords(
		'Changelogs',
		`Parent_ID=="${id}"`
	); //* Retrieve data from database
	const [loading, setLoading] = useState(true);
	const [data, setData] = useState([]);

	useEffect(() => {
		switch (timelineDataState.status) {
			case 'fetching':
				setLoading(true);
				break;
			case 'fetched':
				setData(timelineDataState.data);
				setLoading(false);
				break;
			case 'error':
				if (timelineDataState.error) {
					console.error(
						'Zoho err: ',
						JSON.parse(timelineDataState.error.responseText).message
					);
				}
				setData(timelineDataState.data);
				setLoading(false);
				break;
		}
	}, [timelineDataState]);

	return (
		<>
			{loading ? (
				<ContextCircularProgessLoader />
			) : data && data.length > 0 ? (
				<Timeline>
					{data.map((change) => {
						const timeLineDotColor = () => {
							switch (change.Action_Type) {
								case 'Create':
									return 'success';
								case 'Update':
								case 'Merge':
									return 'info';
								case 'Delete':
									return 'error';
								case 'Void':
									return 'warning';
								default:
									return 'primary';
							}
						};
						return (
							<TimelineItem key={change.ID}>
								<TimelineOppositeContent
									sx={{ m: 'auto 0' }}
									align='right'
									variant='body2'
									color='text.secondary'>
									{`${change.Date_field} ${change.Time}, ${change.Author}`}
								</TimelineOppositeContent>

								<TimelineSeparator>
									<TimelineConnector />
									{change.Data ? (
										<Tooltip arrow title={change.Data}>
											<Badge color='primary' overlap='circular' variant='dot'>
												<TimelineDot color={timeLineDotColor()}>
													{!change.Action_Type ? <ReportProblem /> : null}
													{change.Action_Type === 'Create' ? (
														<AddCircleOutline />
													) : null}
													{change.Action_Type === 'Update' ? <Edit /> : null}
													{change.Action_Type === 'Merge' ? <Merge /> : null}
													{change.Action_Type === 'Delete' ? (
														<DeleteForever />
													) : null}
													{change.Action_Type === 'Void' ? <Block /> : null}
												</TimelineDot>
											</Badge>
										</Tooltip>
									) : (
										<TimelineDot color={timeLineDotColor()}>
											{!change.Action_Type ? <ReportProblem /> : null}
											{change.Action_Type === 'Create' ? (
												<AddCircleOutline />
											) : null}
											{change.Action_Type === 'Update' ? <Edit /> : null}
											{change.Action_Type === 'Merge' ? <Merge /> : null}
											{change.Action_Type === 'Delete' ? (
												<DeleteForever />
											) : null}
											{change.Action_Type === 'Void' ? <Block /> : null}
										</TimelineDot>
									)}
									<TimelineConnector />
								</TimelineSeparator>
								<TimelineContent sx={{ py: '12px', px: 2 }}>
									<Typography variant='h6' component='span'>
										{change.Field_Name ? change.Field_Name : 'N/A'}
										{change.Current_Status
											? ` - Current Status: ${change.Current_Status}`
											: ''}
									</Typography>
									<Typography>
										{change.Action_Type &&
										change.Action_Type === 'Create' &&
										!change.New_Value &&
										change.Old_Value
											? `${change.Old_Value}`
											: ''}
										{change.Action_Type &&
										change.Action_Type === 'Create' &&
										change.New_Value &&
										!change.Old_Value
											? `${change.New_Value}`
											: ''}

										{(!change.Action_Type || change.Action_Type === 'Update') &&
										change.New_Value &&
										!change.Old_Value
											? `Changed to ${change.New_Value}`
											: ''}
										{(!change.Action_Type || change.Action_Type === 'Update') &&
										change.New_Value &&
										change.Old_Value
											? `Changed from ${change.Old_Value} to ${change.New_Value}`
											: ''}

										{change.Action_Type &&
										change.Action_Type === 'Delete' &&
										!change.New_Value &&
										change.Old_Value
											? `Deleted ${change.Old_Value}`
											: ''}
										{change.Action_Type &&
										change.Action_Type === 'Delete' &&
										change.New_Value &&
										!change.Old_Value
											? `Deleted ${change.New_Value}`
											: ''}
										{change.Action_Type &&
										change.Action_Type === 'Delete' &&
										change.New_Value &&
										change.Old_Value
											? `Deleted ${change.Old_Value}`
											: ''}

										{change.Action_Type &&
										change.Action_Type === 'Void' &&
										!change.New_Value &&
										change.Old_Value
											? `Voided ${change.Old_Value}`
											: ''}
										{change.Action_Type &&
										change.Action_Type === 'Void' &&
										change.New_Value &&
										!change.Old_Value
											? `Voided ${change.New_Value}`
											: ''}
										{change.Action_Type &&
										change.Action_Type === 'Void' &&
										change.New_Value &&
										change.Old_Value
											? `Voided ${change.Old_Value}`
											: ''}
									</Typography>
								</TimelineContent>
							</TimelineItem>
						);
					})}
				</Timeline>
			) : (
				<Typography sx={{ p: 4, width: '100%' }} textAlign='center'>
					No timeline data
				</Typography>
			)}
		</>
	);
};

TimeLineContent.propTypes = {
	id: PropTypes.string.isRequired,
};

export default TimeLineContent;
