<script lang="ts">
	import { Button } from '$lib/components/ui/button';
	import { HandIcon, ZoomInIcon } from '@lucide/svelte';
	import { onMount } from 'svelte';

	let canvas: HTMLCanvasElement | null = $state(null);
	let ctx: CanvasRenderingContext2D | null = $derived.by(() => {
		if (canvas) {
			return canvas.getContext('2d');
		}
		return null;
	});

	let isDragging = $state(false);
	let isZooming = $state(false);

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
		const mousePos = {
			x: e.clientX,
			y: e.clientY
		};

		viewportTransform.x += mousePos.x - prevMouseCoords.x;
		viewportTransform.y += mousePos.y - prevMouseCoords.y;

		prevMouseCoords.x = mousePos.x;
		prevMouseCoords.y = mousePos.y;
	}

	function updateZooming(e: WheelEvent) {
		const scaleBy = 1.1;

		const oldScale = viewportTransform.scale;
		const mousePos = {
			x: e.clientX,
			y: e.clientY
		};

		const mousePointTo = {
			x: (mousePos.x - viewportTransform.x) / oldScale,
			y: (mousePos.y - viewportTransform.y) / oldScale
		};

		let direction = e.deltaY > 0 ? -1 : 1;
		if (e.ctrlKey) {
			direction = -direction;
		}

		const newScale = direction > 0 ? oldScale * scaleBy : oldScale / scaleBy;
		const newPos = {
			x: mousePos.x - mousePointTo.x * newScale,
			y: mousePos.y - mousePointTo.y * newScale
		};

		viewportTransform.scale = newScale;
		viewportTransform.x = newPos.x;
		viewportTransform.y = newPos.y;
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
		if (isZooming) {
			updateZooming(e);
			render();
		}
	}}
></canvas>

<div class="absolute top-4 left-4 z-100 flex items-stretch gap-2">
	<Button variant={isDragging ? 'default' : 'outline'} onclick={() => (isDragging = !isDragging)}>
		<HandIcon />
	</Button>

	<Button variant={isZooming ? 'default' : 'outline'} onclick={() => (isZooming = !isZooming)}>
		<ZoomInIcon />
	</Button>
</div>
