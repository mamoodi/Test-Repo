<template>
  <div class="todo-container">
    <div class="header">
      <button class="back-btn" @click="goBack">← Back to Lists</button>
      <h1>{{ listName }}</h1>
    </div>
    <div class="input-container">
      <div class="add-todo">
        <input
          type="text"
          v-model="newTodo"
          placeholder="Add a new todo"
          @keyup.enter="addTodo"
        />
        <button :disabled="!newTodo.trim()" @click="addTodo">Add</button>
      </div>
      <ul class="todo-list">
        <li v-for="todo in todos" :key="todo.id" :class="{ completed: todo.completed }">
          <div class="todo-item">
            <button class="icon-button" @click="toggleTodo(todo)">✓</button>
            <div class="todo-content">
              <div class="todo-main">
                <span v-if="!todo.editing" @dblclick="startEditing(todo)" class="todo-text">{{ todo.text }}</span>
                <input
                  v-else
                  type="text"
                  v-model="todo.editText"
                  @blur="finishEditing(todo)"
                  @keyup.enter="finishEditing(todo)"
                  @keyup.esc="cancelEditing(todo)"
                  class="todo-input"
                />
                <div class="todo-actions">
                  <button class="icon-button" @click="startEditing(todo)">✎</button>
                  <button class="icon-button" @click="addSubtask(todo)">+</button>
                  <button class="icon-button deadline-btn" @click="setDeadline(todo)">📅</button>
                  <button class="icon-button" @click="deleteTodo(todo)">×</button>
                </div>
              </div>
              <div class="todo-details" v-if="todo.deadline">
                <div :class="['deadline-info', { 'overdue': isOverdue(todo.deadline) }]">
                  <span class="deadline-icon">⏰</span>
                  <span class="deadline-date">Due {{ formatDeadline(todo.deadline) }}</span>
                </div>
              </div>
            </div>
          </div>
          <ul class="subtask-list" v-if="todo.subtasks && todo.subtasks.length">
            <li
              v-for="subtask in todo.subtasks"
              :key="subtask.id"
              :class="{ completed: subtask.completed }"
            >
              <div class="subtask-item">
                <button class="icon-button" @click="toggleSubtask(todo, subtask)">✓</button>
                <div class="subtask-content">
                  <div class="subtask-main">
                    <span v-if="!subtask.editing" @dblclick="startEditingSubtask(subtask)" class="subtask-text">
                      {{ subtask.text }}
                    </span>
                    <input
                      v-else
                      type="text"
                      v-model="subtask.editText"
                      @blur="finishEditingSubtask(todo, subtask)"
                      @keyup.enter="finishEditingSubtask(todo, subtask)"
                      @keyup.esc="cancelEditingSubtask(subtask)"
                      class="subtask-input"
                    />
                    <div class="subtask-actions">
                      <button class="icon-button" @click="startEditingSubtask(subtask)">✎</button>
                      <button class="icon-button deadline-btn" @click="setSubtaskDeadline(todo, subtask)">📅</button>
                      <button class="icon-button" @click="deleteSubtask(todo, subtask)">×</button>
                    </div>
                  </div>
                  <div class="subtask-details" v-if="subtask.deadline">
                    <div :class="['deadline-info', { 'overdue': isOverdue(subtask.deadline) }]">
                      <span class="deadline-icon">⏰</span>
                      <span class="deadline-date">Due {{ formatDeadline(subtask.deadline) }}</span>
                    </div>
                  </div>
                </div>
              </div>
            </li>
          </ul>
        </li>
      </ul>
    </div>
    <div class="list-actions" v-if="todos.length">
      <button class="clear-list-btn" @click="clearList">Clear List</button>
      <button class="export-btn" @click="exportToCSV">Export to CSV</button>
    </div>
  </div>
</template>

<script>
import { ref, computed, onMounted, nextTick, watch } from 'vue';
import { useStore } from 'vuex';
import { useRoute, useRouter } from 'vue-router';
import { useToast } from 'vue-toastification';

