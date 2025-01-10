<template>
  <div id="app">
    <router-view></router-view>
  </div>
</template>

<script>
import { useStore } from 'vuex';
import { onMounted } from 'vue';

export default {
  name: 'App',
  setup() {
    const store = useStore();

    onMounted(() => {
      // Initialize the store from localStorage
      const savedLists = localStorage.getItem('todoLists');
      if (savedLists) {
        store.commit('setTodoLists', JSON.parse(savedLists));
      }
    });

    return {};
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