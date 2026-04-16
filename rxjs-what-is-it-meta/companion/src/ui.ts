import type { AppState } from './types';

const searchInput = document.getElementById('search') as HTMLInputElement;
const statusEl = document.getElementById('status') as HTMLDivElement;
const errorEl = document.getElementById('error') as HTMLDivElement;
const resultsEl = document.getElementById('results') as HTMLUListElement;

export function getSearchInput(): HTMLInputElement {
	return searchInput;
}

export function render(state: AppState): void {
	statusEl.textContent = state.loading ? 'Searching…' : '';
	errorEl.textContent = state.error ?? '';
	resultsEl.innerHTML = state.results
		.map(r => `<li><strong>${r.title}</strong> <em>(${r.category})</em></li>`)
		.join('');
}
