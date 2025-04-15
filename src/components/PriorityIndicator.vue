<template>
  <span v-if="priority" :class="['priority-indicator', priority.toLowerCase()]" :title="`Priority: ${priority}`">
    {{ getPriorityIcon(priority) }}
  </span>
</template>

<script>
export default {
  name: 'PriorityIndicator',
  props: {
    priority: {
      type: String,
      default: 'Medium'
    }
  },
  setup() {
    const getPriorityIcon = (priority) => {
      switch (priority) {
        case 'Critical': return '🔴';
        case 'High': return '🟠';
        case 'Medium': return '🟡';
        case 'Low': return '🟢';
        default: return '';
      }
    };

    return {
      getPriorityIcon
    };
  }
}
</script>

<style scoped>
.priority-indicator {
  display: inline-block;
  margin-right: 5px;
  font-size: 0.9em;
}

.priority-indicator.critical {
  color: #d32f2f;
}

.priority-indicator.high {
  color: #f57c00;
}

.priority-indicator.medium {
  color: #fbc02d;
}

.priority-indicator.low {
  color: #388e3c;
}
</style>