import { getContext, setContext } from 'svelte';
import { EditorStore } from './editor-store.svelte';

const DEFAULT_KEY = '$_editor_store';

export function getEditorStore(key = DEFAULT_KEY) {
	return getContext<EditorStore>(key);
}

export function setEditorStore(key = DEFAULT_KEY) {
	const editorStore = new EditorStore();
	return setContext(key, editorStore);
}
