<template>
  <div class="priority-container">
    <button class="icon-button priority-btn" @click="togglePriorityMenu">🔥</button>
    <div v-if="showMenu" class="priority-menu">
      <div class="priority-option critical" @click="setPriority('Critical')">Critical</div>
      <div class="priority-option high" @click="setPriority('High')">High</div>
      <div class="priority-option medium" @click="setPriority('Medium')">Medium</div>
      <div class="priority-option low" @click="setPriority('Low')">Low</div>
    </div>
  </div>
</template>

<script>
import { ref, nextTick } from 'vue';

export default {
  name: 'PrioritySelector',
  props: {
    priority: {
      type: String,
      default: 'Medium'
    }
  },
  emits: ['update:priority'],
  setup(props, { emit }) {
    const showMenu = ref(false);

    const togglePriorityMenu = () => {
      showMenu.value = !showMenu.value;
      
      // Add a click event listener to close the menu when clicking outside
      if (showMenu.value) {
        nextTick(() => {
          const closeMenu = (e) => {
            const menu = document.querySelector('.priority-menu');
            const button = document.querySelector('.priority-btn');
            if (menu && !menu.contains(e.target) && !button.contains(e.target)) {
              showMenu.value = false;
              document.removeEventListener('click', closeMenu);
            }
          };
          
          // Use setTimeout to avoid the current click event from immediately closing the menu
          setTimeout(() => {
            document.addEventListener('click', closeMenu);
          }, 0);
        });
      }
    };
    
    const setPriority = (priority) => {
      emit('update:priority', priority);
      showMenu.value = false;
    };

    return {
      showMenu,
      togglePriorityMenu,
      setPriority
    };
  }
}
</script>

<style scoped>
.priority-container {
  position: relative;
  display: inline-block;
}

.icon-button {
  background: none;
  border: none;
  cursor: pointer;
  font-size: 1.2em;
  padding: 0.2em 0.5em;
}

.priority-btn {
  color: #ff9800;
}

.priority-menu {
  position: absolute;
  top: 100%;
  right: 0;
  background-color: white;
  border: 1px solid #ddd;
  border-radius: 4px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
  z-index: 10;
  min-width: 120px;
}

.priority-option {
  padding: 8px 12px;
  cursor: pointer;
  transition: background-color 0.2s;
}

.priority-option:hover {
  background-color: #f5f5f5;
}

.priority-option.critical {
  color: #d32f2f;
  border-left: 3px solid #d32f2f;
}

.priority-option.high {
  color: #f57c00;
  border-left: 3px solid #f57c00;
}

.priority-option.medium {
  color: #fbc02d;
  border-left: 3px solid #fbc02d;
}

.priority-option.low {
  color: #388e3c;
  border-left: 3px solid #388e3c;
}
</style>