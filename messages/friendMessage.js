const { EmbedBuilder } = require("@discordjs/builders");
const { friendActionType, emoji } = require("../constants/general");

const level = (point) => {
  if (point <= 500) {
    return 'Bạn bè';
  } 
  if (point <= 1000) {
    return 'Bạn thân';
  }
  if (point > 1000) {
    return 'Tri kỷ';
  }
}

const renderFriendList = (friends, slot) => {
  let value = `Các mối quan hệ(${friends.length}/${slot}): \n\n`;
  if (!friends || !friends.length) return value + `${emoji.fiveDot} Chưa có`;
  friends.forEach((friend, index) => {
    if (index !== 0 && index !== friends.length) {
      value += '\n';
    }
    value+= `${emoji.fiveDot} <@${friend.discordUserId}> - ${level(friend.intimacyPoints)} - Điểm thân thiết: ${friend.intimacyPoints} ${emoji.imPoint}\n`
  });
  return value;
}

const renderGifts = (gifts) => {
  let value = 'Danh sách quà đã tặng: \n\n';
  if (!gifts || !gifts.length) return value + `${emoji.fiveDot} Chưa có`;
  value += `${emoji.fiveDot} `;
  gifts.forEach((gift, index) => {
    value+= '``x' + gift.quantity + '``' + gift.giftEmoji + gift.name + `${index < gifts.length - 1 ? ', ' : ''}`
  });
  return value;
}

const renderOwnerGifts = (gifts) => {
  let value = 'Danh sách quà tặng mà bạn đang có: \n';
  if (!gifts || !gifts.length) return value + `'${emoji.redDot} Chưa có món quà nào.`;
  value += `${emoji.redDot} `;
  gifts.forEach((gift, index) => {
    value+= '``x' + gift.quantity + '``' + `${gift.giftEmoji} ${gift.name} ${index < gifts.length - 1 ? ', ' : ''}`
  });
  return value;
}

const createFriendMessage = (type, body = {}) => {
  let embed = null;
  switch (type) {
    case friendActionType.friendRequest:
      embed = new EmbedBuilder()
      .setAuthor({
        name: `Lời mời kết bạn`,
      })
      .setDescription(`${body.username} đã gửi lời mời kết bạn. Bạn có chấp nhận kết bạn không?`)
      .setColor(0xe59b9b)
      .setFooter({ 
        text: `Bot Làng • discord.gg/langleuleuliuliu`,
        iconURL: `https://cdn.discordapp.com/avatars/1168802361481904188/3526d4d2d2283aec1df941b1b5aef6ee.png`
      })
      .setTimestamp();
      break;
    case friendActionType.getAllRelationship:
      embed = new EmbedBuilder()
      .setAuthor({
        name: `💗 Các mối quan hệ của ${body.username}`,
      })
      .setDescription(renderGifts(body.gifts) + '\n─────────────────────────\n' + renderFriendList(body.friends, body.maxFriend) + `\n`)
      .setColor(0xe59b9b)
      .setThumbnail(`https://cdn.discordapp.com/avatars/${body.discordUserId}/${body.avatar}.png`)
      .setFooter({ 
        text: `Bot Làng • discord.gg/langleuleuliuliu`,
        iconURL: `https://cdn.discordapp.com/avatars/1168802361481904188/3526d4d2d2283aec1df941b1b5aef6ee.png`
      })
      .setTimestamp();
      break;
    case friendActionType.getRelationship:
      embed = new EmbedBuilder()
      .setAuthor({
        name: `💗 Mối quan hệ của ${body.username} và ${body.targetUsername}`,
      })
      .setDescription(`${emoji.blank}${emoji.redDot} Bạn và <@${body.targetId}> đang là **${level(body.intimacyPoints)}**\n${emoji.blank}${emoji.redDot} Điểm thân mật: **${body.intimacyPoints}**${emoji.imPoint}\n${emoji.blank}${emoji.redDot} Hai bạn đã đồng hành với nhau được **${body.dateConverted}** ngày\n${emoji.blank}${emoji.redDot} Ngày kết bạn: ${body.date}`)
      .setColor(0xe59b9b)
      .setThumbnail(`https://cdn.discordapp.com/avatars/${body.discordUserId}/${body.avatar}.png`)
      .setFooter({ 
        text: `Bot Làng • discord.gg/langleuleuliuliu`,
        iconURL: `https://cdn.discordapp.com/avatars/1168802361481904188/3526d4d2d2283aec1df941b1b5aef6ee.png`
      })
      .setTimestamp();
      break;
    case friendActionType.gift:
      embed = new EmbedBuilder()
      .setAuthor({
        name: `Chọn món quà bạn muốn tặng ${body.targetUsername}`,
      })
      .setDescription(renderOwnerGifts(body.gifts) + `\n${emoji.redDot} Bạn có thể mua qua từ shop hoặc nhận từ nhiêm vụ tuần.`)
      .setColor(0xe59b9b)
      .setFooter({ 
        text: `Bot Làng • discord.gg/langleuleuliuliu`,
        iconURL: `https://cdn.discordapp.com/avatars/1168802361481904188/3526d4d2d2283aec1df941b1b5aef6ee.png`
      })
      .setTimestamp();
      break;
    case friendActionType.giftSuccess:
        embed = new EmbedBuilder()
        .setTitle(`${emoji.giftBox} Tặng quà thành công`)
        .setDescription(`${emoji.redDot}<@${body.userId}> đã tặng cho <@${body.targetId}>` + ' ``x1``' + `${body.giftEmoji} ${body.giftName}\n${emoji.redDot}Độ thân mật của hai bạn đã tăng thêm ${body.intimacyPoints} điểm`)
        .setColor(0xe59b9b)
        .setFooter({ 
          text: `Bot Làng • discord.gg/langleuleuliuliu`,
          iconURL: `https://cdn.discordapp.com/avatars/1168802361481904188/3526d4d2d2283aec1df941b1b5aef6ee.png`
        })
        .setTimestamp();
        break;
    case friendActionType.guide:
      embed = new EmbedBuilder()
      .setTitle(`${emoji.ruby} Hướng dẫn chức năng bạn bè`)
      .setDescription(`${emoji.redDot} Thêm bạn:\n ${emoji.blank} » Chức năng thêm bạn giúp bạn có thể thêm bạn với một người đã đăng ký sử dụng bot trong server.\n ${emoji.blank} » Mặc định slot bạn bè tối đa của mỗi người sẽ là 5, để có thêm slot thì bạn phải mua thêm slot với giá 1500 ${emoji.silverTicket}\n ${emoji.blank} » Bạn không thể thêm bạn khi slot của bạn hoặc slot của đối phương đã đầy.\n ${emoji.blank} » Sử dụng lệnh /leuthemban và chọn người bạn muốn thêm bạn \n\n ${emoji.redDot} Xóa bạn:\n ${emoji.blank} » Chức năng xóa bạn giúp bạn xóa một người trong danh sách bạn bè của bạn. \n ${emoji.blank} » Khi xóa thì mọi dữ liệu về mối quan hệ sẽ bị xóa và không thể khôi phục \n ${emoji.blank} » Sử dụng lệnh /leuxoaban và chọn người bạn muốn thêm xóa`)
      .setColor(0xe59b9b)
      .setFooter({ 
        text: `Bot Làng • discord.gg/langleuleuliuliu`,
        iconURL: `https://cdn.discordapp.com/avatars/1168802361481904188/3526d4d2d2283aec1df941b1b5aef6ee.png`
      })
      .setTimestamp();
      break;
    default:
      break;
  }
  return embed;
};
module.exports = { createFriendMessage };