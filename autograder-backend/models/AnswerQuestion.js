const mongoose = require('mongoose');
const answerQuestionSchema = new mongoose.Schema({
    question_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Question', required: true },
    answer: { type: mongoose.Schema.Types.Mixed, required: true },
  },
  {
    timestamps: true
  });
  
  const AnswerQuestion = mongoose.model('AnswerQuestion', answerQuestionSchema);
  module.exports = AnswerQuestion;
  