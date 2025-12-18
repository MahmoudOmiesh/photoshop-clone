<script lang="ts">
	import { getEditorStore } from '$lib/editor/editor-context';
	import { Input } from './ui/input';
	import { Label } from './ui/label';

	const editorStore = getEditorStore();
	const activeOpacity = $derived.by(() => {
		if (!editorStore.composition) return null;
		const activeLayers = editorStore.composition.activeLayers;

		let opacity = activeLayers[0] ? activeLayers[0].opacity : null;
		for (const activeLayer of editorStore.composition.activeLayers) {
			if (activeLayer.opacity !== opacity) return null;
		}

		return opacity;
	});

	let opacityInput = $derived(activeOpacity != null ? `${activeOpacity * 100}%` : '');

	function commitOpacity() {
		// Remove '%' and any whitespace, then parse to number
		const numericValue = parseFloat(opacityInput.replace(/[%\s]/g, ''));

		if (!isNaN(numericValue)) {
			const opacity = Math.max(0, Math.min(100, numericValue)) / 100;
			editorStore.composition?.activeLayers.forEach((layer) => {
				layer.setOpacity(opacity);
			});
		}
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
