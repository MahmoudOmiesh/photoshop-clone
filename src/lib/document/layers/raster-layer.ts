import { compose, rotateDEG, scale, skew, translate } from 'transformation-matrix';
import { Layer } from './base-layer';
import type { LayerTransform } from './types';

export class RasterLayer extends Layer {
	readonly type = 'raster' as const;

	private width: number;
	private height: number;
	private transform: LayerTransform = {
		anchorX: 0.5,
		anchorY: 0.5,
		skewX: 0,
		skewY: 0,
		scaleX: 1,
		scaleY: 1,
		offsetX: 0,
		offsetY: 0,
		rotation: 0
	};

	private offscreenCanvas: OffscreenCanvas;
	private offscreenCanvasContext: OffscreenCanvasRenderingContext2D;

	constructor(name: string, width: number, height: number) {
		super(name);
		this.width = width;
		this.height = height;
		this.offscreenCanvas = new OffscreenCanvas(width, height);

		const offscreenCanvasContext = this.offscreenCanvas.getContext('2d');
		if (!offscreenCanvasContext) {
			throw new Error('Failed to get canvas context');
		}

		this.offscreenCanvasContext = offscreenCanvasContext;
	}

	getImageData() {
		return this.offscreenCanvasContext.getImageData(0, 0, this.width, this.height);
	}

	putImageData(imageData: ImageData) {
		return this.offscreenCanvasContext.putImageData(imageData, 0, 0);
	}

	renderTo(ctx: CanvasRenderingContext2D | OffscreenCanvasRenderingContext2D) {
		ctx.save();
		ctx.globalAlpha = this.opacity;
		ctx.globalCompositeOperation = this.blendModeToCompositeOperation();

		const matrix = this.getTransformationMatrix();
		ctx.setTransform(matrix.a, matrix.b, matrix.c, matrix.d, matrix.e, matrix.f);

		ctx.drawImage(this.offscreenCanvas, 0, 0);
		ctx.restore();
	}

	getTransformationMatrix() {
		const { anchorX, anchorY, offsetX, offsetY, rotation, scaleX, scaleY, skewX, skewY } =
			this.transform;

		const skewXRad = (skewX * Math.PI) / 180;
		const skewYRad = (skewY * Math.PI) / 180;

		return compose(
			translate(offsetX, offsetY),
			rotateDEG(rotation),
			skew(skewXRad, skewYRad),
			scale(scaleX, scaleY),
			translate(-(anchorX * this.width), -(anchorY * this.height))
		);
	}
}
