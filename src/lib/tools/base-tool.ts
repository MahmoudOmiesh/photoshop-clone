import type { Component } from 'svelte';
import type { PointerState, ToolOption } from './types';
import type { Editor } from '$lib/editor/editor.svelte';

export abstract class Tool {
	abstract readonly id: string;
	abstract readonly name: string;
	abstract readonly icon: Component;
	abstract readonly options: ToolOption[];

	shortcut?: string;

	get defaultOptions(): Record<string, unknown> {
		const defaults: Record<string, unknown> = {};
		for (const option of this.options) {
			defaults[option.key] = option.default;
		}
		return defaults;
	}

	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	getBaseCursor(_options: Record<string, unknown>): string {
		return 'default';
	}

	onActivate?(editor: Editor): void;
	onDeactivate?(editor: Editor): void;

	onPointerDown?(editor: Editor, pointer: PointerState): void;
	onPointerMove?(editor: Editor, pointer: PointerState): void;
	onPointerUp?(editor: Editor, pointer: PointerState): void;

	onWheel?(editor: Editor, pointer: PointerState, delta: { x: number; y: number }): void;

	onKeyDown?(editor: Editor, key: string, modifiers: PointerState['modifiers']): void;
	onKeyUp?(editor: Editor, key: string, modifiers: PointerState['modifiers']): void;
}
