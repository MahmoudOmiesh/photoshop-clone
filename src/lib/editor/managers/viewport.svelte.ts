import type { Editor } from '../editor.svelte';
import type { Composition } from '$lib/document/composition.svelte';
import type { RasterLayer } from '$lib/document/layers/raster-layer';
import { applyToPoint, compose, inverse, scale, translate } from 'transformation-matrix';

export interface Point {
	x: number;
	y: number;
}

export interface Dimensions {
	width: number;
	height: number;
}

export interface Insets {
	top: number;
	left: number;
}

export interface Bounds {
	topLeft: Point;
	width: number;
	height: number;
}

interface ViewportConfig {
	minScale: number;
	maxScale: number;
}

const DEFAULT_CONFIG: ViewportConfig = {
	minScale: 0.01,
	maxScale: 128
};

const PRESET_SCALE_STEPS = [
	0.01, 0.02, 0.03, 0.04, 0.05, 0.0625, 0.0833, 0.125, 0.1667, 0.25, 0.3333, 0.5, 0.6667, 1, 1.25,
	1.75, 2, 2.5, 3, 4, 5, 6, 7, 8, 12, 16, 24, 32, 48, 64, 128
];

export class ViewportManager {
	private _offset = $state<Point>({ x: 0, y: 0 });
	private _scale = $state(1);
	private _insets = $state<Insets>({ top: 0, left: 0 });
	private _containerDimensions = $state<Dimensions>({ width: 0, height: 0 });

	private config: ViewportConfig;
	private composition: Composition | null = null;

	constructor(
		public readonly editor: Editor,
		config?: Partial<ViewportConfig>
	) {
		this.config = { ...DEFAULT_CONFIG, ...config };
	}

	get offset() {
		return this._offset;
	}
	get scale() {
		return this._scale;
	}
	get insets() {
		return this._insets;
	}
	get containerDimensions() {
		return this._containerDimensions;
	}

	get zoomPercentage() {
		return `${Math.round(this._scale * 100)}%`;
	}

	get transformMatrix() {
		return compose(
			translate(this._offset.x + this._insets.left, this._offset.y + this._insets.top),
			scale(this._scale)
		);
	}

	get inverseTransformMatrix() {
		return inverse(this.transformMatrix);
	}

	attachComposition(composition: Composition) {
		this.composition = composition;
	}

	pan(delta: Point) {
		this._offset = {
			x: this._offset.x + delta.x,
			y: this._offset.y + delta.y
		};
	}

	zoomTo(targetScale: number, pivot?: Point) {
		const clampedScale = Math.max(
			this.config.minScale,
			Math.min(this.config.maxScale, targetScale)
		);

		if (pivot) {
			const viewportPoint = this.screenToViewport(pivot);
			this._scale = clampedScale;
			const newScreenPoint = this.viewportToScreen(viewportPoint);

			this._offset = {
				x: this._offset.x + (pivot.x - newScreenPoint.x),
				y: this._offset.y + (pivot.y - newScreenPoint.y)
			};
		} else {
			this._scale = clampedScale;
		}
	}

	zoomBy(factor: number, pivot?: Point) {
		this.zoomTo(this._scale * factor, pivot);
	}

	zoomIn(pivot?: Point) {
		const nextStep = PRESET_SCALE_STEPS.find((step) => step > this._scale);
		if (nextStep) {
			this.zoomTo(nextStep, pivot);
		}
	}

	zoomOut(pivot?: Point) {
		const prevSteps = PRESET_SCALE_STEPS.filter((step) => step < this._scale);
		if (prevSteps.length > 0) {
			this.zoomTo(prevSteps[prevSteps.length - 1]!, pivot);
		}
	}

	setContainerDimensions(dimensions: Dimensions) {
		this._containerDimensions = dimensions;
	}

	setInsets(insets: Insets) {
		this._insets = insets;
	}

	screenToViewport(point: Point): Point {
		return applyToPoint(this.inverseTransformMatrix, point);
	}

	viewportToScreen(point: Point): Point {
		return applyToPoint(this.transformMatrix, point);
	}

	getCompositionBounds(): Bounds | null {
		if (!this.composition) return null;

		const { width, height } = this.composition.dimensions;
		return {
			topLeft: {
				x: 0.5 * (this._containerDimensions.width - width),
				y: 0.5 * (this._containerDimensions.height - height)
			},
			width,
			height
		};
	}

	getLayerBounds(layer: RasterLayer): Bounds | null {
		const compositionBounds = this.getCompositionBounds();
		if (!compositionBounds) return null;

		return {
			topLeft: {
				x: compositionBounds.topLeft.x + layer.offset.x,
				y: compositionBounds.topLeft.y + layer.offset.y
			},
			width: layer.dimensions.width,
			height: layer.dimensions.height
		};
	}
}
