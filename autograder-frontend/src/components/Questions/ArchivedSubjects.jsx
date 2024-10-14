import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import { ChevronRight, ChevronLeft } from "lucide-react";

const ArchivedSubjects = () => {
  const levels = [
    { id: 1, name: "Niveau 1" },
    { id: 2, name: "Niveau 2" },
    { id: 3, name: "Niveau 3" },
  ];

  const archivedSubjects = [
    { id: 4, matiere: "Biologie", examDate: "2023-06-15", level: 1 },
    { id: 5, matiere: "Histoire", examDate: "2023-05-20", level: 2 },
    { id: 6, matiere: "Géographie", examDate: "2023-04-10", level: 3 },
    // Ajoutez plus de sujets archivés pour tester la pagination
  ];

  const [selectedLevel, setSelectedLevel] = useState("");
  const [filteredArchivedSubjects, setFilteredArchivedSubjects] = useState([]);
  const [selectedLevelName, setSelectedLevelName] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const subjectsPerPage = 2;

  useEffect(() => {
    if (selectedLevel) {
      const filteredSubjects = archivedSubjects.filter(
        (subject) => subject.level === parseInt(selectedLevel)
      );
      setFilteredArchivedSubjects(filteredSubjects);
      const level = levels.find(level => level.id === parseInt(selectedLevel));
      setSelectedLevelName(level ? level.name : "");
      setCurrentPage(1); 
    } else {
      setFilteredArchivedSubjects([]);
      setSelectedLevelName("");
    }
  }, [selectedLevel]);

  // Calculate current subjects to display
  const indexOfLastSubject = currentPage * subjectsPerPage;
  const indexOfFirstSubject = indexOfLastSubject - subjectsPerPage;
  const currentSubjects = filteredArchivedSubjects.slice(indexOfFirstSubject, indexOfLastSubject);

  // Calculate total pages
  const totalPages = Math.ceil(filteredArchivedSubjects.length / subjectsPerPage);

  return (
    <div className="flex">
      <Sidebar />
      <div className="flex-1 p-8 bg-[#f3fbfa] min-h-screen pl-64">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold text-gray-800">
            Archives des Sujets d'Examens
          </h1>
          <Link
            to="/"
             className="text-white bg-[#1f81a9] hover:bg-[#145c73] focus:outline-none focus:ring-4 focus:ring-[#1f81a9] font-medium rounded-full text-sm px-5 py-2.5 text-center mb-2 "
          >
            Retour
          </Link>
        </div>

        <div className="flex items-center justify-between mb-6">
          <select
            id="level-select"
            value={selectedLevel}
            onChange={(e) => setSelectedLevel(e.target.value)}
            className="bg-white border border-gray-300 text-gray-900 text-sm rounded-full focus:ring-[#1f81a9] focus:border-[#1f81a9] block pl-10 p-2.5 scale-105 shadow-lg"
          >
            <option value="">-- Sélectionnez un niveau --</option>
            {levels.map((level) => (
              <option key={level.id} value={level.id}>
                {level.name}
              </option>
            ))}
          </select>
        </div>

        <div className="bg-white shadow-md rounded-lg overflow-hidden">
          <div className="p-4 flex justify-between items-center border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-800">
              {selectedLevelName ? `Sujets Archivés Pour ${selectedLevelName}` : "Sujets Archivés"}
            </h2>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full bg-white">
              <thead className="bg-gray-200 text-gray-600 uppercase text-sm leading-normal">
                <tr>
                  <th className="py-3 px-6 text-left">Matière</th>
                  <th className="py-3 px-6 text-left">Date d'Examen</th>
                  <th className="py-3 px-6 text-left">Action</th>
                </tr>
              </thead>
              <tbody className="text-gray-600 text-sm font-light">
                {currentSubjects.length > 0 ? (
                  currentSubjects.map((subject) => (
                    <tr
                      key={subject.id}
                      className="border-b border-gray-200 hover:bg-gray-100"
                    >
                      <td className="py-3 px-6 text-left whitespace-nowrap">
                        {subject.matiere}
                      </td>
                      <td className="py-3 px-6 text-left">
                        {new Date(subject.examDate).toLocaleDateString()}
                      </td>
                      <td className="py-3 px-6 text-left">
                        <Link
                          to={`/sujet/${subject.id}`}
                          className="text-[#1f81a9] hover:text-[#145c73] hover:underline"
                        >
                          Voir les détails
                        </Link>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="3" className="py-3 px-6 text-center text-gray-500">
                      Aucun sujet d'examen archivé trouvé pour ce niveau.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {filteredArchivedSubjects.length > 0 && (
          <div className="flex items-center justify-center mt-4">
            <button
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              className="text-[#1f81a9] hover:text-[#145c73]"
              disabled={currentPage === 1}
            >
              <ChevronLeft/>
            </button>
            <span className="text-gray-700">
              Page {currentPage} sur {totalPages}
            </span>
            <button
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
              className="text-[#1f81a9] hover:text-[#145c73]"
              disabled={currentPage === totalPages}
            >
              <ChevronRight/>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ArchivedSubjects;
