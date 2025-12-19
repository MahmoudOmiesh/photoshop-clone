import { MousePointerIcon } from '@lucide/svelte';
import { Tool } from './base-tool';
import type { PointerState, ToolContext, ToolOption } from './types';
import { Layer } from '$lib/document/layers/base-layer.svelte';
import { MoveLayerCommand } from '$lib/document/commands/layer/move-layer';

export class MoveTool extends Tool {
	id = 'move-tool';
	name = 'Move Tool';
	icon = MousePointerIcon;
	options: ToolOption[] = [];
	shortcut = 'v';

	private isDragging = false;
	private lastPos = { x: 0, y: 0 };

	private moveActiveLayers(ctx: ToolContext, { x, y }: { x: number; y: number }) {
		ctx.editorStore.composition?.activeLayers.forEach((layer) => {
			if (Layer.isRasterLayer(layer)) {
				ctx.editorStore.executeCommand(
					new MoveLayerCommand({
						layer,
						x,
						y
					})
				);
			}
		});
	}

	onPointerDown(_: ToolContext, pointer: PointerState) {
		this.isDragging = true;
		this.lastPos = {
			x: pointer.x,
			y: pointer.y
		};
	}

	onPointerMove(ctx: ToolContext, pointer: PointerState) {
		if (!this.isDragging) return;

		const deltaX = pointer.x - this.lastPos.x;
		const deltaY = pointer.y - this.lastPos.y;

		this.moveActiveLayers(ctx, {
			x: deltaX,
			y: deltaY
		});

		this.lastPos = { x: pointer.x, y: pointer.y };
	}

	onPointerUp() {
		this.isDragging = false;
	}

	onKeyDown(ctx: ToolContext, key: string, modifiers: PointerState['modifiers']) {
		const delta = modifiers.shift ? 10 : 1;
		let moveData = null;

		if (key === 'ArrowRight') {
			moveData = {
				x: delta,
				y: 0
			};
		}
		if (key === 'ArrowLeft') {
			moveData = {
				x: -delta,
				y: 0
			};
		}
		if (key === 'ArrowUp') {
			moveData = {
				x: 0,
				y: -delta
			};
		}
		if (key === 'ArrowDown') {
			moveData = {
				x: 0,
				y: delta
			};
		}

		if (moveData) {
			this.moveActiveLayers(ctx, moveData);
		}
	}
}
