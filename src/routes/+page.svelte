<script lang="ts">
	import { Button } from '$lib/components/ui/button';
	import { HandIcon, ZoomInIcon } from '@lucide/svelte';
	import { Layer, Rect, Stage, type KonvaWheelEvent } from 'svelte-konva';

	let isPanning = $state(false);
	let isZooming = $state(false);

	let stageRef: Stage | null = null;
	const stageConfig = $state({
		width: 0,
		height: 0
	});

	function updateZooming(e: KonvaWheelEvent) {
		if (!isZooming || !stageRef) {
			return;
		}

		e.evt.preventDefault();
		const stage = stageRef.node;
		const scaleBy = 1.08;

		const oldScale = stage.scaleX();
		const pointer = stage.getPointerPosition() ?? {
			x: 0,
			y: 0
		};

		const mousePointTo = {
			x: (pointer.x - stage.x()) / oldScale,
			y: (pointer.y - stage.y()) / oldScale
		};

		// scroll up is zoom in
		let direction = e.evt.deltaY > 0 ? -1 : 1;
		if (e.evt.ctrlKey) {
			direction = -direction;
		}

		const newScale = direction > 0 ? oldScale * scaleBy : oldScale / scaleBy;

		stage.scale({ x: newScale, y: newScale });

		const newPos = {
			x: pointer.x - mousePointTo.x * newScale,
			y: pointer.y - mousePointTo.y * newScale
		};
		stage.position(newPos);
	}
</script>

<svelte:window bind:innerWidth={stageConfig.width} bind:innerHeight={stageConfig.height} />

<Stage
	bind:this={stageRef}
	width={stageConfig.width}
	height={stageConfig.height}
	draggable={isPanning}
	onwheel={updateZooming}
>
	<Layer>
		<Rect
			width={100}
			height={100}
			fill="#27F598"
			x={window.innerWidth / 2 - 50}
			y={window.innerHeight / 2 - 50}
		/>
	</Layer>
</Stage>

<div class="absolute top-4 left-4 z-100 flex items-stretch gap-2">
	<Button variant={isPanning ? 'default' : 'outline'} onclick={() => (isPanning = !isPanning)}>
		<HandIcon />
	</Button>

	<Button variant={isZooming ? 'default' : 'outline'} onclick={() => (isZooming = !isZooming)}>
		<ZoomInIcon />
	</Button>
</div>
