<template>
  <li class="todo-item">
    <div class="todo-container">
      <div class="todo-text">
        <div class="priority-icon" v-if="!todo.isSubtask" :title="todo.priority">
          {{ getPriorityIcon(todo.priority) }}
        </div>
        <div class="todo-content">
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
          <div v-if="!todo.isSubtask && todo.categories.length > 0" class="category-tags">
            <span
              v-for="categoryId in todo.categories"
              :key="categoryId"
              class="category-tag"
              :style="{ backgroundColor: getCategoryColor(categoryId) }"
              @click="removeCategoryFromTodo(categoryId)"
            >
              {{ getCategoryName(categoryId) }} ×
            </span>
          </div>
        </div>
      </div>
      <div class="todo-actions">
        <div v-if="!todo.isSubtask" class="priority-dropdown" v-click-outside="closePriorityDropdown">
          <button class="priority-btn" @click="togglePriorityDropdown">⚑</button>
          <div v-if="showPriorityDropdown" class="priority-menu">
            <div
              v-for="priority in priorities"
              :key="priority"
              class="priority-item"
              @click="changePriority(priority)"
              :class="{ active: todo.priority === priority }"
            >
              <span class="priority-icon">{{ getPriorityIcon(priority) }}</span>
              <span>{{ priority }}</span>
            </div>
          </div>
        </div>
        <div v-if="!todo.isSubtask" class="category-dropdown" v-click-outside="closeCategoryDropdown">
          <button class="category-btn" @click="toggleCategoryDropdown">🏷</button>
          <div v-if="showCategoryDropdown" class="category-menu">
            <div
              v-for="category in availableCategories"
              :key="category.id"
              class="category-item"
              @click="addCategoryToTodo(category.id)"
            >
              <span class="category-color" :style="{ backgroundColor: category.color }"></span>
              <span>{{ category.name }}</span>
            </div>
            <div v-if="availableCategories.length === 0" class="no-categories">
              No categories available
            </div>
          </div>
        </div>
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
      editText: '',
      showPriorityDropdown: false,
      showCategoryDropdown: false,
      priorities: ['Critical', 'High', 'Medium', 'Low']
    }
  },
  computed: {
    availableCategories() {
      return this.$store.state.categories.filter(
        category => !this.todo.categories.includes(category.id)
      );
    }
  },
  directives: {
    clickOutside: {
      mounted(el, binding) {
        el._clickOutside = (event) => {
          if (!(el === event.target || el.contains(event.target))) {
            binding.value(event);
          }
        };
        document.addEventListener('click', el._clickOutside);
      },
      unmounted(el) {
        document.removeEventListener('click', el._clickOutside);
      },
    },
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
    },
    getPriorityIcon(priority) {
      switch (priority) {
        case 'Critical': return '❗';
        case 'High': return '↑';
        case 'Medium': return '−';
        case 'Low': return '↓';
        default: return '−';
      }
    },
    togglePriorityDropdown() {
      this.showPriorityDropdown = !this.showPriorityDropdown;
    },
    closePriorityDropdown() {
      this.showPriorityDropdown = false;
    },
    changePriority(priority) {
      this.$emit('change-priority', priority);
      this.showPriorityDropdown = false;
    },
    toggleCategoryDropdown() {
      this.showCategoryDropdown = !this.showCategoryDropdown;
      if (this.showCategoryDropdown) {
        this.showPriorityDropdown = false;
      }
    },
    closeCategoryDropdown() {
      this.showCategoryDropdown = false;
    },
    getCategoryColor(categoryId) {
      const category = this.$store.state.categories.find(cat => cat.id === categoryId);
      return category ? category.color : '#ddd';
    },
    getCategoryName(categoryId) {
      const category = this.$store.state.categories.find(cat => cat.id === categoryId);
      return category ? category.name : '';
    },
    addCategoryToTodo(categoryId) {
      this.$store.dispatch('addTodoCategory', {
        todoId: this.todo.id,
        categoryId
      });
      this.$store.dispatch('saveTodos');
      this.showCategoryDropdown = false;
    },
    removeCategoryFromTodo(categoryId) {
      this.$store.dispatch('removeTodoCategory', {
        todoId: this.todo.id,
        categoryId
      });
      this.$store.dispatch('saveTodos');
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

.todo-text {
  display: flex;
  align-items: center;
  gap: 8px;
}

.priority-icon {
  font-size: 14px;
  width: 16px;
  display: inline-block;
  text-align: center;
  line-height: 1;
}

.priority-dropdown {
  position: relative;
}

.priority-btn {
  background-color: transparent;
  border: none;
  font-size: 20px;
  cursor: pointer;
  padding: 0 8px;
  color: #42b983;
}

.priority-btn:hover {
  color: #3aa876;
}

.priority-menu {
  position: absolute;
  top: 100%;
  left: 0;
  background-color: white;
  border: 1px solid #ddd;
  border-radius: 4px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
  z-index: 1000;
  min-width: 120px;
}

.priority-item {
  padding: 8px 12px;
  cursor: pointer;
  display: grid;
  grid-template-columns: 24px 1fr;
  align-items: center;
  font-size: 0.9em;
  min-width: 110px;
}

.priority-item:hover {
  background-color: #f5f5f5;
}

.priority-item.active {
  background-color: #e8f5e9;
  color: #42b983;
}

.todo-content {
  display: flex;
  flex-direction: column;
  gap: 5px;
}

.category-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 5px;
}

.category-tag {
  font-size: 0.8em;
  padding: 2px 6px;
  border-radius: 12px;
  color: white;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  gap: 4px;
}

.category-tag:hover {
  opacity: 0.9;
}

.category-dropdown {
  position: relative;
}

.category-btn {
  background-color: transparent;
  border: none;
  font-size: 20px;
  cursor: pointer;
  padding: 0 8px;
  color: #42b983;
}

.category-btn:hover {
  color: #3aa876;
}

.category-menu {
  position: absolute;
  top: 100%;
  right: 0;
  background-color: white;
  border: 1px solid #ddd;
  border-radius: 4px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
  z-index: 1000;
  min-width: 150px;
}

.category-item {
  padding: 8px 12px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;
}

.category-item:hover {
  background-color: #f5f5f5;
}

.category-color {
  width: 12px;
  height: 12px;
  border-radius: 50%;
}

.no-categories {
  padding: 8px 12px;
  color: #888;
  font-style: italic;
  font-size: 0.9em;
}
</style>