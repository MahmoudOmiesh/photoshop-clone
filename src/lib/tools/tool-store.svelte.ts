import { SvelteMap } from 'svelte/reactivity';
import type { Tool } from './base-tool';
import { HandTool } from './hand-tool';
import { ZoomTool } from './zoom-tool';
import { MoveTool } from './move-tool';
import { assert } from '$lib/utils';
import type { EditorServices } from '$lib/editor/services';

const ALL_TOOLS: Tool[] = [new HandTool(), new ZoomTool(), new MoveTool()];

export class ToolStore {
	private readonly toolsMap = new SvelteMap<string, Tool>(ALL_TOOLS.map((tool) => [tool.id, tool]));

	private readonly toolShortcutsMap = new SvelteMap<string, Tool>(
		ALL_TOOLS.filter((tool) => tool.shortcut).map((tool) => [tool.shortcut!, tool])
	);

	private toolOptionsMap = new SvelteMap<string, Record<string, unknown>>(
		ALL_TOOLS.map((tool) => [tool.id, { ...tool.defaultOptions }])
	);

	private _currentToolId = $state(ALL_TOOLS[0].id);
	private _temporaryToolId = $state<string | null>(null);
	private _services: EditorServices | null = null;

	get activeToolId() {
		return this._temporaryToolId ?? this._currentToolId;
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

	initialize(services: EditorServices) {
		this._services = services;
		this.updateBaseCursor();
	}

	getToolByShortcut(shortcut: string) {
		return this.toolShortcutsMap.get(shortcut) ?? null;
	}

	isToolActive(toolId: string) {
		return this.activeToolId === toolId;
	}

	selectTool(toolId: string, services?: EditorServices) {
		const svc = services ?? this._services ?? undefined;
		const prevTool = this.activeTool;
		const nextTool = this.toolsMap.get(toolId);
		assert(nextTool);

		if (svc && prevTool.onDeactivate) {
			prevTool.onDeactivate(svc);
		}

		this._currentToolId = toolId;

		if (svc && nextTool.onActivate) {
			nextTool.onActivate(svc);
		}

		this.updateBaseCursor(svc);
	}

	setToolOption(toolId: string, key: string, value: unknown, services?: EditorServices) {
		const svc = services ?? this._services ?? undefined;
		const currentOptions = this.toolOptionsMap.get(toolId);
		assert(currentOptions);
		this.toolOptionsMap.set(toolId, { ...currentOptions, [key]: value });

		if (toolId === this.activeToolId) {
			this.updateBaseCursor(svc);
		}
	}

	getOptionValue<T>(key: string): T {
		return this.activeToolOptions[key] as T;
	}

	private updateBaseCursor(services?: EditorServices) {
		const svc = services ?? this._services ?? undefined;
		if (!svc) return;
		const cursor = this.activeTool.getBaseCursor(this.activeToolOptions);
		svc.actions.setBaseCursor(cursor);
	}
}
