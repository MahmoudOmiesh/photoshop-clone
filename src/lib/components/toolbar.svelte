<script lang="ts">
	import { AddLayerCommand } from '$lib/document/commands/layer/add-layer';
	import { Composition } from '$lib/document/composition.svelte';
	import { RasterLayer } from '$lib/document/layers/raster-layer';
	import { getEditorContext } from '$lib/editor/context.svelte';
	import { Button } from './ui/button';

	const { documentStore, toolStore } = getEditorContext();

	function addComposition() {
		documentStore.attachComposition(
			new Composition({
				width: 800,
				height: 600,
				dpi: 90
			})
		);
	}

	function addLayer() {
		documentStore.executeCommand(
			new AddLayerCommand({
				layer: new RasterLayer('LAYER', 800, 600)
			})
		);
	}
</script>

<div class="bg-card h-fit m-2 rounded-md">
	<ul class="flex flex-col gap-2 items-center p-1">
		{#each toolStore.allTools as tool (tool.id)}
			<li>
				<Button
					size="icon"
					variant={toolStore.isToolActive(tool.id) ? 'secondary' : 'ghost'}
					onclick={() => toolStore.selectTool(tool.id)}
					title={`${tool.name}${tool.shortcut ? ` (${tool.shortcut.toUpperCase()})` : ''}`}
				>
					<tool.icon />
				</Button>
			</li>
		{/each}

		<!-- TESTING -->
		<li onclick={addComposition}>make comp</li>
		<li onclick={addLayer}>add layer</li>
	</ul>
</div>
