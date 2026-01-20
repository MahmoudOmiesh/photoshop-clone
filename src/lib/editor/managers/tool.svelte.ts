import { SvelteMap } from 'svelte/reactivity';
import type { Editor } from '../editor.svelte';
import type { Tool } from '$lib/tools/base-tool';
import { HandTool } from '$lib/tools/hand-tool';
import { ZoomTool } from '$lib/tools/zoom-tool';
import { MoveTool } from '$lib/tools/move-tool';
import type { ToolAction } from '$lib/tools/types';

const DEFAULT_TOOLS: Tool[] = [new HandTool(), new ZoomTool(), new MoveTool()];

export class ToolManager {
	private readonly toolsMap: SvelteMap<string, Tool>;
	private readonly toolShortcutsMap: SvelteMap<string, Tool>;
	private toolOptionsMap: SvelteMap<string, Record<string, unknown>>;

	private _currentToolId = $state('');
	private _temporaryToolId = $state<string | null>(null);

	constructor(
		public readonly editor: Editor,
		tools?: Tool[]
	) {
		const allTools = tools ?? DEFAULT_TOOLS;

		this.toolsMap = new SvelteMap(allTools.map((tool) => [tool.id, tool]));
		this.toolShortcutsMap = new SvelteMap(
			allTools.filter((tool) => tool.shortcut).map((tool) => [tool.shortcut!, tool])
		);
		this.toolOptionsMap = new SvelteMap(
			allTools.map((tool) => [tool.id, { ...tool.defaultOptions }])
		);

		this._currentToolId = allTools[0]?.id ?? '';
		this.updateBaseCursor();
	}

	get activeToolId() {
		return this._temporaryToolId ?? this._currentToolId;
	}

	get activeTool(): Tool | undefined {
		return this.toolsMap.get(this.activeToolId);
	}

	get activeToolOptions(): Record<string, unknown> {
		return this.toolOptionsMap.get(this.activeToolId) ?? {};
	}

	get allTools(): Tool[] {
		return Array.from(this.toolsMap.values());
	}

	getToolByShortcut(shortcut: string): Tool | null {
		return this.toolShortcutsMap.get(shortcut) ?? null;
	}

	isToolActive(toolId: string): boolean {
		return this.activeToolId === toolId;
	}

	selectTool(toolId: string) {
		const prevTool = this.activeTool;
		const nextTool = this.toolsMap.get(toolId);
		if (!nextTool) return;

		prevTool?.onDeactivate?.(this.editor);
		this._currentToolId = toolId;
		nextTool.onActivate?.(this.editor);
		this.updateBaseCursor();
	}

	setToolOption(toolId: string, key: string, value: unknown) {
		const currentOptions = this.toolOptionsMap.get(toolId);
		if (!currentOptions) return;

		this.toolOptionsMap.set(toolId, { ...currentOptions, [key]: value });

		if (toolId === this.activeToolId) {
			this.updateBaseCursor();
		}
	}

	executeToolAction(action: ToolAction['action']) {
		action(this.editor);
	}

	getOptionValue<T>(key: string): T {
		return this.activeToolOptions[key] as T;
	}

	private updateBaseCursor() {
		const tool = this.activeTool;
		if (!tool) return;

		const cursor = tool.getBaseCursor(this.activeToolOptions);
		this.editor.ui.setBaseCursor(cursor);
	}
}
