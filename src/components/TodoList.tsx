/* eslint-disable jsx-a11y/label-has-associated-control */
import { Todo } from '../types/Todo';
import { TempTodo } from './TempTodo';
import { TodoItem } from './TodoItem';

type Props = {
  filteredTodos: Todo[];
  togglCompleted: (todoId: number) => void;
  editingTodoId: number | null;
  editingTitle: string;
  setEditingTitle: React.Dispatch<React.SetStateAction<string>>;
  updateTitle: (todoId: number) => void;
  handleCancelEdit: () => void;
  loadingTodoId: number | null;
  handleEditTodo: (todoId: number, title: string) => void;
  deletePost: (todoId: number) => void;
  tempTodo: Todo | null;
};

export const TodoList: React.FC<Props> = ({
  filteredTodos,
  togglCompleted,
  editingTodoId,
  editingTitle,
  setEditingTitle,
  updateTitle,
  handleCancelEdit,
  loadingTodoId,
  handleEditTodo,
  deletePost,
  tempTodo,
}) => {
  return (
    <section className="todoapp__main" data-cy="TodoList">
      {filteredTodos.map(todo => (
        <TodoItem
          key={todo.id}
          todo={todo}
          togglCompleted={togglCompleted}
          editingTitle={editingTitle}
          editingTodoId={editingTodoId}
          setEditingTitle={setEditingTitle}
          updateTitle={updateTitle}
          handleCancelEdit={handleCancelEdit}
          handleEditTodo={handleEditTodo}
          loadingTodoId={loadingTodoId}
          deletePost={deletePost}
        />
      ))}
      {tempTodo && <TempTodo tempTodo={tempTodo} />}
    </section>
  );
};
