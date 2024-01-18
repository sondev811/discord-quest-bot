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
  getFarmShop: 'getFarmShop',
  getFarmItem: 'getFarmItem',
  getFarmItemDetail: 'getFarmItemDetail',
  getImShop: 'getImShop',
  getDetailGift: 'getDetailGift',
  getDetailRole: 'getDetailRole',
  getDetailIntimacy: 'getDetailIntimacy',
  purchaseSuccess: 'purchaseSuccess',
  removeGift: 'removeGift',
  removeRole: 'removeRole',
  removeQuest: 'removeQuest',
  guideIntimacyShop: 'guideIntimacyShop',
  sendResultPurchaseIntimacyShop: 'sendResultPurchaseIntimacyShop',
  purchasedFarmItem: 'purchasedFarmItem',
  getLiveStockSeed: 'getLiveStockSeed'
}

const friendActionType = {
  friendRequest: 'friendRequest',
  getAllRelationship: 'getAllRelationship',
  getRelationship: 'getRelationship',
  gift: 'gift',
  guide: 'guide',
  guideCraft: 'guideCraft',
  marrySuccess: 'marrySuccess'
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
  farm: (quantity, placeChannel) => `Trồng ${quantity} ${placeChannel}.`,
};

const purchaseQuantity = {
  buyOne: 1,
  buyFive: 5,
  buyTen: 10,
  buyFifty: 50
}

const purchaseFarmQuantity = {
  buyOneFarm: 1,
  buyFiveFarm: 5,
  buyTenFarm: 10,
  buyFiftyFarm: 50,
  custom: (quantity) => Number(quantity)
}

const currency = {
  silver: 'silver',
  gold: 'gold'
}

const emoji = {
  blank: '<:blank:1175360700093317221>',
  redDot: '<a:reddot:1175047555885842472>',
  imPoint: '<a:intimacyPoint:1175364182816849990>',
  giftBox: '<a:gift_box:1174301397886439484>',
  checked: '<a:checked:1174312599085650000>',
  weddingRing: '<:wedding_ring:1175357600708186112>',
  weddingTreasure: '<a:weddingreasure:1175353026555416586>',
  friendTreasure: '<a:friendtreasure:1175353021635498116>',
  weddingScroll: '<:scroll_wedding:1175357593963741225>',
  weddingResource: '<:resource:1175357590486650900>',
  giftShop: '<a:gift_shop:1175361765530419300>',
  roleShop: '<a:roles_shop:1175361769317863424>',
  questShop: '<a:quest_shop:1175361771180146710>',
  pointShop: '<a:point_shop:1175362917244358676>',
  farmShop: '<:farm_shop:1181286185188999208>',
  fiveDot: '<a:dots:1175372021807468564>',
  yellowDot: '<a:yellowDot:1175372027377504327>',
  greenDot: '<a:greenDot:1175372023611019285>',
  ruby: '<a:ruby:1175373347945730068>',
  ruby2: '<a:ruby2:1175373355730358352>',
  royal: '<a:royal:1175374507507191838>',
  nitro: '<a:nitro:1175374516768223272>',
  fiveDotX: '<a:fiveDotX:1175374510137028618>',
  fix: '<a:pepehacker:1175374728748347463>',
  certificate: '<:certificate:1175398855672598608>',
  paper: '<:paper:1176434777868476447>',
  prev: '<a:back_to_board:1174295696522874890>',
  next: '<a:right:1176098056656142366>',
// ----------------------------------
  silverTicket: '<:silverticket:1178637939492794438>',
  goldenTicket: '<:goldenticket:1178637655823626301>',
  shopItem: '<:leu_sieuthi:1171863524251795557>',
  village: '<:village:1178638797123100775>'
  
}

const friendshipData = {
  friend: 'đang là **bạn bè**',
  bestFriend: `đang là **bạn thân**`,
  soulmate: 'đang là **tri kỷ**',
  married: 'đã **kết hôn**',
}

const friendshipName = {
  friend: 'bạn bè',
  bestFriend: `bạn thân`,
  soulmate: 'tri kỷ',
  married: 'kết hôn',
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
  roleShop: 'https://cdn.discordapp.com/emojis/1172069398098477087.png',
  farmShop: 'https://cdn.discordapp.com/emojis/1181286185188999208.png',
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
  rankingTrophy,
  friendshipData,
  friendshipName,
  purchaseFarmQuantity
};