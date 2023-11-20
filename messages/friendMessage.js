const { EmbedBuilder } = require("@discordjs/builders");
const { friendActionType, emoji, friendshipData, friendshipName } = require("../constants/general");
const { relationshipType } = require("../models/relationship.model");
const { AttachmentBuilder } = require("discord.js");

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
    value+= `${emoji.fiveDot} <@${friend.discordIdLast}> - ${friend.relationship.name === relationshipType.married ? `đã ${friendshipName[friend.relationship.name]}` : friendshipName[friend.relationship.name]} - Điểm thân thiết: ${friend.intimacyPoints} ${emoji.imPoint}\n`
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
    value+= '``x' + gift.quantity + '``' + `${gift.giftEmoji} ${gift.name}${index < gifts.length - 1 ? ', ' : ''}`
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
      .setTitle(`${emoji.pointShop} Các mối quan hệ của ${body.username}`)
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
      .setTitle(`${emoji.pointShop} Mối quan hệ của ${body.username} và ${body.targetUsername}`)
      .setDescription(`${emoji.blank}${emoji.redDot} Bạn và <@${body.targetId}> ${friendshipData[body.friendship]}\n${emoji.blank}${emoji.redDot} Điểm thân mật: **${body.intimacyPoints}**${emoji.imPoint}\n${emoji.blank}${emoji.redDot} Hai bạn đã đồng hành với nhau được **${body.dateConverted}** ngày\n${emoji.blank}${emoji.redDot} Ngày kết bạn: ${body.date} ${body.isMarried ? `\n${emoji.blank}${emoji.redDot} Ngày kết hôn: ${body.marriedDate}` : ''} ${body.isMarried ? `\n${emoji.blank}${emoji.redDot} Hai bạn là cặp đôi đã kết hôn ${body.order} của làng` : ''}`)
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
      .setDescription(`${emoji.redDot} Thêm bạn:\n ${emoji.blank} » Chức năng thêm bạn giúp bạn có thể thêm bạn với một người đã đăng ký sử dụng bot trong server.\n ${emoji.blank} » Mặc định slot bạn bè tối đa của mỗi người sẽ là 5, để có thêm slot thì bạn phải mua thêm slot với giá 1500 ${emoji.silverTicket}\n ${emoji.blank} » Bạn không thể thêm bạn khi slot của bạn hoặc slot của đối phương đã đầy.\n ${emoji.blank} » Sử dụng lệnh /leuthemban và chọn người bạn muốn thêm bạn \n\n ${emoji.redDot} Xóa bạn:\n ${emoji.blank} » Chức năng xóa bạn giúp bạn xóa một người trong danh sách bạn bè của bạn. \n ${emoji.blank} » Khi xóa thì mọi dữ liệu về mối quan hệ sẽ bị xóa và không thể khôi phục \n ${emoji.blank} » Khi xóa bạn bè với người đã kết hôn thì bot sẽ thu lại role, nhẫn kết hôn và giấy chứng nhận của cả 2 bạn. \n ${emoji.blank} » Sử dụng lệnh /leuxoaban và chọn người bạn muốn thêm xóa`)
      .setColor(0xe59b9b)
      .setFooter({ 
        text: `Bot Làng • discord.gg/langleuleuliuliu`,
        iconURL: `https://cdn.discordapp.com/avatars/1168802361481904188/3526d4d2d2283aec1df941b1b5aef6ee.png`
      })
      .setTimestamp();
      break;
    case friendActionType.guideCraft:
      embed = new EmbedBuilder()
      .setTitle(`${emoji.ruby} Hướng dẫn chức năng tăng cấp độ thân thiết và ghép nhẫn kết hôn`)
      .setDescription(`${emoji.redDot} Tăng cấp độ thân thiết:\n ${emoji.blank} » Chức năng giúp bạn có thể tăng cấp độ thân thiết với một người bạn. \n ${emoji.blank} » Cấp độ thân thiết sẽ có 4 cấp độ: bạn bè, bạn thân, tri kỷ và kết hôn\n ${emoji.blank} » Để nâng cấp từ cấp độ **bạn bè** lên **bạn thân** thì điểm thân mật cần đạt 750${emoji.imPoint} \n ${emoji.blank} » Để nâng cấp từ cấp độ **bạn thân** lên **tri kỷ** thì điểm thân mật cần đạt 1250${emoji.imPoint}\n ${emoji.blank} » Khi bạn nâng cấp điểm thân mật sẽ không bị mất đi. \n\n${emoji.redDot} Chức năng kết hôn: \n ${emoji.blank} » Chức năng kết hôn sẽ xuất hiện khi độ thân thiết của hai bạn đạt cấp *tri kỷ*\n ${emoji.blank} » Để có thể hôn thì bạn cần có ${emoji.weddingRing} **Nhẫn kết hôn** và ${emoji.certificate} **giấy chứng nhận kết hôn**\n ${emoji.blank} » Nhẫn kết hôn kiếm được bằng cách sử dụng chức năng ghép nhẫn kết hôn.\n ${emoji.blank} » Giấy chứng nhận kết hôn kiếm được bằng cách mua trong **shop điểm thân mật**. \n ${emoji.blank}`+ '» ``Lưu ý 1: Bạn chỉ có thể kết hôn với một người duy nhất, nếu muốn kết hôn với người khác bạn phải hủy kết bạn với người bạn đã kết hôn.``\n' + emoji.blank +'» ``Lưu ý 2: Khi bạn hủy kết bạn với một người bạn đã kết hôn thì bot sẽ thu lại nhẫn kết hôn, giấy chứng nhận kết hôn và role của 2 bạn.``' + `\n\n ${emoji.redDot} Ghép nhẫn kết hôn: \n${emoji.blank} » Chức năng giúp bạn có thể ghép nhẫn kết hôn.\n ${emoji.blank} » Để có thể ghép được nhẫn kết hôn bạn cần ${emoji.weddingScroll} **cuộn chế tạo nhẫn** và ${emoji.weddingResource} **nguyên liệu chế tạo nhẫn**.\n ${emoji.blank} » Bạn có thể kiếm **cuộn chế tạo** và **nguyên liệu chế tạo** bằng cách mở **rương kết hôn** ở **shop điểm thân mật**\n ${emoji.blank}`+ '» ``Lưu ý 1: Sau khi bạn tìm đủ thành phần và tiến hành ghép nhẫn kết hôn thì tất cả nguyên liệu của bạn sẽ mất đi kể cả số lượng còn bao nhiêu.``\n' + emoji.blank + '» ``Lưu ý 2: Khi một trong hai đã kết hôn bạn sẽ không thể thấy chức năng này.``')
      .setColor(0xe59b9b)
      .setFooter({ 
        text: `Bot Làng • discord.gg/langleuleuliuliu`,
        iconURL: `https://cdn.discordapp.com/avatars/1168802361481904188/3526d4d2d2283aec1df941b1b5aef6ee.png`
      })
      .setTimestamp();
      break;
    case friendActionType.marrySuccess:
      embed = new EmbedBuilder()
      .setDescription(`${emoji.pointShop} Thông báo kết hôn giữa <@${body.user}> và <@${body.friend}> \n\n${emoji.redDot} Ngày kết hôn: **${body.marriedDate}**\n ${emoji.redDot} Cặp đôi ${body.order} của Làng\n ${emoji.redDot}<@${body.friend}> nhận x1 ${emoji.weddingRing} Nhẫn kết hôn, role ${body.role}. \n ${emoji.redDot} <@${body.user}> nhận role ${body.role}\n─────────────────\n${emoji.royal} <@${body.serverOwner}>: Chúc hai bạn mãi mãi hạnh phúc bên nhau <3`)
      .setColor(0xe59b9b)
      .setThumbnail('https://cdn.discordapp.com/emojis/1175424843626332160.gif')
      .setImage(`attachment://${body.user}${body.friend}.png`)
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