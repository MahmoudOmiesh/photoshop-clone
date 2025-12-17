import type { Renderer } from '$lib/canvas/renderer';
import type { Composition } from '$lib/document/composition.svelte';
import { ToolStore } from '$lib/tools/tool-store.svelte';

export class EditorStore {
	private _renderer: Renderer | null = null;
	private _composition: Composition | null = null;
	private _toolStore = new ToolStore();

	get renderer() {
		return this._renderer;
	}

	get composition() {
		return this._composition;
	}

	get toolStore() {
		return this._toolStore;
	}

	attachRenderer(renderer: Renderer) {
		this._renderer = renderer;
		if (this._composition) {
			this._renderer.attachComposition(this._composition);
			this._composition.setRenderCallback(() => renderer.requestRerender());
		}
	}

	attachComposition(composition: Composition) {
		this._composition = composition;
		if (this._renderer) {
			this._renderer.attachComposition(composition);
			this._composition.setRenderCallback(() => this._renderer!.requestRerender());
		}
	}
}
