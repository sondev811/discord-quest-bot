const { farmItemModel } = require("../models/farmItem.model");
const { seedModel } = require("../models/seed.model");

class SeedService {

  static async getAllSeed() {
    try {
      const seeds = await seedModel.find({});
      return seeds;
    } catch (error) {
        console.log(error, '[getAllSeed]');
    }
  }

  static async getAllFarmItems() {
    try {
      const seeds = await farmItemModel.find({});
      return seeds;
    } catch (error) {
        console.log(error, '[getAllFarmItems]');
    }
  }
}

module.exports = { SeedService };
