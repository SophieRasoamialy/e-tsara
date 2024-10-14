const mongoose = require('mongoose');
const studentSchema = new mongoose.Schema({
    matricule: { type: String, unique: true, required: true },
    name: { type: String, required: true },
    class_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Class', required: true },
  },
  {
    timestamps: true
  });
  
  const Student = mongoose.model('Student', studentSchema);
  module.exports = Student;
  