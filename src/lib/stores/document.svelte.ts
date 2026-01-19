import type { Command, CommandContext } from '$lib/document/commands/command';
import { History } from '$lib/document/commands/history.svelte';
import type { Composition } from '$lib/document/composition.svelte';
import type { RasterLayer } from '$lib/document/layers/raster-layer';

export interface DocumentStoreCallbacks {
	onCompositionAttached?: (composition: Composition) => void;
	onDocumentChanged?: () => void;
}

export class DocumentStore {
	private _composition = $state<Composition | null>(null);
	private _history = new History();
	private callbacks: DocumentStoreCallbacks = {};

	get composition() {
		return this._composition;
	}

	get layers() {
		return this._composition?.layers ?? [];
	}
	get activeLayers() {
		return this._composition?.activeLayers ?? [];
	}

	get activeRasterLayers() {
		return this.activeLayers.filter((layer): layer is RasterLayer => layer.type === 'raster');
	}

	setCallbacks(callbacks: DocumentStoreCallbacks) {
		this.callbacks = callbacks;
	}

	attachComposition(composition: Composition) {
		this._composition = composition;
		this.callbacks.onCompositionAttached?.(composition);
		this.callbacks.onDocumentChanged?.();
	}

	getLayerById(id: string) {
		return this._composition?.layers.find((layer) => layer.id === id) ?? null;
	}

	isLayerActive(layerId: string): boolean {
		return this._composition?.isLayerActive(layerId) ?? false;
	}

	activateLayer(layerId: string, options?: { destructive: boolean }) {
		this._composition?.activateLayer(layerId, options);
	}

	executeCommand(command: Command) {
		if (!this._composition) return;

		const ctx: CommandContext = { composition: this._composition };
		this._history.execute(command, ctx);
		this.callbacks.onDocumentChanged?.();
	}

	undo() {
		if (!this._composition) return;

		const ctx: CommandContext = { composition: this._composition };
		this._history.undo(ctx);
		this.callbacks.onDocumentChanged?.();
	}

	redo() {
		if (!this._composition) return;

		const ctx: CommandContext = { composition: this._composition };
		this._history.redo(ctx);
		this.callbacks.onDocumentChanged?.();
	}
}
