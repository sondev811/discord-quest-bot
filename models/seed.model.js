const mongoose = require('mongoose');

const seedType = {
  plant: 'plant',
  fish: 'fish',
  livestock: 'livestock'
}
// planting time
const seedSchema = new mongoose.Schema({
  name: { type: String, required: true },
  type: { type: String, enums: Object.values(seedType), required: true },
  description: { type: String, required: true },
  seedEmoji: { type: String, required: true },
  babyEmoji: { type: String, required: true },
  adultEmoji: { type: String, required: true },
  growthTime: { type: Number, required: true, default: 1 },
  harvestTimes: { type: Number, required: true },
  eachTimeHarvest: { type: Number},
  priceHarvest: { type: Number, required: true },
  priceProduct: { type: Number },
});

module.exports = { seedModel: mongoose.model('seeds', seedSchema), seedSchema, seedType };