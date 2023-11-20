const mongoose = require('mongoose');
const { specialItemSchema } = require('./specialItem.model');

const questShopSchema = new mongoose.Schema({
  priceSilver: { type: Number, required: true },
  priceGold: { type: Number },
  questItem: specialItemSchema
});

questShopSchema.add({ id: { type: Number, default: 1 } });

module.exports = {questShopModel: mongoose.model('questShop', questShopSchema)};