const mongoose = require('mongoose');
const examSchema = new mongoose.Schema({
    session: { type: String, enum: ['1ère session', 'rattrapage'], required: true },
    semestre: { type: String, enum: ['1er semestre', '2ème semestre'], required: true },
    titre:{ type: String, required: false, default: ''},
    subject_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Subject', required: true },
    academicYear: { type: String, required: true },
    class_ids: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Class', required: true }], 
  },
  {
    timestamps: true
  });
  
  const Exam = mongoose.model('Exam', examSchema);
  module.exports = Exam;
  