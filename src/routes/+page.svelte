<script lang="ts">
	import { Button } from '$lib/components/ui/button';
	import { HandIcon } from '@lucide/svelte';
	import { onMount } from 'svelte';

	let canvas: HTMLCanvasElement | null = $state(null);
	let ctx: CanvasRenderingContext2D | null = $derived.by(() => {
		if (canvas) {
			return canvas.getContext('2d');
		}
		return null;
	});

	let isDragging = $state(false);
	let isMouseDown = false;

	const prevMouseCoords = { x: 0, y: 0 };
	const viewportTransform = { x: 0, y: 0, scale: 1 };

	function render() {
		// REMOVE LATER
		if (canvas && ctx) {
			ctx.clearRect(0, 0, canvas.width, canvas.height);
			ctx.setTransform(
				viewportTransform.scale,
				0,
				0,
				viewportTransform.scale,
				viewportTransform.x,
				viewportTransform.y
			);

			const w = 100;
			const h = 100;
			ctx.fillStyle = 'red';

			ctx.fillRect(0.5 * (window.innerWidth - w), 0.5 * (window.innerHeight - h), w, h);
		}
	}

	function updatePanning(e: MouseEvent) {
		const localX = e.clientX;
		const localY = e.clientY;

		viewportTransform.x += localX - prevMouseCoords.x;
		viewportTransform.y += localY - prevMouseCoords.y;

		prevMouseCoords.x = localX;
		prevMouseCoords.y = localY;
	}

	function updateZooming(e: WheelEvent) {
		const { x: oldX, y: oldY, scale: oldScale } = viewportTransform;

		const localX = e.clientX;
		const localY = e.clientY;

		const newScale = oldScale + e.deltaY * -0.01;

		const newX = localX - (localX - oldX) * (newScale / oldScale);
		const newY = localY - (localY - oldY) * (newScale / oldScale);

		viewportTransform.x = newX;
		viewportTransform.y = newY;
		viewportTransform.scale = newScale;

		console.log(viewportTransform);
	}

	onMount(() => {
		if (!canvas) return;

		function resizeCanvas() {
			if (canvas) {
				canvas.width = window.innerWidth;
				canvas.height = window.innerHeight;
			}
		}

		window.addEventListener('resize', resizeCanvas);
		resizeCanvas();
		render();

		return () => {
			window.removeEventListener('resize', resizeCanvas);
		};
	});
</script>

<canvas
	bind:this={canvas}
	onmousedown={(e) => {
		isMouseDown = true;
		prevMouseCoords.x = e.clientX;
		prevMouseCoords.y = e.clientY;
	}}
	onmousemove={(e) => {
		if (isMouseDown && isDragging) {
			updatePanning(e);
			render();
		}
	}}
	onmouseup={() => {
		isMouseDown = false;
	}}
	onwheel={(e) => {
		updateZooming(e);
		render();
	}}
></canvas>

<Button
	class="cursor-pointer absolute top-4 left-4 z-100"
	variant={isDragging ? 'default' : 'outline'}
	onclick={() => (isDragging = !isDragging)}
>
	<HandIcon />
</Button>
