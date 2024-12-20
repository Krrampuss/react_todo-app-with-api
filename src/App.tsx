/* eslint-disable react-hooks/rules-of-hooks */
/* eslint-disable jsx-a11y/label-has-associated-control */
/* eslint-disable jsx-a11y/control-has-associated-label */
import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { UserWarning } from './UserWarning';
import {
  getTodos,
  USER_ID,
  deleteTodo,
  addTodo,
  updateTodo,
} from './api/todos';
import { Todo } from './types/Todo';
import { Error } from './types/enumError';
import { FilterName } from './types/enumFilterName';
import { Header } from './components/Header';
import { TodoList } from './components/TodoList';
import { Footer } from './components/Footer';
import { ErrorMes } from './components/ErrorMes';

export const App = () => {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [errorMessage, setErrorMessage] = useState<Error>(Error.Default);
  const [filteredBy, setFilteredBy] = useState<FilterName>(FilterName.ALL);
  const [tempTodo, setTempTodo] = useState<Todo | null>(null);
  const [newTodoTitle, setNewTodoTitle] = useState('');
  const [loadingTodoId, setLoadingTodoId] = useState<number | null>(null);
  const [isInputDisabled, setIsInputDisabled] = useState(false);
  const [editingTodoId, setEditingTodoId] = useState<number | null>(null);
  const [editingTitle, setEditingTitle] = useState<string>('');

  const activeCount = todos.filter(todo => !todo.completed).length;
  const completedTodos = todos.filter(todo => todo.completed);

  const inputRef = useRef<HTMLInputElement>(null);

  function loadTodos() {
    getTodos()
      .then(setTodos)
      .catch(() => {
        setErrorMessage(Error.Load);
        setTimeout(() => setErrorMessage(Error.Default), 3000);
      });
  }

  useEffect(() => {
    loadTodos();
  }, []);

  useEffect(() => {
    if (!isInputDisabled && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isInputDisabled]);

  const filteredTodos = useMemo(() => {
    switch (filteredBy) {
      case FilterName.ACTIVE:
        return todos.filter(todo => !todo.completed);
      case FilterName.COMPLETED:
        return todos.filter(todo => todo.completed);
      default:
        return todos;
    }
  }, [todos, filteredBy]);

  function addPost(loadingTodo: Todo) {
    setTempTodo(loadingTodo);
    setErrorMessage(Error.Default);
    setIsInputDisabled(true);

    addTodo({
      userId: loadingTodo.userId,
      title: loadingTodo.title,
      completed: loadingTodo.completed,
    })
      .then(createdTodo => {
        setTodos(currentTodos => [...currentTodos, createdTodo]);
        setNewTodoTitle('');
      })
      .catch(() => {
        setErrorMessage(Error.Add);
        setTimeout(() => setErrorMessage(Error.Default), 3000);
      })
      .finally(() => {
        setTempTodo(null);
        setIsInputDisabled(false);
        inputRef.current?.focus();
      });
  }

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault();

    const trimmedTitle = newTodoTitle.trim();

    if (!trimmedTitle) {
      setErrorMessage(Error.Empty);
      setTimeout(() => setErrorMessage(Error.Default), 3000);

      return;
    }

    const loadingTodo: Todo = {
      userId: USER_ID,
      title: trimmedTitle,
      completed: false,
      id: 0,
    };

    setTempTodo(loadingTodo);
    addPost(loadingTodo);
  }

  const deletePost = useCallback((todoId: number) => {
    setLoadingTodoId(todoId);
    deleteTodo(todoId)
      .then(() => {
        setTodos(currentTodos =>
          currentTodos.filter(todo => todo.id !== todoId),
        );
      })
      .catch(() => {
        setErrorMessage(Error.Delete);
        setTimeout(() => setErrorMessage(Error.Default), 3000);
      })
      .finally(() => {
        setLoadingTodoId(null);
        inputRef.current?.focus();
      });
  }, []);

  const deleteCompleted = useCallback(() => {
    const completedIds = todos
      .filter(todo => todo.completed)
      .map(todo => todo.id);

    completedIds.forEach(id => deletePost(id));
  }, [todos, deletePost]);

  function togglCompleted(todoId: number) {
    const currentTodo = todos.find(todo => todo.id === todoId);

    if (!currentTodo) {
      return;
    }

    const newCompletionState = !currentTodo.completed;

    setLoadingTodoId(todoId);

    updateTodo(todoId, newCompletionState, currentTodo.title)
      .then(() => {
        setTodos(prevTodos =>
          prevTodos.map(todo =>
            todo.id === todoId
              ? { ...todo, completed: newCompletionState }
              : todo,
          ),
        );
      })
      .catch(() => {
        setErrorMessage(Error.Update);
        setTimeout(() => setErrorMessage(Error.Default), 3000);
      })
      .finally(() => {
        setLoadingTodoId(null);
      });
  }

  async function completeAll() {
    const allCompleted = todos.every(todo => todo.completed);
    const newCompletionState = !allCompleted;

    const todosToUpdate = todos.filter(
      todo => todo.completed !== newCompletionState,
    );

    const failedIds: number[] = [];

    for (const todo of todosToUpdate) {
      try {
        await updateTodo(todo.id, newCompletionState, todo.title);
      } catch {
        failedIds.push(todo.id);
      }
    }

    setTodos(currentTodos =>
      currentTodos.map(todo =>
        failedIds.includes(todo.id)
          ? todo
          : { ...todo, completed: newCompletionState },
      ),
    );

    if (failedIds.length > 0) {
      setErrorMessage(Error.Update);
    }
  }

  const updateTitle = useCallback(
    (todoId: number) => {
      const trimmedTitle = editingTitle.trim();
      const currentTodo = todos.find(todo => todo.id === todoId);

      if (currentTodo && trimmedTitle === currentTodo.title) {
        setEditingTodoId(null);

        return;
      }

      if (trimmedTitle === '') {
        deletePost(todoId);
      } else {
        setLoadingTodoId(todoId);

        updateTodo(todoId, currentTodo?.completed || false, trimmedTitle)
          .then(() => {
            setTodos(prevTodos =>
              prevTodos.map(todo =>
                todo.id === todoId ? { ...todo, title: trimmedTitle } : todo,
              ),
            );
            setEditingTodoId(null);
          })
          .catch(() => {
            setErrorMessage(Error.Update);
            setTimeout(() => setErrorMessage(Error.Default), 3000);
          })
          .finally(() => {
            setLoadingTodoId(null);
          });
      }
    },
    [todos, editingTitle, deletePost],
  );

  useEffect(() => {
    if (errorMessage) {
      const timer = setTimeout(() => setErrorMessage(Error.Default), 3000);

      return () => clearTimeout(timer);
    }

    return;
  }, [errorMessage]);

  if (!USER_ID) {
    return <UserWarning />;
  }

  const handleCancelEdit = useCallback(() => {
    setEditingTodoId(null);
    setEditingTitle('');
  }, []);

  const handleEditTodo = useCallback((todoId: number, title: string) => {
    setEditingTodoId(todoId);
    setEditingTitle(title);
  }, []);

  return (
    <div className="todoapp">
      <h1 className="todoapp__title">todos</h1>

      <div className="todoapp__content">
        <Header
          todos={todos}
          completeAll={completeAll}
          activeCount={activeCount}
          handleSubmit={handleSubmit}
          inputRef={inputRef}
          newTodoTitle={newTodoTitle}
          setNewTodoTitle={setNewTodoTitle}
          isInputDisabled={isInputDisabled}
        />
        {!!todos.length && (
          <TodoList
            filteredTodos={filteredTodos}
            togglCompleted={togglCompleted}
            editingTodoId={editingTodoId}
            editingTitle={editingTitle}
            setEditingTitle={setEditingTitle}
            updateTitle={updateTitle}
            handleCancelEdit={handleCancelEdit}
            handleEditTodo={handleEditTodo}
            loadingTodoId={loadingTodoId}
            deletePost={deletePost}
            tempTodo={tempTodo}
          />
        )}

        {!!todos.length && (
          <Footer
            activeCount={activeCount}
            filteredBy={filteredBy}
            setFilteredBy={setFilteredBy}
            deleteCompleted={deleteCompleted}
            completedTodos={completedTodos}
          />
        )}
      </div>

      <ErrorMes errorMessage={errorMessage} />
    </div>
  );
};
