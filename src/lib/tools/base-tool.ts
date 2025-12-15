import type { Component } from 'svelte';
import type { PointerState, ToolContext, ToolOption } from './types';

export abstract class Tool {
	abstract readonly id: string;
	abstract readonly name: string;
	abstract readonly icon: Component;

	abstract options: ToolOption[];

	shortcut?: string;

	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	getBaseCursor(_: Record<string, unknown>) {
		return 'default';
	}

	onPointerDown?(ctx: ToolContext, pointer: PointerState): void;
	onPointerMove?(ctx: ToolContext, pointer: PointerState): void;
	onPointerUp?(ctx: ToolContext, pointer: PointerState): void;

	onWheel?(ctx: ToolContext, pointer: PointerState, delta: { x: number; y: number }): void;

	onKeyDown?(ctx: ToolContext, key: string, modifiers: PointerState['modifiers']): void;
	onKeyUp?(ctx: ToolContext, key: string, modifiers: PointerState['modifiers']): void;
}
