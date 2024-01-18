const mongoose = require('mongoose');
const { seedSchema } = require('./seed.model');
const { farmItemSchema } = require('./farmItem.model');

const ActionEnum = {
  MESSAGE: 'message',
  VOICE: 'voice',
  GIFT: 'gift',
  REACT_EMOJI: 'react_emoji',
  POST_CONFESSION: 'post_confession',
  REPLY_CONFESSION: 'reply_confession',
  POST_BLOG: 'post_blog',
  REPLY_POST_BLOG: 'reply_blog',
  BOOST_SERVER: 'boost_server',
  SUBMIT_ITEM: 'submit_items',
  FARM: 'farm'
};

const TaskTypeEnum = {
  DAILY: 'daily',
  WEEK: 'week'
}

const RewardEnum = {
  SILVER_TICKET : 'silver_ticket',
  GOLD_TICKET : 'gold_ticket',
  GIFT: 'gift',
  QUEST_RESET: 'questReset',
  SEED: 'seed',
  FARM_ITEM: 'farmItem',
}

const questListSchema = new mongoose.Schema({
  questType: { type: String, required: true, enums: Object.values(TaskTypeEnum) },
  completionCriteria: { type: Number, default: 100, required: true},
  description: { type: String, default: ''},
  progress: { type: Number, default: 0 },
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
      giftId: { type: String },
      intimacyPoints: { type: Number },
      description: { type: String },
      giftEmoji: { type: String },
      name: { type: String },
      valueBuff: { type: String },
      seedInfo: seedSchema,
      farmItemInfo: farmItemSchema
    }
  ],
  isReceivedReward: { type: Boolean }
});

module.exports = { 
  questListModel : mongoose.model('QuestList', questListSchema),
  questListSchema, 
};