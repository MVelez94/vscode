/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { IDisposable2 } from 'vs/base/common/lifecycle';

export interface ITerminalWidget extends IDisposable2 {
	/**
	 * Only one widget of each ID can be displayed at once.
	 */
	id: string;
	attach(container: HTMLElement): void;
}
