const { levelModel } = require("../models/level.model");

class LevelService {

  static async getAllLevel() {
    try {
      const levels = await levelModel.find({});
      return levels;
    } catch (error) {
        console.log(error, '[getAllLevel]');
    }
  }

  static async getLevelByValue(value) {
    try {
      const query = { value }
      const levels = await levelModel.find(query);
      return levels;
    } catch (error) {
        console.log(error, '[getLevelByValue]');
    }
  }
}

module.exports = { LevelService };