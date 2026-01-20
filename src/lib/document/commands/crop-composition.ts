import type { CropRect } from '$lib/tools/crop-tool.svelte';
import { Command, type CommandContext } from './command';
import type { LayerTransform } from '../layers/types';
import { Layer } from '../layers/base-layer.svelte';

interface LayerState {
	layerId: string;
	transform: LayerTransform;
}

interface UndoState {
	width: number;
	height: number;
	layerStates: LayerState[];
}

function rotatePointAroundCenter(
	px: number,
	py: number,
	cx: number,
	cy: number,
	angle: number
): { x: number; y: number } {
	const cos = Math.cos(angle);
	const sin = Math.sin(angle);
	const dx = px - cx;
	const dy = py - cy;
	return {
		x: dx * cos - dy * sin + cx,
		y: dx * sin + dy * cos + cy
	};
}

export class CropCompositionCommand extends Command {
	private cropRect: CropRect;
	private undoState: UndoState | null = null;

	constructor(cropRect: CropRect) {
		super();
		this.cropRect = cropRect;
	}

	execute(ctx: CommandContext) {
		const { composition } = ctx;
		const { x, y, width, height, rotation } = this.cropRect;

		this.undoState = {
			width: composition.dimensions.width,
			height: composition.dimensions.height,
			layerStates: []
		};

		const cropCenterX = x + width / 2;
		const cropCenterY = y + height / 2;
		const rotationDeg = (rotation * 180) / Math.PI;

		for (const layer of composition.layers) {
			if (Layer.isRasterLayer(layer)) {
				const currentTransform = layer.transform;
				const layerDimensions = layer.dimensions;

				this.undoState.layerStates.push({
					layerId: layer.id,
					transform: { ...currentTransform }
				});

				if (rotation !== 0) {
					const anchorInLayerX = currentTransform.anchorX * layerDimensions.width;
					const anchorInLayerY = currentTransform.anchorY * layerDimensions.height;
					const anchorInCompX = currentTransform.offsetX + anchorInLayerX;
					const anchorInCompY = currentTransform.offsetY + anchorInLayerY;

					const rotatedAnchor = rotatePointAroundCenter(
						anchorInCompX,
						anchorInCompY,
						cropCenterX,
						cropCenterY,
						-rotation
					);

					const newOffsetX = rotatedAnchor.x - anchorInLayerX - x;
					const newOffsetY = rotatedAnchor.y - anchorInLayerY - y;

					layer.setTransform({
						...currentTransform,
						offsetX: newOffsetX,
						offsetY: newOffsetY,
						rotation: currentTransform.rotation - rotationDeg
					});
				} else {
					layer.setOffset({
						x: currentTransform.offsetX - x,
						y: currentTransform.offsetY - y
					});
				}
			}
		}

		composition.setDimensions(width, height);
	}

	undo(ctx: CommandContext) {
		if (!this.undoState) return;

		const { composition } = ctx;

		composition.setDimensions(this.undoState.width, this.undoState.height);

		for (const layerState of this.undoState.layerStates) {
			const layer = composition.layers.find((l) => l.id === layerState.layerId);
			if (layer && Layer.isRasterLayer(layer)) {
				layer.setTransform(layerState.transform);
			}
		}
	}
}
