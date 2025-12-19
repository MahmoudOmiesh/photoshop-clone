import type { Layer } from '$lib/document/layers/base-layer.svelte';
import { Command, type CommandContext } from '../command';

interface RemoveLayerCommandOptions {
	layer: Layer;
}

export class RemoveLayerCommand extends Command {
	private layer: Layer;

	constructor({ layer }: RemoveLayerCommandOptions) {
		super();
		this.layer = layer;
	}

	execute(ctx: CommandContext) {
		ctx.composition.removeLayer(this.layer.id);
	}

	undo(ctx: CommandContext) {
		// this has a bug, it doesn't add the layer in the right position
		ctx.composition.addLayer(this.layer);
	}
}
