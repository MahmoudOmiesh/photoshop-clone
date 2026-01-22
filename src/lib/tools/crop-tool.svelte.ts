import { CheckIcon, CropIcon, XIcon } from '@lucide/svelte';
import type { PointerState, ToolAction, ToolOption } from './types';
import { Tool } from './base-tool';
import type { Editor } from '$lib/editor/editor.svelte';
import type { Point } from '$lib/editor/managers';
import { assert } from '$lib/utils';
import { CropCompositionCommand } from '$lib/document/commands/crop-composition';
import type { SnapTarget } from '$lib/canvas/types';

export interface CropRect {
	// relative to the composition
	x: number;
	y: number;
	width: number;
	height: number;
	rotation: number;
}

export type CropHandle =
	| 'nw'
	| 'n'
	| 'ne'
	| 'w'
	| 'e'
	| 'sw'
	| 's'
	| 'se'
	| 'rotate-nw'
	| 'rotate-ne'
	| 'rotate-sw'
	| 'rotate-se'
	| 'move'; // inside the crop rect

export class CropTool extends Tool {
	readonly id = 'crop';
	readonly name = 'Crop';
	readonly icon = CropIcon;
	readonly options: ToolOption[] = [];
	readonly shortcut = 'c';

	readonly actions: ToolAction[] = [
		{
			key: 'cancel',
			label: 'Cancel',
			icon: XIcon,
			action: (editor: Editor) => this.cancel(editor)
		},
		{
			key: 'confirm',
			label: 'Confirm',
			icon: CheckIcon,
			action: (editor: Editor) => this.confirm(editor)
		}
	];

	cropRect = $state<CropRect | null>(null);

	private activeHandle: CropHandle | null = null;

	private initialRect: CropRect | null = null;
	private dragStart = { x: 0, y: 0 };
	private initialAngle: number = 0;
	private initialSnapTarget: SnapTarget | null = null;

	onActivate(editor: Editor) {
		const comp = editor.document.composition;
		if (!comp) return;

		this.cropRect = {
			x: 0,
			y: 0,
			width: comp.dimensions.width,
			height: comp.dimensions.height,
			rotation: 0
		};
		editor.requestRender();
	}

	onDeactivate(editor: Editor) {
		this.cropRect = null;
		editor.requestRender();
	}

	confirm(editor: Editor) {
		if (!this.cropRect) return;
		editor.document.executeCommand(new CropCompositionCommand(this.cropRect));
		editor.tools.selectTool('hand');
	}

	cancel(editor: Editor) {
		editor.tools.selectTool('hand');
	}

	onPointerDown(editor: Editor, pointer: PointerState) {
		assert(this.cropRect);
		this.activeHandle = this.getHandleAtPoint(editor, pointer);

		if (this.activeHandle) {
			this.dragStart = { x: pointer.x, y: pointer.y };
			this.initialRect = { ...this.cropRect! };
			this.initialSnapTarget = this.getCropSnapTarget(editor);

			if (this.activeHandle.startsWith('rotate-')) {
				const center = {
					x: this.cropRect.x + this.cropRect.width / 2,
					y: this.cropRect.y + this.cropRect.height / 2
				};
				this.initialAngle = Math.atan2(pointer.y - center.y, pointer.x - center.x);
			}
		}
	}

	onPointerMove(editor: Editor, pointer: PointerState) {
		if (!this.activeHandle) {
			// Update cursor based on hovered handle
			const handle = this.getHandleAtPoint(editor, pointer);
			this.updateCursorForHandle(editor, handle);
			return;
		}

		// Calculate delta and update crop rect based on which handle is being dragged
		const delta = {
			x: pointer.x - this.dragStart.x,
			y: pointer.y - this.dragStart.y
		};

		this.applyCropTransform(editor, this.activeHandle, delta);
	}

	onPointerUp(editor: Editor) {
		this.activeHandle = null;
		this.initialRect = null;
		this.initialSnapTarget = null;
		editor.ui.clearSnapGuides();
	}

	private setRect(editor: Editor, cropRect: Partial<CropRect>) {
		if (!this.cropRect) return;

		const newRect = { ...this.cropRect, ...cropRect };

		// // Enforce aspect ratio if locked
		// if (this._aspectLocked && this._lockedAspectRatio && rect.width) {
		//   newRect.height = newRect.width / this._lockedAspectRatio;
		// } else if (this._aspectLocked && this._lockedAspectRatio && rect.height) {
		//   newRect.width = newRect.height * this._lockedAspectRatio;
		// }

		this.cropRect = newRect;
		editor.requestRender();
	}

