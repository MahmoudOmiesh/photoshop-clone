<script lang="ts">
	import { getEditorStore } from '$lib/editor/editor-context';
	import { EyeIcon, EyeOffIcon, XIcon } from '@lucide/svelte';
	import { Button } from './ui/button';
	import { Card, CardHeader, CardContent } from './ui/card';
	import { cn } from '$lib/utils';
	import OpacityInput from './opacity-input.svelte';
	import BlendingModeInput from './blending-mode-input.svelte';
	import { SetLayerVisibilityCommand } from '$lib/document/commands/layer/set-layer-visibility';
	import { RemoveLayerCommand } from '$lib/document/commands/layer/remove-layer';

	const editorStore = getEditorStore();
</script>

<Card class="py-2">
	{#if editorStore.composition && editorStore.composition.layers.length > 0}
		<CardHeader class="flex flex-wrap px-2">
			<div class="flex items-stretch gap-1">
				<BlendingModeInput />
				<OpacityInput />
			</div>
		</CardHeader>

		<CardContent class="px-2 space-y-1">
			{#each editorStore.composition.layers as layer (layer.id)}
				<button
					class={cn(
						'w-full p-1 flex items-center gap-2 cursor-pointer hover:bg-accent/50 rounded-md border border-transparent',
						editorStore.composition.isLayerActive(layer.id) && 'bg-accent/50 border-primary'
					)}
					onclick={(e) => {
						editorStore.composition?.activateLayer(layer.id, {
							destructive: !e.ctrlKey
						});
					}}
				>
					<Button
						size="icon"
						variant="ghost"
						class="size-7"
						onclick={(e) => {
							e.stopPropagation();
							editorStore.executeCommand(
								new SetLayerVisibilityCommand({
									layer,
									visiblity: !layer.isVisible
								})
							);
						}}
					>
						{#if layer.isVisible}
							<EyeIcon />
						{:else}
							<EyeOffIcon />
						{/if}
					</Button>
					<span class="size-4 bg-red-200"></span>

					<p class="text-sm">{layer.name}</p>

					<Button
						size="icon"
						class="ml-auto size-7 hover:text-destructive"
						variant="ghost"
						onclick={(e) => {
							e.stopPropagation();
							editorStore.executeCommand(
								new RemoveLayerCommand({
									layer
								})
							);
						}}
					>
						<XIcon />
					</Button>
				</button>
			{/each}
		</CardContent>
	{:else}
		<CardContent class="px-2">
			<p class="text-sm text-center italic">No Layers Yet</p>
		</CardContent>
	{/if}
</Card>
