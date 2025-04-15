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
        <li 
          v-for="(todo, index) in todos" 
          :key="todo.id" 
          :class="{ completed: todo.completed, 'drag-over': dragOverIndex === index }"
          draggable="true"
          @dragstart="dragStart($event, index)"
          @dragover.prevent="dragOver($event, index)"
          @dragenter.prevent="dragEnter(index)"
          @dragleave="dragLeave()"
          @drop="drop($event, index)"
          @dragend="dragEnd()"
        >
          <div class="todo-item">
            <div class="drag-handle" title="Drag to reorder">⋮⋮</div>
            <button class="icon-button" @click="toggleTodo(todo)">✓</button>
            <div class="todo-content">
              <div class="todo-main">
                <div class="todo-info">
                  <div class="todo-text-container">
                    <span v-if="!todo.editing" @dblclick="startEditing(todo)" class="todo-text">
                      {{ todo.text }}
                    </span>
                    <input
                      v-else
                      type="text"
                      v-model="todo.editText"
                      @blur="finishEditing(todo)"
                      @keyup.enter="finishEditing(todo)"
                      @keyup.esc="cancelEditing(todo)"
                      class="todo-input"
                    />
                  </div>
                  <div class="todo-badges" v-if="todo.deadline || todo.priority">
                    <div v-if="todo.deadline" :class="['deadline-badge', { 'overdue': isOverdue(todo.deadline) }]">
                      <span class="deadline-icon">⏰</span>
                      <span class="deadline-date">Due {{ formatDeadline(todo.deadline) }}</span>
                    </div>
                    <div v-if="todo.priority" :class="['priority-badge', todo.priority.toLowerCase()]">
                      <PriorityIndicator :priority="todo.priority" />
                      <span class="priority-label">{{ todo.priority }}</span>
                    </div>
                  </div>
                </div>
                <div class="todo-actions">
                  <button class="icon-button" @click="startEditing(todo)">✎</button>
                  <button class="icon-button" @click="addSubtask(todo)">+</button>
                  <DeadlineSelector 
                    :deadline="todo.deadline" 
                    @update:deadline="(deadline) => updateTodoDeadline(todo, deadline)" 
                  />
                  <PrioritySelector 
                    :priority="todo.priority" 
                    @update:priority="(priority) => updateTodoPriority(todo, priority)" 
                  />
                  <button class="icon-button" @click="deleteTodo(todo)">×</button>
                </div>
              </div>
            </div>
          </div>
          <ul class="subtask-list" v-if="todo.subtasks && todo.subtasks.length">
            <li
              v-for="(subtask, subtaskIndex) in todo.subtasks"
              :key="subtask.id"
              :class="{ 
                completed: subtask.completed, 
                'drag-over': dragOverSubtaskData && 
                             dragOverSubtaskData.todoIndex === index && 
                             dragOverSubtaskData.subtaskIndex === subtaskIndex 
              }"
              draggable="true"
              @dragstart="dragStartSubtask($event, index, subtaskIndex)"
              @dragover.prevent="dragOverSubtask($event, index, subtaskIndex)"
              @dragenter.prevent="dragEnterSubtask(index, subtaskIndex)"
              @dragleave="dragLeaveSubtask()"
              @drop="dropSubtask($event, index, subtaskIndex)"
              @dragend="dragEndSubtask()"
            >
              <div class="subtask-item">
                <div class="drag-handle" title="Drag to reorder">⋮⋮</div>
                <button class="icon-button" @click="toggleSubtask(todo, subtask)">✓</button>
                <div class="subtask-content">
                  <div class="subtask-main">
                    <div class="subtask-info">
                      <div class="subtask-text-container">
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
                      </div>
                      <div class="subtask-badges" v-if="subtask.deadline">
                        <div :class="['deadline-badge', { 'overdue': isOverdue(subtask.deadline) }]">
                          <span class="deadline-icon">⏰</span>
                          <span class="deadline-date">Due {{ formatDeadline(subtask.deadline) }}</span>
                        </div>
                      </div>
                    </div>
                    <div class="subtask-actions">
                      <button class="icon-button" @click="startEditingSubtask(subtask)">✎</button>
                      <button class="icon-button deadline-btn" @click="setSubtaskDeadline(todo, subtask)">📅</button>
                      <button class="icon-button" @click="deleteSubtask(todo, subtask)">×</button>
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
import PrioritySelector from './PrioritySelector.vue';
import PriorityIndicator from './PriorityIndicator.vue';
import DeadlineSelector from './DeadlineSelector.vue';
import { formatDate, isDateOverdue, isValidDateFormat, getTodayDateString } from '../utils/dateUtils';
import { exportTodosToCSV } from '../utils/exportUtils';

