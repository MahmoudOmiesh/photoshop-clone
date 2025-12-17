<script lang="ts">
	import { getEditorStore } from '$lib/editor/editor-context';
	import { Button } from './ui/button';

	const editorStore = getEditorStore();
</script>

<div class="bg-card px-3 py-1 w-full flex items-center gap-4 min-h-12">
	<div class="flex items-center gap-2">
		<svelte:component this={editorStore.toolStore.activeTool.icon} class="size-4" />
		{editorStore.toolStore.activeTool.name}
	</div>

	<div class="flex items-center gap-4">
		{#each editorStore.toolStore.activeTool.options as option (option.key)}
			{#if option.type === 'checkbox'}
				<label class="flex items-center gap-2 text-sm">
					<input
						type="checkbox"
						checked={editorStore.toolStore.activeToolOptions[option.key] as boolean}
						onchange={(e) =>
							editorStore.toolStore.setToolOption(
								editorStore.toolStore.activeTool.id,
								option.key,
								e.currentTarget.checked
							)}
					/>
					{option.label}
				</label>
			{:else if option.type === 'slider'}
				<label class="flex items-center gap-2 text-sm">
					{option.label}
					<input
						type="range"
						min={option.min}
						max={option.max}
						step={option.step ?? 1}
						value={editorStore.toolStore.activeToolOptions[option.key] as number}
						oninput={(e) =>
							editorStore.toolStore.setToolOption(
								editorStore.toolStore.activeTool.id,
								option.key,
								+e.currentTarget.value
							)}
					/>
				</label>
			{:else if option.type === 'button-group'}
				<div class="flex items-center gap-1">
					<span class="text-sm">{option.label}:</span>
					{#each option.options as opt (opt.value)}
						<Button
							variant={editorStore.toolStore.activeToolOptions[option.key] === opt.value
								? 'secondary'
								: 'ghost'}
							size="sm"
							onclick={() =>
								editorStore.toolStore.setToolOption(
									editorStore.toolStore.activeTool.id,
									option.key,
									opt.value
								)}
						>
							<opt.icon />
						</Button>
					{/each}
				</div>
			{:else if option.type === 'select'}
				<label class="flex items-center gap-2 text-sm">
					{option.label}
					<select
						value={editorStore.toolStore.activeToolOptions[option.key] as string}
						onchange={(e) =>
							editorStore.toolStore.setToolOption(
								editorStore.toolStore.activeTool.id,
								option.key,
								e.currentTarget.value
							)}
					>
						{#each option.options as opt (opt.value)}
							<option value={opt.value}>{opt.label}</option>
						{/each}
					</select>
				</label>
			{/if}
		{/each}
	</div>
</div>
