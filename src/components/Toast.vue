<template>
  <transition name="toast">
    <div v-if="isVisible" class="toast" :class="type">
      {{ message }}
    </div>
  </transition>
</template>

<script>
import { ref } from 'vue';

export default {
  name: 'Toast',
  props: {
    message: {
      type: String,
      required: true
    },
    type: {
      type: String,
      default: 'info'
    },
    duration: {
      type: Number,
      default: 3000
    }
  },
  setup(props, { emit }) {
    const isVisible = ref(false);

    const show = () => {
      isVisible.value = true;
      setTimeout(() => {
        isVisible.value = false;
        setTimeout(() => emit('hidden'), 300); // After fade out animation
      }, props.duration);
    };

    return {
      isVisible,
      show
    };
  }
};
</script>

<style scoped>
.toast {
  position: fixed;
  bottom: 20px;
  left: 50%;
  transform: translateX(-50%);
  padding: 12px 24px;
  border-radius: 6px;
  background-color: #333;
  color: white;
  font-size: 14px;
  z-index: 9999;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
}

.toast-enter-active,
.toast-leave-active {
  transition: all 0.3s ease;
}

.toast-enter-from,
.toast-leave-to {
  opacity: 0;
  transform: translateX(-50%) translateY(20px);
}
</style>