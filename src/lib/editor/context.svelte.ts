import { getContext, setContext } from 'svelte';
import { DocumentStore, UIStore, ViewportStore } from '$lib/stores';
import { ToolStore } from '$lib/tools/tool-store.svelte';
import { SnapManager } from '$lib/snap/snap-manager';
import type { EditorServices } from './services';

const CONTEXT_KEY = Symbol('editor');

export interface EditorContext {
	documentStore: DocumentStore;
	viewportStore: ViewportStore;
	uiStore: UIStore;
	toolStore: ToolStore;
	snapManager: SnapManager;
	services: EditorServices;
	setRenderCallback(callback: () => void): void;
}

export function createEditorContext(): EditorContext {
	const documentStore = new DocumentStore();
	const viewportStore = new ViewportStore();
	const uiStore = new UIStore();
	const toolStore = new ToolStore();
	const snapManager = new SnapManager();

	let renderCallback: (() => void) | null = null;

	const requestRender = () => {
		renderCallback?.();
	};

	// Wire up document store callbacks
	documentStore.setCallbacks({
		onCompositionAttached: (composition) => {
			viewportStore.attachComposition(composition);
			composition.setRenderCallback(() => requestRender());
		},
		onDocumentChanged: () => {
			requestRender();
		}
	});

	const services: EditorServices = {
		document: {
			get composition() {
				return documentStore.composition;
			},
			get layers() {
				return documentStore.layers;
			},
			get activeLayers() {
				return documentStore.activeLayers;
			},
			get activeRasterLayers() {
				return documentStore.activeRasterLayers;
			},
			getLayerById: (id) => documentStore.getLayerById(id)
		},

		viewport: {
			get scale() {
				return viewportStore.scale;
			},
			get zoomPercentage() {
				return viewportStore.zoomPercentage;
			},
			screenToCanvas: (point) => viewportStore.screenToViewport(point),
			canvasToScreen: (point) => viewportStore.viewportToScreen(point),
			getCompositionBounds: () => viewportStore.getCompositionBounds(),
			getLayerBounds: (layer) => viewportStore.getLayerBounds(layer)
		},

		snap: {
			calculateSnap: (target) => {
				const composition = documentStore.composition;
				if (!composition) return null;
				return snapManager.calculateSnap({ target, composition, viewportStore });
			}
		},

		tool: {
			getOptionValue: <T>(key: string) => toolStore.getOptionValue<T>(key)
		},

		actions: {
			executeCommand: (command) => documentStore.executeCommand(command),
			undo: () => documentStore.undo(),
			redo: () => documentStore.redo(),

			pan: (delta) => viewportStore.pan(delta),
			zoomTo: (scale, pivot) => viewportStore.zoomTo(scale, pivot),
			zoomBy: (factor, pivot) => viewportStore.zoomBy(factor, pivot),
			zoomIn: (pivot) => viewportStore.zoomIn(pivot),
			zoomOut: (pivot) => viewportStore.zoomOut(pivot),

			setBaseCursor: (cursor) => uiStore.setBaseCursor(cursor),
			setOverrideCursor: (cursor) => uiStore.setOverrideCursor(cursor),
			clearOverrideCursor: () => uiStore.clearOverrideCursor(),

			setSnapGuides: (guides) => {
				uiStore.setSnapGuides(guides);
				requestRender();
			},
			clearSnapGuides: () => {
				uiStore.clearSnapGuides();
				requestRender();
			},

			requestRender
		}
	};

	// Initialize tool store with services so initial cursor is set
	toolStore.initialize(services);

	const ctx: EditorContext = {
		documentStore,
		viewportStore,
		uiStore,
		toolStore,
		snapManager,
		services,
		setRenderCallback(callback: () => void) {
			renderCallback = callback;
		}
	};

	return setContext(CONTEXT_KEY, ctx);
}

export function getEditorContext(): EditorContext {
	return getContext<EditorContext>(CONTEXT_KEY);
}
