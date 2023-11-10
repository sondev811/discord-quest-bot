const mongoose = require('mongoose');
const { RewardEnum } = require('./quest.model');

const roleSchema = new mongoose.Schema({
  name: { type: String, required: true },
  roleId: { type: String },
  description: { type: String, required: true },
  typeBuff: { type: String, enums: Object.values(RewardEnum) },
  valueBuff: { type: String }
});

roleSchema.add({ id: { type: Number, default: 1 } });

module.exports = {roleModel: mongoose.model('roles', roleSchema)};