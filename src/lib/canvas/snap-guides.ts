import type { Editor } from '$lib/editor/editor.svelte';
import type { SnapGuide } from './types';

export class SnapGuides {
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

	getImageBitmap(snapGuides: SnapGuide[], { width, height }: { width: number; height: number }) {
		this.offscreenCanvas.width = width;
		this.offscreenCanvas.height = height;

		this.render(snapGuides);

		return this.offscreenCanvas.transferToImageBitmap();
	}

	private render(snapGuides: SnapGuide[]) {
		const ctx = this.offscreenCanvasContext;
		const viewport = this.editor.viewport;
		ctx.save();
		ctx.strokeStyle = 'red';
		ctx.lineWidth = 1;

		for (const guide of snapGuides) {
			const isVertical = guide.type === 'vertical';
			// Use viewportToScreen (with rotation) so guides rotate with content
			const startPos = viewport.viewportToScreen({
				x: isVertical ? guide.position : guide.start,
				y: isVertical ? guide.start : guide.position
			});
			const endPos = viewport.viewportToScreen({
				x: isVertical ? guide.position : guide.end,
				y: isVertical ? guide.end : guide.position
			});

			ctx.beginPath();
			ctx.moveTo(startPos.x, startPos.y);
			ctx.lineTo(endPos.x, endPos.y);
			ctx.stroke();
		}

		ctx.restore();
	}
}
