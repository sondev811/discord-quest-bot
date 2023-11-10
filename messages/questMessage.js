const { EmbedBuilder } = require("@discordjs/builders");
const { questActionType } = require("../constants/general");

const renderQuestRate = (gifts) => {
  if (!gifts || !gifts.length) return `Chưa thiết lập \n`;
  let render = ''
  let percent = 0;
  gifts.forEach(gift => {
    percent += gift.dropRate;
    render += `• ${gift.giftEmoji} ${gift.name}: ${gift.dropRate}%\n`
  });
  return render + `\nTổng: ${percent}%, ${percent < 100 ? '``⚠️ Số % chưa đủ 100``' : ''}`;
}

const renderItemQuest = (items) => {
  let text = '';
  items.forEach((item, index) => {
    text+= '``x' + item.completionCriteria + '``' + item.placeChannel + `${index < items.length - 1 ? ', ' : ''}`
  });
  return text;
}

const renderItemBag = (bag) => {
  let text = '';
  bag.forEach((item, index) => {
    text+= '``x' + item.quantity + '``' + item.giftEmoji + `${index < bag.length - 1 ? ', ' : ''}`
  });
  return text;

}

const createQuestMessage = (type, body = {}) => {
  let embed = null;
  switch (type) {
    case questActionType.giftQuest:
      embed = new EmbedBuilder()
      .setAuthor({
        name: `Thêm hoặc chỉnh sửa rate quà nhiệm vụ tuần`,
      })
      .setDescription(`**Tổng % drop phải bằng 100%** \n ${renderQuestRate(body.gifts)}`)
      .setColor(0xe59b9b)
      .setFooter({ 
        text: `Bot Làng • discord.gg/langleuleuliuliu`,
        iconURL: `https://cdn.discordapp.com/avatars/1168802361481904188/3526d4d2d2283aec1df941b1b5aef6ee.png`
      })
      .setTimestamp();
      break;
    case questActionType.submitItem:
      embed = new EmbedBuilder()
      .setAuthor({
        name: `Nộp vật phẩm nhiệm vụ`,
      })
      .setDescription(`Vật phẩm yêu cầu: \n ${renderItemQuest(body.quests)} \n Vật phẩm đang có trong túi: \n ${renderItemBag(body.bag)}`)
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
module.exports = { createQuestMessage };