export default {
  name: 'TodoList',
  setup() {
    const store = useStore();
    const route = useRoute();
    const router = useRouter();
    const toast = useToast();

    const goBack = () => {
      router.push('/');
    };
    const newTodo = ref('');
    const listName = ref('');
    const listId = ref('');

    onMounted(() => {
      listId.value = route.params.id;
      const list = store.state.todoLists.find(list => list.id === listId.value);
      if (list) {
        listName.value = list.name;
        store.commit('setCurrentTodos', list.todos || []);
      }
    });

    const todos = computed(() => store.state.currentTodos || []);

    // Watch for changes in todos and save them to the list
    watch(todos, (newTodos) => {
      store.commit('updateTodoList', {
        id: listId.value,
        todos: newTodos
      });
    }, { deep: true });

    const addTodo = () => {
      if (newTodo.value.trim()) {
        const todoText = newTodo.value.trim();
        if (todos.value.some(todo => todo.text === todoText)) {
          store.dispatch('showToast', 'This todo already exists!');
          return;
        }
        store.commit('addTodo', {
          id: Date.now(),
          text: todoText,
          completed: false,
          subtasks: [],
          editing: false,
          deadline: null
        });
        newTodo.value = '';
      }
    };

    const formatDeadline = (deadline) => {
      const date = new Date(deadline);
      return date.toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric',
        year: 'numeric'
      });
    };

    const isOverdue = (deadline) => {
      return new Date(deadline) < new Date();
    };

    const setDeadline = (todo) => {
      const currentDate = todo.deadline ? new Date(todo.deadline) : new Date();
      const dateStr = currentDate.toISOString().split('T')[0];
      const newDeadline = prompt('Enter deadline (YYYY-MM-DD):', dateStr);
      
      if (newDeadline) {
        const date = new Date(newDeadline);
        if (isNaN(date.getTime())) {
          store.dispatch('showToast', 'Please enter date in correct format');
          return;
        }
        store.commit('updateTodoDeadline', { todo, deadline: newDeadline });
      }
    };

    const setSubtaskDeadline = (todo, subtask) => {
      const currentDate = subtask.deadline ? new Date(subtask.deadline) : new Date();
      const dateStr = currentDate.toISOString().split('T')[0];
      const newDeadline = prompt('Enter deadline (YYYY-MM-DD):', dateStr);
      
      if (newDeadline) {
        const date = new Date(newDeadline);
        if (isNaN(date.getTime())) {
          store.dispatch('showToast', 'Please enter date in correct format');
          return;
        }
        store.commit('updateSubtaskDeadline', { todo, subtask, deadline: newDeadline });
      }
    };

    const toggleTodo = (todo) => {
      store.commit('toggleTodo', todo);
    };

    const deleteTodo = (todo) => {
      if (confirm('Are you sure you want to delete this todo?')) {
        store.commit('deleteTodo', todo);
      }
    };

    const startEditing = (todo) => {
      todo.editing = true;
      todo.editText = todo.text;
      nextTick(() => {
        const input = document.querySelector('.todo-item input[type="text"]');
        if (input) input.focus();
      });
    };

    const finishEditing = (todo) => {
      if (todo.editText && todo.editText.trim()) {
        if (todos.value.some(t => t.text === todo.editText.trim() && t.id !== todo.id)) {
          store.dispatch('showToast', 'This todo already exists!');
          todo.editing = false;
          return;
        }
        store.commit('updateTodo', {
          todo,
          newText: todo.editText.trim()
        });
      }
      todo.editing = false;
    };

    const cancelEditing = (todo) => {
      todo.editing = false;
    };

    const addSubtask = (todo) => {
      const subtaskText = prompt('Enter subtask:');
      if (subtaskText && subtaskText.trim()) {
        if (todo.subtasks.some(subtask => subtask.text === subtaskText.trim())) {
          store.dispatch('showToast', 'This subtask already exists!');
          return;
        }
        store.commit('addSubtask', {
          todo,
          subtask: {
            id: Date.now(),
            text: subtaskText.trim(),
            completed: false,
            editing: false,
            deadline: null
          }
        });
      }
    };

    const toggleSubtask = (todo, subtask) => {
      store.commit('toggleSubtask', { todo, subtask });
    };

    const deleteSubtask = (todo, subtask) => {
      if (confirm('Are you sure you want to delete this subtask?')) {
        store.commit('deleteSubtask', { todo, subtask });
      }
    };

    const startEditingSubtask = (subtask) => {
      subtask.editing = true;
      subtask.editText = subtask.text;
      nextTick(() => {
        const input = document.querySelector('.subtask-item input[type="text"]');
        if (input) input.focus();
      });
    };

    const finishEditingSubtask = (todo, subtask) => {
      if (subtask.editText && subtask.editText.trim()) {
        if (todo.subtasks.some(s => s.text === subtask.editText.trim() && s.id !== subtask.id)) {
          store.dispatch('showToast', 'This subtask already exists!');
          subtask.editing = false;
          return;
        }
        store.commit('updateSubtask', {
          todo,
          subtask,
          newText: subtask.editText.trim()
        });
      }
      subtask.editing = false;
    };

    const cancelEditingSubtask = (subtask) => {
      subtask.editing = false;
    };

    const clearList = () => {
      if (confirm('Are you sure you want to clear the entire list?')) {
        store.commit('clearTodos');
      }
    };

    const exportToCSV = () => {
      const rows = [];
      rows.push(['Task', 'Status', 'Subtask', 'Subtask Status']);
      
      todos.value.forEach(todo => {
        if (todo.subtasks.length === 0) {
          rows.push([todo.text, todo.completed ? 'Completed' : 'Pending', '', '']);
        } else {
          todo.subtasks.forEach((subtask, index) => {
            if (index === 0) {
              rows.push([
                todo.text,
                todo.completed ? 'Completed' : 'Pending',
                subtask.text,
                subtask.completed ? 'Completed' : 'Pending'
              ]);
            } else {
              rows.push(['', '', subtask.text, subtask.completed ? 'Completed' : 'Pending']);
            }
          });
        }
      });

      const csvContent = rows.map(row => row.join(',')).join('\n');
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', 'todo-list.csv');
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    };

    return {
      newTodo,
      todos,
      listName,
      addTodo,
      toggleTodo,
      deleteTodo,
      startEditing,
      finishEditing,
      cancelEditing,
      addSubtask,
      toggleSubtask,
      deleteSubtask,
      startEditingSubtask,
      finishEditingSubtask,
      cancelEditingSubtask,
      clearList,
      exportToCSV,
      goBack,
      setDeadline,
      setSubtaskDeadline,
      formatDeadline,
      isOverdue
    };
  }
};
</script>

