import type { Layer } from '$lib/document/layers/base-layer.svelte';
import type { BlendMode } from '$lib/document/layers/types';
import { Command } from '../command';

interface SetLayerBlendModeCommandOptions {
	layers: Layer[];
	blendMode: BlendMode;
}

export class SetLayerBlendModeCommand extends Command {
	private layers: Layer[];
	private newBlendMode: BlendMode;

	private originalLayerBlendMode: Map<string, BlendMode>;

	constructor({ layers, blendMode }: SetLayerBlendModeCommandOptions) {
		super();
		this.layers = layers;
		this.newBlendMode = blendMode;

		this.originalLayerBlendMode = new Map(layers.map((layer) => [layer.id, layer.blendMode]));
	}

	execute() {
		this.layers.forEach((layer) => {
			layer.setBlendMode(this.newBlendMode);
		});
	}

	undo() {
		this.layers.forEach((layer) => {
			layer.setBlendMode(this.originalLayerBlendMode.get(layer.id)!);
		});
	}
}
