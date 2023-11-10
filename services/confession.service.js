const confessionsModel = require("../models/confessions.model");

class ConfessionService {
  static async saveOrUpdateConfession(body) {
    try {
      const { reviewMessageID } = body;
      const query = { reviewMessageID }
      const confession = await confessionsModel.findOneAndUpdate(query, body, { new: true });
      if (!confession) {
        const newConfession = new confessionsModel(body);
        const result = await newConfession.save();
        return result;
      }
      return confession;
    } catch (error) {
      console.log(error.message);
      return null;
    }
  }
  static async getConfessionById(reviewMessageID) {
    try {
      const query = {reviewMessageID};
      const confession = await confessionsModel.findOne(query);
      return confession;
    } catch (error) {
        console.log(error.message, 'error getConfessionById');
    }
  }
  static async getConfessionByThreadId(threadID) {
    try {
      const query = {threadID};
      const confession = await confessionsModel.findOne(query);
      return confession;
    } catch (error) {
        console.log(error.message, 'error getConfessionById');
    }
  }
  static async getAllConfession() {
    try {
      const confessions = await confessionsModel.find({});
      return confessions;
    } catch (error) {
        console.log(error.message);
    }
  }
}

module.exports = { ConfessionService };