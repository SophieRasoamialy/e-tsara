import React, { useState, useEffect } from "react";
import axios from "axios";
import { FaPlus } from "react-icons/fa";
import Swal from "sweetalert2";
import SubjectModal from "./matiereModal";
import env from "react-dotenv";

function ListMatiere({ module }) {
  const [subjects, setSubjects] = useState([]);
  const [isSubjectModalOpen, setIsSubjectModalOpen] = useState(false);
  const [selectedSubject, setSelectedSubject] = useState(null);

  const apiUrl = env.API_URL || "";

  // Fetch subjects when the module changes
  useEffect(() => {
    fetchSubjects(module._id);
  }, [module]);

  const fetchSubjects = async (moduleId) => {
    try {
      const response = await axios.get(
        `${apiUrl}/api/matieres/module/${moduleId}`
      );
      setSubjects(response.data);
    } catch (error) {
      console.error("Erreur lors de la récupération des matières:", error);
    }
  };

  const handleAddSubject = () => {
    setSelectedSubject(null);
    setIsSubjectModalOpen(true);
  };

  const handleEditSubject = (subject) => {
    setSelectedSubject(subject);
    setIsSubjectModalOpen(true);
  };

  const handleDeleteSubject = async (id) => {
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
          await axios.delete(`${apiUrl}/api/matieres/${id}`);
          fetchSubjects(module._id); // Refetch subjects with current module
          Swal.fire("Supprimé !", "La matière a été supprimée.", "success");
        } catch (error) {
          console.error("Erreur lors de la suppression de la matière:", error);
          Swal.fire(
            "Erreur",
            "Une erreur s'est produite lors de la suppression de la matière.",
            "error"
          );
        }
      }
    });
  };

  return (
    <div className="bg-white shadow-md rounded-lg overflow-hidden mt-8">
      <h2 className="text-xl font-bold text-gray-800 mb-4 px-6 pt-4">
        Matières pour le module: {module.name}
      </h2>
      <table className="min-w-full bg-white">
        <thead className="bg-gray-100 text-gray-800 uppercase text-sm leading-normal">
          <tr>
            <th className="py-3 px-6 text-left">Matière</th>
            <th className="py-3 px-6 text-left">Coeff</th>
            <th className="py-3 px-6 text-left">Professeur Responsable</th>
            <th className="py-3 px-6 text-left">Actions</th>
          </tr>
        </thead>
        <tbody className="text-gray-600 text-sm font-light">
          {subjects.map((subject) => (
            <tr
              key={subject._id}
              className="border-b border-gray-200 hover:bg-gray-50"
            >
              <td className="py-3 px-6 text-left whitespace-nowrap">
                {subject.name}
              </td>
              <td className="py-3 px-6 text-left whitespace-nowrap">
                {subject.coeff}
              </td>
              <td className="py-3 px-6 text-left whitespace-nowrap">
                {subject.teacher_id.name}
              </td>
              <td className="py-3 px-6 text-left">
                <button
                  onClick={() => handleEditSubject(subject)}
                  className="text-[#1f81a9] hover:text-[#145c73] hover:underline"
                >
                  Modifier
                </button>
                <button
                  onClick={() => handleDeleteSubject(subject._id)}
                  className="ml-4 text-red-600 hover:text-red-800 hover:underline"
                >
                  Supprimer
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <button
        onClick={handleAddSubject}
        className="flex text-white bg-[#1f81a9] hover:bg-[#145c73] focus:outline-none focus:ring-4 focus:ring-[#1f81a9] font-medium rounded-full text-sm px-5 py-3 text-center m-6"
      >
        <FaPlus className="w-4 h-4 mr-1" /> <span>Ajouter une Matière</span>
      </button>

      {isSubjectModalOpen && (
        <SubjectModal
          isOpen={isSubjectModalOpen}
          onClose={() => setIsSubjectModalOpen(false)}
          moduleId={module._id}
          selectedSubject={selectedSubject}
          fetchSubjects={() => fetchSubjects(module._id)} 

        />
      )}
    </div>
  );
}

export default ListMatiere;
