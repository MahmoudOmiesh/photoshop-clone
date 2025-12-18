// this class handles rendering
// 1 - display canvas which is the main canvas where the composition is rendered
// 2 - overlay canvas which will be used for any overlays like rulers, selection, etc.

import type { Composition } from '$lib/document/composition.svelte';
import { Ruler } from './ruler';
import { Viewport } from './viewport';

export class Renderer {
	private displayCanvas: HTMLCanvasElement;
	private overlayCanvas: HTMLCanvasElement;
	private displayCanvasContext: CanvasRenderingContext2D;
	private overlayCanvasContext: CanvasRenderingContext2D;

	private viewport = new Viewport();
	private composition: Composition | null = null;

	private width: number = 0;
	private height: number = 0;

	private shouldRerender = false;

	private ruler: Ruler = new Ruler(this.viewport);
	rulerEnabled = true;

	constructor(displayCanvas: HTMLCanvasElement, overlayCanvas: HTMLCanvasElement) {
		this.displayCanvas = displayCanvas;
		this.overlayCanvas = overlayCanvas;

		const displayCanvasContext = this.displayCanvas.getContext('2d');
		const overlayCanvasContext = this.overlayCanvas.getContext('2d');

		if (!displayCanvasContext || !overlayCanvasContext) {
			throw new Error('Failed to get canvas context');
		}

		this.displayCanvasContext = displayCanvasContext;
		this.overlayCanvasContext = overlayCanvasContext;

		// start render loop
		requestAnimationFrame(() => {
			this.render();
		});
	}

	private drawOverlayCanvas() {
		const overlayCtx = this.overlayCanvasContext;
		overlayCtx.clearRect(0, 0, this.width, this.height);

		if (this.rulerEnabled) {
			const rulerBitmap = this.ruler.getImageBitmap({ width: this.width, height: this.height });
			overlayCtx.drawImage(rulerBitmap, 0, 0);
		}
	}

	private drawDisplayCanvas() {
		const displayCtx = this.displayCanvasContext;
		displayCtx.clearRect(0, 0, this.width, this.height);

		displayCtx.save();

		this.clipViewportInsets();

		const transformMatrix = this.viewport.getTransformMatrix();

		displayCtx.setTransform(
			transformMatrix.a,
			transformMatrix.b,
			transformMatrix.c,
			transformMatrix.d,
			transformMatrix.e,
			transformMatrix.f
		);

		if (this.composition) {
			const compositionBitmap = this.composition.getImageBitmap();
			const xOffset = (this.width - compositionBitmap.width) * 0.5;
			const yOffset = (this.height - compositionBitmap.height) * 0.5;
			displayCtx.drawImage(compositionBitmap, xOffset, yOffset);
		} else {
			displayCtx.fillStyle = 'red';
			displayCtx.fillRect(this.width / 2 - 50, this.height / 2 - 50, 100, 100);
		}

		displayCtx.restore();
	}

	private render() {
		if (this.shouldRerender) {
			console.log('RENDER');
			this.drawDisplayCanvas();
			this.drawOverlayCanvas();

			this.shouldRerender = false;
		}

		requestAnimationFrame(() => {
			this.render();
		});
	}

	private updateViewportInsets() {
		const rulerSize = this.rulerEnabled ? this.ruler.getSize() : 0;
		this.viewport.setInsets({
			top: rulerSize,
			left: rulerSize
		});
	}

	private clipViewportInsets() {
		const insets = this.viewport.getInsets();
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

		this.viewport.setContainerDimensions({ width, height });
		this.updateViewportInsets();

		// rerender when changing dimensions
		this.requestRerender();
	}

	requestRerender() {
		this.shouldRerender = true;
	}

	getViewport() {
		return this.viewport;
	}

	attachComposition(composition: Composition) {
		this.composition = composition;
		this.requestRerender();
	}
}
