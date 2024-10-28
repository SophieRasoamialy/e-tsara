import React, { useState, useEffect } from "react";
import axios from "axios";
import UserModal from "./userModal";
import Sidebar from "../components/Sidebar";
import { FaSearch, FaPlus } from "react-icons/fa";
import Swal from "sweetalert2";
import env from "react-dotenv";

function UserList() {
  const [users, setUsers] = useState([]);
  const [roles, setRoles] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedRole, setSelectedRole] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);

  const apiUrl = env.API_URL || "";

  // Fetch users from the server
  const fetchData = async (role = "") => {
    try {
      const usersUrl = role
        ? `${apiUrl}/api/users/role/${role}`
        : `${apiUrl}/api/users`;

      const usersRes = await axios.get(usersUrl);
      setUsers(usersRes.data);
    } catch (error) {
      console.error("Erreur lors de la récupération des données:", error);
    }
  };

  // Fetch roles from the server
  const fetchRoles = async () => {
    try {
      const rolesRes = await axios.get(`${apiUrl}/api/users/roles`);
      setRoles(rolesRes.data); 
    } catch (error) {
      console.error("Erreur lors de la récupération des rôles:", error);
    }
  };

 // Fetch roles when component mounts
 useEffect(() => {
  fetchRoles();
}, []);

// Fetch users when selectedRole changes
useEffect(() => {
  fetchData(selectedRole);
}, [selectedRole]);



  // Filter users based on search term
  const filteredUsers = users.filter(
    (user) =>
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSearch = (event) => {
    setSearchTerm(event.target.value);
  };

  const handleRoleChange = (event) => {
    const role = event.target.value;
    setSelectedRole(role);
    setSearchTerm(""); // Clear search term when changing role
  };

  const handleDelete = async (id) => {
    Swal.fire({
      title: "Êtes-vous sûr ?",
      text: "Vous ne pourrez pas annuler cette action !",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Oui, supprimer !",
      cancelButtonText: "Annuler",
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          await axios.delete(`${apiUrl}/api/users/user/${id}`);
          fetchData(selectedRole); // Refetch users with current role filter
          Swal.fire("Supprimé !", "L'utilisateur a été supprimé.", "success");
        } catch (error) {
          console.error(
            "Erreur lors de la suppression de l'utilisateur:",
            error
          );
          Swal.fire(
            "Erreur",
            "Une erreur s'est produite lors de la suppression de l'utilisateur.",
            "error"
          );
        }
      }
    });
  };

  const handleAddClick = () => {
    setSelectedUser(null);
    setIsModalOpen(true);
  };

  const handleEditClick = (userItem) => {
    setSelectedUser(userItem);
    setIsModalOpen(true);
  };

  return (
    <div className="flex">
      <Sidebar />
      <div className="flex-1 p-8 bg-[#f3fbfa] min-h-screen pl-64">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold text-gray-800">
            Liste des Utilisateurs
          </h1>
          <div className="relative w-1/2">
            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
              <FaSearch className="w-4 h-4 text-gray-500" />
            </div>
            <input
              type="text"
              placeholder="Rechercher un utilisateur..."
              value={searchTerm}
              onChange={handleSearch}
              className="ps-10 bg-white border border-gray-300 text-gray-900 text-sm rounded-full focus:ring-[#1f81a9] focus:border-[#1f81a9] block pl-10 p-3 shadow-lg w-full"
            />
          </div>
          <button
            onClick={handleAddClick}
            className="flex text-white bg-[#1f81a9] hover:bg-[#145c73] focus:outline-none focus:ring-4 focus:ring-[#1f81a9] font-medium rounded-full text-sm px-5 py-3 text-center mb-2"
          >
            <FaPlus className="w-4 h-4 mr-1" /> <span>Nouveau</span>
          </button>
        </div>

        <div className="mb-6">
          <label
            htmlFor="role"
            className="block text-sm font-medium text-gray-700 ml-4 mb-2"
          >
            Sélectionner un rôle
          </label>
          <select
            id="role"
            value={selectedRole}
            onChange={handleRoleChange}
            className="bg-white border border-gray-300 text-gray-900 text-sm rounded-full focus:ring-[#1f81a9] focus:border-[#1f81a9] block pl-10 p-2.5 scale-105 shadow-lg"
          >
            <option value="">Tous les rôles</option>
            {roles.map((role) => (
              <option key={role._id} value={role._id}>
                {role.name}
              </option>
            ))}
          </select>
        </div>

        <div className="bg-white shadow-md rounded-lg overflow-hidden">
          <table className="min-w-full bg-white">
            <thead className="bg-gray-100 text-gray-800 uppercase text-sm leading-normal">
              <tr>
                <th className="py-3 px-6 text-left">Nom</th>
                <th className="py-3 px-6 text-left">Adresse Email</th>
                <th className="py-3 px-6 text-left">Rôle</th>
                <th className="py-3 px-6 text-left">Actions</th>
              </tr>
            </thead>
            <tbody className="text-gray-600 text-sm font-light">
              {filteredUsers.length > 0 ? (
                filteredUsers.map((userItem) => (
                  <tr
                    key={userItem._id}
                    className="border-b border-gray-200 hover:bg-gray-50"
                  >
                    <td className="py-3 px-6 text-left whitespace-nowrap">
                      {userItem.name}
                    </td>
                    <td className="py-3 px-6 text-left whitespace-nowrap">
                      {userItem.email}
                    </td>
                    <td className="py-3 px-6 text-left">{userItem.role.name}</td>
                    <td className="py-3 px-6 text-left">
                      <button
                        onClick={() => handleEditClick(userItem)}
                        className="text-[#1f81a9] hover:text-[#145c73] hover:underline"
                      >
                        Modifier
                      </button>
                      <button
                        onClick={() => handleDelete(userItem._id)}
                        className="ml-4 text-red-600 hover:text-red-800 hover:underline"
                      >
                        Supprimer
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan="4"
                    className="py-3 px-6 text-center text-gray-500"
                  >
                    Aucun utilisateur trouvé.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {isModalOpen && (
          <UserModal
            isOpen={isModalOpen}
            onClose={() => setIsModalOpen(false)}
            selectedUser={selectedUser}
            fetchUsers={() => fetchData(selectedRole)} // Update to refetch with current filter
          />
        )}
      </div>
    </div>
  );
}

export default UserList;
