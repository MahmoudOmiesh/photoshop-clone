import type { Editor } from '$lib/editor/editor.svelte';
import type { CropRect, ResizeOverlayInfo } from '$lib/tools/crop-tool.svelte';
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

	private drawDimensionOverlay(
		cropRect: CropRect,
		resizeInfo: ResizeOverlayInfo,
		canvasBounds: { width: number; height: number }
	) {
		const ctx = this.offscreenCanvasContext;

		const width = Math.round(cropRect.width);
		const height = Math.round(cropRect.height);
		const label1 = 'w:';
		const label2 = 'h:';
		const value1 = `${width} px`;
		const value2 = `${height} px`;

		const fontSize = 11;
		const padding = 6;
		const lineHeight = fontSize + 2;
		const offsetX = 12;
		const offsetY = -8;
		const gap = 8;

		ctx.save();
		ctx.font = `${fontSize}px ui-monospace, "Cascadia Code", "Source Code Pro", Menlo, Consolas, monospace`;

		const labelWidth = Math.max(ctx.measureText(label1).width, ctx.measureText(label2).width);
		const valueWidth = Math.max(ctx.measureText(value1).width, ctx.measureText(value2).width);
		const boxWidth = labelWidth + gap + valueWidth + padding * 2;
		const boxHeight = lineHeight * 2 + padding * 2;

		// Position to top-right of cursor, but clamp within canvas
		let boxX = resizeInfo.cursorX + offsetX;
		let boxY = resizeInfo.cursorY + offsetY - boxHeight;

		// Clamp to canvas bounds
		if (boxX + boxWidth > canvasBounds.width) {
			boxX = resizeInfo.cursorX - offsetX - boxWidth;
		}
		if (boxY < 0) {
			boxY = resizeInfo.cursorY + offsetX;
		}

		// Background
		ctx.fillStyle = 'rgba(0, 0, 0, 0.75)';
		ctx.beginPath();
		ctx.roundRect(boxX, boxY, boxWidth, boxHeight, 4);
		ctx.fill();

		// Text - labels left-aligned, values right-aligned
		ctx.fillStyle = '#fff';
		ctx.textBaseline = 'top';

		// Labels (left-aligned)
		ctx.textAlign = 'left';
		ctx.fillText(label1, boxX + padding, boxY + padding);
		ctx.fillText(label2, boxX + padding, boxY + padding + lineHeight);

		// Values (right-aligned)
		ctx.textAlign = 'right';
		ctx.fillText(value1, boxX + boxWidth - padding, boxY + padding);
		ctx.fillText(value2, boxX + boxWidth - padding, boxY + padding + lineHeight);

		ctx.restore();
	}

	getImageBitmap(
		cropRect: CropRect,
		resizeInfo: ResizeOverlayInfo | null,
		{ width, height }: { width: number; height: number }
	) {
		this.offscreenCanvas.width = width;
		this.offscreenCanvas.height = height;

		// REMOVE LATER
		if (this.editor.document.composition) {
			this.drawDimmedRegion(cropRect, { width, height });
			this.drawCropBox(cropRect);
			this.drawHandles(cropRect);

			if (resizeInfo) {
				this.drawDimensionOverlay(cropRect, resizeInfo, { width, height });
			}
		}

		return this.offscreenCanvas.transferToImageBitmap();
	}
}