export default {
  name: 'TodoList',
  components: {
    PrioritySelector,
    PriorityIndicator,
    DeadlineSelector
  },
  setup() {
    const store = useStore();
    const route = useRoute();
    const router = useRouter();
    const toast = useToast();

    // Drag and drop state
    const draggedIndex = ref(null);
    const dragOverIndex = ref(null);
    const draggedSubtaskData = ref(null);
    const dragOverSubtaskData = ref(null);

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
          deadline: null,
          priority: 'Medium', // Default priority
          showPriorityMenu: false
        });
        newTodo.value = '';
      }
    };

    const formatDeadline = (deadline) => {
      return formatDate(deadline);
    };

    const isOverdue = (deadline) => {
      return isDateOverdue(deadline);
    };

    const setDeadline = (todo) => {
      const dateStr = todo.deadline || getTodayDateString();
      const newDeadline = prompt('Enter deadline (YYYY-MM-DD):', dateStr);
      
      if (newDeadline) {
        if (!isValidDateFormat(newDeadline)) {
          store.dispatch('showToast', 'Please enter a valid date in YYYY-MM-DD format');
          return;
        }
        
        store.commit('updateTodoDeadline', { todo, deadline: newDeadline });
      }
    };

    const setSubtaskDeadline = (todo, subtask) => {
      const dateStr = subtask.deadline || getTodayDateString();
      const newDeadline = prompt('Enter deadline (YYYY-MM-DD):', dateStr);
      
      if (newDeadline) {
        if (!isValidDateFormat(newDeadline)) {
          store.dispatch('showToast', 'Please enter a valid date in YYYY-MM-DD format');
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
      exportTodosToCSV(todos.value);
    };

    // Drag and drop methods for todos
    const dragStart = (event, index) => {
      draggedIndex.value = index;
      event.dataTransfer.effectAllowed = 'move';
      // Add a custom class to the dragged item
      event.target.classList.add('dragging');
    };

    const dragOver = (event, index) => {
      event.dataTransfer.dropEffect = 'move';
    };

    const dragEnter = (index) => {
      dragOverIndex.value = index;
    };

    const dragLeave = () => {
      dragOverIndex.value = null;
    };

    const drop = (event, index) => {
      if (draggedIndex.value !== null) {
        store.commit('reorderTodos', {
          fromIndex: draggedIndex.value,
          toIndex: index
        });
      }
      dragOverIndex.value = null;
    };

    const dragEnd = () => {
      // Remove the custom class from all items
      document.querySelectorAll('.todo-list > li').forEach(item => {
        item.classList.remove('dragging');
      });
      draggedIndex.value = null;
    };

    // Drag and drop methods for subtasks
    const dragStartSubtask = (event, todoIndex, subtaskIndex) => {
      draggedSubtaskData.value = { todoIndex, subtaskIndex };
      event.dataTransfer.effectAllowed = 'move';
      // Add a custom class to the dragged item
      event.target.classList.add('dragging');
    };

    const dragOverSubtask = (event, todoIndex, subtaskIndex) => {
      event.dataTransfer.dropEffect = 'move';
    };

    const dragEnterSubtask = (todoIndex, subtaskIndex) => {
      dragOverSubtaskData.value = { todoIndex, subtaskIndex };
    };

    const dragLeaveSubtask = () => {
      dragOverSubtaskData.value = null;
    };

    const dropSubtask = (event, todoIndex, subtaskIndex) => {
      if (draggedSubtaskData.value !== null) {
        // Only allow reordering within the same todo
        if (draggedSubtaskData.value.todoIndex === todoIndex) {
          store.commit('reorderSubtasks', {
            todo: todos.value[todoIndex],
            fromIndex: draggedSubtaskData.value.subtaskIndex,
            toIndex: subtaskIndex
          });
        }
      }
      dragOverSubtaskData.value = null;
    };

    const dragEndSubtask = () => {
      // Remove the custom class from all items
      document.querySelectorAll('.subtask-list > li').forEach(item => {
        item.classList.remove('dragging');
      });
      draggedSubtaskData.value = null;
    };
    
    // Priority management methods
    const updateTodoDeadline = (todo, deadline) => {
      store.commit('updateTodoDeadline', { todo, deadline });
    };
    
    const updateTodoPriority = (todo, priority) => {
      store.commit('updateTodoPriority', { todo, priority });
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
      setSubtaskDeadline,
      updateTodoDeadline,
      updateTodoPriority,
      formatDeadline,
      isOverdue,
      // Drag and drop state and methods
      draggedIndex,
      dragOverIndex,
      draggedSubtaskData,
      dragOverSubtaskData,
      dragStart,
      dragOver,
      dragEnter,
      dragLeave,
      drop,
      dragEnd,
      dragStartSubtask,
      dragOverSubtask,
      dragEnterSubtask,
      dragLeaveSubtask,
      dropSubtask,
      dragEndSubtask
    };
  }
};
</script>

