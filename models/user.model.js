const mongoose = require('mongoose');
const { levelSchema } = require('./level.model');
const { ActionEnum } = require('./quest.model');
const { seedSchema } = require('./seed.model');
const { farmItemSchema } = require('./farmItem.model');
process.env.TZ = 'Asia/Bangkok';

const RewardEnum = {
  SILVER_TICKET : 'silver_ticket',
  GOLD_TICKET : 'gold_ticket',
  GIFT: 'gift',
  QUEST_RESET: 'questReset'
}

const BagItemType = {
  GIFT: 'gift',
  ROLE: 'role',
  RING_PIECE: 'ringPiece',
  WEEDING_RING: 'weedingRing',
  RESET_QUEST: 'resetQuest',
  FRIEND_RING: 'friendRing',
  CERTIFICATE: 'certificate',
  SEED: 'seed',
  FARM_ITEM: 'farmItem'
}

const userSchema = new mongoose.Schema({
  discordUserId: {
    type: String,
    required: true,
    unique: true
  },
  username: { type: String, default: '' },
  tickets: {
    gold: { type: Number, default: 0 },
    silver: { type: Number, default: 0 }
  },
  level: levelSchema,
  dailyAttendance: {
    lastLoginDate: {
      type: Date,
      default: null
    },
    streak: {
      type: Number,
      default: 0
    }
  },
  friends: [
    {
      discordUserId: { type: String, required: true },
      intimacyPoints: { type: Number, default: 0, required: true },
      friendDate: { type: Date, default: new Date() }
    }
  ],
  itemBag: [
    {
      _id: { type: mongoose.Schema.Types.ObjectId, required: true },
      name: { type: String, required: true },
      description: { type: String, required: true },
      type: { type: String, enum: Object.values(BagItemType), required: true },
      roleId: { type: String },
      intimacyPoints: { type: Number },
      quantity: { type: Number, required: true, default: 0 },
      typeBuff: { type: String, enums: Object.values(RewardEnum) },
      valueBuff: { type: String },
      giftEmoji: { type: String },
      specialValue: { type: Number },
      seedInfo: seedSchema,
      farmItemInfo: farmItemSchema
    }
  ],
  totalQuestCompleted: {
    type: Number,
    default: 0
  },
  totalTicketClaimDaily: {
    type: Number,
    default: 0
  },
  quests: {
    dailyQuestsReceived: {
      timeReceivedQuest: { type: Date, default: null },
      quests: [
        {
          _id: { type: mongoose.Schema.Types.ObjectId, required: true },
          action: { type: String, required: true, enums: Object.values(ActionEnum)}
        }
      ]
    },
    weekQuestsReceived: {
      timeReceivedQuest: { type: Date, default: null },
      quests: [
        {
          _id: { type: mongoose.Schema.Types.ObjectId, required: true },
          action: { type: String, required: true, enums: Object.values(ActionEnum)}
        }
      ]
    }
  },
  giftsGiven: [
    {
      _id: { type: mongoose.Schema.Types.ObjectId, required: true },
      giftEmoji: { type: String },
      name: { type: String },
      quantity: { type: Number, default: 0 }
    }
  ],
  joinVoiceDate: { type: Date, default: null },
  maxFriend: { type: Number, default: 5 },
  farm: {
    land: { type: Number, default: 6 },
    cage: { type: Number, default: 2 },
    aquarium: { type: Number, default: 2 },
    exp: { type: Number, default: 0 },
  }
});

module.exports = { userModel: mongoose.model('users', userSchema), BagItemType, userSchema};