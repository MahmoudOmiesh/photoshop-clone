import type { Layer } from '$lib/document/layers/base-layer.svelte';
import { Command } from '../command';

interface SetLayerOpacityCommandOptions {
	layer: Layer;
	oldOpacity: number;
	newOpacity: number;
}

export class SetLayerOpacityCommand extends Command {
	private layer: Layer;
	private oldOpacity: number;
	private newOpacity: number;

	constructor({ layer, oldOpacity, newOpacity }: SetLayerOpacityCommandOptions) {
		super();
		this.layer = layer;
		this.oldOpacity = oldOpacity;
		this.newOpacity = newOpacity;
	}

	execute() {
		this.layer.setOpacity(this.newOpacity);
	}

	undo() {
		this.layer.setOpacity(this.oldOpacity);
	}
}
