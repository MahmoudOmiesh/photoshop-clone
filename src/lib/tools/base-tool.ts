import type { Component } from 'svelte';
import type { PointerState, ToolOption } from './types';
import type { EditorServices } from '$lib/editor/services';

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

	getBaseCursor(_options: Record<string, unknown>): string {
		return 'default';
	}

	onActivate?(services: EditorServices): void;
	onDeactivate?(services: EditorServices): void;

	onPointerDown?(services: EditorServices, pointer: PointerState): void;
	onPointerMove?(services: EditorServices, pointer: PointerState): void;
	onPointerUp?(services: EditorServices, pointer: PointerState): void;

	onWheel?(services: EditorServices, pointer: PointerState, delta: { x: number; y: number }): void;

	onKeyDown?(services: EditorServices, key: string, modifiers: PointerState['modifiers']): void;
	onKeyUp?(services: EditorServices, key: string, modifiers: PointerState['modifiers']): void;
}
