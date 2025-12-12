// this class handles rendering
// 1 - display canvas which is the main canvas where the composition is rendered
// 2 - overlay canvas which will be used for any overlays like rulers, selection, etc.
// 3 - it will use an offscreen canvas to render the composition and then copy the result to the display canvas

import { Ruler } from './ruler';
import { Viewport } from './viewport';

export class Renderer {
	private displayCanvas: HTMLCanvasElement;
	private overlayCanvas: HTMLCanvasElement;
	private displayCanvasContext: CanvasRenderingContext2D;
	private overlayCanvasContext: CanvasRenderingContext2D;

	private offscreenCanvas: OffscreenCanvas;
	private offscreenCanvasContext: OffscreenCanvasRenderingContext2D;

	// TODO
	private viewport = new Viewport();
	private composition: null = null;

	private width: number = 0;
	private height: number = 0;

	private shouldRerender = false;

	private ruler: Ruler = new Ruler(this.viewport);
	rulerEnabled = true;

	constructor(displayCanvas: HTMLCanvasElement, overlayCanvas: HTMLCanvasElement) {
		this.displayCanvas = displayCanvas;
		this.overlayCanvas = overlayCanvas;
		this.offscreenCanvas = new OffscreenCanvas(0, 0);

		const displayCanvasContext = this.displayCanvas.getContext('2d');
		const overlayCanvasContext = this.overlayCanvas.getContext('2d');
		const offscreenCanvasContext = this.offscreenCanvas.getContext('2d');

		if (!displayCanvasContext || !overlayCanvasContext || !offscreenCanvasContext) {
			throw new Error('Failed to get canvas context');
		}

		this.displayCanvasContext = displayCanvasContext;
		this.overlayCanvasContext = overlayCanvasContext;
		this.offscreenCanvasContext = offscreenCanvasContext;

		// start render loop
		requestAnimationFrame(() => {
			this.render();
		});
	}

	private drawCompositionToOffscreenCanvas() {
		// do some other shit
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
		// for new just draw a red rectangle
		const displayCtx = this.displayCanvasContext;

		displayCtx.clearRect(0, 0, this.width, this.height);

		displayCtx.save();
		const transformMatrix = this.viewport.getTransformMatrix();

		displayCtx.setTransform(
			transformMatrix.a,
			transformMatrix.b,
			transformMatrix.c,
			transformMatrix.d,
			transformMatrix.e,
			transformMatrix.f
		);

		displayCtx.fillStyle = 'red';
		displayCtx.fillRect(this.width / 2 - 50, this.height / 2 - 50, 100, 100);

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
		this.offscreenCanvas.width = width;
		this.offscreenCanvas.height = height;
		this.viewport.setContainerDimensions({ width, height });

		// rerender when changing dimensions
		this.requestRerender();
	}

	requestRerender() {
		this.shouldRerender = true;
	}

	getViewport() {
		return this.viewport;
	}
}
