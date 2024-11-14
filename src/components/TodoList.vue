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
          <span v-if="!isEditing || editIndex !== index">{{ todo }}</span>
          <input v-else type="text" v-model="editTodo" @keyup.enter="confirmEdit(index)" @blur="confirmEdit(index)" />
        </div>
        <div class="todo-actions">
          <button v-if="!isEditing || editIndex !== index" class="edit-btn" @click="startEdit(index)">✎</button>
          <button class="delete-btn" @click="showDeleteConfirmation(index)">×</button>
        </div>
      </li>
    </ul>

    <!-- Delete Confirmation Modal -->
    <div v-if="showConfirmation" class="modal-overlay">
      <div class="modal">
        <p>Are you sure you want to delete item?</p>
        <div class="modal-buttons">
          <button class="cancel-btn" @click="cancelDelete">Cancel</button>
          <button class="confirm-btn" @click="confirmDelete">Yes</button>
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
      todos: [],
      showConfirmation: false,
      itemToDelete: null,
      isEditing: false,
      editIndex: null,
      editTodo: ''
    }
  },
  methods: {
    addTodo() {
      if (this.newTodo.trim()) {
        this.todos.push(this.newTodo.trim())
        this.newTodo = ''
      }
    },
    showDeleteConfirmation(index) {
      this.itemToDelete = index
      this.showConfirmation = true
    },
    cancelDelete() {
      this.showConfirmation = false
      this.itemToDelete = null
    },
    confirmDelete() {
      if (this.itemToDelete !== null) {
        this.todos.splice(this.itemToDelete, 1)
        this.showConfirmation = false
        this.itemToDelete = null
      }
    },
    startEdit(index) {
      this.isEditing = true
      this.editIndex = index
      this.editTodo = this.todos[index]
    },
    confirmEdit(index) {
      if (this.editTodo.trim()) {
        this.todos.splice(index, 1, this.editTodo.trim())
      }
      this.isEditing = false
      this.editIndex = null
      this.editTodo = ''
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
</style>