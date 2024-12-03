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
      <li v-for="(todo, index) in todos" :key="index" class="todo-item">
        <div class="todo-container">
          <div class="todo-text">
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
            <button 
              class="complete-btn" 
              :class="{ 'complete-btn-active': todo.completed }"
              @click="toggleComplete(index)"
            >✓</button>
            <button class="delete-btn" @click="showDeleteConfirmation(index)">×</button>
            <button v-if="!todo.isSubtask" class="add-subtask-btn" @click="addSubtask(index)">+</button>
          </div>
        </div>
        <ul v-if="todo.subtasks && todo.subtasks.length > 0" class="subtasks">
          <li v-for="(subtask, subIndex) in todo.subtasks" :key="subIndex" class="subtask-item">
            <div class="todo-container">
              <div class="todo-text">
                <span 
                  v-if="!isEditing || (editIndex !== `${index}-${subIndex}`)"
                  :class="{ completed: subtask.completed }"
                >{{ subtask.text }}</span>
                <input 
                  v-else 
                  type="text" 
                  v-model="editTodo" 
                  @keyup.enter="confirmEdit(`${index}-${subIndex}`)" 
                  @blur="confirmEdit(`${index}-${subIndex}`)" 
                />
              </div>
              <div class="todo-actions">
                <button v-if="!isEditing || (editIndex !== `${index}-${subIndex}`)" class="edit-btn" @click="startEdit(`${index}-${subIndex}`)">✎</button>
                <button 
                  class="complete-btn" 
                  :class="{ 'complete-btn-active': subtask.completed }"
                  @click="toggleSubtaskComplete(index, subIndex)"
                >✓</button>
                <button class="delete-btn" @click="showDeleteSubtaskConfirmation(index, subIndex)">×</button>
              </div>
            </div>
          </li>
        </ul>
      </li>
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
export default {
  name: 'TodoList',
  data() {
    return {
      newTodo: '',
      newSubtask: '',
      todos: [], // Array of {text: string, completed: boolean, subtasks: Array}
      showConfirmation: false,
      itemToDelete: null,
      isEditing: false,
      editIndex: null,
      editTodo: '',
      confirmationMessage: '',
      actionType: '', // 'delete', 'clear', or 'deleteSubtask'
      parentIndex: null,
      subTaskIndex: null
    }
  },
  methods: {
    addTodo() {
      if (this.newTodo.trim()) {
        this.todos.push({
          text: this.newTodo.trim(),
          completed: false,
          subtasks: [],
          isSubtask: false
        })
        this.newTodo = ''
      }
    },
    addSubtask(parentIndex) {
      const text = prompt('Enter subtask:')
      if (text && text.trim()) {
        if (!this.todos[parentIndex].subtasks) {
          this.todos[parentIndex].subtasks = []
        }
        this.todos[parentIndex].subtasks.push({
          text: text.trim(),
          completed: false,
          isSubtask: true
        })
      }
    },
    showDeleteConfirmation(index) {
      this.itemToDelete = index
      this.showConfirmation = true
      this.confirmationMessage = 'Are you sure you want to delete item?'
      this.actionType = 'delete'
    },
    showDeleteSubtaskConfirmation(parentIndex, subIndex) {
      this.parentIndex = parentIndex
      this.subTaskIndex = subIndex
      this.showConfirmation = true
      this.confirmationMessage = 'Are you sure you want to delete this subtask?'
      this.actionType = 'deleteSubtask'
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
      } else if (this.actionType === 'deleteSubtask' && this.parentIndex !== null && this.subTaskIndex !== null) {
        this.todos[this.parentIndex].subtasks.splice(this.subTaskIndex, 1)
      }
      this.showConfirmation = false
      this.itemToDelete = null
      this.parentIndex = null
      this.subTaskIndex = null
      this.actionType = ''
    },
    startEdit(index) {
      this.isEditing = true
      this.editIndex = index
      if (typeof index === 'string' && index.includes('-')) {
        const [parentIndex, subIndex] = index.split('-').map(Number)
        this.editTodo = this.todos[parentIndex].subtasks[subIndex].text
      } else {
        this.editTodo = this.todos[index].text
      }
    },
    confirmEdit(index) {
      if (this.editTodo.trim()) {
        if (typeof index === 'string' && index.includes('-')) {
          const [parentIndex, subIndex] = index.split('-').map(Number)
          this.todos[parentIndex].subtasks[subIndex].text = this.editTodo.trim()
        } else {
          this.todos[index].text = this.editTodo.trim()
        }
      }
      this.isEditing = false
      this.editIndex = null
      this.editTodo = ''
    },
    toggleComplete(index) {
      this.todos[index].completed = !this.todos[index].completed
    },
    toggleSubtaskComplete(parentIndex, subIndex) {
      this.todos[parentIndex].subtasks[subIndex].completed = !this.todos[parentIndex].subtasks[subIndex].completed
    },
    exportToCsv() {
      // Create CSV content
      const headers = 'Task,Status\n'
      const rows = this.todos.map(todo => {
        const status = todo.completed ? 'Completed' : 'Pending'
        // Escape quotes and handle commas in text
        const escapedText = todo.text.includes('"') ? 
          `"${todo.text.replace(/"/g, '""')}"` : 
          todo.text.includes(',') ? `"${todo.text}"` : todo.text
        let row = `${escapedText},${status}`

        // Add subtasks
        if (todo.subtasks && todo.subtasks.length > 0) {
          todo.subtasks.forEach(subtask => {
            const subStatus = subtask.completed ? 'Completed' : 'Pending'
            const escapedSubText = subtask.text.includes('"') ? 
              `"${subtask.text.replace(/"/g, '""')}"` : 
              subtask.text.includes(',') ? `"${subtask.text}"` : subtask.text
            row += `\n  - ${escapedSubText},${subStatus}`
          })
        }
        return row
      }).join('\n')
      const csvContent = headers + rows

      // Create and download the file
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
      const link = document.createElement('a')
      const url = URL.createObjectURL(blob)
      link.setAttribute('href', url)
      link.setAttribute('download', 'todo-list.csv')
      link.style.display = 'none'
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
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
}

.todo-text {
  flex: 1;
}

.completed {
  text-decoration: line-through;
  color: #888;
}

.todo-actions {
  display: flex;
  gap: 10px;
}

.edit-btn, .complete-btn, .delete-btn {
  background-color: transparent;
  border: none;
  font-size: 20px;
  cursor: pointer;
  padding: 0 8px;
}

.edit-btn {
  color: #42b983;
}

.edit-btn:hover {
  color: #3aa876;
  background-color: transparent;
}

.complete-btn {
  color: #888;
}

.complete-btn:hover {
  color: #42b983;
  background-color: transparent;
}

.complete-btn-active {
  color: #42b983;
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

.todo-item {
  margin-bottom: 10px;
}

.todo-container {
  padding: 10px;
  background-color: #f8f8f8;
  border-radius: 4px;
  display: flex;
  justify-content: space-between;
  gap: 10px;
  align-items: center;
}

.subtasks {
  list-style-type: none;
  padding-left: 30px;
  margin-top: 5px;
}

.subtask-item {
  margin-top: 5px;
  position: relative;
}

.subtask-item::before {
  content: '';
  position: absolute;
  left: -20px;
  top: 0;
  bottom: 50%;
  width: 2px;
  background-color: #42b983;
}

.subtask-item::after {
  content: '';
  position: absolute;
  left: -20px;
  top: 50%;
  width: 15px;
  height: 2px;
  background-color: #42b983;
}

.add-subtask-btn {
  background-color: transparent;
  color: #42b983;
  border: none;
  font-size: 20px;
  cursor: pointer;
  padding: 0 8px;
}

.add-subtask-btn:hover {
  color: #3aa876;
  background-color: transparent;
}
</style>