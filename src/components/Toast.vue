<template>
  <Transition name="fade">
    <div v-show="message" class="toast" :class="type">
      {{ message }}
    </div>
  </Transition>
</template>

<script>
import { Transition } from 'vue';

export default {
  name: 'Toast',
  components: {
    Transition
  },
  props: {
    message: {
      type: String,
      required: true
    },
    type: {
      type: String,
      default: 'info'
    }
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