<template>
  <div class="todo-list">
    <div class="add-todo">
      <input 
        type="text" 
        v-model="newTodo" 
        placeholder="Add a new todo"
        @keyup.enter="addTodo"
      >
      <button @click="addTodo">Add</button>
    </div>
    <ul class="todos">
      <li v-for="(todo, index) in todos" :key="index">
        <div class="todo-text">
          <input 
            type="checkbox" 
            :checked="todo.completed"
            @change="toggleComplete(index)"
          >
          <span 
            v-if="!isEditing || editIndex !== index"
            :class="{ completed: todo.completed }"
          >{{ todo.text }}</span>
          <input 
            v-else 
            type="text" 
            v-model="editTodo" 
            @keyup.enter="confirmEdit(index)" 
            @blur="confirmEdit(index)" 
          />
        </div>
        <div class="todo-actions">
          <button v-if="!isEditing || editIndex !== index" class="edit-btn" @click="startEdit(index)">✎</button>
          <button class="delete-btn" @click="showDeleteConfirmation(index)">×</button>
        </div>
      </li>
    </ul>
    
    <button v-if="todos.length > 0" class="clear-list-btn" @click="showClearConfirmation">Clear List</button>

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
export default {
  name: 'TodoList',
  data() {
    return {
      newTodo: '',
      todos: [], // Array of {text: string, completed: boolean}
      showConfirmation: false,
      itemToDelete: null,
      isEditing: false,
      editIndex: null,
      editTodo: '',
      confirmationMessage: '',
      actionType: '' // 'delete' or 'clear'
    }
  },
  methods: {
    addTodo() {
      if (this.newTodo.trim()) {
        this.todos.push({
          text: this.newTodo.trim(),
          completed: false
        })
        this.newTodo = ''
      }
    },
    showDeleteConfirmation(index) {
      this.itemToDelete = index
      this.showConfirmation = true
      this.confirmationMessage = 'Are you sure you want to delete item?'
      this.actionType = 'delete'
    },
    showClearConfirmation() {
      this.showConfirmation = true
      this.confirmationMessage = 'Are you sure you want to clear your TODO list?'
      this.actionType = 'clear'
    },
    cancelAction() {
      this.showConfirmation = false
      this.itemToDelete = null
      this.actionType = ''
    },
    confirmAction() {
      if (this.actionType === 'delete' && this.itemToDelete !== null) {
        this.todos.splice(this.itemToDelete, 1)
      } else if (this.actionType === 'clear') {
        this.todos = []
      }
      this.showConfirmation = false
      this.itemToDelete = null
      this.actionType = ''
    },
    startEdit(index) {
      this.isEditing = true
      this.editIndex = index
      this.editTodo = this.todos[index].text
    },
    confirmEdit(index) {
      if (this.editTodo.trim()) {
        this.todos[index].text = this.editTodo.trim()
      }
      this.isEditing = false
      this.editIndex = null
      this.editTodo = ''
    },
    toggleComplete(index) {
      this.todos[index].completed = !this.todos[index].completed
    }
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

.todos li {
  padding: 10px;
  background-color: #f8f8f8;
  margin-bottom: 5px;
  border-radius: 4px;
  display: flex;
  justify-content: space-between;
  gap: 10px;
  align-items: center;
}

.delete-btn {
  background-color: transparent;
  color: #ff4444;
  border: none;
  font-size: 20px;
  cursor: pointer;
  padding: 0 8px;
}

.delete-btn:hover {
  color: #cc0000;
  background-color: transparent;
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
.todo-text {
  flex: 1;
  display: flex;
  align-items: center;
  gap: 10px;
}

.todo-text input[type="checkbox"] {
  width: 18px;
  height: 18px;
  cursor: pointer;
}

.completed {
  text-decoration: line-through;
  color: #888;
}

.todo-actions {
  display: flex;
  gap: 10px;
}
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
  margin-top: 20px;
  background-color: #dc3545;
  width: 100%;
}

.clear-list-btn:hover {
  background-color: #c82333;
}
</style>