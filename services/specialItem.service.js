const {specialItemModel} = require("../models/specialItem.model");

class SpecialItemService {

  static async addItem(body) {
    try {
      const newItemModel = new specialItemModel(body);
      const maxId = await specialItemModel.findOne().sort({ id: -1 }).select('id').lean();
      newItemModel.id = maxId ? maxId.id + 1 : 1;
      const newItem = await newItemModel.save();
      return newItem;
    } catch (error) {
      console.log(error);
      return null;
    }
  }

  static async removeItem(id) {
    try {
      const conditions = { id };
      const removed = await specialItemModel.deleteMany(conditions);
      return removed;
    } catch (error) {
      console.log(error);      
    }
  }

  static async getAllItem() {
    try {
      const roles = await specialItemModel.find({});
      return roles;
    } catch (error) {
        console.log(error.message);
    }
  }
}

module.exports = { SpecialItemService };
