const { EmbedBuilder } = require("@discordjs/builders");
const { confessionType } = require("../constants/general");

const confessionMessages = (type, body = {}) => {
  let embed = null;
  switch (type) {
    case confessionType.confessionReview:
      embed = new EmbedBuilder()
        .setTitle(`Confession chờ duyệt`)
        .setDescription(body.content)
        .addFields([
          {
            name: 'Người gửi',
            value: `<@${body.userId}>`,
          }
        ])
        .setColor(0xe59b9b)
        .setTimestamp()
        .setFooter({ text: `Nhấn các nút ở dưới để duyệt/từ chối confession!`});
      break;
    case confessionType.resolveAndRejectConfession:
      embed = new EmbedBuilder()
        .setTitle(body.title)
        .setDescription(body.content)
        .setFields([
          {
            name: 'Người gửi',
            value: `<@${body.userId}>`,
          },
          {
            name: `${body.isResolve ? 'Duyệt' : 'Từ chối'} bởi`,
            value: `<@${body.reviewer}>`
          }
        ])
        .setColor(0xe59b9b)
        .setTimestamp()
      break;
    case confessionType.replyReview: 
      embed = new EmbedBuilder()
        .setTitle(`Reply chờ duyệt`)
        .setDescription(`<@${body.userId}> đã reply: ${body.content} trên confession <#${body.threadID}>`)
        .setColor(0xe59b9b)
        .setTimestamp()
        .setFooter({ text: `Nhấn các nút ở dưới để duyệt/từ chối reply!`});
      break;
    case confessionType.resolveAndRejectReply: 
      embed = new EmbedBuilder()
        .setTitle(body.title)
        .setDescription(`<@${body.userId}> đã reply: ${body.content} trên confession <#${body.threadID}>`)
        .setFields([
          {
            name: `${body.isResolve ? 'Duyệt' : 'Từ chối'} bởi`,
            value: `<@${body.reviewer}>`
          }
        ])
        .setColor(0xe59b9b)
        .setTimestamp()
      break;
    case confessionType.reply: 
      embed = new EmbedBuilder()
        .setTitle(`📨 Trả lời ẩn danh${body.isOwner ? '(Chủ confession)' : ''}`)
        .setDescription(body.content)
        .setColor(0xe59b9b)
      break;
    case confessionType.userInfoConfession:
      const avatarURL = `https://cdn.discordapp.com/avatars/${body.userId}/${body.avatar}.png`;
      embed = new EmbedBuilder()
      .setAuthor({ 
        name: `Gửi bởi ${body.username}`, 
        iconURL: avatarURL, 
      })
      break;
    default:
      break;
  }
  return embed;
};
module.exports = { confessionMessages };