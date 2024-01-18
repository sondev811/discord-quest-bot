const { EmbedBuilder } = require("@discordjs/builders");
const { shopActionType, emoji, imageCommand } = require("../constants/general");
const { intimacyShopType } = require("../models/intimacyShop");
const { farmShopType } = require("../models/farmShop.model");

const renderGift = (gifts) => {
  let data = '';
  gifts.forEach(gift => {
    data += ` ${emoji.shopItem} ${gift.giftInfo.giftEmoji} ` + '``'+ gift.giftInfo.name +'``' + ` » ${gift.priceSilver} ${emoji.silverTicket} | ${gift.priceGold} ${emoji.goldenTicket} » ${gift.giftInfo.intimacyPoints} thân mật ${emoji.imPoint}\n\n`
  })
  return data;
}

const renderRole = (roles) => {
  let data = '';
  roles.forEach(role => {
    data += ` ${emoji.shopItem} <@&${role.roleInfo.roleId}> » ${role.priceSilver} ${emoji.silverTicket} ${role.priceGold !== null ? `| ${role.priceGold} ${emoji.goldenTicket}` : ''}` + `» ${role.roleInfo.description}\n\n`;
  })
  return data;
}

const renderQuestItem = (questItems) => {
  let data = '';
  questItems.forEach(item => {
    data += ` ${emoji.shopItem} ${item.questItem.emoji} ` + '``'+ item.questItem.name +'``' + ` » ${item.priceSilver} ${emoji.silverTicket} | ${item.priceGold} ${emoji.goldenTicket}\n\n`
  })
  return data;
}

const renderImItem = (intimacyItem) => {
  let data = '';
  intimacyItem.forEach(item => {
    const name = item.type === intimacyShopType.treasureBox ? item.treasureBoxInfo.name : item.specialInfo.name;
    const price = `${item.silverTicket ? `${item.intimacyPrice}${emoji.imPoint} + ${item.silverTicket}${emoji.silverTicket}` : item.intimacyPrice + emoji.imPoint}`;
    data += ` ${emoji.shopItem} ${ item.type === intimacyShopType.treasureBox ? item.treasureBoxInfo.emoji : item.specialInfo.emoji} ` + '``'+ name +'``' + ` » ${price}\n\n`
  })
  return data;
}

const renderGiftReward = (gifts) => {
  let data = '';
  gifts.forEach((gift, index) => {
    data += '``x' + gift.quantity + '``' + gift.giftEmoji + gift.name + `${index < gifts.length - 1 ? ', ' : ''}`;
  })
  return data;
}

const renderFarmItem = (data) => {
  let render = '';
  data.forEach(item => {
    render += ` ${emoji.shopItem} ${item.type === farmShopType.seed ? item.seedInfo.seedEmoji : item.farmItemInfo.emoji}` + 
    '``'+ (item.type === farmShopType.seed ? item.seedInfo.name : item.farmItemInfo.name) +'``' + ` » ${item.priceSilver} ${emoji.silverTicket} \n ${emoji.redDot} ${item.type === farmShopType.seed ? item.seedInfo.description : item.farmItemInfo.description}\n\n`
  })
  return render; 
}

