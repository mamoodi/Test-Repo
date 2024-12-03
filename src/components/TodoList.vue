<template>
  <div class="todo-list">
    <div class="add-todo">
      <input 
        type="text" 
        v-model="newTodo" 
        placeholder="Add a new todo"
        @keyup.enter="handleAddTodo"
      >
      <button @click="handleAddTodo">Add</button>
    </div>
    <ul class="todos">
      <todo-item
        v-for="todo in todos"
        :key="todo.id"
        :todo="todo"
        @delete="showDeleteConfirmation(todo.id)"
        @edit="(text) => handleEditTodo(todo.id, text)"
        @toggle-complete="handleToggleTodoComplete(todo.id)"
        @add-subtask="handleAddSubtask(todo.id)"
        @delete-subtask="(subtaskId) => showDeleteSubtaskConfirmation(todo.id, subtaskId)"
        @edit-subtask="(subtaskId, text) => handleEditSubtask(todo.id, subtaskId, text)"
        @toggle-subtask-complete="(subtaskId) => handleToggleSubtaskComplete(todo.id, subtaskId)"
      />
    </ul>
    
    <div class="list-actions" v-if="todos.length > 0">
      <button class="clear-list-btn" @click="showClearConfirmation">Clear List</button>
      <button class="export-btn" @click="exportToCsv">Export to CSV</button>
    </div>

    <!-- Confirmation Modal -->
    <div v-if="showConfirmation" class="modal-overlay">
      <div class="modal">
        <p>{{ confirmationMessage }}</p>
        <div class="modal-buttons">
          <button class="cancel-btn" @click="cancelAction">Cancel</button>
          <button class="confirm-btn" @click="confirmAction">Yes</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { mapState, mapActions } from 'vuex';
import TodoItem from './TodoItem.vue';

export default {
  name: 'TodoList',
  components: {
    TodoItem
  },
  data() {
    return {
      newTodo: '',
      showConfirmation: false,
      itemToDelete: null,
      confirmationMessage: '',
      actionType: '', // 'delete', 'clear', or 'deleteSubtask'
      parentId: null,
      subtaskId: null
    }
  },
  computed: {
    ...mapState(['todos'])
  },
  methods: {
    ...mapActions([
      'addTodo',
      'deleteTodo',
      'editTodo',
      'toggleTodoComplete',
      'addSubtask',
      'deleteSubtask',
      'editSubtask',
      'toggleSubtaskComplete',
      'clearTodos',
      'loadTodos',
      'saveTodos'
    ]),
    handleAddTodo() {
      if (this.newTodo.trim()) {
        this.addTodo(this.newTodo.trim());
        this.newTodo = '';
        this.saveTodos();
      }
    },
    handleAddSubtask(parentId) {
      const text = prompt('Enter subtask:');
      if (text && text.trim()) {
        this.addSubtask({ parentId, text: text.trim() });
        this.saveTodos();
      }
    },
    showDeleteConfirmation(todoId) {
      this.itemToDelete = todoId;
      this.showConfirmation = true;
      this.confirmationMessage = 'Are you sure you want to delete this item?';
      this.actionType = 'delete';
    },
    showDeleteSubtaskConfirmation(parentId, subtaskId) {
      this.parentId = parentId;
      this.subtaskId = subtaskId;
      this.showConfirmation = true;
      this.confirmationMessage = 'Are you sure you want to delete this subtask?';
      this.actionType = 'deleteSubtask';
    },
    showClearConfirmation() {
      this.showConfirmation = true;
      this.confirmationMessage = 'Are you sure you want to clear your TODO list?';
      this.actionType = 'clear';
    },
    cancelAction() {
      this.showConfirmation = false;
      this.itemToDelete = null;
      this.parentId = null;
      this.subtaskId = null;
      this.actionType = '';
    },
    async confirmAction() {
      if (this.actionType === 'delete' && this.itemToDelete) {
        await this.deleteTodo(this.itemToDelete);
      } else if (this.actionType === 'clear') {
        await this.clearTodos();
      } else if (this.actionType === 'deleteSubtask' && this.parentId && this.subtaskId) {
        await this.deleteSubtask({ parentId: this.parentId, subtaskId: this.subtaskId });
      }
      this.saveTodos();
      this.cancelAction();
    },
    handleEditTodo(todoId, text) {
      this.editTodo({ todoId, text });
      this.saveTodos();
    },
    handleToggleTodoComplete(todoId) {
      this.toggleTodoComplete(todoId);
      this.saveTodos();
    },
    handleEditSubtask(parentId, subtaskId, text) {
      this.editSubtask({ parentId, subtaskId, text });
      this.saveTodos();
    },
    handleToggleSubtaskComplete(parentId, subtaskId) {
      this.toggleSubtaskComplete({ parentId, subtaskId });
      this.saveTodos();
    },
    exportToCsv() {
      const headers = 'Task,Status\n';
      const rows = this.todos.map(todo => {
        const status = todo.completed ? 'Completed' : 'Pending';
        const escapedText = todo.text.includes('"') ? 
          `"${todo.text.replace(/"/g, '""')}"` : 
          todo.text.includes(',') ? `"${todo.text}"` : todo.text;
        let row = `${escapedText},${status}`;

        if (todo.subtasks && todo.subtasks.length > 0) {
          todo.subtasks.forEach(subtask => {
            const subStatus = subtask.completed ? 'Completed' : 'Pending';
            const escapedSubText = subtask.text.includes('"') ? 
              `"${subtask.text.replace(/"/g, '""')}"` : 
              subtask.text.includes(',') ? `"${subtask.text}"` : subtask.text;
            row += `\n  - ${escapedSubText},${subStatus}`;
          });
        }
        return row;
      }).join('\n');
      
      const csvContent = headers + rows;
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', 'todo-list.csv');
      link.style.display = 'none';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  },
  created() {
    this.loadTodos();
  }
}
</script>

<style scoped>
.todo-list {
  margin-top: 20px;
}

.add-todo {
  display: flex;
  gap: 10px;
  margin-bottom: 20px;
}

input {
  flex: 1;
  padding: 8px;
  font-size: 16px;
  border: 1px solid #ddd;
  border-radius: 4px;
}

button {
  padding: 8px 16px;
  background-color: #42b983;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

button:hover {
  background-color: #3aa876;
}

.todos {
  list-style-type: none;
  padding: 0;
}

/* Modal Styles */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
}

.modal {
  background-color: white;
  padding: 20px;
  border-radius: 8px;
  min-width: 300px;
  text-align: center;
}

.modal p {
  margin-bottom: 20px;
  font-size: 16px;
}

.modal-buttons {
  display: flex;
  justify-content: center;
  gap: 10px;
}

.cancel-btn {
  background-color: #6c757d;
}

.cancel-btn:hover {
  background-color: #5a6268;
}

.confirm-btn {
  background-color: #dc3545;
}

.confirm-btn:hover {
  background-color: #c82333;
}

.clear-list-btn {
  background-color: #dc3545;
}

.clear-list-btn:hover {
  background-color: #c82333;
}

.list-actions {
  margin-top: 20px;
  display: flex;
  gap: 10px;
}

.list-actions button {
  flex: 1;
}

.export-btn {
  background-color: #17a2b8;
}

.export-btn:hover {
  background-color: #138496;
}
</style>