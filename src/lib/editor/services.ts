import type { Command } from '$lib/document/commands/command';
import type { Composition } from '$lib/document/composition.svelte';
import type { Layer } from '$lib/document/layers/base-layer.svelte';
import type { RasterLayer } from '$lib/document/layers/raster-layer';
import type { SnapResult, SnapTarget, SnapGuide } from '$lib/snap/types';
import type { Point, Bounds } from '$lib/stores/viewport.svelte';

export interface DocumentQueries {
	readonly composition: Composition | null;
	readonly layers: Layer[];
	readonly activeLayers: Layer[];
	readonly activeRasterLayers: RasterLayer[];
	getLayerById(id: string): Layer | null;
}

export interface ViewportQueries {
	readonly scale: number;
	readonly zoomPercentage: string;
	screenToCanvas(point: Point): Point;
	canvasToScreen(point: Point): Point;
	getCompositionBounds(): Bounds | null;
	getLayerBounds(layer: RasterLayer): Bounds | null;
}

export interface SnapQueries {
	calculateSnap(target: SnapTarget): SnapResult | null;
}

export interface ToolQueries {
	getOptionValue<T>(key: string): T;
}

export interface EditorActions {
	executeCommand(command: Command): void;
	undo(): void;
	redo(): void;

	pan(delta: Point): void;
	zoomTo(scale: number, pivot?: Point): void;
	zoomBy(factor: number, pivot?: Point): void;
	zoomIn(pivot?: Point): void;
	zoomOut(pivot?: Point): void;

	setBaseCursor(cursor: string): void;
	setOverrideCursor(cursor: string): void;
	clearOverrideCursor(): void;

	setSnapGuides(guides: SnapGuide[]): void;
	clearSnapGuides(): void;

	requestRender(): void;
}

export interface EditorServices {
	readonly document: DocumentQueries;
	readonly viewport: ViewportQueries;
	readonly snap: SnapQueries;
	readonly tool: ToolQueries;
	readonly actions: EditorActions;
}
