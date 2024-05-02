export type FormErrors = Partial<Record<keyof IOrder, string>>;

export interface IOrderResult {
	id: string[];
	total: number;
	error?: string;
}

export interface IProduct {
	id: string;
	title: string;
	image: string;
	price: number | null;
	description: string;
	category: string;
}

export interface Products {
	total: number;
	items: IProduct[];
}

export interface IOrder {
	payment: string;
	email: string;
	phone: string;
	address: string;
	total: number;
	items: string[];
}

export interface IWebLakerApi {
	getProducts: () => Promise<Products>;
	getProduct: (id: string) => Promise<IProduct>;
	createOrder: (order: IOrder) => Promise<IOrderResult>;
}

export const Events = {
	['ITEMS_CHANGED']: 'items:changed',
	['ADD_PRODUCT']: 'cart:add-product',
	['REMOVE_PRODUCT']: 'cart:remove-product',
	['CREATE_ORDER']: 'cart:create_order',
	['OPEN_PREVIEW']: 'product:open-preview',
	['CHANGED_PREVIEW']: 'product:changed-preview',
	['BASKET_OPEN']: 'cart:open',
	['FORM_ERRORS_CHANGE']: 'formErrors:changed',
	['ORDER_OPEN']: 'order:open',
	['SET_PAYMENT_TYPE']: 'order:setPaymentType',
	['MODAL_OPEN']: 'modal:open',
	['MODAL_CLOSE']: 'modal:close',
	['CLEAR_ORDER']: 'clear:order',
};
