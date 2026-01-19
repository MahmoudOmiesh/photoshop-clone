import { nanoid } from 'nanoid';
import type { BlendMode, LayerLocks, LayerType } from './types';
import type { RasterLayer } from './raster-layer';

export abstract class Layer {
	readonly id: string;
	readonly type: LayerType;

	protected _name = $state('');
	protected _isVisible = $state(true);
	protected _opacity = $state(1);
	protected _blendMode: BlendMode = $state('normal');
	protected _locks: LayerLocks = $state({
		transparency: false,
		pixel: false,
		position: false,
		all: false
	});

	get name() {
		return this._name;
	}
	get isVisible() {
		return this._isVisible;
	}
	get opacity() {
		return this._opacity;
	}
	get blendMode() {
		return this._blendMode;
	}
	get locks() {
		return this._locks;
	}

	abstract renderTo(ctx: CanvasRenderingContext2D | OffscreenCanvasRenderingContext2D): void;

	constructor(name: string, type: LayerType) {
		this.id = nanoid();
		this._name = name;
		this.type = type;
	}

	setName(name: string) {
		this._name = name;
	}

	setIsVisible(isVisible: boolean) {
		this._isVisible = isVisible;
	}

	setOpacity(opacity: number) {
		if (opacity < 0 || opacity > 1) {
			throw new Error('Opacity must be between 0 and 1');
		}
		this._opacity = opacity;
	}

	setBlendMode(blendMode: BlendMode) {
		this._blendMode = blendMode;
	}

	blendModeToCompositeOperation() {
		const map: Record<BlendMode, GlobalCompositeOperation> = {
			normal: 'source-over',
			multiply: 'multiply',
			screen: 'screen',
			overlay: 'overlay',
			darken: 'darken',
			lighten: 'lighten',
			'color-dodge': 'color-dodge',
			'color-burn': 'color-burn',
			'hard-light': 'hard-light',
			'soft-light': 'soft-light',
			difference: 'difference',
			exclusion: 'exclusion'
		};
		return map[this.blendMode];
	}

	static isRasterLayer(layer: Layer): layer is RasterLayer {
		return layer.type === 'raster';
	}
}
