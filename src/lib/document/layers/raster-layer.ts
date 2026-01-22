import { compose, translate, identity, type Matrix } from 'transformation-matrix';
import { Layer } from './base-layer.svelte';

export class RasterLayer extends Layer {
	private _width: number;
	private _height: number;
	private _matrix: Matrix = identity();

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
			x: this._matrix.e,
			y: this._matrix.f
		};
	}

	get matrix() {
		return { ...this._matrix };
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

		const m = this._matrix;
		ctx.setTransform(m.a, m.b, m.c, m.d, m.e, m.f);

		ctx.drawImage(this.offscreenCanvas, 0, 0);
		ctx.restore();
	}

	move({ x, y }: { x: number; y: number }) {
		this._matrix = compose(translate(x, y), this._matrix);
	}

	setMatrix(matrix: Matrix) {
		this._matrix = { ...matrix };
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
