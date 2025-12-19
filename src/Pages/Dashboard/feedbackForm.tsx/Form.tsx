import React, {useState, useEffect} from "react";
import axios from "axios";
import toast from "react-hot-toast";

export const Form = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    message: "",
    age: "",
  });

  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Function to decode JWT token from localStorage
  const getUserFromToken = () => {
    try {
      const token = localStorage.getItem("token"); // Or whatever key you use
      if (!token) {
        setIsAuthenticated(false);
        return null;
      }

      // Decode JWT token (middle part is payload)
      const base64Url = token.split(".")[1];
      const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
      const payload = JSON.parse(window.atob(base64));

      return {
        name: payload.name || payload.username || "",
        email: payload.email || "",
        userId: payload.userId || payload.id || payload.sub || "",
      };
    } catch (error) {
      console.error("Error decoding token:", error);
      setIsAuthenticated(false);
      return null;
    }
  };

  // Fetch user data on component mount
  useEffect(() => {
    const loadUserData = async () => {
      setIsLoading(true);

      // Method 1: Decode from token (if you store user data in token)
      const userFromToken = getUserFromToken();

      if (userFromToken) {
        setFormData((prev) => ({
          ...prev,
          name: userFromToken.name,
          email: userFromToken.email,
        }));
        setIsAuthenticated(true);
      } else {
        // Method 2: Fetch user data from API using token
        const token = localStorage.getItem("token");
        if (token) {
          try {
            const response = await axios.get(
              `${import.meta.env.VITE_API_URL}/user/profile`,
              {
                headers: {
                  Authorization: `Bearer ${token}`,
                },
              }
            );

            if (response.data) {
              setFormData((prev) => ({
                ...prev,
                name: response.data.name || response.data.username || "",
                email: response.data.email || "",
              }));
              setIsAuthenticated(true);
            }
          } catch (error) {
            console.error("Error fetching user data:", error);
            setIsAuthenticated(false);
          }
        }
      }

      setIsLoading(false);
    };

    loadUserData();
  }, []);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate required fields
    if (!formData.message.trim()) {
      toast.error("Please enter your feedback");
      return;
    }

    try {
      const token = localStorage.getItem("token");
      const config = token
        ? {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        : {};

      const res = await axios.post(
        `${import.meta.env.VITE_API_URL}/feedback/add-feedback`,
        formData,
        config
      );

      toast.success("Feedback submitted successfully!");
      // Clear message after successful submission
      setFormData((prev) => ({
        ...prev,
        message: "",
      }));
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to submit feedback");
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-center mt-30 mb-24 px-4">
        <div className="w-full max-w-2x border-gray-100 rounded-2xl shadow-xl p-10 border transition-all duration-300 ease-out transform-gpu hover:-translate-y-2 hover:scale-[1.08] hover:shadow-2xl">
          {/* Heading with user status */}
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-gray-800">
              Share your feedback
            </h2>
            <p className="text-gray-500 mt-2">
              We'd love to hear your thoughts to improve the app
            </p>
            {isAuthenticated && (
              <div className="mt-2 p-3 bg-green-50 border border-green-200 rounded-lg">
                <p className="text-sm text-green-700">
                  ✓ Signed in as{" "}
                  <span className="font-semibold">{formData.name}</span>
                </p>
              </div>
            )}
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="mt-8 space-y-6">
            {/* Name field */}
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">
                Name
              </label>
              <input
                type="text"
                name="name"
                placeholder="Your name"
                onChange={handleChange}
                value={formData.name}
                readOnly={isAuthenticated} // Make read-only if user is logged in
                className={`w-full px-4 py-3 border border-gray-300 rounded-lg outline-none transition
                  ${isAuthenticated ? "bg-gray-50 cursor-not-allowed" : ""}
                  focus:ring-2 focus:ring-blue-500 focus:border-blue-500
                  hover:border-gray-400`}
              />
              {isAuthenticated && (
                <p className="text-xs text-gray-500 mt-1">
                  Name is pre-filled from your account
                </p>
              )}
            </div>

            {/* Email field */}
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">
                Email
              </label>
              <input
                type="email"
                name="email"
                placeholder="you@example.com"
                onChange={handleChange}
                value={formData.email}
                readOnly={isAuthenticated} // Make read-only if user is logged in
                className={`w-full px-4 py-3 border border-gray-300 rounded-lg outline-none transition
                  ${isAuthenticated ? "bg-gray-50 cursor-not-allowed" : ""}
                  focus:ring-2 focus:ring-blue-500 focus:border-blue-500
                  hover:border-gray-400`}
              />
              {isAuthenticated && (
                <p className="text-xs text-gray-500 mt-1">
                  Email is pre-filled from your account
                </p>
              )}
            </div>

            {/* Age field */}
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">
                Age (Optional)
              </label>
              <input
                type="number"
                name="age"
                placeholder="Enter your age"
                onChange={handleChange}
                value={formData.age}
                min="1"
                max="120"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg outline-none transition focus:ring-2 focus:ring-blue-500 focus:border-blue-500 hover:border-gray-400"
              />
            </div>

            {/* Feedback field */}
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">
                Feedback *
              </label>
              <textarea
                name="message"
                rows={4}
                placeholder="Write your feedback here..."
                onChange={handleChange}
                value={formData.message}
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-lg resize-none outline-none transition focus:ring-2 focus:ring-blue-500 focus:border-blue-500 hover:border-gray-400"
              />
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              className="w-full py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={!formData.message.trim()}>
              Submit Feedback
            </button>
          </form>

          {/* Footer Note */}
          <p className="text-center text-sm text-gray-400 mt-6">
            Your feedback helps us build a better experience 💙
          </p>
        </div>
      </div>
    </div>
  );
};