	private getCropSnapTarget(editor: Editor): SnapTarget | null {
		if (!this.cropRect) return null;

		const compositionBounds = editor.viewport.getCompositionBounds();
		if (!compositionBounds) return null;

		// Convert crop rect (composition-relative) to viewport coordinates
		const left = compositionBounds.topLeft.x + this.cropRect.x;
		const top = compositionBounds.topLeft.y + this.cropRect.y;

		return {
			top,
			left,
			right: left + this.cropRect.width,
			bottom: top + this.cropRect.height
		};
	}

	private getHandleAtPoint(editor: Editor, point: Point): CropHandle | null {
		assert(this.cropRect);

		const viewportPoint = editor.viewport.screenToViewport(point);
		const compositionBounds = editor.viewport.getCompositionBounds();
		if (!compositionBounds) return null;

		// Center of the crop rect in viewport space
		const centerX = compositionBounds.topLeft.x + this.cropRect.x + this.cropRect.width / 2;
		const centerY = compositionBounds.topLeft.y + this.cropRect.y + this.cropRect.height / 2;

		// Translate point so center is at origin
		const dx = viewportPoint.x - centerX;
		const dy = viewportPoint.y - centerY;

		// Inverse-rotate the point by -rotation to get it in the crop rect's local space
		const cos = Math.cos(-this.cropRect.rotation);
		const sin = Math.sin(-this.cropRect.rotation);
		const localX = dx * cos - dy * sin;
		const localY = dx * sin + dy * cos;

		// Now translate so origin is at top-left of crop rect
		const pointInCropRect = {
			x: localX + this.cropRect.width / 2,
			y: localY + this.cropRect.height / 2
		};

		const handleSize = 8 / editor.viewport.scale;
		const rotateHandleSize = 30 / editor.viewport.scale;
		const rotateOffset = 30;

		type HandleDetect = { handle: CropHandle; x: number; y: number };
		const handles: HandleDetect[] = [];

		// Corners
		handles.push({ handle: 'nw', x: 0, y: 0 });
		handles.push({ handle: 'ne', x: this.cropRect.width, y: 0 });
		handles.push({ handle: 'sw', x: 0, y: this.cropRect.height });
		handles.push({ handle: 'se', x: this.cropRect.width, y: this.cropRect.height });

		// Edges (center of each edge)
		handles.push({ handle: 'n', x: this.cropRect.width / 2, y: 0 });
		handles.push({ handle: 's', x: this.cropRect.width / 2, y: this.cropRect.height });
		handles.push({ handle: 'w', x: 0, y: this.cropRect.height / 2 });
		handles.push({ handle: 'e', x: this.cropRect.width, y: this.cropRect.height / 2 });

		// Rotate handles
		const rotateHandles: HandleDetect[] = [
			{ handle: 'rotate-nw', x: 0 - rotateOffset, y: 0 - rotateOffset },
			{ handle: 'rotate-ne', x: this.cropRect.width + rotateOffset, y: 0 - rotateOffset },
			{ handle: 'rotate-sw', x: 0 - rotateOffset, y: this.cropRect.height + rotateOffset },
			{
				handle: 'rotate-se',
				x: this.cropRect.width + rotateOffset,
				y: this.cropRect.height + rotateOffset
			}
		];

		// Hit test normal handles
		for (const h of handles) {
			if (
				Math.abs(pointInCropRect.x - h.x) <= handleSize / 2 &&
				Math.abs(pointInCropRect.y - h.y) <= handleSize / 2
			) {
				return h.handle;
			}
		}

		for (const h of rotateHandles) {
			if (
				Math.abs(pointInCropRect.x - h.x) <= rotateHandleSize &&
				Math.abs(pointInCropRect.y - h.y) <= rotateHandleSize
			) {
				return h.handle;
			}
		}

		if (
			pointInCropRect.x >= handleSize &&
			pointInCropRect.x <= this.cropRect.width - handleSize &&
			pointInCropRect.y >= handleSize &&
			pointInCropRect.y <= this.cropRect.height - handleSize
		) {
			return 'move';
		}

		return null;
	}

	private updateCursorForHandle(editor: Editor, handle: CropHandle | null) {
		const cursors: Record<CropHandle, string> = {
			nw: 'nwse-resize',
			n: 'ns-resize',
			ne: 'nesw-resize',
			w: 'ew-resize',
			e: 'ew-resize',
			sw: 'nesw-resize',
			s: 'ns-resize',
			se: 'nwse-resize',
			// TODO: rotate handles
			'rotate-nw': 'crosshair',
			'rotate-ne': 'crosshair',
			'rotate-sw': 'crosshair',
			'rotate-se': 'crosshair',
			move: 'move'
		};

		editor.ui.setOverrideCursor(handle ? cursors[handle] : 'default');
	}

