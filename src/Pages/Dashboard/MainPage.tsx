// src/Pages/Dashboard/DashboardPage.tsx
import {useState, useEffect} from "react";
import axios from "axios";
import {Link} from "react-router-dom";
import Navbar from "../../Components/Navbar/Navbar";
import {Form} from "./feedbackForm.tsx/Form";
import {Footer} from "./Footer/Footer";

export const DashbordPage = () => {
  // 1. Initialize dynamic stats
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    completed: 0,
  });

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  /* ============================
     Helper: Decode JWT payload
     ============================ */
  const getUserFromToken = () => {
    const token = localStorage.getItem("token");
    if (!token) return null;

    try {
      // Decode the Base64 payload of the JWT
      const base64Url = token.split(".")[1];
      const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
      const jsonPayload = decodeURIComponent(
        atob(base64)
          .split("")
          .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
          .join("")
      );
      return JSON.parse(jsonPayload);
    } catch (error) {
      console.error("Error decoding token:", error);
      return null;
    }
  };

  // 2. Fetch stats from API on mount
  useEffect(() => {
    const fetchStats = async () => {
      try {
        setIsLoading(true);
        setError(null);

        const token = localStorage.getItem("token");

        if (!token) {
          setError("Please log in to view dashboard");
          setIsLoading(false);
          return;
        }

        const response = await axios.get(
          `${import.meta.env.VITE_API_URL}/dashboard/stats`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        setStats(response.data);
      } catch (err: any) {
        console.error("Error fetching dashboard stats:", err);

        // Check for specific error types
        if (err.response?.status === 401) {
          setError("Session expired. Please log in again.");
        } else if (err.response?.status === 403) {
          setError("Access denied. Invalid token.");
        } else if (err.response?.status === 404) {
          setError("Dashboard endpoint not found.");
        } else {
          setError("Failed to load dashboard statistics. Please try again.");
        }

        // Set default stats on error
        setStats({
          total: 0,
          pending: 0,
          completed: 0,
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchStats();
  }, []);

  const user = getUserFromToken();
  const username = user?.name || user?.username;

  return (
    <>
      <Navbar />

      {/* HERO SECTION */}
      <div className="min-h-screen px-6 md:px-12 flex items-center justify-center bg-gradient-to-br from-gray-100 via-white to-gray-200">
        <div className="relative bg-white/90 w-full max-w-5xl p-10 md:p-14 rounded-3xl shadow-xl border border-gray-200 text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 mb-6 text-sm font-medium rounded-full bg-blue-50 text-blue-700">
            <span className="w-2 h-2 bg-blue-600 rounded-full"></span>
            Productivity Dashboard
          </div>
          {/* Welcome */}
          <div className="mb-2">
            <h1 className="text-4xl font-bold">
              Welcome back
              {username && <span className="text-blue-600">, {username}</span>}
              <span className="ml-2 inline-block">👋</span>
            </h1>
          </div>
          <p className="text-gray-600 mb-6 text-center">
            Organize your day, focus your mind, and get things done efficiently
            with a clean and powerful todo manager.
          </p>
          <div className="h-2"></div> {/* STATS SECTION - Now Dynamic */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {/* Removed mb-12 from here */}
            {isLoading ? (
              // Loading skeleton
              <>
                <div className="bg-white p-6 rounded-2xl border border-gray-200">
                  <div className="animate-pulse">
                    <div className="h-4 bg-gray-200 rounded w-20 mb-4 mx-auto"></div>
                    <div className="h-8 bg-gray-300 rounded w-12 mx-auto"></div>
                  </div>
                </div>
                <div className="bg-white p-6 rounded-2xl border border-gray-200">
                  <div className="animate-pulse">
                    <div className="h-4 bg-gray-200 rounded w-20 mb-4 mx-auto"></div>
                    <div className="h-8 bg-gray-300 rounded w-12 mx-auto"></div>
                  </div>
                </div>
                <div className="bg-white p-6 rounded-2xl border border-gray-200">
                  <div className="animate-pulse">
                    <div className="h-4 bg-gray-200 rounded w-20 mb-4 mx-auto"></div>
                    <div className="h-8 bg-gray-300 rounded w-12 mx-auto"></div>
                  </div>
                </div>
              </>
            ) : error ? (
              // Error state
              <div className="col-span-3 bg-red-50 border border-red-200 p-8 rounded-2xl">
                <div className="text-red-700 font-medium mb-2">{error}</div>
                <button
                  onClick={() => window.location.reload()}
                  className="mt-4 px-6 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors">
                  Refresh Dashboard
                </button>
              </div>
            ) : (
              // Success state - actual stats
              <>
                <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-md hover:shadow-lg transition-shadow duration-300">
                  <p className="text-sm text-gray-600 mb-2">Total Tasks</p>
                  <h3 className="text-3xl font-bold text-gray-900">
                    {stats.total}
                  </h3>
                </div>
                <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm hover:shadow-md transition">
                  <p className="text-sm text-gray-500 mb-1">Pending</p>
                  <h3 className="text-3xl font-bold text-yellow-500">
                    {stats.pending}
                  </h3>
                </div>
                <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm hover:shadow-md transition">
                  <p className="text-sm text-gray-500 mb-1">Completed</p>
                  <h3 className="text-3xl font-bold text-green-600">
                    {stats.completed}
                  </h3>
                </div>
              </>
            )}
          </div>
          {/* ============================================
              ADD SPACER DIV HERE FOR PROPER SEPARATION
              ============================================ */}
          <div className="h-6"></div>{" "}
          {/* This adds 64px space between sections */}
          {/* FEATURE CARDS - Clean and simple */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-8 mb-12">
            {/* Removed mt- from here, using spacer div instead */}
            <div className="bg-blue-50 p-6 rounded-2xl border border-blue-100 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-md">
              <div className="text-3xl mb-4">✍️</div>
              <h3 className="text-xl font-semibold text-blue-700 mb-2">
                Create Tasks
              </h3>
              <p className="text-gray-600 text-sm leading-relaxed">
                Add tasks instantly and never miss important work.
              </p>
            </div>
            <div className="bg-green-50 p-6 rounded-2xl border border-green-100 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-md">
              <div className="text-3xl mb-4">✅</div>
              <h3 className="text-xl font-semibold text-green-700 mb-2">
                Stay Productive
              </h3>
              <p className="text-gray-600 text-sm leading-relaxed">
                Track progress and maintain a clutter-free workflow.
              </p>
            </div>
            <div className="bg-purple-50 p-6 rounded-4xl border border-purple-100 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-md">
              <div className="text-3xl mb-0">🧠</div>
              <h3 className="text-xl font-semibold text-purple-700 mb-2">
                Clear Mind
              </h3>
              <p className="text-gray-600 text-sm leading-relaxed">
                Clear tasks. Clear mind. Less stress, more focus.
              </p>
            </div>
          </div>
          {/* CTA */}
                    <div className="h-2"></div>{" "}

          <div className="flex flex-col md:flex-row items-center justify-between gap-6 bg-gray-50 p-6 rounded-2xl border border-gray-200">
            <p className="text-gray-700 text-base font-medium">
              Ready to take control of your tasks?
            </p>
            <Link to="/todo">
              <button className="group px-8 py-3 bg-blue-600 text-white rounded-xl font-semibold shadow-md transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5">
                My Todos
                <span className="inline-block ml-2 transition-transform group-hover:translate-x-1">
                  →
                </span>
              </button>
            </Link>
          </div>
        </div>
      </div>

      {/* FEEDBACK SECTION */}
      <div className="pt-28 px-6 md:px-12 flex justify-center mb-16 ">
        <div className="w-full max-w-3xl bg-white p-8 md:p-10  border border-gray-200">
          <h2 className="text-2xl font-bold text-gray-900 text-center mb-6">
            Drop your thoughts here{" "}
          </h2>
          <Form />
        </div>
      </div>

      <Footer />
    </>
  );
};
