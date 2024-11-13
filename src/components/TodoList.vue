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
        {{ todo }}
        <button class="delete-btn" @click="deleteTodo(index)">×</button>
      </li>
    </ul>
  </div>
</template>

<script>
export default {
  name: 'TodoList',
  data() {
    return {
      newTodo: '',
      todos: []
    }
  },
  methods: {
    addTodo() {
      if (this.newTodo.trim()) {
        this.todos.push(this.newTodo.trim())
        this.newTodo = ''
      }
    },
    deleteTodo(index) {
      this.todos.splice(index, 1)
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
</style>