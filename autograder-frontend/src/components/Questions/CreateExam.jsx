import axios from "axios";
import React, { useState, useEffect } from "react";
import Cookies from "js-cookie";
import { useNavigate } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import { FaTimes } from "react-icons/fa";
import { Editor } from "@tinymce/tinymce-react";
import env from "react-dotenv";

const CreateExam = () => {
  const [subject, setSubject] = useState("");
  const [examDate, setExamDate] = useState("");
  const [session, setSession] = useState("");
  const [semestre, setSemestre] = useState("");
  const [titre, setTitre] = useState("");
  const [questions, setQuestions] = useState([
    {
      text: "",
      answer: "",
      answer_type: "Texte",
      points: "",
      answer_duplicated: true,
    },
  ]);
  const [subjects, setSubjects] = useState([]);
  const [selectedLevels, setSelectedLevels] = useState([]);
  const [levels, setLevels] = useState([]);
  const [loadingSubjects, setLoadingSubjects] = useState(false);
  const [noSubjects, setNoSubjects] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const apiUrl = env.API_URL || "";

  // Fonction pour récupérer les matières
  const fetchSubjects = async (levelIds) => {
    try {
      setLoadingSubjects(true);
      setNoSubjects(false);
      const token = Cookies.get("token");
      const response = await axios.get(
        `${apiUrl}/api/matieres/me/${levelIds.join(",")}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setSubjects(response.data);
      if (response.data.length === 0) {
        setNoSubjects(true);
      }
    } catch (error) {
      console.error("Erreur lors de la récupération des matières :", error);
      if (error.response && error.response.status === 404) {
        setNoSubjects(true);
      } else {
        setError("Erreur lors de la récupération des matières.");
      }
    } finally {
      setLoadingSubjects(false);
    }
  };

  // Fonction pour récupérer les niveaux
  const fetchLevels = async () => {
    try {
      const token = Cookies.get("token");
      const response = await axios.get(
        `${apiUrl}/api/matieres/me/classes`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setLevels(response.data);
    } catch (error) {
      console.error("Erreur lors de la récupération des niveaux :", error);
      setError("Erreur lors de la récupération des niveaux.");
    }
  };

  useEffect(() => {
    fetchLevels();
  }, []);

  // Utilisation de useEffect pour récupérer les matières lorsque les niveaux sélectionnés changent
  useEffect(() => {
    if (selectedLevels.length > 0) {
      fetchSubjects(selectedLevels);
    } else {
      setSubjects([]);
    }
  }, [selectedLevels]);

  const handleLevelChange = (levelId) => {
    const updatedSelectedLevels = selectedLevels.includes(levelId)
      ? selectedLevels.filter((id) => id !== levelId)
      : [...selectedLevels, levelId];

    setSelectedLevels(updatedSelectedLevels);
  };

  const handleRemoveLevel = (levelId) => {
    const updatedSelectedLevels = selectedLevels.filter((id) => id !== levelId);
    setSelectedLevels(updatedSelectedLevels);
  };

  const handleAddQuestion = () => {
    setQuestions([
      ...questions,
      {
        text: "",
        answer: "",
        answer_type: "Texte",
        points: "",
        answer_duplicated: true,
      },
    ]);
  };

  const handleRemoveQuestion = (index) => {
    const newQuestions = [...questions];
    newQuestions.splice(index, 1);
    setQuestions(newQuestions);
  };

  const handleChangeQuestion = (index, field, value) => {
    const newQuestions = [...questions];
    newQuestions[index][field] = value;
    setQuestions(newQuestions);
  };

  const handleEditorChange = (index, field, content) => {
    const newQuestions = [...questions];
    newQuestions[index][field] = content;
    setQuestions(newQuestions);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      if (!subject) {
        setError("Veuillez sélectionner une matière.");
        return;
      }

      // Créer l'examen
      const examResponse = await axios.post(`${apiUrl}/api/exams`, {
        session,
        semestre,
        titre,
        subject_id: subject,
        class_ids: selectedLevels,
        academicYear: examDate,
      });

      const examId = examResponse.data.examId;

      // Parcourir les questions et les créer
      for (const question of questions) {
        const questionResponse = await axios.post(
          `${apiUrl}/api/questions`,
          {
            exam_id: examId,
            text: question.text,
            answer_type: question.answer_type,
            answer_duplicated: question.answer_duplicated,
            points: question.points,
          }
        );

        const questionId = questionResponse.data.questionId;

        // Créer la réponse associée
        await axios.post(`${apiUrl}/api/reponses`, {
          question_id: questionId,
          answer: question.answer,
        });
      }

      navigate("/subject-list");
    } catch (error) {
      console.error(
        "Erreur lors de la création de l'examen, des questions ou des réponses :",
        error
      );
      setError("Erreur lors de la création de l'examen.");
    }
  };

  return (
    <div className="flex">
      <Sidebar />
      <div className="flex-1 p-8 bg-[#f3fbfa] min-h-screen pl-64">
        <h1 className="text-3xl font-bold text-gray-800 mb-6">
          Créer un Examen
        </h1>
        {error && <div className="text-red-500 mb-4">{error}</div>}
        <form
          onSubmit={handleSubmit}
          className="bg-white shadow-md rounded-lg p-4"
        >
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2">
              Niveaux
            </label>
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
                  <label htmlFor={lvl._id} className="text-sm text-gray-700">
                    {lvl.name}
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
                      <FaTimes className="w-4 h-4" />
                      <span className="sr-only">Remove badge</span>
                    </button>
                  </span>
                );
              })}
            </div>
          </div>

          <div className="mb-4">
            <label
              className="block text-gray-700 text-sm font-bold mb-2"
              htmlFor="subject"
            >
              Matière
            </label>
            <select
              id="subject"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              className="bg-white border border-gray-300 text-gray-900 text-sm rounded-full focus:ring-[#1f81a9] focus:border-[#1f81a9] block w-full pl-10 p-2.5 shadow-lg"
              disabled={loadingSubjects || selectedLevels.length === 0}
            >
              <option value="" disabled>
                {loadingSubjects
                  ? "Chargement des matières..."
                  : noSubjects
                  ? "Pas de matières communes pour ces niveaux"
                  : "Sélectionnez une matière"}
              </option>
              {subjects.map((sub) => (
                <option key={sub._id} value={sub._id}>
                  {sub.name}
                </option>
              ))}
            </select>
          </div>
          <div className="mb-4">
            <label
              className="block text-gray-700 text-sm font-bold mb-2"
              htmlFor="session"
            >
              Session
            </label>
            <select
              id="session"
              value={session}
              onChange={(e) => setSession(e.target.value)}
              className="bg-white border border-gray-300 text-gray-900 text-sm rounded-full focus:ring-[#1f81a9] focus:border-[#1f81a9] block w-full pl-10 p-2.5 shadow-lg"
            >
              <option value="" disabled>
                Sélectionnez une session
              </option>
              <option value="1ère session">1ère session</option>
              <option value="rattrapage">Rattrapage</option>
            </select>
          </div>

          <div className="mb-4">
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
              className="bg-white border border-gray-300 text-gray-900 text-sm rounded-full focus:ring-[#1f81a9] focus:border-[#1f81a9] block w-full pl-10 p-2.5 shadow-lg"
            >
              <option value="" disabled>
                Sélectionnez un semestre
              </option>
              <option value="1er semestre">1er semestre</option>
              <option value="2ème semestre">2ème semestre</option>
            </select>
          </div>

          <div className="mb-4">
            <label
              className="block text-gray-700 text-sm font-bold mb-2"
              htmlFor="titre"
            >
              Titre
            </label>
            <input
              id="titre"
              type="text"
              value={titre}
              onChange={(e) => setTitre(e.target.value)}
              className="bg-white border border-gray-300 text-gray-900 text-sm rounded-full focus:ring-[#1f81a9] focus:border-[#1f81a9] block w-full pl-10 p-2.5 shadow-lg"
            />
          </div>
          <div className="mb-4">
            <label
              className="block text-gray-700 text-sm font-bold mb-2"
              htmlFor="examDate"
            >
              Annee Universitaire
            </label>
            <input
              id="examDate"
              type="text"
              value={examDate}
              onChange={(e) => setExamDate(e.target.value)}
              className="bg-white border border-gray-300 text-gray-900 text-sm rounded-full focus:ring-[#1f81a9] focus:border-[#1f81a9] block w-full pl-10 p-2.5 shadow-lg"
            />
          </div>

          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2">
              Questions
            </label>
            {questions.map((q, index) => (
              <div key={index} className="mb-6">
                <label className="block text-gray-700 text-sm font-bold mb-2">
                  Texte de la question
                </label>
                <Editor
                  apiKey="vx9i16y2v638jfhhq9t242kvxkouxaxuo0wrvgxsg4786phi"
                  init={{
                    plugins:
                      "anchor autolink charmap codesample emoticons image link lists media searchreplace table visualblocks wordcount checklist mediaembed casechange export formatpainter pageembed linkchecker a11ychecker tinymcespellchecker permanentpen powerpaste advtable advcode editimage advtemplate ai mentions tinycomments tableofcontents footnotes mergetags autocorrect typography inlinecss markdown",
                    toolbar:
                      "undo redo | blocks fontfamily fontsize | bold italic underline strikethrough | link image media table mergetags | addcomment showcomments | spellcheckdialog a11ycheck typography | align lineheight | checklist numlist bullist indent outdent | emoticons charmap | removeformat",
                    tinycomments_mode: "embedded",
                    ai_request: (request, respondWith) =>
                      respondWith.string(() =>
                        Promise.reject("See docs to implement AI Assistant")
                      ),
                  }}
                  onEditorChange={(content) =>
                    handleEditorChange(index, "text", content)
                  }
                />

                <div className="my-2">
                  <label className="block text-gray-700 text-sm font-bold mb-2">
                    Type de réponse
                  </label>
                  <select
                    value={q.answer_type}
                    onChange={(e) =>
                      handleChangeQuestion(index, "answer_type", e.target.value)
                    }
                    className="bg-white border border-gray-300 text-gray-900 text-sm rounded-full focus:ring-[#1f81a9] focus:border-[#1f81a9] block w-full pl-10 p-2.5 shadow-lg"
                  >
                    <option value="Texte">Texte</option>
                    <option value="QCM">QCM</option>
                    <option value="Vrai ou Faux">Vrai ou Faux</option>
                    <option value="Tableau">Tableau</option>
                    <option value="Diagramme">Diagramme</option>
                    <option value="Image">Image</option>
                  </select>
                </div>

                <label className="block text-gray-700 text-sm font-bold mb-2 mt-4">
                  Réponse
                </label>
                <Editor
                  apiKey="vx9i16y2v638jfhhq9t242kvxkouxaxuo0wrvgxsg4786phi"
                  init={{
                    plugins:
                      "anchor autolink charmap codesample emoticons image link lists media searchreplace table visualblocks wordcount checklist mediaembed casechange export formatpainter pageembed linkchecker a11ychecker tinymcespellchecker permanentpen powerpaste advtable advcode editimage advtemplate ai mentions tinycomments tableofcontents footnotes mergetags autocorrect typography inlinecss markdown",
                    toolbar:
                      "undo redo | blocks fontfamily fontsize | bold italic underline strikethrough | link image media table mergetags | addcomment showcomments | spellcheckdialog a11ycheck typography | align lineheight | checklist numlist bullist indent outdent | emoticons charmap | removeformat",
                    tinycomments_mode: "embedded",
                    ai_request: (request, respondWith) =>
                      respondWith.string(() =>
                        Promise.reject("See docs to implement AI Assistant")
                      ),
                  }}
                  onEditorChange={(content) =>
                    handleEditorChange(index, "answer", content)
                  }
                />
                <div className="mb-2">
                  <label className="block text-gray-700 text-sm font-bold mb-2">
                    Points
                  </label>
                  <input
                    type="number"
                    value={q.points}
                    onChange={(e) =>
                      handleChangeQuestion(index, "points", e.target.value)
                    }
                    className="bg-white border border-gray-300 text-gray-900 text-sm rounded-full focus:ring-[#1f81a9] focus:border-[#1f81a9] block w-full pl-10 p-2.5 shadow-lg"
                  />
                </div>
                <div className="mb-2">
                  <label className="block text-gray-700 text-sm font-bold mb-2">
                    Permettre les réponses dupliquées
                  </label>
                  <select
                    value={q.answer_duplicated}
                    onChange={(e) =>
                      handleChangeQuestion(
                        index,
                        "answer_duplicated",
                        e.target.value === "true"
                      )
                    }
                    className="bg-white border border-gray-300 text-gray-900 text-sm rounded-full focus:ring-[#1f81a9] focus:border-[#1f81a9] block w-full pl-10 p-2.5 shadow-lg"
                  >
                    <option value="true">Oui</option>
                    <option value="false">Non</option>
                  </select>
                </div>
                <button
                  type="button"
                  onClick={() => handleRemoveQuestion(index)}
                  className="text-red-500 hover:text-red-700 focus:outline-none focus:shadow-outline mt-2"
                >
                  Supprimer
                </button>
              </div>
            ))}
            <button
              type="button"
              onClick={handleAddQuestion}
              className="text-white bg-[#1f81a9] hover:bg-[#145c73] focus:outline-none focus:ring-4 focus:ring-[#1f81a9] font-medium rounded-full text-sm px-5 py-2.5 text-center mb-2"
            >
              Ajouter une Question
            </button>
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              className="text-white bg-[#1f81a9] hover:bg-[#145c73] focus:outline-none focus:ring-4 focus:ring-[#1f81a9] font-medium rounded-full text-sm px-5 py-2.5 text-center"
            >
              Créer l'Examen
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateExam;
