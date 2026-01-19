import type { SnapGuide } from '$lib/snap/types';

export class UIStore {
	private _baseCursor = $state('default');
	private _overrideCursor = $state<string | null>(null);
	private _snapGuides = $state<SnapGuide[]>([]);

	readonly cursor = $derived(this._overrideCursor ?? this._baseCursor);
	readonly snapGuides = $derived(this._snapGuides);

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
	}

	clearSnapGuides() {
		this._snapGuides = [];
	}
}
