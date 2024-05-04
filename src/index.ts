import './scss/styles.scss';
import WebLarekApi from './components/web-site/WebLarekApi';
import { API_URL, CDN_URL } from './utils/constants';

import { Events, IOrder } from './types';

import { cloneTemplate, createElement, ensureElement } from './utils/utils';
import {
	AppState,
	CatalogChangeEvent,
	IProduct,
} from './components/web-site/AppState';
import { Page } from './components/web-site/components/Page';
import { Modal } from './components/web-site/components/Modal';
import { Cart } from './components/web-site/components/Basket';
import { Order } from './components/web-site/components/Order';

const api = new WebLarekApi(API_URL);
import EventEmitter from './components/base/Events';
import { BasketItem, CatalogItem } from './components/web-site/components/Product';
import { Success } from './components/web-site/components/Success';

EventEmitter.onAll(({ eventName, data }) => {
	console.log(eventName, data);
});


const successOrderTemplate = ensureElement<HTMLTemplateElement>('#success');
const cardCatalogTemplate = ensureElement<HTMLTemplateElement>('#card-catalog');
const cardPreviewTemplate = ensureElement<HTMLTemplateElement>('#card-preview');
const cardBasketTemplate = ensureElement<HTMLTemplateElement>('#card-basket');
const basketTemplate = ensureElement<HTMLTemplateElement>('#basket');
const orderTemplate = ensureElement<HTMLTemplateElement>('#order');
const contactsTemplate = ensureElement<HTMLTemplateElement>('#contacts');

const appData = new AppState({}, EventEmitter);


const page = new Page(document.body, EventEmitter);
const modal = new Modal(
	ensureElement<HTMLElement>('#modal-container'),
	EventEmitter
);

const basket = new Cart(cloneTemplate(basketTemplate), EventEmitter);
let order: Order = null;


EventEmitter.on<CatalogChangeEvent>(Events.ITEMS_CHANGED, () => {
	page.catalog = appData.catalog.map((item) => {
		const product = new CatalogItem(cloneTemplate(cardCatalogTemplate), {
			onClick: () => EventEmitter.emit(Events.OPEN_PREVIEW, item),
		});

		return product.render({
			title: item.title,
			image: CDN_URL + item.image,
			description: item.description,
			price: item.price !== null ? item.price.toString() + ' синапсов' : '',
			category: item.category,
		});
	});

	page.counter = appData.getBusket().length;
});

EventEmitter.on(Events.OPEN_PREVIEW, (item: IProduct) => {
	appData.setPreview(item);
});

EventEmitter.on(Events.CHANGED_PREVIEW, (item: IProduct) => {
	const card = new CatalogItem(cloneTemplate(cardPreviewTemplate), {
		onClick: () => EventEmitter.emit(Events.ADD_PRODUCT, item),
	});

	modal.render({
		content: card.render({
			title: item.title,
			image: CDN_URL + item.image,
			description: item.description,
			category: item.category,
			price: item.price !== null ? item.price?.toString() + ' синапсов' : '',
			status: {
				status: item.price === null || appData.basket.includes(item.id),
			},
		}),
	});
});

EventEmitter.on(Events.ADD_PRODUCT, (item: IProduct) => {
	appData.addProductInBasket(item);
	modal.close();
});

EventEmitter.on(Events.BASKET_OPEN, () => {
	const items = appData.getBusket().map((item, index) => {
		const product = new BasketItem(cloneTemplate(cardBasketTemplate), {
			onClick: () => EventEmitter.emit(Events.REMOVE_PRODUCT, item),
		});
		return product.render({
			index: index + 1,
			title: item.title,
			description: item.description,
			price: item.price?.toString() || '0',
			category: item.category,
		});
	});
	modal.render({
		content: createElement<HTMLElement>('div', {}, [
			basket.render({
				items,
				total: appData.getTotalPrice(),
			}),
		]),
	});
});


EventEmitter.on(Events.REMOVE_PRODUCT, (item: IProduct) => {
	appData.removeProductFromBasket(item);
});

EventEmitter.on(/(^order|^contacts):submit/, () => {
	if (!appData.order.email || !appData.order.address || !appData.order.phone)
		return EventEmitter.emit('order:open');
	const items = appData.getBusket();
	api
		.createOrder({
			...appData.order,
			items: items.map((i) => i.id),
			total: appData.getTotalPrice(),
		})
		.then((result) => {
			const success = new Success(cloneTemplate(successOrderTemplate), {
				onClick: () => {
					modal.close();
					EventEmitter.emit(Events.CLEAR_ORDER);
				},
			});

			modal.render({
				content: success.render({
					title: !result.error ? 'Заказ оформлен' : 'Ошибка оформления заказа',
					description: !result.error
						? `Списано ${result.total} синапсов`
						: result.error,
				}),
			});
		})
		.catch((err) => {
			console.error(err);
		})
		.finally(() => {
			
		});
});


EventEmitter.on(Events.CLEAR_ORDER, () => {
	appData.clearBasket();
	appData.clearOrder();
});

EventEmitter.on(Events.FORM_ERRORS_CHANGE, (errors: Partial<IOrder>) => {
	const { email, phone, address, payment } = errors;
	order.valid = !address && !email && !phone && !payment;
	order.errors = Object.values(errors)
		.filter((i) => !!i)
		.join('; ');
});


EventEmitter.on(
	/(^order|^contacts)\..*:change/,
	(data: { field: keyof Omit<IOrder, 'items' | 'total'>; value: string }) => {
		appData.setOrderField(data.field, data.value);
	}
);

EventEmitter.on(Events.ORDER_OPEN, () => {
	if (order) order = null;
	const step = !appData.order.address && !appData.order.payment ? 0 : 1;
	order = new Order(
		cloneTemplate(!step ? orderTemplate : contactsTemplate),
		EventEmitter
	);
	const data = !step ? { address: '' } : { phone: '', email: '' };
	modal.render({
		content: order.render({
			...data,
			valid: false,
			errors: [],
		}),
	});
});

EventEmitter.on(Events.SET_PAYMENT_TYPE, (data: { paymentType: string }) => {
	appData.setOrderField('payment', data.paymentType);
});


EventEmitter.on(Events.MODAL_OPEN, () => {
	page.locked = true;
});


EventEmitter.on(Events.MODAL_CLOSE, () => {
	page.locked = false;
});

api
	.getProducts()
	.then(appData.setCatalog.bind(appData))
	.catch((err) => {
		console.error(err);
	});

