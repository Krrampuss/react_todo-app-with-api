import React from 'react';
import cn from 'classnames';
import { Todo } from '../types/Todo';

type Props = {
  todos: Todo[];
  completeAll: () => void;
  activeCount: number;
  handleSubmit: (event: React.FormEvent) => void;
  inputRef: React.RefObject<HTMLInputElement>;
  newTodoTitle: string;
  setNewTodoTitle: React.Dispatch<React.SetStateAction<string>>;
  isInputDisabled: boolean;
};

export const Header: React.FC<Props> = ({
  todos,
  completeAll,
  activeCount,
  handleSubmit,
  inputRef,
  newTodoTitle,
  setNewTodoTitle,
  isInputDisabled,
}) => {
  return (
    <header className="todoapp__header">
      {!!todos.length && (
        <button
          onClick={completeAll}
          type="button"
          className={cn('todoapp__toggle-all', activeCount === 0 && 'active')}
          data-cy="ToggleAllButton"
        />
      )}

      <form onSubmit={handleSubmit}>
        <input
          ref={inputRef}
          data-cy="NewTodoField"
          type="text"
          className="todoapp__new-todo"
          placeholder="What needs to be done?"
          value={newTodoTitle}
          onChange={event => setNewTodoTitle(event.target.value)}
          disabled={isInputDisabled}
          autoFocus
        />
      </form>
    </header>
  );
};
