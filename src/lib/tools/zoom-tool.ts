import { SearchIcon, ZoomInIcon, ZoomOutIcon } from '@lucide/svelte';
import { Tool } from './base-tool';
import type { PointerState, ToolContext, ToolOption } from './types';

export class ZoomTool extends Tool {
	id = 'zoom-tool';
	name = 'Zoom Tool';
	icon = SearchIcon;
	options: ToolOption[] = [
		{
			type: 'button-group',
			key: 'zoom-type',
			label: 'Zoom Type',
			options: [
				{
					label: 'Zoom In',
					icon: ZoomInIcon,
					value: 'zoom-in'
				},
				{
					label: 'Zoom Out',
					icon: ZoomOutIcon,
					value: 'zoom-out'
				}
			],
			default: 'zoom-in'
		}
	];

	getBaseCursor(options: Record<string, unknown>): string {
		const zoomType = options['zoom-type'] as string;
		return zoomType === 'zoom-in' ? 'zoom-in' : 'zoom-out';
	}

	shortcut = 'z';

	private isDragging = false;
	private didDrag = false;
	private initialScale = 1;
	private firstPos = { x: 0, y: 0 };

	onPointerDown(ctx: ToolContext, pointer: PointerState) {
		this.isDragging = true;
		this.initialScale = ctx.renderer.getViewport().getScale();
		this.firstPos = {
			x: pointer.x,
			y: pointer.y
		};
	}

	onPointerMove(ctx: ToolContext, pointer: PointerState) {
		if (!this.isDragging) return;
		this.didDrag = true;

		const deltaX = pointer.x - this.firstPos.x;
		const factor = Math.pow(1.01, deltaX);

		ctx.renderer.getViewport().zoomTo({
			scale: this.initialScale * factor,
			pivotX: this.firstPos.x,
			pivotY: this.firstPos.y
		});
		ctx.renderer.requestRerender();
	}

	onPointerUp(ctx: ToolContext) {
		this.isDragging = false;
		if (this.didDrag) {
			this.didDrag = false;
		} else {
			// Find a way to make this type safe with options
			const zoomType = ctx.getOptionValue('zoom-type') as 'zoom-in' | 'zoom-out';
			const pivot = {
				pivotX: this.firstPos.x,
				pivotY: this.firstPos.y
			};

			if (zoomType === 'zoom-in') ctx.renderer.getViewport().zoomIn(pivot);
			if (zoomType === 'zoom-out') ctx.renderer.getViewport().zoomOut(pivot);

			ctx.renderer.requestRerender();
		}
	}
}
