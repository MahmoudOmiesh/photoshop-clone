import { Viewport } from './viewport';

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
	private viewport: Viewport;
	private config: RulerConfig;

	constructor(viewport: Viewport, config?: RulerConfig) {
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
		const topLeft = this.viewport.screenToViewport({
			x: 0,
			y: 0
		});
		const topRight = this.viewport.screenToViewport({
			x: width,
			y: 0
		});
		const scale = this.viewport.getScale();

		const rawMajorStep = this.config.pixelsPerMajorStep / scale;
		const majorStep =
			NICE_STEPS.find((x) => x >= rawMajorStep) ?? NICE_STEPS[NICE_STEPS.length - 1];

		const minorStep = majorStep / this.config.minorSteps;

		const beginning = Math.ceil(topLeft.x / minorStep) * minorStep;

		offscreenCtx.font = '12px monospace';
		offscreenCtx.fillStyle = '#e2e8f0';

		for (let coord = beginning; coord <= topRight.x; coord += minorStep) {
			const screenPos = this.viewport.viewportToScreen({ x: coord, y: 0 });

			const isMajor = Math.abs(coord % majorStep) < 0.0001;

			if (isMajor) {
				offscreenCtx.fillRect(screenPos.x, 0, 1, this.config.size);
				offscreenCtx.fillText(String(coord), screenPos.x + 4, 0.55 * this.config.size);
			} else {
				const isMedium = Math.abs(coord % (majorStep / 2)) < 0.0001;
				const y = (isMedium ? 0.65 : 0.75) * this.config.size;
				offscreenCtx.fillRect(screenPos.x, y, 1, this.config.size - y);
			}
		}

		offscreenCtx.fillRect(0, 17, width, 1);
	}

	getImageBitmap({ width, height }: { width: number; height: number }) {
		this.offscreenCanvas.width = width;
		this.offscreenCanvas.height = height;

		this.renderHorizontalRuler(width);

		return this.offscreenCanvas.transferToImageBitmap();
	}
}
