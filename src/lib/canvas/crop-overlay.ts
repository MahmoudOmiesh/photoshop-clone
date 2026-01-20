import type { Editor } from '$lib/editor/editor.svelte';
import type { CropRect } from '$lib/tools/crop-tool.svelte';
import { compose, rotate, translate } from 'transformation-matrix';

export class CropOverlay {
	private offscreenCanvas: OffscreenCanvas;
	private offscreenCanvasContext: OffscreenCanvasRenderingContext2D;

	private editor: Editor;

	constructor(editor: Editor) {
		this.offscreenCanvas = new OffscreenCanvas(0, 0);
		const offscreenCanvasContext = this.offscreenCanvas.getContext('2d');

		if (!offscreenCanvasContext) {
			throw new Error('Failed to get canvas context');
		}

		this.offscreenCanvasContext = offscreenCanvasContext;

		this.editor = editor;
	}

	private setTransform(cropRect: CropRect) {
		const ctx = this.offscreenCanvasContext;
		const bounds = this.editor.viewport.getCompositionBounds();
		if (!bounds) return;

		const matrix = compose(
			this.editor.viewport.transformMatrix,
			translate(cropRect.x + cropRect.width / 2, cropRect.y + cropRect.height / 2),
			translate(bounds.topLeft.x, bounds.topLeft.y),
			rotate(cropRect.rotation)
		);

		ctx.setTransform(matrix.a, matrix.b, matrix.c, matrix.d, matrix.e, matrix.f);
	}

	private drawCropBox(cropRect: CropRect) {
		const ctx = this.offscreenCanvasContext;

		ctx.save();
		this.setTransform(cropRect);

		// Border
		ctx.strokeStyle = '#fff';
		ctx.lineWidth = 1 / this.editor.viewport.scale;
		ctx.strokeRect(-cropRect.width / 2, -cropRect.height / 2, cropRect.width, cropRect.height);

		// Rule of thirds grid
		ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
		ctx.beginPath();
		for (let i = 1; i < 3; i++) {
			// Vertical lines
			ctx.moveTo(-cropRect.width / 2 + (cropRect.width * i) / 3, -cropRect.height / 2);
			ctx.lineTo(-cropRect.width / 2 + (cropRect.width * i) / 3, cropRect.height / 2);
			// Horizontal lines
			ctx.moveTo(-cropRect.width / 2, -cropRect.height / 2 + (cropRect.height * i) / 3);
			ctx.lineTo(cropRect.width / 2, -cropRect.height / 2 + (cropRect.height * i) / 3);
		}
		ctx.stroke();

		ctx.restore();
	}

	private drawDimmedRegion(
		cropRect: CropRect,
		{ width, height }: { width: number; height: number }
	) {
		const ctx = this.offscreenCanvasContext;
		ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';

		ctx.beginPath();
		ctx.rect(0, 0, width, height);

		ctx.save();
		this.setTransform(cropRect);
		ctx.rect(-cropRect.width / 2, -cropRect.height / 2, cropRect.width, cropRect.height);
		ctx.restore();

		ctx.fill('evenodd');
	}

	private drawHandles(cropRect: CropRect) {
		const ctx = this.offscreenCanvasContext;
		const handleSize = 8 / this.editor.viewport.scale;

		ctx.save();
		this.setTransform(cropRect);

		ctx.fillStyle = '#fff';
		ctx.strokeStyle = '#333';
		ctx.lineWidth = 1 / this.editor.viewport.scale;

		const positions = [
			[-cropRect.width / 2, -cropRect.height / 2],
			[0, -cropRect.height / 2],
			[cropRect.width / 2, -cropRect.height / 2],
			[-cropRect.width / 2, 0],
			[cropRect.width / 2, 0],
			[-cropRect.width / 2, cropRect.height / 2],
			[0, cropRect.height / 2],
			[cropRect.width / 2, cropRect.height / 2]
		];

		for (const [x, y] of positions) {
			ctx.fillRect(x - handleSize / 2, y - handleSize / 2, handleSize, handleSize);
			ctx.strokeRect(x - handleSize / 2, y - handleSize / 2, handleSize, handleSize);
		}

		ctx.restore();
	}

	getImageBitmap(cropRect: CropRect, { width, height }: { width: number; height: number }) {
		this.offscreenCanvas.width = width;
		this.offscreenCanvas.height = height;

		// REMOVE LATER
		if (this.editor.document.composition) {
			this.drawDimmedRegion(cropRect, { width, height });
			this.drawCropBox(cropRect);
			this.drawHandles(cropRect);
		}

		return this.offscreenCanvas.transferToImageBitmap();
	}
}
