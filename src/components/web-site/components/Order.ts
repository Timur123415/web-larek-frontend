import { Form } from '../components/Form';
import { Events, IOrder } from '../../../types';
import { IEvents } from '../../base/Events';
export class Order extends Form<IOrder> {
	protected _altButtons;

	constructor(container: HTMLFormElement, events: IEvents) {
		super(container, events);

		this._altButtons = Array.from(
			container.querySelectorAll('.button_alt')
		) as HTMLButtonElement[];

		if (this._altButtons.length) {
			this._altButtons.forEach((button) => {
				button.addEventListener('click', () => {
					this._altButtons.forEach((button) => {
						button.classList.toggle('button_alt-active', false);
					});
					button.classList.toggle('button_alt-active', true);
					this.payment = button.name;
				});
			});
		}
	}

	set phone(value: string) {
		(this.container.elements.namedItem('phone') as HTMLInputElement).value =
			value;
	}

	set email(value: string) {
		(this.container.elements.namedItem('email') as HTMLInputElement).value =
			value;
	}

	set address(value: string) {
		(this.container.elements.namedItem('address') as HTMLInputElement).value =
			value;
	}

	set payment(value: string) {
		this.events.emit(Events.SET_PAYMENT_TYPE, { paymentType: value });
	}
}