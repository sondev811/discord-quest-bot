const { default: mongoose } = require("mongoose");
const { relationshipSchema } = require("./relationship.model");
process.env.TZ = 'Asia/Bangkok';

const friendModel = new mongoose.Schema({
  discordIdFirst: { type: String, required: true },
  discordIdLast: { type: String, required: true },
  intimacyPoints: { type: Number, default: 0, required: true },
  friendDate: { type: Date, default: new Date() },
  relationship: relationshipSchema,
  marriedDate: { type: Date },
  order: { type: Number },
  isMarried: { type: Boolean, default: false }
});

module.exports = { friendModel: mongoose.model('friends', friendModel)};