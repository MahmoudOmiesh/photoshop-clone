import { compose, rotateDEG, scale, skew, translate } from 'transformation-matrix';
import { Layer } from './base-layer.svelte';
import type { LayerTransform } from './types';

export class RasterLayer extends Layer {
	private _width: number;
	private _height: number;
	private _transform: LayerTransform = {
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
		super(name, 'raster');
		this._width = width;
		this._height = height;
		this.offscreenCanvas = new OffscreenCanvas(width, height);

		const offscreenCanvasContext = this.offscreenCanvas.getContext('2d');
		if (!offscreenCanvasContext) {
			throw new Error('Failed to get canvas context');
		}

		this.offscreenCanvasContext = offscreenCanvasContext;

		this.__makeRandomImage();
	}

	get dimensions() {
		return {
			width: this._width,
			height: this._height
		};
	}

	get offset() {
		return {
			x: this._transform.offsetX,
			y: this._transform.offsetY
		};
	}

	get transform() {
		return { ...this._transform };
	}

	getImageData() {
		return this.offscreenCanvasContext.getImageData(0, 0, this._width, this._height);
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
			this._transform;

		const skewXRad = (skewX * Math.PI) / 180;
		const skewYRad = (skewY * Math.PI) / 180;

		const x = anchorX * this._width;
		const y = anchorY * this._height;

		return compose(
			translate(-x, -y),
			rotateDEG(rotation),
			skew(skewXRad, skewYRad),
			scale(scaleX, scaleY),
			translate(offsetX + x, offsetY + y)
		);
	}

	move({ x, y }: { x: number; y: number }) {
		this._transform.offsetX += x;
		this._transform.offsetY += y;
	}

	setOffset({ x, y }: { x: number; y: number }) {
		this._transform.offsetX = x;
		this._transform.offsetY = y;
	}

	setTransform(transform: LayerTransform) {
		this._transform = { ...transform };
	}

	__makeRandomImage() {
		function getRandomColor() {
			const letters = '0123456789ABCDEF';
			let color = '#';
			for (let i = 0; i < 6; i++) {
				color += letters[Math.floor(Math.random() * 16)];
			}
			return color;
		}

		const offscreenCtx = this.offscreenCanvasContext;
		offscreenCtx.fillStyle = getRandomColor();
		offscreenCtx.fillRect(0, 0, this._width, this._height);

		const min = 0.1 * this._width;
		const max = 0.6 * this._width;

		const randomLength = Math.floor(Math.random() * (max - min + 1) + min);
		const randomPos = Math.floor(Math.random() * (max - min + 1) + min);

		offscreenCtx.fillStyle = getRandomColor();
		offscreenCtx.fillRect(randomPos, randomPos, randomLength, randomLength);
	}
}
