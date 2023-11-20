const mongoose = require('mongoose');

const giftSchema = new mongoose.Schema({
  name: { type: String, required: true },
  type: { type: String, default: 'gift'},
  description: { type: String, required: true },
  giftEmoji: { type: String },
  intimacyPoints: { type: Number },
  dropRate: { type: Number, default: 0 }
});

giftSchema.add({ id: { type: Number, default: 1 } });

module.exports = { giftModel: mongoose.model('gifts', giftSchema), giftSchema };