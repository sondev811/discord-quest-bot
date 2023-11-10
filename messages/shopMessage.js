const { EmbedBuilder } = require("@discordjs/builders");
const { shopActionType, emoji, imageCommand } = require("../constants/general");

const renderGift = (gifts) => {
  let data = '';
  gifts.forEach(gift => {
    data += ` ${emoji.shopItem} ${gift.giftEmoji} ` + '``'+ gift.name +'``' + ` » ${gift.priceSilver} ${emoji.silverTicket} | ${gift.priceGold} ${emoji.goldenTicket} » ${gift.intimacyPoints} thân mật ${emoji.imPoint}\n\n`
  })
  return data;
}

const renderRole = (roles) => {
  let data = '';
  roles.forEach(role => {
    data += ` ${emoji.shopItem} <@&${role.roleId}> » ${role.priceSilver} ${emoji.silverTicket} ${role.priceGold !== null ? `| ${role.priceGold} ${emoji.goldenTicket}` : ''}` + `» ${role.description}\n\n`;
  })
  return data;
}

const renderQuestItem = (questItems) => {
  let data = '';
  questItems.forEach(item => {
    data += ` ${emoji.shopItem} ${item.giftEmoji} ` + '``'+ item.name +'``' + ` » ${item.priceSilver} ${emoji.silverTicket} | ${item.priceGold} ${emoji.goldenTicket}\n\n`
  })
  return data;
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
      .setDescription(`<:leu_Bouquet:1169290758772244550> Cửa hàng quà tặng:\n${emoji.blank}${emoji.redDot} Bán các món quà sử dụng để tặng bạn bè\n\n<:leu_roles:1172197216690118698> Cửa hàng role:\n${emoji.blank}${emoji.redDot} Bán các loại role trong server\n\n <:leu_tag:1159222957793615943> Cửa hàng vật phẩm nhiệm vụ:\n${emoji.blank}${emoji.redDot} Bán các loại vật phẩm làm nhiệm vụ và vé làm mới nhiệm vụ\n\n─────────────────────────\nSố vé bạn đang có: \n${emoji.redDot} Vé xanh: ${body.silver} ${emoji.silverTicket}\n${emoji.redDot} Vé vàng: ${body.gold} ${emoji.goldenTicket}`)
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
      .setDescription(renderGift(body.quests))
      .setColor(0xe59b9b)
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