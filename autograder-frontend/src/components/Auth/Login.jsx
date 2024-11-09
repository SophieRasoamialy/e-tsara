import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FaEnvelope, FaLock, FaEyeSlash, FaEye } from "react-icons/fa";
import Cookies from "js-cookie";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import env from "react-dotenv";

const schema = z.object({
  email: z
    .string()
    .email({ message: "Invalid email format" })
    .min(1, { message: "Email is required" }),
  password: z
    .string()
    .min(6, { message: "Password must be at least 6 characters long" }),
});

const Login = () => {
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(schema),
  });
  const apiUrl = env.API_URL || "";
  
console.log("env..", env.API_URL);
console.log("api..",apiUrl);
  const onSubmit = async (data) => {
    console.log('Sending request to:', `${apiUrl}/api/users/login`);
      console.log('Request data:', data);
    try {
      const response = await fetch(`${apiUrl}/api/users/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (response.ok) {
        const result = await response.json();
        // Stocker le token dans les cookies avec SameSite et Secure pour éviter les avertissements du navigateur
        Cookies.set("token", result.token, {
          expires: 1,
          sameSite: "Lax",
          secure: false,
        });
        const storageToken = Cookies.get("token");
        if (storageToken) {
          console.log("Token found:------------", storageToken);
        } else {
          console.log("No token found----------");
        }

        // Rediriger l'utilisateur vers une autre page après la connexion
        navigate("/");
      } else {
        const errorData = await response.json();
        console.error(errorData.msg);
        alert("Login failed: " + errorData.msg);
      }
    } catch (error) {
      console.error('Fetch error:', error);
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-[#f3fbfa]">
      <div className="absolute inset-0 bg-cover bg-center z-0"></div>

      <div className="bg-white rounded-lg px-10 pt-8 pb-10 mb-4 relative z-10 shadow-lg w-full max-w-md leading-normal">
        <img
          src="/images/logo.png"
          alt="Mi Tsara Logo"
          className="mx-auto w-48 mb-6"
        />
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="relative mb-8">
            <input
              type="text"
              id="input-group-1"
              className="bg-white border border-gray-300 text-gray-900 text-sm rounded-full focus:ring-[#1f81a9] focus:border-[#1f81a9] block w-full pl-10 p-2.5 scale-105 shadow-lg"
              placeholder="Email"
              {...register("email")}
            />
            <div className="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none">
              <FaEnvelope className="text-[#1f81a9]" />
            </div>
            {errors.email && (
              <p className="text-red-500 text-xs mt-1">
                {errors.email.message}
              </p>
            )}
          </div>

          <div className="relative mb-2">
            <input
              type={showPassword ? "text" : "password"}
              id="input-group-2"
              className="bg-white border border-gray-300 text-gray-900 text-sm rounded-full focus:ring-[#1f81a9] focus:border-[#1f81a9] block w-full pl-10 p-2.5 scale-105 shadow-lg"
              placeholder="Password"
              {...register("password")}
            />
            <div className="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none">
              <FaLock className="text-[#1f81a9]" />
            </div>
            <div className="absolute inset-y-0 right-0 top-0 flex items-center pr-3">
              <button
                type="button"
                className="focus:outline-none text-gray-700"
                onClick={togglePasswordVisibility}
              >
                {showPassword ? <FaEyeSlash /> : <FaEye />}
              </button>
            </div>
            {errors.password && (
              <p className="text-red-500 text-xs mt-1">
                {errors.password.message}
              </p>
            )}
          </div>
          <div className="relative">
            <Link
              className="inline-block align-baseline float-right text-sm text-[#1f81a9] hover:text-[#145c73]"
              to="/reset-password"
            >
              Forgot Password?
            </Link>
          </div>
          <div className="relative mt-10 mb-4">
            <button
              type="submit"
              className="text-white bg-[#1f81a9] hover:bg-[#145c73] focus:outline-none focus:ring-4 focus:ring-[#1f81a9] font-medium rounded-full text-sm px-5 py-2.5 text-center mb-2 w-full"
            >
              Sign Inn
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Login;