const createShopMessage = (type, body = {}) => {
  let embed = null;
  switch (type) {
    case shopActionType.getShop:
      embed = new EmbedBuilder()
      .setAuthor({
        name: `Cửa hàng Làng`,
        iconURL: `https://cdn.discordapp.com/avatars/1168802361481904188/3526d4d2d2283aec1df941b1b5aef6ee.png`
      })
      .setDescription(`${emoji.giftShop} Cửa hàng quà tặng:\n${emoji.blank}${emoji.redDot} Bán các món quà sử dụng để tặng bạn bè\n\n${emoji.roleShop} Cửa hàng role:\n${emoji.blank}${emoji.redDot} Bán các loại role trong server\n\n ${emoji.questShop} Cửa hàng vật phẩm nhiệm vụ:\n${emoji.blank}${emoji.redDot} Bán các loại vật phẩm làm nhiệm vụ và vé làm mới nhiệm vụ\n\n ${emoji.pointShop} Cửa hàng điểm thân thiết:\n${emoji.blank}${emoji.redDot} Bán role, rương vật phẩm đặc biệt bằng điểm thân thiết\n\n ${emoji.farmShop} Cửa hàng nông trại:\n${emoji.blank}${emoji.redDot} Bán các loại hạt giống, vật nuôi...\n\n─────────────────────────\nSố vé bạn đang có: \n${emoji.redDot} Vé xanh: ${body.silver} ${emoji.silverTicket}\n${emoji.redDot} Vé vàng: ${body.gold} ${emoji.goldenTicket}`)
      .setColor(0xe59b9b)
      .setFooter({ 
        text: `Bot Làng • discord.gg/langleuleuliuliu`
      })
      .setTimestamp();
      break;
    case shopActionType.getGiftShop:
      embed = new EmbedBuilder()
      .setAuthor({
        name: `Cửa hàng quà tặng`,
        iconURL: `https://cdn.discordapp.com/avatars/1168802361481904188/3526d4d2d2283aec1df941b1b5aef6ee.png`
      })
      .setDescription(renderGift(body.gifts) + `─────────────────────────\nSố vé bạn đang có:\n${emoji.redDot} Vé xanh: ${body.silver} ${emoji.silverTicket}\n${emoji.redDot} Vé vàng: ${body.gold} ${emoji.goldenTicket}`)
      .setColor(0xe59b9b)
      .setThumbnail(imageCommand.giftShop)
      .setFooter({ 
        text: `Bot Làng • discord.gg/langleuleuliuliu`
      })
      .setTimestamp();
      break;
    case shopActionType.getRoleShop:
      embed = new EmbedBuilder()
      .setAuthor({
        name: `Cửa hàng role`,
        iconURL: `https://cdn.discordapp.com/avatars/1168802361481904188/3526d4d2d2283aec1df941b1b5aef6ee.png`
      })
      .setDescription(renderRole(body.roles)+ `─────────────────────────\nSố vé bạn đang có: \n${emoji.redDot} Vé xanh: ${body.silver} ${emoji.silverTicket}\n${emoji.redDot} Vé vàng: ${body.gold} ${emoji.goldenTicket}`)
      .setColor(0xe59b9b)
      .setFooter({ 
        text: `Bot Làng • discord.gg/langleuleuliuliu`
      })
      .setThumbnail(imageCommand.roleShop)
      .setTimestamp();
      break;
    case shopActionType.getQuestShop:
      embed = new EmbedBuilder()
      .setAuthor({
        name: `Cửa hàng vật phẩm nhiệm vụ`,
        iconURL: `https://cdn.discordapp.com/avatars/1168802361481904188/3526d4d2d2283aec1df941b1b5aef6ee.png`
      })
      .setDescription(renderQuestItem(body.questItem)+ `─────────────────────────\nSố vé bạn đang có: \n${emoji.redDot} Vé xanh: ${body.silver} ${emoji.silverTicket}\n${emoji.redDot} Vé vàng: ${body.gold} ${emoji.goldenTicket}`)
      .setColor(0xe59b9b)
      .setFooter({ 
        text: `Bot Làng • discord.gg/langleuleuliuliu`
      })
      .setTimestamp();
      break;
    case shopActionType.getImShop:
      embed = new EmbedBuilder()
      .setAuthor({
        name: `Cửa hàng điểm thân mật`,
        iconURL: `https://cdn.discordapp.com/avatars/1168802361481904188/3526d4d2d2283aec1df941b1b5aef6ee.png`
      })
      .setDescription(renderImItem(body.intimacyItem)+ `─────────────────────────\n${emoji.redDot} Số điểm thân thiết đang có với <@${body.friend.discordUserId}>: ${body.friend.intimacyPoints}${emoji.imPoint}`)
      .setColor(0xe59b9b)
      .setFooter({ 
        text: `Bot Làng • discord.gg/langleuleuliuliu`
      })
      .setTimestamp();
      break;
      break;
    case shopActionType.getDetailGift:
      embed = new EmbedBuilder()
      .setAuthor({
        name: `Thông tin vật phẩm`,
        iconURL: `https://cdn.discordapp.com/avatars/1168802361481904188/3526d4d2d2283aec1df941b1b5aef6ee.png`
      })
      .setDescription(`${emoji.redDot} Tên vật phẩm: ${body.giftEmoji} ${body.name}\n\n${emoji.redDot} Giá vật phẩm: ${body.priceSilver} ${emoji.silverTicket} | ${body.priceGold} ${emoji.goldenTicket}\n\n » ${body.description}\n─────────────────────────\nSố vé bạn đang có:\n${emoji.redDot} Vé xanh: ${body.silver} ${emoji.silverTicket}\n${emoji.redDot} Vé vàng: ${body.gold} ${emoji.goldenTicket}`)
      .setColor(0xe59b9b)
      .setFooter({ 
        text: `Bot Làng • discord.gg/langleuleuliuliu`
      })
      .setTimestamp();
      break;
    case shopActionType.getDetailRole:
      embed = new EmbedBuilder()
      .setAuthor({
        name: `Thông tin vật phẩm`,
        iconURL: `https://cdn.discordapp.com/avatars/1168802361481904188/3526d4d2d2283aec1df941b1b5aef6ee.png`
      })
      .setDescription(`${emoji.redDot} Tên vật phẩm: <@&${body.roleId}>\n\n${emoji.redDot} Giá vật phẩm: ${body.priceSilver} ${emoji.silverTicket}${body.priceGold ? ` | ${body.priceGold} ${emoji.goldenTicket}` : ''} \n\n » ${body.description}\n─────────────────────────\nSố vé bạn đang có:\n${emoji.redDot} Vé xanh: ${body.silver} ${emoji.silverTicket}\n${emoji.redDot} Vé vàng: ${body.gold} ${emoji.goldenTicket}`)
      .setColor(0xe59b9b)
      .setFooter({ 
        text: `Bot Làng • discord.gg/langleuleuliuliu`
      })
      .setTimestamp();
      break;
    case shopActionType.getDetailIntimacy:
      const name = body.item.type === intimacyShopType.specialItem ? `${body.item.specialInfo.emoji} ${body.item.specialInfo.name}` : `${body.item.treasureBoxInfo.emoji} ${body.item.treasureBoxInfo.name}`;
      const price = `${body.item.silverTicket ? `${body.item.intimacyPrice}${emoji.imPoint} + ${body.item.silverTicket}${emoji.silverTicket}` : body.item.intimacyPrice + emoji.imPoint}`;
      const des = body.item.type === intimacyShopType.treasureBox ? body.item.treasureBoxInfo.description : body.item.specialInfo.description

      embed = new EmbedBuilder()
      .setAuthor({
        name: `Thông tin vật phẩm`,
        iconURL: `https://cdn.discordapp.com/avatars/1168802361481904188/3526d4d2d2283aec1df941b1b5aef6ee.png`
      })
      .setDescription(`${emoji.redDot} Tên vật phẩm: ${name}\n\n${emoji.redDot} Giá vật phẩm: ${price} \n\n » ${des}\n─────────────────────────\n${emoji.redDot} Số điểm thân thiết đang có với <@${body.friend.discordUserId}>: ${body.friend.intimacyPoints}${emoji.imPoint}\n\n ${emoji.redDot} Đây là điểm chung nên cần sự chấp nhận của 2 người, nếu vật phẩm mua có yêu cầu vé xanh thì số vé sẽ chia đôi. Khi mua bot sẽ gửi yêu cầu <@${body.friend.discordUserId}> xác nhận. \n ${emoji.redDot}` +  '``Lưu ý: Đọc kỹ hướng dẫn trước khi mua đồ trong shop này.``')
      .setColor(0xe59b9b)
      .setFooter({ 
        text: `Bot Làng • discord.gg/langleuleuliuliu`
      })
      .setTimestamp();
      break;
    case shopActionType.purchaseSuccess:
      embed = new EmbedBuilder()
      .setAuthor({
        name: `Mua vật phẩm thành công`,
        iconURL: `https://cdn.discordapp.com/avatars/1168802361481904188/3526d4d2d2283aec1df941b1b5aef6ee.png`
      })
      .setDescription(`${emoji.redDot} Tên vật phẩm: ${body.giftEmoji} ${body.name}\n${emoji.redDot} Giá vật phẩm: ${body.price} ${body.type === 'silver' || body.type === 'buyRoleSilver' || body.type === 'buyQuestItemSilver' ? `${emoji.silverTicket}` : `${emoji.goldenTicket}`}\n${emoji.redDot} Số lượng: ${body.quantity}\n ${body.type === 'silver' || body.type === 'buyRoleSilver' || body.type === 'buyQuestItemSilver' ? '<:leu_whitehouse:1170695043309375668> Làng đã thu bạn thêm 5%\n' : ''}💵 Tổng tiền: ${body.total} ${body.type === 'silver' || body.type === 'buyRoleSilver' || body.type === 'buyQuestItemSilver' ? `${emoji.silverTicket}` : `${emoji.goldenTicket}`}\n─────────────────────────\nSố vé bạn còn sau khi mua vật phẩm:\n${emoji.redDot} Vé xanh: ${body.silver} ${emoji.silverTicket}\n${emoji.redDot} Vé vàng: ${body.gold} ${emoji.goldenTicket}`)
      .setColor(0xe59b9b)
      .setFooter({ 
        text: `Bot Làng • discord.gg/langleuleuliuliu`
      })
      .setTimestamp();
      break;
    case shopActionType.removeGift:
      embed = new EmbedBuilder()
      .setAuthor({
        name: `Xóa gift`,
        iconURL: `https://cdn.discordapp.com/avatars/1168802361481904188/3526d4d2d2283aec1df941b1b5aef6ee.png`
      })
      .setDescription(renderGift(body.gifts))
      .setColor(0xe59b9b)
      .setFooter({ 
        text: `Bot Làng • discord.gg/langleuleuliuliu`
      })
      .setTimestamp();
      break;
    case shopActionType.removeRole: 
      embed = new EmbedBuilder()
      .setAuthor({
        name: `Xóa role`,
        iconURL: `https://cdn.discordapp.com/avatars/1168802361481904188/3526d4d2d2283aec1df941b1b5aef6ee.png`
      })
      .setDescription(renderRole(body.roles))
      .setColor(0xe59b9b)
      .setFooter({ 
        text: `Bot Làng • discord.gg/langleuleuliuliu`
      })
      .setTimestamp();
      break;
    case shopActionType.removeQuest: 
      embed = new EmbedBuilder()
      .setAuthor({
        name: `Xóa vật phẩm nhiệm vụ`,
        iconURL: `https://cdn.discordapp.com/avatars/1168802361481904188/3526d4d2d2283aec1df941b1b5aef6ee.png`
      })
      .setDescription(renderQuestItem(body.quests))
      .setColor(0xe59b9b)
      .setFooter({ 
        text: `Bot Làng • discord.gg/langleuleuliuliu`
      })
      .setTimestamp();
      break;
    case shopActionType.guideIntimacyShop:
      embed = new EmbedBuilder()
      .setAuthor({
        name: `Hướng dẫn cửa hàng điểm thân mật`,
        iconURL: `https://cdn.discordapp.com/avatars/1168802361481904188/3526d4d2d2283aec1df941b1b5aef6ee.png`
      })
      .setDescription(`${emoji.redDot} Điểm thân mật là điểm chung nên cần sự chấp nhận của 2 người. Khi mua bot sẽ gửi yêu cầu xác nhận tới người bạn còn lại.\n ${emoji.redDot} Số điểm thân thiết của 2 bạn sẽ bị trừ, nếu vật phẩm mua có yêu cầu vé xanh thì số vé sẽ chia đôi.\n${emoji.redDot} Rương tình bạn sẽ chứa ngẫu nhiên 3 món quà tặng, role tình bạn và nhẫn tình bạn.\n${emoji.blank} » Đối với 3 món quà ngẫu nhiên thì 2 bạn đều nhận được.\n${emoji.blank} » Đối với role thì có tỉ lệ nhận được hoặc không, nếu có thì cả 2 bạn đều nhận được. \n${emoji.blank} » Đối với nhẫn tình bạn thì luôn mở ra nhưng sẽ ngẫu nhiên một trong hai người nhận được. \n${emoji.redDot} Rương kết hôn sẽ chứa ngẫu nhiên 3 món quà tặng và vật phẩm đặc biệt dùng để ghép nhẫn kết hôn.\n${emoji.blank} » Đối với 3 món quà ngẫu nhiên thì 2 bạn đều nhận được. \n${emoji.blank} » Đối vật phẩm đặc biệt dùng để ghép nhẫn kết hôn sẽ bao gồm nguyên liệu chế tạo và bản chế tạo nhẫn. Người nhấn mua sẽ nhận được một trong hai vật phẩm này.`)
      .setColor(0xe59b9b)
      .setFooter({ 
        text: `Bot Làng • discord.gg/langleuleuliuliu`
      })
      .setTimestamp();
      break;
    case shopActionType.sendResultPurchaseIntimacyShop:
      embed = new EmbedBuilder()
      .setAuthor({
        name: `Phần thưởng mở ${body.treasureName}`,
        iconURL: `https://cdn.discordapp.com/avatars/1168802361481904188/3526d4d2d2283aec1df941b1b5aef6ee.png`
      })
      .setDescription(`${emoji.redDot}<@${body.username}> nhận được ${body.silver > 0 ? `${body.silver}${emoji.silverTicket}, ` : ''} ${body.gold > 0 ? `${body.gold}${emoji.goldenTicket},` : ''} ${renderGiftReward(body.gifts)}${body.userSpecialItem ? ', ``x1``' + `${body?.userSpecialItem?.emoji}${body?.userSpecialItem?.name}` : ''}${body.roleData ? `, Role ${body.roleData}` : ''}\n\n${emoji.redDot}<@${body.friendUserName}> nhận được ${body.silver > 0 ? `${body.silver}${emoji.silverTicket}, ` : ''} ${body.gold > 0 ? `${body.gold}${emoji.goldenTicket},` : ''} ${renderGiftReward(body.gifts)}${body.friendSpecialItem ? ', ``x1``' + `${body?.friendSpecialItem?.emoji}${body?.friendSpecialItem?.name}` : ''}${body.roleData ? `, Role ${body.roleData}` : ''}. \n\n ${emoji.redDot} Hai bạn còn ${body.point}${emoji.imPoint}`)
      .setColor(0xe59b9b)
      .setFooter({ 
        text: `Bot Làng • discord.gg/langleuleuliuliu`
      })
      .setTimestamp();
      break;
    case shopActionType.getFarmShop:
      embed = new EmbedBuilder()
      .setAuthor({
        name: `Cửa hàng nông trại`,
        iconURL: `https://cdn.discordapp.com/avatars/1168802361481904188/3526d4d2d2283aec1df941b1b5aef6ee.png`
      })
      .setDescription(`<:pumkin_tree:1184558806332624926> Cửa hàng cây trồng\n\n<:asheep:1180496405832405033> Cửa hàng vật nuôi\n\n<:foods:1180588094605500428> Cửa hàng vật phẩm\n`)
      .setColor(0xe59b9b)
      .setThumbnail(imageCommand.farmShop)
      .setFooter({ 
        text: `Bot Làng • discord.gg/langleuleuliuliu`
      })
      .setTimestamp();
      break;
    case shopActionType.getLiveStockSeed:
      embed = new EmbedBuilder()
      .setAuthor({
        name: `Cửa hàng cây trồng`,
        iconURL: `https://cdn.discordapp.com/avatars/1168802361481904188/3526d4d2d2283aec1df941b1b5aef6ee.png`
      })
      .setDescription(`<:sheep_baby:1180516310946427032> Chăn nuôi:\n` + renderFarmItem(body.liveStockSeeds) + `<:tutle_seed:1184570714968313856> Hồ cá:\n`+ renderFarmItem(body.fishSeeds) +`\n─────────────────────────\nSố vé bạn đang có:\n${emoji.redDot} Vé xanh: ${body.silver} ${emoji.silverTicket}\n${emoji.redDot} Vé vàng: ${body.gold} ${emoji.goldenTicket}`)
      .setColor(0xe59b9b)
      .setThumbnail(imageCommand.farmShop)
      .setFooter({ 
        text: `Bot Làng • discord.gg/langleuleuliuliu`
      })
      .setTimestamp();
      break;
    case shopActionType.getFarmItem:
        embed = new EmbedBuilder()
        .setAuthor({
          name: `Cửa hàng cây trồng`,
          iconURL: `https://cdn.discordapp.com/avatars/1168802361481904188/3526d4d2d2283aec1df941b1b5aef6ee.png`
        })
        .setDescription(renderFarmItem(body.data) + `─────────────────────────\nSố vé bạn đang có:\n${emoji.redDot} Vé xanh: ${body.silver} ${emoji.silverTicket}\n${emoji.redDot} Vé vàng: ${body.gold} ${emoji.goldenTicket}`)
        .setColor(0xe59b9b)
        .setThumbnail(imageCommand.farmShop)
        .setFooter({ 
          text: `Bot Làng • discord.gg/langleuleuliuliu`
        })
        .setTimestamp();
        break;
    case shopActionType.getFarmItemDetail:
      embed = new EmbedBuilder()
      .setAuthor({
        name: `Cửa hàng cây trồng`,
        iconURL: `https://cdn.discordapp.com/avatars/1168802361481904188/3526d4d2d2283aec1df941b1b5aef6ee.png`
      })
      .setDescription(`${body.data.type === farmShopType.seed ? body.data.seedInfo.seedEmoji : body.data.farmItemInfo.emoji } ${body.data.type === farmShopType.seed ? body.data.seedInfo.name : body.data.farmItemInfo.name } » ${body.data.priceSilver} ${emoji.silverTicket}\n\n » ${body.data.type === farmShopType.seed ? body.data.seedInfo.description : body.data.farmItemInfo.description}\n` + `─────────────────────────\nSố vé bạn đang có:\n${emoji.redDot} Vé xanh: ${body.silver} ${emoji.silverTicket}\n${emoji.redDot} Vé vàng: ${body.gold} ${emoji.goldenTicket}`)
      .setColor(0xe59b9b)
      .setThumbnail(imageCommand.farmShop)
      .setFooter({ 
        text: `Bot Làng • discord.gg/langleuleuliuliu`
      })
      .setTimestamp();
      break;
    case shopActionType.purchasedFarmItem:
      embed = new EmbedBuilder()
      .setAuthor({
        name: `Mua vật phẩm thành công`,
        iconURL: `https://cdn.discordapp.com/avatars/1168802361481904188/3526d4d2d2283aec1df941b1b5aef6ee.png`
      })
      .setDescription(`${emoji.redDot} Tên vật phẩm: ${body.data.type === farmShopType.seed ? body.data.seedInfo.seedEmoji : body.data.farmItemInfo.emoji} ${body.data.type === farmShopType.seed ? body.data.seedInfo.name : body.data.farmItemInfo.name }\n${emoji.redDot} Giá vật phẩm: ${body.data.priceSilver} ${emoji.silverTicket}\n${emoji.redDot} Số lượng: ${body.quantity}\n ${emoji.village} Làng đã thu bạn thêm 10%\n 💵 Tổng tiền: ${body.total}${emoji.silverTicket} \n─────────────────────────\nSố vé bạn còn sau khi mua vật phẩm:\n${emoji.redDot} Vé xanh: ${body.silver} ${emoji.silverTicket}\n${emoji.redDot} Vé vàng: ${body.gold} ${emoji.goldenTicket}`)
      .setColor(0xe59b9b)
      .setThumbnail(imageCommand.farmShop)
      .setFooter({ 
        text: `Bot Làng • discord.gg/langleuleuliuliu`
      })
      .setTimestamp();
      break;
    default:
      break;
  }
  return embed;
};
module.exports = { createShopMessage };