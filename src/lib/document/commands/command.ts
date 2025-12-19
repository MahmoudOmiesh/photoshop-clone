import type { Composition } from '../composition.svelte';

export interface CommandContext {
	composition: Composition;
}

export abstract class Command {
	abstract execute(ctx: CommandContext): void;
	abstract undo(ctx: CommandContext): void;
}
