import React, { useState } from "react";
import { Link } from "react-router-dom";
import { FaEnvelope } from "react-icons/fa";
import Swal from "sweetalert2";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

const schema = z.object({
  email: z
    .string()
    .email({ message: "Invalid email format" })
    .min(1, { message: "Email is required" }),
});

const ResetPasswordPage = () => {
  const [email, setEmail] = useState("");
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(schema),
  });
  const Toast = Swal.mixin({
    toast: true,
    position: "top-end",
    showConfirmButton: false,
    timer: 3000,
    timerProgressBar: false,
    didOpen: (toast) => {
      toast.addEventListener("mouseenter", Swal.stopTimer);
      toast.addEventListener("mouseleave", Swal.resumeTimer);
    },
  });

  const onSubmit = async (e) => {
    e.preventDefault();

    try {
      await Toast.fire({
        icon: "info",
        title: `Une demande a été envoyée à l'administrateur pour réinitialiser le mot de passe pour ${email}.`,
      });
      setEmail("");
    } catch (error) {
      console.error(error);
    }
  };

  const handleEmailChange = (event) => {
    setEmail(event.target.value);
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-[#f3fbfa]">
      <div className="bg-white rounded-lg px-8 py-8 shadow-lg w-full max-w-md">
        <h2 className="text-2xl font-bold text-[#1f81a9] mb-6">
          Reset Password
        </h2>
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="mb-4">
            <label
              htmlFor="email"
              className="block text-sm font-medium mb-2 text-gray-700"
            >
              Email
            </label>
            <div className="relative mb-6">
              <input
                type="email"
                id="email"
                {...register("email")}
                className="bg-white border border-gray-300 text-gray-900 text-sm rounded-full focus:ring-[#1f81a9] focus:border-[#1f81a9] block w-full pl-10 p-2.5 scale-105 shadow-lg"
                placeholder="Email"
                value={email}
                onChange={handleEmailChange}
                required
              />
              {errors.email && (
                <p className="text-red-500 text-xs mt-1">
                  {errors.email.message}
                </p>
              )}
              <div className="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none">
                <FaEnvelope className="text-[#1f81a9]" />
              </div>
            </div>
          </div>
          <div className="flex items-center justify-between">
            <button
              type="submit"
              className="bg-[#1f81a9] hover:bg-[#145c73] text-white font-medium py-2 px-4 rounded-full focus:outline-none focus:ring-2 focus:ring-[#1f81a9] focus:ring-opacity-50"
            >
              Request Password Reset
            </button>
            <Link
              to="/login"
              className="text-[#1f81a9] hover:text-[#145c73] text-sm font-medium focus:outline-none"
            >
              Back to Login
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ResetPasswordPage;
