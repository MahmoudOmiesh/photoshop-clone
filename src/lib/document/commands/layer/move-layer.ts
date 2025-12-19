import type { RasterLayer } from '$lib/document/layers/raster-layer';
import { Command } from '../command';

interface MoveLayerCommandOptions {
	layers: RasterLayer[];
	x: number;
	y: number;
}

export class MoveLayerCommand extends Command {
	private layers: RasterLayer[];
	private x: number;
	private y: number;

	constructor({ layers, x, y }: MoveLayerCommandOptions) {
		super();
		this.layers = layers;
		this.x = x;
		this.y = y;
	}

	execute() {
		this.layers.forEach((layer) => {
			layer.move({
				x: this.x,
				y: this.y
			});
		});
	}

	undo() {
		this.layers.forEach((layer) => {
			layer.move({
				x: -this.x,
				y: -this.y
			});
		});
	}
}
