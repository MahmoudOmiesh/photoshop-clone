<script>
	import { getEditorStore } from '$lib/editor/editor-context';
	import { Button } from './ui/button';

	const editorStore = getEditorStore();
</script>

<div class="bg-card h-fit m-2 rounded-md">
	<ul class="flex flex-col gap-2 items-center p-1">
		{#each editorStore.toolStore.allTools as tool (tool.id)}
			<li>
				<Button
					size="icon"
					variant={editorStore.toolStore.isToolActive(tool.id) ? 'secondary' : 'ghost'}
					onclick={() => editorStore.toolStore.selectTool(tool.id)}
					title={`${tool.name}${tool.shortcut ? ` (${tool.shortcut.toUpperCase()})` : ''}`}
				>
					<tool.icon />
				</Button>
			</li>
		{/each}
	</ul>
</div>
