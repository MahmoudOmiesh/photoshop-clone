import type { ViewportStore } from '$lib/stores/viewport.svelte';
import type { SnapGuide } from './types';

export class SnapGuideRenderer {
	private offscreenCanvas: OffscreenCanvas;
	private offscreenCanvasContext: OffscreenCanvasRenderingContext2D;
	private viewport: ViewportStore;

	constructor(viewport: ViewportStore) {
		this.offscreenCanvas = new OffscreenCanvas(0, 0);
		const offscreenCanvasContext = this.offscreenCanvas.getContext('2d');

		if (!offscreenCanvasContext) {
			throw new Error('Failed to get canvas context');
		}

		this.offscreenCanvasContext = offscreenCanvasContext;
		this.viewport = viewport;
	}

	getImageBitmap(snapGuides: SnapGuide[], { width, height }: { width: number; height: number }) {
		this.offscreenCanvas.width = width;
		this.offscreenCanvas.height = height;

		this.render(snapGuides);

		return this.offscreenCanvas.transferToImageBitmap();
	}

	private render(snapGuides: SnapGuide[]) {
		const ctx = this.offscreenCanvasContext;
		ctx.save();
		ctx.strokeStyle = 'red';
		ctx.lineWidth = 1;

		for (const guide of snapGuides) {
			const isVertical = guide.type === 'vertical';
			const screenPos = this.viewport.viewportToScreen({
				x: isVertical ? guide.position : 0,
				y: isVertical ? 0 : guide.position
			});
			const startPos = this.viewport.viewportToScreen({
				x: isVertical ? 0 : guide.start,
				y: isVertical ? guide.start : 0
			});
			const endPos = this.viewport.viewportToScreen({
				x: isVertical ? 0 : guide.end,
				y: isVertical ? guide.end : 0
			});

			ctx.beginPath();
			if (guide.type === 'vertical') {
				ctx.moveTo(screenPos.x, startPos.y);
				ctx.lineTo(screenPos.x, endPos.y);
			} else {
				ctx.moveTo(startPos.x, screenPos.y);
				ctx.lineTo(endPos.x, screenPos.y);
			}
			ctx.stroke();
		}

		ctx.restore();
	}
}
