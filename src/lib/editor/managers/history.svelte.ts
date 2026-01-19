import type { Editor } from '../editor.svelte';
import type { Command, CommandContext } from '$lib/document/commands/command';

interface HistoryConfig {
	maxSize: number;
}

const DEFAULT_CONFIG: HistoryConfig = {
	maxSize: 20
};

export class HistoryManager {
	private config: HistoryConfig;
	private undoStack: Command[] = [];
	private redoStack: Command[] = [];

	constructor(
		public readonly editor: Editor,
		config?: Partial<HistoryConfig>
	) {
		this.config = { ...DEFAULT_CONFIG, ...config };
	}

	get canUndo(): boolean {
		return this.undoStack.length > 0;
	}

	get canRedo(): boolean {
		return this.redoStack.length > 0;
	}

	execute(command: Command) {
		const composition = this.editor.document.composition;
		if (!composition) return;

		const ctx: CommandContext = { composition };
		command.execute(ctx);
		this.undoStack.push(command);

		if (this.undoStack.length > this.config.maxSize) {
			this.undoStack.shift();
		}

		this.redoStack = [];
		this.editor.requestRender();
	}

	undo() {
		const composition = this.editor.document.composition;
		if (!composition) return;

		const command = this.undoStack.pop();
		if (!command) return;

		const ctx: CommandContext = { composition };
		command.undo(ctx);
		this.redoStack.push(command);
		this.editor.requestRender();
	}

	redo() {
		const composition = this.editor.document.composition;
		if (!composition) return;

		const command = this.redoStack.pop();
		if (!command) return;

		const ctx: CommandContext = { composition };
		command.execute(ctx);
		this.undoStack.push(command);
		this.editor.requestRender();
	}
}
