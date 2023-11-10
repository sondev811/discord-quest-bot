const friendModel = require("../models/friend.model");

class FriendService {

  static async createRelationship(body) {
    try {
      const newRelationshipModel = new friendModel(body);
      const newRelationship = await newRelationshipModel.save();
      return newRelationship;
    } catch (error) {
      console.log(error);
      return null;
    }
  }

  static async removeRelationship(userOne, userTwo) {
    try {
      const conditions = {
        $or: [
          { $and: [{ discordIdFirst: userOne }, { discordIdLast: userTwo }] },
          { $and: [{ discordIdFirst: userTwo }, { discordIdLast: userOne }] }
        ]
      };
      const removed = await friendModel.deleteMany(conditions);
      return removed;
    } catch (error) {
      console.log(error);
    }
  }

  static async updateIntimacyPoints(userOne, userTwo, intimacyPoints) {
    try {
      const conditions = {
        $or: [
          { $and: [{ discordIdFirst: userOne }, { discordIdLast: userTwo }] },
          { $and: [{ discordIdFirst: userTwo }, { discordIdLast: userOne }] }
        ]
      };
      const item = await friendModel.updateMany(conditions, { $set: { intimacyPoints } });
      return item;
    } catch (error) {
        console.log(error.message);
    }
  }
}

module.exports = { FriendService };