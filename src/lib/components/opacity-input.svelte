<script lang="ts">
	import { SetLayerOpacityCommand } from '$lib/document/commands/layer/set-layer-opacity';
	import { getEditor } from '$lib/editor/editor.svelte';
	import { assert } from '$lib/utils';
	import { Input } from './ui/input';
	import { Label } from './ui/label';

	const editor = getEditor();
	const activeOpacity = $derived.by(() => {
		if (!editor.document.composition) return null;
		const activeLayers = editor.document.activeLayers;

		let opacity = activeLayers[0] ? activeLayers[0].opacity : null;
		for (const activeLayer of activeLayers) {
			if (activeLayer.opacity !== opacity) return null;
		}

		return opacity;
	});

	let opacityInput = $derived(activeOpacity != null ? `${activeOpacity * 100}%` : '');

	function commitOpacity() {
		assert(editor.document.composition);
		// Remove '%' and any whitespace, then parse to number
		const numericValue = parseFloat(opacityInput.replace(/[%\s]/g, ''));
		const opacity = isNaN(numericValue) ? 1 : Math.max(0, Math.min(100, numericValue)) / 100;

		editor.document.executeCommand(
			new SetLayerOpacityCommand({
				layers: editor.document.activeLayers,
				opacity
			})
		);
	}
</script>

<div class="flex items-stretch gap-1">
	<Label for="opacity" class="text-xs">Opacity:</Label>
	<Input
		id="opacity"
		class="p-1 h-fit w-fit"
		bind:value={opacityInput}
		onblur={commitOpacity}
		onkeydown={(e) => {
			if (e.key === 'Enter') {
				commitOpacity();
				e.currentTarget.blur();
			}
		}}
	/>
</div>
