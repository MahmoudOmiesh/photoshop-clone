<script lang="ts">
	import Konva from 'konva';
	import { onMount } from 'svelte';
	import { Image } from 'svelte-konva';

	interface ImageViewProps {
		node: Konva.Image | null;
		image: HTMLImageElement;
		x: number;
		y: number;
		brightness: number;
		contrast: number;
		hue: number;
		saturation: number;
	}

	let imageEl: Image | null = null;
	let { node = $bindable(), ...props }: ImageViewProps = $props();

	$effect(() => {
		if (imageEl) {
			node = imageEl.node;
		}
	});

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
