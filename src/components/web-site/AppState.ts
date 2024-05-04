import { Model } from '../base/Model';
import { Events, FormErrors, IOrder } from '../../types/index';

export interface IProduct {
	id: string;
	title: string;
	price: number;
	description: string;
	image: string;
	category: string;
	status: boolean;
}

export type CatalogChangeEvent = {
	catalog: IProduct[];
};

export class AppState extends Model<AppState> {
	basket: string[] = [];
	catalog: IProduct[] = [];
	order = {
		email: '',
		phone: '',
		payment: null as null | string,
		address: '',
		total: 0,
		items: [],
	} as IOrder;
	preview: string | null;
	formErrors: FormErrors = {};

	addProductInBasket(item: IProduct) {
		if (this.basket.includes(item.id)) return;
		this.basket.push(item.id);
		this.emitChanges(Events.ITEMS_CHANGED, { catalog: this.catalog });
	}

	removeProductFromBasket(item: IProduct) {
		if (!this.basket.includes(item.id)) return;
		const index = this.basket.findIndex((i) => i === item.id);
		this.basket.splice(index, 1);
		this.emitChanges(Events.BASKET_OPEN, { catalog: this.catalog });
		this.emitChanges(Events.ITEMS_CHANGED, { catalog: this.catalog });
	}

	getBusket() {
		return this.catalog.filter((item) => this.basket.includes(item.id));
	}

	setPreview(item: IProduct) {
		this.preview = item.id;
		this.emitChanges(Events.CHANGED_PREVIEW, item);
	}

	setCatalog(data: { items: IProduct[]; total: number }) {
		const { items } = data;
		this.catalog = [...items];
		this.emitChanges(Events.ITEMS_CHANGED, { catalog: this.catalog });
	}

	getTotalPrice() {
		return this.basket.reduce(
			(a, c) => a + this.catalog.find((it) => it.id === c).price,
			0
		);
	}

	clearBasket() {
		this.basket = [];
		this.emitChanges(Events.ITEMS_CHANGED, { catalog: this.catalog });
	}

	setOrderField(field: keyof Omit<IOrder, 'items' | 'total'>, value: string) {
		this.order[field] = value;
		if (this.validateOrder(field)) {
			this.events.emit('order:ready', this.order);
		}
	}

	validateOrder(field: keyof IOrder) {
		const errors: typeof this.formErrors = {};
		if (field !== 'address' && field !== 'payment') {
			if (!this.order.email) errors.email = 'Необходимо указать email';
			if (!this.order.phone) errors.phone = 'Необходимо указать телефон';
		} else if (!this.order.address) errors.address = 'Необходимо указать адрес';
		else if (!this.order.payment)
			errors.address = 'Необходимо выбрать тип оплаты';
		this.formErrors = errors;
		this.events.emit(Events.FORM_ERRORS_CHANGE, this.formErrors);
		return Object.keys(errors).length === 0;
	}

	clearOrder() {
		this.order = {
			payment: null,
			address: '',
			email: '',
			phone: '',
			total: 0,
			items: [],
		};
	}
}