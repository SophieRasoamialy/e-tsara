import React, { useState, useEffect } from "react";
import axios from "axios";
import Sidebar from "../components/Sidebar";
import { FaSearch, FaPlus } from "react-icons/fa";
import Swal from "sweetalert2";
import ModuleModal from "./moduleModal";
import ListMatiere from "./listMatiere";

function ListModule() {
  const [modules, setModules] = useState([]);
  const [levels, setLevels] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedLevel, setSelectedLevel] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedModule, setSelectedModule] = useState(null);
  const [showSubjects, setShowSubjects] = useState(false);

  // Fetch levels and modules from the server
  const fetchData = async (classId = "") => {
    try {
      const modulesUrl = classId
        ? `http://localhost:8000/api/modules/class/${classId}`
        : "http://localhost:8000/api/modules";

      const [levelsRes, modulesRes] = await Promise.all([
        axios.get("http://localhost:8000/api/classes"),
        axios.get(modulesUrl),
      ]);
      setLevels(levelsRes.data);
      setModules(modulesRes.data);
    } catch (error) {
      console.error("Erreur lors de la récupération des données:", error);
    }
  };

  useEffect(() => {
    fetchData(selectedLevel);
  }, [selectedLevel]);

  // Filter modules based on search term
  const filteredModules = modules.filter((module) =>
    module.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSearch = (event) => {
    setSearchTerm(event.target.value);
  };

  const handleLevelChange = (event) => {
    const levelId = event.target.value;
    setSelectedLevel(levelId);
    setSearchTerm(""); // Clear search term when changing level
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
          await axios.delete(`http://localhost:8000/api/modules/${id}`);
          fetchData(selectedLevel); // Refetch modules with current level filter
          Swal.fire("Supprimé !", "Le module a été supprimé.", "success");
        } catch (error) {
          console.error("Erreur lors de la suppression du module:", error);
          Swal.fire(
            "Erreur",
            "Une erreur s'est produite lors de la suppression du module.",
            "error"
          );
        }
      }
    });
  };

  const handleAddClick = () => {
    setSelectedModule(null);
    setIsModalOpen(true);
  };

  const handleEditClick = (moduleItem) => {
    setSelectedModule(moduleItem);
    setIsModalOpen(true);
  };

  const handleModuleClick = (moduleItem) => {
    setSelectedModule(moduleItem);
    setShowSubjects(true);
  };

  const handleBackToModules = () => {
    setShowSubjects(false);
    setSelectedModule(null);
  };

  return (
    <div className="flex">
      <Sidebar />
      <div className="flex-1 p-8 bg-[#f3fbfa] min-h-screen pl-64">
        {showSubjects && selectedModule ? (
          <>
            <button
              onClick={handleBackToModules}
              className="text-blue-500 hover:underline mb-4"
            >
              &larr; Retour à la liste des modules
            </button>
            <ListMatiere module={selectedModule} />
          </>
        ) : (
          <>
            <div className="flex items-center justify-between mb-6">
              <h1 className="text-3xl font-bold text-gray-800">
                Liste des Modules
              </h1>
              <div className="relative w-1/2">
                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                  <FaSearch className="w-4 h-4 text-gray-500" />
                </div>
                <input
                  type="text"
                  placeholder="Rechercher un module..."
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
                htmlFor="level"
                className="block text-sm font-medium text-gray-700 ml-4 mb-2"
              >
                Sélectionner un niveau
              </label>
              <select
                id="level"
                value={selectedLevel}
                onChange={handleLevelChange}
                className="bg-white border border-gray-300 text-gray-900 text-sm rounded-full focus:ring-[#1f81a9] focus:border-[#1f81a9] block pl-10 p-2.5 scale-105 shadow-lg"
              >
                <option value="">Tous les niveaux</option>
                {levels.map((level) => (
                  <option key={level._id} value={level._id}>
                    {level.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="bg-white shadow-md rounded-lg overflow-hidden">
              <table className="min-w-full bg-white">
                <thead className="bg-gray-100 text-gray-800 uppercase text-sm leading-normal">
                  <tr>
                    <th className="py-3 px-6 text-left">Module</th>
                    <th className="py-3 px-6 text-left">Crédit</th>
                    <th className="py-3 px-6 text-left">Niveau</th>
                    <th className="py-3 px-6 text-left">Actions</th>
                  </tr>
                </thead>
                <tbody className="text-gray-600 text-sm font-light">
                  {filteredModules.length > 0 ? (
                    filteredModules.map((moduleItem) => (
                      <tr
                        key={moduleItem._id}
                        className="border-b border-gray-200 hover:bg-gray-50 cursor-pointer"
                      >
                        <td className="py-3 px-6 text-left whitespace-nowrap">
                          <span onClick={() => handleModuleClick(moduleItem)} className="hover:underline">
                            {moduleItem.name}
                          </span>
                        </td>
                        <td className="py-3 px-6 text-left whitespace-nowrap">
                          {moduleItem.credit}
                        </td>
                        <td className="py-3 px-6 text-left">
                          {moduleItem.class_ids.map((classItem) => (
                            <span
                              key={classItem._id}
                              className="inline-flex items-center px-2 py-1 me-2 text-sm font-medium text-blue-800 bg-blue-100 rounded"
                            >
                              {classItem.name}
                            </span>
                          ))}
                        </td>
                        <td className="py-3 px-6 text-left">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleEditClick(moduleItem);
                            }}
                            className="text-[#1f81a9] hover:text-[#145c73] hover:underline"
                          >
                            Modifier
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDelete(moduleItem._id);
                            }}
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
                        Aucun module trouvé.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {isModalOpen && (
              <ModuleModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                selectedModule={selectedModule}
                fetchModules={() => fetchData(selectedLevel)} // Update to refetch with current filter
              />
            )}
          </>
        )}
      </div>
    </div>
  );
}

export default ListModule;
