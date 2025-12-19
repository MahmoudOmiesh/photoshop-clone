export const BLEND_MODES = [
	'normal',
	'multiply',
	'screen',
	'overlay',
	'darken',
	'lighten',
	'color-dodge',
	'color-burn',
	'hard-light',
	'soft-light',
	'difference',
	'exclusion'
];

export type BlendMode = (typeof BLEND_MODES)[number];

// not sure yet
export interface LayerLocks {
	transparency: boolean;
	pixel: boolean;
	position: boolean;
	all: boolean;
}

export interface LayerTransform {
	offsetX: number;
	offsetY: number;
	skewX: number;
	skewY: number;
	anchorX: number;
	anchorY: number;
	scaleX: number;
	scaleY: number;
	rotation: number;
}

export interface LayerDimensions {
	width: number;
	height: number;
}

export type LayerType = 'raster';
