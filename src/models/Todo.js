export class Todo {
  constructor(text, isSubtask = false) {
    this.id = Date.now() + Math.random().toString(36).substr(2, 9);
    this.text = text;
    this.completed = false;
    this.isSubtask = isSubtask;
    this.subtasks = isSubtask ? null : [];
    this.priority = isSubtask ? null : 'Medium';  // Default priority for main tasks
  }

  addSubtask(text) {
    if (this.isSubtask) {
      throw new Error('Subtasks cannot have subtasks');
    }
    const subtask = new Todo(text, true);
    this.subtasks.push(subtask);
    return subtask;
  }

  toggleComplete() {
    this.completed = !this.completed;
  }

  edit(newText) {
    this.text = newText;
  }

  removeSubtask(subtaskId) {
    if (!this.subtasks) return;
    const index = this.subtasks.findIndex(subtask => subtask.id === subtaskId);
    if (index !== -1) {
      this.subtasks.splice(index, 1);
    }
  }

  toJSON() {
    return {
      id: this.id,
      text: this.text,
      completed: this.completed,
      isSubtask: this.isSubtask,
      priority: this.priority,
      subtasks: this.subtasks?.map(subtask => subtask.toJSON()) || null
    };
  }

  static fromJSON(json) {
    const todo = new Todo(json.text, json.isSubtask);
    todo.id = json.id;
    todo.completed = json.completed;
    todo.priority = json.priority;
    if (json.subtasks) {
      todo.subtasks = json.subtasks.map(subtaskJson => Todo.fromJSON(subtaskJson));
    }
    return todo;
  }

  setPriority(priority) {
    if (this.isSubtask) {
      throw new Error('Subtasks cannot have priority');
    }
    if (!['Critical', 'High', 'Medium', 'Low'].includes(priority)) {
      throw new Error('Invalid priority level');
    }
    this.priority = priority;
  }
}