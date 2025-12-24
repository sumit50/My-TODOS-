import {useEffect, useState, useMemo, KeyboardEvent} from "react";
import toast from "react-hot-toast";
import axios from "axios";
import Navbar from "../../Components/Navbar/Navbar";

type Todo = {
  _id: string;
  text: string;
  status: "pending" | "completed";
};

export const TodoPage = () => {
  const [text, setText] = useState("");
  const [todos, setTodos] = useState<Todo[]>([]);
  const [loading, setLoading] = useState(false);
  const [isAdding, setIsAdding] = useState(false);
  const [filter, setFilter] = useState<"all" | "pending" | "completed">(() => {
    const savedFilter = localStorage.getItem("todoFilter");
    return (savedFilter as "all" | "pending" | "completed") || "all";
  });

  // Modal States
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
  const [todoToDelete, setTodoToDelete] = useState<string | null>(null);
  const [isCompleteConfirmOpen, setIsCompleteConfirmOpen] = useState(false);
  const [todoToComplete, setTodoToComplete] = useState<{
    id: string;
    text: string;
  } | null>(null);

  // Edit States
  const [isEditing, setIsEditing] = useState<string | null>(null);
  const [editText, setEditText] = useState("");

  // Loading states for operations
  const [operationLoading, setOperationLoading] = useState<{
    [key: string]: boolean;
  }>({});

  // API Helper to avoid repetition
  const getAuthHeader = () => ({
    headers: {Authorization: `Bearer ${localStorage.getItem("token")}`},
  });
  const API_URL = import.meta.env.VITE_API_URL;

  // --- Effects ---
  useEffect(() => {
    let isMounted = true;

    const fetchTodos = async () => {
      try {
        setLoading(true);
        const res = await axios.get(
          `${API_URL}/todo/get-todo`,
          getAuthHeader()
        );
        if (isMounted) {
          setTodos(res.data);
        }
      } catch (error) {
        console.error("Failed to load todos:", error);
        if (isMounted) {
          toast.error("Failed to load todos");
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchTodos();

    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    localStorage.setItem("todoFilter", filter);
  }, [filter]);

  // Close modals on Escape key
  useEffect(() => {
    const handleEscape = (e: globalThis.KeyboardEvent) => {
      if (e.key === "Escape") {
        setIsDeleteConfirmOpen(false);
        setIsCompleteConfirmOpen(false);
      }
    };

    window.addEventListener("keydown", handleEscape);
    return () => window.removeEventListener("keydown", handleEscape);
  }, []);

  // --- API Functions ---
  const addTodo = async () => {
    if (!text.trim()) {
      toast.error("Please enter a todo");
      return;
    }

    if (isAdding) return; // Prevent double submissions

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
      const res = await axios.post(
        `${API_URL}/todo/add-todo`,
        {text: optimisticTodo.text, status: "pending"},
        getAuthHeader()
      );
      // Replace temp todo with real one from server
      setTodos((prev) => prev.map((t) => (t._id === tempId ? res.data : t)));
      toast.success("Todo added!");
    } catch (error) {
      console.error("Failed to add todo:", error);
      // Rollback on error
      setTodos((prev) => prev.filter((t) => t._id !== tempId));
      setText(originalText);
      toast.error("Failed to add todo");
    } finally {
      setIsAdding(false);
    }
  };

  const confirmDelete = async () => {
    if (!todoToDelete) return;

    try {
      setOperationLoading((prev) => ({...prev, [todoToDelete]: true}));
      await axios.delete(
        `${API_URL}/todo/delete-todo/${todoToDelete}`,
        getAuthHeader()
      );
      setTodos((prev) => prev.filter((t) => t._id !== todoToDelete));

      // Clear edit state if deleting the todo being edited
      if (isEditing === todoToDelete) {
        setIsEditing(null);
        setEditText("");
      }

      setIsDeleteConfirmOpen(false);
      setTodoToDelete(null);
      toast.success("Todo deleted!");
    } catch (error) {
      console.error("Failed to delete todo:", error);
      toast.error("Failed to delete todo");
    } finally {
      setOperationLoading((prev) => {
        const newState = {...prev};
        delete newState[todoToDelete];
        return newState;
      });
    }
  };

  const confirmComplete = async () => {
    if (!todoToComplete) return;

    try {
      setOperationLoading((prev) => ({...prev, [todoToComplete.id]: true}));

      // Optimistic update
      setTodos((prev) =>
        prev.map((t) =>
          t._id === todoToComplete.id ? {...t, status: "completed"} : t
        )
      );
      setIsCompleteConfirmOpen(false);

      await axios.put(
        `${API_URL}/todo/edit-todo/${todoToComplete.id}`,
        {status: "completed"},
        getAuthHeader()
      );

      toast.success(`"${todoToComplete.text}" completed!`);
      setTodoToComplete(null);
    } catch (error) {
      console.error("Failed to complete todo:", error);
      // Rollback on error
      setTodos((prev) =>
        prev.map((t) =>
          t._id === todoToComplete.id ? {...t, status: "pending"} : t
        )
      );
      toast.error("Failed to complete todo");
    } finally {
      setOperationLoading((prev) => {
        const newState = {...prev};
        delete newState[todoToComplete.id];
        return newState;
      });
    }
  };

  const markAsPending = async (id: string) => {
    try {
      setOperationLoading((prev) => ({...prev, [id]: true}));

      // Optimistic update
      setTodos((prev) =>
        prev.map((t) => (t._id === id ? {...t, status: "pending"} : t))
      );

      await axios.put(
        `${API_URL}/todo/edit-todo/${id}`,
        {status: "pending"},
        getAuthHeader()
      );

      toast.success("Todo marked as pending!");
    } catch (error) {
      console.error("Failed to update todo:", error);
      // Rollback on error
      setTodos((prev) =>
        prev.map((t) => (t._id === id ? {...t, status: "completed"} : t))
      );
      toast.error("Failed to update todo");
    } finally {
      setOperationLoading((prev) => {
        const newState = {...prev};
        delete newState[id];
        return newState;
      });
    }
  };

  const saveEdit = async (id: string) => {
    if (!editText.trim()) {
      toast.error("Todo cannot be empty");
      return;
    }

    const originalTodo = todos.find((t) => t._id === id);
    if (!originalTodo) return;

    try {
      setOperationLoading((prev) => ({...prev, [id]: true}));

      // Optimistic update
      setTodos((prev) =>
        prev.map((t) => (t._id === id ? {...t, text: editText.trim()} : t))
      );
      setIsEditing(null);
      setEditText("");

      await axios.put(
        `${API_URL}/todo/edit-todo/${id}`,
        {text: editText.trim()},
        getAuthHeader()
      );

      toast.success("Todo updated!");
    } catch (error) {
      console.error("Failed to update todo:", error);
      // Rollback on error
      setTodos((prev) =>
        prev.map((t) => (t._id === id ? {...t, text: originalTodo.text} : t))
      );
      setIsEditing(id);
      setEditText(originalTodo.text);
      toast.error("Failed to update todo");
    } finally {
      setOperationLoading((prev) => {
        const newState = {...prev};
        delete newState[id];
        return newState;
      });
    }
  };

  // --- Derived State & Handlers ---
  const filteredTodos = useMemo(
    () =>
      todos.filter((todo) =>
        filter === "all" ? true : todo.status === filter
      ),
    [todos, filter]
  );

  const pendingCount = useMemo(
    () => todos.filter((t) => t.status === "pending").length,
    [todos]
  );
  const completedCount = useMemo(
    () => todos.filter((t) => t.status === "completed").length,
    [todos]
  );
  const allCount = todos.length;

  const handleKeyDown = (e: KeyboardEvent, action: () => void) => {
    if (e.key === "Enter") action();
    if (e.key === "Escape") {
      setIsEditing(null);
      setEditText("");
    }
  };

  return (
    <>
      <Navbar />

      {/* --- MODALS --- */}
      {isDeleteConfirmOpen && (
        <div
          className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          onClick={() => setIsDeleteConfirmOpen(false)}
          role="dialog"
          aria-modal="true"
          aria-labelledby="delete-modal-title">
          <div
            className="bg-white rounded-xl shadow-2xl max-w-sm w-full p-6 animate-in fade-in zoom-in duration-200"
            onClick={(e) => e.stopPropagation()}>
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4 text-2xl">
                🗑️
              </div>
              <h3
                id="delete-modal-title"
                className="text-xl font-semibold text-gray-800 mb-2">
                Delete Todo?
              </h3>
              <p className="text-gray-600 text-sm">
                This action cannot be undone.
              </p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setIsDeleteConfirmOpen(false)}
                className="flex-1 py-2.5 border rounded-lg hover:bg-gray-50 transition"
                aria-label="Cancel deletion">
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                disabled={todoToDelete ? operationLoading[todoToDelete] : false}
                className="flex-1 py-2.5 bg-red-500 text-white rounded-lg hover:bg-red-600 transition disabled:opacity-50"
                aria-label="Confirm deletion">
                {todoToDelete && operationLoading[todoToDelete]
                  ? "Deleting..."
                  : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}

      {isCompleteConfirmOpen && todoToComplete && (
        <div
          className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          onClick={() => setIsCompleteConfirmOpen(false)}
          role="dialog"
          aria-modal="true"
          aria-labelledby="complete-modal-title">
          <div
            className="bg-white rounded-xl shadow-2xl max-w-sm w-full p-6 animate-in fade-in zoom-in duration-200"
            onClick={(e) => e.stopPropagation()}>
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4 text-green-600 text-2xl">
                ✓
              </div>
              <h3
                id="complete-modal-title"
                className="text-xl font-semibold text-gray-800 mb-2">
                Mark as Complete?
              </h3>
              <div className="bg-gray-50 border rounded-lg p-3 mb-4 text-gray-800 italic">
                "{todoToComplete.text}"
              </div>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setIsCompleteConfirmOpen(false)}
                className="flex-1 py-2.5 border rounded-lg hover:bg-gray-50 transition"
                aria-label="Cancel completion">
                Cancel
              </button>
              <button
                onClick={confirmComplete}
                disabled={operationLoading[todoToComplete.id]}
                className="flex-1 py-2.5 bg-green-500 text-white rounded-lg hover:bg-green-600 transition disabled:opacity-50"
                aria-label="Confirm completion">
                {operationLoading[todoToComplete.id]
                  ? "Completing..."
                  : "Complete"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* --- MAIN UI --- */}
      <div className="min-h-screen bg-gray-50 pb-10">
        <div className="max-w-2xl mx-auto p-4">
          <header className="mb-8 pt-6 text-center">
            <h1 className="text-3xl font-bold text-gray-800 mb-2">Todo App</h1>
            <p className="text-gray-600">Stay organized and productive</p>
          </header>

          {/* Input Area */}
          <div className="mb-8 bg-white rounded-lg shadow-sm p-6">
            <div className="flex gap-3">
              <input
                type="text"
                value={text}
                onChange={(e) => setText(e.target.value)}
                onKeyDown={(e) => handleKeyDown(e, addTodo)}
                placeholder="Add a new task..."
                className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                disabled={isAdding}
                aria-label="New todo input"
              />
              <button
                onClick={addTodo}
                disabled={isAdding}
                className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition disabled:opacity-50"
                aria-label="Add todo">
                {isAdding ? "Adding..." : "Add"}
              </button>
            </div>
            <p className="text-gray-500 text-sm mt-2">Press Enter to add</p>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-3 gap-4 mb-6">
            {[
              {l: "Total", v: allCount, c: "text-gray-800"},
              {l: "Pending", v: pendingCount, c: "text-yellow-600"},
              {l: "Done", v: completedCount, c: "text-green-600"},
            ].map((stat) => (
              <div
                key={stat.l}
                className="bg-white rounded-lg shadow-sm p-4 text-center">
                <div className={`text-2xl font-bold ${stat.c}`}>{stat.v}</div>
                <div className="text-gray-600 text-sm">{stat.l}</div>
              </div>
            ))}
          </div>

          {/* Filters */}
          <div className="flex gap-2 mb-6 bg-white rounded-lg shadow-sm p-2">
            {(["all", "pending", "completed"] as const).map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`flex-1 py-2 rounded-md font-medium capitalize transition ${
                  filter === f
                    ? "bg-blue-500 text-white"
                    : "text-gray-600 hover:bg-gray-100"
                }`}
                aria-label={`Filter ${f} todos`}
                aria-pressed={filter === f}>
                {f} (
                {f === "all"
                  ? allCount
                  : f === "pending"
                  ? pendingCount
                  : completedCount}
                )
              </button>
            ))}
          </div>

          {/* Loading State */}
          {loading ? (
            <div className="bg-white rounded-lg shadow-sm p-8 text-center">
              <div className="text-4xl mb-4">⏳</div>
              <p className="text-gray-500">Loading your todos...</p>
            </div>
          ) : (
            /* List Section */
            <div className="space-y-3">
              {filteredTodos.length === 0 ? (
                <div className="bg-white rounded-lg shadow-sm p-8 text-center text-gray-500">
                  <div className="text-5xl mb-4">
                    {filter === "all"
                      ? "📝"
                      : filter === "pending"
                      ? "🎯"
                      : "✅"}
                  </div>
                  <p className="mb-2">No tasks found in this category.</p>
                  {filter !== "all" && (
                    <button
                      onClick={() => setFilter("all")}
                      className="mt-2 text-blue-500 hover:text-blue-600 font-medium">
                      View all tasks
                    </button>
                  )}
                </div>
              ) : (
                filteredTodos.map((todo) => (
                  <div
                    key={todo._id}
                    className={`bg-white rounded-lg shadow-sm border p-4 transition ${
                      todo.status === "completed"
                        ? "border-green-200"
                        : "border-gray-200"
                    } ${operationLoading[todo._id] ? "opacity-50" : ""}`}>
                    {isEditing === todo._id ? (
                      <div className="flex gap-3">
                        <input
                          autoFocus
                          value={editText}
                          onChange={(e) => setEditText(e.target.value)}
                          onKeyDown={(e) =>
                            handleKeyDown(e, () => saveEdit(todo._id))
                          }
                          className="flex-1 px-3 py-2 border rounded focus:ring-2 focus:ring-blue-500 outline-none"
                          disabled={operationLoading[todo._id]}
                          aria-label="Edit todo text"
                        />
                        <button
                          onClick={() => saveEdit(todo._id)}
                          disabled={operationLoading[todo._id]}
                          className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 disabled:opacity-50"
                          aria-label="Save changes">
                          {operationLoading[todo._id] ? "Saving..." : "Save"}
                        </button>
                        <button
                          onClick={() => {
                            setIsEditing(null);
                            setEditText("");
                          }}
                          disabled={operationLoading[todo._id]}
                          className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300 disabled:opacity-50"
                          aria-label="Cancel editing">
                          Cancel
                        </button>
                      </div>
                    ) : (
                      <div className="flex items-start gap-3">
                        <button
                          onClick={() =>
                            todo.status === "pending"
                              ? (setTodoToComplete({
                                  id: todo._id,
                                  text: todo.text,
                                }),
                                setIsCompleteConfirmOpen(true))
                              : markAsPending(todo._id)
                          }
                          disabled={operationLoading[todo._id]}
                          className={`w-6 h-6 mt-1 rounded-full border-2 flex items-center justify-center transition flex-shrink-0 ${
                            todo.status === "completed"
                              ? "bg-green-500 border-green-500 text-white"
                              : "border-gray-300 hover:border-green-500"
                          } disabled:opacity-50`}
                          aria-label={
                            todo.status === "completed"
                              ? "Mark as pending"
                              : "Mark as complete"
                          }>
                          {todo.status === "completed" && "✓"}
                        </button>
                        <div className="flex-1 min-w-0">
                          <p
                            className={`break-words ${
                              todo.status === "completed"
                                ? "line-through text-gray-400"
                                : "text-gray-800"
                            }`}>
                            {todo.text}
                          </p>
                        </div>
                        <div className="flex gap-2">
                          {todo.status === "pending" && (
                            <button
                              onClick={() => {
                                setIsEditing(todo._id);
                                setEditText(todo.text);
                              }}
                              disabled={operationLoading[todo._id]}
                              className="p-1 hover:bg-blue-50 text-blue-500 rounded disabled:opacity-50"
                              aria-label="Edit todo">
                              ✏️
                            </button>
                          )}
                          <button
                            onClick={() => {
                              setTodoToDelete(todo._id);
                              setIsDeleteConfirmOpen(true);
                            }}
                            disabled={operationLoading[todo._id]}
                            className="p-1 hover:bg-red-50 text-red-500 rounded disabled:opacity-50"
                            aria-label="Delete todo">
                            🗑️
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      </div>
    </>
  );
};
