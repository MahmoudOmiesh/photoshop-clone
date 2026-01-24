import { RotateCcwIcon } from '@lucide/svelte';
import { Tool } from './base-tool';
import type { PointerState } from './types';
import type { Editor } from '$lib/editor/editor.svelte';

export class RotateViewTool extends Tool {
	readonly id = 'rotate-view';
	readonly name = 'Rotate View';
	readonly icon = RotateCcwIcon;
	readonly options = [];
	readonly actions = [];
	readonly shortcut = 'r';

	private isDragging = false;
	private lastAngle = 0;

	getBaseCursor() {
		return 'crosshair';
	}

	onPointerDown(editor: Editor, pointer: PointerState) {
		this.isDragging = true;
		const center = editor.viewport.containerCenter;
		this.lastAngle = Math.atan2(pointer.y - center.y, pointer.x - center.x);
	}

	onPointerMove(editor: Editor, pointer: PointerState) {
		if (!this.isDragging) return;

		const center = editor.viewport.containerCenter;
		const currentAngle = Math.atan2(pointer.y - center.y, pointer.x - center.x);
		const deltaRotation = currentAngle - this.lastAngle;

		editor.viewport.rotate((deltaRotation * 180) / Math.PI);
		editor.requestRender();

		// Update last angle for next frame
		this.lastAngle = currentAngle;
	}

	onPointerUp() {
		this.isDragging = false;
	}
}
