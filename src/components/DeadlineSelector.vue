<template>
  <div class="deadline-container">
    <button class="icon-button deadline-btn" @click="promptDeadline">📅</button>
  </div>
</template>

<script>
import { computed } from 'vue';
import { useStore } from 'vuex';
import { formatDate, isDateOverdue, isValidDateFormat, getTodayDateString } from '../utils/dateUtils';

export default {
  name: 'DeadlineSelector',
  props: {
    deadline: {
      type: String,
      default: null
    }
  },
  emits: ['update:deadline'],
  setup(props, { emit }) {
    const store = useStore();

    const formattedDeadline = computed(() => {
      return formatDate(props.deadline);
    });

    const isOverdue = computed(() => {
      return isDateOverdue(props.deadline);
    });

    const promptDeadline = () => {
      const dateStr = props.deadline || getTodayDateString();
      const newDeadline = prompt('Enter deadline (YYYY-MM-DD):', dateStr);
      
      if (newDeadline) {
        if (!isValidDateFormat(newDeadline)) {
          store.dispatch('showToast', 'Please enter a valid date in YYYY-MM-DD format');
          return;
        }
        
        emit('update:deadline', newDeadline);
      }
    };

    return {
      formattedDeadline,
      isOverdue,
      promptDeadline
    };
  }
}
</script>

<style scoped>
.deadline-container {
  display: inline-flex;
  align-items: center;
  gap: 8px;
}

.icon-button {
  background: none;
  border: none;
  cursor: pointer;
  font-size: 1.2em;
  padding: 0.2em 0.3em;
}

.deadline-btn {
  color: #2196f3;
}

.deadline-info {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  font-size: 0.85em;
  color: #666;
  background-color: #e3f2fd;
  padding: 2px 6px;
  border-radius: 4px;
}

.deadline-info.overdue {
  color: #d32f2f;
  background-color: #ffebee;
}

.deadline-icon {
  font-size: 0.9em;
}
</style>