const { giftModel } = require("../models/gift.model");

class GiftService {

  static async addGift(body) {
    try {
      const newItemModel = new giftModel(body);
      const maxId = await giftModel.findOne().sort({ id: -1 }).select('id').lean();
      newItemModel.id = maxId ? maxId.id + 1 : 1;
      const newItem = await newItemModel.save();
      return newItem;
    } catch (error) {
      console.log(error, '[addGift]');
      return null;
    }
  }

  static async removeGift(id) {
    try {
      const conditions = { id };
      const removed = await giftModel.deleteMany(conditions);
      return removed;
    } catch (error) {
      console.log(error, '[removeGift]');      
    }
  }

  static async getAllGift() {
    try {
      const gifts = await giftModel.find({});
      return gifts;
    } catch (error) {
        console.log(error, '[getAllGift]');
    }
  }

  static async editDropRateGift(_id, dropRate) {
    try {
      const conditions = { _id };
      const item = await giftModel.updateMany(conditions, { $set: { dropRate } });
      return item;
    } catch (error) {
      console.log(error, '[editDropRateGift]');
    }
  }
}

module.exports = { GiftService };
