const mongoose = require('mongoose');

const moduleSchema = new mongoose.Schema({
  name: { type: String, required: true },
  credit: { type: Number, required: true },
  class_ids: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Class', required: true }], 
}, {
  timestamps: true
});

  
  const Module = mongoose.model('Module', moduleSchema);
  module.exports = Module;
  