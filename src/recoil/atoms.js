import { v4 as uuid } from 'uuid';
import { atom } from 'recoil';

export const debugState = atom({
	key: 'debugState',
	default: false,
});

export const sidenavOpenState = atom({
	key: 'sidenavOpenState',
	default: true,
});

export const navBarHeightState = atom({
	key: 'navBarHeightState',
	default: 51, //Default 64
});

export const tabBarHeightState = atom({
	key: 'tabBarHeightState',
	default: 51, //Default 64
});

export const sideNavEnabledState = atom({
	key: 'sideNavEnabledState',
	default: true,
});

export const formMaxWidthState = atom({
	key: 'formMaxWidthState',
	default: 3440,
})

export const appMaxWidthState = atom({
	key: 'appMaxWidthState',
	default: 3440,
})

export const forceRerenderState = atom({
	key: 'forceRerenderState',
	default: null,
});

export const formTypeState = atom({
	key: 'formTypeState',
	default: {
		formName: '',
		reportName: '',
		id: '',
	},
});

export const updatedFormDataState = atom({
	key: 'updatedFormDataState',
	default: null,
});

export const showChangelogToolbarState = atom({
	key: 'showChangelogToolbarState',
	default: null,
});

export const customAssemblyLineItemIdState = atom({
	key: 'customAssemblyLineItemIdState',
	default: '3860683000011716252', 
})

export const timelineState = atom({
	key: 'timelineState',
	default: null,
});

export const appBreadcrumbState = atom({
	key: 'appBreadcrumbState',
	default: [],
	/* { href: '', icon: '', label: '' }
	 */
});

export const databaseLineItemState = atom({
	key: 'databaseLineItemState',
	default: 'json', //subform
});

export const pageTypeState = atom({
	key: 'pageTypeState',
	default: null,
});

export const currentUserState = atom({
	key: 'currentUserState',
	default: {
		Theme: 'light',
		Primary_Color: '#BF97C6',
		Secondary_Color: '#F58025',
	},
});

export const themeState = atom({
	key: 'themeState',
	default: {
		palette: {
			mode: 'light',
			primary: {
				main: '#BF97C6',
			},
			secondary: {
				main: '#F58025',
			},
		},
	},
});

export const notificationsState = atom({
	key: 'notificationsState',
	default: [1, 2, 3],
});

//#region //! Experimental

export const applicationTabsState = atom({
	key: 'applicationTabsState',
	default: [
		{
			uuid: uuid(),
			label: 'Dashboard',
			type: 'dashboard',
			reportName: 'Dashboard',
		},
	]
})

//#endregion
