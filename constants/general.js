const confessionType = {
  confessionGuideDM: 'confessionGuide',
  notifySentDM: 'notifySendDM',
  responseConfessionReview: 'responseConfessionReview',
  confessionReview: 'confessionReview',
  resolveAndRejectConfession: 'resolveAndRejectConfession',
  sendConfession: 'sendConfession',
  replyReview: 'replyReview',
  reply: 'reply',
  anonymous: 'anonymous',
  resolveAndRejectReply: 'resolveAndRejectReply',
  userInfoConfession: 'userInfoConfession',
}

const userActionType = {
  getInfo: 'getInfo',
  attended: 'attended',
  getQuest: 'getQuest',
  guide: 'guide',
  bag: 'bag',
  giveTicketSuccess: 'giveTicketSuccess',
  bxh: 'bxh'
}

const shopActionType = {
  getShop: 'getShop',
  getGiftShop: 'getGiftShop',
  getRoleShop: 'getRoleShop',
  getQuestShop: 'getQuestShop',
  getDetailGift: 'getDetailGift',
  getDetailRole: 'getDetailRole',
  purchaseSuccess: 'purchaseSuccess',
  removeGift: 'removeGift',
  removeRole: 'removeRole',
  removeQuest: 'removeQuest',
}

const friendActionType = {
  friendRequest: 'friendRequest',
  getAllRelationship: 'getAllRelationship',
  getRelationship: 'getRelationship',
  gift: 'gift',
  guide: 'guide'
}

const questActionType = {
  giftQuest: 'giftQuest',
  submitItem: 'submitItem'
}

const confessionStatus = {
  rejected: 'rejected',
  pending: 'pending',
  approved: 'approved'
}

const errors = {
  GET_USER_ERROR: 'getUserError',
  CREATE_USER_ERROR: 'createUserError',
  UPDATE_USER_ERROR: 'updateUserError',
  GET_ALL_QUEST_ERROR: 'getAllQuestError'
}

const descriptionQuest = {
  message: (quantity, placeChannel) => `Nhắn ${quantity} tin nhắn tại kênh ${placeChannel ? `<#${placeChannel}>.` : 'bất kỳ.'}`,
  voice: (quantity, placeChannel) => `Treo voice ${quantity}h tại kênh ${placeChannel ? `<#${placeChannel}>.` : 'bất kỳ.'}`,
  gift: (quantity, placeChannel) => `Tặng ${quantity} quà cho một người bất kỳ.`,
  post_confession: (quantity, placeChannel) => `Đăng ${quantity} bài confession tại kênh ${placeChannel ? `<#${placeChannel}>.` : 'bất kỳ.'}`,
  reply_confession: (quantity, placeChannel) => `Trả lời ${quantity} bài tại confession tại kênh ${placeChannel ? `<#${placeChannel}>.` : 'bất kỳ.'}`,
  post_blog: (quantity, placeChannel) => `Đăng ${quantity} bài tại kênh ${placeChannel ? `<#${placeChannel}>.` : 'bất kỳ.'}`,
  reply_blog: (quantity, placeChannel) => `Trả lời ${quantity} bài tại kênh ${placeChannel ? `<#${placeChannel}>.` : 'bất kỳ.'}`,
  boost_server: (quantity, placeChannel) => `Boost server ${quantity} lần.`,
  submit_items: (quantity, placeChannel) => `Nộp x${quantity}${placeChannel}.`,
};

const purchaseQuantity = {
  buyOne: 1,
  buyFive: 5,
  buyTen: 10,
  buyFifty: 50
}

const currency = {
  silver: 'silver',
  gold: 'gold'
}

const emoji = {
  blank: '<:BLANK:1171878207876771921>',
  redDot: '<a:emoji_354:1172023465444900905>',
  yellowDot: '<a:emoji_353:1172023449242316881>',
  greenDot: '<a:emoji_357:1172030794546544721>',
  giftBox: '<a:leu_gift:1171860063900684378>',
  silverTicket: '<:leu_ticket:1168509616938815650>',
  goldenTicket: '<:leu_ticket_vang:1169279388370604062>',
  fiveDot: '<a:Leu_dots:1171861138812698654>',
  checked: '<a:check:1081693873807556648>',
  ruby: '<a:leu_ruby2:1166533946604007464>',
  warning: '<a:__:1081693459771039774>',
  imPoint: '<a:Leu_blue_hearts:1171862703384572024>',
  nitro: '<a:nitro:1137269463209742388>',
  fiveDotX: '<a:leu_Dancing_Lines:1171864141301039167>',
  shopItem: '<:leu_sieuthi:1171863524251795557>',
  fix: '<a:pepehacker:1081853612768108564>',
  royal: '<a:Royalrole:1159214875936034956>',
  ruby2: '<a:leu_ruby3:1166534072894505080>',
}

const levelImage = {
  1: 'https://cdn.discordapp.com/emojis/1171857102340366538.png',
  2: 'https://cdn.discordapp.com/emojis/1171857462488477789.png',
  3: 'https://cdn.discordapp.com/emojis/1171858575572865106.png',
  4: 'https://cdn.discordapp.com/emojis/1171858579842674851.png',
  5: 'https://cdn.discordapp.com/emojis/1171862515559436288.png',
  6: 'https://cdn.discordapp.com/emojis/1171862811618578534.png',
  7: 'https://cdn.discordapp.com/emojis/1171862961233612833.png',
}

const imageCommand = {
  bag: 'https://cdn.discordapp.com/emojis/1171865402922516542.png',
  help: 'https://cdn.discordapp.com/emojis/1171868775449120769.png',
  daily: 'https://cdn.discordapp.com/emojis/1171869050683531335.png',
  giftShop: 'https://cdn.discordapp.com/emojis/1171865808192946186.png',
  roleShop: 'https://cdn.discordapp.com/emojis/1172069398098477087.png'
}

const rankingTrophy = {
  0: '<:top1:1172464506287431721>',
  1: '<:top2:1172464492169408582>',
  2: '<:top3:1172464501828886539>',
  3: '<:top4:1172464496304984074>',
  4: '<:top5:1172464489455702046>',
}

module.exports = { 
  confessionType, 
  confessionStatus, 
  userActionType, 
  errors, 
  descriptionQuest, 
  shopActionType,
  purchaseQuantity,
  currency,
  friendActionType,
  questActionType,
  emoji,
  levelImage,
  imageCommand,
  rankingTrophy
};