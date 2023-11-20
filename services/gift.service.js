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
      console.log(error);
      return null;
    }
  }

  static async removeGift(id) {
    try {
      const conditions = { id };
      const removed = await giftModel.deleteMany(conditions);
      return removed;
    } catch (error) {
      console.log(error);      
    }
  }

  static async getAllGift() {
    try {
      const roles = await giftModel.find({});
      return roles;
    } catch (error) {
        console.log(error.message);
    }
  }

  static async editDropRateGift(_id, dropRate) {
    try {
      const conditions = { _id };
      const item = await giftModel.updateMany(conditions, { $set: { dropRate } });
      return item;
    } catch (error) {
      console.log(error);
    }
  }
}

module.exports = { GiftService };
