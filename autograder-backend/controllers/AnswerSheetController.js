const AnswerSheet = require("../models/AnswerSheet");
require("dotenv").config();
const AWS = require("aws-sdk");
const Exam = require("../models/Exam");
const Subject = require("../models/Matiere");
const Student = require("../models/Etudiant");
const mongoose = require("mongoose");
const multer = require("multer");
const { v4: uuidv4 } = require("uuid");
const fs = require("fs");
const os = require("os");
const { PDFDocument, rgb, StandardFonts } = require("pdf-lib");
const Question = require("../models/Question");
const axios = require("axios");
const path = require("path");
const AnswerQuestion = require("../models/AnswerQuestion");
const cheerio = require("cheerio");
const { createCanvas } = require("canvas");
const pdfjsLib = require("pdfjs-dist/build/pdf");
const Tesseract = require("tesseract.js");
const fontkit = require('fontkit');
const Activity = require("../models/Activity");

// Configurer AWS Textract
const textract = new AWS.Textract({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});

// Configurer AWS S3
const s3 = new AWS.S3({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});

// Fonction pour créer une nouvelle feuille de réponse
const createAnswerSheet = async (req, res) => {
  try {
    const {
      student_matricule,
      sheet,
      sheet_corrige,
      note,
      subject_id,
      exam_id,
    } = req.body;

    const newAnswerSheet = new AnswerSheet({
      student_matricule,
      sheet,
      sheet_corrige,
      note,
      subject_id,
      exam_id,
    });

    const savedAnswerSheet = await newAnswerSheet.save();
    res.status(201).json(savedAnswerSheet);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Fonction pour obtenir une feuille de réponse par ID
const getAnswerSheetById = async (req, res) => {
  try {
    const { id } = req.params;
    const answerSheet = await AnswerSheet.findById(id)
      .populate("student_matricule", "name")
      .populate("subject_id", "name")
      .populate("exam_id", "date");

    if (!answerSheet)
      return res.status(404).json({ message: "AnswerSheet not found" });
    res.status(200).json(answerSheet);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Fonction pour mettre à jour une feuille de réponse par ID
const updateAnswerSheet = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    const updatedAnswerSheet = await AnswerSheet.findByIdAndUpdate(
      id,
      updates,
      { new: true }
    )
      .populate("student_matricule", "name")
      .populate("subject_id", "name")
      .populate("exam_id", "date");

    if (!updatedAnswerSheet)
      return res.status(404).json({ message: "AnswerSheet not found" });
    res.status(200).json(updatedAnswerSheet);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Fonction pour obtenir les feuilles de réponses par étudiant
const getAnswerSheetsByStudent = async (req, res) => {
  try {
    const { student_id } = req.params;
    const answerSheets = await AnswerSheet.find({
      student_matricule: student_id,
    })
      .populate("subject_id", "name")
      .populate("exam_id", "date");

    if (!answerSheets)
      return res
        .status(404)
        .json({ message: "No answer sheets found for this student" });
    res.status(200).json(answerSheets);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Fonction pour obtenir les feuilles de réponses par examen
const getAnswerSheetsByExam = async (req, res) => {
  const { session, semestre, subject_id, academicYear, class_id } = req.body;

  try {
    // Convertir les IDs en ObjectId de Mongoose
    const subjectObjectId = new mongoose.Types.ObjectId(subject_id);
    const classObjectId = new mongoose.Types.ObjectId(class_id);

    // Recherche de l'examen avec les critères fournis
    const exam = await Exam.findOne({
      session,
      semestre,
      subject_id: subjectObjectId,
      academicYear,
      class_ids: { $in: [classObjectId] },
    });

    if (!exam) {
      return res
        .status(404)
        .json({ message: "No exam found with the provided criteria" });
    }

    const exam_id = exam._id; 

    // Récupérer les feuilles de réponses pour un examen spécifique
    const answerSheets = await AnswerSheet.find({ exam_id })
      .populate("student_matricule", "name matricule")
      .populate("subject_id", "name")
      .populate("exam_id", "date");

    if (!answerSheets.length) {
      return res
        .status(404)
        .json({ message: "No answer sheets found for this exam and subject" });
    }

    const pdfData = [];

    for (let sheet of answerSheets) {
      // Créez l'URL pour accéder au fichier directement depuis S3
      const pdfKey = sheet.sheet;
      const s3Params = {
        Bucket: process.env.S3_BUCKET_NAME,
        Key: pdfKey,
      };

      try {
        // Vérifiez si le fichier existe dans S3
        await s3.headObject(s3Params).promise();

        // Créez l'URL pour accéder au fichier directement depuis S3
        const pdfUrl = `https://${process.env.S3_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${pdfKey}`;
        pdfData.push({
          answerSheetId: sheet._id, // Ajout de l'ID de la feuille de réponse
          studentName: sheet.student_matricule.name,
          studentMatricule: sheet.student_matricule.matricule,
          pdfUrl,
        });
      } catch (err) {
        console.warn(
          `Le fichier ${pdfKey} n'a pas pu être trouvé dans S3.`,
          err
        );
        continue;
      }
    }

    res.status(200).json({ pdfData });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getSheetsCorrige = async (req, res) => {
  const { session, semestre, subject_id, academicYear, class_id } = req.body;
 
  try {
    // Convertir les IDs en ObjectId de Mongoose
    const subjectObjectId = new mongoose.Types.ObjectId(subject_id);
    const classObjectId = new mongoose.Types.ObjectId(class_id);

    // Recherche de l'examen avec les critères fournis
    const exam = await Exam.findOne({
      session,
      semestre,
      subject_id: subjectObjectId,
      academicYear,
      class_ids: { $in: [classObjectId] },
    });

    if (!exam) {
      return res
        .status(404)
        .json({ message: "No exam found with the provided criteria" });
    }

    const exam_id = exam._id; 

    // Récupérer les feuilles de réponses pour un examen spécifique
    const answerSheets = await AnswerSheet.find({ exam_id })
      .populate("student_matricule", "name matricule")
      .populate("subject_id", "name")
      .populate("exam_id", "date");

    if (!answerSheets.length) {
      return res
        .status(404)
        .json({ message: "No answer sheets found for this exam and subject" });
    }

    const pdfData = [];
    for (let sheet of answerSheets) {
      // Créez l'URL pour accéder au fichier directement depuis S3
      const pdfKey = sheet.sheet_corrige;
      const s3Params = {
        Bucket: process.env.S3_BUCKET_NAME,
        Key: pdfKey,
      };

      try {
        // Vérifiez si le fichier existe dans S3
        await s3.headObject(s3Params).promise();

        // Créez l'URL pour accéder au fichier directement depuis S3
        const pdfUrl = `https://${process.env.S3_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${pdfKey}`;

        pdfData.push({
          answerSheetId: sheet._id, // Ajout de l'ID de la feuille de réponse
          studentName: sheet.student_matricule.name,
          studentMatricule: sheet.student_matricule.matricule,
          pdfUrl,
        });
      } catch (err) {
        console.warn(
          `Le fichier ${pdfKey} n'a pas pu être trouvé dans S3.`,
          err
        );
        continue;
      }
    }

    res.status(200).json({ pdfData });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Fonction pour uploader et enregistrer les feuilles de réponses
const uploadAndSaveAnswerSheets = async (req, res) => {
  const { session, semestre, subject_id, academicYear, class_id } = req.body;

  try {
    // Convertir les IDs en ObjectId de Mongoose
    const subjectObjectId = new mongoose.Types.ObjectId(subject_id);
    const classObjectId = new mongoose.Types.ObjectId(class_id);

    // Recherche de l'examen avec les critères fournis
    const exam = await Exam.findOne({
      session,
      semestre,
      subject_id: subjectObjectId,
      academicYear,
      class_ids: { $in: [classObjectId] },
    });

    if (!exam) {
      console.log("Examen non trouvé");
      return res.status(404).json({ message: "Examen non trouvé" });
    }

    // Traitement des fichiers uploadés
    const uploadedFiles = req.files;

    if (!uploadedFiles || uploadedFiles.length === 0) {
      return res.status(400).json({ message: "Aucun fichier téléchargé" });
    }

    for (let file of uploadedFiles) {
      // Générer un nom unique pour le fichier
      const fileName = `${uuidv4()}-${file.originalname}`;
      const fileKey = `answer-sheets/${fileName}`;
      console.log("fileKey: ", fileKey);
      // Paramètres de l'upload vers S3
      const s3Params = {
        Bucket: process.env.S3_BUCKET_NAME,
        Key: `answer-sheets/${fileName}`,
        Body: file.buffer,
        ContentType: file.mimetype,
      };

      // Télécharger le fichier sur S3
      const s3Response = await s3.upload(s3Params).promise();
      const fileUrl = s3Response.Location;
      console.log("fileUrl: ", fileUrl);

      // Extraction de texte avec Textract
      const textractParams = {
        Document: {
          Bytes: file.buffer,
        },
      };
      console.log("textractParams", textractParams);
      const textractResponse = await textract
        .detectDocumentText(textractParams)
        .promise();
      console.log("textractResponse", textractResponse);
      const extractedText = textractResponse.Blocks.map(
        (block) => block.Text
      ).join(" ");
      console.log("extractedText: ", extractedText);

      // Supposons que le matricule de l'étudiant soit un nombre à 4 chiffres
      const matriculeRegex = /\b\d{4}\b/;
      const studentMatricule = extractedText.match(matriculeRegex);
      console.log("studentMatricule ", studentMatricule);

      if (!studentMatricule) {
        console.warn(
          `Matricule non trouvé pour le fichier ${file.originalname}`
        );
        continue;
      }

      // Trouver l'étudiant correspondant
      const student = await Student.findOne({ matricule: studentMatricule[0] });
      console.log("student: ", student);

      if (!student) {
        console.warn(
          `Étudiant non trouvé avec le matricule ${studentMatricule[0]}`
        );
        continue;
      }

      // Enregistrer la feuille de réponse dans MongoDB
      const answerSheet = new AnswerSheet({
        student_matricule: student._id,
        sheet: fileKey, // URL du fichier stocké dans S3
        sheet_corrige: "",
        subject_id: subjectObjectId,
        exam_id: exam._id,
      });

      await answerSheet.save();
      // Enregistrement de l'activité après l'enregistrement de la feuille de réponse
      await Activity.create({
        userId: req.user._id,  // ID de l'utilisateur qui a effectué l'action
        action: "Téléchargement et enregistrement des feuilles ",
        description: `Feuille de réponse uploadée pour l'étudiant: ${student.matricule}, \nFichier: ${fileUrl}`,
      });
    }

    res
      .status(200)
      .json({ message: "Feuilles de réponse enregistrées avec succès" });
  } catch (error) {
    console.error(
      "Erreur lors de l'upload et de l'enregistrement des feuilles de réponse:",
      error
    );
    res.status(500).json({
      message: "Erreur serveur lors de l'upload des feuilles de réponse",
    });
  }
};

const extractFilePath = (url) => {
  try {
    const parsedUrl = new URL(url);  // Parse l'URL
    return parsedUrl.pathname.substring(1);  // Récupère le chemin et enlève le premier caractère '/'
  } catch (error) {
    console.error('Erreur lors de l\'extraction du chemin du fichier:', error);
    return null;
  }
};


// Fonction pour enregistrer le PDF modifié et la note
const saveEditedPdf = async (req, res) => {
  const { note, oldPdfUrl, explanation } = req.body;
  const oldPdfUrlExtracted = extractFilePath(oldPdfUrl);
  try {
    // Vérifier si un fichier PDF a été téléchargé
    if (!req.file) {
      console.log("Aucun fichier PDF téléchargé")
      return res.status(400).json({ message: 'Aucun fichier PDF téléchargé' });
    }

    // Rechercher le document pour obtenir l'ancienne note
    const existingSheet = await AnswerSheet.findOne({ sheet_corrige: oldPdfUrlExtracted });

    if (!existingSheet) {
      console.log('Feuille de réponse non trouvée')
      return res.status(404).json({ message: 'Feuille de réponse non trouvée' });
    }

    // Récupérer l'ancienne note
    const oldNote = existingSheet.note;

    // Générer un nom unique pour le fichier
    const fileName = `${uuidv4()}-${req.file.originalname}`;
    const fileKey = `corrected-answer-sheets/${fileName}`;
    console.log("bucket name", process.env.S3_BUCKET_NAME);
    // Paramètres d'upload vers AWS S3
    const s3Params = {
      Bucket: process.env.S3_BUCKET_NAME,
      Key: fileKey,
      Body: req.file.buffer,
      ContentType: req.file.mimetype,
    };

    // Télécharger le fichier PDF sur S3
    const s3Response = await s3.upload(s3Params).promise();
    const fileUrl = s3Response.Location;

    // Mise à jour de la feuille de réponse avec le nouveau PDF et la note
    const updateResult = await AnswerSheet.updateOne(
      { sheet_corrige: oldPdfUrlExtracted },  
      {
        $set: {
          sheet_corrige: fileKey,  // URL du fichier PDF modifié stocké dans S3
          note: note,  // Note finale de l'étudiant
        },
      }
    );

    if (updateResult.nModified === 0) {
      console.log("Feuille de réponse non trouvée ou non modifiée")
      return res.status(404).json({ message: 'Feuille de réponse non trouvée ou non modifiée' });
    }

    // Enregistrement de l'activité avec les anciennes et nouvelles informations
    await Activity.create({
      userId: req.user._id,  // ID de l'utilisateur qui a effectué l'action
      action: "Changement de la feuille de copie déjà corrigée ",
      description: `Mise à jour de la feuille de copie. \nAncien PDF: ${oldPdfUrl}, \nAncienne note: ${oldNote}, \nNouveau PDF: ${fileUrl}, \nNouvelle note: ${note} \nExplication: ${explanation}`,
    });

    // Répondre avec succès
    console.log("PDF modifié et note enregistrés avec succès")
    res.status(200).json({ message: 'PDF modifié et note enregistrés avec succès' });
  } catch (error) {
    console.error('Erreur lors de l\'enregistrement du PDF modifié:', error);
    res.status(500).json({
      message: 'Erreur serveur lors de l\'enregistrement du PDF modifié et de la note',
    });
  }
};

const correctAnswerSheet = async (req, res) => {
  const { answerSheetId } = req.body;

  try {
    // Obtenir les détails de la feuille de réponse et les questions associées
    const answerSheet = await AnswerSheet.findById(answerSheetId)
      .populate("exam_id")
      .populate("subject_id")
      .populate("student_matricule");

    if (!answerSheet) {
      throw new Error("Feuille de réponse introuvable");
    }

    const correctQuestions = await Question.find({
      exam_id: answerSheet.exam_id._id,
    });

    const correctAnswersData = await AnswerQuestion.find({
      question_id: { $in: correctQuestions.map((q) => q._id) },
    });

    const questionsWithAnswers = correctQuestions.map((question) => {
      const correctAnswer = correctAnswersData.find((answer) =>
        answer.question_id.equals(question._id)
      );
      return {
        question: question.text,
        answer: correctAnswer ? correctAnswer.answer : null,
        question_id: question._id,
        points: question.points,
      };
    });

    const s3Object = await s3
      .getObject({
        Bucket: process.env.S3_BUCKET_NAME,
        Key: answerSheet.sheet,
      })
      .promise();

    const pdfBytes = s3Object.Body;

    const tempPdfPath = `/tmp/${answerSheetId}.pdf`;
    fs.writeFileSync(tempPdfPath, pdfBytes);

    const response = await axios.post("http://flask-service:5000/analyze_qcm", {
      pdf_path: tempPdfPath,
      correct_answers: questionsWithAnswers
    });

    const results = response.data.results;
    console.log("Results: ", results);
    let totalPoints = 0;

    // Charger le PDF avec pdf-lib pour modification
    const pdfDoc = await PDFDocument.load(pdfBytes);
    const firstPage = pdfDoc.getPage(0);

      // Enregistrer fontkit avec le document PDF
    pdfDoc.registerFontkit(fontkit);

    // Charger une police Unicode
    const fontBytes = fs.readFileSync('./assets/DejaVuSans.ttf');
    const customFont = await pdfDoc.embedFont(fontBytes);

    // Dessiner les résultats
    results.forEach((result) => {
      const { question_rect, is_correct, points } = result;
      const x0 = question_rect.x0-50;
      const y0 = question_rect.y0;
      const symbol = is_correct ? '✓' : '✘';
      const color =  rgb(1, 0, 0);  

      // Dessiner "✓" ou "X" à côté de la réponse de l'étudiant
      firstPage.drawText(`${symbol}`, {
        x: x0,
        y: y0,
        size: 26,
        font: customFont,
        color: color
      });

      // Dessiner la note à côté du symbole
      firstPage.drawText(`${is_correct ? points : 0}`, {
        x: x0 + 15,
        y: y0,
        size: 20,
        font: customFont,
        color: color  
      });

      totalPoints += points;
    });

    // Afficher la note totale sur la première page
    firstPage.drawText(`Note Totale: ${totalPoints}/20`, {
      x: 50,
      y: firstPage.getHeight() - 100,
      size: 30,
      font: customFont,
      color: rgb(1, 0, 0),  // Rouge pour la note totale
    });

    const correctedPdfBytes = await pdfDoc.save();
    const correctedFileName = `${answerSheetId}_corrected.pdf`;
    const correctedFilePath = path.join("/tmp", correctedFileName);

    fs.writeFileSync(correctedFilePath, correctedPdfBytes);

    const correctedS3Key = `corrected-answer-sheets/${correctedFileName}`;
    const uploadParams = {
      Bucket: process.env.S3_BUCKET_NAME,
      Key: correctedS3Key,
      Body: fs.createReadStream(correctedFilePath),
      ContentType: "application/pdf",
    };
    const s3Response = await s3.upload(uploadParams).promise();

    answerSheet.sheet_corrige = correctedS3Key;
    answerSheet.note = totalPoints;
    await answerSheet.save();

    res.status(200).json({
      message: "Correction terminée",
      correctedPdfUrl: s3Response.Location,
    });

    // Enregistrement de l'activité avec les anciennes et nouvelles informations
    await Activity.create({
      userId: req.user._id,  // ID de l'utilisateur qui a effectué l'action
      action: "Correction des feuilles ",
      description: `Feuille de réponse corrigée pour l'examen: ${answerSheet.exam_id.name}, \nÉtudiant: ${answerSheet.student_matricule}, \nNote finale: ${totalPoints}, \nLien du PDF corrigé: ${s3Response.Location}`
    });

    // Nettoyer les fichiers temporaires
    fs.unlinkSync(tempPdfPath);
    fs.unlinkSync(correctedFilePath);
  } catch (error) {
    console.error("Erreur lors de la correction de la feuille de réponse:", error);
    res.status(500).json({
      message: "Erreur serveur lors de la correction de la feuille de réponse",
    });
  }
};

// Fonction pour compter toutes les feuilles téléchargées
const countUploadedSheets = async (req, res) => {
  try {
    const uploadedSheetsCount = await AnswerSheet.countDocuments({ sheet: { $ne: null } });
    res.status(200).json({ count: uploadedSheetsCount });
  } catch (error) {
    res.status(500).json({ message: 'Erreur lors du comptage des feuilles téléchargées', error });
  }
};

// Fonction pour compter toutes les feuilles corrigées
const countCorrectedSheets = async (req, res) => {
  try {
    const correctedSheetsCount = await AnswerSheet.countDocuments({ sheet_corrige: { $ne: null } });
    res.status(200).json({ count: correctedSheetsCount });
  } catch (error) {
    res.status(500).json({ message: 'Erreur lors du comptage des feuilles corrigées', error });
  }
};

// Fonction pour obtenir les moyennes par semestre
const getSemesterPerformance = async (req, res) => {
  try {
    const performanceData = await AnswerSheet.aggregate([
      {
        $match: { note: { $ne: null } } // Exclure les notes nulles
      },
      {
        $addFields: {
          semester: {
            $cond: [
              { $lte: [{ $month: "$createdAt" }, 6] },  // Si mois <= 6, semestre 1
              1,
              2
            ]
          }
        }
      },
      {
        $group: {
          _id: { 
            semester: "$semester",
            year: { $year: "$createdAt" }
          },
          averageScore: { $avg: "$note" }
        }
      },
      {
        $sort: { "_id.year": 1, "_id.semester": 1 } // Trier par année puis par semestre
      }
    ]);

    res.status(200).json(performanceData);
  } catch (error) {
    res.status(500).json({ message: 'Erreur lors de la récupération des performances', error });
  }
};


// Exporter les fonctions
module.exports = {
  createAnswerSheet,
  getAnswerSheetById,
  updateAnswerSheet,
  getAnswerSheetsByStudent,
  getAnswerSheetsByExam,
  uploadAndSaveAnswerSheets,
  correctAnswerSheet,
  getSheetsCorrige,
  saveEditedPdf,
  countUploadedSheets,
  countCorrectedSheets,
  getSemesterPerformance,
};
