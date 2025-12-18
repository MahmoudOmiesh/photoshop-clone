import { nanoid } from 'nanoid';
import type { BlendMode, LayerLocks } from './types';

export abstract class Layer {
	readonly id: string;

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

	private renderCallback: (() => void) | null = null;

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

	constructor(name: string) {
		this.id = nanoid();
		this._name = name;
	}

	setName(name: string) {
		this._name = name;
	}
	setIsVisible(isVisible: boolean) {
		this._isVisible = isVisible;
		this.requestRerender();
	}
	setOpacity(opacity: number) {
		if (opacity < 0 || opacity > 1) {
			throw new Error('Opacity must be between 0 and 1');
		}
		this._opacity = opacity;
		this.requestRerender();
	}
	setBlendMode(blendMode: BlendMode) {
		this._blendMode = blendMode;
		this.requestRerender();
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

	// Rendering
	setRenderCallback(callback: () => void) {
		this.renderCallback = callback;
	}

	private requestRerender() {
		this.renderCallback?.();
	}
}
