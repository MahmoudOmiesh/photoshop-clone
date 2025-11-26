<script lang="ts">
	import { Image } from 'svelte-konva';
	interface ImageViewProps {
		image: CanvasImageSource;
		x: number;
		y: number;
	}

	const props: ImageViewProps = $props();
</script>

<Image {...props} />
