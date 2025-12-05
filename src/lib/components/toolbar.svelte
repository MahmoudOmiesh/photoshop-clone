<script>
	import { Button } from './ui/button';
	import { MousePointer2Icon, HandIcon, SearchIcon } from '@lucide/svelte';
</script>

<div class="bg-card h-fit m-2 rounded-md">
	<ul class="flex flex-col gap-2 items-center p-1">
		<li>
			<Button variant="ghost" size="icon">
				<MousePointer2Icon />
			</Button>
		</li>
		<li>
			<Button variant="ghost" size="icon">
				<HandIcon />
			</Button>
		</li>
		<li>
			<Button variant="ghost" size="icon">
				<SearchIcon />
			</Button>
		</li>
	</ul>
</div>
