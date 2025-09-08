---
name: todo-app-guide
type: knowledge
version: 1.0.0
agent: CodeActAgent
---

# TODO App Repository Guide

This microagent helps understand and work with the TODO App repository - a feature-rich task management application built with Vue.js.

## What This Repository Does

The Test-Repo contains a comprehensive TODO application with the following capabilities:

### Core Features
- **Task Management**: Add, edit, complete, and delete tasks
- **Subtask Support**: Create and manage subtasks within main tasks
- **Priority System**: Set task priorities (Critical, High, Medium, Low) with color coding
- **Data Persistence**: Automatic saving to browser local storage
- **Export Functionality**: Export tasks to CSV format
- **Duplicate Prevention**: Prevents adding identical tasks or subtasks

### Technical Architecture
- **Frontend Framework**: Vue.js 3 with Composition API
- **State Management**: Vuex for centralized state management
- **Routing**: Vue Router for navigation
- **Notifications**: Vue Toastification for user feedback
- **Build Tool**: Vue CLI with custom webpack configuration

## How to Run the Application

### Prerequisites
- Node.js and npm installed
- All dependencies installed via `npm install`

### Development Server
```bash
npm run serve
```
- Runs on port 52002 (configured in vue.config.js)
- Includes CORS headers for cross-origin requests
- Source maps enabled for debugging

### Production Build
```bash
npm run build
```
- Creates optimized production build in `dist/` directory

## Project Structure

```
src/
├── App.vue          # Main application component
├── main.js          # Application entry point
├── components/      # Reusable Vue components
├── models/          # Data models and structures
├── router/          # Vue Router configuration
├── store/           # Vuex store modules
└── utils/           # Utility functions

public/
└── index.html       # HTML template

Configuration:
├── package.json     # Dependencies and scripts
├── vue.config.js    # Vue CLI configuration
└── .gitignore       # Git ignore rules
```

## Testing Information

**Important**: This repository currently has no testing framework configured. There are no:
- Unit tests
- Integration tests
- E2E tests
- Testing dependencies in package.json

If you need to add testing, consider:
- Jest for unit testing
- Vue Test Utils for component testing
- Cypress or Playwright for E2E testing

## Development Workflow

1. **Setup**: Run `npm install` to install dependencies
2. **Development**: Use `npm run serve` for hot-reload development
3. **Building**: Use `npm run build` for production builds
4. **Features**: The app includes comprehensive task management with local storage persistence

## Key Dependencies

- **vue**: ^3.2.13 - Core Vue.js framework
- **vuex**: ^4.0.2 - State management
- **vue-router**: ^4.5.0 - Client-side routing
- **vue-toastification**: ^2.0.0-rc.5 - Toast notifications
- **core-js**: ^3.8.3 - JavaScript polyfills

## Common Tasks

### Adding New Features
- Components go in `src/components/`
- Store modules in `src/store/`
- Routes in `src/router/`

### Debugging
- Source maps are enabled in development
- Vue DevTools compatible
- Console logging available

### Data Management
- All data persists in browser localStorage
- Export functionality available for data backup
- No backend database required

This is a client-side only application with no server-side components or API integrations.