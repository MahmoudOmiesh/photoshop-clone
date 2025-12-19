import type { Layer } from '$lib/document/layers/base-layer.svelte';
import { Command, type CommandContext } from '../command';

interface AddLayerCommandOptions {
	layer: Layer;
}

export class AddLayerCommand extends Command {
	private layer: Layer;

	constructor({ layer }: AddLayerCommandOptions) {
		super();
		this.layer = layer;
	}

	execute(ctx: CommandContext) {
		ctx.composition.addLayer(this.layer);
	}

	undo(ctx: CommandContext) {
		ctx.composition.removeLayer(this.layer.id);
	}
}
