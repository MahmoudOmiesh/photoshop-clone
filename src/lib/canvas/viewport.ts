import { applyToPoint, compose, inverse, scale, translate } from 'transformation-matrix';

interface ViewportConfig {
	minScale: number;
	maxScale: number;
	minOffsetX: number;
	maxOffsetX: number;
	minOffsetY: number;
	maxOffsetY: number;
}

interface TargetScale {
	scale: number;
	pivotX?: number;
	pivotY?: number;
}

const DEFAULT_CONFIG: ViewportConfig = {
	minScale: 0.01,
	maxScale: 128,
	minOffsetX: -750,
	maxOffsetX: 750,
	minOffsetY: -500,
	maxOffsetY: 500
};

const PRESET_SCALE_STEPS = [
	0.01, 0.02, 0.03, 0.04, 0.05, 0.0625, 0.0833, 0.125, 0.1667, 0.25, 0.3333, 0.5, 0.6667, 1, 1.25,
	1.75, 2, 2.5, 3, 4, 5, 6, 7, 8, 12, 16, 24, 32, 48, 64, 128
];

// not sure if will need rotation, so not adding it for now

export class Viewport {
	// in screen pixels
	private offsetX = 0;
	private offsetY = 0;

	// 1 is no zoom, 2 is 2x zoom, etc.
	private scale = 1;

	private containerWidth = 0;
	private containerHeight = 0;

	private insetTop = 0;
	private insetLeft = 0;

	private config: ViewportConfig;

	constructor(config?: Partial<ViewportConfig>) {
		this.config = { ...DEFAULT_CONFIG, ...config };
	}

	pan({ x, y }: { x: number; y: number }) {
		this.offsetX += x;
		this.offsetY += y;

		// this._clamp();
	}

	private applyZoom({ scale, pivotX, pivotY }: TargetScale) {
		if (pivotX != null && pivotY != null) {
			const viewportPoint = this.screenToViewport({
				x: pivotX,
				y: pivotY
			});

			this.scale = scale;

			const newScreenPoint = this.viewportToScreen({
				x: viewportPoint.x,
				y: viewportPoint.y
			});

			this.offsetX += pivotX - newScreenPoint.x;
			this.offsetY += pivotY - newScreenPoint.y;
		} else {
			this.scale = scale;
		}

		// this._clamp();
	}

	zoomIn(pivot: Omit<TargetScale, 'scale'>) {
		const nextStep = PRESET_SCALE_STEPS.find((step) => step > this.scale);
		if (nextStep) {
			this.applyZoom({ scale: nextStep, ...pivot });
		}
	}

	zoomOut(pivot: Omit<TargetScale, 'scale'>) {
		const prevSteps = PRESET_SCALE_STEPS.filter((step) => step < this.scale);
		if (prevSteps.length > 0) {
			this.applyZoom({ scale: prevSteps[prevSteps.length - 1]!, ...pivot });
		}
	}

	zoomBy({ factor, ...pivot }: { factor: number } & Omit<TargetScale, 'scale'>) {
		this.applyZoom({
			scale: this.scale * factor,
			...pivot
		});
	}

	zoomTo(targetScale: TargetScale) {
		this.applyZoom(targetScale);
	}

	getZoomPercentage() {
		return `${this.scale * 100}%`;
	}

	fillScreen() {
		// TODO: this will need the composition width and height
	}

	fitScreen() {
		// TODO: this will need the composition width and height
	}

	screenToViewport(point: { x: number; y: number }) {
		const inverseMatrix = inverse(this.getTransformMatrix());
		return applyToPoint(inverseMatrix, {
			x: point.x,
			y: point.y
		});
	}

	viewportToScreen(point: { x: number; y: number }) {
		const matrix = this.getTransformMatrix();
		const containerPoint = applyToPoint(matrix, point);
		return {
			x: containerPoint.x,
			y: containerPoint.y
		};
	}

	getTransformMatrix() {
		const matrix = compose(
			translate(this.offsetX + this.insetLeft, this.offsetY + this.insetTop),
			scale(this.scale)
		);

		return matrix;
	}

	setContainerDimensions(dimensions: { width: number; height: number }) {
		const { width, height } = dimensions;
		this.containerWidth = width;
		this.containerHeight = height;
	}

	setInsets(insets: { top: number; left: number }) {
		this.insetTop = insets.top;
		this.insetLeft = insets.left;
	}

	getInsets() {
		return {
			top: this.insetTop,
			left: this.insetLeft
		};
	}

	getScale() {
		return this.scale;
	}

	private _clamp() {
		// this needs to be remade when I introduce the composition
		this.scale = Math.max(this.config.minScale, Math.min(this.config.maxScale, this.scale));
		this.offsetX = Math.max(this.config.minOffsetX, Math.min(this.config.maxOffsetX, this.offsetX));
		this.offsetY = Math.max(this.config.minOffsetY, Math.min(this.config.maxOffsetY, this.offsetY));
	}
}
