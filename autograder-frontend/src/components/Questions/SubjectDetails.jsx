import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import axios from "axios"; // Importer axios
import { jsPDF } from "jspdf";
import Sidebar from "../components/Sidebar";
import {
  FaArrowLeft,
  FaEdit,
  FaEye,
  FaEyeSlash,
  FaDownload,
} from "react-icons/fa";
import "./print.css";
import env from "react-dotenv";

const SubjectDetails = () => {
  const { id } = useParams();
  const [subject, setSubject] = useState(null);
  const [exam, setExam] = useState(null);
  const [questions, setQuestions] = useState(null);
  const [showAnswers, setShowAnswers] = useState(false);

  const apiUrl = env.API_URL || "";

  // Utiliser useEffect pour récupérer les données de l'API au montage du composant
  useEffect(() => {
    const fetchExamDetails = async () => {
      try {
        const response = await axios.get(
          `${apiUrl}/api/exams/${id}`
        );
        setSubject(response.data.exam.subject_id);
        setExam(response.data.exam);
        setQuestions(response.data.questions);
      } catch (error) {
        console.error(
          "Erreur lors de la récupération des détails de l'examen :",
          error
        );
      }
    };

    fetchExamDetails();
  }, [id]);

  if (!exam) {
    return <div>Chargement des détails du sujet...</div>;
  }

  const toggleShowAnswers = () => {
    setShowAnswers(!showAnswers);
  };
  function decodeHtmlEntities(text) {
    const txt = document.createElement("textarea");
    txt.innerHTML = text;
    return txt.value;
  }

  const stripHtmlTags = (text) => {
    return text.replace(/<[^>]+>/g, ""); // Supprime toutes les balises HTML
  };

  const downloadPDF = () => {
    const doc = new jsPDF();

    // Ajouter les informations de base de l'examen
    doc.text(`Matière: ${subject.name}`, 10, 10);
    doc.text(`Année Universitaire: ${exam.academicYear}`, 10, 20);
    doc.text(`Examen: ${exam.session}  ${exam.semestre}`, 10, 30);

    // Afficher les noms des classes (niveaux) associés à l'examen
    const classNames = exam.class_ids
      .map((classItem) => classItem.name)
      .join(" / ");
    doc.text(`Niveau: ${classNames}`, 10, 40);

    // Titre pour la section des questions
    doc.text("Questions:", 10, 50);

    // Ajouter les questions au PDF
    let yPosition = 60; // Position initiale pour la première question
    questions.forEach((q, index) => {
      let decodedText = decodeHtmlEntities(q.text);
      decodedText = decodedText.replace(/<br>/g, "\n");
      decodedText = decodedText.replace(/- /g, "\n   - ");

      // Supprimer les balises HTML
      decodedText = stripHtmlTags(decodedText);

      const lines = doc.splitTextToSize(decodedText, 180);

      doc.text(`${index + 1}.`, 10, yPosition); // Numéro de question
      doc.text(lines, 20, yPosition); // Texte de la question

      yPosition += lines.length * 7.5; // Ajuster la position pour la prochaine question
    });

    // Enregistrer le PDF avec un nom de fichier approprié
    doc.save(`${subject.name}-exam.pdf`);
  };

  return (
    <div className="flex">
      <Sidebar />
      <div className="flex-1 p-8 bg-[#f3fbfa] min-h-screen pl-64">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold text-gray-800">
            Détails du Sujet: {subject.name}
          </h1>
          <div className="space-x-2 flex">
            <Link
              to="/subject-list"
              className="bg-gray-500 text-white flex items-center hover:bg-gray-600 focus:outline-none focus:ring-4 focus:ring-[#1f81a9] font-medium rounded-full text-sm px-5 py-3 text-center mb-2"
            >
              <FaArrowLeft className="mr-2" />
              Retour
            </Link>
            <button className="text-white bg-[#1f81a9] flex items-center hover:bg-[#145c73] focus:outline-none focus:ring-4 focus:ring-[#1f81a9] font-medium rounded-full text-sm px-5 py-2.5 text-center mb-2">
              <FaEdit className="mr-2" />
              Modifier
            </button>
            <button
              onClick={toggleShowAnswers}
              className="text-white bg-[#1f81a9] flex items-center hover:bg-[#145c73] focus:outline-none focus:ring-4 focus:ring-[#1f81a9] font-medium rounded-full text-sm px-5 py-2.5 text-center mb-2"
            >
              {showAnswers ? (
                <FaEyeSlash className="mr-2" />
              ) : (
                <FaEye className="mr-2" />
              )}
              {showAnswers ? "Masquer les réponses" : "Voir les réponses"}
            </button>
            <button
              onClick={downloadPDF}
              className="text-white bg-blue-500 flex items-center hover:bg-blue-600 focus:outline-none focus:ring-4 focus:ring-blue-500 font-medium rounded-full text-sm px-5 py-2.5 text-center mb-2"
            >
              <FaDownload className="mr-2" />
              Télécharger
            </button>
          </div>
        </div>

        <div className="bg-white shadow-md my-2 rounded-lg p-5 ">
          <h2 className="text-md  text-gray-800">
            <span className="font-semibold">Matiere:</span>
            {subject.name}
          </h2>
          <h2 className="text-md  text-gray-800">
            <span className="font-semibold">Niveau: </span>
            {exam.class_ids.map((classItem) => (
              <span key={classItem._id}>{classItem.name} / </span>
            ))}
          </h2>
          <h2 className="text-md  text-gray-800">
            <span className="font-semibold">Examen: </span> {exam.semestre}{" "}
            {exam.session}
          </h2>
          <h2 className="text-md  text-gray-800">
            <span className="font-semibold">Année Universitaire:</span>{" "}
            {exam.academicYear}
          </h2>
        </div>

        <div className="bg-white shadow-md rounded-lg overflow-hidden">
          <div className="p-4">
            <h2 className="text-xl font-semibold text-gray-800">Questions:</h2>
            <ul className="list-disc list-inside">
              {questions.map((q) => (
                <li key={q._id} className="py-2">
                  <div dangerouslySetInnerHTML={{ __html: q.text }} />
                  {showAnswers && q.answers && (
                    <div className="pl-4 text-gray-600">
                      {q.answers.map((answer) => (
                        <div key={answer._id}>
                          Réponse:
                          <div
                            dangerouslySetInnerHTML={{ __html: answer.answer }}
                          />
                        </div>
                      ))}
                    </div>
                  )}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SubjectDetails;
