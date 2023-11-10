const { shopModel } = require("../models/shopItem.model");

class ShopService {

  static async getAllShop() {
    try {
      const shopItems = await shopModel.find({});
      return shopItems;
    } catch (error) {
        console.log(error.message);
    }
  }

  static async addItemToShop(body) {
    try {
      const newItemModel = new shopModel(body);
      const maxId = await shopModel.findOne().sort({ id: -1 }).select('id').lean();
      newItemModel.id = maxId ? maxId.id + 1 : 1;
      const newItem = await newItemModel.save();
      return newItem;
    } catch (error) {
      console.log(error);
      return null;
    }
  }

  static async getItemById(id) {
    try {
      const query = { id }
      const item = await shopModel.find(query);
      return item;
    } catch (error) {
        console.log(error.message);
    }
  }

  static async removeShopItem(id) {
    try {
      const conditions = { id };
      const removed = await shopModel.deleteMany(conditions);
      return removed;
    } catch (error) {
      console.log(error);      
    }
  }
}

module.exports = { ShopService };