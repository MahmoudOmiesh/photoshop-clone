import { getContext, setContext } from 'svelte';
import { DocumentManager } from './managers/document.svelte';
import { ViewportManager } from './managers/viewport.svelte';
import { UIManager } from './managers/ui.svelte';
import { ToolManager } from './managers/tool.svelte';
import { SnapManager } from './managers/snap.svelte';
import { HistoryManager } from './managers/history.svelte';
import type { Tool } from '$lib/tools/base-tool';
import type { PointerState } from '$lib/tools/types';

const EDITOR_CONTEXT_KEY = Symbol('editor');

export interface EditorConfig {
	tools?: Tool[];
}

export class Editor {
	readonly document: DocumentManager;
	readonly viewport: ViewportManager;
	readonly ui: UIManager;
	readonly tools: ToolManager;
	readonly snap: SnapManager;
	readonly history: HistoryManager;

	private _renderCallback: (() => void) | null = null;

	constructor(config?: EditorConfig) {
		this.document = new DocumentManager(this);
		this.viewport = new ViewportManager(this);
		this.ui = new UIManager(this);
		this.history = new HistoryManager(this);
		this.snap = new SnapManager(this);
		this.tools = new ToolManager(this, config?.tools);
	}

	setRenderCallback(callback: () => void) {
		this._renderCallback = callback;
	}

	requestRender() {
		this._renderCallback?.();
	}

	onPointerDown(pointer: PointerState) {
		this.tools.activeTool?.onPointerDown?.(this, pointer);
	}

	onPointerMove(pointer: PointerState) {
		this.tools.activeTool?.onPointerMove?.(this, pointer);
	}

	onPointerUp(pointer: PointerState) {
		this.tools.activeTool?.onPointerUp?.(this, pointer);
	}

	onWheel(pointer: PointerState, delta: { x: number; y: number }) {
		this.tools.activeTool?.onWheel?.(this, pointer, delta);
	}

	onKeyDown(key: string, modifiers: PointerState['modifiers']) {
		if (modifiers.ctrl || modifiers.meta) {
			if (key === 'z' && !modifiers.shift) {
				this.history.undo();
				return;
			}
			if ((key === 'z' && modifiers.shift) || key === 'y') {
				this.history.redo();
				return;
			}
		}

		const shortcutTool = this.tools.getToolByShortcut(key.toLowerCase());
		if (shortcutTool) {
			this.tools.selectTool(shortcutTool.id);
			return;
		}

		this.tools.activeTool?.onKeyDown?.(this, key, modifiers);
	}

	onKeyUp(key: string, modifiers: PointerState['modifiers']) {
		this.tools.activeTool?.onKeyUp?.(this, key, modifiers);
	}
}

export function createEditor(config?: EditorConfig): Editor {
	const editor = new Editor(config);
	return setContext(EDITOR_CONTEXT_KEY, editor);
}

export function getEditor(): Editor {
	return getContext<Editor>(EDITOR_CONTEXT_KEY);
}
