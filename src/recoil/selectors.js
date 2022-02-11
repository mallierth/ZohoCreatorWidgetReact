import { selector } from 'recoil';
import { applicationTabsState, currentUserState, themeState } from './atoms';

export const autoHideNavigationState = selector({
	key: 'autoHideNavigationState',
	get: ({ get }) => {
		const currentUser = get(currentUserState);
		return (
			currentUser?.Autohide_Nav_Drawer === true ||
			currentUser?.Autohide_Nav_Drawer === 'true'
		);
	},
});

export const currentUserIdState = selector({
	key: 'currentUserIdState',
	get: ({ get }) => {
		const currentUser = get(currentUserState);
		return currentUser?.ID;
	},
});

export const currentUserNameState = selector({
	key: 'currentUserNameState',
	get: ({ get }) => {
		const currentUser = get(currentUserState);
		return currentUser?.Full_Name;
	},
});

export const currentUserIsAdminState = selector({
	key: 'currentUserIsAdminState',
	get: ({ get }) => {
		const currentUser = get(currentUserState);
		return Boolean(currentUser?.Admin === true || currentUser?.Admin === 'true');
	},
});

export const currentUserIsHelpAdminState = selector({
	key: 'currentUserIsHelpAdminState',
	get: ({ get }) => {
		const currentUser = get(currentUserState);
		return Boolean(currentUser?.Help_Documents_Admin === true || currentUser?.Help_Documents_Admin === 'true');
	},
});

export const currentUserThemeModeState = selector({
	key: 'currentUserThemeModeState',
	get: ({ get }) => {
		const currentUser = get(currentUserState);
		return currentUser.Theme;
	},
});

export const currentUserPrimaryColorState = selector({
	key: 'currentUserPrimaryColorState',
	get: ({ get }) => {
		const currentUser = get(currentUserState);
		return currentUser.Primary_Color;
	},
});

export const currentUserSecondaryColorState = selector({
	key: 'currentUserSecondaryColorState',
	get: ({ get }) => {
		const currentUser = get(currentUserState);
		return currentUser.Secondary_Color;
	},
});

export const applicationTabLastUuidState = selector({
	key: 'applicationTabLastUuidState',
	get: ({ get }) => {
		const applicationTabs = get(applicationTabsState);
		return applicationTabs[applicationTabs.length - 1].uuid;
	},
});

export const activeApplicationTabState = selector({
	key: 'activeApplicationTabState',
	get: ({ get }) => {
		const applicationTabs = get(applicationTabsState);

		if(applicationTabs.filter(tab => tab.active === true).length === 1){
			return applicationTabs.filter(tab => tab.active === true)[0].uuid;
		}

		return applicationTabs[applicationTabs.length - 1].uuid;
	},
});

export const themeModeState = selector({
	key: 'themeModeState',
	get: ({ get }) => {
		const theme = get(themeState);
		return theme.palette.mode;
	},
});

export const themePrimaryColorState = selector({
	key: 'themePrimaryColorState',
	get: ({ get }) => {
		const theme = get(themeState);
		return theme.palette.primary.main;
	},
});

export const themeSecondaryColorState = selector({
	key: 'themeSecondaryColorState',
	get: ({ get }) => {
		const theme = get(themeState);
		return theme.palette.secondary.main;
	},
});
