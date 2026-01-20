import type { Editor } from '$lib/editor/editor.svelte';
import { Ruler } from './ruler';
import { SnapGuides } from '$lib/canvas/snap-guides';
import { CropOverlay } from './crop-overlay';
import { CropTool } from '$lib/tools/crop-tool.svelte';

export class Renderer {
	private displayCanvas: HTMLCanvasElement;
	private overlayCanvas: HTMLCanvasElement;
	private displayCanvasContext: CanvasRenderingContext2D;
	private overlayCanvasContext: CanvasRenderingContext2D;

	private width = 0;
	private height = 0;
	private shouldRerender = false;

	private ruler: Ruler;
	rulerEnabled = true;

	private snapGuidesRenderer: SnapGuides;
	snapGuidesEnabled = true;

	private cropOverlayRenderer: CropOverlay;

	private editor: Editor;

	constructor(displayCanvas: HTMLCanvasElement, overlayCanvas: HTMLCanvasElement, editor: Editor) {
		this.displayCanvas = displayCanvas;
		this.overlayCanvas = overlayCanvas;
		this.editor = editor;

		const displayCanvasContext = this.displayCanvas.getContext('2d');
		const overlayCanvasContext = this.overlayCanvas.getContext('2d');

		if (!displayCanvasContext || !overlayCanvasContext) {
			throw new Error('Failed to get canvas context');
		}

		this.displayCanvasContext = displayCanvasContext;
		this.overlayCanvasContext = overlayCanvasContext;

		this.ruler = new Ruler(this.editor);
		this.snapGuidesRenderer = new SnapGuides(this.editor);
		this.cropOverlayRenderer = new CropOverlay(this.editor);

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
			const snapGuidesBitmap = this.snapGuidesRenderer.getImageBitmap(this.editor.ui.snapGuides, {
				width: this.width,
				height: this.height
			});
			ctx.drawImage(snapGuidesBitmap, 0, 0);
		}

		const activeTool = this.editor.tools.activeTool;
		if (activeTool instanceof CropTool && activeTool.cropRect) {
			const cropBitmap = this.cropOverlayRenderer.getImageBitmap(activeTool.cropRect, {
				width: this.width,
				height: this.height
			});
			ctx.drawImage(cropBitmap, 0, 0);
		}
	}

	private drawDisplayCanvas() {
		const ctx = this.displayCanvasContext;
		const composition = this.editor.document.composition;

		ctx.clearRect(0, 0, this.width, this.height);
		ctx.save();

		this.clipViewportInsets();

		const transformMatrix = this.editor.viewport.transformMatrix;
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
		const rulerSize = this.rulerEnabled ? this.ruler.size : 0;
		this.editor.viewport.setInsets({ top: rulerSize, left: rulerSize });
	}

	private clipViewportInsets() {
		const insets = this.editor.viewport.insets;
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

		this.editor.viewport.setContainerDimensions({ width, height });
		this.updateViewportInsets();

		this.requestRerender();
	}

	requestRerender() {
		this.shouldRerender = true;
	}
}
