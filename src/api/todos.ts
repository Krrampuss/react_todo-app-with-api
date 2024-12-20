import { Todo } from '../types/Todo';
import { client } from '../utils/fetchClient';

export const USER_ID = 2129;

export const getTodos = () => {
  const baseUrl = `/todos?userId=${USER_ID}`;

  return client.get<Todo[]>(baseUrl);
};

export const deleteTodo = (id: number) => {
  const baseUrl = `/todos/${id}`;

  return client.delete(baseUrl);
};

export const addTodo = (newTodo: Omit<Todo, 'id'>) => {
  const baseUrl = `/todos`;

  return client.post<Todo>(baseUrl, newTodo);
};

export const updateTodo = (id: number, completed: boolean, title?: string) => {
  const baseUrl = `/todos/${id}`;

  const updateData: { completed: boolean; title?: string } = { completed };

  if (title) {
    updateData.title = title;
  }

  return client.patch(baseUrl, updateData);
};
