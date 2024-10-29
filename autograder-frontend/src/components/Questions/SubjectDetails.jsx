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
    // Créer un nouveau document PDF avec encodage UTF-8
    const doc = new jsPDF('p', 'mm', 'a4', true);
    
    // Configurer la police et la taille
    doc.setFont("helvetica");
    doc.setFontSize(10);
    
    // Définir l'interligne (en points)
    const lineHeight = 8;
    
    // Espace vertical entre les questions
    const questionSpacing = 5;
    
    // Largeur de la page pour centrer le texte
    const pageWidth = doc.internal.pageSize.getWidth();
    
    // Fonction pour centrer le texte
    const centerText = (text, yPosition) => {
      const textWidth = doc.getTextWidth(text);
      const xPosition = (pageWidth - textWidth) / 2;
      doc.text(text, xPosition, yPosition);
    };
    
    // En-tête du document
    doc.text("Num matricule: .................... Nom et prénom: ...........................................................................", 10, 10);
    doc.text("......................................................Niveau: ................................................................", 10, 20);
    
    // Informations centrées de l'examen
    centerText(`Matière: ${subject.name}`, 30);
    centerText(`Année Universitaire: ${exam.academicYear}`, 30 + lineHeight);
    centerText(`Examen: ${exam.session} ${exam.semestre}`, 30 + 2 * lineHeight);
    
    // Niveaux
    const classNames = exam.class_ids
      .map((classItem) => classItem.name)
      .join(" / ");
    centerText(`Niveau: ${classNames}`, 30 + 3 * lineHeight);
    
    // Section des questions
    doc.text("Questions:", 10, 30 + 4 * lineHeight);
    
    // Fonction pour remplacer les cases à cocher
    const replaceCheckboxes = (text) => {
      return text
        .replace(/☐/g, '☐')  // Conserver les cases à cocher intactes
        .replace(/- /g, '\n - ');
    };
    
    // Fonction pour nettoyer et formater le texte
    const formatText = (text) => {
      let cleaned = decodeHtmlEntities(text);
      cleaned = cleaned.replace(/<br>/g, '\n');
      cleaned = stripHtmlTags(cleaned);
      cleaned = replaceCheckboxes(cleaned);
  
      // Remplacer les espaces multiples par un seul espace
      cleaned = cleaned.replace(/\s+/g, ' ');
  
      return cleaned;
    };
    
    // Ajouter les questions
    let yPosition = 30 + 5 * lineHeight;
    
    questions.forEach((q, index) => {
      // Nettoyer et formater le texte de la question
      const formattedText = formatText(q.text);
      
      // Diviser le texte en lignes selon la largeur de page
      const maxWidth = 180;
      const lines = doc.splitTextToSize(formattedText, maxWidth);
      
      // Ajouter le numéro de question
      doc.text(`${index + 1}.`, 10, yPosition);
      
      // Ajouter le texte de la question avec la police par défaut
      doc.setFont("helvetica");
      doc.text(lines, 20, yPosition);
      
      // Calculer la position Y pour la prochaine question
      yPosition += lines.length * lineHeight + questionSpacing;
      
      // Vérifier si on a besoin d'une nouvelle page
      if (yPosition > doc.internal.pageSize.height - 20) {
        doc.addPage();
        yPosition = 20;
      }
    });
    
    // Enregistrer le PDF
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
