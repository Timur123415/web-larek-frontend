import { IEvents } from './events';

export const isView = (obj: unknown): obj is View<any> => {
	return obj instanceof View;
};

export abstract class View<T> {
	constructor(data: Partial<T>, protected events: IEvents) {
		Object.assign(this, data);
	}

	emitChanges(event: string, payload?: object) {
		this.events.emit(event, payload ?? {});
	}


}
