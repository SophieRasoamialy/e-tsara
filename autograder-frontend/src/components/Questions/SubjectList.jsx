import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import Cookies from "js-cookie";
import axios from "axios";

const SubjectList = () => {
  const [levels, setLevels] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [selectedLevels, setSelectedLevels] = useState([]);
  const [loadingSubjects, setLoadingSubjects] = useState(false);
  const [noSubjects, setNoSubjects] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    fetchLevels();
    if (selectedLevels.length > 0) {
      fetchSubjects(selectedLevels);
    } else {
      setSubjects([]);
    }
  }, [selectedLevels]);

  const fetchLevels = async () => {
    try {
      const token = Cookies.get("token");
      const response = await axios.get(
        "http://localhost:8000/api/matieres/me/classes",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setLevels(response.data);
    } catch (error) {
      console.error("Erreur lors de la récupération des niveaux :", error);
    }
  };

  const fetchSubjects = async (levelIds) => {
    // Réinitialiser les états avant de lancer la nouvelle demande
    setLoadingSubjects(true);
    setNoSubjects(false);
    setSubjects([]);

    try {
      const token = Cookies.get("token");
      const response = await axios.get(
        `http://localhost:8000/api/exams/level/${levelIds.join(",")}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = response.data;
      if (data.length === 0) {
        setNoSubjects(true);
      } else {
        setSubjects(data);
      }
    } catch (error) {
      if (error.response && error.response.status === 404) {
        setNoSubjects(true);
      } else {
        console.error("Erreur lors de la récupération des matières :", error);
      }
    } finally {
      setLoadingSubjects(false);
    }
  };

  const handleLevelChange = (levelId) => {
    const updatedSelectedLevels = selectedLevels.includes(levelId)
      ? selectedLevels.filter((id) => id !== levelId)
      : [...selectedLevels, levelId];

    setSelectedLevels(updatedSelectedLevels);
    if (updatedSelectedLevels.length > 0) {
      fetchSubjects(updatedSelectedLevels);
    } else {
      setSubjects([]);
      setNoSubjects(false);
    }
  };

  const handleRemoveLevel = (levelId) => {
    const updatedSelectedLevels = selectedLevels.filter((id) => id !== levelId);
    setSelectedLevels(updatedSelectedLevels);
    if (updatedSelectedLevels.length > 0) {
      fetchSubjects(updatedSelectedLevels);
    } else {
      setSubjects([]);
      setNoSubjects(false);
    }
  };

  const handleNewExamClick = () => {
    navigate("/create-exam");
  };

  return (
    <div className="flex">
      <Sidebar />
      <div className="flex-1 p-8 bg-[#f3fbfa] min-h-screen pl-64">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold text-gray-800">Liste des Sujets</h1>
          <div className="flex flex-wrap gap-2">
            {levels.map((level) => (
              <div key={level._id} className="flex items-center">
                <input
                  id={level._id}
                  type="checkbox"
                  checked={selectedLevels.includes(level._id)}
                  onChange={() => handleLevelChange(level._id)}
                  className="mr-2"
                />
                <label htmlFor={level._id} className="text-sm text-gray-700">
                  {level.name}
                </label>
              </div>
            ))}
          </div>
          <div className="mt-4 flex flex-wrap gap-2">
            {selectedLevels.map((levelId) => {
              const level = levels.find((lvl) => lvl._id === levelId);
              return (
                <span
                  key={levelId}
                  className="inline-flex items-center px-2 py-1 text-sm font-medium text-blue-800 bg-blue-100 rounded-full"
                >
                  {level ? level.name : "Niveau inconnu"}
                  <button
                    type="button"
                    onClick={() => handleRemoveLevel(levelId)}
                    className="inline-flex items-center p-1 ms-2 text-sm text-blue-400 bg-transparent rounded-sm hover:bg-blue-200 hover:text-blue-900"
                    aria-label="Remove"
                  >
                    &times;
                  </button>
                </span>
              );
            })}
          </div>
        </div>

        <div className="bg-white shadow-md rounded-lg overflow-hidden">
          <div className="p-4 flex justify-between items-center border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-800">
              {selectedLevels.length > 0
                ? `Sujets d'Examens`
                : "Sélectionnez un niveau pour voir les sujets d'examens"}
            </h2>
            <div>
              <button
                onClick={handleNewExamClick}
                className="text-white bg-[#1f81a9] hover:bg-[#145c73] focus:outline-none focus:ring-4 focus:ring-[#1f81a9] font-medium rounded-full text-sm px-5 py-2.5 text-center mb-2 w-full"
              >
                Nouvel Examen
              </button>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full bg-white">
              <thead className="bg-gray-100 text-gray-800 uppercase text-sm leading-normal">
                <tr>
                  <th className="py-3 px-6 text-left">Matière</th>
                  <th className="py-3 px-6 text-left">Session</th>
                  <th className="py-3 px-6 text-left">Semestre</th>
                  <th className="py-3 px-6 text-left">Niveau</th>
                  <th className="py-3 px-6 text-left">Année Universitaire</th>
                  <th className="py-3 px-6 text-left">Action</th>
                </tr>
              </thead>
              <tbody className="text-gray-600 text-sm font-light">
                {subjects.length > 0 ? (
                  subjects.map((subject) => (
                    <tr
                      key={subject._id}
                      className="border-b border-gray-200 hover:bg-gray-50"
                    >
                      <td className="py-3 px-6 text-left whitespace-nowrap">
                        {subject.subject_id.name}
                      </td>
                      <td className="py-3 px-6 text-left">{subject.session}</td>
                      <td className="py-3 px-6 text-left">
                        {subject.semestre}
                      </td>
                      <td className="py-3 px-6 text-left">
                        {subject.class_ids.map((classItem) => (
                          <div key={classItem._id}>{classItem.name}</div>
                        ))}
                      </td>
                      <td className="py-3 px-6 text-left">
                        {subject.academicYear}
                      </td>
                      <td className="py-3 px-6 text-left">
                        <Link
                          to={`/sujet/${subject._id}`}
                          className=" text-[#1f81a9] hover:text-[#145c73] hover:underline"
                        >
                          Voir les détails
                        </Link>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td
                      colSpan="5"
                      className="py-3 px-6 text-center text-gray-500"
                    >
                      {noSubjects
                        ? "Aucun sujet d'examen trouvé pour ces niveaux."
                        : "Sélectionnez un niveau pour afficher les sujets."}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className="bg-white shadow-md rounded-lg overflow-hidden mt-8">
          <div className="p-4 flex justify-between items-center border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-800">
              Archives des Sujets d'Examens
            </h2>
            <Link
              to="/archived-subjects"
              className="text-white bg-gray-500 hover:bg-gray-600 focus:outline-none focus:ring-4 font-medium rounded-full text-sm px-5 py-2.5 text-center mb-2"
            >
              Voir les Archives
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SubjectList;
