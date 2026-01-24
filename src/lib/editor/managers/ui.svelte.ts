import type { Editor } from '../editor.svelte';
import type { SnapGuide } from '$lib/canvas/types';

export class UIManager {
	private _baseCursor = $state('default');
	private _overrideCursor = $state<string | null>(null);
	private _snapGuides: SnapGuide[] = [];

	constructor(public readonly editor: Editor) {}

	get cursor() {
		return this._overrideCursor ?? this._baseCursor;
	}
	get snapGuides() {
		return this._snapGuides;
	}

	setBaseCursor(cursor: string) {
		this._baseCursor = cursor;
	}

	setOverrideCursor(cursor: string) {
		this._overrideCursor = cursor;
	}

	clearOverrideCursor() {
		this._overrideCursor = null;
	}

	setSnapGuides(guides: SnapGuide[]) {
		this._snapGuides = guides;
		this.editor.requestRender();
	}

	clearSnapGuides() {
		this._snapGuides = [];
		this.editor.requestRender();
	}
}
