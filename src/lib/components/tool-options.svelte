<script lang="ts">
	import { getEditor } from '$lib/editor/editor.svelte';
	import { Button } from './ui/button';

	const editor = getEditor();
	const activeTool = $derived(editor.tools.activeTool);
</script>

{#if activeTool}
	<div class="bg-card px-3 py-1 w-full flex items-center gap-4 min-h-12">
		<div class="flex items-center gap-2">
			<svelte:component this={activeTool.icon} class="size-4" />
			{activeTool.name}
		</div>

		<div class="flex items-center gap-4">
			{#each activeTool.options as option (option.key)}
				{#if option.type === 'checkbox'}
					<label class="flex items-center gap-2 text-sm">
						<input
							type="checkbox"
							checked={editor.tools.activeToolOptions[option.key] as boolean}
							onchange={(e) =>
								editor.tools.setToolOption(activeTool.id, option.key, e.currentTarget.checked)}
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
							value={editor.tools.activeToolOptions[option.key] as number}
							oninput={(e) =>
								editor.tools.setToolOption(activeTool.id, option.key, +e.currentTarget.value)}
						/>
					</label>
				{:else if option.type === 'button-group'}
					<div class="flex items-center gap-1">
						<span class="text-sm">{option.label}:</span>
						{#each option.options as opt (opt.value)}
							<Button
								variant={editor.tools.activeToolOptions[option.key] === opt.value
									? 'secondary'
									: 'ghost'}
								size="sm"
								onclick={() => editor.tools.setToolOption(activeTool.id, option.key, opt.value)}
							>
								<opt.icon />
							</Button>
						{/each}
					</div>
				{:else if option.type === 'select'}
					<label class="flex items-center gap-2 text-sm">
						{option.label}
						<select
							value={editor.tools.activeToolOptions[option.key] as string}
							onchange={(e) =>
								editor.tools.setToolOption(activeTool.id, option.key, e.currentTarget.value)}
						>
							{#each option.options as opt (opt.value)}
								<option value={opt.value}>{opt.label}</option>
							{/each}
						</select>
					</label>
				{/if}
			{/each}
		</div>

		<div class="flex items-center gap-2">
			{#each activeTool.actions as action (action.key)}
				<Button
					variant="secondary"
					size="sm"
					onclick={() => editor.tools.executeToolAction(action.action)}
				>
					<action.icon />
				</Button>
			{/each}
		</div>
	</div>
{/if}
