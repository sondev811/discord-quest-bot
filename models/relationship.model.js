const mongoose = require('mongoose');

const relationshipType = {
  friend: 'friend',
  bestFriend: 'bestFriend',
  soulmate: 'soulmate',
  married: 'married'
}

const relationshipSchema = new mongoose.Schema({
  name: { type: String, required: true, enums: Object.values(relationshipType) },
  level: { type: Number, required: true, default: 1 },
  intimacyPointUpgrade: { type: Number, required: true },
});

const relationshipModel = mongoose.model('relationship', relationshipSchema);

module.exports = { relationshipModel, relationshipType, relationshipSchema };