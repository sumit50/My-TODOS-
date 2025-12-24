import {useEffect, useState, useMemo} from "react";
import Navbar from "../../Components/Navbar/Navbar";
import axios from "axios";
import toast from "react-hot-toast";

// Simple type definition for a todo item
type Todo = {
  _id: string;
  text: string;
  status: "pending" | "completed";
  user?: string; // Assuming your todo has a user field
};

export default function TodoPage() {
  // ========== STATE MANAGEMENT ==========
  const [text, setText] = useState(""); // Input field text
  const [todos, setTodos] = useState<Todo[]>([]); // List of all todos
  const [loading, setLoading] = useState(false); // Is data loading?
  const [filter, setFilter] = useState<"all" | "pending" | "completed">("all"); // Which todos to show
  const [isAdding, setIsAdding] = useState(false);
  const [operationLoading, setOperationLoading] = useState<{
    [key: string]: boolean;
  }>({});

  // Edit mode states
  const [editingId, setEditingId] = useState<string | null>(null); // Which todo is being edited?
  const [editText, setEditText] = useState(""); // Text in edit input

  // Modal states (popup windows)
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [todoToDelete, setTodoToDelete] = useState<string | null>(null);
  const [showCompleteModal, setShowCompleteModal] = useState(false);
  const [todoToComplete, setTodoToComplete] = useState<{
    id: string;
    text: string;
  } | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [todoToEdit, setTodoToEdit] = useState<Todo | null>(null);

  // API URL and headers
  const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

  const getAuthHeader = () => {
    const token = localStorage.getItem("token");
    return {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    };
  };

  // ========== LOAD TODOS WHEN APP STARTS ==========
  useEffect(() => {
    fetchTodos();
  }, []);

  // Fetch todos from API
  const fetchTodos = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");

      if (!token) {
        toast.error("Please log in to view your todos");
        window.location.href = "/login";
        return;
      }

      const response = await axios.get(
        `${API_URL}/todo/get-todo`,
        getAuthHeader()
      );

      setTodos(response.data);
    } catch (error: any) {
      console.error("Failed to load todos:", error);

      if (error.response?.status === 401) {
        toast.error("Session expired. Please log in again.");
        localStorage.removeItem("token");
        window.location.href = "/login";
      } else {
        toast.error("Failed to load your todos");
      }
    } finally {
      setLoading(false);
    }
  };

  // ========== HELPER FUNCTIONS ==========

  // Add a new todo
  const addTodo = async () => {
    if (!text.trim()) {
      toast.error("Please enter a todo!");
      return;
    }

    if (isAdding) return;

    const tempId = `temp-${Date.now()}`;
    const optimisticTodo: Todo = {
      _id: tempId,
      text: text.trim(),
      status: "pending",
    };

    // Optimistic update
    setTodos([...todos, optimisticTodo]);
    const originalText = text;
    setText("");

    try {
      setIsAdding(true);

      const response = await axios.post(
        `${API_URL}/todo/add-todo`,
        {
          text: optimisticTodo.text,
          status: "pending",
        },
        getAuthHeader()
      );

      // Replace temp todo with real one from server
      setTodos((prev) =>
        prev.map((t) => (t._id === tempId ? response.data : t))
      );
      toast.success("Todo added!");
    } catch (error: any) {
      console.error("Failed to add todo:", error);

      // Rollback on error
      setTodos((prev) => prev.filter((t) => t._id !== tempId));
      setText(originalText);

      if (error.response?.status === 401) {
        toast.error("Session expired. Please log in again.");
        localStorage.removeItem("token");
        window.location.href = "/login";
      } else {
        toast.error("Failed to add todo");
      }
    } finally {
      setIsAdding(false);
    }
  };

  // Delete a todo
  const deleteTodo = async () => {
    if (!todoToDelete) return;

    try {
      setOperationLoading((prev) => ({...prev, [todoToDelete]: true}));

      await axios.delete(
        `${API_URL}/todo/delete-todo/${todoToDelete}`,
        getAuthHeader()
      );

      setTodos((prev) => prev.filter((t) => t._id !== todoToDelete));

      // Clear edit state if deleting the todo being edited
      if (editingId === todoToDelete) {
        setEditingId(null);
        setEditText("");
      }

      setShowDeleteModal(false);
      setTodoToDelete(null);
      toast.success("Todo deleted!");
    } catch (error: any) {
      console.error("Failed to delete todo:", error);

      if (error.response?.status === 401) {
        toast.error("Session expired. Please log in again.");
        localStorage.removeItem("token");
        window.location.href = "/login";
      } else {
        toast.error("Failed to delete todo");
      }
    } finally {
      setOperationLoading((prev) => {
        const newState = {...prev};
        delete newState[todoToDelete!];
        return newState;
      });
    }
  };

  // Toggle todo status (pending <-> completed)
  const toggleStatus = async (id: string) => {
    try {
      setOperationLoading((prev) => ({...prev, [id]: true}));

      // Find the current todo
      const currentTodo = todos.find((t) => t._id === id);
      if (!currentTodo) return;

      const newStatus =
        currentTodo.status === "pending" ? "completed" : "pending";

      // Optimistic update
      setTodos((prev) =>
        prev.map((t) => (t._id === id ? {...t, status: newStatus} : t))
      );

      await axios.put(
        `${API_URL}/todo/edit-todo/${id}`,
        {status: newStatus},
        getAuthHeader()
      );

      toast.success(`Todo marked as ${newStatus}!`);
    } catch (error: any) {
      console.error("Failed to update todo:", error);

      // Rollback on error
      setTodos((prev) =>
        prev.map((t) =>
          t._id === id
            ? {
                ...t,
                status:
                  currentTodo?.status === "pending" ? "pending" : "completed",
              }
            : t
        )
      );

      if (error.response?.status === 401) {
        toast.error("Session expired. Please log in again.");
        localStorage.removeItem("token");
        window.location.href = "/login";
      } else {
        toast.error("Failed to update todo");
      }
    } finally {
      setOperationLoading((prev) => {
        const newState = {...prev};
        delete newState[id];
        return newState;
      });
    }
  };

  // Complete a todo (with modal)
  const completeTodo = async () => {
    if (!todoToComplete) return;

    try {
      setOperationLoading((prev) => ({...prev, [todoToComplete.id]: true}));

      // Optimistic update
      setTodos((prev) =>
        prev.map((t) =>
          t._id === todoToComplete.id ? {...t, status: "completed"} : t
        )
      );
      setShowCompleteModal(false);

      await axios.put(
        `${API_URL}/todo/edit-todo/${todoToComplete.id}`,
        {status: "completed"},
        getAuthHeader()
      );

      toast.success(`"${todoToComplete.text}" completed!`);
      setTodoToComplete(null);

      // Auto-switch to completed filter to show the completed task
      setFilter("completed");
    } catch (error: any) {
      console.error("Failed to complete todo:", error);

      // Rollback on error
      setTodos((prev) =>
        prev.map((t) =>
          t._id === todoToComplete.id ? {...t, status: "pending"} : t
        )
      );

      if (error.response?.status === 401) {
        toast.error("Session expired. Please log in again.");
        localStorage.removeItem("token");
        window.location.href = "/login";
      } else {
        toast.error("Failed to complete todo");
      }
    } finally {
      setOperationLoading((prev) => {
        const newState = {...prev};
        delete newState[todoToComplete.id];
        return newState;
      });
    }
  };

  // Start editing a todo (open modal)
  const startEdit = (todo: Todo) => {
    setTodoToEdit(todo);
    setEditText(todo.text);
    setShowEditModal(true);
  };

  // Save edited todo (from modal)
  const saveEdit = async () => {
    if (!todoToEdit || !editText.trim()) {
      toast.error("Todo cannot be empty!");
      return;
    }

    const originalTodo = todos.find((t) => t._id === todoToEdit._id);
    if (!originalTodo) return;

    try {
      setOperationLoading((prev) => ({...prev, [todoToEdit._id]: true}));

      // Optimistic update
      setTodos((prev) =>
        prev.map((t) =>
          t._id === todoToEdit._id ? {...t, text: editText.trim()} : t
        )
      );
      setShowEditModal(false);
      setTodoToEdit(null);
      setEditText("");

      await axios.put(
        `${API_URL}/todo/edit-todo/${todoToEdit._id}`,
        {text: editText.trim()},
        getAuthHeader()
      );

      toast.success("Todo updated!");
    } catch (error: any) {
      console.error("Failed to update todo:", error);

      // Rollback on error
      setTodos((prev) =>
        prev.map((t) =>
          t._id === todoToEdit._id ? {...t, text: originalTodo.text} : t
        )
      );
      setShowEditModal(true);
      setEditText(originalTodo.text);

      if (error.response?.status === 401) {
        toast.error("Session expired. Please log in again.");
        localStorage.removeItem("token");
        window.location.href = "/login";
      } else {
        toast.error("Failed to update todo");
      }
    } finally {
      setOperationLoading((prev) => {
        const newState = {...prev};
        delete newState[todoToEdit._id];
        return newState;
      });
    }
  };

  // Cancel editing (close modal)
  const cancelEdit = () => {
    setShowEditModal(false);
    setTodoToEdit(null);
    setEditText("");
  };

  // Handle Enter key for adding todos
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      addTodo();
    }
  };

  // ========== FILTERED DATA ==========
  // Calculate which todos to show based on filter
  const filteredTodos = useMemo(() => {
    if (filter === "all") {
      return todos;
    }
    return todos.filter((t) => t.status === filter);
  }, [todos, filter]);

  // Count different types of todos
  const stats = useMemo(
    () => ({
      total: todos.length,
      pending: todos.filter((t) => t.status === "pending").length,
      completed: todos.filter((t) => t.status === "completed").length,
    }),
    [todos]
  );
  

  // ========== RENDER UI ==========
  return (
    <div className=" bg-gradient-to-br from-blue-50 via-white to-indigo-50 py-8 px-4 md:px-6">
      <Navbar />
      <div className="h-10"></div>{" "}
      <div className="max-w-6xl mx-auto">
        {/* ========== HERO HEADER ========== */}
        <div className="w-full mb-12">
          <div className="text-center">
            <div className="inline-flex items-center gap-2 px-5 py-2.5 mb-4 text-sm font-medium rounded-full bg-gradient-to-r from-blue-100 to-indigo-100 text-blue-700 border border-blue-200">
              <span className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></span>
              Task Management Dashboard
            </div>

            <h1 className="text-4xl md:text-5xl font-bold text-gray-800 mb-4">
              📝 Your Personal Todo Manager
            </h1>

            <p className="text-gray-600 text-lg max-w-2xl mx-auto">
              Organize your tasks, track progress, and stay productive with this
              simple yet powerful todo app.
            </p>
          </div>
        </div>

        {/* ========== MAIN CONTENT GRID ========== */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* ========== LEFT COLUMN - STATS & FILTERS ========== */}
          <div className="lg:col-span-1 space-y-8">
            {/* Stats Cards */}
            <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6">
              <h2 className="text-xl font-semibold text-gray-800 mb-6 pb-3 border-b border-gray-100">
                📊 Task Overview
              </h2>
              <div className="space-y-4">
                {[
                  {
                    label: "Total Tasks",
                    count: stats.total,
                    color: "bg-blue-50 text-blue-700",
                    icon: "📋",
                  },
                  {
                    label: "Pending",
                    count: stats.pending,
                    color: "bg-amber-50 text-amber-700",
                    icon: "⏳",
                  },
                  {
                    label: "Completed",
                    count: stats.completed,
                    color: "bg-emerald-50 text-emerald-700",
                    icon: "✅",
                  },
                ].map((stat) => (
                  <div
                    key={stat.label}
                    className="flex items-center justify-between p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors">
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{stat.icon}</span>
                      <span className="text-gray-700 font-medium">
                        {stat.label}
                      </span>
                    </div>
                    <div
                      className={`text-2xl font-bold ${
                        stat.color.split(" ")[1]
                      }`}>
                      {stat.count}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Filter Section */}
            <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6">
              <h2 className="text-xl font-semibold text-gray-800 mb-6 pb-3 border-b border-gray-100">
                🔍 Filter Tasks
              </h2>
              <div className="space-y-3">
                {(["all", "pending", "completed"] as const).map((f) => (
                  <button
                    key={f}
                    onClick={() => setFilter(f)}
                    className={`w-full flex items-center gap-3 py-4 px-5 rounded-xl transition-all duration-300 ${
                      filter === f
                        ? "bg-gradient-to-r from-blue-500 to-indigo-500 text-white shadow-md transform -translate-y-0.5"
                        : "bg-gray-50 text-gray-600 hover:bg-gray-100 hover:shadow-sm"
                    }`}>
                    <span className="text-xl">
                      {f === "all" ? "📋" : f === "pending" ? "⏳" : "✅"}
                    </span>
                    <span className="font-medium capitalize">{f}</span>
                    <span className="ml-auto bg-white/20 px-3 py-1 rounded-full text-sm">
                      {f === "all"
                        ? stats.total
                        : f === "pending"
                        ? stats.pending
                        : stats.completed}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl shadow-lg p-6 text-white">
              <h2 className="text-xl font-semibold mb-4">⚡ Quick Actions</h2>
              <div className="space-y-3">
                <button
                  onClick={() => {
                    const input = document.querySelector(
                      'input[type="text"]'
                    ) as HTMLInputElement;
                    input?.focus();
                  }}
                  className="w-full py-3 bg-white/20 hover:bg-white/30 rounded-lg transition-colors font-medium">
                  ✨ Add New Task
                </button>
                <button
                  onClick={() => setFilter("pending")}
                  className="w-full py-3 bg-white/20 hover:bg-white/30 rounded-lg transition-colors font-medium">
                  🎯 View Pending
                </button>
                <button
                  onClick={() => setFilter("completed")}
                  className="w-full py-3 bg-white/20 hover:bg-white/30 rounded-lg transition-colors font-medium">
                  ✅ View Completed
                </button>
              </div>
            </div>
          </div>

          {/* ========== RIGHT COLUMN - TODOS ========== */}
          <div className="lg:col-span-2 ml-auto">
            <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden w-full">
              {/* Add Todo Section */}
              <div className="p-8 border-b border-gray-100 bg-gradient-to-r from-gray-50 to-white">
                <h2 className="text-2xl font-semibold text-gray-800 mb-6">
                  ✨ Add New Task
                </h2>
                <div className="flex flex-col sm:flex-row gap-4">
                  <div className="flex-1">
                    <input
                      type="text"
                      value={text}
                      onChange={(e) => setText(e.target.value)}
                      onKeyPress={handleKeyPress}
                      placeholder="What do you need to accomplish today?"
                      className="w-full px-5 py-4 border-2 border-gray-300 rounded-xl focus:ring-3 focus:ring-blue-500/30 focus:border-blue-500 outline-none transition-all text-lg shadow-sm"
                      disabled={isAdding}
                    />
                    <p className="text-gray-500 text-sm mt-2 ml-1">
                      Press Enter to add task
                    </p>
                  </div>
                  <button
                    onClick={addTodo}
                    disabled={isAdding}
                    className="px-8 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl font-semibold shadow-md hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300 disabled:opacity-50">
                    {isAdding ? "Adding..." : "Add Task"}
                  </button>
                </div>
              </div>

              {/* Todo List Section */}
              <div className="p-8">
                <div className="flex items-center justify-between mb-8">
                  <h2 className="text-2xl font-semibold text-gray-800">
                    📋 Your Tasks ({filteredTodos.length})
                  </h2>
                  <div className="text-gray-500 font-medium">
                    {filter === "all" ? "Showing all" : `Showing ${filter}`}
                  </div>
                </div>

                {/* Loading State */}
                {loading ? (
                  <div className="text-center py-16">
                    <div className="inline-block mb-6">
                      <div className="w-16 h-16 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
                    </div>
                    <p className="text-gray-600 text-lg font-medium">
                      Loading your tasks...
                    </p>
                    <p className="text-gray-400 mt-2">Please wait a moment</p>
                  </div>
                ) : filteredTodos.length === 0 ? (
                  /* Empty State */
                  <div className="text-center py-16 bg-gradient-to-br from-gray-50 to-blue-50 rounded-2xl border-2 border-dashed border-gray-300">
                    <div className="text-7xl mb-6 opacity-60">
                      {filter === "all"
                        ? "📝"
                        : filter === "pending"
                        ? "🎯"
                        : "✅"}
                    </div>
                    <h3 className="text-2xl font-medium text-gray-700 mb-3">
                      {filter === "all"
                        ? "No tasks yet!"
                        : `No ${filter} tasks found`}
                    </h3>
                    <p className="text-gray-500 max-w-md mx-auto mb-6">
                      {filter === "all"
                        ? "Start by adding your first task above to get organized!"
                        : filter === "pending"
                        ? "Great job! You have no pending tasks at the moment."
                        : "Complete some tasks to see them here!"}
                    </p>
                    {filter !== "all" && (
                      <button
                        onClick={() => setFilter("all")}
                        className="px-6 py-3 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors font-medium">
                        View All Tasks
                      </button>
                    )}
                  </div>
                ) : (
                  /* Todo Items */
                  <div className="space-y-4">
                    {filteredTodos.map((todo) => (
                      <div
                        key={todo._id}
                        className={`group rounded-xl border-2 p-5 transition-all duration-300 hover:shadow-md ${
                          todo.status === "completed"
                            ? "bg-emerald-50 border-emerald-200"
                            : "bg-white border-gray-200 hover:border-blue-300"
                        } ${operationLoading[todo._id] ? "opacity-50" : ""}`}>
                        <div className="flex items-start gap-4">
                          {/* Status Checkbox */}
                          <button
                            onClick={() => {
                              if (todo.status === "pending") {
                                setTodoToComplete({
                                  id: todo._id,
                                  text: todo.text,
                                });
                                setShowCompleteModal(true);
                              } else {
                                toggleStatus(todo._id);
                              }
                            }}
                            disabled={operationLoading[todo._id]}
                            className={`mt-1 w-8 h-8 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-all duration-300 ${
                              todo.status === "completed"
                                ? "bg-emerald-500 border-emerald-500 text-white hover:bg-emerald-600"
                                : "border-gray-300 hover:border-emerald-400 hover:bg-emerald-50"
                            } disabled:opacity-50`}>
                            {todo.status === "completed" && "✓"}
                          </button>

                          {/* Todo Content */}
                          <div className="flex-1 min-w-0">
                            <p
                              className={`text-lg font-medium ${
                                todo.status === "completed"
                                  ? "line-through text-gray-400"
                                  : "text-gray-800"
                              }`}>
                              {todo.text}
                            </p>
                            <div className="flex items-center gap-3 mt-2">
                              <span
                                className={`px-3 py-1 rounded-full text-xs font-medium ${
                                  todo.status === "completed"
                                    ? "bg-emerald-100 text-emerald-700"
                                    : "bg-amber-100 text-amber-700"
                                }`}>
                                {todo.status === "completed"
                                  ? "Completed"
                                  : "Pending"}
                              </span>
                              <span className="text-gray-400 text-sm">
                                {todo.status === "completed"
                                  ? "✓ Done"
                                  : "⏳ In Progress"}
                              </span>
                            </div>
                          </div>

                          {/* Action Buttons */}
                          <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            {todo.status === "pending" && (
                              <button
                                onClick={() => startEdit(todo)}
                                disabled={operationLoading[todo._id]}
                                className="p-2.5 hover:bg-blue-50 text-blue-500 rounded-lg transition-colors disabled:opacity-50"
                                title="Edit">
                                <span className="text-lg">✏️</span>
                              </button>
                            )}
                            <button
                              onClick={() => {
                                setTodoToDelete(todo._id);
                                setShowDeleteModal(true);
                              }}
                              disabled={operationLoading[todo._id]}
                              className="p-2.5 hover:bg-red-50 text-red-500 rounded-lg transition-colors disabled:opacity-50"
                              title="Delete">
                              <span className="text-lg">🗑️</span>
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* ========== FOOTER STATS ========== */}
        <div className="mt-8 bg-white rounded-2xl shadow-md border border-gray-200 p-6">
          <div className="flex flex-col sm:flex-row items-center justify-between">
            <div className="text-center sm:text-left mb-4 sm:mb-0">
              <p className="text-gray-600 font-medium">Task Summary</p>
              <p className="text-gray-400 text-sm">
                Stay on top of your productivity
              </p>
            </div>
            <div className="flex gap-6">
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-800">
                  {stats.total}
                </div>
                <div className="text-gray-500 text-sm">Total</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-emerald-600">
                  {stats.completed}
                </div>
                <div className="text-gray-500 text-sm">Done</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-amber-600">
                  {stats.pending}
                </div>
                <div className="text-gray-500 text-sm">Pending</div>
              </div>
            </div>
          </div>
        </div>
      </div>
      {/* ========== MODALS ========== */}
      {/* Delete Modal */}
      {showDeleteModal && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50"
          onClick={() => setShowDeleteModal(false)}>
          <div
            className="bg-white rounded-2xl shadow-2xl max-w-sm w-full p-6 animate-in fade-in zoom-in duration-200"
            onClick={(e) => e.stopPropagation()}>
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4 text-2xl">
                🗑️
              </div>
              <h3 className="text-xl font-semibold text-gray-800 mb-2">
                Delete Task?
              </h3>
              <p className="text-gray-600 text-sm">
                This action cannot be undone.
              </p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="flex-1 py-2.5 border-2 border-gray-300 rounded-lg hover:bg-gray-50 transition-colors font-medium">
                Cancel
              </button>
              <button
                onClick={deleteTodo}
                disabled={todoToDelete ? operationLoading[todoToDelete] : false}
                className="flex-1 py-2.5 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors font-medium disabled:opacity-50">
                {todoToDelete && operationLoading[todoToDelete]
                  ? "Deleting..."
                  : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
      {/* Complete Modal */}
      {showCompleteModal && todoToComplete && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50"
          onClick={() => setShowCompleteModal(false)}>
          <div
            className="bg-white rounded-2xl shadow-2xl max-w-sm w-full p-6 animate-in fade-in zoom-in duration-200"
            onClick={(e) => e.stopPropagation()}>
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4 text-emerald-600 text-2xl">
                ✓
              </div>
              <h3 className="text-xl font-semibold text-gray-800 mb-2">
                Mark as Complete?
              </h3>
              <div className="bg-gray-50 border-2 border-gray-200 rounded-lg p-4 mb-4">
                <p className="text-gray-800 font-medium italic">
                  "{todoToComplete.text}"
                </p>
              </div>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setShowCompleteModal(false)}
                className="flex-1 py-2.5 border-2 border-gray-300 rounded-lg hover:bg-gray-50 transition-colors font-medium">
                Cancel
              </button>
              <button
                onClick={completeTodo}
                disabled={operationLoading[todoToComplete.id]}
                className="flex-1 py-2.5 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 transition-colors font-medium disabled:opacity-50">
                {operationLoading[todoToComplete.id]
                  ? "Completing..."
                  : "Complete"}
              </button>
            </div>
          </div>
        </div>
      )}
      {/* Edit Modal */}
      {showEditModal && todoToEdit && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50"
          onClick={() => cancelEdit()}>
          <div
            className="bg-white rounded-2xl shadow-2xl max-w-sm w-full p-6 animate-in fade-in zoom-in duration-200"
            onClick={(e) => e.stopPropagation()}>
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4 text-blue-600 text-2xl">
                ✏️
              </div>
              <h3 className="text-xl font-semibold text-gray-800 mb-4">
                Edit Task
              </h3>
              <input
                autoFocus
                value={editText}
                onChange={(e) => setEditText(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && saveEdit()}
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-3 focus:ring-blue-500/30 focus:border-blue-500 outline-none text-gray-700 mb-4"
                placeholder="Update your task..."
                disabled={operationLoading[todoToEdit._id]}
              />
            </div>
            <div className="flex gap-3">
              <button
                onClick={cancelEdit}
                disabled={operationLoading[todoToEdit._id]}
                className="flex-1 py-2.5 border-2 border-gray-300 rounded-lg hover:bg-gray-50 transition-colors font-medium disabled:opacity-50">
                Cancel
              </button>
              <button
                onClick={saveEdit}
                disabled={operationLoading[todoToEdit._id]}
                className="flex-1 py-2.5 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors font-medium disabled:opacity-50">
                {operationLoading[todoToEdit._id]
                  ? "Saving..."
                  : "Save Changes"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
