const { errors } = require("../constants/general");
const { userModel } = require("../models/user.model");
const customTimeout = 20000;

class UserService {
  static async updateUser(body) {
    try {
      const { discordUserId } = body;
      const query = { discordUserId }
      const userUpdated = await userModel.findOneAndUpdate(query, body, { new: true });
      return userUpdated;
    } catch (error) {
      console.log(error.message);
      return null;
    }
  }

  static async getUserById(discordUserId) {
    try {
      const query = { discordUserId };
      const user = await userModel.findOne(query).maxTimeMS(customTimeout);
      return user;
    } catch (error) {
      console.log(error.message, 'getUserById');
      throw new Error(errors.GET_USER_ERROR);
    }
  }

  static async createUser(body) {
    try {
      const newUserModel = new userModel(body);
      const newUser = await newUserModel.save();
      return newUser;
    } catch (error) {
      console.log(error.message, 'error createUser');
      throw new Error(errors.CREATE_USER_ERROR);
    }
  }

  static async updateDailyQuest(discordUserId, questId) {
    try {
      const updatedUser = await userModel.findOne({ discordUserId });
    
      if (!updatedUser) {
        throw new Error("User not found");
      }

      // Sắp xếp mảng quests theo questId
      updatedUser.quests.dailyQuestsReceived.quests.sort((a, b) => a.questId.localeCompare(b.questId));

      const questIndex = updatedUser.quests.dailyQuestsReceived.quests.findIndex(
        (quest) => quest.questId === questId
      );

      if (questIndex === -1) {
        throw new Error("Quest not found");
      }

      // Cập nhật progress
      updatedUser.quests.dailyQuestsReceived.quests[questIndex].progress += 1;

      // Lưu lại người dùng
      await updatedUser.save();

      console.log(updatedUser.quests.dailyQuestsReceived.quests);
    } catch (error) {
      console.error(error);
    }
  };

  static async updateProgressWeekQuest(discordUserId, questId) {
    try {
      const updatedUser = await userModel.findOneAndUpdate(
        { discordUserId, 'quests.weekQuestsReceived.quests.questId': questId },
        { $inc: { 'quests.weekQuestsReceived.quests.$.progress': 1 } },
        { new: true }
      );
    } catch (error) {
      console.error(error);
    }
  };

  static async updateWeekQuest(userId, questId, newProgress) {
    try {
      const user = await userModel.findOne({ discordUserId: userId });
      
      if (!user) {
        throw new Error("User not found");
      }
  
      const questIndex = user.quests.weekQuestsReceived.quests.findIndex(
        (quest) => quest.questId === questId
      );
  
      if (questIndex === -1) {
        throw new Error("Quest not found");
      }
  
      user.quests.weekQuestsReceived.quests[questIndex].progress = newProgress;
  
      await user.save();
    } catch (error) {
      console.error(error);
    }
  };

  static async getAllUser() {
    try {
      const users = await userModel.find({});
      return users;
    } catch (error) {
        console.log(error.message);
    }
  }
}

module.exports = { UserService };