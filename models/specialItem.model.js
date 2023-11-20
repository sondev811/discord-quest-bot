const mongoose = require('mongoose');
const { RewardEnum } = require('./quest.model');

const specialItemType = {
  RING_PIECE: 'ringPiece',
  WEEDING_RING: 'weedingRing',
  RESET_QUEST: 'resetQuest',
  FRIEND_RING: 'friendRing',
  CERTIFICATE: 'certificate'
}

const typeBuffSpecial = {
  DAILY_BUFF: 'dailyBuff',
}

const specialItemSchema = new mongoose.Schema({
  name: { type: String, required: true },
  emoji: { type: String, required: true },
  type: { type: String, required: true, enums: Object.values(specialItemType)},
  description: { type: String, required: true },
  typeBuff: { type: String, enums: Object.values(typeBuffSpecial)},
  buffInfo: {
    typeBuff: { type: String, enums: Object.values(RewardEnum) },
    valueBuff: { type: String },
  },
  weedingPiece: {
    value:{ type: Number }
  }
});

specialItemSchema.add({ id: { type: Number, default: 1 } });

module.exports = {
  specialItemModel: mongoose.model('specialItems', specialItemSchema), 
  specialItemSchema, 
  specialItemType,
  typeBuffSpecial
};