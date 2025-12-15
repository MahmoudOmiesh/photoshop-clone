export class CursorManager {
	private baseCursor = $state('default');
	private overrideCursor = $state<string | null>(null);

	get cursor() {
		return this.overrideCursor ?? this.baseCursor;
	}

	setBase(cursor: string) {
		this.baseCursor = cursor;
	}

	setOverride(cursor: string) {
		this.overrideCursor = cursor;
	}

	clearOverride() {
		this.overrideCursor = null;
	}
}
