import React, { useState, useEffect } from "react";
import axios from "axios";
import Modal from "./modal";
import Sidebar from "../components/Sidebar";
import { FaSearch, FaPlus } from "react-icons/fa";
import Swal from "sweetalert2";
import env from "react-dotenv";

function ListNiveau() {
  const [classes, setClasses] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedClass, setSelectedClass] = useState(null);

  const apiUrl = env.API_URL || "";

  const fetchClasses = async () => {
    try {
      const res = await axios.get(`${apiUrl}/api/classes`);
      setClasses(res.data);
    } catch (error) {
      console.error("Erreur lors de la récupération des classes:", error);
    }
  };

  const handleSearch = async (event) => {
    setSearchTerm(event.target.value);
    if (event.target.value === "") {
      fetchClasses();
    } else {
      try {
        const res = await axios.get(
          `${apiUrl}/api/classes/search/name?query=${event.target.value}`
        );
        setClasses(res.data);
      } catch (error) {
        console.error("Erreur lors de la recherche des classes:", error);
      }
    }
  };

  const handleDelete = async (id) => {
    Swal.fire({
      title: 'Êtes-vous sûr ?',
      text: "Vous ne pourrez pas annuler cette action !",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Oui, supprimer !',
      cancelButtonText: 'Annuler'
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          await axios.delete(`${apiUrl}/api/classes/${id}`);
          fetchClasses();
          Swal.fire(
            'Supprimé !',
            'Le niveau a été supprimé.',
            'success'
          );
        } catch (error) {
          console.error("Erreur lors de la suppression du niveau:", error);
          Swal.fire(
            'Erreur',
            "Une erreur s'est produite lors de la suppression du niveau.",
            'error'
          );
        }
      }
    });
  };

  const handleAddClick = () => {
    setSelectedClass(null);
    setIsModalOpen(true);
  };

  const handleEditClick = (classItem) => {
    setSelectedClass(classItem);
    setIsModalOpen(true);
  };

  useEffect(() => {
    fetchClasses();
  }, []);

  return (
    <div className="flex">
      <Sidebar />
      <div className="flex-1 p-8 bg-[#f3fbfa] min-h-screen pl-64">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold text-gray-800">
            Liste des Niveaux
          </h1>
          <div className="relative w-1/2">
            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
              <FaSearch className="w-4 h-4 text-gray-500" />
            </div>
            <input
              type="text"
              placeholder="Rechercher un niveau..."
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

        <div className="bg-white shadow-md rounded-lg overflow-hidden">
          <table className="min-w-full bg-white">
            <thead className="bg-gray-100 text-gray-800 uppercase text-sm leading-normal">
              <tr>
                <th className="py-3 px-6 text-left">Niveau</th>
                <th className="py-3 px-6 text-left">Actions</th>
              </tr>
            </thead>
            <tbody className="text-gray-600 text-sm font-light">
              {classes.length > 0 ? (
                classes.map((classItem) => (
                  <tr
                    key={classItem._id}
                    className="border-b border-gray-200 hover:bg-gray-50"
                  >
                    <td className="py-3 px-6 text-left whitespace-nowrap">
                      {classItem.name}
                    </td>
                    <td className="py-3 px-6 text-left">
                      <button
                        onClick={() => handleEditClick(classItem)}
                        className="text-[#1f81a9] hover:text-[#145c73] hover:underline"
                      >
                        Modifier
                      </button>
                      <button
                        onClick={() => handleDelete(classItem._id)}
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
                    colSpan="2"
                    className="py-3 px-6 text-center text-gray-500"
                  >
                    Aucun niveau trouvé.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {isModalOpen && (
          <Modal
            isOpen={isModalOpen}
            onClose={() => setIsModalOpen(false)}
            selectedClass={selectedClass}
            fetchClasses={fetchClasses}
          />
        )}
      </div>
    </div>
  );
}

export default ListNiveau;
