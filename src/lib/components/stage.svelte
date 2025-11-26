<script lang="ts">
	import { Button } from '$lib/components/ui/button';
	import { HandIcon, ZoomInIcon } from '@lucide/svelte';
	import { Image, Layer, Rect, Stage, type KonvaWheelEvent } from 'svelte-konva';
	import ImagePicker from './image-picker.svelte';

	let isPanning = $state(false);
	let isZooming = $state(false);

	let image: HTMLImageElement = $state(null);

	let stageRef: Stage | null = null;
	const stageConfig = $state({
		width: 0,
		height: 0
	});

	function createImage(imageFile: File) {
		const imageElement = document.createElement('img');
		imageElement.src = URL.createObjectURL(imageFile);
		imageElement.onload = () => {
			image = imageElement;
		};
	}

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
		{#if image}
			<Image
				{image}
				x={0.5 * (stageConfig.width - image.width)}
				y={0.5 * (stageConfig.height - image.height)}
			/>
		{/if}
	</Layer>
</Stage>

<div class="absolute top-4 left-4 z-100 flex items-stretch gap-2">
	<ImagePicker onImageAdded={createImage} />

	<Button variant={isPanning ? 'default' : 'outline'} onclick={() => (isPanning = !isPanning)}>
		<HandIcon />
	</Button>

	<Button variant={isZooming ? 'default' : 'outline'} onclick={() => (isZooming = !isZooming)}>
		<ZoomInIcon />
	</Button>
</div>
