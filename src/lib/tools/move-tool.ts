import { MousePointerIcon } from '@lucide/svelte';
import { Tool } from './base-tool';
import type { PointerState } from './types';
import type { Editor } from '$lib/editor/editor.svelte';
import { MoveLayerCommand } from '$lib/document/commands/layer/move-layer';
import type { SnapTarget } from '$lib/canvas/types';
import type { RasterLayer } from '$lib/document/layers/raster-layer';

export class MoveTool extends Tool {
	readonly id = 'move';
	readonly name = 'Move';
	readonly icon = MousePointerIcon;
	readonly options = [];
	readonly actions = [];
	readonly shortcut = 'v';

	private isDragging = false;
	private startPos = { x: 0, y: 0 };
	private initialLayerBounds: SnapTarget | null = null;

	private getActiveLayersSnapTarget(layers: RasterLayer[], editor: Editor): SnapTarget {
		const snapTarget: SnapTarget = {
			top: Infinity,
			left: Infinity,
			bottom: -Infinity,
			right: -Infinity
		};

		for (const layer of layers) {
			const bounds = editor.viewport.getLayerBounds(layer);
			if (!bounds) continue;

			snapTarget.top = Math.min(snapTarget.top, bounds.topLeft.y);
			snapTarget.left = Math.min(snapTarget.left, bounds.topLeft.x);
			snapTarget.bottom = Math.max(snapTarget.bottom, bounds.topLeft.y + bounds.height);
			snapTarget.right = Math.max(snapTarget.right, bounds.topLeft.x + bounds.width);
		}

		return snapTarget;
	}

	onPointerDown(editor: Editor, pointer: PointerState) {
		this.isDragging = true;
		this.startPos = { x: pointer.x, y: pointer.y };

		const activeLayers = editor.document.activeRasterLayers;
		this.initialLayerBounds = this.getActiveLayersSnapTarget(activeLayers, editor);
	}

	onPointerMove(editor: Editor, pointer: PointerState) {
		if (!this.isDragging || !this.initialLayerBounds) return;

		const totalDeltaX = pointer.x - this.startPos.x;
		const totalDeltaY = pointer.y - this.startPos.y;

		const activeRasterLayers = editor.document.activeRasterLayers;

		const intendedSnapTarget: SnapTarget = {
			top: this.initialLayerBounds.top + totalDeltaY,
			right: this.initialLayerBounds.right + totalDeltaX,
			bottom: this.initialLayerBounds.bottom + totalDeltaY,
			left: this.initialLayerBounds.left + totalDeltaX
		};

		const snapResult = editor.snap.calculateSnap(intendedSnapTarget);
		const currentSnapTarget = this.getActiveLayersSnapTarget(activeRasterLayers, editor);

		const moveX = intendedSnapTarget.left - currentSnapTarget.left + (snapResult?.deltaX ?? 0);
		const moveY = intendedSnapTarget.top - currentSnapTarget.top + (snapResult?.deltaY ?? 0);

		editor.document.executeCommand(
			new MoveLayerCommand({
				layers: activeRasterLayers,
				x: moveX,
				y: moveY
			})
		);

		if (snapResult) {
			editor.ui.setSnapGuides(snapResult.guides);
		} else {
			editor.ui.clearSnapGuides();
		}
	}

	onPointerUp(editor: Editor) {
		this.isDragging = false;
		this.initialLayerBounds = null;
		editor.ui.clearSnapGuides();
	}

	onKeyDown(editor: Editor, key: string, modifiers: PointerState['modifiers']) {
		const activeRasterLayers = editor.document.activeRasterLayers;
		if (activeRasterLayers.length === 0) return;

		const delta = modifiers.shift ? 10 : 1;
		let moveData: { x: number; y: number } | null = null;

		switch (key) {
			case 'ArrowRight':
				moveData = { x: delta, y: 0 };
				break;
			case 'ArrowLeft':
				moveData = { x: -delta, y: 0 };
				break;
			case 'ArrowUp':
				moveData = { x: 0, y: -delta };
				break;
			case 'ArrowDown':
				moveData = { x: 0, y: delta };
				break;
		}

		if (moveData) {
			editor.document.executeCommand(
				new MoveLayerCommand({
					layers: activeRasterLayers,
					x: moveData.x,
					y: moveData.y
				})
			);
		}
	}
}
