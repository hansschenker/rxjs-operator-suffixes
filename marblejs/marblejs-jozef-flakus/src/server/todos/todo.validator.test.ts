import { isRight, isLeft } from 'fp-ts/Either';
import { CreateTodoCodec, UpdateTodoCodec } from './todo.validator';

describe('CreateTodoCodec', () => {
	it('accepts valid body', () => {
		const result = CreateTodoCodec.decode({ title: 'Buy milk' });
		expect(isRight(result)).toBe(true);
	});

	it('rejects missing title', () => {
		const result = CreateTodoCodec.decode({});
		expect(isLeft(result)).toBe(true);
	});

	it('rejects non-string title', () => {
		const result = CreateTodoCodec.decode({ title: 42 });
		expect(isLeft(result)).toBe(true);
	});
});

describe('UpdateTodoCodec', () => {
	it('accepts partial update with completed only', () => {
		const result = UpdateTodoCodec.decode({ completed: true });
		expect(isRight(result)).toBe(true);
	});

	it('accepts partial update with title only', () => {
		const result = UpdateTodoCodec.decode({ title: 'Updated' });
		expect(isRight(result)).toBe(true);
	});

	it('accepts empty object (no-op update)', () => {
		const result = UpdateTodoCodec.decode({});
		expect(isRight(result)).toBe(true);
	});

	it('rejects completed as non-boolean', () => {
		const result = UpdateTodoCodec.decode({ completed: 'yes' });
		expect(isLeft(result)).toBe(true);
	});
});
