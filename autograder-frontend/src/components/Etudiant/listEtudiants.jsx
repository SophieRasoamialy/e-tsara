import React, { useState, useEffect } from "react";
import axios from "axios";
import Sidebar from "../components/Sidebar";
import { FaSearch, FaPlus, FaFileExport, FaFileImport } from "react-icons/fa";
import Swal from "sweetalert2";
import Modal from "./modal";
import DetailEtudiant from "./detailEtudiant";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import * as XLSX from "xlsx";

function ListEtudiant() {
  const [etudiants, setEtudiants] = useState([]);
  const [classes, setClasses] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedClass, setSelectedClass] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedEtudiant, setSelectedEtudiant] = useState(null);
  const [showDetails, setShowDetails] = useState(false);
  const [file, setFile] = useState(null);

  // Fetch classes and students from the server
  const fetchData = async (classId = "") => {
    try {
      const etudiantsUrl = classId
        ? `http://localhost:8000/api/etudiants/class/${classId}`
        : "http://localhost:8000/api/etudiants";

      const [classesRes, etudiantsRes] = await Promise.all([
        axios.get("http://localhost:8000/api/classes"),
        axios.get(etudiantsUrl),
      ]);
      setClasses(classesRes.data);
      setEtudiants(etudiantsRes.data);
    } catch (error) {
      console.error("Erreur lors de la récupération des données:", error);
    }
  };

  useEffect(() => {
    fetchData(selectedClass);
  }, [selectedClass]);

  // Filter students based on search term
  const filteredEtudiants = etudiants.filter(
    (etudiant) =>
      etudiant.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      etudiant.matricule.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSearch = (event) => {
    setSearchTerm(event.target.value);
  };

  const handleClassChange = (event) => {
    const classId = event.target.value;
    setSelectedClass(classId);
    setSearchTerm(""); // Clear search term when changing class
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
          await axios.delete(`http://localhost:8000/api/etudiants/${id}`);
          fetchData(selectedClass); // Refetch students with current class filter
          Swal.fire("Supprimé !", "L'étudiant a été supprimé.", "success");
        } catch (error) {
          console.error("Erreur lors de la suppression de l'étudiant:", error);
          Swal.fire(
            "Erreur",
            "Une erreur s'est produite lors de la suppression de l'étudiant.",
            "error"
          );
        }
      }
    });
  };

  const handleAddClick = () => {
    setSelectedEtudiant(null);
    setIsModalOpen(true);
  };

  const handleEditClick = (etudiant) => {
    setSelectedEtudiant(etudiant);
    setIsModalOpen(true);
  };

  const handleEtudiantClick = (etudiant) => {
    setSelectedEtudiant(etudiant);
    setShowDetails(true);
  };

  const handleBackToEtudiants = () => {
    setShowDetails(false);
    setSelectedEtudiant(null);
  };

  const handleExportPDF = () => {
    const doc = new jsPDF();
    autoTable(doc, {
      head: [["Matricule", "Nom"]],
      body: filteredEtudiants.map((e) => [e.matricule, e.name]),
    });
    doc.save("etudiants.pdf");
  };

  const handleFileChange = (event) => {
    setFile(event.target.files[0]);
  };

  const handleImport = async () => {
    if (!file) {
      Swal.fire("Erreur", "Veuillez sélectionner un fichier Excel.", "error");
      return;
    }

    const reader = new FileReader();
    reader.onload = async (e) => {
      const data = new Uint8Array(e.target.result);
      const workbook = XLSX.read(data, { type: "array" });
      const sheet = workbook.Sheets[workbook.SheetNames[0]];
      const jsonData = XLSX.utils.sheet_to_json(sheet);

      // Ajouter le niveau (classe) aux données
      const studentsWithClass = jsonData.map((student) => ({
        ...student,
        class_id: selectedClass, // Assurez-vous que `selectedClass` est défini dans votre composant
      }));

      try {
        await axios.post(
          "http://localhost:8000/api/etudiants/import",
          studentsWithClass
        );
        fetchData(selectedClass); // Refetch students with current class filter
        Swal.fire("Succès", "Les étudiants ont été importés.", "success");
      } catch (error) {
        console.error("Erreur lors de l'importation des étudiants:", error);
        Swal.fire(
          "Erreur",
          "Une erreur s'est produite lors de l'importation.",
          "error"
        );
      }
    };
    reader.readAsArrayBuffer(file);
  };

  return (
    <div className="flex">
      <Sidebar />
      <div className="flex-1 p-8 bg-[#f3fbfa] min-h-screen pl-64">
        {showDetails && selectedEtudiant ? (
          <>
            <button
              onClick={handleBackToEtudiants}
              className="text-blue-500 hover:underline mb-4"
            >
              &larr; Retour à la liste des étudiants
            </button>
            <DetailEtudiant etudiant={selectedEtudiant} />
          </>
        ) : (
          <>
            <div className="flex items-center justify-between mb-6">
              <h1 className="text-3xl font-bold text-gray-800">
                Liste des Étudiants
              </h1>
              <div className="relative w-1/2 flex items-center">
                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                  <FaSearch className="w-4 h-4 text-gray-500" />
                </div>
                <input
                  type="text"
                  placeholder="Rechercher un étudiant..."
                  value={searchTerm}
                  onChange={handleSearch}
                  className="ps-10 bg-white border border-gray-300 text-gray-900 text-sm rounded-full focus:ring-[#1f81a9] focus:border-[#1f81a9] block pl-10 p-3 shadow-lg w-full"
                />
              </div>
              <div className="flex space-x-4">
                <button
                  onClick={handleAddClick}
                  className="flex text-white bg-[#1f81a9] hover:bg-[#145c73] focus:outline-none focus:ring-4 focus:ring-[#1f81a9] font-medium rounded-full text-sm px-5 py-3 text-center mb-2"
                >
                  <FaPlus className="w-4 h-4 mr-1" /> <span>Nouveau</span>
                </button>
                <button
                  onClick={handleExportPDF}
                  className="flex text-white bg-[#1f81a9] hover:bg-[#145c73] focus:outline-none focus:ring-4 focus:ring-[#1f81a9] font-medium rounded-full text-sm px-5 py-3 text-center mb-2"
                >
                  <FaFileExport className="w-4 h-4 mr-1" />{" "}
                  <span>Exporter PDF</span>
                </button>
                <label className="flex text-white bg-[#1f81a9] hover:bg-[#145c73] focus:outline-none focus:ring-4 focus:ring-[#1f81a9] font-medium rounded-full text-sm px-5 py-3 text-center mb-2 cursor-pointer">
                  <FaFileImport className="w-4 h-4 mr-1" />{" "}
                  <span>Importer Excel</span>
                  <input
                    type="file"
                    accept=".xlsx"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                </label>
                <button
                  onClick={handleImport}
                  className="text-white bg-[#1f81a9] hover:bg-[#145c73] focus:outline-none focus:ring-4 focus:ring-[#1f81a9] font-medium rounded-full text-sm px-5 py-3 text-center mb-2"
                >
                  Importer
                </button>
              </div>
            </div>

            <div className="mb-6">
              <label
                htmlFor="class"
                className="block text-sm font-medium text-gray-700 ml-4 mb-2"
              >
                Sélectionner une classe
              </label>
              <select
                id="class"
                value={selectedClass}
                onChange={handleClassChange}
                className="bg-white border border-gray-300 text-gray-900 text-sm rounded-full focus:ring-[#1f81a9] focus:border-[#1f81a9] block pl-10 p-2.5 scale-105 shadow-lg"
              >
                <option value="">Toutes les classes</option>
                {classes.map((classItem) => (
                  <option key={classItem._id} value={classItem._id}>
                    {classItem.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="bg-white shadow-md rounded-lg overflow-hidden">
              <table className="min-w-full bg-white">
                <thead className="bg-gray-100 text-gray-800 uppercase text-sm leading-normal">
                  <tr>
                    <th className="py-3 px-6 text-left">Matricule</th>
                    <th className="py-3 px-6 text-left">Nom</th>
                    <th className="py-3 px-6 text-left">Actions</th>
                  </tr>
                </thead>
                <tbody className="text-gray-600 text-sm font-light">
                  {filteredEtudiants.length > 0 ? (
                    filteredEtudiants.map((etudiant) => (
                      <tr
                        key={etudiant._id}
                        className="border-b border-gray-200 hover:bg-gray-50 cursor-pointer"
                      >
                        <td className="py-3 px-6 text-left whitespace-nowrap">
                          <span
                            onClick={() => handleEtudiantClick(etudiant)}
                            className="hover:underline"
                          >
                            {etudiant.matricule}
                          </span>
                        </td>
                        <td className="py-3 px-6 text-left whitespace-nowrap">
                          <span
                            onClick={() => handleEtudiantClick(etudiant)}
                            className="hover:underline"
                          >
                            {etudiant.name}
                          </span>
                        </td>

                        <td className="py-3 px-6 text-left">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleEditClick(etudiant);
                            }}
                            className="text-[#1f81a9] hover:text-[#145c73] hover:underline"
                          >
                            Modifier
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDelete(etudiant._id);
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
                        Aucun étudiant trouvé.
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
                selectedEtudiant={selectedEtudiant}
                fetchEtudiants={() => fetchData(selectedClass)}
              />
            )}
          </>
        )}
      </div>
    </div>
  );
}

export default ListEtudiant;
