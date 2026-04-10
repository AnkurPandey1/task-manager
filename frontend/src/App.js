import React, { useState, useEffect } from 'react';
import { getTasks, createTask, toggleTask, deleteTask } from './api';
import './index.css'; // Importing our modern styles

// SVG Icons for modern look
const CheckIcon = () => (
  <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
  </svg>
);

const TrashIcon = () => (
  <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
  </svg>
);

function App() {
  const [tasks, setTasks] = useState([]);
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isAdding, setIsAdding] = useState(false);

  useEffect(() => {
    fetchTasks();
  }, []);

  const fetchTasks = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getTasks();
      setTasks(data);
    } catch (err) {
      setError(err.message || 'Failed to load tasks.');
    } finally {
      setLoading(false);
    }
  };

  const handleAddTask = async (e) => {
    e.preventDefault();
    if (!newTaskTitle.trim()) return;

    try {
      setIsAdding(true);
      setError(null);
      const newTask = await createTask(newTaskTitle);
      setTasks([...tasks, newTask]);
      setNewTaskTitle('');
    } catch (err) {
      setError(err.message || 'Failed to add task.');
    } finally {
      setIsAdding(false);
    }
  };

  const handleToggleTask = async (id) => {
    // Optimistic update
    setTasks(tasks.map(t => t.id === id ? { ...t, completed: !t.completed } : t));
    try {
      await toggleTask(id);
    } catch (err) {
      setError('Failed to update status.');
      setTasks(tasks.map(t => t.id === id ? { ...t, completed: !t.completed } : t));
    }
  };

  const handleDeleteTask = async (id) => {
    // Mark for deletion to trigger out-animation
    setTasks(tasks.map(t => t.id === id ? { ...t, isDeleting: true } : t));
    
    setTimeout(async () => {
      setTasks(currentTasks => currentTasks.filter(t => t.id !== id));
      try {
        await deleteTask(id);
      } catch (err) {
        setError('Failed to delete task.');
        fetchTasks();
      }
    }, 300); // Matches the CCS animation duration (0.3s)
  };

  return (
    <div className="app-container">
      <div className="glass-panel">
        <header className="header">
          <div className="logo-icon">✓</div>
          <h1>TaskFlow</h1>
          <p className="subtitle">Manage your daily goals elegantly</p>
        </header>
        
        {error && (
          <div className="error-alert">
            <span>⚠</span> {error}
          </div>
        )}

        <form onSubmit={handleAddTask}>
          <div className="input-group">
            <input
              type="text"
              value={newTaskTitle}
              onChange={(e) => setNewTaskTitle(e.target.value)}
              placeholder="What needs to be done?"
              disabled={isAdding}
              className="task-input"
            />
            <button 
              type="submit" 
              disabled={isAdding || !newTaskTitle.trim()}
              className="add-btn"
            >
              {isAdding ? 'ADDING...' : '+ ADD TASK'}
            </button>
          </div>
        </form>

        {loading ? (
          <div className="loading-state">
            <div className="spinner"></div>
            <p>Syncing tasks...</p>
          </div>
        ) : (
          <div className="task-container">
            {tasks.length === 0 ? (
              <div className="empty-state">
                <div className="empty-icon">☕</div>
                <p>All clear! Time to relax or add a new task.</p>
              </div>
            ) : (
              <ul className="task-list">
                {tasks.map(task => (
                  <li 
                    key={task.id} 
                    className={`task-item ${task.completed ? 'completed' : ''} ${task.isDeleting ? 'deleting' : ''}`}
                  >
                    <div className="task-content" onClick={() => handleToggleTask(task.id)}>
                      <div className={`checkbox ${task.completed ? 'checked' : ''}`}>
                        {task.completed && <CheckIcon />}
                      </div>
                      <span className="task-title">
                        {task.title}
                      </span>
                    </div>
                    <button 
                      onClick={() => !task.isDeleting && handleDeleteTask(task.id)}
                      className="delete-btn"
                      aria-label="Delete task"
                      title="Delete Task"
                    >
                      <TrashIcon />
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}
      </div>
      
      {/* Decorative animated background elements */}
      <div className="bg-shapes">
        <div className="shape shape-1"></div>
        <div className="shape shape-2"></div>
      </div>
    </div>
  );
}

export default App;
