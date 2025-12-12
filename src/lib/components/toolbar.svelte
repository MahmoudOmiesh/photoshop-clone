<script>
	import { getAllTools, isToolActive, selectTool } from '$lib/tools/tool-store.svelte';
	import { Button } from './ui/button';

	const tools = getAllTools();
</script>

<div class="bg-card h-fit m-2 rounded-md">
	<ul class="flex flex-col gap-2 items-center p-1">
		{#each tools as tool (tool.id)}
			<li>
				<Button
					size="icon"
					variant={isToolActive(tool.id) ? 'secondary' : 'ghost'}
					onclick={() => selectTool(tool.id)}
					title={`${tool.name}${tool.shortcut ? ` (${tool.shortcut.toUpperCase()})` : ''}`}
				>
					<tool.icon />
				</Button>
			</li>
		{/each}
	</ul>
</div>
