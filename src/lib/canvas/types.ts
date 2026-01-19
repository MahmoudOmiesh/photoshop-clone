// all cooridnates here will be viewport coordinates

export type SnapSourceType = 'composition-edge' | 'composition-center';

// something that can be snapped to
export interface SnapSource {
	type: SnapSourceType;
	x?: number;
	y?: number;
}

export interface SnapTarget {
	top: number;
	right: number;
	bottom: number;
	left: number;
}

export interface SnapGuide {
	type: 'horizontal' | 'vertical';
	position: number;
	start: number;
	end: number;
	snapSourceType: SnapSourceType;
}

export interface SnapResult {
	deltaX: number;
	deltaY: number;
	guides: SnapGuide[];
}