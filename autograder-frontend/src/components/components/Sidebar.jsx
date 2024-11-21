import React from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  FaHome,
  FaBook,
  FaUsers,
  FaUser,
  FaFileAlt,
  FaClipboardList,
  FaSignOutAlt,
  FaPaperclip,
  FaList,

} from "react-icons/fa";
import Cookies from "js-cookie";

const Sidebar = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    Cookies.remove("token");
    navigate("/login");
  };

  return (
    <div className="bg-gray-700 text-white h-screen w-60 flex flex-col fixed">
      <div className="p-4 flex items-center justify-center">
        <img
          src="/images/Mi Tsara 2.png"
          alt="Mi Tsara logo"
          className="w-32 h-auto"
        />
      </div>
      <nav className="flex-1">
        <ul className="space-y-4">
          <li>
            <Link
              to="/"
              className="flex items-center py-2 px-4 text-gray-300 hover:bg-gray-700 hover:text-white"
            >
              <FaHome className="mr-2" />
              Tableau de bord
            </Link>
          </li>
          <li>
            <Link
              to="/subject-list"
              className="flex items-center py-2 px-4 text-gray-300 hover:bg-gray-700 hover:text-white"
            >
              <FaFileAlt className="mr-2" />
              Sujet d'Examen
            </Link>
          </li>
          
          <li>
            <Link
              to="/list-copies"
              className="flex items-center py-2 px-4 text-gray-300 hover:bg-gray-700 hover:text-white"
            >
              <FaPaperclip className="mr-2" />
              Feuille de copie
            </Link>
          </li>

        
          <li>
            <Link  to="/activity"
              className="flex items-center py-2 px-4 text-gray-300 hover:bg-gray-700 hover:text-white"
            >
              <FaList className="mr-2" />
              Suivi des activiés
            </Link>
          </li>
          <li>
            <Link
              to="/etudiants"
              className="flex items-center py-2 px-4 text-gray-300 hover:bg-gray-700 hover:text-white"
            >
              <FaUsers className="mr-2" />
              Étudiants
            </Link>
          </li>
          <li>
            <Link
              to="/list-user"
              className="flex items-center py-2 px-4 text-gray-300 hover:bg-gray-700 hover:text-white"
            >
              <FaUser className="mr-2" />
              Utilisateur
            </Link>
          </li>
          <li>
            <Link
              to="/modules"
              className="flex items-center py-2 px-4 text-gray-300 hover:bg-gray-700 hover:text-white"
            >
              <FaBook className="mr-2" />
              Unité d'enseignement
            </Link>
          </li>
          <li>
            <Link
              to="/list-niveau"
              className="flex items-center py-2 px-4 text-gray-300 hover:bg-gray-700 hover:text-white"
            >
              <FaClipboardList className="mr-2" />
              Classe
            </Link>
          </li>
        </ul>
        <div className="mt-auto">
          <button
            onClick={handleLogout}
            className="flex items-center py-2 px-4 text-gray-300 hover:bg-gray-700 hover:text-white w-full"
          >
            <FaSignOutAlt className="mr-2" />
            Se deconnecter
          </button>
        </div>
      </nav>
    </div>
  );
};

export default Sidebar;
