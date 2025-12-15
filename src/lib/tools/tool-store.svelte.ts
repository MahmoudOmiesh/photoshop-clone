import { SvelteMap } from 'svelte/reactivity';
import type { Tool } from './base-tool';
import { HandTool } from './hand-tool';
import { assert } from '$lib/utils';
import type { Renderer } from '$lib/canvas/renderer';
import type { ToolContext } from './types';
import { getContext, setContext } from 'svelte';
import { ZoomTool } from './zoom-tool';
import { CursorManager } from './cursor-manager.svelte';

const ALL_TOOLS = [new HandTool(), new ZoomTool()];

export class ToolStore {
	private readonly toolsMap = new SvelteMap<string, Tool>(ALL_TOOLS.map((tool) => [tool.id, tool]));
	private toolOptionsMap = new SvelteMap<string, Record<string, unknown>>(
		ALL_TOOLS.map((tool) => {
			const defaults: Record<string, unknown> = {};
			tool.options.map((option) => {
				defaults[option.key] = option.default;
			});
			return [tool.id, defaults];
		})
	);
	readonly cursorManager = new CursorManager();

	private currentToolId = $state(ALL_TOOLS[0].id);
	private temporaryToolId = $state<string | null>(null);

	get activeToolId() {
		return this.temporaryToolId ?? this.currentToolId;
	}

	get activeTool() {
		return this.toolsMap.get(this.activeToolId)!;
	}

	get activeToolOptions() {
		return this.toolOptionsMap.get(this.activeToolId)!;
	}

	get allTools() {
		return Array.from(this.toolsMap.values());
	}

	isToolActive(toolId: string) {
		return this.activeToolId === toolId;
	}

	selectTool(toolId: string) {
		const nextTool = this.toolsMap.get(toolId);
		assert(nextTool);
		this.currentToolId = toolId;
		this.updateBaseCursor();
	}

	setToolOption(toolId: string, key: string, value: unknown) {
		const currentOptions = this.toolOptionsMap.get(toolId);
		assert(currentOptions);
		this.toolOptionsMap.set(toolId, { ...currentOptions, [key]: value });

		if (toolId === this.activeToolId) {
			this.updateBaseCursor();
		}
	}

	createToolContext(renderer: Renderer): ToolContext {
		return {
			renderer,
			cursorManager: this.cursorManager,
			getOptionValue: <T>(key: string): T => {
				return this.activeToolOptions[key] as T;
			}
		};
	}

	private updateBaseCursor() {
		const cursor = this.activeTool.getBaseCursor(this.activeToolOptions);
		this.cursorManager.setBase(cursor);
	}
}

const DEFAULT_KEY = '$_tool_store';

export function getToolStore(key = DEFAULT_KEY) {
	return getContext<ToolStore>(key);
}

export function setToolStore(key = DEFAULT_KEY) {
	const toolStore = new ToolStore();
	return setContext(key, toolStore);
}
