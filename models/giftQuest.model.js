const mongoose = require('mongoose');

const giftQuest = new mongoose.Schema({
  id: { type: Number },
  name: { type: String, required: true },
  type: { type: String, default: 'gift'},
  description: { type: String, required: true },
  giftEmoji: { type: String },
  intimacyPoints: { type: Number },
  dropRate: { type: Number, default: 0 }
});

module.exports = {giftQuestModel: mongoose.model('giftQuest', giftQuest)};