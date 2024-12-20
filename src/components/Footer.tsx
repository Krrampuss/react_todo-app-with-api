import cn from 'classnames';
import { Todo } from '../types/Todo';
import { FilterName } from '../types/enumFilterName';

type Props = {
  activeCount: number;
  filteredBy: FilterName;
  setFilteredBy: React.Dispatch<React.SetStateAction<FilterName>>;
  deleteCompleted: () => void;
  completedTodos: Todo[];
};

export const Footer: React.FC<Props> = ({
  activeCount,
  filteredBy,
  setFilteredBy,
  deleteCompleted,
  completedTodos,
}) => {
  return (
    <footer className="todoapp__footer" data-cy="Footer">
      <span className="todo-count" data-cy="TodosCounter">
        {activeCount} items left
      </span>

      <nav className="filter" data-cy="Filter">
        {Object.values(FilterName).map(link => (
          <a
            key={link}
            onClick={() => setFilteredBy(link)}
            href="#/"
            className={cn('filter__link', {
              selected: filteredBy === link,
            })}
            data-cy={`FilterLink${link}`}
          >
            {link}
          </a>
        ))}
      </nav>

      <button
        type="button"
        className="todoapp__clear-completed"
        data-cy="ClearCompletedButton"
        onClick={() => deleteCompleted()}
        disabled={!completedTodos.length}
      >
        Clear completed
      </button>
    </footer>
  );
};
