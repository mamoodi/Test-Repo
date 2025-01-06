<template>
  <div id="app">
    <h1>TODO APP</h1>
    <CategoryManager />
    <TodoList />
  </div>
</template>

<script>
import TodoList from './components/TodoList.vue'
import CategoryManager from './components/CategoryManager.vue'

export default {
  name: 'App',
  components: {
    TodoList,
    CategoryManager
  },
  created() {
    this.$store.dispatch('loadCategories')
  }
}
</script>

<style>
#app {
  font-family: Arial, sans-serif;
  max-width: 600px;
  margin: 0 auto;
  padding: 20px;
}

h1 {
  text-align: center;
  color: #2c3e50;
}
</style>