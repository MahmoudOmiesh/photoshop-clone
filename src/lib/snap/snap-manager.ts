import { Viewport } from '$lib/canvas/viewport';
import type { Composition } from '$lib/document/composition.svelte';
import type { SnapGuide, SnapResult, SnapSource, SnapTarget } from './types';

interface SnapManagerConfig {
	threshold: number;
	snapToComposition: boolean;
}

const DEFAULT_CONFIG: SnapManagerConfig = {
	threshold: 6,
	snapToComposition: true
};

export class SnapManager {
	private config: SnapManagerConfig;

	constructor(config?: Partial<SnapManagerConfig>) {
		this.config = { ...DEFAULT_CONFIG, ...config };
	}

	calculateSnap(params: { target: SnapTarget; composition: Composition; viewport: Viewport }) {
		const { target, composition, viewport } = params;

		const sources = this.getSnapSources({ composition, viewport });

		const snapResultX = this.findHorizontalSnap({ sources, target });
		const snapResultY = this.findVerticalSnap({ sources, target });

		if (!snapResultX && !snapResultY) return null;

		const guides: SnapGuide[] = [];
		if (snapResultX) guides.push(snapResultX.guideX);
		if (snapResultY) guides.push(snapResultY.guideY);

		const result: SnapResult = {
			deltaX: snapResultX?.deltaX ?? 0,
			deltaY: snapResultY?.deltaY ?? 0,
			guides
		};
		return result;
	}

	private getSnapSources(params: { composition: Composition; viewport: Viewport }) {
		const { viewport } = params;
		const sources: SnapSource[] = [];

		if (this.config.snapToComposition) {
			const { topLeft, width, height } = viewport.getCompositionCoords();

			sources.push(
				{
					type: 'composition-edge',
					x: topLeft.x
				},
				{
					type: 'composition-edge',
					x: topLeft.x + width
				},
				{
					type: 'composition-edge',
					y: topLeft.y
				},
				{
					type: 'composition-edge',
					y: topLeft.y + height
				},
				{
					type: 'composition-center',
					x: topLeft.x + width / 2
				},
				{
					type: 'composition-center',
					y: topLeft.y + height / 2
				}
			);
		}

		return sources;
	}

	private findHorizontalSnap(params: { target: SnapTarget; sources: SnapSource[] }) {
		const { target, sources } = params;
		const threshold = this.config.threshold;

		const targetXPositions = [target.left, target.right, 0.5 * (target.right - target.left)];
		let bestSnap: { distance: number; adjustment: number; source: SnapSource } | null = null;

		for (const source of sources) {
			if (!source.x) continue;

			for (const pos of targetXPositions) {
				const distance = Math.abs(source.x - pos);
				if (distance < threshold) {
					if (!bestSnap || distance < bestSnap.distance) {
						bestSnap = {
							distance,
							adjustment: source.x! - pos,
							source: source
						};
					}
				}
			}
		}

		if (!bestSnap) {
			return null;
		}

		const guideX: SnapGuide = {
			type: 'vertical',
			position: bestSnap.source.x!,
			start: target.top,
			end: target.bottom,
			snapSourceType: bestSnap.source.type
		};

		return {
			deltaX: bestSnap.adjustment,
			guideX
		};
	}

	private findVerticalSnap(params: { target: SnapTarget; sources: SnapSource[] }) {
		const { target, sources } = params;
		const threshold = this.config.threshold;

		const targetYPositions = [target.top, target.bottom, 0.5 * (target.bottom - target.top)];
		let bestSnap: { distance: number; adjustment: number; source: SnapSource } | null = null;

		for (const source of sources) {
			if (!source.y) continue;

			for (const pos of targetYPositions) {
				const distance = Math.abs(source.y - pos);
				if (distance < threshold) {
					if (!bestSnap || distance < bestSnap.distance) {
						bestSnap = {
							distance,
							adjustment: source.y! - pos,
							source: source
						};
					}
				}
			}
		}

		if (!bestSnap) {
			return null;
		}

		const guideY: SnapGuide = {
			type: 'horizontal',
			position: bestSnap.source.y!,
			start: target.left,
			end: target.right,
			snapSourceType: bestSnap.source.type
		};

		return {
			deltaY: bestSnap.adjustment,
			guideY
		};
	}
}
