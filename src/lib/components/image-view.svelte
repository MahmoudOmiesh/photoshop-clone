<script lang="ts">
	import Konva from 'konva';
	import { onMount } from 'svelte';
	import { Image } from 'svelte-konva';
	interface ImageViewProps {
		image: CanvasImageSource;
		x: number;
		y: number;
		brightness: number;
		contrast: number;
		hue: number;
		saturation: number;
	}

	const props: ImageViewProps = $props();

	let imageEl: Image | null = null;

	onMount(() => {
		if (imageEl) {
			imageEl.node.cache();
		}
	});
</script>

<Image
	{...props}
	bind:this={imageEl}
	filters={[Konva.Filters.Brightness, Konva.Filters.Contrast, Konva.Filters.HSL]}
/>
