const mongoose = require('mongoose');
const { roleSchema } = require('./role.model');

const roleShopSchema = new mongoose.Schema({
  priceSilver: { type: Number, required: true },
  priceGold: { type: Number },
  roleInfo: roleSchema
});

roleShopSchema.add({ id: { type: Number, default: 1 } });

module.exports = { roleShopModel: mongoose.model('roleShop', roleShopSchema)};