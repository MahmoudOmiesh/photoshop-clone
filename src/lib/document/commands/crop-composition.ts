import type { CropRect } from '$lib/tools/crop-tool.svelte';
import { Command, type CommandContext } from './command';
import { Layer } from '../layers/base-layer.svelte';
import { compose, rotate, translate, type Matrix } from 'transformation-matrix';

interface LayerState {
	layerId: string;
	matrix: Matrix;
}

interface UndoState {
	width: number;
	height: number;
	layerStates: LayerState[];
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
		const cropCenterX = x + width / 2;
		const cropCenterY = y + height / 2;

		this.undoState = {
			width: composition.dimensions.width,
			height: composition.dimensions.height,
			layerStates: []
		};

		for (const layer of composition.layers) {
			if (Layer.isRasterLayer(layer)) {
				this.undoState.layerStates.push({
					layerId: layer.id,
					matrix: layer.matrix
				});

				const newMatrix = compose(
					translate(-cropCenterX + width / 2, -cropCenterY + height / 2),
					rotate(-rotation, cropCenterX, cropCenterY),
					layer.matrix
				);

				layer.setMatrix(newMatrix);
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
				layer.setMatrix(layerState.matrix);
			}
		}
	}
}
