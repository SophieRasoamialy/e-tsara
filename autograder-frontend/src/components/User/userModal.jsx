import React, { useState, useEffect } from "react";
import axios from "axios";
import Swal from "sweetalert2";
import { FaEyeSlash, FaEye } from "react-icons/fa";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

const schema = z.object({
  email: z.string().email({ message: "Format d'email invalide" }).min(1, { message: "L'email est requis" }),
  password: z.string().min(8, { message: "Le mot de passe doit comporter au moins 8 caractères" })
    .regex(/[A-Z]/, "Le mot de passe doit contenir au moins une majuscule")
    .regex(/\d/, "Le mot de passe doit contenir au moins un chiffre")
    .regex(/\W/, "Le mot de passe doit contenir au moins un caractère spécial"),
  name: z.string().min(1, { message: "Le nom est requis" }),
  role: z.string().min(1, { message: "Le rôle est requis" }),
});

function UserModal({ isOpen, onClose, selectedUser, fetchUsers }) {
  const [roles, setRoles] = useState([]);
  const [showPassword, setShowPassword] = useState(false);

  const { register, handleSubmit, setValue, reset, formState: { errors } } = useForm({
    resolver: zodResolver(schema)
  });

  useEffect(() => {
    const fetchRoles = async () => {
      try {
        const res = await axios.get("http://localhost:8000/api/users/roles");
        setRoles(res.data);
      } catch (error) {
        console.error("Erreur lors de la récupération des rôles:", error);
      }
    };
    if (selectedUser) {
      setValue("email", selectedUser.email);
      setValue("name", selectedUser.name);
      setValue("role", selectedUser.role._id);
      setValue("password", selectedUser.password);
      console.log("selectedUser", selectedUser);
    } else {
      reset();
    }
    fetchRoles();
    
  }, [selectedUser, setValue, reset]);

  const onSubmit = async (data) => {
    console.log("data",data);
    try {
      if (selectedUser) {
        await axios.put(`http://localhost:8000/api/users/user/${selectedUser._id}`, data);
        Swal.fire("Modifié !", "L'utilisateur a été modifié.", "success");
      } else {
        await axios.post("http://localhost:8000/api/users/register", data);
        Swal.fire("Créé !", "L'utilisateur a été créé.", "success");
      }
      fetchUsers();
      onClose();
    } catch (error) {
      console.error("Erreur lors de la sauvegarde de l'utilisateur:", error);
      Swal.fire("Erreur", "Une erreur s'est produite lors de la sauvegarde de l'utilisateur.", "error");
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    isOpen && (
      <div className="fixed inset-0 flex items-center justify-center bg-gray-500 bg-opacity-75">
        <div className="bg-white p-6 rounded-lg shadow-lg w-1/3">
          <h2 className="text-lg font-bold mb-4">
            {selectedUser ? "Modifier l'Utilisateur" : "Créer un Utilisateur"}
          </h2>
          <form onSubmit={handleSubmit(onSubmit)}>
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">Adresse Email</label>
              <input
                id="email"
                type="email"
                {...register("email")}
                className="ps-10 bg-white border border-gray-300 text-gray-900 text-sm rounded-full focus:ring-[#1f81a9] focus:border-[#1f81a9] block pl-10 p-3 shadow-lg w-full"
                disabled={selectedUser}
              />
              {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>}
            </div>
            <div className="mt-4">
              <label htmlFor="name" className="block text-sm font-medium text-gray-700">Nom</label>
              <input
                id="name"
                type="text"
                {...register("name")}
                className="ps-10 bg-white border border-gray-300 text-gray-900 text-sm rounded-full focus:ring-[#1f81a9] focus:border-[#1f81a9] block pl-10 p-3 shadow-lg w-full"
              />
              {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name.message}</p>}
            </div>
            <div className="mt-4 relative">
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">Mot de passe</label>
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                {...register("password")}
                className="ps-10 bg-white border border-gray-300 text-gray-900 text-sm rounded-full focus:ring-[#1f81a9] focus:border-[#1f81a9] block pl-10 p-3 shadow-lg w-full"
                placeholder={selectedUser ? "Laisser vide pour ne pas changer" : ""}
              />
              <button
                type="button"
                onClick={togglePasswordVisibility}
                className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-700 focus:outline-none mt-4"
              >
                {showPassword ? <FaEyeSlash /> : <FaEye />}
              </button>
              {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password.message}</p>}
            </div>
            <div className="mt-4">
              <label htmlFor="role" className="block text-sm font-medium text-gray-700">Rôle</label>
              <select
                id="role"
                {...register("role")}
                className="bg-white border border-gray-300 text-gray-900 text-sm rounded-full focus:ring-[#1f81a9] focus:border-[#1f81a9] block w-full p-2.5 shadow-lg"
              >
                <option value="">-- Choisir un rôle --</option>
                {roles.map((role) => (
                  <option key={role._id} value={role._id}>
                    {role.name}
                  </option>
                ))}
              </select>
              {errors.role && <p className="text-red-500 text-xs mt-1">{errors.role.message}</p>}
            </div>
            <div className="flex gap-4 mt-4 justify-end">
              <button
                type="button"
                onClick={onClose}
                className="text-white bg-gray-500 hover:bg-gray-600 focus:outline-none focus:ring-4 font-medium rounded-full text-sm px-5 py-2.5"
              >
                Annuler
              </button>
              <button
                type="submit"
                className="text-white bg-[#1f81a9] hover:bg-[#145c73] focus:outline-none focus:ring-4 focus:ring-[#1f81a9] font-medium rounded-full text-sm px-5 py-2.5"
              >
                {selectedUser ? "Modifier" : "Créer"}
              </button>
            </div>
          </form>
        </div>
      </div>
    )
  );
}

export default UserModal;