	private applyCropTransform(editor: Editor, handle: CropHandle, delta: { x: number; y: number }) {
		if (!this.initialRect || !this.initialSnapTarget) return;

		if (handle.startsWith('rotate-')) {
			const center = {
				x: this.initialRect.x + this.initialRect.width / 2,
				y: this.initialRect.y + this.initialRect.height / 2
			};

			const currentAngle = Math.atan2(
				this.dragStart.y + delta.y - center.y,
				this.dragStart.x + delta.x - center.x
			);

			const deltaAngle = currentAngle - this.initialAngle;
			this.setRect(editor, { rotation: this.initialRect.rotation + deltaAngle });
			return;
		}

		const intendedSnapTarget = this.calculateIntendedSnapTarget(handle, delta);
		const snapResult = editor.snap.calculateSnap(intendedSnapTarget);

		const snapDeltaX = snapResult?.deltaX ?? 0;
		const snapDeltaY = snapResult?.deltaY ?? 0;

		switch (handle) {
			case 'move':
				this.setRect(editor, {
					x: this.initialRect.x + delta.x + snapDeltaX,
					y: this.initialRect.y + delta.y + snapDeltaY
				});
				break;

			case 'e':
				this.setRect(editor, {
					width: this.initialRect.width + delta.x + snapDeltaX
				});
				break;

			case 's':
				this.setRect(editor, {
					height: this.initialRect.height + delta.y + snapDeltaY
				});
				break;

			case 'w':
				this.setRect(editor, {
					x: this.initialRect.x + delta.x + snapDeltaX,
					width: this.initialRect.width - delta.x - snapDeltaX
				});
				break;

			case 'n':
				this.setRect(editor, {
					y: this.initialRect.y + delta.y + snapDeltaY,
					height: this.initialRect.height - delta.y - snapDeltaY
				});
				break;

			case 'se':
				this.setRect(editor, {
					width: this.initialRect.width + delta.x + snapDeltaX,
					height: this.initialRect.height + delta.y + snapDeltaY
				});
				break;

			case 'sw':
				this.setRect(editor, {
					x: this.initialRect.x + delta.x + snapDeltaX,
					width: this.initialRect.width - delta.x - snapDeltaX,
					height: this.initialRect.height + delta.y + snapDeltaY
				});
				break;

			case 'ne':
				this.setRect(editor, {
					y: this.initialRect.y + delta.y + snapDeltaY,
					width: this.initialRect.width + delta.x + snapDeltaX,
					height: this.initialRect.height - delta.y - snapDeltaY
				});
				break;

			case 'nw':
				this.setRect(editor, {
					x: this.initialRect.x + delta.x + snapDeltaX,
					y: this.initialRect.y + delta.y + snapDeltaY,
					width: this.initialRect.width - delta.x - snapDeltaX,
					height: this.initialRect.height - delta.y - snapDeltaY
				});
				break;
		}

		if (snapResult) {
			editor.ui.setSnapGuides(snapResult.guides);
		} else {
			editor.ui.clearSnapGuides();
		}
	}

	private calculateIntendedSnapTarget(
		handle: CropHandle,
		delta: { x: number; y: number }
	): SnapTarget {
		const initial = this.initialSnapTarget!;

		switch (handle) {
			case 'move':
				return {
					top: initial.top + delta.y,
					left: initial.left + delta.x,
					bottom: initial.bottom + delta.y,
					right: initial.right + delta.x
				};

			case 'e':
				return { ...initial, right: initial.right + delta.x };

			case 's':
				return { ...initial, bottom: initial.bottom + delta.y };

			case 'w':
				return { ...initial, left: initial.left + delta.x };

			case 'n':
				return { ...initial, top: initial.top + delta.y };

			case 'se':
				return {
					...initial,
					right: initial.right + delta.x,
					bottom: initial.bottom + delta.y
				};

			case 'sw':
				return {
					...initial,
					left: initial.left + delta.x,
					bottom: initial.bottom + delta.y
				};

			case 'ne':
				return {
					...initial,
					top: initial.top + delta.y,
					right: initial.right + delta.x
				};

			case 'nw':
				return {
					...initial,
					top: initial.top + delta.y,
					left: initial.left + delta.x
				};

			default:
				return initial;
		}
	}
}
