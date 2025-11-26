<script lang="ts">
	import { Input } from '$lib/components/ui/input';
	import { Label } from '$lib/components/ui/label';
	import { FileIcon } from '@lucide/svelte';
	import { buttonVariants } from './ui/button';
	import { cn } from '$lib/utils';

	const {
		onImageAdded
	}: {
		onImageAdded: (imageFile: File) => void;
	} = $props();

	function oninput(
		e: Event & {
			currentTarget: EventTarget & HTMLInputElement;
		}
	) {
		const files = e.currentTarget.files;
		if (!files || files.length === 0) return;

		const lastFile = files[files.length - 1];
		if (!lastFile.type.startsWith('image')) return;

		onImageAdded(lastFile);
	}
</script>

<Input type="file" class="sr-only" id="photo-picker-input" accept="image/*" {oninput} />
<Label for="photo-picker-input" class="{cn(buttonVariants())}} px-3"><FileIcon /></Label>
