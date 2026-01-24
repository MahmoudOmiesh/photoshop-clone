import type { Editor } from '../editor.svelte';
import type { Composition } from '$lib/document/composition.svelte';
import type { Layer } from '$lib/document/layers/base-layer.svelte';
import type { RasterLayer } from '$lib/document/layers/raster-layer';
import type { Command } from '$lib/document/commands/command';

export class DocumentManager {
	private _composition = $state<Composition | null>(null);

	constructor(public readonly editor: Editor) {}

	get composition() {
		return this._composition;
	}

	get layers(): Layer[] {
		return this._composition?.layers ?? [];
	}

	get activeLayers(): Layer[] {
		return this._composition?.activeLayers ?? [];
	}

	get activeRasterLayers(): RasterLayer[] {
		return this.activeLayers.filter((layer): layer is RasterLayer => layer.type === 'raster');
	}

	attachComposition(composition: Composition) {
		this._composition = composition;
		this.editor.requestRender();
	}

	getLayerById(id: string): Layer | null {
		return this._composition?.layers.find((layer) => layer.id === id) ?? null;
	}

	isLayerActive(layerId: string): boolean {
		return this._composition?.isLayerActive(layerId) ?? false;
	}

	activateLayer(layerId: string, options?: { destructive: boolean }) {
		this._composition?.activateLayer(layerId, options);
	}

	executeCommand(command: Command) {
		this.editor.history.execute(command);
	}
}
