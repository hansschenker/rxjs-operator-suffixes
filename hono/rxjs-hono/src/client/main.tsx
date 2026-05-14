import { mountEntityPanel } from '../core/client/entity-panel';
import { CreateTodoSchema } from '../entities/todos/schema';
import { CreateProductSchema } from '../entities/products/schema';

mountEntityPanel({
	el:       document.getElementById('todos')!,
	basePath: '/api/todos',
	schema:   CreateTodoSchema,
});

mountEntityPanel({
	el:       document.getElementById('products')!,
	basePath: '/api/products',
	schema:   CreateProductSchema,
});
