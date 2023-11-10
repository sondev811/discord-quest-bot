const mongoose = require('mongoose');

const levelSchema = new mongoose.Schema({
  id: { type: String, required: true }, 
  value: { type: Number, required: true }, 
  limitTicketDaily: { type: Number, required: true }, 
  limitQuestQuantity: { type: Number, required: true },
  priceUpgrade: { type: Number, required: true }
});

const levelModel = mongoose.model('level', levelSchema);

module.exports = { levelModel, levelSchema };