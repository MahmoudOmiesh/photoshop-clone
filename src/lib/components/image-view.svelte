<script lang="ts">
	import Konva from 'konva';
	import type { IRect } from 'konva/lib/types';
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
		crop?: IRect;
	}

	let imageEl: Image | null = null;
	let { node = $bindable(), ...props }: ImageViewProps = $props();

	$effect(() => {
		if (imageEl) {
			node = imageEl.node;
		}
	});

	$effect(() => {
		if (imageEl) {
			// eslint-disable-next-line @typescript-eslint/no-unused-expressions
			props.crop;
			imageEl.node.cache();
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
	width={props.crop ? props.crop.width : props.image.width}
	height={props.crop ? props.crop.height : props.image.height}
	bind:this={imageEl}
	filters={[Konva.Filters.Brightness, Konva.Filters.Contrast, Konva.Filters.HSL]}
/>
