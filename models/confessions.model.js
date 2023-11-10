const mongoose = require('mongoose');

const authorSchema = new mongoose.Schema({
  id: String,
  username: String,
  avatar: String,
});

const confessionsModel = new mongoose.Schema({
  id: {
    type: Number,
    required: true
  },
  content: {
    type: String,
    required: true
  },
  reviewMessageID: {
    type: String,
    required: true
  },
  author: {
    type: authorSchema,
    required: true
  },
  createdAt: {
    type: Date,
    required: true
  },
  reviewedBy: {
    type: String,
    "default": null
  },
  reviewedAt: {
    type: Date,
    "default": null
  },
  status: {
    type: String,
    required: true
  },
  messageID: {
    type: String,
    "default": null
  },
  threadID: {
    type: String,
    "default": null
  },
  replies: {
    type: Array,
    "default": []
  },
  isAnonymousConfession: {
    type: Boolean,
    "default": true
  }
});

module.exports = mongoose.model('confessions', confessionsModel);