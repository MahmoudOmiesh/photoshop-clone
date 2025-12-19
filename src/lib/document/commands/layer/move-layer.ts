import type { RasterLayer } from '$lib/document/layers/raster-layer';
import { Command } from '../command';

interface MoveLayerCommandOptions {
	layer: RasterLayer;
	x: number;
	y: number;
}

export class MoveLayerCommand extends Command {
	private layer: RasterLayer;
	private x: number;
	private y: number;

	constructor({ layer, x, y }: MoveLayerCommandOptions) {
		super();
		this.layer = layer;
		this.x = x;
		this.y = y;
	}

	execute() {
		this.layer.move({
			x: this.x,
			y: this.y
		});
	}

	undo() {
		this.layer.move({
			x: -this.x,
			y: -this.y
		});
	}
}
