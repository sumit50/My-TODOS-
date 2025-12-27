import React, { useState } from 'react';
import { 
  Plus, 
  Trash2, 
  Edit2, 
  Check, 
  X, 
  Filter,
  Calendar,
  Clock,
  CheckCircle,
  Database,
  Wifi,
  RefreshCw
} from 'lucide-react';
import toast, { Toaster } from 'react-hot-toast';

const TodoPage = () => {
  // Local State Management
  const [todos, setTodos] = useState([
    { _id: '1', title: 'Example Task 1', completed: false, createdAt: new Date().toISOString() },
    { _id: '2', title: 'Completed Task', completed: true, createdAt: new Date().toISOString() },
    { _id: '3', title: 'Buy groceries', completed: false, createdAt: new Date().toISOString() },
    { _id: '4', title: 'Finish project', completed: true, createdAt: new Date().toISOString() }
  ]);
  const [newTodo, setNewTodo] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [editText, setEditText] = useState('');
  const [filter, setFilter] = useState('all');

  // --- UI Handlers (No API) ---

  const handleAddTodo = (e) => {
    e.preventDefault();
    if (!newTodo.trim()) {
      toast.error('Please enter a task');
      return;
    }
    const newEntry = {
      _id: Math.random().toString(36).substr(2, 9),
      title: newTodo.trim(),
      completed: false,
      createdAt: new Date().toISOString()
    };
    setTodos([...todos, newEntry]);
    setNewTodo('');
    toast.success('Task added!');
  };

  const toggleTodo = (id) => {
    setTodos(todos.map(t => t._id === id ? { ...t, completed: !t.completed } : t));
    toast.success('Status updated');
  };

  const deleteTodo = (id) => {
    setTodos(todos.filter(t => t._id !== id));
    toast.success('Task deleted');
  };

  const startEdit = (id, text) => {
    setEditingId(id);
    setEditText(text);
  };

  const saveEdit = (id) => {
    if (!editText.trim()) return;
    setTodos(todos.map(t => t._id === id ? { ...t, title: editText } : t));
    setEditingId(null);
    toast.success('Task updated');
  };

  const clearCompleted = () => {
    setTodos(todos.filter(t => !t.completed));
    toast.success('Cleared completed tasks');
  };

  const completeAll = () => {
    setTodos(todos.map(t => ({ ...t, completed: true })));
    toast.success('All tasks completed!');
  };

  // --- Logic Helpers ---

  const filteredTodos = todos.filter(todo => {
    if (filter === 'active') return !todo.completed;
    if (filter === 'completed') return todo.completed;
    return true;
  });

  const stats = {
    total: todos.length,
    completed: todos.filter(t => t.completed).length,
    active: todos.filter(t => !t.completed).length
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center p-4 md:p-8">
      <Toaster position="top-right" />
      
      <div className="w-full max-w-3xl">
        {/* Header */}
        <div className="mb-8 text-center">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-800 mb-2">📝 Todo Dashboard</h1>
          <p className="text-gray-600">UI Preview Mode (No API Connectivity)</p>
          
          <div className="mt-4 flex flex-wrap justify-center items-center gap-3">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-green-50 text-green-700">
              <Wifi className="w-4 h-4" />
              <span className="text-sm font-medium">Local Session</span>
            </div>
            <div className="inline-flex items-center gap-1 px-3 py-1 bg-purple-50 text-purple-700 rounded-full">
              <Database className="w-4 h-4" />
              <span className="text-sm font-mono text-xs">local-storage-preview</span>
            </div>
          </div>
        </div>

        {/* Stats Cards - Centered Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          {[
            { label: 'Total', value: stats.total, color: 'blue', icon: Filter },
            { label: 'Completed', value: stats.completed, color: 'green', icon: CheckCircle },
            { label: 'Pending', value: stats.active, color: 'orange', icon: Clock },
            { label: 'Progress', value: `${stats.total > 0 ? Math.round((stats.completed / stats.total) * 100) : 0}%`, color: 'purple', icon: Check }
          ].map((stat, i) => (
            <div key={i} className="bg-white rounded-xl shadow-sm p-6 border border-gray-200 text-center">
              <div className="flex flex-col items-center gap-4">
                <div className={`p-3 bg-${stat.color}-50 rounded-lg`}>
                  {stat.icon === Filter && <Filter className={`w-6 h-6 text-${stat.color}-500`} />}
                  {stat.icon === CheckCircle && <CheckCircle className={`w-6 h-6 text-${stat.color}-500`} />}
                  {stat.icon === Clock && <Clock className={`w-6 h-6 text-${stat.color}-500`} />}
                  {stat.icon === Check && <Check className={`w-6 h-6 text-${stat.color}-500`} />}
                </div>
                <div>
                  <p className={`text-2xl font-bold text-${stat.color}-600 mb-1`}>{stat.value}</p>
                  <p className="text-sm text-gray-500">{stat.label}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Main Card - Centered Content */}
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden border border-gray-200">
          {/* Form Section */}
          <div className="p-6 border-b border-gray-200">
            <form onSubmit={handleAddTodo} className="flex gap-3">
              <input
                type="text"
                value={newTodo}
                onChange={(e) => setNewTodo(e.target.value)}
                placeholder="What needs to be done?"
                className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-center"
              />
              <button 
                type="submit" 
                className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors flex items-center gap-2"
              >
                <Plus className="w-5 h-5" /> Add
              </button>
            </form>
          </div>

          {/* Filter Section - Centered */}
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex flex-col md:flex-row items-center justify-between gap-4">
              {/* Filter Buttons - Centered */}
              <div className="flex justify-center gap-2">
                {['all', 'active', 'completed'].map((t) => (
                  <button
                    key={t}
                    onClick={() => setFilter(t)}
                    className={`px-4 py-2 rounded-lg capitalize transition-colors ${
                      filter === t 
                        ? 'bg-blue-100 text-blue-700' 
                        : 'text-gray-600 hover:bg-gray-100'
                    }`}
                  >
                    {t}
                  </button>
                ))}
              </div>
              
              {/* Action Buttons - Centered */}
              <div className="flex justify-center gap-2">
                <button 
                  onClick={completeAll}
                  className="px-4 py-2 text-green-600 hover:text-green-700 hover:bg-green-50 rounded-lg transition-colors flex items-center gap-2"
                >
                  <CheckCircle className="w-4 h-4" /> Complete All
                </button>
                <button 
                  onClick={() => toast('Refreshed (UI Only)')} 
                  className="px-4 py-2 text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-colors flex items-center gap-2"
                >
                  <RefreshCw className="w-4 h-4" /> Refresh
                </button>
                <button 
                  onClick={clearCompleted} 
                  className="px-4 py-2 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors"
                >
                  Clear Completed
                </button>
              </div>
            </div>
          </div>

          {/* Todo List */}
          <div className="p-6">
            {filteredTodos.length === 0 ? (
              <div className="text-center py-12">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Check className="w-8 h-8 text-gray-400" />
                </div>
                <p className="text-gray-500 text-lg">
                  {filter === 'completed' 
                    ? 'No completed tasks yet'
                    : filter === 'active'
                    ? 'No pending tasks'
                    : 'No tasks yet. Add your first task!'
                  }
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {filteredTodos.map((todo) => (
                  <div 
                    key={todo._id} 
                    className={`group flex flex-col sm:flex-row items-center justify-between p-4 rounded-lg border transition-all ${
                      todo.completed 
                        ? 'bg-green-50 border-green-200' 
                        : 'bg-white border-gray-200 hover:border-blue-300'
                    }`}
                  >
                    {/* Left Section - Checkbox and Content */}
                    <div className="flex items-center gap-4 mb-3 sm:mb-0 w-full sm:w-auto">
                      <button
                        onClick={() => toggleTodo(todo._id)}
                        className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors flex-shrink-0 ${
                          todo.completed 
                            ? 'bg-green-500 border-green-500' 
                            : 'border-gray-300 hover:border-blue-500'
                        }`}
                      >
                        {todo.completed && (
                          <Check className="w-4 h-4 text-white" />
                        )}
                      </button>

                      <div className="flex-1 text-center sm:text-left">
                        {editingId === todo._id ? (
                          <div className="flex items-center justify-center sm:justify-start gap-2">
                            <input
                              autoFocus
                              value={editText}
                              onChange={(e) => setEditText(e.target.value)}
                              onKeyDown={(e) => e.key === 'Enter' && saveEdit(todo._id)}
                              className="px-3 py-2 border border-blue-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500"
                            />
                            <button 
                              onClick={() => saveEdit(todo._id)}
                              className="p-2 text-green-600 hover:text-green-700 hover:bg-green-50 rounded-lg transition-colors"
                            >
                              <Check className="w-5 h-5" />
                            </button>
                            <button 
                              onClick={() => setEditingId(null)}
                              className="p-2 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors"
                            >
                              <X className="w-5 h-5" />
                            </button>
                          </div>
                        ) : (
                          <>
                            <p className={`text-lg ${
                              todo.completed 
                                ? 'line-through text-gray-500' 
                                : 'text-gray-800'
                            }`}>
                              {todo.title}
                            </p>
                            <div className="flex items-center justify-center sm:justify-start gap-1 text-sm text-gray-500 mt-1">
                              <Calendar className="w-4 h-4" />
                              {formatDate(todo.createdAt)}
                            </div>
                          </>
                        )}
                      </div>
                    </div>

                    {/* Right Section - Action Buttons */}
                    <div className="flex justify-center sm:justify-end gap-2 w-full sm:w-auto">
                      {editingId !== todo._id && (
                        <>
                          <button 
                            onClick={() => startEdit(todo._id, todo.title)}
                            className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                            title="Edit"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button 
                            onClick={() => deleteTodo(todo._id)}
                            className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            title="Delete"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
            
            {/* Summary Stats */}
            {todos.length > 0 && (
              <div className="mt-6 pt-6 border-t border-gray-200">
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                  <div className="text-center sm:text-left">
                    <p className="text-sm text-gray-600">
                      Showing {filteredTodos.length} of {todos.length} tasks
                      {filter !== 'all' && ` (filtered by ${filter})`}
                    </p>
                    <p className="text-sm text-green-600 mt-1">
                      {stats.completed} completed ({Math.round((stats.completed / stats.total) * 100)}%)
                    </p>
                  </div>
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(JSON.stringify(todos, null, 2));
                      toast.success('Todos copied to clipboard!');
                    }}
                    className="px-4 py-2 text-gray-600 hover:text-gray-700 hover:bg-gray-50 rounded-lg transition-colors border border-gray-300"
                  >
                    Export Data
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="mt-8 text-center text-gray-500 text-sm">
          <p>Todo Dashboard • UI Preview Mode • Made with React & Tailwind CSS</p>
          <p className="mt-1 text-xs">All data is stored locally in your browser</p>
        </div>
      </div>
    </div>
  );
};

export default TodoPage;