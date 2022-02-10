import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import {
	Box,
	Button,
	Checkbox,
	CircularProgress,
	Dialog,
	DialogActions,
	DialogTitle,
	FormControlLabel,
	IconButton,
	InputAdornment,
	TextField,
} from '@mui/material';
import { Search } from '@mui/icons-material';
import { createTheme, ThemeProvider, useTheme } from '@mui/material/styles';

const SearchField = ({
	searchBusy,
	defaultValue,
	onChange,
	fieldColor,
	buttonColor,
	disabled,
}) => {
	const [value, setValue] = useState(defaultValue);

	useEffect(() => {
		if (onChange) {
			onChange(value);
		}
	}, [value]);

	return (
		<TextField
			sx={{
				width: '30ch',
				'& label.Mui-focused': { fieldColor },
				'& .MuiInput-underline:after': {
					borderBottomColor: fieldColor,
				},
				'&.Mui-focused fieldset': {
					borderColor: fieldColor,
				},
			}}
			label='Search'
			autoFocus
			color='secondary'
			variant='standard'
			value={value}
			onChange={(e) => setValue(e.target.value)}
			disabled={disabled}
			InputProps={{
				endAdornment: (
					<InputAdornment position='end'>
						<IconButton
							sx={{
								color: buttonColor,
							}}
							size='large'>
							{searchBusy ? (
								<CircularProgress
									color='secondary'
									sx={{
										color: buttonColor,
									}}
									size={20}
								/>
							) : (
								<Search />
							)}
						</IconButton>
					</InputAdornment>
				),
			}}
		/>
	);
};

SearchField.propTypes = {
	searchBusy: PropTypes.bool,
	disabled: PropTypes.bool,
	defaultValue: PropTypes.string,
	onChange: PropTypes.func,
	fieldColor: PropTypes.string,
	buttonColor: PropTypes.string,
};

const ToolbarSearch = ({
	hidden,
	mobileMode,
	numSelected,

	//SearchProps
	searchBusy,
	disabled,
	defaultValue,
	onChange,
	ignoreActiveFilters,
	onCheckIgnoreActiveFilters,
}) => {
	const theme = useTheme();
	const [value, setValue] = useState(defaultValue);
	const [mobileSearchDialogOpen, setMobileSearchDialogOpen] = useState(false);
	const [mobileSearchTerm, setMobileSearchTerm] = useState('');

	useEffect(() => {
		if (onChange) {
			onChange(value);
		}
	}, [value]);

	const onMobileSearch = () => {
		setValue(mobileSearchTerm);
		onCloseMobileSearch();
	};

	const onOpenMobileSearch = () => {
		setMobileSearchDialogOpen(true);
	};

	const onCloseMobileSearch = () => {
		setMobileSearchDialogOpen(false);
	};

	//<Box sx={{ visibility: hidden ? 'hidden' : 'visible' }}>

	return (
		<Box sx={{ display: hidden ? 'none' : 'block' }}>
			<ThemeProvider
				theme={createTheme({
					palette: {
						mode:
							numSelected === 0 && theme.palette.mode === 'dark'
								? 'dark'
								: 'light',
						primary: theme.palette.primary,
						secondary: theme.palette.secondary,
					},
				})}>
				<>
					{!mobileMode ? (
						<Box sx={{ display: 'flex' }}>
							<SearchField
								searchBusy={searchBusy}
								defaultValue={defaultValue || ''}
								onChange={onChange}
								fieldColor={
									numSelected === 0 && theme.palette.mode === 'dark'
										? 'common.white'
										: 'common.black'
								}
								buttonColor={
									numSelected > 0 ? 'secondary.contrastText' : 'text.primary'
								}
								disabled={disabled}
							/>
							<FormControlLabel
								sx={{
									ml: 2,
									color:
										numSelected === 0 && theme.palette.mode === 'dark'
											? 'common.white'
											: 'common.black',
								}}
								disabled={searchBusy}
								control={
									<Checkbox
										checked={ignoreActiveFilters}
										onChange={(e) =>
											onCheckIgnoreActiveFilters(e.target.checked)
										}
										color='secondary'
										sx={{
											'&.Mui-checked': {
												color:
													numSelected > 0
														? 'secondary.contrastText'
														: 'secondary.main',
											},
										}}
									/>
								}
								label='Ignore Active Filters'
							/>
						</Box>
					) : (
						<IconButton
							onClick={onOpenMobileSearch}
							sx={{
								color:
									numSelected > 0 ? 'secondary.contrastText' : 'text.primary',
							}}
							size='large'>
							{searchBusy ? (
								<CircularProgress
									color='secondary'
									sx={{
										color: numSelected > 0 ? 'common.black' : 'secondary',
									}}
									size={20}
								/>
							) : (
								<Search />
							)}
						</IconButton>
					)}
				</>
			</ThemeProvider>

			{mobileMode ? (
				<Dialog
					onClose={onCloseMobileSearch}
					open={mobileSearchDialogOpen}
					maxWidth='xl'
					PaperProps={{ sx: { position: 'fixed', top: 0, mt: 6 } }}>
					<DialogTitle>Enter a search term</DialogTitle>
					<Box sx={{ width: '100%', p: 4 }}>
						<SearchField
							searchBusy={searchBusy}
							defaultValue={defaultValue}
							onChange={setMobileSearchTerm}
							fieldColor={
								numSelected === 0 && theme.palette.mode === 'dark'
									? 'common.white'
									: 'common.black'
							}
							buttonColor={
								numSelected > 0 ? 'secondary.contrastText' : 'text.primary'
							}
							disabled={disabled}
						/>
					</Box>
					<DialogActions>
						<Button onClick={onCloseMobileSearch}>Close</Button>
						<Button
							color='secondary'
							variant='contained'
							onClick={onMobileSearch}>
							Search
						</Button>
					</DialogActions>
				</Dialog>
			) : null}
		</Box>
	);
};

ToolbarSearch.propTypes = {
	mobileMode: PropTypes.bool,
	numSelected: PropTypes.number.isRequired,
	searchBusy: PropTypes.bool,
	hidden: PropTypes.bool,
	disabled: PropTypes.bool,
	defaultValue: PropTypes.string,
	onChange: PropTypes.func,

	ignoreActiveFilters: PropTypes.bool,
	onCheckIgnoreActiveFilters: PropTypes.func,
};

ToolbarSearch.defaultProps = {
	numSelected: 0,
	defaultValue: null,

	onCheckIgnoreActiveFilters: () => {},
};

export default React.memo(ToolbarSearch);
