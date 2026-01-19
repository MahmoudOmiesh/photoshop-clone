import type { ViewportStore } from '$lib/stores/viewport.svelte';

interface RulerConfig {
	pixelsPerMajorStep: number;
	minorSteps: number;
	size: number;
}

const DEFAULT_CONFIG: RulerConfig = {
	pixelsPerMajorStep: 100,
	minorSteps: 10,
	size: 17
};

const NICE_STEPS = [1, 2, 5, 10, 20, 25, 50, 100, 200, 250, 500, 1000];

export class Ruler {
	private offscreenCanvas: OffscreenCanvas;
	private offscreenCanvasContext: OffscreenCanvasRenderingContext2D;
	private viewport: ViewportStore;
	private config: RulerConfig;

	constructor(viewport: ViewportStore, config?: RulerConfig) {
		this.offscreenCanvas = new OffscreenCanvas(0, 0);
		const offscreenCanvasContext = this.offscreenCanvas.getContext('2d');

		if (!offscreenCanvasContext) {
			throw new Error('Failed to get canvas context');
		}

		this.offscreenCanvasContext = offscreenCanvasContext;

		this.viewport = viewport;
		this.config = config ?? DEFAULT_CONFIG;
	}

	private renderHorizontalRuler(width: number) {
		const offscreenCtx = this.offscreenCanvasContext;
		const topLeft = this.viewport.screenToViewport({ x: 0, y: 0 });
		const topRight = this.viewport.screenToViewport({ x: width, y: 0 });
		const scale = this.viewport.scale;
		const size = this.config.size;

		const rawMajorStep = this.config.pixelsPerMajorStep / scale;
		const majorStep =
			NICE_STEPS.find((x) => x >= rawMajorStep) ?? NICE_STEPS[NICE_STEPS.length - 1];

		const minorStep = majorStep / this.config.minorSteps;
		const beginning = Math.ceil(topLeft.x / minorStep) * minorStep;

		offscreenCtx.font = '12px monospace';
		offscreenCtx.fillStyle = '#e2e8f0';

		for (let coord = beginning; coord <= topRight.x; coord += minorStep) {
			const screenPos = this.viewport.viewportToScreen({ x: coord, y: 0 });

			if (screenPos.x < size) continue;

			const isMajor = Math.abs(coord % majorStep) < 0.0001;

			if (isMajor) {
				offscreenCtx.fillRect(screenPos.x, 0, 1, size);
				offscreenCtx.fillText(String(coord), screenPos.x + 4, 0.55 * size);
			} else {
				const isMedium = Math.abs(coord % (majorStep / 2)) < 0.0001;
				const y = (isMedium ? 0.6 : 0.75) * size;
				offscreenCtx.fillRect(screenPos.x, y, 1, size - y);
			}
		}

		offscreenCtx.fillRect(size, size, width - size, 1);
	}

	private renderVerticalRuler(height: number) {
		const offscreenCtx = this.offscreenCanvasContext;
		const topLeft = this.viewport.screenToViewport({ x: 0, y: 0 });
		const bottomLeft = this.viewport.screenToViewport({ x: 0, y: height });
		const scale = this.viewport.scale;
		const size = this.config.size;

		const rawMajorStep = this.config.pixelsPerMajorStep / scale;
		const majorStep =
			NICE_STEPS.find((x) => x >= rawMajorStep) ?? NICE_STEPS[NICE_STEPS.length - 1];

		const minorStep = majorStep / this.config.minorSteps;
		const beginning = Math.ceil(topLeft.y / minorStep) * minorStep;

		offscreenCtx.font = '12px monospace';
		offscreenCtx.fillStyle = '#e2e8f0';

		for (let coord = beginning; coord <= bottomLeft.y; coord += minorStep) {
			const screenPos = this.viewport.viewportToScreen({ x: 0, y: coord });

			if (screenPos.y < size) continue;

			const isMajor = Math.abs(coord % majorStep) < 0.0001;

			if (isMajor) {
				offscreenCtx.fillRect(0, screenPos.y, size, 1);
				const textX = 0.15 * size;
				const textY = screenPos.y + 4;

				offscreenCtx.save();
				offscreenCtx.translate(textX, textY);
				offscreenCtx.rotate(Math.PI / 2);
				offscreenCtx.fillText(String(coord), 0, 0);
				offscreenCtx.restore();
			} else {
				const isMedium = Math.abs(coord % (majorStep / 2)) < 0.0001;
				const x = (isMedium ? 0.6 : 0.75) * size;
				offscreenCtx.fillRect(x, screenPos.y, size - x, 1);
			}
		}

		offscreenCtx.fillRect(size, size, 1, height - size);
	}

	getSize() {
		return this.config.size;
	}

	getImageBitmap({ width, height }: { width: number; height: number }) {
		this.offscreenCanvas.width = width;
		this.offscreenCanvas.height = height;

		this.renderHorizontalRuler(width);
		this.renderVerticalRuler(height);

		return this.offscreenCanvas.transferToImageBitmap();
	}
}
