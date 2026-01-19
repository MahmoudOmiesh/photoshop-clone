import type { Composition } from '$lib/document/composition.svelte';
import type { DocumentStore, UIStore, ViewportStore } from '$lib/stores';
import type { SnapGuide } from '$lib/snap/types';
import { Ruler } from './ruler';
import { SnapGuideRenderer } from '$lib/snap/snap-guide-renderer';

interface RendererDependencies {
	documentStore: DocumentStore;
	viewportStore: ViewportStore;
	uiStore: UIStore;
}

export class Renderer {
	private displayCanvas: HTMLCanvasElement;
	private overlayCanvas: HTMLCanvasElement;
	private displayCanvasContext: CanvasRenderingContext2D;
	private overlayCanvasContext: CanvasRenderingContext2D;

	private documentStore: DocumentStore;
	private viewportStore: ViewportStore;
	private uiStore: UIStore;

	private width = 0;
	private height = 0;
	private shouldRerender = false;

	private ruler: Ruler;
	private snapGuidesRenderer: SnapGuideRenderer;

	rulerEnabled = true;
	snapGuidesEnabled = true;

	constructor(
		displayCanvas: HTMLCanvasElement,
		overlayCanvas: HTMLCanvasElement,
		deps: RendererDependencies
	) {
		this.displayCanvas = displayCanvas;
		this.overlayCanvas = overlayCanvas;

		this.documentStore = deps.documentStore;
		this.viewportStore = deps.viewportStore;
		this.uiStore = deps.uiStore;

		const displayCanvasContext = this.displayCanvas.getContext('2d');
		const overlayCanvasContext = this.overlayCanvas.getContext('2d');

		if (!displayCanvasContext || !overlayCanvasContext) {
			throw new Error('Failed to get canvas context');
		}

		this.displayCanvasContext = displayCanvasContext;
		this.overlayCanvasContext = overlayCanvasContext;

		this.ruler = new Ruler(this.viewportStore);
		this.snapGuidesRenderer = new SnapGuideRenderer(this.viewportStore);

		this.startRenderLoop();
	}

	private startRenderLoop() {
		const loop = () => {
			if (this.shouldRerender) {
				this.drawDisplayCanvas();
				this.drawOverlayCanvas();
				this.shouldRerender = false;
			}
			requestAnimationFrame(loop);
		};
		requestAnimationFrame(loop);
	}

	private drawOverlayCanvas() {
		const ctx = this.overlayCanvasContext;
		ctx.clearRect(0, 0, this.width, this.height);

		if (this.rulerEnabled) {
			const rulerBitmap = this.ruler.getImageBitmap({ width: this.width, height: this.height });
			ctx.drawImage(rulerBitmap, 0, 0);
		}

		if (this.snapGuidesEnabled) {
			const snapGuidesBitmap = this.snapGuidesRenderer.getImageBitmap(this.uiStore.snapGuides, {
				width: this.width,
				height: this.height
			});
			ctx.drawImage(snapGuidesBitmap, 0, 0);
		}
	}

	private drawDisplayCanvas() {
		const ctx = this.displayCanvasContext;
		const composition = this.documentStore.composition;

		ctx.clearRect(0, 0, this.width, this.height);
		ctx.save();

		this.clipViewportInsets();

		const transformMatrix = this.viewportStore.transformMatrix;
		ctx.setTransform(
			transformMatrix.a,
			transformMatrix.b,
			transformMatrix.c,
			transformMatrix.d,
			transformMatrix.e,
			transformMatrix.f
		);

		if (composition) {
			const compositionBitmap = composition.getImageBitmap();
			const xOffset = (this.width - compositionBitmap.width) * 0.5;
			const yOffset = (this.height - compositionBitmap.height) * 0.5;
			ctx.drawImage(compositionBitmap, xOffset, yOffset);
		} else {
			ctx.fillStyle = 'red';
			ctx.fillRect(this.width / 2 - 50, this.height / 2 - 50, 100, 100);
		}

		ctx.restore();
	}

	private updateViewportInsets() {
		const rulerSize = this.rulerEnabled ? this.ruler.getSize() : 0;
		this.viewportStore.setInsets({ top: rulerSize, left: rulerSize });
	}

	private clipViewportInsets() {
		const insets = this.viewportStore.insets;
		this.displayCanvasContext.beginPath();
		this.displayCanvasContext.rect(
			insets.left,
			insets.top,
			this.width - insets.left,
			this.height - insets.top
		);
		this.displayCanvasContext.clip();
	}

	setDimensions(dimensions: { width: number; height: number }) {
		const { width, height } = dimensions;

		this.width = width;
		this.height = height;

		this.displayCanvas.width = width;
		this.displayCanvas.height = height;
		this.displayCanvas.style.width = `${width}px`;
		this.displayCanvas.style.height = `${height}px`;

		this.overlayCanvas.width = width;
		this.overlayCanvas.height = height;
		this.overlayCanvas.style.width = `${width}px`;
		this.overlayCanvas.style.height = `${height}px`;

		this.viewportStore.setContainerDimensions({ width, height });
		this.updateViewportInsets();

		this.requestRerender();
	}

	requestRerender() {
		this.shouldRerender = true;
	}
}
