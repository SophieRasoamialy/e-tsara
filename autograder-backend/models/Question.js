const mongoose = require('mongoose');
const questionSchema = new mongoose.Schema({
    exam_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Exam', required: true },
    text: { type: String, required: true },
    answer_type: { type: String, enum: ['texte', 'QCM', 'vrai ou faux', 'compléter', 'conception'], required: true },
    answer_duplicated: { type: Boolean, default: false },
    points: { type: Number, required: true },
  }, {
    timestamps: true
  });
  
  const Question = mongoose.model('Question', questionSchema);
  module.exports = Question;
  