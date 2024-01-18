const mongoose = require('mongoose');
const { RewardEnum } = require('./quest.model');

const ShopItemEnum = {
  GIFT: 'gift',
  ROLE: 'role',
  QUEST: 'quest'
}

const shopItemSchema = new mongoose.Schema({
  name: { type: String, required: true },
  roleId: { type: String }, // nếu là role thì sẽ có id
  priceSilver: { type: Number, required: true }, // giá tiền mua bằng bạc
  priceGold: { type: Number }, // giá tiền mua bằng vàng
  type: { type: String, enum: Object.values(ShopItemEnum)}, // role or gift
  description: { type: String, required: true },
  giftEmoji: { type: String },
  intimacyPoints: { type: Number }, // nếu là gift thì sẽ có điểm thân mật
  typeBuff: { type: String, enums: Object.values(RewardEnum) },
  valueBuff: { type: String }
});

shopItemSchema.add({ id: { type: Number, default: 1 } });

module.exports = {shopModel: mongoose.model('shopItem', shopItemSchema), ShopItemEnum};