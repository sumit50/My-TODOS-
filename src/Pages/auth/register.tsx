import React from "react";
import {AuthForm} from "../../Components/Auth";
import {Link, useNavigate} from "react-router-dom";
import axios from "axios";
import toast from "react-hot-toast";
import Snowfall from "react-snowfall";

export const RegisterPage = () => {
  const navigate = useNavigate();

  // regex
  const nameRegex = /^[A-Za-z]{3,}$/;
  const passwordRegex =
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&#])[A-Za-z\d@$!%*?&#]{8,}$/;

  // 🔴 live password validation
  const handlePasswordChange = (value: string) => {
    if (!value) return;

    if (!passwordRegex.test(value)) {
      toast.error(
        "Password must be 8+ chars with uppercase, lowercase, number & special char",
        {id: "password-error"}
      );
    }
  };

  const handleRegister = async (data: Record<string, string>) => {
    const {name, email, password} = data;

    // empty check
    if (!name || !email || !password) {
      toast.error("All fields are required");
      return;
    }

    // name validation
    if (!nameRegex.test(name)) {
      toast.error("Name must contain only alphabets and at least 3 characters");
      return;
    }

    // password validation
    if (!passwordRegex.test(password)) {
      toast.error(
        "Password must be 8+ chars with uppercase, lowercase, number & special char"
      );
      return;
    }

    try {
      const res = await axios.post(
        `${import.meta.env.VITE_API_URL}/user/register-user`,
        {name, email, password}
      );

      // store token (if backend sends it)
      if (res.data?.token) {
        localStorage.setItem("token", res.data.token);
      }

      toast.success("Registration successful!");
      navigate("/dashboard");
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Registration failed");
    }
  };

  return (
    <div className="flex justify-center items-center h-screen bg-gray-400">
      <div>
        <AuthForm
          title="Create Account"
          fields={[
            {name: "name", label: "Name", type: "text"},
            {name: "email", label: "Email", type: "email"},
            {name: "password", label: "Password", type: "password"},
          ]}
          btnText="Register"
          onSubmit={handleRegister}
          onPasswordChange={handlePasswordChange}
        />

        <div className="text-center mt-4">
          <Snowfall
            color="#dee4fd
          
          "
          />
          <p className="text text-white">Have an account?</p>
          <Link to="/login">
            <p className="text-gray-300 hover:underline text-sm">Log In</p>
          </Link>
        </div>
      </div>
    </div>
  );
};
