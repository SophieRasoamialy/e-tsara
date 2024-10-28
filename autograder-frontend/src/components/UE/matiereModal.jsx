import React, { useState, useEffect } from "react";
import axios from "axios";
import { FaTimes } from "react-icons/fa";
import env from "react-dotenv";

function SubjectModal({ isOpen, onClose, moduleId, selectedSubject, fetchSubjects }) {
  const [name, setName] = useState("");
  const [coeff, setCoeff] = useState("");
  const [professorId, setProfessorId] = useState("");
  const [professors, setProfessors] = useState([]);

  const apiUrl = env.API_URL || "";
  
  useEffect(() => {
    if (selectedSubject) {
      setName(selectedSubject.name);
      setCoeff(selectedSubject.coeff);
      setProfessorId(selectedSubject.teacher_id);
    } else {
      setName("");
      setCoeff("");
      setProfessorId("");
    }
  }, [selectedSubject]);

  useEffect(() => {
    const fetchProfessors = async () => {
      try {
        const response = await axios.get(`${apiUrl}/api/users/role/66b44551ac5a7298232da495`); // URL modifiée pour correspondre à votre API
        setProfessors(response.data);
      } catch (error) {
        console.error("Erreur lors de la récupération des professeurs:", error);
      }
    };

    fetchProfessors();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const subjectData = { name, coeff, teacher_id: professorId, module_id: moduleId };
      if (selectedSubject) {
        // Update existing subject
        await axios.put(`${apiUrl}/api/matieres/${selectedSubject._id}`, subjectData);
      } else {
        // Add new subject
        await axios.post(`${apiUrl}/api/matieres`, subjectData);
      }
      fetchSubjects(); // Refresh the subject list after adding/updating
      onClose(); // Close the modal
    } catch (error) {
      console.error("Erreur lors de l'enregistrement de la matière:", error);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white rounded-lg p-6 w-1/3">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">{selectedSubject ? "Modifier la matière" : "Ajouter une matière"}</h2>
          <button onClick={onClose}>
            <FaTimes className="text-gray-500 hover:text-gray-700" />
          </button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label htmlFor="name" className="block text-sm font-medium text-gray-700">Nom de la matière</label>
            <input
              type="text"
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="ps-10 bg-white border border-gray-300 text-gray-900 text-sm rounded-full focus:ring-[#1f81a9] focus:border-[#1f81a9] block pl-10 p-3 shadow-lg w-full"
              required
            />
          </div>
          <div className="mb-4">
            <label htmlFor="coeff" className="block text-sm font-medium text-gray-700">Coefficient</label>
            <input
              type="number"
              id="coeff"
              value={coeff}
              onChange={(e) => setCoeff(e.target.value)}
              className="ps-10 bg-white border border-gray-300 text-gray-900 text-sm rounded-full focus:ring-[#1f81a9] focus:border-[#1f81a9] block pl-10 p-3 shadow-lg w-full"
              required
            />
          </div>
          <div className="mb-4">
            <label htmlFor="professor" className="block text-sm font-medium text-gray-700">Professeur responsable</label>
            <select
              id="professor"
              value={professorId}
              onChange={(e) => setProfessorId(e.target.value)}
              className="bg-white border border-gray-300 text-gray-900 text-sm rounded-full focus:ring-[#1f81a9] focus:border-[#1f81a9] block w-full p-2.5 shadow-lg"
              required
            >
              <option value="">Sélectionnez un professeur</option>
              {professors.map((prof) => (
                <option key={prof._id} value={prof._id}>
                  {prof.name}
                </option>
              ))}
            </select>
          </div>
          <div className="flex justify-end">
            <button
              type="button"
              onClick={onClose}
              className="bg-gray-500 text-white px-4 py-2 rounded-full hover:bg-gray-600"
            >
              Annuler
            </button>
            <button
              type="submit"
              className="ml-2 bg-[#1f81a9] text-white px-4 py-2 rounded-full hover:bg-[#145c73]"
            >
              {selectedSubject ? "Modifier" : "Ajouter"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default SubjectModal;
