import { SvelteSet } from 'svelte/reactivity';
import type { Layer } from './layers/base-layer.svelte';

interface CompositionConfig {
	width: number;
	height: number;
	dpi: number;
}

export class Composition {
	private width: number;
	private height: number;
	private dpi: number;

	private _layers: Layer[] = $state([]);
	private activeLayerIds: Set<string> = new SvelteSet();

	private offscreenCanvas: OffscreenCanvas;
	private offscreenCanvasContext: OffscreenCanvasRenderingContext2D;

	private renderCallback: (() => void) | null = null;

	constructor(config: CompositionConfig) {
		this.width = config.width;
		this.height = config.height;
		this.dpi = config.dpi;

		this.offscreenCanvas = new OffscreenCanvas(this.width, this.height);

		const offscreenCanvasContext = this.offscreenCanvas.getContext('2d');
		if (!offscreenCanvasContext) {
			throw new Error('Failed to get canvas context');
		}

		this.offscreenCanvasContext = offscreenCanvasContext;
	}

	// === Layers ===
	get layers() {
		return this._layers;
	}
	get activeLayers() {
		return this._layers.filter((layer) => this.activeLayerIds.has(layer.id));
	}

	isLayerActive(layerId: string) {
		return this.activeLayerIds.has(layerId);
	}

	addLayer(layer: Layer) {
		layer.setRenderCallback(() => this.requestRerender());
		this._layers.push(layer);
		this.activateLayer(layer.id, {
			destructive: true
		});
		this.requestRerender();
	}
	removeLayer(layerId: string) {
		this._layers = this._layers.filter((layer) => layer.id !== layerId);
		this.activeLayerIds.delete(layerId);

		if (this.activeLayerIds.size === 0 && this._layers.length > 0) {
			this.activeLayerIds.add(this._layers[0]!.id);
		}

		this.requestRerender();
	}

	activateLayer(layerId: string, config?: { destructive: boolean }) {
		if (config?.destructive) {
			this.activeLayerIds.clear();
		}

		this.activeLayerIds.add(layerId);
	}

	// Rendering
	private requestRerender() {
		this.renderCallback?.();
	}

	private render() {
		const offscreenCtx = this.offscreenCanvasContext;
		offscreenCtx.clearRect(0, 0, this.width, this.height);

		for (const layer of this.layers) {
			if (!layer.isVisible) continue;
			layer.renderTo(offscreenCtx);
		}
	}

	setRenderCallback(callback: () => void) {
		this.renderCallback = callback;
	}

	getImageBitmap() {
		this.render();
		return this.offscreenCanvas.transferToImageBitmap();
	}
}
