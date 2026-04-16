export interface SearchResult {
	id: number;
	title: string;
	category: string;
}

export interface AppState {
	query: string;
	results: SearchResult[];
	loading: boolean;
	error: string | null;
}

export type Action =
	| { type: 'QUERY_CHANGED'; query: string }
	| { type: 'SEARCH_STARTED' }
	| { type: 'SEARCH_SUCCESS'; results: SearchResult[] }
	| { type: 'SEARCH_ERROR'; error: string }
	| { type: 'SEARCH_CLEARED' };
