import type { Command, CommandContext } from './command';

interface HistoryConfig {
	maxSize: number;
}

const DEFAULT_CONFIG: HistoryConfig = {
	maxSize: 20
};

export class History {
	private config: HistoryConfig;
	private undoStack: Command[] = [];
	private redoStack: Command[] = [];

	constructor(config?: Partial<HistoryConfig>) {
		this.config = { ...DEFAULT_CONFIG, ...config };
	}

	execute(command: Command, ctx: CommandContext) {
		command.execute(ctx);
		this.undoStack.push(command);

		if (this.undoStack.length > this.config.maxSize) {
			this.undoStack.shift();
		}

		this.redoStack = [];
	}

	undo(ctx: CommandContext) {
		const command = this.undoStack.pop();
		if (!command) return;

		command.undo(ctx);
		this.redoStack.push(command);
	}

	redo(ctx: CommandContext) {
		const command = this.redoStack.pop();
		if (!command) return;

		command.execute(ctx);
		this.undoStack.push(command);
	}
}
