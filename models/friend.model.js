const { default: mongoose } = require("mongoose");
process.env.TZ = 'Asia/Bangkok';

const friendModel = new mongoose.Schema({
  discordIdFirst: { type: String, required: true },
  discordIdLast: { type: String, required: true },
  intimacyPoints: { type: Number, default: 0, required: true },
  friendDate: { type: Date, default: new Date() }
});

module.exports = mongoose.model('friends', friendModel);