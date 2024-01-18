const mongoose = require('mongoose');
const { seedSchema } = require('./seed.model');
const { farmItemSchema } = require('./farmItem.model');

const farmShopType = {
  seed: 'seed',
  farmItem: 'farmItem',
}

const farmShopSchema = new mongoose.Schema({
  priceSilver: { type: Number, required: true },
  type: { type: String, required: true, enums: Object.values(farmShopType) },
  seedInfo: seedSchema,
  farmItemInfo: farmItemSchema
});

module.exports = { farmShopModel: mongoose.model('farmShop', farmShopSchema), farmShopType };