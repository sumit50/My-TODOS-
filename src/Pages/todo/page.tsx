// #region IMPORTS
import React, {useState, useEffect} from "react";
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
  RefreshCw,
  AlertTriangle,
  Search,
} from "lucide-react";
import toast, {Toaster} from "react-hot-toast";
import Navbar from "../../Components/Navbar/Navbar";
import axios from "axios";
import {Footer} from "../Dashboard/Footer/Footer";
// #endregion

// #region MAIN COMPONENT
const TodoPage = () => {
  // #region STATE VARIABLES
  // Todo States
  const [todos, setTodos] = useState([]);
  const [newTodo, setNewTodo] = useState("");
  const [newTodoPriority, setNewTodoPriority] = useState("Medium");
  const [newTodoDueDate, setNewTodoDueDate] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [editText, setEditText] = useState("");
  const [editPriority, setEditPriority] = useState("Medium");
  const [editDueDate, setEditDueDate] = useState("");
  const [filter, setFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  // Modal States
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showCompleteModal, setShowCompleteModal] = useState(false);
  const [todoToDelete, setTodoToDelete] = useState(null);
  const [todoToComplete, setTodoToComplete] = useState(null);

  // Regex for validation
  const onlyAlphabetsRegex = /^[A-Za-z\s]+$/;
  // #endregion

  // #region USEEFFECT HOOKS
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
    } else {
      console.error("No token found!");
      toast.error("Authentication error. Please login again.");
    }
  }, []);

  useEffect(() => {
    fetchUserTodos();
  }, []);
  // #endregion

  // #region HELPER FUNCTIONS
  const checkToken = () => {
    const token = localStorage.getItem("token");
    if (!token) {
      toast.error("Authentication required. Please login.");
      return false;
    }
    return true;
  };

  const formatDate = (dateString) => {
    try {
      return new Date(dateString).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      });
    } catch (error) {
      return "Invalid date";
    }
  };

  const getTodoTitle = (id) => {
    const todo = todos.find((t) => t._id === id);
    return todo ? todo.title : "";
  };

  const filteredTodos = todos
    .filter((todo) => {
      if (filter === "active") return !todo.completed;
      if (filter === "completed") return todo.completed;
      return true;
    })
    .filter((todo) =>
      todo.title.toLowerCase().includes(searchQuery.toLowerCase())
    );

  const stats = {
    total: todos.length,
    completed: todos.filter((t) => t.completed).length,
    active: todos.filter((t) => !t.completed).length,
    progress:
      todos.length > 0
        ? Math.round(
            (todos.filter((t) => t.completed).length / todos.length) * 100
          )
        : 0,
  };
  // #endregion

  // #region TODO CRUD OPERATIONS
  const fetchUserTodos = async () => {
    if (!checkToken()) return;

    setLoading(true);
    try {
      const response = await axios.get(
        `${import.meta.env.VITE_API_URL}/todo/get-todo`
      );

      if (response.data) {
        const mappedTodos = response.data.map((todo) => ({
          _id: todo._id,
          title: todo.text,
          completed: todo.status === "completed",
          priority: todo.priority || "Medium",
          dueDate: todo.dueDate || "",
          createdAt: todo.createdAt,
        }));
        setTodos(mappedTodos);
      }
    } catch (error) {
      console.error("Fetch todos error:", error);
      toast.error(error.response?.data?.message || "Failed to fetch todos");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    fetchUserTodos();
    toast.success("Refreshed todo list");
  };

  const validateTodoText = (text) => {
    const trimmedText = text.trim();

    if (!trimmedText) {
      toast.error("Todo text is required");
      return false;
    }

    if (trimmedText.length < 2) {
      toast.error("Todo must be at least 2 characters");
      return false;
    }

    if (trimmedText.length > 50) {
      toast.error("Todo cannot exceed 50 characters");
      return false;
    }

    if (!onlyAlphabetsRegex.test(trimmedText)) {
      toast.error("Todo must contain only alphabets and spaces");
      return false;
    }

    return true;
  };

  const handleAddTodo = async (e) => {
    if (e) e.preventDefault();

    const todoText = newTodo;

    if (!validateTodoText(todoText) || !checkToken()) return;

    const tempId = `temp_${Date.now()}`;
    const optimisticTodo = {
      _id: tempId,
      title: todoText.trim(),
      completed: false,
      priority: newTodoPriority,
      dueDate: newTodoDueDate,
      createdAt: new Date().toISOString(),
    };

    setTodos([optimisticTodo, ...todos]);
    setNewTodo("");
    setNewTodoPriority("Medium");
    setNewTodoDueDate("");
    setShowAddModal(false);

    try {
      const response = await axios.post(
        `${import.meta.env.VITE_API_URL}/todo/add-todo`,
        {
          text: todoText.trim(),
          priority: newTodoPriority,
          dueDate: newTodoDueDate,
        }
      );

      if (response.data) {
        const backendTodo = {
          _id: response.data._id,
          title: response.data.text,
          completed: response.data.status === "completed",
          priority: response.data.priority || "Medium",
          dueDate: response.data.dueDate || "",
          createdAt: response.data.createdAt,
        };

        setTodos((prev) =>
          prev.map((todo) => (todo._id === tempId ? backendTodo : todo))
        );
        toast.success("Task added!");
      }
    } catch (error) {
      setTodos((prev) => prev.filter((todo) => todo._id !== tempId));
      toast.error(error.response?.data?.message || "Failed to add task");
    }
  };

  const confirmCompleteTodo = (id) => {
    const todo = todos.find((t) => t._id === id);
    if (todo && !todo.completed) {
      setTodoToComplete(id);
      setShowCompleteModal(true);
    } else if (todo && todo.completed) {
      toggleTodoCompletion(id, false);
    }
  };

  const toggleTodoCompletion = async (id, completed = true) => {
    if (!checkToken()) return;
    const oldTodos = [...todos];

    setTodos(todos.map((t) => (t._id === id ? {...t, completed} : t)));

    try {
      await axios.put(`${import.meta.env.VITE_API_URL}/todo/edit-todo/${id}`, {
        completed: completed ? "completed" : "pending",
      });
      toast.success(completed ? "Task completed!" : "Task marked as pending!");
    } catch (error) {
      setTodos(oldTodos);
      toast.error(error.response?.data?.message || "Failed to update task");
    }
  };

  const completeTodo = async () => {
    if (!todoToComplete) return;
    await toggleTodoCompletion(todoToComplete, true);
    setShowCompleteModal(false);
    setTodoToComplete(null);
  };

  const confirmDeleteTodo = (id) => {
    setTodoToDelete(id);
    setShowDeleteModal(true);
  };

  const deleteTodo = async () => {
    if (!todoToDelete || !checkToken()) return;
    const oldTodos = [...todos];
    setTodos(todos.filter((t) => t._id !== todoToDelete));
    setShowDeleteModal(false);

    try {
      await axios.delete(
        `${import.meta.env.VITE_API_URL}/todo/delete-todo/${todoToDelete}`
      );
      toast.success("Task deleted!");
    } catch (error) {
      setTodos(oldTodos);
      toast.error(error.response?.data?.message || "Failed to delete task");
    } finally {
      setTodoToDelete(null);
    }
  };

  const startEdit = (id, text, priority, dueDate) => {
    setEditingId(id);
    setEditText(text);
    setEditPriority(priority);
    setEditDueDate(dueDate);
    setShowEditModal(true);
  };

  const saveEdit = async () => {
    if (!validateTodoText(editText) || !editingId || !checkToken()) return;

    const oldTodos = [...todos];
    setTodos(
      todos.map((t) =>
        t._id === editingId
          ? {
              ...t,
              title: editText.trim(),
              priority: editPriority,
              dueDate: editDueDate,
            }
          : t
      )
    );
    setShowEditModal(false);

    try {
      await axios.put(
        `${import.meta.env.VITE_API_URL}/todo/edit-todo/${editingId}`,
        {
          text: editText.trim(),
          priority: editPriority,
          dueDate: editDueDate,
        }
      );
      toast.success("Task updated!");
    } catch (error) {
      setTodos(oldTodos);
      toast.error(error.response?.data?.message || "Failed to update task");
    } finally {
      setEditingId(null);
    }
  };

  const clearCompleted = async () => {
    const completedTodos = todos.filter((t) => t.completed);
    if (completedTodos.length === 0) {
      toast.error("No completed tasks to clear");
      return;
    }

    if (!checkToken()) return;

    const oldTodos = [...todos];
    setTodos(todos.filter((t) => !t.completed));

    try {
      await axios.delete(
        `${import.meta.env.VITE_API_URL}/todo/delete-all-todo`
      );
      toast.success(
        `Cleared ${completedTodos.length} completed task${
          completedTodos.length > 1 ? "s" : ""
        }!`
      );
    } catch (error) {
      setTodos(oldTodos);
      toast.error(
        error.response?.data?.message || "Failed to clear completed tasks"
      );
    }
  };

  const completeAll = async () => {
    const activeTodos = todos.filter((t) => !t.completed);
    if (activeTodos.length === 0) {
      toast.error("No pending tasks to complete");
      return;
    }

    if (!checkToken()) return;

    const oldTodos = [...todos];
    setTodos(todos.map((t) => ({...t, completed: true})));

    try {
      const updatePromises = activeTodos.map((todo) =>
        axios.put(
          `${import.meta.env.VITE_API_URL}/todo/edit-todo/${todo._id}`,
          {
            completed: "completed",
          }
        )
      );
      await Promise.all(updatePromises);
      toast.success(
        `Completed ${activeTodos.length} task${
          activeTodos.length > 1 ? "s" : ""
        }!`
      );
    } catch (error) {
      setTodos(oldTodos);
      toast.error(
        error.response?.data?.message || "Failed to complete all tasks"
      );
    }
  };
  // #endregion

  // #region RENDER LOGIC
  if (loading && todos.length === 0) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-600">Loading your todos...</p>
          </div>
        </div>
      </>
    );
  }
  // #endregion

  // #region JSX RENDER
  return (
    <>
      <Navbar />
      <div className="w-full h-10 bg-gray-50"></div>

      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center p-4 md:p-8">
        <Toaster position="top-right" />

        {/* Add Task Modal */}
        {showAddModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
              <div className="p-6 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <h3 className="text-xl font-bold text-gray-800">
                    Add New Task
                  </h3>
                  <button
                    onClick={() => setShowAddModal(false)}
                    className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                    <X className="w-5 h-5" />
                  </button>
                </div>
                <p className="text-gray-600 mt-2">
                  What do you need to accomplish?
                </p>
              </div>
              <form onSubmit={handleAddTodo} className="p-6">
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Task Description
                  </label>
                  <textarea
                    value={newTodo}
                    onChange={(e) => setNewTodo(e.target.value)}
                    placeholder="Enter your task details (letters and spaces only)..."
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent min-h-[100px] resize-none"
                    autoFocus
                  />
                  <p className="text-sm text-gray-500 mt-2">
                    Only letters and spaces allowed (2-50 characters)
                  </p>
                </div>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Priority
                  </label>
                  <select
                    value={newTodoPriority}
                    onChange={(e) => setNewTodoPriority(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
                    <option value="Low">Low</option>
                    <option value="Medium">Medium</option>
                    <option value="High">High</option>
                  </select>
                </div>
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Due Date
                  </label>
                  <input
                    type="date"
                    value={newTodoDueDate}
                    onChange={(e) => setNewTodoDueDate(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => setShowAddModal(false)}
                    className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors">
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                    Add Task
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Edit Task Modal */}
        {showEditModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
              <div className="p-6 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <h3 className="text-xl font-bold text-gray-800">Edit Task</h3>
                  <button
                    onClick={() => setShowEditModal(false)}
                    className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                    <X className="w-5 h-5" />
                  </button>
                </div>
                <p className="text-gray-600 mt-2">Update your task details</p>
              </div>
              <div className="p-6">
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Task Description
                  </label>
                  <textarea
                    value={editText}
                    onChange={(e) => setEditText(e.target.value)}
                    placeholder="Enter updated task details..."
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-[100px] resize-none"
                    autoFocus
                  />
                  <p className="text-sm text-gray-500 mt-2">
                    Only letters and spaces allowed (2-50 characters)
                  </p>
                </div>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Priority
                  </label>
                  <select
                    value={editPriority}
                    onChange={(e) => setEditPriority(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
                    <option value="Low">Low</option>
                    <option value="Medium">Medium</option>
                    <option value="High">High</option>
                  </select>
                </div>
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Due Date
                  </label>
                  <input
                    type="date"
                    value={editDueDate}
                    onChange={(e) => setEditDueDate(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div className="flex gap-3">
                  <button
                    onClick={() => setShowEditModal(false)}
                    className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50">
                    Cancel
                  </button>
                  <button
                    onClick={saveEdit}
                    className="flex-1 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                    Save Changes
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Delete Confirmation Modal */}
        {showDeleteModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
              <div className="p-6 border-b border-gray-200">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-red-50 rounded-lg">
                    <AlertTriangle className="w-6 h-6 text-red-600" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-800">
                      Delete Task
                    </h3>
                    <p className="text-gray-600">
                      This action cannot be undone
                    </p>
                  </div>
                </div>
              </div>
              <div className="p-6">
                <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                  <p className="text-sm text-gray-600 mb-1">Task to delete:</p>
                  <p className="font-medium text-gray-800">
                    {getTodoTitle(todoToDelete)}
                  </p>
                </div>
                <div className="flex gap-3">
                  <button
                    onClick={() => setShowDeleteModal(false)}
                    className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-lg">
                    Cancel
                  </button>
                  <button
                    onClick={deleteTodo}
                    className="flex-1 px-4 py-3 bg-red-600 text-white rounded-lg">
                    Delete Task
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Complete Task Modal */}
        {showCompleteModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
              <div className="p-6 border-b border-gray-200">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-green-50 rounded-lg">
                    <CheckCircle className="w-6 h-6 text-green-600" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-800">
                      Complete Task
                    </h3>
                    <p className="text-gray-600">Mark this task as completed</p>
                  </div>
                </div>
              </div>
              <div className="p-6">
                <div className="mb-6 p-4 bg-green-50 rounded-lg">
                  <p className="text-sm text-green-800 mb-1">
                    Task to complete:
                  </p>
                  <p className="font-medium text-gray-800">
                    {getTodoTitle(todoToComplete)}
                  </p>
                </div>
                <div className="flex gap-3">
                  <button
                    onClick={() => {
                      setShowCompleteModal(false);
                      setTodoToComplete(null);
                    }}
                    className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors">
                    Cancel
                  </button>
                  <button
                    onClick={completeTodo}
                    className="flex-1 px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center gap-2">
                    <CheckCircle className="w-5 h-5" />
                    Mark as Completed
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="w-full max-w-3xl">
          {/* Header */}
          <div className="mb-8 text-center">
            <h1 className="text-3xl md:text-4xl font-bold text-gray-800 mb-2">
              📝 Your Personal Todo List
            </h1>
            <div className="mt-4 flex flex-col sm:flex-row items-center justify-center gap-3">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 text-blue-700">
                <Database className="w-4 h-4" />
                <span className="text-sm font-medium">
                  {todos.length} tasks
                </span>
              </div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-green-50 text-green-700">
                <Wifi className="w-4 h-4" />
                <span className="text-sm font-medium">
                  {stats.completed} completed • {stats.active} pending
                </span>
              </div>
            </div>
          </div>
          <div className="w-full h-2 bg-gray-50"></div>

          {/* Search Bar */}
          <div className="mb-6">
            <div className="relative">
              <input
                type="text"
                placeholder="Search tasks..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full px-4 py-3 pl-12 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <div className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none">
                <Search className="w-5 h-5 text-gray-400" />
              </div>
            </div>
          </div>
          <div className="w-full h-3"></div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
            {[
              {
                label: "Total Tasks",
                value: stats.total,
                bgColor: "bg-blue-50",
                textColor: "text-blue-500",
                valueColor: "text-blue-600",
                icon: Filter,
              },
              {
                label: "Completed",
                value: stats.completed,
                bgColor: "bg-green-50",
                textColor: "text-green-500",
                valueColor: "text-green-600",
                icon: CheckCircle,
              },
              {
                label: "Pending",
                value: stats.active,
                bgColor: "bg-orange-50",
                textColor: "text-orange-500",
                valueColor: "text-orange-600",
                icon: Clock,
              },
              {
                label: "Progress",
                value: `${stats.progress}%`,
                bgColor: "bg-purple-50",
                textColor: "text-purple-500",
                valueColor: "text-purple-600",
                icon: Check,
              },
            ].map((stat, i) => (
              <div
                key={i}
                className="bg-white rounded-xl shadow-sm p-6 border border-gray-200 text-center">
                <div className="flex flex-col items-center gap-4">
                  <div className={`p-3 ${stat.bgColor} rounded-lg`}>
                    <stat.icon className={`w-6 h-6 ${stat.textColor}`} />
                  </div>
                  <div>
                    <p className={`text-2xl font-bold ${stat.valueColor} mb-1`}>
                      {stat.value}
                    </p>
                    <p className="text-sm text-gray-500">{stat.label}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Main Card */}
          <div className="w-full h-10"></div>

          <div className="bg-white rounded-2xl shadow-lg overflow-hidden border border-gray-200">
            <div className="w-full h-10 bg-gray-300"></div>
            <div className="p-6 border-b border-gray-200">
              <div className="flex gap-3">
                <input
                  type="text"
                  value={newTodo}
                  onChange={(e) => setNewTodo(e.target.value)}
                  placeholder="What needs to be done? (letters only)"
                  className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-center"
                  onKeyDown={(e) => e.key === "Enter" && setShowAddModal(true)}
                />
                <button
                  onClick={() => setShowAddModal(true)}
                  className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2">
                  <Plus className="w-5 h-5" /> Add
                </button>
              </div>
            </div>

            {/* Filter and Action Buttons */}
            {todos.length > 0 && (
              <div className="px-6 py-4 border-b border-gray-200">
                <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                  {/* Filter Buttons */}
                  <div className="flex justify-center gap-2">
                    {["all", "active", "completed"].map((t) => (
                      <button
                        key={t}
                        onClick={() => setFilter(t)}
                        className={`px-4 py-2 rounded-lg capitalize transition-colors ${
                          filter === t
                            ? "bg-blue-100 text-blue-700"
                            : "text-gray-600 hover:bg-gray-100"
                        }`}>
                        {t}
                      </button>
                    ))}
                  </div>

                  {/* Action Buttons */}
                  <div className="flex justify-center gap-2">
                    <button
                      onClick={completeAll}
                      disabled={stats.active === 0}
                      className={`px-4 py-2 rounded-lg transition-colors flex items-center gap-2 ${
                        stats.active === 0
                          ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                          : "text-green-600 hover:text-green-700 hover:bg-green-50"
                      }`}>
                      <CheckCircle className="w-4 h-4" /> Complete All
                    </button>
                    <button
                      onClick={handleRefresh}
                      className="px-4 py-2 text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-colors flex items-center gap-2">
                      <RefreshCw
                        className={`w-4 h-4 ${
                          refreshing ? "animate-spin" : ""
                        }`}
                      />
                      Refresh
                    </button>
                    <button
                      onClick={clearCompleted}
                      disabled={stats.completed === 0}
                      className={`px-4 py-2 rounded-lg transition-colors ${
                        stats.completed === 0
                          ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                          : "text-red-600 hover:text-red-700 hover:bg-red-50"
                      }`}>
                      Clear Completed
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Todo List */}
            <div className="p-6">
              {todos.length === 0 && !loading ? (
                <div className="text-center py-12">
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Check className="w-8 h-8 text-gray-400" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-800 mb-2">
                    Your Todo List is Empty
                  </h3>
                  <p className="text-gray-600 mb-6">
                    Start by adding your first task. Everything you add here is
                    private and only visible to you.
                  </p>
                  <button
                    onClick={() => setShowAddModal(true)}
                    className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                    Add Your First Task
                  </button>
                </div>
              ) : filteredTodos.length === 0 && todos.length > 0 ? (
                <div className="text-center py-12">
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Filter className="w-8 h-8 text-gray-400" />
                  </div>
                  <p className="text-gray-500 text-lg">
                    {filter === "completed"
                      ? "No completed tasks yet"
                      : filter === "active"
                      ? "No pending tasks - Great job!"
                      : "No tasks match your filter"}
                  </p>
                  {filter !== "all" && (
                    <button
                      onClick={() => setFilter("all")}
                      className="mt-4 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                      Show All Tasks
                    </button>
                  )}
                </div>
              ) : (
                <div className="space-y-3">
                  {filteredTodos.map((todo) => (
                    <div
                      key={todo._id}
                      className={`group flex flex-col sm:flex-row items-center justify-between p-4 rounded-lg border transition-all ${
                        todo.completed
                          ? "bg-green-50 border-green-200"
                          : "bg-white border-gray-200"
                      }`}>
                      <div className="flex items-center gap-4 mb-3 sm:mb-0 w-full sm:w-auto">
                        <button
                          onClick={() => confirmCompleteTodo(todo._id)}
                          className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                            todo.completed
                              ? "bg-green-500 border-green-500"
                              : "border-gray-300 hover:border-green-500"
                          }`}>
                          {todo.completed && (
                            <Check className="w-4 h-4 text-white" />
                          )}
                        </button>
                        <div className="flex-1">
                          <p
                            className={`text-lg ${
                              todo.completed
                                ? "line-through text-gray-500"
                                : "text-gray-800"
                            }`}>
                            {todo.title}
                          </p>
                          <div className="flex items-center gap-2 text-sm text-gray-500">
                            <div className="flex items-center gap-1">
                              <Calendar className="w-4 h-4" />
                              <span>{formatDate(todo.createdAt)}</span>
                            </div>
                            {todo.dueDate && (
                              <div className="flex items-center gap-1">
                                <Clock className="w-4 h-4" />
                                <span>{formatDate(todo.dueDate)}</span>
                              </div>
                            )}
                            <div
                              className={`px-2 py-0.5 rounded-full text-xs ${
                                todo.priority === "High"
                                  ? "bg-red-100 text-red-600"
                                  : todo.priority === "Medium"
                                  ? "bg-yellow-100 text-yellow-600"
                                  : "bg-green-100 text-green-600"
                              }`}>
                              {todo.priority}
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        {!todo.completed && (
                          <button
                            onClick={() =>
                              startEdit(
                                todo._id,
                                todo.title,
                                todo.priority,
                                todo.dueDate
                              )
                            }
                            className="p-2 text-gray-500 hover:text-blue-600">
                            <Edit2 className="w-4 h-4" />
                          </button>
                        )}
                        <button
                          onClick={() => {
                            setTodoToDelete(todo._id);
                            setShowDeleteModal(true);
                          }}
                          className="p-2 text-gray-500 hover:text-red-600">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
  // #endregion
};

export default TodoPage;
