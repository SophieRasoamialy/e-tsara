import React, { useState, useEffect } from "react";
import axios from "axios";
import env from "react-dotenv";

function Modal({ isOpen, onClose, selectedClass, fetchClasses }) {
  const [name, setName] = useState("");

  const apiUrl = env.API_URL || "";

  useEffect(() => {
    if (selectedClass) {
      setName(selectedClass.name);
    } else {
      setName("");
    }
  }, [selectedClass]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    try {
      if (selectedClass) {
        await axios.put(`${apiUrl}/api/classes/${selectedClass._id}`, { name });
      } else {
        await axios.post(`${apiUrl}/api/classes`, { name });
      }
      fetchClasses();
      onClose();
    } catch (error) {
      console.error("Erreur lors de la soumission du formulaire:", error);
    }
  };

  return (
    <div
      className={`fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center ${
        isOpen ? "" : "hidden"
      }`}
    >
      <div className="bg-white p-6 rounded-lg shadow-lg w-1/3">
        <h2 className="text-lg font-semibold mb-4">
          {selectedClass ? "Modifier Niveau" : "Ajouter Niveau"}
        </h2>
        <form onSubmit={handleSubmit}>
          <div className="mb-6">
            <input
              type="text"
              placeholder="Nom du niveau"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="bg-white border border-gray-300 text-gray-900 text-sm rounded-full focus:ring-[#1f81a9] focus:border-[#1f81a9] block w-full p-3 pl-4 shadow-lg"
              required
            />
          </div>
          <div className="flex justify-end space-x-4">
            <button
              type="button"
              onClick={onClose}
              className="text-white bg-gray-500 hover:bg-gray-600 focus:outline-none focus:ring-4  font-medium rounded-full text-sm px-5 py-2.5"
            >
              Annuler
            </button>
            <button
              type="submit"
              className="text-white bg-[#1f81a9] hover:bg-[#145c73] focus:outline-none focus:ring-4 focus:ring-[#1f81a9] font-medium rounded-full text-sm px-5 py-2.5"
            >
              {selectedClass ? "Modifier" : "Ajouter"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default Modal;
