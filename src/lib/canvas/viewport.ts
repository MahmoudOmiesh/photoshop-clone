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
	0.01, 0.02, 0.03, 0.04, 0.05, 0.0625, 0.0833, 0.125, 0.1667, 0.25, 0.3333, 0.5, 0.6667, 1, 2, 3,
	4, 5, 6, 7, 8, 12, 16, 24, 32, 48, 64, 128
];

// not sure if will need rotation, so not adding it for now

export class Viewport {
	// in screen pixels
	private offsetX: number = 0;
	private offsetY: number = 0;

	// 1 is no zoom, 2 is 2x zoom, etc.
	private zoom: number = 1;

	private containerWidth: number = 0;
	private containerHeight: number = 0;

	private config: ViewportConfig;

	constructor(config?: Partial<ViewportConfig>) {
		this.config = { ...DEFAULT_CONFIG, ...config };
	}

	pan({ x, y }: { x: number; y: number }) {
		this.offsetX += x;
		this.offsetY += y;

		this._clamp();
	}

	applyZoom({ scale, pivotX, pivotY }: TargetScale) {
		// do stuff

		this._clamp();
	}

	zoomIn(pivot: Omit<TargetScale, 'scale'>) {
		const nextStep = PRESET_SCALE_STEPS.find((step) => step > this.zoom);
		if (nextStep) {
			this.applyZoom({ scale: nextStep, ...pivot });
		}
	}

	zoomOut(pivot: Omit<TargetScale, 'scale'>) {
		const prevSteps = PRESET_SCALE_STEPS.filter((step) => step < this.zoom);
		if (prevSteps.length > 0) {
			this.applyZoom({ scale: prevSteps[prevSteps.length - 1]!, ...pivot });
		}
	}

	getZoomPercentage() {
		return `${this.zoom * 100}%`;
	}

	fillScreen() {
		// TODO: this will need the composition width and height
	}

	fitScreen() {
		// TODO: this will need the composition width and height
	}

	screenToViewport({ x, y }: { x: number; y: number }) {
		// convert screen coordinates to viewport coordinates
	}

	viewportToScreen({ x, y }: { x: number; y: number }) {
		// convert viewport coordinates to screen coordinates
	}

	getTransformationMatrix() {
		// do some things
	}

	setContainerDimensions(dimensions: { width: number; height: number }) {
		const { width, height } = dimensions;
		this.containerWidth = width;
		this.containerHeight = height;
	}

	private _clamp() {
		this.zoom = Math.max(this.config.minScale, Math.min(this.config.maxScale, this.zoom));
		this.offsetX = Math.max(this.config.minOffsetX, Math.min(this.config.maxOffsetX, this.offsetX));
		this.offsetY = Math.max(this.config.minOffsetY, Math.min(this.config.maxOffsetY, this.offsetY));
	}
}
