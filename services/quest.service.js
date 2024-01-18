const { errors } = require("../constants/general");
const { giftModel } = require("../models/gift.model");
const { questModel } = require("../models/quest.model");
const { questListModel } = require("../models/questList.model");
const customTimeout = 20000;

class QuestService {
 
  static async getAllQuest() {
    try {
      const quests = await questModel.find({}).maxTimeMS(customTimeout);
      return quests;
    } catch (error) {
      console.log(error, '[getAllQuest]');
    }
  }

  static async addQuest(body) {
    try {
      const newQuestModel = new questListModel(body);
      const newQuest = await newQuestModel.save();
      return newQuest;
    } catch (error) {
      console.log(error, '[createQuest]');
    }
  }

  static async getQuest(_id) {
    try {
      const filter = { _id };
      const quest = await questListModel.findOne(filter);
      return quest;
    } catch (error) {
      console.log(error, '[createQuest]');
    }
  }

  static async updateProgressQuest(_id, placeChannel) {
    try {
      const filter = { _id };
      const quest = await questListModel.findOne(filter);
      if (!quest || quest.progress >= quest.completionCriteria) return;
      if (!quest.placeChannel || quest.placeChannel === placeChannel) {
        await questListModel.findOneAndUpdate(
          filter,
          { $inc: { 'progress': 1 } },
          { new: true }
        );
        return;
      }
    } catch (error) {
      console.log(error, '[updateProgressQuest]');

    }
  }

  static async updateProgressVoiceQuest(_id, time) {
    try {
      const filter = { _id };
      const quest = await questListModel.findOne(filter);
      if (!quest || quest.progress >= quest.completionCriteria) return;
      
      const progress = quest.progress + time;
      
      await questListModel.findOneAndUpdate(
        filter,
        { $set: { progress } },
        { new: true }
      );
    } catch (error) {
      console.log(error, '[updateProgressQuest]');

    }
  }

  static async updateReceiveRewardQuest(_id) {
    try {
      const filter = { _id };
      await questListModel.findOneAndUpdate(
        filter,
        { $set: { 'isReceivedReward': true } },
        { new: true }
      );
    } catch (error) {
      console.log(error, '[updateProgressQuest]');

    }
  }

}

module.exports = { QuestService };