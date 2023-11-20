const mongoose = require('mongoose');
const { roleSchema } = require('./role.model');
const { treasureSchema } = require('./treasureBox.model');
const { specialItemSchema } = require('./specialItem.model');

const intimacyShopType = {
  role : 'role',
  treasureBox : 'treasureBox',
  specialItem: 'specialItem'
}

const intimacyShopSchema = new mongoose.Schema({
  type: { type: String, required: true, enums: Object.values(intimacyShopType)},
  intimacyPrice: { type: Number, required: true },
  silverTicket: { type: Number },
  roleInfo: roleSchema,
  treasureBoxInfo: treasureSchema,
  specialInfo: specialItemSchema
});

intimacyShopSchema.add({ id: { type: Number, default: 1 } });

module.exports = {intimacyShopModel: mongoose.model('intimacyShop', intimacyShopSchema), intimacyShopType};