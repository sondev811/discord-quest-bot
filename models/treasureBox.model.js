const mongoose = require('mongoose');
const { roleSchema } = require('./role.model');

const TreasureItemType = {
  role : 'role',
  gift : 'gift',
  specialItem: 'specialItem',
  ticket: 'ticket',
  pet: 'pet',
}

const treasureSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String, required: true },
  emoji: { type: String },
  isRandomSpecialItem: { type: Boolean, default: false },
  items: [{
    itemType: { type: String, required: true, enum: Object.values(TreasureItemType)},
    tickets: {
      silver: { type: Number },
      gold: { type: Number },
    },
    giftQuantity: { type: Number },
    roleInfo: roleSchema,
    specialItems: []
  }]
});

treasureSchema.add({ id: { type: Number, default: 1 } });

module.exports = {treasureBoxModel: mongoose.model('treasureBoxes', treasureSchema), treasureSchema, TreasureItemType};