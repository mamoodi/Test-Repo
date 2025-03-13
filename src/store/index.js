import { createStore } from 'vuex';
import { Todo } from '../models/Todo';
import { useToast } from 'vue-toastification';

export default createStore({
  state: {
    todoLists: [],
    currentTodos: [],
    toast: {
      message: '',
      type: 'info',
      show: false
    }
  },
  mutations: {
    createTodoList(state, list) {
      state.todoLists.push(list);
      localStorage.setItem('todoLists', JSON.stringify(state.todoLists));
    },
    updateTodoList(state, { id, todos }) {
      const list = state.todoLists.find(l => l.id === id);
      if (list) {
        list.todos = todos;
        list.lastModified = new Date();
        localStorage.setItem('todoLists', JSON.stringify(state.todoLists));
      }
    },
    setCurrentTodos(state, todos) {
      state.currentTodos = todos;
    },
    addTodo(state, todo) {
      state.currentTodos.push(todo);
    },
    toggleTodo(state, todo) {
      todo.completed = !todo.completed;
    },
    deleteTodo(state, todo) {
      const index = state.currentTodos.indexOf(todo);
      if (index > -1) {
        state.currentTodos.splice(index, 1);
      }
    },
    updateTodo(state, { todo, newText }) {
      todo.text = newText;
    },
    addSubtask(state, { todo, subtask }) {
      todo.subtasks.push(subtask);
    },
    toggleSubtask(state, { subtask }) {
      subtask.completed = !subtask.completed;
    },
    deleteSubtask(state, { todo, subtask }) {
      const index = todo.subtasks.indexOf(subtask);
      if (index > -1) {
        todo.subtasks.splice(index, 1);
      }
    },
    updateSubtask(state, { subtask, newText }) {
      subtask.text = newText;
    },
    updateTodoDeadline(state, { todo, deadline }) {
      todo.deadline = deadline;
    },
    updateSubtaskDeadline(state, { subtask, deadline }) {
      subtask.deadline = deadline;
    },
    clearTodos(state) {
      state.currentTodos = [];
    },
    setTodoLists(state, lists) {
      state.todoLists = lists;
    },
    deleteTodoList(state, listId) {
      const index = state.todoLists.findIndex(list => list.id === listId);
      if (index > -1) {
        state.todoLists.splice(index, 1);
        localStorage.setItem('todoLists', JSON.stringify(state.todoLists));
      }
    },
    setToast(state, { message, show }) {
      state.toast.message = message;
      state.toast.show = show;
    }
  },
  actions: {
    initializeApp({ commit }) {
      commit('initializeStore');
    },
    showToast(_, message) {
      const toast = useToast();
      toast.error(message);
    }
  }
});