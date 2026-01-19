import type { Composition } from '$lib/document/composition.svelte';
import type { ViewportStore, Bounds } from '$lib/stores/viewport.svelte';
import type { SnapGuide, SnapResult, SnapSource, SnapTarget } from './types';

interface SnapManagerConfig {
	threshold: number;
	snapToComposition: boolean;
}

const DEFAULT_CONFIG: SnapManagerConfig = {
	threshold: 6,
	snapToComposition: true
};

interface ViewportLike {
	getCompositionBounds(): Bounds | null;
}

export class SnapManager {
	private config: SnapManagerConfig;

	constructor(config?: Partial<SnapManagerConfig>) {
		this.config = { ...DEFAULT_CONFIG, ...config };
	}

	calculateSnap(params: {
		target: SnapTarget;
		composition: Composition;
		viewportStore: ViewportStore;
	}): SnapResult | null {
		const { target, viewportStore } = params;

		const sources = this.getSnapSources(viewportStore);

		const snapResultX = this.findHorizontalSnap({ sources, target });
		const snapResultY = this.findVerticalSnap({ sources, target });

		if (!snapResultX && !snapResultY) return null;

		const guides: SnapGuide[] = [];
		if (snapResultX) guides.push(snapResultX.guideX);
		if (snapResultY) guides.push(snapResultY.guideY);

		return {
			deltaX: snapResultX?.deltaX ?? 0,
			deltaY: snapResultY?.deltaY ?? 0,
			guides
		};
	}

	private getSnapSources(viewport: ViewportLike): SnapSource[] {
		const sources: SnapSource[] = [];

		if (this.config.snapToComposition) {
			const bounds = viewport.getCompositionBounds();
			if (!bounds) return sources;

			const { topLeft, width, height } = bounds;

			sources.push(
				{ type: 'composition-edge', x: topLeft.x },
				{ type: 'composition-edge', x: topLeft.x + width },
				{ type: 'composition-edge', y: topLeft.y },
				{ type: 'composition-edge', y: topLeft.y + height },
				{ type: 'composition-center', x: topLeft.x + width / 2 },
				{ type: 'composition-center', y: topLeft.y + height / 2 }
			);
		}

		return sources;
	}

	private findHorizontalSnap(params: {
		target: SnapTarget;
		sources: SnapSource[];
	}): { deltaX: number; guideX: SnapGuide } | null {
		const { target, sources } = params;
		const threshold = this.config.threshold;

		const targetXPositions = [target.left, target.right, 0.5 * (target.right - target.left)];
		let bestSnap: { distance: number; adjustment: number; source: SnapSource } | null = null;

		for (const source of sources) {
			if (source.x === undefined) continue;

			for (const pos of targetXPositions) {
				const distance = Math.abs(source.x - pos);
				if (distance < threshold && (!bestSnap || distance < bestSnap.distance)) {
					bestSnap = { distance, adjustment: source.x - pos, source };
				}
			}
		}

		if (!bestSnap || bestSnap.source.x === undefined) return null;

		return {
			deltaX: bestSnap.adjustment,
			guideX: {
				type: 'vertical',
				position: bestSnap.source.x,
				start: target.top,
				end: target.bottom,
				snapSourceType: bestSnap.source.type
			}
		};
	}

	private findVerticalSnap(params: {
		target: SnapTarget;
		sources: SnapSource[];
	}): { deltaY: number; guideY: SnapGuide } | null {
		const { target, sources } = params;
		const threshold = this.config.threshold;

		const targetYPositions = [target.top, target.bottom, 0.5 * (target.bottom - target.top)];
		let bestSnap: { distance: number; adjustment: number; source: SnapSource } | null = null;

		for (const source of sources) {
			if (source.y === undefined) continue;

			for (const pos of targetYPositions) {
				const distance = Math.abs(source.y - pos);
				if (distance < threshold && (!bestSnap || distance < bestSnap.distance)) {
					bestSnap = { distance, adjustment: source.y - pos, source };
				}
			}
		}

		if (!bestSnap || bestSnap.source.y === undefined) return null;

		return {
			deltaY: bestSnap.adjustment,
			guideY: {
				type: 'horizontal',
				position: bestSnap.source.y,
				start: target.left,
				end: target.right,
				snapSourceType: bestSnap.source.type
			}
		};
	}
}
