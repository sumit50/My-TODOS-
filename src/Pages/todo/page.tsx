import {useEffect, useState, useCallback} from "react";
import toast from "react-hot-toast";
import Navbar from "../../Components/Navbar/Navbar";
import axios from "axios";
import {Footer} from "../Dashboard/Footer/Footer";
type Todo = {
  _id: string;
  text: string;
};

export const TodoPage = () => {
  const [text, setText] = useState("");
  const [todos, setTodos] = useState<Todo[]>([]);
  const [loading, setLoading] = useState(false);

  // 👉 Fetch Todos
  const fetchTodos = useCallback(async () => {
    try {
      const res = await axios.get(
        `${import.meta.env.VITE_API_URL}/todo/get-todo`
      );
      setTodos(res.data);
    } catch {
      toast.error("Failed to fetch todos");
    }
  }, []);

  useEffect(() => {
    fetchTodos();
  }, [fetchTodos]);

  // 👉 Add Todo
  const addTodo = async () => {
    const trimmed = text.trim();
    if (!trimmed) {
      toast.error("Todo text required");
      return;
    }

    try {
      setLoading(true);

      const res = await axios.post(
        `${import.meta.env.VITE_API_URL}/todo/add-todo`,
        {text: trimmed}
      );

      setTodos((prev) => [...prev, res.data]);
      setText("");
      toast.success("Todo added");
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to add todo");
    } finally {
      setLoading(false);
    }
  };

  // 👉 Delete Todo
  const deleteTodo = async (id: string) => {
    try {
      await axios.delete(
        `${import.meta.env.VITE_API_URL}/todo/delete-todo/${id}`
      );

      setTodos((prev) => prev.filter((todo) => todo._id !== id));
      toast.success("Todo deleted");
    } catch {
      toast.error("Failed to delete todo");
    }
  };

  return (
    <>
      <Navbar />

      <div className="min-h-screen flex justify-center items-center bg-gray-300 p-4">
        <div className="w-full max-w-xl bg-white p-8 rounded-2xl shadow-xl">
          <h1 className="text-3xl font-bold text-center mb-6">Todo App</h1>

          <div className="flex gap-4 mb-6">
            <input
              type="text"
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Add a new task..."
              className="flex-1 px-5 py-3 rounded-lg border"
            />

            <button
              onClick={addTodo}
              disabled={loading}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg disabled:opacity-50">
              {loading ? "Adding..." : "Add"}
            </button>
          </div>

          <ul className="space-y-5">
            {todos.map((todo) => (
              <li
                key={todo._id}
                className="bg-purple-300 px-4 py-2 rounded flex justify-between text-white  mt-7">
                <span>{todo.text}</span>
                <button
                  onClick={() => deleteTodo(todo._id)}
                  className="text-red-500">
                  ❌
                </button>
              </li>
            ))}
          </ul>
        </div>
      </div>
      <Footer />
    </>
  );
};
