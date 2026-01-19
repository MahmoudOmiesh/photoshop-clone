<script lang="ts">
	import { AddLayerCommand } from '$lib/document/commands/layer/add-layer';
	import { Composition } from '$lib/document/composition.svelte';
	import { RasterLayer } from '$lib/document/layers/raster-layer';
	import { getEditor } from '$lib/editor/editor.svelte';
	import { Button } from './ui/button';

	const editor = getEditor();

	function addComposition() {
		editor.document.attachComposition(
			new Composition({
				width: 800,
				height: 600,
				dpi: 90
			})
		);
	}

	function addLayer() {
		editor.document.executeCommand(
			new AddLayerCommand({
				layer: new RasterLayer('LAYER', 800, 600)
			})
		);
	}
</script>

<div class="bg-card h-fit m-2 rounded-md">
	<ul class="flex flex-col gap-2 items-center p-1">
		{#each editor.tools.allTools as tool (tool.id)}
			<li>
				<Button
					size="icon"
					variant={editor.tools.isToolActive(tool.id) ? 'secondary' : 'ghost'}
					onclick={() => editor.tools.selectTool(tool.id)}
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
