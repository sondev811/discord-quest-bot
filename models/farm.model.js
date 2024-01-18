const mongoose = require('mongoose');
const { seedSchema } = require('./seed.model');

const farmType = {
  plant: 'plant',
  cage: 'cage',
  aquarium: 'aquarium',
}

// planting time
const farmSchema = new mongoose.Schema({
  info: seedSchema,
  type: { type: String, required: true, enums: Object.values(farmType) },
  plantingTime: { type: Date, required: true },
  sick: {
    isGotWeed: {  type: Boolean, required: true, default: false },
    isGotWorm: {  type: Boolean, required: true, default: false },
    isFlu: {  type: Boolean, required: true, default: false },
    isDiarrhea: {  type: Boolean, required: true, default: false },
  },
  harvestTimes: {  type: Number },
  beforeTimeHarvest: { type: Date },
  satiety: { type: Number, default: 100 },
  health: { type: Number, default: 100 },
  userId: { type: String, required: true },
});

module.exports = { farmModel: mongoose.model('farms', farmSchema), farmSchema, farmType };