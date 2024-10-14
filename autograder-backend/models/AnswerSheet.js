const mongoose = require('mongoose');
const answerSheetSchema = new mongoose.Schema({
    student_matricule: { type: mongoose.Schema.Types.ObjectId, ref: 'Student', required: true },
    sheet: { type: String, required: true },  // Path to the PDF file
    sheet_corrige: { type: String }, // Path to the PDF file corriged
    note: { type: Number, default: null }, 
    subject_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Subject', required: true },
    exam_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Exam', required: true },
  },
  {
    timestamps: true
  });
  
  const AnswerSheet = mongoose.model('AnswerSheet', answerSheetSchema);
  module.exports = AnswerSheet;
  