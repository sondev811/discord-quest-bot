const { errors } = require("../constants/general");
const { giftModel } = require("../models/gift.model");
const { questModel } = require("../models/quest.model");
const customTimeout = 20000;

class QuestService {
 
  static async getAllQuest() {
    try {
      const quests = await questModel.find({}).maxTimeMS(customTimeout);
      return quests;
    } catch (error) {
      console.log(error.message);
      throw new Error(errors.GET_ALL_QUEST_ERROR);
    }
  }

  static async getGiftQuest() {
    try {
      const gifts = await giftModel.find({});
      return gifts;
    } catch (error) {
      console.log(error.message);
      throw new Error(errors.GET_ALL_QUEST_ERROR);
    }
  }

  static async addGiftQuest(body) {
    try {
      const newGiftQuest = new giftModel(body);
      const saved = await newGiftQuest.save();
      return saved;
    } catch (error) {
      console.log(error);
    }
  }

  static async updateGiftQuest(id, dropRate) {
    try {
      const conditions = { id };
      const item = await giftModel.updateMany(conditions, { $set: { dropRate } });
      return item;
    } catch (error) {
        console.log(error.message);
    }
  }
}

module.exports = { QuestService };