export interface Todo {
	id: string;
	title: string;
	completed: boolean;
	priority: number;
	createdAt: string;
}

export interface CreateTodoBody {
	title: string;
	priority?: number;
}

export interface UpdateTodoBody {
	title?: string;
	completed?: boolean;
	priority?: number;
}
