/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { IDisposable2, IReference, trackDisposable } from 'vs/base/common/lifecycle';

export function createDisposableRef<T>(object: T, disposable?: IDisposable2): IReference<T> {
	return {
		object,
		dispose: () => disposable?.dispose(),
	};
}

// TODO: merge this class into Matt's MutableDisposable.
/**
 * Manages the lifecycle of a disposable value that may be changed.
 *
 * This ensures that when the disposable value is changed, the previously held disposable is disposed of. You can
 * also register a `MutableDisposable` on a `Disposable` to ensure it is automatically cleaned up.
 */
export class MutableDisposable<T extends IDisposable2> implements IDisposable2 {
	private _value?: T;
	private _isDisposed = false;

	constructor() {
		trackDisposable(this);
	}

	get value(): T | undefined {
		return this._isDisposed ? undefined : this._value;
	}

	set value(value: T | undefined) {
		if (this._isDisposed || value === this._value) {
			return;
		}

		this._value?.dispose();
		this._value = value;
	}

	clear() {
		this.value = undefined;
	}

	dispose(): void {
		this._isDisposed = true;
		this._value?.dispose();
		this._value = undefined;
	}

	replace(newValue: T | undefined): T | undefined {
		const oldValue = this._value;
		this._value = newValue;
		return oldValue;
	}
}
