# TODO App

A feature-rich TODO application built with Vue.js that helps you manage your tasks and subtasks efficiently.

## Features

### Task Management
- Add new TODO items through the input field (Enter key or Add button)
- Mark tasks as complete with a checkmark button (✓)
- Edit existing tasks by clicking the pencil icon (✎)
- Delete tasks with confirmation dialog
- Duplicate detection: Prevents adding identical tasks with error notification
- Tasks maintain their state even after page refresh

### Subtask Support
- Add subtasks to any TODO item
- Manage subtasks independently:
  - Mark subtasks as complete/incomplete
  - Edit subtask text
  - Delete subtasks with confirmation
- Prevents duplicate subtasks within the same parent task

### Visual Feedback
- Completed items show with strikethrough style
- Toast notifications for duplicate items
- Confirmation dialogs for destructive actions (delete/clear)
- Clear visual hierarchy between tasks and subtasks

### Data Management
- Clear entire list with confirmation
- Export your TODO list to CSV format including:
  - Task descriptions
  - Completion status
  - Subtasks with their status
- Automatic saving to local storage
- Data persistence across browser sessions

## Usage Tips
1. Add tasks using the main input field at the top
2. Use the buttons next to each task to:
   - Toggle completion (✓)
   - Edit text (✎)
   - Add subtasks (+)
   - Delete (×)
3. Manage your list using the bottom buttons:
   - Clear List: Removes all tasks (with confirmation)
   - Export to CSV: Downloads your list in CSV format

## Technical Features
- Vue 3 with Composition API
- Vuex for state management
- Local storage integration
- Toast notifications for error handling
- Hierarchical data structure supporting subtasks
