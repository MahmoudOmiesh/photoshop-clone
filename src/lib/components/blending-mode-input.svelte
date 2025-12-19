<script lang="ts">
	import { getEditorStore } from '$lib/editor/editor-context';
	import * as Select from '$lib/components/ui/select';
	import { BLEND_MODES, type BlendMode } from '$lib/document/layers/types';
	import { SetLayerBlendModeCommand } from '$lib/document/commands/layer/set-layer-blend-mode';

	const editorStore = getEditorStore();
	const activeBlendMode = $derived.by(() => {
		if (!editorStore.composition) return null;
		const activeLayers = editorStore.composition.activeLayers;

		let blendMode = activeLayers[0] ? activeLayers[0].blendMode : null;
		for (const activeLayer of editorStore.composition.activeLayers) {
			if (activeLayer.blendMode !== blendMode) return null;
		}

		return blendMode;
	});
</script>

<Select.Root
	type="single"
	bind:value={
		() => activeBlendMode ?? '',
		(newBlendMode: BlendMode) => {
			editorStore.composition?.activeLayers.forEach((layer) => {
				editorStore.executeCommand(
					new SetLayerBlendModeCommand({
						layer,
						oldBlendMode: layer.blendMode,
						newBlendMode
					})
				);
			});
		}
	}
>
	<Select.Trigger class="h-fit p-1 w-20">{activeBlendMode}</Select.Trigger>
	<Select.Content>
		{#each BLEND_MODES as blendMode (blendMode)}
			<Select.Item value={blendMode}>{blendMode}</Select.Item>
		{/each}
	</Select.Content>
</Select.Root>
