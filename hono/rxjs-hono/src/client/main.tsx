import { mountEntityPanel } from '../core/client/entity-panel';
import { CreateTodoSchema } from '../entities/todos/schema';

mountEntityPanel({
	el:       document.getElementById('todos')!,
	basePath: '/api/todos',
	schema:   CreateTodoSchema,
});