<style scoped>
.todo-container {
  max-width: 1000px;
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
  align-items: flex-start;
  padding: 10px;
  margin: 5px 0;
  background-color: #f5f5f5;
  border-radius: 6px;
  cursor: grab;
  box-shadow: 0 1px 2px rgba(0,0,0,0.08);
}

.todo-list > li.dragging, .subtask-list > li.dragging {
  opacity: 0.5;
  background-color: #e0e0e0;
}

.todo-list > li.drag-over, .subtask-list > li.drag-over {
  border-top: 2px solid #1a73e8;
}

.drag-handle {
  color: #aaa;
  margin-right: 8px;
  cursor: grab;
  font-size: 16px;
  user-select: none;
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
  align-items: flex-start;
  justify-content: space-between;
  gap: 10px;
  width: 100%;
}

.todo-info {
  display: flex;
  flex-direction: row;
  align-items: center;
  flex: 1;
  min-width: 0; /* Allows text to truncate properly */
  gap: 12px;
}

.todo-text-container {
  flex: 1;
  min-width: 0; /* Ensures text can truncate */
  overflow: hidden;
}

.todo-text {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  display: block;
}

.todo-text, .subtask-text {
  display: inline-block;
  font-size: 1em;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 100%;
}

.todo-badges {
  display: flex;
  flex-wrap: nowrap;
  gap: 8px;
  flex-shrink: 0;
  max-width: 250px;
  overflow: hidden;
}

.todo-input, .subtask-input {
  flex: 1;
  font-size: 1em;
  padding: 4px 8px;
  border: 1px solid #ddd;
  border-radius: 4px;
}

.todo-details, .subtask-details {
  display: none; /* Hide the old details section since we're now using badges */
}

.subtask-info {
  display: flex;
  flex-direction: row;
  align-items: center;
  flex: 1;
  min-width: 0; /* Allows text to truncate properly */
  gap: 12px;
}

.subtask-text-container {
  flex: 1;
  min-width: 0; /* Ensures text can truncate */
}

.subtask-badges {
  display: flex;
  flex-wrap: nowrap;
  gap: 8px;
  flex-shrink: 0;
}

.deadline-badge, .deadline-info {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 2px 6px;
  border-radius: 4px;
  background-color: #e8f0fe;
  color: #1a73e8;
  font-size: 0.75em;
  white-space: nowrap;
  border: none;
}

.deadline-badge.overdue, .deadline-info.overdue {
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
  flex-shrink: 0;
  align-self: center;
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

/* Priority styles */
.priority-btn {
  position: relative;
}

.priority-menu {
  position: absolute;
  top: 100%;
  right: 0;
  background: white;
  border: 1px solid #ddd;
  border-radius: 4px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  z-index: 10;
  width: 120px;
}

.priority-option {
  padding: 8px 12px;
  cursor: pointer;
  transition: background-color 0.2s;
}

.priority-option:hover {
  background-color: #f5f5f5;
}

.priority-option.critical {
  color: #d32f2f;
  border-left: 3px solid #d32f2f;
}

.priority-option.high {
  color: #f57c00;
  border-left: 3px solid #f57c00;
}

.priority-option.medium {
  color: #fbc02d;
  border-left: 3px solid #fbc02d;
}

.priority-option.low {
  color: #388e3c;
  border-left: 3px solid #388e3c;
}

.priority-indicator {
  display: inline-block;
  margin-right: 5px;
  font-size: 0.9em;
}

.todo-item {
  position: relative;
}

.priority-badge, .priority-info {
  display: inline-flex;
  align-items: center;
  padding: 2px 6px;
  border-radius: 4px;
  font-size: 0.75em;
  white-space: nowrap;
}

.priority-badge.critical, .priority-info.critical {
  background-color: rgba(211, 47, 47, 0.1);
  color: #d32f2f;
  border: none;
}

.priority-badge.high, .priority-info.high {
  background-color: rgba(245, 124, 0, 0.1);
  color: #f57c00;
  border: none;
}

.priority-badge.medium, .priority-info.medium {
  background-color: rgba(251, 192, 45, 0.1);
  color: #fbc02d;
  border: none;
}

.priority-badge.low, .priority-info.low {
  background-color: rgba(56, 142, 60, 0.1);
  color: #388e3c;
  border: none;
}

.priority-icon {
  margin-right: 4px;
}

.todo-details {
  display: none; /* Hide the old details section since we're now using badges */
}
</style>