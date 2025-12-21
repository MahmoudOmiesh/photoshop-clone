import type { Renderer } from '$lib/canvas/renderer';
import type { Command, CommandContext } from '$lib/document/commands/command';
import { History } from '$lib/document/commands/history.svelte';
import type { Composition } from '$lib/document/composition.svelte';
import { SnapManager } from '$lib/snap/snap-manager';
import { ToolStore } from '$lib/tools/tool-store.svelte';

export class EditorStore {
	private _renderer: Renderer | null = $state(null);
	private _composition: Composition | null = $state(null);
	private _toolStore = new ToolStore();
	private _history = new History();
	private _snapManager = new SnapManager();

	get renderer() {
		return this._renderer;
	}

	get composition() {
		return this._composition;
	}

	get toolStore() {
		return this._toolStore;
	}

	get snapManager() {
		return this._snapManager;
	}

	private getCommandContext(): CommandContext | null {
		return this._composition
			? {
					composition: this._composition
				}
			: null;
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

	executeCommand(command: Command) {
		const ctx = this.getCommandContext();
		if (!ctx) return;

		this._history.execute(command, ctx);
	}

	undo() {
		const ctx = this.getCommandContext();
		if (!ctx) return;

		this._history.undo(ctx);
	}

	redo() {
		const ctx = this.getCommandContext();
		if (!ctx) return;

		this._history.redo(ctx);
	}
}
