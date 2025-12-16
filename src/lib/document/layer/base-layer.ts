import { nanoid } from 'nanoid';
import type { BlendMode, LayerLocks } from './types';

export abstract class Layer {
	readonly id: string;

	name: string;
	visible = true;
	opacity = 1;
	blendMode: BlendMode = 'normal';
	locks: LayerLocks = {
		transparency: false,
		pixel: false,
		position: false,
		all: false
	};

	abstract renderTo(ctx: CanvasRenderingContext2D | OffscreenCanvasRenderingContext2D): void;

	constructor(name: string) {
		this.id = nanoid();
		this.name = name;
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
}
