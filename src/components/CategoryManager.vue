<template>
  <div class="category-manager">
    <h3>Categories</h3>
    
    <!-- Add Category Form -->
    <div class="category-form">
      <input
        v-model="newCategory.name"
        placeholder="Category name"
        @keyup.enter="addCategory"
      />
      <input
        type="color"
        v-model="newCategory.color"
      />
      <input
        v-model="newCategory.description"
        placeholder="Description (optional)"
      />
      <button @click="addCategory" :disabled="!newCategory.name">Add Category</button>
    </div>

    <!-- Category List -->
    <div class="category-list">
      <div v-for="category in categories" :key="category.id" class="category-item">
        <div class="category-color" :style="{ backgroundColor: category.color }"></div>
        <div class="category-info">
          <div class="category-name">{{ category.name }}</div>
          <div class="category-description" v-if="category.description">
            {{ category.description }}
          </div>
        </div>
        <div class="category-actions">
          <button @click="editCategory(category)" class="edit-btn">✎</button>
          <button @click="deleteCategory(category.id)" class="delete-btn">×</button>
        </div>
      </div>
    </div>

    <!-- Edit Category Modal -->
    <div v-if="editingCategory" class="modal">
      <div class="modal-content">
        <h4>Edit Category</h4>
        <input
          v-model="editingCategory.name"
          placeholder="Category name"
        />
        <input
          type="color"
          v-model="editingCategory.color"
        />
        <input
          v-model="editingCategory.description"
          placeholder="Description (optional)"
        />
        <div class="modal-actions">
          <button @click="saveEdit">Save</button>
          <button @click="cancelEdit">Cancel</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref } from 'vue'
import { useStore } from 'vuex'

export default {
  name: 'CategoryManager',
  setup() {
    const store = useStore()
    const newCategory = ref({
      name: '',
      color: '#3498db',
      description: ''
    })
    const editingCategory = ref(null)

    const addCategory = async () => {
      try {
        await store.dispatch('addCategory', {
          name: newCategory.value.name,
          color: newCategory.value.color,
          description: newCategory.value.description
        })
        store.dispatch('saveCategories')
        newCategory.value.name = ''
        newCategory.value.description = ''
      } catch (error) {
        alert(error.message)
      }
    }

    const editCategory = (category) => {
      editingCategory.value = { ...category }
    }

    const saveEdit = () => {
      store.dispatch('updateCategory', {
        id: editingCategory.value.id,
        name: editingCategory.value.name,
        color: editingCategory.value.color,
        description: editingCategory.value.description
      })
      store.dispatch('saveCategories')
      editingCategory.value = null
    }

    const cancelEdit = () => {
      editingCategory.value = null
    }

    const deleteCategory = async (categoryId) => {
      if (confirm('Are you sure you want to delete this category?')) {
        await store.dispatch('deleteCategory', categoryId)
        store.dispatch('saveCategories')
      }
    }

    return {
      categories: computed(() => store.state.categories),
      newCategory,
      editingCategory,
      addCategory,
      editCategory,
      saveEdit,
      cancelEdit,
      deleteCategory
    }
  }
}
</script>

<style scoped>
.category-manager {
  margin: 20px 0;
  padding: 20px;
  background: #f8f9fa;
  border-radius: 8px;
}

.category-form {
  display: flex;
  gap: 10px;
  margin-bottom: 20px;
}

.category-form input[type="text"],
.category-form input[type="color"] {
  padding: 8px;
  border: 1px solid #ddd;
  border-radius: 4px;
}

.category-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.category-item {
  display: flex;
  align-items: center;
  padding: 10px;
  background: white;
  border-radius: 4px;
  box-shadow: 0 1px 3px rgba(0,0,0,0.1);
}

.category-color {
  width: 20px;
  height: 20px;
  border-radius: 50%;
  margin-right: 10px;
}

.category-info {
  flex-grow: 1;
}

.category-name {
  font-weight: bold;
}

.category-description {
  font-size: 0.9em;
  color: #666;
}

.category-actions {
  display: flex;
  gap: 5px;
}

.edit-btn,
.delete-btn {
  padding: 5px 10px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.edit-btn {
  background: #f0ad4e;
  color: white;
}

.delete-btn {
  background: #d9534f;
  color: white;
}

.modal {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0,0,0,0.5);
  display: flex;
  justify-content: center;
  align-items: center;
}

.modal-content {
  background: white;
  padding: 20px;
  border-radius: 8px;
  width: 300px;
}

.modal-content input {
  width: 100%;
  margin: 10px 0;
  padding: 8px;
  border: 1px solid #ddd;
  border-radius: 4px;
}

.modal-actions {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  margin-top: 20px;
}

button {
  padding: 8px 16px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  background: #007bff;
  color: white;
}

button:disabled {
  background: #ccc;
  cursor: not-allowed;
}
</style>