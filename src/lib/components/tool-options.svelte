<script lang="ts">
	import { getToolStore } from '$lib/tools/tool-store.svelte';
	import { Button } from './ui/button';

	const toolStore = getToolStore();
</script>

<div class="bg-card px-3 py-1 w-full flex items-center gap-4 min-h-12">
	<div class="flex items-center gap-2">
		<svelte:component this={toolStore.activeTool.icon} class="size-4" />
		{toolStore.activeTool.name}
	</div>

	<div class="flex items-center gap-4">
		{#each toolStore.activeTool.options as option (option.key)}
			{#if option.type === 'checkbox'}
				<label class="flex items-center gap-2 text-sm">
					<input
						type="checkbox"
						checked={toolStore.activeToolOptions[option.key] as boolean}
						onchange={(e) =>
							toolStore.setToolOption(toolStore.activeTool.id, option.key, e.currentTarget.checked)}
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
						value={toolStore.activeToolOptions[option.key] as number}
						oninput={(e) =>
							toolStore.setToolOption(toolStore.activeTool.id, option.key, +e.currentTarget.value)}
					/>
				</label>
			{:else if option.type === 'button-group'}
				<div class="flex items-center gap-1">
					<span class="text-sm">{option.label}:</span>
					{#each option.options as opt (opt.value)}
						<Button
							variant={toolStore.activeToolOptions[option.key] === opt.value
								? 'secondary'
								: 'ghost'}
							size="sm"
							onclick={() =>
								toolStore.setToolOption(toolStore.activeTool.id, option.key, opt.value)}
						>
							<opt.icon />
						</Button>
					{/each}
				</div>
			{:else if option.type === 'select'}
				<label class="flex items-center gap-2 text-sm">
					{option.label}
					<select
						value={toolStore.activeToolOptions[option.key] as string}
						onchange={(e) =>
							toolStore.setToolOption(toolStore.activeTool.id, option.key, e.currentTarget.value)}
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
