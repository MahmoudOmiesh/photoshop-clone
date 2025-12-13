import { Package2Icon } from '@lucide/svelte';
import { Tool } from './base-tool';
import type { ToolOption } from './types';

export class MockTool extends Tool {
	id = 'mock-tool';
	name = 'Mock Tool';
	icon = Package2Icon;
	options: ToolOption[] = [];
	cursor = 'grabbing';
}
