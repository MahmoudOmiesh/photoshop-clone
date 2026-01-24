import type { Editor } from '../editor.svelte';
import type { RasterLayer } from '$lib/document/layers/raster-layer';
import { applyToPoint, compose, inverse, rotateDEG, scale, translate } from 'transformation-matrix';

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
	private _rotation = $state(0);
	private _scale = $state(1);

	private _insets = { top: 0, left: 0 };
	private _containerDimensions = { width: 0, height: 0 };

	private config: ViewportConfig;

	constructor(
		public readonly editor: Editor,
		config?: Partial<ViewportConfig>
	) {
		this.config = { ...DEFAULT_CONFIG, ...config };
	}

	get offset() {
		return this._offset;
	}
	get rotation() {
		return this._rotation;
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
	get containerCenter() {
		return {
			x: this._insets.left + this._containerDimensions.width / 2,
			y: this._insets.top + this._containerDimensions.height / 2
		};
	}

	get coordinateTransformMatrix() {
		return compose(
			translate(this._offset.x + this._insets.left, this._offset.y + this._insets.top),
			scale(this._scale)
		);
	}
	get inverseCoordinateTransformMatrix() {
		return inverse(this.coordinateTransformMatrix);
	}

	get transformMatrix() {
		const center = this.containerCenter;
		return compose(rotateDEG(this._rotation, center.x, center.y), this.coordinateTransformMatrix);
	}
	get inverseTransformMatrix() {
		return inverse(this.transformMatrix);
	}

	pan(delta: Point) {
		this._offset = {
			x: this._offset.x + delta.x,
			y: this._offset.y + delta.y
		};
	}

	rotate(deltaDeg: number) {
		this._rotation = (this._rotation + deltaDeg) % 360;
	}
	resetRotation() {
		this._rotation = 0;
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

			// Convert screen delta to pan delta (accounts for rotation)
			const screenDelta = {
				x: pivot.x - newScreenPoint.x,
				y: pivot.y - newScreenPoint.y
			};
			const offsetDelta = this.screenDeltaForPan(screenDelta);

			this._offset = {
				x: this._offset.x + offsetDelta.x,
				y: this._offset.y + offsetDelta.y
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

	fitTheArea() {
		const composition = this.editor.document.composition;
		if (!composition) return;

		const { width: compWidth, height: compHeight } = composition.dimensions;
		const { width: contWidth, height: contHeight } = this._containerDimensions;

		// Compute scale to fit, preserving aspect ratio
		const scaleX = contWidth / compWidth;
		const scaleY = contHeight / compHeight;
		const targetScale = Math.min(scaleX, scaleY) * 0.95;

		this._offset = { x: 0, y: 0 };
		this._scale = 1;
		this.zoomTo(targetScale, this.viewportToScreen(this.containerCenter));
	}

	setContainerDimensions(dimensions: Dimensions) {
		this._containerDimensions = dimensions;
	}

	setInsets(insets: Insets) {
		this._insets = insets;
	}

	// Document coordinate conversions (NO rotation - for ruler, snapping, tool logic)
	screenToDocument(point: Point): Point {
		return applyToPoint(this.inverseCoordinateTransformMatrix, point);
	}

	documentToScreen(point: Point): Point {
		return applyToPoint(this.coordinateTransformMatrix, point);
	}

	// View coordinate conversions (WITH rotation - for hit testing rotated content)
	screenToViewport(point: Point): Point {
		return applyToPoint(this.inverseTransformMatrix, point);
	}

	viewportToScreen(point: Point): Point {
		return applyToPoint(this.transformMatrix, point);
	}

	// Convert a screen-space delta to document-space delta (accounts for rotation + scale)
	screenDeltaToDocument(delta: Point): Point {
		const rad = (-this._rotation * Math.PI) / 180;
		const cos = Math.cos(rad);
		const sin = Math.sin(rad);
		return {
			x: (delta.x * cos - delta.y * sin) / this._scale,
			y: (delta.x * sin + delta.y * cos) / this._scale
		};
	}

	// Convert screen delta for panning (accounts for rotation only, not scale)
	screenDeltaForPan(delta: Point): Point {
		const rad = (-this._rotation * Math.PI) / 180;
		const cos = Math.cos(rad);
		const sin = Math.sin(rad);
		return {
			x: delta.x * cos - delta.y * sin,
			y: delta.x * sin + delta.y * cos
		};
	}

	getCompositionBounds(): Bounds | null {
		if (!this.editor.document.composition) return null;

		const { width, height } = this.editor.document.composition.dimensions;
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
