import React from "react";
import { AuthForm } from "../../Components/Auth";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import toast from "react-hot-toast";
import Snowfall from "react-snowfall";


export const LoginPage = () => {
  const navigate = useNavigate();

  const handleLogin = async (data: Record<string, string>) => {
    const email = data.email?.trim().toLowerCase();
    const password = data.password?.trim();

    // frontend validation
    if (!email || !password) {
      toast.error("All fields required");
      return;
    }

    try {
      const res = await axios.post(
        `${import.meta.env.VITE_API_URL}/user/login-user`,
        { email, password }
      );

      const { token, user } = res.data;

      // store token
      localStorage.setItem("token", token);

      // store user
      if (user) {
        localStorage.setItem("currentUser", JSON.stringify(user));
      }

      toast.success("Login successful!");

      // 🔐 ROLE BASED REDIRECT (THIS IS THE KEY)
      if (user?.role === "admin") {
        navigate("/admin");
      } else {
        navigate("/dashboard");
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Login failed");
    }
  };

  return (
    <div className="flex justify-center items-center h-screen bg-gray-700">
      <Snowfall color="#dee4fd" />

      <div>
        <AuthForm
          title="Login to MYTODO!"
          fields={[
            { name: "email", label: "Email", type: "email" },
            { name: "password", label: "Password", type: "password" },
          ]}
          btnText="Login"
          onSubmit={handleLogin}
        />

        <Link to="/forgot">
          <p className="text-white mt-4 hover:underline text-center">
            Forget Password?
          </p>
        </Link>

        <Link to="/register">
          <p className="text-gray-400 mt-4 text-center">
            Create an account
          </p>
        </Link>
      </div>
    </div>
  );
};
