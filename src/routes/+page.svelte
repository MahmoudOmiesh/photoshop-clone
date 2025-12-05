<script>
	import MainMenu from '$lib/components/main-menu.svelte';
	import Sidebar from '$lib/components/sidebar.svelte';
	import Stage from '$lib/components/stage.svelte';
	import ToolOptions from '$lib/components/tool-options.svelte';
	import Toolbar from '$lib/components/toolbar.svelte';
</script>

<MainMenu />
<ToolOptions />

<div class="flex-1 flex">
	<Toolbar />
	<Stage />
	<Sidebar />
</div>
