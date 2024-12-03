<template>
  <li class="todo-item">
    <div class="todo-container">
      <div class="todo-text">
        <span 
          v-if="!isEditing"
          :class="{ completed: todo.completed }"
        >{{ todo.text }}</span>
        <input 
          v-else 
          type="text" 
          v-model="editText" 
          @keyup.enter="confirmEdit" 
          @blur="confirmEdit" 
        />
      </div>
      <div class="todo-actions">
        <button v-if="!isEditing" class="edit-btn" @click="startEdit">✎</button>
        <button 
          class="complete-btn" 
          :class="{ 'complete-btn-active': todo.completed }"
          @click="toggleComplete"
        >✓</button>
        <button class="delete-btn" @click="$emit('delete')">×</button>
        <button v-if="!todo.isSubtask" class="add-subtask-btn" @click="$emit('add-subtask')">+</button>
      </div>
    </div>
    <ul v-if="todo.subtasks && todo.subtasks.length > 0" class="subtasks">
      <todo-item
        v-for="subtask in todo.subtasks"
        :key="subtask.id"
        :todo="subtask"
        @delete="$emit('delete-subtask', subtask.id)"
        @edit="(text) => $emit('edit-subtask', subtask.id, text)"
        @toggle-complete="$emit('toggle-subtask-complete', subtask.id)"
      />
    </ul>
  </li>
</template>

<script>
export default {
  name: 'TodoItem',
  props: {
    todo: {
      type: Object,
      required: true
    }
  },
  data() {
    return {
      isEditing: false,
      editText: ''
    }
  },
  methods: {
    startEdit() {
      this.isEditing = true;
      this.editText = this.todo.text;
    },
    confirmEdit() {
      if (this.editText.trim()) {
        this.$emit('edit', this.editText.trim());
      }
      this.isEditing = false;
      this.editText = '';
    },
    toggleComplete() {
      this.$emit('toggle-complete');
    }
  }
}
</script>

<style scoped>
.todo-item {
  margin-bottom: 10px;
  display: flex;
  flex-direction: column;
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

.subtasks {
  list-style-type: none;
  padding-left: 30px;
  margin-top: 5px;
  width: 100%;
}

.edit-btn, .complete-btn, .delete-btn, .add-subtask-btn {
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
}

.complete-btn {
  color: #888;
}

.complete-btn:hover, .complete-btn-active {
  color: #42b983;
}

.delete-btn {
  color: #ff4444;
}

.delete-btn:hover {
  color: #cc0000;
}

.add-subtask-btn {
  color: #42b983;
}

.add-subtask-btn:hover {
  color: #3aa876;
}
</style>