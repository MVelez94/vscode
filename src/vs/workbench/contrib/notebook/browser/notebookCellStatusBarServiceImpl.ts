/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { CancellationToken } from 'vs/base/common/cancellation';
import { onUnexpectedExternalError } from 'vs/base/common/errors';
import { Emitter, Event } from 'vs/base/common/event';
import { Disposable, IDisposable2, toDisposable } from 'vs/base/common/lifecycle';
import { URI } from 'vs/base/common/uri';
import { INotebookCellStatusBarService } from 'vs/workbench/contrib/notebook/common/notebookCellStatusBarService';
import { INotebookCellStatusBarItemList, INotebookCellStatusBarItemProvider } from 'vs/workbench/contrib/notebook/common/notebookCommon';

export class NotebookCellStatusBarService extends Disposable implements INotebookCellStatusBarService {

	private _onDidChangeProviders = new Emitter<void>();
	readonly onDidChangeProviders: Event<void> = this._onDidChangeProviders.event;

	private _onDidChangeItems = new Emitter<void>();
	readonly onDidChangeItems: Event<void> = this._onDidChangeItems.event;

	private _providers: INotebookCellStatusBarItemProvider[] = [];

	constructor() {
		super();
	}

	registerCellStatusBarItemProvider(provider: INotebookCellStatusBarItemProvider): IDisposable2 {
		this._providers.push(provider);
		let changeListener: IDisposable2 | undefined;
		if (provider.onDidChangeStatusBarItems) {
			changeListener = provider.onDidChangeStatusBarItems(() => this._onDidChangeItems.fire());
		}

		this._onDidChangeProviders.fire();

		return toDisposable(() => {
			changeListener?.dispose();
			const idx = this._providers.findIndex(p => p === provider);
			this._providers.splice(idx, 1);
		});
	}

	async getStatusBarItemsForCell(docUri: URI, cellIndex: number, viewType: string, token: CancellationToken): Promise<INotebookCellStatusBarItemList[]> {
		const providers = this._providers.filter(p => p.viewType === viewType || p.viewType === '*');
		return await Promise.all(providers.map(async p => {
			try {
				return await p.provideCellStatusBarItems(docUri, cellIndex, token) ?? { items: [] };
			} catch (e) {
				onUnexpectedExternalError(e);
				return { items: [] };
			}
		}));
	}

	readonly _serviceBrand: undefined;
}
