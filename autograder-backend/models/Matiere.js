const mongoose = require('mongoose');
const subjectSchema = new mongoose.Schema({
    name: { type: String, required: true },
    coeff: { type: Number, required: true },
    teacher_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    module_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Module', required: true },
  }, 
  {
    timestamps: true
  });
  
  const Subject = mongoose.model('Subject', subjectSchema);
  module.exports = Subject;
  