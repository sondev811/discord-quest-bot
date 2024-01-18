const mongoose = require('mongoose');

const farmItemType = {
  herbalMedicine: 'herbalMedicine',
  wormMedicine: 'wormMedicine',
  fluMedicine: 'fluMedicine',
  diarrheadMedicine: 'diarrheadMedicine',
  planGrowth: 'planGrowth',
  liveStockFood: 'liveStockFood',
  chickenFood: 'planGrowth'
}
// planting time
const farmItemSchema = new mongoose.Schema({
  name: { type: String, required: true },
  type: { type: String, enums: Object.values(farmItemType), required: true },
  description: { type: String, required: true },
  emoji: { type: String, required: true },
});

module.exports = { farmItemModel: mongoose.model('farmItem', farmItemSchema), farmItemSchema, farmItemType };