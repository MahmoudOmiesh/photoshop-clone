import type { Editor } from '$lib/editor/editor.svelte';
import type { Component } from 'svelte';

export type ToolAction = {
	key: string;
	label: string;
	icon?: Component;
	action: (editor: Editor) => void;
};

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

export interface PointerState {
	x: number;
	y: number;
	pressure: number;
	button: number;

	modifiers: {
		shift: boolean;
		ctrl: boolean;
		alt: boolean;
		meta: boolean;
	};
}
