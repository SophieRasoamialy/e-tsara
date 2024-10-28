import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";
import { useDropzone } from "react-dropzone";
import Sidebar from "../components/Sidebar";
import { UploadIcon } from "lucide-react";
import { FaArrowLeft, FaSpinner } from "react-icons/fa";
import { Link } from "react-router-dom";
import Swal from "sweetalert2";
import env from "react-dotenv";

// Styles réutilisables
const commonInputClasses =
  "bg-white border border-gray-300 text-gray-900 text-sm rounded-full focus:ring-[#1f81a9] focus:border-[#1f81a9] block w-full p-2.5 shadow-lg";
const selectClasses =
  "bg-white border border-gray-300 text-gray-900 text-sm rounded-full focus:ring-[#1f81a9] focus:border-[#1f81a9] block w-full p-3 shadow-lg";
  const spinnerClasses = "animate-spin h-6 w-6 text-[#1f81a9]";

const UploadCopy = () => {
  const [files, setFiles] = useState([]);
  const [result, setResult] = useState("");
  const [session, setSession] = useState("");
  const [classe, setClasse] = useState("");
  const [matiere, setMatiere] = useState("");
  const [academicYear, setAcademicYear] = useState("");
  const [semestre, setSemestre] = useState("");
  const [classes, setClasses] = useState([]);
  const [matieres, setMatieres] = useState([]);
  const [uploadCount, setUploadCount] = useState(0);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false); // État pour le spinner

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

  const onDrop = useCallback((acceptedFiles, fileRejections) => {
    if (fileRejections.length > 0) {
      setError("Seuls les fichiers PDF sont acceptés.");
    } else {
      setFiles((prevFiles) => [...prevFiles, ...acceptedFiles]);
      setError(""); // Réinitialiser l'erreur si les fichiers sont acceptés
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: "application/pdf", // Accepter uniquement les fichiers PDF
  });

  const handleSubmit = async () => {
    if (!files.length) return;
    setLoading(true); // Activer le spinner

    const formData = new FormData();
    files.forEach((file) => formData.append("files", file));
    formData.append("session", session);
    formData.append("semestre", semestre);
    formData.append("subject_id", matiere);
    formData.append("academicYear", academicYear);
    formData.append("class_id", classe);

    try {
      const response = await axios.post(
        `${apiUrl}/api/feuilles-reponses/upload-answer-sheets`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      if (response.status === 200) {
        setResult(response.data.message);
        setUploadCount(files.length);
      } else {
        console.error("Unexpected response", response);
        Swal.fire({
          title: 'Erreur!',
          text: 'Une erreur est survenue lors du téléchargement.',
          icon: 'error',
          confirmButtonText: 'OK',
        });
      }
    }  catch (error) {
      console.error("Error uploading files", error);
      Swal.fire({
        title: 'Erreur!',
        text: 'Une erreur est survenue lors du téléchargement.',
        icon: 'error',
        confirmButtonText: 'OK',
      });
    } finally {
      setLoading(false); // Désactiver le spinner
    }
  };

  const handleCancel = () => {
    setFiles([]); // Efface tous les fichiers sélectionnés
  };

  const handleLevelChange = (levelId) => {
    setClasse(levelId);
    fetchSubjects(levelId);
  };

  
  return (
    <div className="flex">
      <Sidebar />
      <div className="flex items-center justify-center min-h-screen w-full bg-[#f3fbfa] pl-64">
        <div className="bg-white rounded-lg px-12 py-3 relative shadow shadow-xxl w-full mx-5 leading-normal">
          {/* Bouton Retour */}
          
          <Link
              to="/list-copies"
              aria-label="Retourner à la page précédente"
              className=" text-[#1f81a9] flex  font-bold text-sm mb-1 "
            >
              <FaArrowLeft className="mr-2" />
              
            </Link>

          <div className="flex flex-col md:flex-row items-start justify-between space-y-8 md:space-y-0 md:space-x-8">
            {/* Left Side: Form Selections */}
            <div className="w-full md:w-2/5">
              <div className="mb-6">
                <label
                  className="block text-gray-700 text-sm font-bold mb-2"
                  htmlFor="examDate"
                >
                  Année Universitaire
                </label>
                <input
                  id="examDate"
                  type="text"
                  value={academicYear}
                  onChange={(e) => setAcademicYear(e.target.value)}
                  aria-label="Année Universitaire"
                  required
                  className={commonInputClasses}
                />
              </div>

              <div className="mb-6">
                <label
                  className="block text-gray-700 mb-3 text-sm font-bold"
                  htmlFor="session"
                >
                  Sélectionnez la session de l'examen
                </label>
                <select
                  id="session"
                  value={session}
                  onChange={(e) => setSession(e.target.value)}
                  aria-label="Session de l'examen"
                  required
                  className={selectClasses}
                >
                  <option value="" disabled>
                    -- Sélectionnez une session --
                  </option>
                  <option value="1ère session">1ère session</option>
                  <option value="rattrapage">Rattrapage</option>
                </select>
              </div>

              <div className="mb-6">
                <label
                  className="block text-gray-700 text-sm font-bold mb-2"
                  htmlFor="semestre"
                >
                  Semestre
                </label>
                <select
                  id="semestre"
                  value={semestre}
                  onChange={(e) => setSemestre(e.target.value)}
                  aria-label="Semestre"
                  required
                  className={selectClasses}
                >
                  <option value="" disabled>
                    -- Sélectionnez un semestre --
                  </option>
                  <option value="1er semestre">1er semestre</option>
                  <option value="2ème semestre">2ème semestre</option>
                </select>
              </div>

              <div className="mb-6">
                <h3 className="text-gray-700 font-bold mb-3 text-sm">Niveau</h3>
                <select
                  id="niveau"
                  value={classe}
                  required
                  onChange={(e) => handleLevelChange(e.target.value)}
                  aria-label="Niveau"
                  className={selectClasses}
                >
                  <option value="">-- Sélectionnez le niveau --</option>
                  {classes.map((classe) => (
                    <option key={classe._id} value={classe._id}>
                      {classe.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="mb-6">
                <h3 className="text-gray-700 font-bold mb-3 text-sm">
                  Matière
                </h3>
                <select
                  id="matiere"
                  value={matiere}
                  onChange={(e) => setMatiere(e.target.value)}
                  aria-label="Matière"
                  required
                  className={selectClasses}
                >
                  <option value="">-- Sélectionnez la matière --</option>
                  {matieres.map((matiere) => (
                    <option key={matiere._id} value={matiere._id}>
                      {matiere.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Right Side: File Upload */}
            <div className="w-full md:w-3/5 ">
            {result && (
                <div className="mt-4 p-4 border rounded-lg" role="alert">
                  <p className="text-green-600 font-semibold">{result}</p>
                  <p>{uploadCount} fichiers ont été téléchargés avec succès.</p>
                </div>
              )}
              <div className="mb-6">
                <label className="block text-gray-700 font-bold mb-3 text-lg">
                  Uploader les copies scannées
                </label>
                <div
                  {...getRootProps()}
                  className={`border-4 border-dashed border-[#1f81a9] p-14 shadow-lg text-center rounded-lg cursor-pointer bg-[#f3fbfa] ${
                    isDragActive ? "border-blue-500" : "border-gray-300"
                  }`}
                  aria-label="Zone de téléchargement"
                >
                  <input {...getInputProps()} />

                  <div className="flex flex-col items-center justify-center space-y-4 my-6">
                    <UploadIcon className="h-12 w-12 text-[#1f81a9]" />
                    {isDragActive ? (
                      <p className="text-lg font-medium text-gray-600">
                        Déposez les fichiers ici ...
                      </p>
                    ) : (
                      <p className="text-lg font-medium text-gray-600">
                        Glissez-déposez les fichiers ici, ou cliquez pour
                        sélectionner des fichiers
                      </p>
                    )}
                  </div>
                  {error && (
                    <p className="text-red-600 font-semibold">{error}</p>
                  )}
                  {files.length > 0 && (
                    <div className="mt-4">
                      <h3 className="text-lg font-semibold">
                        Fichiers sélectionnés :
                      </h3>
                      <span>
                        {files.slice(0, 3).map((file, index) => (
                          <span key={index} className="text-gray-600">
                            {file.name}
                            {index < 2 ? ", " : ""}
                          </span>
                        ))}
                        {files.length > 3 && " ..."}
                      </span>
                    </div>
                  )}
                </div>
                <div className=" text-gray-700 text-lg">
                  <p>{files.length} fichier(s) uploadé(s).</p>
                </div>
              </div>

              <div className="flex space-x-4 mt-4">
                <button
                  onClick={handleSubmit}
                  className="bg-[#1f81a9] text-white text-sm font-bold py-2 px-4 rounded-full hover:bg-[#0a5e8c] transition duration-300"
                  aria-label="Enregistrer les fichiers"
                >
                 {loading ? (
                    <FaSpinner className={spinnerClasses} />
                  ) : (
                    "Enregistrer"
                  )}
                </button>
                <button
                  onClick={handleCancel}
                  className="bg-gray-500 text-white text-sm font-bold py-2 px-4 rounded-full hover:bg-gray-600 transition duration-300"
                  aria-label="Annuler les fichiers"
                >
                  Annuler
                </button>
              </div>

              
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UploadCopy;
