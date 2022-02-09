import { atom } from 'recoil';

const printFieldsState = atom({
	key: 'printFieldsState',
	default: {
		Quotes: [
			{
				label: 'Attention',
				helperText: '',
				multiline: false,
				section: 'topLeft',
			},
			{
				label: 'Account Name',
				helperText: '',
				multiline: false,
				section: 'topLeft',
			},
			{
				label: 'Address',
				helperText: '',
				multiline: true,
				section: 'topLeft',
			},
			{
				label: 'Description',
				helperText: '',
				multiline: false,
				section: 'topRight',
			},
			{
				label: 'Terms',
				helperText: '',
				multiline: false,
				section: 'topRight',
			},
			{
				label: 'Reference',
				helperText: '',
				multiline: false,
				section: 'topRight',
			},
			{
				label: 'Comment',
				helperText: '',
				multiline: false,
				section: 'topRight',
			},
            {
				label: 'Include Line Item Details',
				helperText: 'Product Name/Code',
				multiline: false,
				section: 'lineItemDetailSelect',
			},
			{
				label: 'Customer Notes',
				helperText: '',
				richText: true,
				section: 'bottom',
			},
			{
				label: 'Terms & Conditions',
				helperText: '',
				richText: true,
				section: 'bottom',
			},
		],
		Purchase_Orders: [
			{
				label: 'Attention',
				helperText: '',
				multiline: false,
				section: 'topLeft',
			},
			{
				label: 'Street',
				helperText: '',
				multiline: false,
				section: 'topLeft',
			},
			{
				label: 'Street 2',
				helperText: '',
				multiline: false,
				section: 'topLeft',
			},
			{
				label: 'City',
				helperText: '',
				multiline: false,
				section: 'topLeft',
			},
			{
				label: 'State',
				helperText: '',
				multiline: false,
				section: 'topLeft',
			},
			{
				label: 'Zip Code',
				helperText: '',
				multiline: false,
				section: 'topLeft',
			},
			{
				label: 'Vendor',
				helperText: '',
				multiline: false,
				section: 'topRight',
			},
			{
				label: 'Date',
				helperText: '',
				multiline: false,
				section: 'topRight',
			},
			{
				label: 'Terms',
				helperText: '',
				multiline: false,
				section: 'topRight',
			},
			{
				label: 'Shipping Priority',
				helperText: '',
				multiline: false,
				section: 'topRight',
			},
			{
				label: 'Reference',
				helperText: '',
				multiline: false,
				section: 'topRight',
			},
			{
				label: 'Comment',
				helperText: '',
				multiline: false,
				section: 'topRight',
			},
            {
				label: 'Include Line Item Details',
				helperText: 'Product Name/Code',
				multiline: false,
				section: 'lineItemDetailSelect',
			},
			{
				label: 'Customer Notes',
				helperText: '',
				richText: true,
				section: 'bottom',
			},
			{
				label: 'Terms & Conditions',
				helperText: '',
				richText: true,
				section: 'bottom',
			},
		],
		Sales_Orders: [
			{
				label: 'Attention',
				helperText: '',
				multiline: false,
				section: 'topLeft',
			},
			{
				label: 'Account Name',
				helperText: '',
				multiline: false,
				section: 'topLeft',
			},
			{
				label: 'Address',
				helperText: '',
				multiline: true,
				section: 'topLeft',
			},
			{
				label: 'Description',
				helperText: '',
				multiline: false,
				section: 'topRight',
			},
			{
				label: 'Terms',
				helperText: '',
				multiline: false,
				section: 'topRight',
			},
			{
				label: 'Reference',
				helperText: '',
				multiline: false,
				section: 'topRight',
			},
			{
				label: 'Comment',
				helperText: '',
				multiline: false,
				section: 'topRight',
			},
            {
				label: 'Include Line Item Details',
				helperText: 'Product Name/Code',
				multiline: false,
				section: 'lineItemDetailSelect',
			},
			{
				label: 'Customer Notes',
				helperText: '',
				richText: true,
				section: 'bottom',
			},
			{
				label: 'Terms & Conditions',
				helperText: '',
				richText: true,
				section: 'bottom',
			},
		],
	}
})

export default printFieldsState;