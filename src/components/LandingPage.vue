<template>
  <div class="landing-container">
    <h1>My Todo Lists</h1>
    
    <div class="create-list">
      <h2>Create New List</h2>
      <div class="input-group">
        <input
          type="text"
          v-model="newListName"
          placeholder="Enter list name"
          @keyup.enter="createList"
        />
        <button :disabled="!newListName.trim()" @click="createList">Create</button>
      </div>
    </div>

    <div class="existing-lists" v-if="todoLists.length">
      <h2>Your Lists</h2>
      <div class="lists-grid">
        <div
          v-for="list in todoLists"
          :key="list.id"
          class="list-card"
          @click="openList(list.id)"
        >
          <div class="list-header">
            <h3>{{ list.name }}</h3>
            <button class="delete-btn" @click.stop="confirmDeleteList(list)">×</button>
          </div>
          <p>{{ list.todos.length }} items</p>
          <p class="last-modified">Last modified: {{ formatDate(list.lastModified) }}</p>
        </div>
      </div>
    </div>

    <div class="no-lists" v-else>
      <p>You don't have any todo lists yet. Create your first one!</p>
    </div>
  </div>
</template>

<script>
import { ref, computed } from 'vue';
import { useStore } from 'vuex';
import { useRouter } from 'vue-router';

export default {
  name: 'LandingPage',
  setup() {
    const store = useStore();
    const router = useRouter();
    const newListName = ref('');

    const todoLists = computed(() => store.state.todoLists);

    const createList = () => {
      if (newListName.value.trim()) {
        const listName = newListName.value.trim();
        if (todoLists.value.some(list => list.name === listName)) {
          store.dispatch('showToast', 'A list with this name already exists!');
          return;
        }

        const listId = Date.now().toString();
        store.commit('createTodoList', {
          id: listId,
          name: listName,
          todos: [],
          lastModified: new Date(),
          subtasks: []
        });

        router.push(`/list/${listId}`);
      }
    };

    const openList = (listId) => {
      router.push(`/list/${listId}`);
    };

    const formatDate = (date) => {
      return new Date(date).toLocaleString();
    };

    const confirmDeleteList = (list) => {
      if (confirm(`Are you sure you want to delete the list "${list.name}"?`)) {
        store.commit('deleteTodoList', list.id);
      }
    };

    return {
      newListName,
      todoLists,
      createList,
      openList,
      formatDate,
      confirmDeleteList
    };
  }
};
</script>

<style scoped>
.landing-container {
  max-width: 1000px;
  margin: 0 auto;
  padding: 20px;
}

h1 {
  text-align: center;
  color: #2c3e50;
  margin-bottom: 40px;
}

.create-list {
  margin-bottom: 40px;
  padding: 20px;
  background-color: #f8f9fa;
  border-radius: 8px;
}

.input-group {
  display: flex;
  gap: 10px;
}

input {
  flex: 1;
  padding: 10px;
  font-size: 16px;
  border: 1px solid #ddd;
  border-radius: 4px;
}

button {
  padding: 10px 20px;
  background-color: #4CAF50;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

button:disabled {
  background-color: #cccccc;
  cursor: not-allowed;
}

.lists-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 20px;
  margin-top: 20px;
}

.list-card {
  padding: 20px;
  background-color: #fff;
  border: 1px solid #ddd;
  border-radius: 8px;
  cursor: pointer;
  transition: transform 0.2s, box-shadow 0.2s;
}

.list-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.list-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
}

.list-card h3 {
  margin: 0;
  color: #2c3e50;
}

.delete-btn {
  background-color: transparent;
  color: #ff4444;
  border: none;
  font-size: 24px;
  cursor: pointer;
  padding: 0 8px;
  line-height: 1;
}

.delete-btn:hover {
  color: #cc0000;
}

.list-card p {
  margin: 5px 0;
  color: #666;
}

.last-modified {
  font-size: 0.9em;
  color: #888;
}

.no-lists {
  text-align: center;
  color: #666;
  margin-top: 40px;
}
</style>