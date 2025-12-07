// this class handles rendering
// 1 - display canvas which is the main canvas where the composition is rendered
// 2 - overlay canvas which will be used for any overlays like rulers, selection, etc.
// 3 - it will use an offscreen canvas to render the composition and then copy the result to the display canvas

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
	}

	private drawCompositionToOffscreenCanvas() {
		// do some other shit
	}

	render() {
		// do shit
	}

	setDimensions(dimensions: { width: number; height: number }) {
		const { width, height } = dimensions;
		if (width === this.width && height === this.height) {
			return;
		}

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
	}
}
