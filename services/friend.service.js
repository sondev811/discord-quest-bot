const { friendModel } = require("../models/friend.model");
const { relationshipModel } = require("../models/relationship.model");
const { specialItemModel, specialItemType } = require("../models/specialItem.model");

class FriendService {

  static async createRelationship(body) {
    try {
      const newRelationshipModel = new friendModel(body);
      const newRelationship = await newRelationshipModel.save();
      return newRelationship;
    } catch (error) {
      console.log(error, '[createRelationship]');
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
      console.log(error, '[removeRelationship]');
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
      console.log(error, '[updateIntimacyPoints]');
    }
  }

  static async getRelationShip(userOne, userTwo) {
    try {
      const conditions = {
        $or: [
          { $and: [{ discordIdFirst: userOne }, { discordIdLast: userTwo }] },
          { $and: [{ discordIdFirst: userTwo }, { discordIdLast: userOne }] }
        ]
      };
      const relationShip = await friendModel.findOne(conditions);
      return relationShip;
    } catch (error) {
      console.log(error, '[updateIntimacyPoints]');
    }
  }

  static async updateFriendRelationship(userOne, userTwo, data) {
    try {
      const conditions = {
        $or: [
          { $and: [{ discordIdFirst: userOne }, { discordIdLast: userTwo }] },
          { $and: [{ discordIdFirst: userTwo }, { discordIdLast: userOne }] }
        ]
      };
      const userUpdated = await friendModel.updateMany(conditions, { $set: { relationship: data } });
      return userUpdated;
    } catch (error) {
      console.log(error, '[updateFriendRelationship]');
      return null;
    }
  }

  static async updateFriendRelationshipDateAndOrder(userOne, userTwo, marriedDate, order) {
    try {
      const conditions = {
        $or: [
          { $and: [{ discordIdFirst: userOne }, { discordIdLast: userTwo }] },
          { $and: [{ discordIdFirst: userTwo }, { discordIdLast: userOne }] }
        ]
      };
      const userUpdated = await friendModel.updateMany(conditions, { $set: { marriedDate, order, isMarried: true } });
      return userUpdated;
    } catch (error) {
      console.log(error, '[updateFriendRelationshipDateAndOrder]');
      return null;
    }
  }

  static async getOrderRelationship() {
    try {
      const relationship = await friendModel.find({ isMarried: true });
      return relationship;
    } catch (error) {
      console.log(error, '[getOrderRelationship]');
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
      console.log(error, '[updateIntimacyPoints]');
    }
  }

  static async getAllFriends() {
    try {
      const friends = await friendModel.find();
      return friends;
    } catch (error) {
      console.log(error, '[getAllFriends]');
    }
  }

  static async getAllRelationship() {
    try {
      const relationships = await relationshipModel.find();
      return relationships;
    } catch (error) {
      console.log(error, '[getAllRelationship]');
    }
  }

  static async getRelationshipByLevel(level) {
    try {
      const condition = { level }
      const relationship = await relationshipModel.findOne(condition);
      return relationship;
    } catch (error) {
      console.log(error, '[getRelationshipByLevel]');
    }
  }

  static async getAllRelationshipById(id) {
    try {
      const conditions = {
        $or: [
          { $and: [{ discordIdFirst: id }] },
          { $and: [{ discordIdLast: id }] }
        ]
      };
      const relationShip = await friendModel.find(conditions);
      return relationShip;
    } catch (error) {
      console.log(error, '[getAllRelationshipById]');
    }
  }

  static async getWeedingRing() {
    try {
      const condition = {
        type: specialItemType.WEEDING_RING
      }
      const weedingRing = await specialItemModel.findOne(condition);
      return weedingRing;
    } catch (error) {
      console.log(error, '[getWeedingRing]');
    }
  }
}

module.exports = { FriendService };