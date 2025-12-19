import type { Layer } from '$lib/document/layers/base-layer.svelte';
import type { BlendMode } from '$lib/document/layers/types';
import { Command } from '../command';

interface SetLayerBlendModeCommandOptions {
	layer: Layer;
	oldBlendMode: BlendMode;
	newBlendMode: BlendMode;
}

export class SetLayerBlendModeCommand extends Command {
	private layer: Layer;
	private oldBlendMode: BlendMode;
	private newBlendMode: BlendMode;

	constructor({ layer, oldBlendMode, newBlendMode }: SetLayerBlendModeCommandOptions) {
		super();
		this.layer = layer;
		this.oldBlendMode = oldBlendMode;
		this.newBlendMode = newBlendMode;
	}

	execute() {
		this.layer.setBlendMode(this.newBlendMode);
	}

	undo() {
		this.layer.setBlendMode(this.oldBlendMode);
	}
}