<style scoped>
.todo-container {
  max-width: 800px;
  margin: 0 auto;
  padding: 20px;
}

.header {
  position: relative;
  display: flex;
  align-items: center;
  margin-bottom: 30px;
  justify-content: center;
}

.header h1 {
  margin: 0;
  color: #1a73e8;  /* Google Blue */
  font-size: 2.2em;
  font-weight: 500;
  letter-spacing: -0.5px;
  text-align: center;
}

.back-btn {
  position: absolute;
  left: 0;
  background-color: #1a73e8 !important;  /* Google Blue */
  padding: 8px 16px;
  font-size: 14px;
  border-radius: 6px;
  transition: all 0.2s ease;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
}

.back-btn:hover {
  background-color: #1557b0 !important;  /* Darker Google Blue */
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.15);
  transform: translateY(-1px);
}

.input-container {
  margin-bottom: 20px;
}

.add-todo {
  display: flex;
  gap: 10px;
  margin-bottom: 20px;
}

.add-todo input {
  flex: 1;
  padding: 8px;
  font-size: 16px;
}

.todo-container button {
  padding: 8px 16px;
  background-color: #42b983;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.todo-container button:hover {
  background-color: #3aa876;
}

.todo-container button:disabled {
  background-color: #a8a8a8;
  cursor: not-allowed;
}

.todo-container button:disabled:hover {
  background-color: #a8a8a8;
}

.todo-container .clear-list-btn {
  background-color: #dc3545 !important;
}

.todo-container .clear-list-btn:hover {
  background-color: #c82333 !important;
}

.todo-container .export-btn {
  background-color: #17a2b8 !important;
}

.todo-container .export-btn:hover {
  background-color: #138496 !important;
}

.todo-container .icon-button {
  padding: 4px 8px;
  font-size: 14px;
  background-color: transparent !important;
  color: #666;
  border: 1px solid #ddd;
}

.todo-container .icon-button:hover {
  background-color: #f0f0f0 !important;
  color: #333;
}

.todo-list {
  list-style: none;
  padding: 0;
}

.todo-item, .subtask-item {
  display: flex;
  align-items: center;
  padding: 8px;
  margin: 4px 0;
  background-color: #f5f5f5;
  border-radius: 4px;
}

.todo-content, .subtask-content {
  flex: 1;
  margin: 0 10px;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.todo-main, .subtask-main {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
}

.todo-text, .subtask-text {
  flex: 1;
  font-size: 1em;
}

.todo-input, .subtask-input {
  flex: 1;
  font-size: 1em;
  padding: 4px 8px;
  border: 1px solid #ddd;
  border-radius: 4px;
}

.todo-details, .subtask-details {
  margin-left: 4px;
  font-size: 0.85em;
}

.deadline-info {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 2px 8px;
  border-radius: 12px;
  background-color: #e8f0fe;
  color: #1a73e8;
}

.deadline-info.overdue {
  background-color: #fde8e8;
  color: #dc3545;
}

.deadline-icon {
  font-size: 0.9em;
}

.deadline-date {
  white-space: nowrap;
}

.todo-actions, .subtask-actions {
  display: flex;
  gap: 5px;
  margin-left: auto;
}

.deadline-btn {
  font-size: 1em;
  padding: 4px 8px;
}



.completed span {
  text-decoration: line-through;
  color: #888;
}

.subtask-list {
  list-style: none;
  padding-left: 40px;
}

.list-actions {
  margin-top: 20px;
  display: flex;
  gap: 10px;
  justify-content: center;
}

input[type="text"] {
  padding: 4px 8px;
  font-size: 14px;
  border: 1px solid #ddd;
  border-radius: 4px;
}
</style>