import {useState, useEffect} from "react";
import axios from "axios";

interface User {
  _id: string;
  name: string;
  email: string;
  role?: string;
  createdAt: string | Date;
}

interface Todo {
  _id: string;
  title: string;
  status: string;
  priority: string;
  dueDate?: string | Date;
  createdAt: string | Date;
  user?: {
    name: string;
  };
}

interface Feedback {
  _id: string;
  name: string;
  email: string;
  rating: number;
  message: string;
  createdAt: string | Date;
}

export default function Admin() {
  const [activeTab, setActiveTab] = useState("overview");
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalTodos: 0,
    totalFeedback: 0,
    pendingTodos: 0,
    completedTodos: 0,
  });
  const [users, setUsers] = useState<User[]>([]);
  const [todos, setTodos] = useState<Todo[]>([]);
  const [feedback, setFeedback] = useState<Feedback[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchAdminData();
  }, []);

  const fetchAdminData = async () => {
    try {
      setLoading(true);
      setError(null);
      const token = localStorage.getItem("token");
      if (!token) {
        setError("No authentication token found");
        return;
      }

      const headers = {Authorization: `Bearer ${token}`};

      // Fetch all data in parallel
      const [statsRes, usersRes, todosRes, feedbackRes] = await Promise.all([
        axios.get(`${import.meta.env.VITE_API_URL}/admin/stats`, {headers}),
        axios.get(`${import.meta.env.VITE_API_URL}/admin/users`, {headers}),
        axios.get(`${import.meta.env.VITE_API_URL}/admin/todos`, {headers}),
        axios.get(`${import.meta.env.VITE_API_URL}/admin/feedback`, {headers}),
      ]);

      setStats(statsRes.data);
      setUsers(Array.isArray(usersRes.data) ? usersRes.data : []);
      setTodos(Array.isArray(todosRes.data) ? todosRes.data : []);
      setFeedback(Array.isArray(feedbackRes.data) ? feedbackRes.data : []);
    } catch (err) {
      console.error("Error fetching admin data:", err);
      setError("Failed to load admin data");
    } finally {
      setLoading(false);
    }
  };

  const tabs = [
    {id: "overview", label: "Overview"},
    {id: "users", label: "Users"},
    {id: "todos", label: "Todos"},
    {id: "feedback", label: "Feedback"},
    {id: "hiring", label: "Hiring"},
  ];

  const deleteUser = async (userId: string) => {
    if (!confirm("Are you sure you want to delete this user?")) return;

    try {
      const token = localStorage.getItem("token");
      if (!token) return;

      const headers = {Authorization: `Bearer ${token}`};
      await axios.delete(
        `${import.meta.env.VITE_API_URL}/admin/users/${userId}`,
        {headers}
      );

      // Refresh data
      fetchAdminData();
      alert("User deleted successfully");
    } catch (err) {
      console.error("Error deleting user:", err);
      alert("Failed to delete user");
    }
  };

  const deleteTodo = async (todoId: string) => {
    if (!confirm("Are you sure you want to delete this todo?")) return;

    try {
      const token = localStorage.getItem("token");
      if (!token) return;

      const headers = {Authorization: `Bearer ${token}`};
      await axios.delete(
        `${import.meta.env.VITE_API_URL}/admin/todos/${todoId}`,
        {headers}
      );

      // Refresh data
      fetchAdminData();
      alert("Todo deleted successfully");
    } catch (err) {
      console.error("Error deleting todo:", err);
      alert("Failed to delete todo");
    }
  };

  const deleteFeedback = async (feedbackId: string) => {
    if (!confirm("Are you sure you want to delete this feedback?")) return;

    try {
      const token = localStorage.getItem("token");
      if (!token) return;

      const headers = {Authorization: `Bearer ${token}`};
      await axios.delete(
        `${import.meta.env.VITE_API_URL}/admin/feedback/${feedbackId}`,
        {headers}
      );

      // Refresh data
      fetchAdminData();
      alert("Feedback deleted successfully");
    } catch (err) {
      console.error("Error deleting feedback:", err);
      alert("Failed to delete feedback");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 p-6 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading admin data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-100 p-6 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-600 text-xl mb-4">Error</div>
          <p className="text-gray-600">{error}</p>
          <button
            onClick={fetchAdminData}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-800">Admin Dashboard</h1>
        <div className="flex items-center space-x-4">
          <button
            onClick={fetchAdminData}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 flex items-center space-x-2">
            <i className="fas fa-sync-alt"></i>
            <span>Refresh</span>
          </button>
          <i className="fas fa-bell text-gray-600"></i>
          <div className="w-10 h-10 rounded-full bg-gray-300"></div>
        </div>
      </div>

      {/* Tabs */}
      <div className="mb-6">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === tab.id
                    ? "border-blue-500 text-blue-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}>
                {tab.label}
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* Tab Content */}
      {activeTab === "overview" && (
        <div>
          {/* Stats Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <div className="bg-white p-4 rounded-lg shadow">
              <h3 className="text-gray-500 font-medium">Total Users</h3>
              <p className="text-2xl font-bold mt-2">{stats.totalUsers}</p>
            </div>
            <div className="bg-white p-4 rounded-lg shadow">
              <h3 className="text-gray-500 font-medium">Total Todos</h3>
              <p className="text-2xl font-bold mt-2">{stats.totalTodos}</p>
            </div>
            <div className="bg-white p-4 rounded-lg shadow">
              <h3 className="text-gray-500 font-medium">Pending Todos</h3>
              <p className="text-2xl font-bold mt-2">{stats.pendingTodos}</p>
            </div>
            <div className="bg-white p-4 rounded-lg shadow">
              <h3 className="text-gray-500 font-medium">Completed Todos</h3>
              <p className="text-2xl font-bold mt-2">{stats.completedTodos}</p>
            </div>
          </div>

          {/* Recent Activity */}
          <div className="bg-white p-4 rounded-lg shadow">
            <h2 className="text-xl font-bold mb-4">Recent Activity</h2>
            <div className="space-y-4">
              {Array.isArray(todos)
                ? todos.slice(0, 5).map((todo) => (
                    <div key={todo._id} className="flex items-center space-x-4">
                      <div
                        className={`w-10 h-10 rounded-full flex items-center justify-center ${
                          todo.status === "completed"
                            ? "bg-green-100"
                            : "bg-yellow-100"
                        }`}>
                        <i
                          className={`fas ${
                            todo.status === "completed"
                              ? "fa-check text-green-500"
                              : "fa-clock text-yellow-500"
                          }`}></i>
                      </div>
                      <div>
                        <p className="font-medium">{todo.title}</p>
                        <p className="text-gray-500 text-sm">
                          {todo.status === "completed"
                            ? "Completed"
                            : "Pending"}{" "}
                          • {new Date(todo.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  ))
                : null}
            </div>
          </div>
        </div>
      )}

      {activeTab === "users" && (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-xl font-bold">Users Management</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Email
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Role
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Joined
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {Array.isArray(users)
                  ? users.map((user) => (
                      <tr key={user.id}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {user.name}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {user.email}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {user.role || "User"}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {new Date(user.createdAt).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <button className="text-blue-600 hover:text-blue-900 mr-2">
                            Edit
                          </button>
                          <button className="text-red-600 hover:text-red-900">
                            Delete
                          </button>
                        </td>
                      </tr>
                    ))
                  : null}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === "todos" && (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-xl font-bold">Todos Management</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Title
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    User
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Priority
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Due Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {Array.isArray(todos)
                  ? todos.map((todo) => (
                      <tr key={todo.id}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {todo.title}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {todo.user?.name || "Unknown"}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span
                            className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                              todo.status === "completed"
                                ? "bg-green-100 text-green-800"
                                : "bg-yellow-100 text-yellow-800"
                            }`}>
                            {todo.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {todo.priority}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {todo.dueDate
                            ? new Date(todo.dueDate).toLocaleDateString()
                            : "N/A"}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <button className="text-blue-600 hover:text-blue-900 mr-2">
                            Edit
                          </button>
                          <button className="text-red-600 hover:text-red-900">
                            Delete
                          </button>
                        </td>
                      </tr>
                    ))
                  : null}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === "feedback" && (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-xl font-bold">Feedback Management</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Email
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Rating
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Message
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {Array.isArray(feedback)
                  ? feedback.map((item) => (
                      <tr key={item.id}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {item.name}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {item.email}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {item.rating}/5
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap max-w-xs truncate">
                          {item.message}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {new Date(item.createdAt).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <button className="text-blue-600 hover:text-blue-900 mr-2">
                            View
                          </button>
                          <button className="text-red-600 hover:text-red-900">
                            Delete
                          </button>
                        </td>
                      </tr>
                    ))
                  : null}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
