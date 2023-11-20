const mongoose = require('mongoose');
const { levelSchema } = require('./level.model');
const { ActionEnum } = require('./quest.model');
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
  CERTIFICATE: 'certificate'
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
          questId: { type: String, require: true },
          completionCriteria: { type: Number, default: 0, required: true },
          description: { type: String, default: ''},
          progress: { type: Number, default: 0 }, // tiến độ
          action: { type: String, enum: Object.values(ActionEnum), required: true },
          placeChannel: { type: String },
          rewards: [
            {
              rewardType: {
                type: String,
                enum: Object.values(RewardEnum),
                required: true,
              },
              quantity: { type: Number, required: true },
              giftId: {
                type: String,
              }
            }
          ], // mảng phần thưởng, có thể là ticket + quà tặng
          isReceivedReward: { type: Boolean } // đã nhận phần thưởng?
        }
      ]
    },
    weekQuestsReceived: {
      timeReceivedQuest: { type: Date, default: null },
      quests: [
        {
          questId: { type: String, require: true },
          completionCriteria: { type: Number, default: 100, required: true},
          description: { type: String, default: ''},
          progress: { type: Number, default: 0 }, // tiến độ
          action: { type: String, enum: Object.values(ActionEnum), required: true },
          placeChannel: { type: String },
          rewards: [
            {
              rewardType: {
                type: String,
                enum: Object.values(RewardEnum),
                required: true,
              },
              quantity: { type: Number, required: true },
              giftId: { type: String, default: '' },
              description: { type: String },
              giftEmoji: { type: String },
              name: { type: String },
              intimacyPoints: { type: Number },
              valueBuff: { type: String, default: ''}
            }
          ], // mảng phần thưởng, có thể là ticket + quà tặng
          isReceivedReward: { type: Boolean } // đã nhận phần thưởng?
        }
      ]
    }
  },
  giftsGiven: [
    {
      _id: { type: mongoose.Schema.Types.ObjectId, required: true },
      giftEmoji: { type: String, required: true },
      name: { type: String, required: true },
      quantity: { type: Number, default: 0, required: true }
    }
  ],
  joinVoiceDate: { type: Date, default: null },
  maxFriend: { type: Number, default: 5 }
});

module.exports = { userModel: mongoose.model('users', userSchema), BagItemType};