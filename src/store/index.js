import { createStore } from 'vuex';
import { Todo } from '../models/Todo';

export default createStore({
  state: {
    todos: []
  },
  mutations: {
    ADD_TODO(state, todo) {
      state.todos.push(todo);
    },
    DELETE_TODO(state, todoId) {
      const index = state.todos.findIndex(todo => todo.id === todoId);
      if (index !== -1) {
        state.todos.splice(index, 1);
      }
    },
    EDIT_TODO(state, { todoId, text }) {
      const todo = state.todos.find(todo => todo.id === todoId);
      if (todo) {
        todo.edit(text);
      }
    },
    TOGGLE_TODO_COMPLETE(state, todoId) {
      const todo = state.todos.find(todo => todo.id === todoId);
      if (todo) {
        todo.toggleComplete();
      }
    },
    ADD_SUBTASK(state, { parentId, text }) {
      const parent = state.todos.find(todo => todo.id === parentId);
      if (parent) {
        parent.addSubtask(text);
      }
    },
    DELETE_SUBTASK(state, { parentId, subtaskId }) {
      const parent = state.todos.find(todo => todo.id === parentId);
      if (parent) {
        parent.removeSubtask(subtaskId);
      }
    },
    EDIT_SUBTASK(state, { parentId, subtaskId, text }) {
      const parent = state.todos.find(todo => todo.id === parentId);
      if (parent && parent.subtasks) {
        const subtask = parent.subtasks.find(sub => sub.id === subtaskId);
        if (subtask) {
          subtask.edit(text);
        }
      }
    },
    TOGGLE_SUBTASK_COMPLETE(state, { parentId, subtaskId }) {
      const parent = state.todos.find(todo => todo.id === parentId);
      if (parent && parent.subtasks) {
        const subtask = parent.subtasks.find(sub => sub.id === subtaskId);
        if (subtask) {
          subtask.toggleComplete();
        }
      }
    },
    CLEAR_TODOS(state) {
      state.todos = [];
    },
    SET_TODOS(state, todos) {
      state.todos = todos;
    }
  },
  actions: {
    addTodo({ commit }, text) {
      const todo = new Todo(text);
      commit('ADD_TODO', todo);
    },
    deleteTodo({ commit }, todoId) {
      commit('DELETE_TODO', todoId);
    },
    editTodo({ commit }, { todoId, text }) {
      commit('EDIT_TODO', { todoId, text });
    },
    toggleTodoComplete({ commit }, todoId) {
      commit('TOGGLE_TODO_COMPLETE', todoId);
    },
    addSubtask({ commit }, { parentId, text }) {
      commit('ADD_SUBTASK', { parentId, text });
    },
    deleteSubtask({ commit }, { parentId, subtaskId }) {
      commit('DELETE_SUBTASK', { parentId, subtaskId });
    },
    editSubtask({ commit }, { parentId, subtaskId, text }) {
      commit('EDIT_SUBTASK', { parentId, subtaskId, text });
    },
    toggleSubtaskComplete({ commit }, { parentId, subtaskId }) {
      commit('TOGGLE_SUBTASK_COMPLETE', { parentId, subtaskId });
    },
    clearTodos({ commit }) {
      commit('CLEAR_TODOS');
    },
    loadTodos({ commit }) {
      const savedTodos = localStorage.getItem('todos');
      if (savedTodos) {
        const todos = JSON.parse(savedTodos).map(todo => Todo.fromJSON(todo));
        commit('SET_TODOS', todos);
      }
    },
    saveTodos({ state }) {
      localStorage.setItem('todos', JSON.stringify(state.todos));
    }
  }
});