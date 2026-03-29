/**
 * Task Management Application
 * A modern, responsive task management app with localStorage persistence
 * Using modular architecture and ES6+ features
 */

const TaskApp = (() => {
    // ========================================
    // PRIVATE STATE & CONSTANTS
    // ========================================
    const STORAGE_KEY = 'tasks_app_data';
    
    let state = {
        tasks: [],
    };

    const elements = {
        form: null,
        input: null,
        taskList: null,
        taskCount: null,
        totalTasks: null,
        completedTasks: null,
        pendingTasks: null,
    };

    // ========================================
    // PRIVATE METHODS - STORAGE MANAGEMENT
    // ========================================
    const loadFromStorage = () => {
        try {
            const stored = localStorage.getItem(STORAGE_KEY);
            if (stored) {
                state.tasks = JSON.parse(stored);
            }
        } catch (error) {
            console.error('Error loading tasks from storage:', error);
            state.tasks = [];
        }
    };

    const saveToStorage = () => {
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(state.tasks));
        } catch (error) {
            console.error('Error saving tasks to storage:', error);
        }
    };

    // ========================================
    // PRIVATE METHODS - TASK MANAGEMENT
    // ========================================
    const addTask = (taskText) => {
        if (!taskText || !taskText.trim()) {
            return false;
        }

        const newTask = {
            id: Date.now(),
            text: taskText.trim(),
            completed: false,
            createdAt: new Date().toLocaleString('en-US', {
                month: 'short',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
            }),
        };

        state.tasks.unshift(newTask);
        saveToStorage();
        return true;
    };

    const deleteTask = (taskId) => {
        state.tasks = state.tasks.filter(task => task.id !== taskId);
        saveToStorage();
    };

    const toggleTask = (taskId) => {
        const task = state.tasks.find(t => t.id === taskId);
        if (task) {
            task.completed = !task.completed;
            saveToStorage();
        }
    };

    // ========================================
    // PRIVATE METHODS - STATISTICS
    // ========================================
    const updateStats = () => {
        const total = state.tasks.length;
        const completed = state.tasks.filter(t => t.completed).length;
        const pending = total - completed;

        elements.taskCount.textContent = `${total} ${total === 1 ? 'task' : 'tasks'}`;
        elements.totalTasks.textContent = total;
        elements.completedTasks.textContent = completed;
        elements.pendingTasks.textContent = pending;
    };

    // ========================================
    // PRIVATE METHODS - RENDERING
    // ========================================
    const renderTasks = () => {
        if (state.tasks.length === 0) {
            elements.taskList.innerHTML = `
                <div class="empty-state">
                    <div class="empty-icon">📝</div>
                    <p>No tasks yet. Add one to get started!</p>
                </div>
            `;
            updateStats();
            return;
        }

        elements.taskList.innerHTML = state.tasks
            .map(task => createTaskElement(task))
            .join('');

        attachTaskEventListeners();
        updateStats();
    };

    const createTaskElement = (task) => {
        return `
            <div class="task-item ${task.completed ? 'completed' : ''}" data-task-id="${task.id}">
                <input 
                    type="checkbox" 
                    class="task-checkbox" 
                    ${task.completed ? 'checked' : ''}
                    aria-label="Toggle task: ${task.text}"
                >
                <div class="task-content">
                    <span class="task-text">${escapeHtml(task.text)}</span>
                    <span class="task-time">${task.createdAt}</span>
                </div>
                <div class="task-actions">
                    <button 
                        class="btn-delete" 
                        type="button"
                        title="Delete task"
                        aria-label="Delete: ${task.text}"
                    >
                        🗑️ Delete
                    </button>
                </div>
            </div>
        `;
    };

    const escapeHtml = (text) => {
        const map = {
            '&': '&amp;',
            '<': '&lt;',
            '>': '&gt;',
            '"': '&quot;',
            "'": '&#039;',
        };
        return text.replace(/[&<>"']/g, char => map[char]);
    };

    // ========================================
    // PRIVATE METHODS - EVENT HANDLERS
    // ========================================
    const handleFormSubmit = (event) => {
        event.preventDefault();
        const taskText = elements.input.value;

        if (addTask(taskText)) {
            elements.input.value = '';
            elements.input.focus();
            renderTasks();
        }
    };

    const attachTaskEventListeners = () => {
        document.querySelectorAll('.task-checkbox').forEach(checkbox => {
            checkbox.addEventListener('change', (event) => {
                const taskId = parseInt(event.target.closest('.task-item').dataset.taskId, 10);
                toggleTask(taskId);
                renderTasks();
            });
        });

        document.querySelectorAll('.btn-delete').forEach(btn => {
            btn.addEventListener('click', (event) => {
                const taskId = parseInt(event.target.closest('.task-item').dataset.taskId, 10);
                deleteTask(taskId);
                renderTasks();
            });
        });
    };

    // ========================================
    // PRIVATE METHODS - INITIALIZATION
    // ========================================
    const cacheElements = () => {
        elements.form = document.getElementById('taskForm');
        elements.input = document.getElementById('taskInput');
        elements.taskList = document.getElementById('taskList');
        elements.taskCount = document.getElementById('taskCount');
        elements.totalTasks = document.getElementById('totalTasks');
        elements.completedTasks = document.getElementById('completedTasks');
        elements.pendingTasks = document.getElementById('pendingTasks');
    };

    const attachEventListeners = () => {
        elements.form.addEventListener('submit', handleFormSubmit);

        // Allow adding tasks on Enter key
        elements.input.addEventListener('keypress', (event) => {
            if (event.key === 'Enter') {
                handleFormSubmit(event);
            }
        });
    };

    const init = () => {
        // Cache DOM elements
        cacheElements();

        // Validate elements
        if (!Object.values(elements).every(el => el !== null)) {
            console.error('Required DOM elements not found');
            return;
        }

        // Load tasks from storage
        loadFromStorage();

        // Attach event listeners
        attachEventListeners();

        // Initial render
        renderTasks();

        // Performance optimization: Debounce input for auto-save
        let autoSaveTimeout;
        elements.input.addEventListener('input', () => {
            clearTimeout(autoSaveTimeout);
        });
    };

    // ========================================
    // PUBLIC API
    // ========================================
    return {
        init: init,
        
        // Exposed for debugging/testing
        getTasks: () => [...state.tasks],
        getStats: () => ({
            total: state.tasks.length,
            completed: state.tasks.filter(t => t.completed).length,
            pending: state.tasks.length - state.tasks.filter(t => t.completed).length,
        }),
        clearAllTasks: () => {
            if (confirm('Are you sure you want to clear all tasks?')) {
                state.tasks = [];
                saveToStorage();
                renderTasks();
            }
        },
    };
})();

// ========================================
// APPLICATION INITIALIZATION
// ========================================
document.addEventListener('DOMContentLoaded', () => {
    TaskApp.init();
});

// Enable keyboard shortcuts (optional enhancement)
document.addEventListener('keydown', (event) => {
    // Ctrl/Cmd + L to focus input
    if ((event.ctrlKey || event.metaKey) && event.key === 'l') {
        event.preventDefault();
        document.getElementById('taskInput').focus();
    }
});
