const mongoose = require('mongoose');
const { giftSchema } = require('./gift.model');

const giftShopSchema = new mongoose.Schema({
  priceSilver: { type: Number, required: true },
  priceGold: { type: Number },
  giftInfo: giftSchema
});

giftShopSchema.add({ id: { type: Number, default: 1 } });

module.exports = { giftShopModel: mongoose.model('giftShop', giftShopSchema) };