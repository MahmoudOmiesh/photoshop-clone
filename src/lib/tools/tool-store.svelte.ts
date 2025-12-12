import { SvelteMap } from 'svelte/reactivity';
import { HandTool } from './hand-tool';
import type { ToolContext } from './types';
import { assert } from '$lib/utils';
import type { Tool } from './base-tool';
import type { Renderer } from '$lib/canvas/renderer';

const ALL_TOOLS = [new HandTool()];

const tools = new Map<string, Tool>(ALL_TOOLS.map((t) => [t.id, t]));

let currentToolId = $state(ALL_TOOLS[0].id);
let temporaryToolId = $state<string | null>(null);
const toolOptions = new SvelteMap<string, Record<string, unknown>>();

// Getters
export function getCurrentTool() {
	const activeId = temporaryToolId ?? currentToolId;
	const tool = tools.get(activeId);

	assert(tool);
	return tool;
}

export function getAllTools() {
	return Array.from(tools.values());
}

export function getCurrentToolId() {
	return temporaryToolId ?? currentToolId;
}

export function isToolActive(toolId: string) {
	return getCurrentToolId() === toolId;
}

// Actions
export function selectTool(toolId: string) {
	const nextTool = tools.get(toolId);

	assert(nextTool);

	if (!toolOptions.get(toolId)) {
		const defaults: Record<string, unknown> = {};
		nextTool.options.forEach((option) => {
			defaults[option.key] = option.default;
		});
		toolOptions.set(toolId, defaults);
	}

	currentToolId = toolId;
}

export function setTemporaryTool(toolId: string | null) {
	temporaryToolId = toolId;
}

export function getToolOptions(toolId: string) {
	return toolOptions.get(toolId) ?? {};
}

export function setToolOption(toolId: string, key: string, value: unknown) {
	const currentOptions = toolOptions.get(toolId);
	assert(currentOptions);
	toolOptions.set(toolId, { ...currentOptions, [key]: value });
}

export function createToolContext(renderer: Renderer): ToolContext {
	return {
		renderer,
		getOptionValue<T>(key: string): T {
			const options = getToolOptions(getCurrentToolId());
			return options[key] as T;
		}
	};
}
