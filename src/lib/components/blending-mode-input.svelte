<script lang="ts">
	import { getEditor } from '$lib/editor/editor.svelte';
	import * as Select from '$lib/components/ui/select';
	import { BLEND_MODES, type BlendMode } from '$lib/document/layers/types';
	import { SetLayerBlendModeCommand } from '$lib/document/commands/layer/set-layer-blend-mode';
	import { assert } from '$lib/utils';

	const editor = getEditor();
	const activeBlendMode = $derived.by(() => {
		if (!editor.document.composition) return null;
		const activeLayers = editor.document.activeLayers;

		let blendMode = activeLayers[0] ? activeLayers[0].blendMode : null;
		for (const activeLayer of activeLayers) {
			if (activeLayer.blendMode !== blendMode) return null;
		}

		return blendMode;
	});
</script>

<Select.Root
	type="single"
	bind:value={
		() => activeBlendMode ?? '',
		(blendMode: BlendMode) => {
			assert(editor.document.composition);
			editor.document.executeCommand(
				new SetLayerBlendModeCommand({
					layers: editor.document.activeLayers,
					blendMode
				})
			);
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
