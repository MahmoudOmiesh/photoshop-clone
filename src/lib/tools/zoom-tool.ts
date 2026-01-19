import { SearchIcon, ZoomInIcon, ZoomOutIcon } from '@lucide/svelte';
import { Tool } from './base-tool';
import type { PointerState, ToolOption } from './types';
import type { Editor } from '$lib/editor/editor.svelte';

export class ZoomTool extends Tool {
	readonly id = 'zoom';
	readonly name = 'Zoom';
	readonly icon = SearchIcon;
	readonly shortcut = 'z';

	readonly options: ToolOption[] = [
		{
			type: 'button-group',
			key: 'zoom-type',
			label: 'Zoom Type',
			options: [
				{ label: 'Zoom In', icon: ZoomInIcon, value: 'zoom-in' },
				{ label: 'Zoom Out', icon: ZoomOutIcon, value: 'zoom-out' }
			],
			default: 'zoom-in'
		}
	];

	override getBaseCursor(options: Record<string, unknown>): string {
		const zoomType = options['zoom-type'] as string;
		return zoomType === 'zoom-in' ? 'zoom-in' : 'zoom-out';
	}

	private isDragging = false;
	private didDrag = false;
	private initialScale = 1;
	private firstPos = { x: 0, y: 0 };

	onPointerDown(editor: Editor, pointer: PointerState) {
		this.isDragging = true;
		this.initialScale = editor.viewport.scale;
		this.firstPos = { x: pointer.x, y: pointer.y };
	}

	onPointerMove(editor: Editor, pointer: PointerState) {
		if (!this.isDragging) return;

		this.didDrag = true;

		const deltaX = pointer.x - this.firstPos.x;
		const factor = Math.pow(1.01, deltaX);

		editor.viewport.zoomTo(this.initialScale * factor, this.firstPos);
		editor.requestRender();
	}

	onPointerUp(editor: Editor) {
		this.isDragging = false;

		if (this.didDrag) {
			this.didDrag = false;
			return;
		}

		const zoomType = editor.tools.getOptionValue<'zoom-in' | 'zoom-out'>('zoom-type');

		if (zoomType === 'zoom-in') {
			editor.viewport.zoomIn(this.firstPos);
		} else {
			editor.viewport.zoomOut(this.firstPos);
		}

		editor.requestRender();
	}
}
