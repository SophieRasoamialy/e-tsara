import React, { useState, useEffect } from "react";
import axios from "axios";
import Swal from "sweetalert2";
import { FaTimes } from "react-icons/fa";
import env from "react-dotenv";

function ModuleModal({ isOpen, onClose, selectedModule, fetchModules }) {
  const [name, setName] = useState("");
  const [credit, setCredit] = useState("");
  const [selectedLevels, setSelectedLevels] = useState([]);
  const [levels, setLevels] = useState([]);

  const apiUrl = env.API_URL || "";

  useEffect(() => {
    const fetchLevels = async () => {
      try {
        const res = await axios.get(`${apiUrl}/api/classes`);
        setLevels(res.data);
      } catch (error) {
        console.error("Erreur lors de la récupération des niveaux:", error);
      }
    };

    fetchLevels();

    if (selectedModule) {
      setName(selectedModule.name);
      setCredit(selectedModule.credit);
      setSelectedLevels(selectedModule.class_ids.map(level => level._id));
      } else {
      setName("");
      setCredit("");
      setSelectedLevels([]);
    }
  }, [selectedModule]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    const moduleData = { name, credit, class_ids: selectedLevels };

    try {
      if (selectedModule) {
        await axios.put(`${apiUrl}/api/modules/${selectedModule._id}`, moduleData);
        Swal.fire("Modifié !", "Le module a été modifié.", "success");
      } else {
        await axios.post(`${apiUrl}/api/modules`, moduleData);
        Swal.fire("Créé !", "Le module a été créé.", "success");
      }
      fetchModules();
      onClose();
    } catch (error) {
      console.error("Erreur lors de la sauvegarde du module:", error);
      Swal.fire("Erreur", "Une erreur s'est produite lors de la sauvegarde du module.", "error");
    }
  };

  const handleLevelChange = (levelId) => {
    if (selectedLevels.includes(levelId)) {
      setSelectedLevels(selectedLevels.filter(id => id !== levelId));
    } else {
      setSelectedLevels([...selectedLevels, levelId]);
    }
  };

  const handleRemoveLevel = (levelId) => {
    setSelectedLevels(selectedLevels.filter((id) => id !== levelId));
  };

  return (
    isOpen && (
      <div className="fixed inset-0 flex items-center justify-center bg-gray-500 bg-opacity-75">
        <div className="bg-white p-6 rounded-lg shadow-lg w-1/3">
          <h2 className="text-lg font-bold mb-4">
            {selectedModule ? "Modifier le Module" : "Créer un Module"}
          </h2>
          <form onSubmit={handleSubmit}>
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700">Nom</label>
              <input
                id="name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="ps-10 bg-white border border-gray-300 text-gray-900 text-sm rounded-full focus:ring-[#1f81a9] focus:border-[#1f81a9] block pl-10 p-3 shadow-lg w-full"
                required
              />
            </div>
            <div className="mt-4">
              <label htmlFor="credit" className="block text-sm font-medium text-gray-700">Crédit</label>
              <input
                id="credit"
                type="number"
                value={credit}
                onChange={(e) => setCredit(e.target.value)}
                className="ps-10 bg-white border border-gray-300 text-gray-900 text-sm rounded-full focus:ring-[#1f81a9] focus:border-[#1f81a9] block pl-10 p-3 shadow-lg w-full"
                required
              />
            </div>
            <div className="mt-4">
              <label className="block text-sm font-medium text-gray-700">Niveaux</label>
              <div className="flex flex-wrap gap-2">
                {levels.map((lvl) => (
                  <div key={lvl._id} className="flex items-center">
                    <input
                      id={lvl._id}
                      type="checkbox"
                      checked={selectedLevels.includes(lvl._id)}
                      onChange={() => handleLevelChange(lvl._id)}
                      className="mr-2"
                    />
                    <label htmlFor={lvl._id} className="text-sm text-gray-700">{lvl.name}</label>
                  </div>
                ))}
              </div>
            </div>
            <div className="mt-4 flex flex-wrap gap-2">
              {selectedLevels.map((levelId) => {
                const level = levels.find(lvl => lvl._id === levelId);
                return (
                  <span
                    key={levelId}
                    className="inline-flex items-center px-2 py-1 text-sm font-medium text-blue-800 bg-blue-100 rounded-full"
                  >
                    {level ? level.name : "Niveau inconnu"}
                    <button
                      type="button"
                      onClick={() => handleRemoveLevel(levelId)}
                      className=" inline-flex items-center p-1 ms-2 text-sm text-blue-400 bg-transparent rounded-sm hover:bg-blue-200 hover:text-blue-900 "
                      aria-label="Remove"
                    >
                      <FaTimes className="w-4 h-4"/>
                      <span className="sr-only">Remove badge</span>
                    </button>
                  </span>
                );
              })}
            </div>
            <div className="flex gap-4 mt-4 justify-end">
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
                {selectedModule ? "Modifier" : "Créer"}
              </button>
            </div>
          </form>
        </div>
      </div>
    )
  );
}

export default ModuleModal;
