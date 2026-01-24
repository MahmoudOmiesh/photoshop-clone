import { HandIcon } from '@lucide/svelte';
import { Tool } from './base-tool';
import type { PointerState } from './types';
import type { Editor } from '$lib/editor/editor.svelte';

export class HandTool extends Tool {
	readonly id = 'hand';
	readonly name = 'Hand';
	readonly icon = HandIcon;
	readonly options = [];
	readonly actions = [];
	readonly shortcut = 'h';

	private isDragging = false;
	private lastPos = { x: 0, y: 0 };

	getBaseCursor() {
		return 'grab';
	}

	onPointerDown(editor: Editor, pointer: PointerState) {
		this.isDragging = true;
		this.lastPos = { x: pointer.x, y: pointer.y };
		editor.ui.setOverrideCursor('grabbing');
	}

	onPointerMove(editor: Editor, pointer: PointerState) {
		if (!this.isDragging) return;

		const screenDelta = {
			x: pointer.x - this.lastPos.x,
			y: pointer.y - this.lastPos.y
		};
		// Convert screen delta for panning (accounts for rotation so content follows cursor)
		const panDelta = editor.viewport.screenDeltaForPan(screenDelta);

		editor.viewport.pan(panDelta);
		editor.requestRender();

		this.lastPos = { x: pointer.x, y: pointer.y };
	}

	onPointerUp(editor: Editor) {
		this.isDragging = false;
		editor.ui.clearOverrideCursor();
	}
}
