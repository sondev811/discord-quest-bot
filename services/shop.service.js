const { farmShopModel } = require("../models/farmShop.model");
const { giftShopModel } = require("../models/giftShop.model");
const { intimacyShopModel } = require("../models/intimacyShop");
const { questShopModel } = require("../models/questShop.model");
const { roleShopModel } = require("../models/roleShop.model");

class ShopService {

  static async getGiftShop() {
    try {
      const shopItems = await giftShopModel.find({});
      return shopItems;
    } catch (error) {
        console.log(error, '[getGiftShop]');
    }
  }

  static async getRoleShop() {
    try {
      const shopItems = await roleShopModel.find({});
      return shopItems;
    } catch (error) {
        console.log(error, '[getRoleShop]');
    }
  }

  static async getQuestShop() {
    try {
      const shopItems = await questShopModel.find({});
      return shopItems;
    } catch (error) {
        console.log(error, '[getQuestShop]');
    }
  }

  static async getIntimacyShop() {
    try {
      const shopItems = await intimacyShopModel.find({});
      return shopItems;
    } catch (error) {
        console.log(error, '[getIntimacyShop]');
    }
  }

  static async getFarmShop() {
    try {
      const shopItems = await farmShopModel.find();
      return shopItems;
    } catch (error) {
        console.log(error, '[getFarmShop]');
    }
  }

  static async addRoleToShop(body) {
    try {
      const newItemModel = new roleShopModel(body);
      const maxId = await roleShopModel.findOne().sort({ id: -1 }).select('id').lean();
      newItemModel.id = maxId ? maxId.id + 1 : 1;
      const newItem = await newItemModel.save();
      return newItem;
    } catch (error) {
      console.log(error, '[addRoleToShop]');
      return null;
    }
  }

  static async addGiftToShop(body) {
    try {
      const newItemModel = new giftShopModel(body);
      const maxId = await giftShopModel.findOne().sort({ id: -1 }).select('id').lean();
      newItemModel.id = maxId ? maxId.id + 1 : 1;
      const newItem = await newItemModel.save();
      return newItem;
    } catch (error) {
      console.log(error, '[addGiftToShop]');
      return null;
    }
  }
  
  static async addItemToQuestShop(body) {
    try {
      const newItemModel = new questShopModel(body);
      const maxId = await questShopModel.findOne().sort({ id: -1 }).select('id').lean();
      newItemModel.id = maxId ? maxId.id + 1 : 1;
      const newItem = await newItemModel.save();
      return newItem;
    } catch (error) {
      console.log(error, '[addItemToQuestShop]');
      return null;
    }
  }

  static async addIntimacyShop(body) {
    try {
      const newItemModel = new intimacyShopModel(body);
      const maxId = await intimacyShopModel.findOne().sort({ id: -1 }).select('id').lean();
      newItemModel.id = maxId ? maxId.id + 1 : 1;
      const newItem = await newItemModel.save();
      return newItem;
    } catch (error) {
      console.log(error, '[addIntimacyShop]');
      return null;
    }
  }

  static async removeGiftShopItem(id) {
    try {
      const conditions = { id };
      const removed = await giftShopModel.deleteMany(conditions);
      return removed;
    } catch (error) {
      console.log(error, '[removeGiftShopItem]');      
    }
  }

  static async removeRoleShopItem(id) {
    try {
      const conditions = { id };
      const removed = await roleShopModel.deleteMany(conditions);
      return removed;
    } catch (error) {
      console.log(error, '[removeRoleShopItem]');      
    }
  }

  static async removeQuestShopItem(id) {
    try {
      const conditions = { id };
      const removed = await questShopModel.deleteMany(conditions);
      return removed;
    } catch (error) {
      console.log(error, '[removeQuestShopItem]');      
    }
  }
}

module.exports = { ShopService };