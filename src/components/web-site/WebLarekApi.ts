import { Api } from '../base/api';
import {
	IWebLakerApi,
	Products,
	IOrderResult,
	IProduct,
	IOrder,
} from '../../types/index';

export default class WebLarekApi extends Api implements IWebLakerApi {
	constructor(baseUrl: string, options?: RequestInit) {
		super(baseUrl, options);
	}

	async getProducts(): Promise<Products> {
		return (await this.get('/product/')) as Products;
	}

	async getProduct(id: string): Promise<IProduct> {
		return (await this.get(`/product/${id}`)) as IProduct;
	}

	async createOrder(order: IOrder): Promise<IOrderResult> {
		return (await this.post('/order', order)) as IOrderResult;
	}
}
