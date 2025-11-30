<script lang="ts">
	import { Button } from '$lib/components/ui/button';
	import { CheckIcon, CropIcon, FileUpIcon, HandIcon, XIcon, ZoomInIcon } from '@lucide/svelte';
	import { Layer, Rect, Stage, Transformer, type KonvaWheelEvent } from 'svelte-konva';
	import ImagePicker from './image-picker.svelte';
	import ImageView from './image-view.svelte';
	import FiltersDropdown from './filters-dropdown.svelte';
	import type Konva from 'konva';
	import type { IRect } from 'konva/lib/types';

	let stageEl: Stage | null = null;
	const stageConfig = $state({
		width: 0,
		height: 0
	});
	let isPanning = $state(false);
	let isZooming = $state(false);

	let image: HTMLImageElement | null = $state(null);
	let imageNode: Konva.Image | null = $state(null);

	let imageBrightness = $state(1);
	let imageContrast = $state(0);
	let imageHue = $state(0);
	let imageSaturation = $state(0);

	let isCropping = $state(false);
	let transformerEl: Transformer | null = $state(null);
	let cropRectEl: Rect | null = $state(null);
	let crop: IRect | undefined = $state();

	function enterCropMode() {
		if (!imageNode || !transformerEl || !cropRectEl) return;

		isCropping = true;
		transformerEl.node.nodes([cropRectEl.node]);
	}

	function exitCropMode() {
		if (!imageNode || !transformerEl || !cropRectEl) return;

		if (!crop) {
			// reset the selection if there was no previous crop
			const defaultPosition = imageNode.position();

			cropRectEl.node.scale({
				x: 1,
				y: 1
			});
			cropRectEl.node.position(defaultPosition);
		}

		isCropping = false;
		transformerEl.node.nodes([]);
	}

	function applyCrop() {
		if (!imageNode || !transformerEl || !cropRectEl) return;

		const scale = cropRectEl.node.scale();
		const size = cropRectEl.node.size();
		const position = cropRectEl.node.position();

		const cropWidth = size.width * scale.x;
		const cropHeight = size.height * scale.y;

		const imagePosition = imageNode.position();

		const cropX = position.x - imagePosition.x;
		const cropY = position.y - imagePosition.y;

		crop = {
			x: cropX,
			y: cropY,
			width: cropWidth,
			height: cropHeight
		};

		exitCropMode();
	}

	function createImage(imageFile: File) {
		const imageElement = document.createElement('img');
		imageElement.src = URL.createObjectURL(imageFile);
		imageElement.onload = () => {
			image = imageElement;
			fitToScreen();
		};
	}

	function updateZooming(e: KonvaWheelEvent) {
		if (!isZooming || !stageEl) {
			return;
		}

		e.evt.preventDefault();
		const stage = stageEl.node;
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

	function fitToScreen() {
		if (!stageEl || !image) return;

		const scaleX = stageConfig.width / image.width;
		const scaleY = stageConfig.height / image.height;

		const scale = Math.min(scaleX, scaleY) - 0.02;
		const dx = stageConfig.width * 0.5 * (1 - scale);
		const dy = stageConfig.height * 0.5 * (1 - scale);

		stageEl.node.scale({ x: scale, y: scale });
		stageEl.node.position({
			x: dx,
			y: dy
		});
	}

	function resetView() {
		if (!stageEl) return;

		stageEl.node.position({
			x: 0,
			y: 0
		});
		stageEl.node.scale({
			x: 1,
			y: 1
		});
	}

	function exportImage() {
		const stageNode = stageEl?.node;
		if (!imageNode || !stageNode) return;

		const oldStageScale = stageNode.scale();

		stageNode.scale({
			x: 1,
			y: 1
		});

		const dataURL = imageNode.toDataURL();

		stageNode.scale(oldStageScale);

		const link = document.createElement('a');
		link.download = 'stage.png';
		link.href = dataURL;
		document.body.appendChild(link);
		link.click();
		document.body.removeChild(link);
	}
</script>

<svelte:window bind:innerWidth={stageConfig.width} bind:innerHeight={stageConfig.height} />

<Stage
	bind:this={stageEl}
	width={stageConfig.width}
	height={stageConfig.height}
	draggable={isPanning}
	onwheel={updateZooming}
>
	<Layer>
		{#if image}
			<!-- HACKY WAY TO FIX REPLACING IMAGES WITH DIFFERENT IMAGES -->
			<!-- FIX IT -->
			{#key image}
				<ImageView
					{image}
					crop={isCropping ? undefined : crop}
					bind:node={imageNode}
					x={0.5 * (stageConfig.width - image.width)}
					y={0.5 * (stageConfig.height - image.height)}
					brightness={imageBrightness}
					contrast={imageContrast}
					hue={imageHue}
					saturation={imageSaturation}
				/>

				<Rect
					visible={isCropping}
					bind:this={cropRectEl}
					width={image?.width}
					height={image?.height}
					x={0.5 * (stageConfig.width - (image?.width ?? 0))}
					y={0.5 * (stageConfig.height - (image?.height ?? 0))}
					stroke="black"
					strokeWidth={4}
				/>
				<Transformer bind:this={transformerEl} rotateEnabled={false} />
			{/key}
		{/if}
	</Layer>
</Stage>

<div class="absolute top-4 left-4 z-100 flex items-stretch gap-2">
	<ImagePicker onImageAdded={createImage} />
	<Button onclick={exportImage}>
		<FileUpIcon />
	</Button>

	<Button variant={isPanning ? 'default' : 'outline'} onclick={() => (isPanning = !isPanning)}>
		<HandIcon />
	</Button>

	<Button variant={isZooming ? 'default' : 'outline'} onclick={() => (isZooming = !isZooming)}>
		<ZoomInIcon />
	</Button>

	<FiltersDropdown
		bind:brightness={imageBrightness}
		bind:contrast={imageContrast}
		bind:hue={imageHue}
		bind:saturation={imageSaturation}
	/>

	{#if !isCropping}
		<Button variant={isCropping ? 'default' : 'outline'} onclick={enterCropMode} disabled={!image}>
			<CropIcon />
		</Button>
	{/if}
	{#if isCropping}
		<Button onclick={exitCropMode}>
			<XIcon />
		</Button>
		<Button onclick={applyCrop}><CheckIcon /></Button>
	{/if}

	<Button onclick={fitToScreen} variant="outline">Fit to Screen</Button>
	<Button onclick={resetView} variant="outline">Reset View</Button>
</div>
