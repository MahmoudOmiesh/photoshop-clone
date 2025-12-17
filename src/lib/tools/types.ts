import type { EditorStore } from '$lib/editor/editor-store.svelte';
import type { Component } from 'svelte';

export type ToolOption =
	| {
			type: 'slider';
			key: string;
			label: string;
			min: number;
			max: number;
			step?: number;
			default: number;
	  }
	| {
			type: 'checkbox';
			key: string;
			label: string;
			default: boolean;
	  }
	| {
			type: 'select';
			key: string;
			label: string;
			options: { label: string; value: string }[];
			default: string;
	  }
	| {
			type: 'button-group';
			key: string;
			label: string;
			options: { label: string; value: string; icon: Component }[];
			default: string;
	  };

export interface CursorContext {
	setBase: (cursor: string) => void;
	setOverride: (cursor: string) => void;
	clearOverride: () => void;
}

export interface ToolContext {
	editorStore: EditorStore;
	cursorManager: CursorContext;
	getOptionValue: <T>(key: string) => T;
}

export interface PointerState {
	x: number;
	y: number;
	pressure: number;
	// PointerEvent.button property
	button: number;

	modifiers: {
		shift: boolean;
		ctrl: boolean;
		alt: boolean;
		meta: boolean;
	};
}
