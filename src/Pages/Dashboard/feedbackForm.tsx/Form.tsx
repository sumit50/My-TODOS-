import React from "react";
import axios from "axios";
import toast from "react-hot-toast";
import {useState, useEffect} from "react";

export const Form = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    age: "",
    message: "",
    rating: 0,
  });

  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [hoverRating, setHoverRating] = useState(0);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      try {
        const payload = JSON.parse(atob(token.split(".")[1]));
        setIsLoggedIn(true);
        setFormData((prev) => ({
          ...prev,
          name: payload.name || "",
          email: payload.email || "",
        }));
      } catch (error) {
        console.log("Error reading token");
      }
    }
  }, []);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    if (isLoggedIn && (e.target.name === "name" || e.target.name === "email")) {
      return;
    }

    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleRatingClick = (rating: number) => {
    setFormData({
      ...formData,
      rating: rating,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (
      !formData.name ||
      !formData.email ||
      !formData.message ||
      formData.rating === 0
    ) {
      toast.error("All fields are required");
      return;
    }

    try {
      const res = await axios.post(
        `${import.meta.env.VITE_API_URL}/feedback/add-feedback`,
        formData
      );

      toast.success("Feedback submitted");
    } catch (err: any) {
      // Show the actual error message from backend
      const errorMsg = err.response?.data?.message || "Feedback failed";
      toast.error(errorMsg);
    }
  };

  return (
    <div>
      <div className="flex justify-center mt-30 mb-24 px-4">
        <div
          className="w-full max-w-2x border-white  
     p-10 border 
  ">
          <h2 className="text-2xl font-bold text-gray-800">
            Share your feedback
          </h2>
          <p className="text-gray-500 mt-2">
            We'd love to hear your thoughts to improve the app
          </p>

          <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
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
                readOnly={isLoggedIn}
                className={`w-full px-4 py-3 border border-gray-300 rounded-lg
                     outline-none transition
                     focus:ring-2 focus:ring-blue-500 focus:border-blue-500
                     hover:border-gray-400 ${
                       isLoggedIn ? "bg-gray-50 cursor-not-allowed" : ""
                     }`}
              />
            </div>

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
                readOnly={isLoggedIn}
                className={`w-full px-4 py-3 border border-gray-300 rounded-lg
                     outline-none transition
                     focus:ring-2 focus:ring-blue-500 focus:border-blue-500
                     hover:border-gray-400 ${
                       isLoggedIn ? "bg-gray-50 cursor-not-allowed" : ""
                     }`}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">
                Age
              </label>
              <input
                type="number"
                name="age"
                placeholder="Enter your age "
                onChange={handleChange}
                value={formData.age}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg
                     outline-none transition
                     focus:ring-2 focus:ring-blue-500 focus:border-blue-500
                     hover:border-gray-400"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">
                Feedback
              </label>
              <textarea
                rows={4}
                name="message"
                placeholder="Write your feedback here..."
                onChange={handleChange}
                value={formData.message}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg resize-none
                     outline-none transition
                     focus:ring-2 focus:ring-blue-500 focus:border-blue-500
                     hover:border-gray-400"
              />
            </div>

            <div>
              <p className="text-sm font-medium text-gray-600 mb-2">
                Rate your experience
              </p>
              <div className="flex gap-2 text-2xl">
                {[1, 2, 3, 4, 5].map((star) => (
                  <span
                    key={star}
                    className="cursor-pointer"
                    onClick={() => handleRatingClick(star)}
                    onMouseEnter={() => setHoverRating(star)}
                    onMouseLeave={() => setHoverRating(0)}
                    style={{
                      color:
                        star <= (hoverRating || formData.rating)
                          ? "#fbbf24"
                          : "#d1d5db",
                    }}>
                    ★
                  </span>
                ))}
              </div>
              {formData.rating > 0 && (
                <p className="text-sm text-gray-500 mt-1">
                  Selected: {formData.rating} star
                  {formData.rating > 1 ? "s" : ""}
                </p>
              )}
            </div>

            <button
              type="submit"
              className="w-full py-3 bg-blue-600 text-white font-semibold rounded-lg
                   hover:bg-blue-700 transition active:scale-[0.98]">
              Submit Feedback
            </button>
          </form>

          <p className="text-center text-sm text-gray-400 mt-6">
            Your feedback helps us build a better experience 💙
          </p>
        </div>
      </div>
    </div>
  );
};
