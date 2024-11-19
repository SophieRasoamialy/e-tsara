import React, { useState, useEffect } from "react";
import Sidebar from "../components/Sidebar";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { Worker, Viewer } from "@react-pdf-viewer/core";
import "@react-pdf-viewer/core/lib/styles/index.css";
import { FaUpload, FaTimes } from "react-icons/fa";
import MySwal from "sweetalert2";
import { ClipLoader } from "react-spinners";
import ReactPaginate from "react-paginate";
import { ChevronLeftCircle, ChevronRightCircle } from "lucide-react";
import env from "react-dotenv";
import Cookies from "js-cookie";

// Styles réutilisables
const commonInputClasses =
  "bg-white border border-gray-300 text-gray-900 text-sm rounded-full focus:ring-[#1f81a9] focus:border-[#1f81a9] block w-full p-2.5 shadow-lg";
const selectClasses =
  "bg-white border border-gray-300 text-gray-900 text-sm rounded-full focus:ring-[#1f81a9] focus:border-[#1f81a9] block w-full p-3 shadow-lg";

const ListCopy = () => {
  const [session, setSession] = useState("");
  const [semestre, setSemestre] = useState("");
  const [classe, setClasse] = useState("");
  const [matiere, setMatiere] = useState("");
  const [academicYear, setAcademicYear] = useState("");
  const [classes, setClasses] = useState([]);
  const [matieres, setMatieres] = useState([]);
  const [pdfUrls, setPdfUrls] = useState([]);
  const [selectedPdf, setSelectedPdf] = useState(null);
  const [progress, setProgress] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isfinished, setIsfinished] = useState(false);
  const [currentPage, setCurrentPage] = useState(0);
  const pdfPerPage = 9; // Nombre de PDFs par page
  const token = Cookies.get("token");

  const navigate = useNavigate();
  const apiUrl = env.API_URL || "";


  useEffect(() => {
    const fetchData = async () => {
      try {
        const classeResponse = await axios.get(
          `${apiUrl}/api/classes`
        );
        setClasses(classeResponse.data);
      } catch (error) {
        console.error("Erreur lors de la récupération des niveaux", error);
      }
    };

    fetchData();
  }, []);

  const fetchSubjects = async (levelId) => {
    try {
      const matiereResponse = await axios.get(
        `${apiUrl}/api/matieres/by-class/${levelId}`
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

  const fetchPdfs = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(
        `${apiUrl}/api/feuilles-reponses/exam/sheet-answer`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            session,
            semestre,
            class_id: classe,
            subject_id: matiere,
            academicYear,
          }),
        }
      );

      if (response.ok) {
        const data = await response.json();
        setPdfUrls(data.pdfData);
      } else {
        await MySwal.fire({
          icon: "error",
          title: "Erreur",
          text: "Erreur lors de la récupération des PDFs.",
        });
      }
    } catch (error) {
      console.error("Erreur lors de la récupération des PDFs:", error);
      await MySwal.fire({
        icon: "error",
        title: "Erreur",
        text: "Erreur lors de la récupération des PDFs.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleBatchCorrection = async () => {
    if (pdfUrls.length === 0) return;

    setIsProcessing(true);
    setProgress(0);

    try {
      for (let i = 0; i < pdfUrls.length; i++) {
        const pdf = pdfUrls[i];
        await axios.post(
          `${apiUrl}/api/feuilles-reponses/exam/sheet-answer/correct`,
          { answerSheetId: pdf.answerSheetId },  
          {
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
          }
        );        
        setProgress(((i + 1) / pdfUrls.length) * 100);
      }
      await MySwal.fire({
        icon: "success",
        title: "Succès",
        text: "La correction des copies a été lancée avec succès.",
      });
      setIsfinished(true);
    } catch (error) {
      console.error("Erreur lors de la requête de correction:", error);
      await MySwal.fire({
        icon: "error",
        title: "Erreur",
        text: "Une erreur est survenue lors du lancement de la correction.",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleViewCorrections = () => {
    const correctedSheet = {
      session,
      semestre,
      class_id: classe,
      subject_id: matiere,
      academicYear,
    };
    navigate("/copies-corriges", { state: { correctedSheet } });
  };

  const handleSearch = () => {
    fetchPdfs();
  };

  const handleClick = (pdfUrl) => {
    setSelectedPdf(pdfUrl);
  };

  const handleClose = () => {
    setSelectedPdf(null);
  };

  const handleUpload = () => {
    navigate("/upload-copy");
  };

  const handleListCorrigees = () => {
    navigate("/copies-corriges");
  };

  // Calculer les indices des PDFs à afficher pour la page actuelle
  const indexOfLastPdf = (currentPage + 1) * pdfPerPage;
  const indexOfFirstPdf = indexOfLastPdf - pdfPerPage;
  const currentPdfs = pdfUrls.slice(indexOfFirstPdf, indexOfLastPdf);

  const handlePageClick = (event) => {
    setCurrentPage(event.selected);
  };

  return (
    <div className="flex">
      <Sidebar />
      <div className="min-h-screen p-8 bg-[#f3fbfa] pl-72 w-full">
        <div className="flex">
        <button
          onClick={handleUpload}
          className="absolute top-4 right-4 text-white bg-[#1f81a9] hover:bg-[#145c73] focus:outline-none focus:ring-4 focus:ring-[#1f81a9] font-medium rounded-full text-sm px-5 py-2.5 text-center mb-2"
        >
          <span className="material-icons space-x-1 flex">
            <span>Upload</span>
            <FaUpload />
          </span>
        </button>
        <button
          onClick={handleListCorrigees}
          className="absolute top-4 right-32 text-white bg-[#1f81a9] hover:bg-[#145c73] focus:outline-none focus:ring-4 focus:ring-[#1f81a9] font-medium rounded-full text-sm px-5 py-2.5 text-center mb-2"
        >
          <span className="material-icons space-x-1 flex">
            <span>Feuilles Corrigées</span>
            
          </span>
        </button>
        </div>
        <div className="mb-6">
          <h1 className=" font-bold mb-2">
            Liste des Feuilles de Copie non corrigé
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
                    Année Universitairee
                  </label>
                  <input
                    id="academicYear"
                    type="text"
                    required
                    value={academicYear}
                    onChange={(e) => setAcademicYear(e.target.value)}
                    className={commonInputClasses}
                    aria-label="Année Universitaire"
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
                    className={selectClasses}
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
                    className={selectClasses}
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
                    className={selectClasses}
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
                    className={selectClasses}
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
          <div className="grid grid-cols-1 md:grid-cols-8 ">
            {currentPdfs.map((pdf, index) => (
              <div key={index} className="relative ">
                <div
                  className="relative w-full h-full overflow-hidden cursor-pointer "
                  onClick={() => handleClick(pdf.pdfUrl)}
                >
                  <Worker
                    workerUrl={`https://unpkg.com/pdfjs-dist@3.11.174/build/pdf.worker.min.js`}
                  >
                    <Viewer
                      fileUrl={pdf.pdfUrl}
                      plugins={[]}
                      renderPage={(props) => (
                        <div>
                          {props.pageIndex === 0 && props.canvasLayer.children}
                        </div>
                      )}
                    />
                  </Worker>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Pagination */}
        <div className="mt-8 flex justify-center">
          <style></style>
          <ReactPaginate
            previousLabel={<ChevronLeftCircle />}
            précédent
            nextLabel={<ChevronRightCircle />}
            suivant
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

        {/* Affichage du PDF sélectionné */}
        {selectedPdf && (
          <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
            <div className="relative bg-white p-4 rounded-lg w-full h-full md:w-3/4 md:h-3/4">
              <button
                onClick={handleClose}
                className="absolute top-2 right-2 text-[#1f81a9] hover:text-[#145c73]"
              >
                <FaTimes />
              </button>
              <Worker
                workerUrl={`https://unpkg.com/pdfjs-dist@3.11.174/build/pdf.worker.min.js`}
              >
                <Viewer fileUrl={selectedPdf} />
              </Worker>
            </div>
          </div>
        )}

        {/* Bouton de correction */}
        {pdfUrls.length > 0 && !isProcessing && (
          <div className="fixed bottom-8 right-8">
            <button
              onClick={
                isfinished ? handleViewCorrections : handleBatchCorrection
              }
              className="bg-red-600 text-white text-sm px-6 py-2.5 rounded-full shadow-lg hover:bg-red-700 focus:outline-none focus:ring-4 focus:ring-[#1f81a9]"
            >
              {isfinished
                ? "Voir les copies corrigées"
                : "Lancer la correction"}
            </button>
          </div>
        )}

        {/* Barre de progression */}
        {isProcessing && (
          <div className="fixed bottom-8 right-8">
            <div className="relative pt-1">
              <div className="flex mb-2 items-center justify-between">
                <div className="text-xs font-semibold inline-block py-1 px-2 rounded-full text-teal-600 bg-teal-200 mr-3">
                  Progression
                </div>
                <div className="text-xs font-semibold inline-block py-1 px-2 rounded-full text-teal-600 bg-teal-200">
                  {Math.round(progress)}%
                </div>
              </div>
              <div className="relative pt-1">
                <div className="flex mb-2 items-center justify-between">
                  <div className="flex flex-col">
                    <div className="w-full bg-gray-200 rounded-full h-2.5">
                      <div
                        className="bg-[#1f81a9] h-2.5 rounded-full"
                        style={{ width: `${progress}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ListCopy;
