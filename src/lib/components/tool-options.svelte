<script lang="ts">
	import { getCurrentTool, getToolOptions, setToolOption } from '$lib/tools/tool-store.svelte';
	import { Button } from './ui/button';

	let tool = $derived(getCurrentTool());
	let options = $derived(getToolOptions(tool.id));
</script>

<div class="bg-card px-3 py-1 w-full flex items-center gap-4">
	<div class="flex items-center gap-2">
		<tool.icon class="size-4" />
		{tool.name}
	</div>

	<div class="flex items-center gap-4">
		{#each tool.options as option (option.key)}
			{#if option.type === 'checkbox'}
				<label class="flex items-center gap-2 text-sm">
					<input
						type="checkbox"
						checked={options[option.key] as boolean}
						onchange={(e) => setToolOption(tool.id, option.key, e.currentTarget.checked)}
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
						value={options[option.key] as number}
						oninput={(e) => setToolOption(tool.id, option.key, +e.currentTarget.value)}
					/>
				</label>
			{:else if option.type === 'button-group'}
				<div class="flex items-center gap-1">
					<span class="text-sm mr-1">{option.label}:</span>
					{#each option.options as opt (opt.value)}
						<Button
							variant={options[option.key] === opt.value ? 'secondary' : 'ghost'}
							size="sm"
							onclick={() => setToolOption(tool.id, option.key, opt.value)}
						>
							{opt.label}
						</Button>
					{/each}
				</div>
			{:else if option.type === 'select'}
				<label class="flex items-center gap-2 text-sm">
					{option.label}
					<select
						value={options[option.key] as string}
						onchange={(e) => setToolOption(tool.id, option.key, e.currentTarget.value)}
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
