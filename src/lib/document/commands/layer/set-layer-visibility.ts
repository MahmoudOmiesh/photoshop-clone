import type { Layer } from '$lib/document/layers/base-layer.svelte';
import { Command } from '../command';

interface SetLayerVisibilityCommandOptions {
	layer: Layer;
	visiblity: boolean;
}

export class SetLayerVisibilityCommand extends Command {
	private layer: Layer;
	private visibility: boolean;

	constructor({ layer, visiblity }: SetLayerVisibilityCommandOptions) {
		super();
		this.layer = layer;
		this.visibility = visiblity;
	}

	execute() {
		this.layer.setIsVisible(this.visibility);
	}

	undo() {
		this.layer.setIsVisible(!this.visibility);
	}
}
