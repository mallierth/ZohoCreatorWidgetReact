import React, { useEffect, useState } from 'react';
import { useRecoilState } from 'recoil';
import PropTypes from 'prop-types';
import {
	Box,
	Button,
	ButtonGroup,
	Divider,
	Drawer,
	IconButton,
	Menu,
	MenuItem,
	Stack,
	Tooltip,
	Typography,
} from '@mui/material';
import {
	Add,
	Anchor,
	ArrowDropDown,
	Edit,
	FilterAlt,
	Star,
	StarBorder,
} from '@mui/icons-material';
import { yellow } from '@mui/material/colors';
import { currentUserState } from '../../recoil/atoms';
import FilterRow from './FilterRow';

const TableFilterManager = ({
	size = 'small',
	color = 'primary',
	columns,
	selectedOption,
	//savedViews,
	//setSavedViews,
	formName,
	viewState,
	setActiveView,
	setSaveView,
	setFilters,
}) => {
	const [currentUser, setCurrentUser] = useRecoilState(currentUserState);
	const [open, setOpen] = useState(false);
	const [activeFilters, setActiveFilters] = useState(['']);
	const [anchorEl, setAnchorEl] = React.useState(null);
	const menuOpen = Boolean(anchorEl);

	const toggleDrawer = (e, open) => {
		if (e.type === 'keydown' && (e.key === 'Tab' || e.key === 'Shift')) {
			return;
		}

		setOpen(open);
	};

	const handleFilterSave = () => {
		setOpen(false);
	};

	//Select a view
	const handleViewClick = (savedView) => {
		handleMenuClose();
		setActiveView(savedView);
	};

	const handleViewToggleDefault = (savedView) => {
		//TODO Update Employee
		setCurrentUser(user => {
			if(user[`${formName}_Default_View`] && user[`${formName}_Default_View`].ID === savedView.ID) {
				return {...user, [`${formName}_Default_View`]: ""};
			}

			return {...user, [`${formName}_Default_View`]: savedView.ID};
		});
		/*
		setSavedViews(oldViews => 
			oldViews.map(oldView => {
				if(oldView.name !== savedView.name) {
					return {...oldView, isDefault: false};
				}

				//Toggle
				return {...savedView, isDefault: !savedView.isDefault };
			})
		)
		*/

		//setSaveView({ ...savedView, isDefault: !savedView.isDefault });
	};

	const handleViewToggleFavorite = (savedView) => {
		/*
		setSavedViews(oldViews => 
			oldViews.map(oldView => {
				if(oldView.name !== savedView.name) {
					return oldView;
				}

				//Toggle
				return {...savedView, isFavorite: !savedView.isFavorite };
			})
		)
		*/

		//setSaveView({ ...savedView, isFavorite: !savedView.isFavorite });
	};

	const handleMenuClose = () => {
		setAnchorEl(null);
	};

	return (
		<React.Fragment>
			<ButtonGroup size={size} variant='contained' color={color}>
				<Button onClick={() => setOpen(true)}>
					<FilterAlt /> Filters
				</Button>
				<Button size={size} onClick={(e) => setAnchorEl(e.currentTarget)}>
					<ArrowDropDown />
				</Button>
			</ButtonGroup>

			<Menu anchorEl={anchorEl} open={menuOpen} onClose={handleMenuClose}>
				{viewState &&
				Array.isArray(viewState) &&
				viewState.filter((savedView) => savedView.isFavorite)
					.length > 0 ? (
					<Box>
						<Typography
							variant='subtitle1'
							sx={{ ml: 2, mb: 1, color: 'text.secondary' }}>
							Favorites
						</Typography>
						{viewState
							.filter((savedView) => savedView.isFavorite)
							.map((savedView) => (
								<MenuItem selected={savedView.isActive} key={savedView.name}>
									<Stack direction='row' spacing={1} alignItems='center'>
										<Box>
											<Tooltip arrow placement='left' title='Default'>
												<IconButton
													size='small'
													onClick={() => handleViewToggleDefault(savedView)}>
													{savedView.isDefault ? (
														<Anchor fontSize='small' color='primary' />
													) : (
														<Anchor fontSize='small' color='disabled' />
													)}
												</IconButton>
											</Tooltip>
										</Box>
										<Box>
											<Tooltip
												arrow
												placement='right'
												title='Favorite'
												onClick={() => handleViewToggleFavorite(savedView)}>
												<IconButton size='small'>
													{savedView.isFavorite ? (
														<Star
															fontSize='small'
															sx={{ color: yellow[500] }}
														/>
													) : (
														<StarBorder
															fontSize='small'
															sx={{ color: yellow[100] }}
														/>
													)}
												</IconButton>
											</Tooltip>
										</Box>
										<Box
											sx={{ width: 200 }}
											onClick={() => handleViewClick(savedView)}>
											{savedView.Name}
										</Box>
										<Box>
											<Tooltip arrow placement='left' title='Edit'>
												<IconButton size='small'>
													<Edit fontSize='small' color='action' />
												</IconButton>
											</Tooltip>
										</Box>
									</Stack>
								</MenuItem>
							))}
						<Divider />
					</Box>
				) : null}

				{viewState && Array.isArray(viewState)
					? viewState
							.filter((savedView) => !savedView.isFavorite)
							.map((savedView) => (
								<MenuItem selected={savedView.isActive} key={savedView.ID}>
									<Stack direction='row' spacing={1} alignItems='center'>
										<Box>
											<Tooltip arrow placement='left' title='Default'>
												<IconButton
													size='small'
													onClick={() => handleViewToggleDefault(savedView)}>
													{currentUser[`${formName}_Default_View`] && savedView.ID === currentUser[`${formName}_Default_View`].ID ? (
														<Anchor fontSize='small' color='primary' />
													) : (
														<Anchor fontSize='small' color='disabled' />
													)}
												</IconButton>
											</Tooltip>
										</Box>
										{/* <Box>
											<Tooltip arrow placement='right' title='Favorite'>
												<IconButton
													size='small'
													onClick={() => handleViewToggleFavorite(savedView)}>
													{savedView.isFavorite ? (
														<Star
															fontSize='small'
															sx={{ color: yellow[500] }}
														/>
													) : (
														<StarBorder
															fontSize='small'
															sx={{ color: yellow[200] }}
														/>
													)}
												</IconButton>
											</Tooltip>
										</Box> */}
										<Box
											sx={{ width: 200 }}
											onClick={() => handleViewClick(savedView)}>
											{savedView.Name}
										</Box>
										<Box>
											<Tooltip arrow placement='left' title='Edit'>
												<IconButton size='small'>
													<Edit fontSize='small' color='action' />
												</IconButton>
											</Tooltip>
										</Box>
									</Stack>
								</MenuItem>
							))
					: null}
			</Menu>

			<Drawer
				anchor={'right'}
				open={open}
				onClose={(e) => toggleDrawer(e, false)}
				sx={{
					'& .MuiDrawer-paper': {
						display: 'flex',
						justifyContent: 'space-between',
					},
				}}>
				<Box sx={{ width: 'auto', px: 2 }} role='presentation'>
					<Typography align='center' sx={{ py: 4 }} variant='subtitle1'>
						Customized Data Filters
					</Typography>
					{activeFilters.map((op, index) => (
						<FilterRow
							key={op}
							index={index}
							columns={columns}
							criteria={(e) => console.log('filter criteria changed', e)}
						/>
					))}
					<Button
						sx={{ mt: 2 }}
						variant='contained'
						startIcon={<Add />}
						onClick={() => setActiveFilters([...activeFilters, ...['']])}>
						More
					</Button>
				</Box>
				<Stack
					direction='row'
					spacing={2}
					justifyContent='flex-end'
					sx={{ m: 2 }}>
					<Button onClick={(e) => toggleDrawer(e, false)}>Close</Button>
					<Button color='secondary'>Save as New Custom View</Button>
					<Button
						color='secondary'
						variant='contained'
						onClick={handleFilterSave}>
						Save
					</Button>
				</Stack>
			</Drawer>
		</React.Fragment>
	);
};

TableFilterManager.propTypes = {
	size: PropTypes.string,
	color: PropTypes.string,
	columns: PropTypes.array.isRequired,
	selectedOption: PropTypes.func,
};

export default TableFilterManager;
