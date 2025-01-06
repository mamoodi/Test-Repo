import { createStore } from 'vuex';
import { Todo } from '../models/Todo';
import { Category } from '../models/Category';

export default createStore({
  state: {
    todos: [],
    categories: []
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
    },
    CHANGE_PRIORITY(state, { todoId, priority }) {
      const todo = state.todos.find(todo => todo.id === todoId);
      if (todo) {
        todo.setPriority(priority);
      }
    },
    ADD_CATEGORY(state, category) {
      state.categories.push(category);
    },
    UPDATE_CATEGORY(state, { id, name, color, description }) {
      const category = state.categories.find(cat => cat.id === id);
      if (category) {
        category.name = name;
        category.color = color;
        category.description = description;
      }
    },
    DELETE_CATEGORY(state, categoryId) {
      const index = state.categories.findIndex(cat => cat.id === categoryId);
      if (index !== -1) {
        state.categories.splice(index, 1);
        // Remove this category from all todos
        state.todos.forEach(todo => todo.removeCategory(categoryId));
      }
    },
    ADD_TODO_CATEGORY(state, { todoId, categoryId }) {
      const todo = state.todos.find(todo => todo.id === todoId);
      if (todo) {
        todo.addCategory(categoryId);
      }
    },
    REMOVE_TODO_CATEGORY(state, { todoId, categoryId }) {
      const todo = state.todos.find(todo => todo.id === todoId);
      if (todo) {
        todo.removeCategory(categoryId);
      }
    },
    SET_CATEGORIES(state, categories) {
      state.categories = categories;
    }
  },
  actions: {
    addTodo({ commit, state }, text) {
      const normalizedText = text.toLowerCase().trim();
      const isDuplicate = state.todos.some(todo => 
        todo.text.toLowerCase().trim() === normalizedText
      );

      if (isDuplicate) {
        throw new Error('Item already exists');
      }

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
    addSubtask({ commit, state }, { parentId, text }) {
      const parent = state.todos.find(todo => todo.id === parentId);
      if (!parent) return;

      const normalizedText = text.toLowerCase().trim();
      const isDuplicate = parent.subtasks.some(subtask => 
        subtask.text.toLowerCase().trim() === normalizedText
      );

      if (isDuplicate) {
        throw new Error('Item already exists');
      }

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
    },
    changePriority({ commit }, { todoId, priority }) {
      commit('CHANGE_PRIORITY', { todoId, priority });
    },
    addCategory({ commit, state }, { name, color, description = '' }) {
      const normalizedName = name.toLowerCase().trim();
      const isDuplicate = state.categories.some(cat => 
        cat.name.toLowerCase().trim() === normalizedName
      );

      if (isDuplicate) {
        throw new Error('Category already exists');
      }

      const category = new Category(Date.now().toString(), name, color, description);
      commit('ADD_CATEGORY', category);
      return category;
    },
    updateCategory({ commit }, { id, name, color, description }) {
      commit('UPDATE_CATEGORY', { id, name, color, description });
    },
    deleteCategory({ commit }, categoryId) {
      commit('DELETE_CATEGORY', categoryId);
    },
    addTodoCategory({ commit, state }, { todoId, categoryId }) {
      const category = state.categories.find(cat => cat.id === categoryId);
      if (!category) {
        throw new Error('Category not found');
      }
      commit('ADD_TODO_CATEGORY', { todoId, categoryId });
    },
    removeTodoCategory({ commit }, { todoId, categoryId }) {
      commit('REMOVE_TODO_CATEGORY', { todoId, categoryId });
    },
    loadCategories({ commit }) {
      const savedCategories = localStorage.getItem('categories');
      if (savedCategories) {
        const categories = JSON.parse(savedCategories).map(cat => Category.fromJSON(cat));
        commit('SET_CATEGORIES', categories);
      }
    },
    saveCategories({ state }) {
      localStorage.setItem('categories', JSON.stringify(state.categories));
    }
  }
});