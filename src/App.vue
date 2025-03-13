<template>
  <div id="app">
    <router-view></router-view>
    <Toast 
      v-if="toast.show"
      :message="toast.message"
      :type="toast.type"
      @hidden="hideToast"
    />
  </div>
</template>

<script>
import { useStore } from 'vuex';
import { onMounted, computed } from 'vue';
import Toast from './components/Toast.vue';

export default {
  name: 'App',
  components: {
    Toast
  },
  setup() {
    const store = useStore();

    onMounted(() => {
      // Initialize the store from localStorage
      const savedLists = localStorage.getItem('todoLists');
      if (savedLists) {
        store.commit('setTodoLists', JSON.parse(savedLists));
      }
    });

    const toast = computed(() => store.state.toast);
    const hideToast = () => store.commit('setToast', { message: '', show: false });

    return {
      toast,
      hideToast
    };
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