import React, { useState, useEffect } from "react";
import axios from "axios";

function StudentModal({ isOpen, onClose, selectedStudent, fetchStudents }) {
  const [matricule, setMatricule] = useState("");
  const [name, setName] = useState("");
  const [classId, setClassId] = useState("");

  useEffect(() => {
    if (selectedStudent) {
      setMatricule(selectedStudent.matricule);
      setName(selectedStudent.name);
      setClassId(selectedStudent.class_id);
    } else {
      setMatricule("");
      setName("");
      setClassId("");
    }
  }, [selectedStudent]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    try {
      if (selectedStudent) {
        // Mise à jour de l'étudiant
        await axios.put(`http://localhost:8000/api/etudiants/${selectedStudent._id}`, { matricule, name, class_id: classId });
      } else {
        // Création d'un nouvel étudiant
        await axios.post("http://localhost:8000/api/etudiants", { matricule, name, class_id: classId });
      }
      fetchStudents();
      onClose();
    } catch (error) {
      console.error("Erreur lors de la soumission du formulaire:", error);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-lg shadow-lg w-1/3">
        <h2 className="text-lg font-semibold mb-4">
          {selectedStudent ? "Modifier Étudiant" : "Ajouter Étudiant"}
        </h2>
        <form onSubmit={handleSubmit}>
          <div className="mb-6">
            <input
              type="text"
              placeholder="Matricule de l'étudiant"
              value={matricule}
              onChange={(e) => setMatricule(e.target.value)}
              className="bg-white border border-gray-300 text-gray-900 text-sm rounded-full focus:ring-[#1f81a9] focus:border-[#1f81a9] block w-full p-3 pl-4 shadow-lg"
              required
            />
          </div>
          <div className="mb-6">
            <input
              type="text"
              placeholder="Nom de l'étudiant"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="bg-white border border-gray-300 text-gray-900 text-sm rounded-full focus:ring-[#1f81a9] focus:border-[#1f81a9] block w-full p-3 pl-4 shadow-lg"
              required
            />
          </div>
          <div className="mb-6">
            <input
              type="text"
              placeholder="ID de la classe"
              value={classId}
              onChange={(e) => setClassId(e.target.value)}
              className="bg-white border border-gray-300 text-gray-900 text-sm rounded-full focus:ring-[#1f81a9] focus:border-[#1f81a9] block w-full p-3 pl-4 shadow-lg"
              required
            />
          </div>
          <div className="flex justify-end space-x-4">
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
              {selectedStudent ? "Modifier" : "Ajouter"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default StudentModal;
