import type { Layer } from '$lib/document/layers/base-layer.svelte';
import { Command } from '../command';

interface SetLayerOpacityCommandOptions {
	layers: Layer[];
	opacity: number;
}

export class SetLayerOpacityCommand extends Command {
	private layers: Layer[];
	private newOpacity: number;

	private originalLayerOpacity: Map<string, number>;

	constructor({ layers, opacity }: SetLayerOpacityCommandOptions) {
		super();
		this.layers = layers;
		this.newOpacity = opacity;

		this.originalLayerOpacity = new Map(layers.map((layer) => [layer.id, layer.opacity]));
	}

	execute() {
		this.layers.forEach((layer) => {
			layer.setOpacity(this.newOpacity);
		});
	}

	undo() {
		this.layers.forEach((layer) => {
			layer.setOpacity(this.originalLayerOpacity.get(layer.id)!);
		});
	}
}
