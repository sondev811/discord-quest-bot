const mongoose = require('mongoose');

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
  SUBMIT_ITEM: 'submit_items'
};

const TaskTypeEnum = {
  DAILY: 'daily',
  WEEK: 'week'
}

const RewardEnum = {
  SILVER_TICKET : 'silver_ticket',
  GOLD_TICKET : 'gold_ticket',
  GIFT: 'gift',
  QUEST_RESET: 'QUEST_RESET'
}

const questSchema = new mongoose.Schema({
  id: { type: String, required: true },
  type: { type: String, enum: Object.values(TaskTypeEnum), required: true },
  description: { type: String, required: true },
  action: { type: String, enum: Object.values(ActionEnum), required: true },
  placeChannel: { type: String },
  minCompletionCriteria: { type: Number, required: true },
  maxCompletionCriteria: { type: Number, required: true },
  rewards: [
    {
      type: { type: String, enum: Object.values(RewardEnum), required: true },
      minQuantity: { type: Number, required: true },
      maxQuantity: { type: Number, required: true },
      id: { type: String }
    }
  ]
});

module.exports = { 
  questModel : mongoose.model('Quest', questSchema),
  questSchema, 
  TaskTypeEnum, 
  ActionEnum,
  RewardEnum
};