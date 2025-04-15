/**
 * Export todos to a CSV file
 * @param {Array} todos - Array of todo objects
 */
export function exportTodosToCSV(todos) {
  const rows = [];
  rows.push(['Task', 'Status', 'Priority', 'Subtask', 'Subtask Status']);
  
  todos.forEach(todo => {
    if (todo.subtasks.length === 0) {
      rows.push([
        todo.text, 
        todo.completed ? 'Completed' : 'Pending', 
        todo.priority || 'Medium', 
        '', 
        ''
      ]);
    } else {
      todo.subtasks.forEach((subtask, index) => {
        if (index === 0) {
          rows.push([
            todo.text,
            todo.completed ? 'Completed' : 'Pending',
            todo.priority || 'Medium',
            subtask.text,
            subtask.completed ? 'Completed' : 'Pending'
          ]);
        } else {
          rows.push(['', '', '', subtask.text, subtask.completed ? 'Completed' : 'Pending']);
        }
      });
    }
  });

  const csvContent = rows.map(row => row.join(',')).join('\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  link.setAttribute('href', url);
  link.setAttribute('download', 'todo-list.csv');
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}