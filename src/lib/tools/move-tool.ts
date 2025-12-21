import { MousePointerIcon } from '@lucide/svelte';
import { Tool } from './base-tool';
import type { PointerState, ToolContext, ToolOption } from './types';
import { Layer } from '$lib/document/layers/base-layer.svelte';
import { MoveLayerCommand } from '$lib/document/commands/layer/move-layer';
import { assert } from '$lib/utils';
import type { SnapTarget } from '$lib/snap/types';
import type { RasterLayer } from '$lib/document/layers/raster-layer';

export class MoveTool extends Tool {
	id = 'move-tool';
	name = 'Move Tool';
	icon = MousePointerIcon;
	options: ToolOption[] = [];
	shortcut = 'v';

	private isDragging = false;
	private startPos = { x: 0, y: 0 };
	private initialLayerBounds: SnapTarget | null = null;

	private getActiveRasterLayers(ctx: ToolContext) {
		assert(ctx.editorStore.composition);
		return ctx.editorStore.composition.activeLayers.filter((layer) => Layer.isRasterLayer(layer));
	}

	private getActiveLayersSnapTarget(activeLayers: RasterLayer[], ctx: ToolContext) {
		assert(ctx.editorStore.renderer);

		const snapTarget: SnapTarget = {
			top: Infinity,
			left: Infinity,
			bottom: -Infinity,
			right: -Infinity
		};

		for (const layer of activeLayers) {
			const layerCoords = ctx.editorStore.renderer.getViewport().getLayerCoords(layer);
			snapTarget.top = Math.min(snapTarget.top, layerCoords.topLeft.y);
			snapTarget.left = Math.min(snapTarget.left, layerCoords.topLeft.x);
			snapTarget.bottom = Math.max(snapTarget.bottom, layerCoords.topLeft.y + layerCoords.height);
			snapTarget.right = Math.max(snapTarget.right, layerCoords.topLeft.x + layerCoords.width);
		}

		return snapTarget;
	}

	onPointerDown(ctx: ToolContext, pointer: PointerState) {
		this.isDragging = true;
		this.startPos = {
			x: pointer.x,
			y: pointer.y
		};

		const activeLayers = this.getActiveRasterLayers(ctx);
		this.initialLayerBounds = this.getActiveLayersSnapTarget(activeLayers, ctx);
	}

	onPointerMove(ctx: ToolContext, pointer: PointerState) {
		if (!this.isDragging) return;
		assert(ctx.editorStore.composition);
		assert(ctx.editorStore.renderer);
		assert(this.initialLayerBounds);

		const totalDeltaX = pointer.x - this.startPos.x;
		const totalDeltaY = pointer.y - this.startPos.y;

		const activeRasterLayers = this.getActiveRasterLayers(ctx);

		const intendedSnapTarget: SnapTarget = {
			top: this.initialLayerBounds.top + totalDeltaY,
			right: this.initialLayerBounds.right + totalDeltaX,
			bottom: this.initialLayerBounds.bottom + totalDeltaY,
			left: this.initialLayerBounds.left + totalDeltaX
		};
		const snapResult = ctx.editorStore.snapManager.calculateSnap({
			target: intendedSnapTarget,
			composition: ctx.editorStore.composition,
			viewport: ctx.editorStore.renderer.getViewport()
		});

		const currentSnapTarget = this.getActiveLayersSnapTarget(activeRasterLayers, ctx);

		const moveX = intendedSnapTarget.left - currentSnapTarget.left + (snapResult?.deltaX ?? 0);
		const moveY = intendedSnapTarget.top - currentSnapTarget.top + (snapResult?.deltaY ?? 0);

		ctx.editorStore.executeCommand(
			new MoveLayerCommand({
				layers: activeRasterLayers,
				x: moveX,
				y: moveY
			})
		);

		if (snapResult) {
			ctx.editorStore.renderer.setSnapGuides(snapResult.guides);
		} else {
			ctx.editorStore.renderer.clearSnapGuides();
		}
	}

	onPointerUp(ctx: ToolContext) {
		assert(ctx.editorStore.renderer);

		this.isDragging = false;
		ctx.editorStore.renderer.clearSnapGuides();
	}

	onKeyDown(ctx: ToolContext, key: string, modifiers: PointerState['modifiers']) {
		assert(ctx.editorStore.composition);
		const activeRasterLayers = ctx.editorStore.composition.activeLayers.filter((layer) =>
			Layer.isRasterLayer(layer)
		);

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
			ctx.editorStore.executeCommand(
				new MoveLayerCommand({
					layers: activeRasterLayers,
					x: moveData.x,
					y: moveData.y
				})
			);
		}
	}
}
