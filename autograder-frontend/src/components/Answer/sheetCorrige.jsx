import React, { useState, useEffect } from "react";
import Sidebar from "../components/Sidebar";
import { Worker, Viewer } from "@react-pdf-viewer/core";
import "@react-pdf-viewer/core/lib/styles/index.css";
import { useLocation, useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import { FaTimesCircle } from "react-icons/fa";
import { ClipLoader } from "react-spinners";
import ReactPaginate from "react-paginate";
import axios from "axios";
import Cookies from "js-cookie";
import { ChevronLeftCircle, ChevronRightCircle } from "lucide-react";
import {
  FaTimes,
  FaPencilAlt,
  FaChevronLeft,
  FaChevronRight,
} from "react-icons/fa";
import EditablePdfViewer from "./editSheet";

const PageFeuillesCorrigees = () => {
  const [pdfUrls, setPdfUrls] = useState([]);
  const [selectedPdfIndex, setSelectedPdfIndex] = useState(null); // Changement de selectedPdf en index
  const [isLoading, setIsLoading] = useState(false);
  const [academicYear, setAcademicYear] = useState("");
  const [session, setSession] = useState("");
  const [semestre, setSemestre] = useState("");
  const [classe, setClasse] = useState("");
  const [matiere, setMatiere] = useState("");
  const [classes, setClasses] = useState([]);
  const [matieres, setMatieres] = useState([]);
  const [currentPage, setCurrentPage] = useState(0);
  const [pdfPerPage, setPdfPerPage] = useState(10); // Nombre de PDFs par page
  const [isEditing, setIsEditing] = useState(false);

  const location = useLocation();

  useEffect(() => {
    const state = location.state || {};
    const { correctedSheet } = state;
    const fetchData = async () => {
      try {
        const classeResponse = await axios.get(
          "http://localhost:8000/api/classes"
        );
        setClasses(classeResponse.data);
      } catch (error) {
        console.error("Erreur lors de la récupération des niveaux", error);
      }
    };

    if (correctedSheet) {
      setAcademicYear(correctedSheet.academicYear);
      setSession(correctedSheet.session);
      setSemestre(correctedSheet.semestre);
      setClasse(correctedSheet.class_id);
      setMatiere(correctedSheet.subject_id);
      fetchPdfs(
        correctedSheet.session,
        correctedSheet.semestre,
        correctedSheet.class_id,
        correctedSheet.subject_id,
        correctedSheet.academicYear
      );
    } else {
      fetchData();
    }
  }, [location.state]);

  const fetchSubjects = async (levelId) => {
    try {
      const matiereResponse = await axios.get(
        `http://localhost:8000/api/matieres/by-class/${levelId}`
      );
      setMatieres(matiereResponse.data);
    } catch (error) {
      console.error("Erreur lors de la récupération des matieres", error);
    }
  };

  const handleLevelChange = (levelId) => {
    setClasse(levelId);
    fetchSubjects(levelId);
  };

  const fetchPdfs = async (
    sessionp,
    semestrep,
    classep,
    matierep,
    academicYearp
  ) => {
    setIsLoading(true);
    try {
      const response = await fetch(
        "http://localhost:8000/api/feuilles-reponses/corrigees",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            session: sessionp,
            semestre: semestrep,
            class_id: classep,
            subject_id: matierep,
            academicYear: academicYearp,
          }),
        }
      );
      if (response.ok) {
        const data = await response.json();
        setPdfUrls(data.pdfData);
        if (data.pdfData.length > 0) {
          setSelectedPdfIndex(0); // Sélectionne le premier PDF par défaut
        }
      } else {
        await Swal.fire({
          icon: "error",
          title: "Erreur",
          text: "Erreur lors de la récupération des PDFs corrigés.",
        });
      }
    } catch (error) {
      console.error("Erreur lors de la récupération des PDFs corrigés:", error);
      await Swal.fire({
        icon: "error",
        title: "Erreur",
        text: "Erreur lors de la récupération des PDFs corrigés.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = () => {
    fetchPdfs(session, semestre, classe, matiere, academicYear);
  };

  const handleClick = (index) => {
    setSelectedPdfIndex(index);
  };

  const handleClose = () => {
    setSelectedPdfIndex(null);
  };

  const handlePrevious = () => {
    setSelectedPdfIndex((prevIndex) => Math.max(prevIndex - 1, 0));
  };

  const handleNext = () => {
    setSelectedPdfIndex((prevIndex) =>
      Math.min(prevIndex + 1, pdfUrls.length - 1)
    );
  };

  const indexOfLastPdf = (currentPage + 1) * pdfPerPage;
  const indexOfFirstPdf = indexOfLastPdf - pdfPerPage;
  const currentPdfs = pdfUrls.slice(indexOfFirstPdf, indexOfLastPdf);

  const handlePageClick = (event) => {
    setCurrentPage(event.selected);
  };

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleSave = async (pdfBytes, note, oldPdfUrl, explanation) => {

    // Envoyer le PDF modifié et la note au serveur
    // Par exemple :
    const formData = new FormData();
    formData.append("pdf", new Blob([pdfBytes], { type: "application/pdf" }));
    formData.append("note", note);
    formData.append("oldPdfUrl", oldPdfUrl);
    formData.append("explanation", explanation);

    const token = Cookies.get("token");

    try {
      await axios.post("http://localhost:8000/api/feuilles-reponses/save-edited-pdf", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: `Bearer ${token}`,
        },
      });
      

      Swal.fire("Succès", "Le PDF a été enregistré avec succès.", "success");

      fetchPdfs(session, semestre, classe, matiere, academicYear);
      
    } catch (error) {
      console.error("Erreur lors de l'enregistrement du PDF modifié:", error);
      Swal.fire(
        "Erreur",
        "Erreur lors de l'enregistrement du PDF modifié.",
        "error"
      );
    }

    setIsEditing(false);
    setSelectedPdfIndex(null); // Fermer le viewer
  };

  const handleCloseViewer = () => {
    setIsEditing(false);
  };

  return (
    <div className="flex">
      <Sidebar />
      <div className="min-h-screen p-8 bg-[#f3fbfa] pl-72 w-full">
        <div className="mb-6">
          <h1 className="font-bold mb-2">
            Liste des Feuilles de Copie Corrigées
          </h1>
        </div>

        {/* Formulaire de Recherche */}
        <div className="bg-white p-5 rounded-lg shadow">
          <div className="flex flex-col">
            <div className="flex flex-wrap gap-4">
              <div className="flex-1 min-w-0">
                <div className="mb-6">
                  <label
                    className="block text-gray-700 text-sm font-bold mb-2"
                    htmlFor="academicYear"
                  >
                    Année Universitaire
                  </label>
                  <input
                    id="academicYear"
                    type="text"
                    value={academicYear}
                    onChange={(e) => setAcademicYear(e.target.value)}
                    className="bg-white border border-gray-300 text-gray-900 text-sm rounded-full focus:ring-[#1f81a9] focus:border-[#1f81a9] block w-full p-2.5 shadow-lg"
                  />
                </div>
              </div>
              <div className="flex-1 min-w-0">
                <div className="mb-6">
                  <label
                    className="block text-gray-700 mb-3 text-sm font-bold"
                    htmlFor="session"
                  >
                    Session de l'examen
                  </label>
                  <select
                    id="session"
                    value={session}
                    onChange={(e) => setSession(e.target.value)}
                    className="bg-white border border-gray-300 text-gray-900 text-sm rounded-full focus:ring-[#1f81a9] focus:border-[#1f81a9] block w-full p-3 shadow-lg"
                  >
                    <option value="" disabled>
                      Sélectionnez une session
                    </option>
                    <option value="1ère session">1ère session</option>
                    <option value="rattrapage">Rattrapage</option>
                  </select>
                </div>
              </div>
              <div className="flex-1 min-w-0">
                <div className="mb-6">
                  <label
                    className="block text-gray-700 mb-3 text-sm font-bold"
                    htmlFor="semestre"
                  >
                    Semestre
                  </label>
                  <select
                    id="semestre"
                    value={semestre}
                    onChange={(e) => setSemestre(e.target.value)}
                    className="bg-white border border-gray-300 text-gray-900 text-sm rounded-full focus:ring-[#1f81a9] focus:border-[#1f81a9] block w-full p-3 shadow-lg"
                  >
                    <option value="" disabled>
                      Sélectionnez un semestre
                    </option>
                    <option value="1er semestre">1er semestre</option>
                    <option value="2ème semestre">2ème semestre</option>
                  </select>
                </div>
              </div>
              <div className="flex-1 min-w-0">
                <div className="mb-6">
                  <label
                    className="block text-gray-700 mb-3 text-sm font-bold"
                    htmlFor="classe"
                  >
                    Classe
                  </label>
                  <select
                    id="classe"
                    value={classe}
                    onChange={(e) => handleLevelChange(e.target.value)}
                    className="bg-white border border-gray-300 text-gray-900 text-sm rounded-full focus:ring-[#1f81a9] focus:border-[#1f81a9] block w-full p-3 shadow-lg"
                  >
                    <option value="" disabled>
                      Sélectionnez une classe
                    </option>
                    {classes.map((classe) => (
                      <option key={classe._id} value={classe._id}>
                        {classe.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="flex-1 min-w-0">
                <div className="mb-6">
                  <label
                    className="block text-gray-700 mb-3 text-sm font-bold"
                    htmlFor="matiere"
                  >
                    Matière
                  </label>
                  <select
                    id="matiere"
                    value={matiere}
                    onChange={(e) => setMatiere(e.target.value)}
                    className="bg-white border border-gray-300 text-gray-900 text-sm rounded-full focus:ring-[#1f81a9] focus:border-[#1f81a9] block w-full p-3 shadow-lg"
                  >
                    <option value="" disabled>
                      Sélectionnez une matière
                    </option>
                    {matieres.map((matiere) => (
                      <option key={matiere._id} value={matiere._id}>
                        {matiere.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
            <div className="flex justify-center">
              <button
                onClick={handleSearch}
                className="bg-[#1f81a9] text-white text-sm px-6 py-2.5 rounded-full shadow-lg hover:bg-[#145c73] focus:outline-none focus:ring-4 focus:ring-[#1f81a9]"
                disabled={isLoading}
              >
                {isLoading ? (
                  <ClipLoader color="#ffffff" size={20} />
                ) : (
                  "Rechercher"
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Liste des PDFs */}
        <div className="mt-8 bg-white p-4 rounded-lg shadow">
          <div className="grid grid-cols-1 md:grid-cols-8">
            {currentPdfs.map((pdf, index) => (
              <div key={index} className="relative">
                <div
                  className="relative w-full h-full overflow-hidden cursor-pointer"
                  onClick={() => handleClick(index)}
                >
                  <Worker
                    workerUrl={`https://unpkg.com/pdfjs-dist@3.11.174/build/pdf.worker.min.js`}
                  >
                    <Viewer fileUrl={pdf.pdfUrl} plugins={[]} />
                  </Worker>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-8 flex justify-center">
          <ReactPaginate
            previousLabel={<ChevronLeftCircle />}
            nextLabel={<ChevronRightCircle />}
            breakLabel={"..."}
            pageCount={Math.ceil(pdfUrls.length / pdfPerPage)}
            marginPagesDisplayed={2}
            pageRangeDisplayed={5}
            onPageChange={handlePageClick}
            containerClassName={"pagination"}
            pageClassName={"page-item"}
            pageLinkClassName={"page-link"}
            previousClassName={"page-item"}
            previousLinkClassName={"page-link"}
            nextClassName={"page-item"}
            nextLinkClassName={"page-link"}
            breakClassName={"page-item"}
            breakLinkClassName={"page-link"}
            activeClassName={"active"}
          />
        </div>

        {selectedPdfIndex !== null && !isEditing && (
          <div className="fixed inset-0 bg-gray-900 bg-opacity-75 flex items-center justify-center z-50">
            <div className="relative bg-white rounded-lg w-11/12 h-5/6 max-w-6xl max-h-[90vh] overflow-hidden shadow-2xl flex flex-col">
              {/* Header */}
              <div className="bg-gray-100 p-4 flex justify-between items-center border-b border-gray-200">
                <h2 className="text-xl font-semibold text-gray-800">
                  View PDF
                </h2>
                <button
                  onClick={handleClose}
                  className="text-gray-600 hover:text-gray-800 transition-colors"
                  aria-label="Close"
                >
                  <FaTimes size={24} />
                </button>
              </div>

              {/* PDF Viewer */}
              <div className="flex-grow relative overflow-auto p-4 ">
                <Worker
                  workerUrl={`https://unpkg.com/pdfjs-dist@3.11.174/build/pdf.worker.min.js`}
                >
                  <Viewer fileUrl={pdfUrls[selectedPdfIndex].pdfUrl} />
                </Worker>
              </div>

              {/* Navigation and Controls */}
              <div className="bg-gray-100 p-4 flex justify-between items-center border-t border-gray-200">
                <div className="flex items-center space-x-4">
                  {/* Previous Button */}
                  <button
                    onClick={handlePrevious}
                    disabled={selectedPdfIndex === 0}
                    className="bg-[#1f81a9] text-white px-3 py-2 rounded-full flex items-center disabled:opacity-50 disabled:cursor-not-allowed hover:bg-[#145c73] transition-colors"
                  >
                    <FaChevronLeft className="mr-1" />
                  </button>
                  {/* Next Button */}
                  <button
                    onClick={handleNext}
                    disabled={selectedPdfIndex === pdfUrls.length - 1}
                    className="bg-[#1f81a9] text-white px-3 py-2 rounded-full flex items-center disabled:opacity-50 disabled:cursor-not-allowed hover:bg-[#145c73] transition-colors"
                  >
                    <FaChevronRight className="ml-1" />
                  </button>
                  {/* Page Info */}
                  <span className="text-gray-700">
                    Feuille de Copie {selectedPdfIndex + 1} of {pdfUrls.length}
                  </span>
                </div>
                {/* Edit Button */}
                <button
                  onClick={handleEdit}
                  className="bg-[#1f81a9] text-white px-4 py-2 rounded-full flex items-center hover:bg-[#145c73] transition-colors"
                >
                  <FaPencilAlt className="mr-2" /> Modifier
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Composant d'édition */}
        {isEditing && selectedPdfIndex !== null && (
          <EditablePdfViewer
            fileUrl={pdfUrls[selectedPdfIndex].pdfUrl}
            onSave={handleSave}
            onClose={handleCloseViewer} // Passer la fonction de fermeture
          />
        )}
      </div>
    </div>
  );
};

export default PageFeuillesCorrigees;
