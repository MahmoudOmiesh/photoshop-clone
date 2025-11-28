<script lang="ts">
	import * as DropdownMenu from '$lib/components/ui/dropdown-menu';
	import { Button } from '$lib/components/ui/button';
	import { Slider } from '$lib/components/ui/slider';
	import { Input } from '$lib/components/ui/input';

	interface FiltersDropdownProps {
		brightness: number;
		contrast: number;
		hue: number;
		saturation: number;
	}

	let {
		brightness = $bindable(),
		contrast = $bindable(),
		hue = $bindable(),
		saturation = $bindable()
	}: FiltersDropdownProps = $props();
</script>

<DropdownMenu.Root>
	<DropdownMenu.Trigger>
		{#snippet child({ props })}
			<Button {...props}>Filters</Button>
		{/snippet}
	</DropdownMenu.Trigger>
	<DropdownMenu.Content class="w-64" align="start">
		<DropdownMenu.Label class="sr-only">Image Filters</DropdownMenu.Label>
		<DropdownMenu.Group>
			<div class="p-2 space-y-2">
				<div class="flex items-center justify-between">
					<span class="text-sm">Brightness</span>
					<Input
						type="text"
						class="max-w-12 text-sm h-auto focus-visible:ring-0 rounded-xs py-0.5 px-1.5 m-0"
						bind:value={brightness}
					/>
				</div>
				<Slider type="single" min={0} max={2} step={0.1} class="w-full" bind:value={brightness} />
			</div>
		</DropdownMenu.Group>

		<DropdownMenu.Group>
			<div class="p-2 space-y-2">
				<div class="flex items-center justify-between">
					<span class="text-sm">Contrast</span>
					<Input
						type="text"
						class="max-w-12 text-sm h-auto focus-visible:ring-0 rounded-xs py-0.5 px-1.5 m-0"
						bind:value={contrast}
					/>
				</div>
				<Slider type="single" min={-100} max={100} class="w-full" bind:value={contrast} />
			</div>
		</DropdownMenu.Group>

		<DropdownMenu.Group>
			<div class="p-2 space-y-2">
				<div class="flex items-center justify-between">
					<span class="text-sm">Hue</span>
					<Input
						type="text"
						class="max-w-12 text-sm h-auto focus-visible:ring-0 rounded-xs py-0.5 px-1.5 m-0"
						bind:value={hue}
					/>
				</div>
				<Slider type="single" min={-259} max={259} class="w-full" bind:value={hue} />
			</div>
		</DropdownMenu.Group>

		<DropdownMenu.Group>
			<div class="p-2 space-y-2">
				<div class="flex items-center justify-between">
					<span class="text-sm">Saturation</span>
					<Input
						type="text"
						class="max-w-12 text-sm h-auto focus-visible:ring-0 rounded-xs py-0.5 px-1.5 m-0"
						bind:value={saturation}
					/>
				</div>
				<Slider type="single" min={-2} max={10} step={0.1} class="w-full" bind:value={saturation} />
			</div>
		</DropdownMenu.Group>
	</DropdownMenu.Content>
</DropdownMenu.Root>
