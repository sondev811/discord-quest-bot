const { EmbedBuilder } = require("@discordjs/builders");
const { userActionType, emoji, imageCommand, levelImage, rankingTrophy } = require("../constants/general");
const { RewardEnum, ActionEnum } = require("../models/quest.model");
const { roundAndFormat } = require("../utils");

const renderFriendList = (friends) => {
  if (!friends || !friends.length) return `${emoji.redDot} Chưa có`;
  let value = ''
  friends.forEach((friend, index) => {
    if (index !== 0 && index !== friends.length) {
      value += '\n';
    }
    value+= `${emoji.redDot}<@${friend.discordUserId}> - ${level(friend.intimacyPoints)} - Điểm thân thiết: ${friend.intimacyPoints} ${emoji.imPoint}`
  });
  return value;
}

const claimed = (isReceivedReward) => {
  return !isReceivedReward ? '``Phần thưởng:`` ' : '``Đã nhận thưởng:`` ';
}

const renderQuest = (quests) => {
  let result = '';
  quests.forEach(quest => {
    result += `${emoji.blank}${emoji.redDot}` + quest.description + '\n';
    result += `${emoji.blank}${emoji.blank}${emoji.giftBox}` + claimed(quest.isReceivedReward) + renderReward(quest.rewards) + '\n';
    result += `${emoji.blank}${emoji.blank}${quest.progress < quest.completionCriteria ? emoji.yellowDot : emoji.greenDot }` + '``Tiến độ:``' + ` ${quest.action === ActionEnum.VOICE ? roundAndFormat(quest.progress) : quest.progress}/${quest.completionCriteria}` + '\n\n';
  });
  return result;
}

const renderReward = (rewards) => {
  let result = '';
  rewards.forEach((reward, index) => {
    result += '``' + `${reward.rewardType === RewardEnum.GIFT || reward.rewardType === RewardEnum.QUEST_RESET ? 'x' : ''}${reward.quantity}` + '``' + `${reward.rewardType === RewardEnum.SILVER_TICKET ? emoji.silverTicket : reward.rewardType === RewardEnum.GOLD_TICKET ? emoji.goldenTicket : `${reward.giftEmoji}${reward.name}`}${index !== rewards.length - 1 ? ', ' : ''}`;
  });
  return result;
}

const renderRoleBag = (roles) => {
  if (!roles.length) return `${emoji.blank}${emoji.blank}Chưa có vật phẩm trong túi\n`
  let data = '';
  roles.forEach(role => {
    data += `${emoji.blank}${emoji.fiveDot}<@&${role.roleId}>\n${emoji.blank}» Chức năng: ${role.description}\n\n`
  })
  return data;
}

const renderGiftBag = (gifts) => {
  if (!gifts.length) return `${emoji.blank}${emoji.blank}Chưa có vật phẩm trong túi\n`
  let data = '';
  gifts.forEach((gift, index) => {
    data += `${emoji.blank}${emoji.fiveDot}${gift.giftEmoji} ${gift.name} » Số lượng: ${gift.quantity}\n${emoji.blank}» Chức năng: ${gift.description}${index === gifts.length - 1? '\n' : '\n\n'}`
  })
  return data;
}

const roleBonusRender = (roles) => {
  let render = ''
  roles.forEach(role => {
    render += `${emoji.blank}${emoji.fiveDot}<@&${role.roleId}>: +${role.valueBuff} ${role.typeBuff === RewardEnum.SILVER_TICKET ? `% ${emoji.silverTicket}` : emoji.goldenTicket} \n`
  })
  return render;
}

const ranking = (rankings) => {
  let index = 1;
  let render = '';
  for(let rank of rankings) {
    if (index > 20) break;
    if (rank.quantity > 0) {
      render +=  '``Top '+ index +'``' + `<@${rank.discordUserId}>: ${rank.quantity} ${rank.type === RewardEnum.SILVER_TICKET ? emoji.silverTicket : emoji.goldenTicket }\n`
      index++;
    }
  }
  return render;
}

const rankingCouple = (rankings) => {
  let index = 1;
  let render = '';
  for(let rank of rankings) {
    if (index > 20) break;
    if (rank.intimacyPoints > 0) {
      render +=  '``Top '+ index +'``' + `<@${rank.discordIdFirst}> - <@${rank.discordIdLast}> : ${rank.intimacyPoints}${emoji.imPoint}\n`
      index++;
    }
  }
  return render;
}

const createUserMessage = (type, body = {}) => {
  let embed = null;
  switch (type) {
    case userActionType.getInfo:
      embed = new EmbedBuilder()
        .setAuthor({
          name: `Thông tin của ${body?.username}`
        })
        .setFields([
          {
            name: `${emoji.royal} Tài khoản`,
            value: `${emoji.redDot} <@${body?.discordUserId}>`,
            inline: true
          },
          {
            name: `${emoji.ruby} Biệt danh`,
            value: `${emoji.redDot} ${body?.displayName}`,
            inline: true
          },
          {
            name: '🕛 Tham gia server',
            value: `${emoji.redDot} ${body?.joinedServer ? body.joinedServer: 'Chưa xác định'}`,
          },
          {
            name: `${emoji.nitro} Boost`,
            value: `${emoji.redDot} ${body?.boostTime ? body.boostTime : 'Không'}`,
          },
          {
            name: `💗 Các mối quan hệ`,
            value: renderFriendList(body.friends)
          }
        ])
        .setThumbnail(body?.avatar)
        .setColor(0xe59b9b)
        .setFooter({ 
          text: `Bot Làng • discord.gg/langleuleuliuliu`,
          iconURL: 'https://cdn.discordapp.com/avatars/1168802361481904188/3526d4d2d2283aec1df941b1b5aef6ee.png'
        })
        .setTimestamp();
      break;
    case userActionType.attended:
      embed = new EmbedBuilder()
        .setTitle(`${emoji.checked} Điểm danh thành công`)
        .setDescription(`${emoji.blank}${emoji.fiveDot} Điểm danh hằng ngày: **+50** <:leu_ticket:1168509616938815650> \n${emoji.blank}${emoji.fiveDot}Điểm danh liên tục **${body.streak}** ngày: **+${body.streakBonus}** ${emoji.silverTicket}\n ${roleBonusRender(body.roleBonus)} \n» Tổng nhận: **${body.totalSilver}** ${emoji.silverTicket} | **${body.totalGold}** ${emoji.goldenTicket}\n\n`)
        .setThumbnail(imageCommand.daily)
        .setColor(0xe59b9b)
        .setFooter({ 
          text: body.username,
          iconURL: `https://cdn.discordapp.com/avatars/${body.discordUserId}/${body.avatar}.png`
        })
        .setTimestamp();
      break;
    case userActionType.getQuest:
      embed = new EmbedBuilder()
      .setAuthor({
        name: `Bảng nhiệm vụ ${body.questType === 'week' ? 'tuần' : 'ngày'}`,
        iconURL: `https://cdn.discordapp.com/avatars/1168802361481904188/3526d4d2d2283aec1df941b1b5aef6ee.png`
      })
      .setDescription(`${emoji.blank}${emoji.redDot} Tổng nhiệm vụ đã hoàn thành: ${body.totalQuestCompleted}\n${emoji.blank}${emoji.redDot} Ticket hằng ngày: ${body.totalTicketClaimDaily}/${body.maxTicket}\n ${body.questType === 'daily' ? `${emoji.blank}${emoji.redDot} Cấp độ nhiệm vụ: ${body.level}\n${emoji.blank}${emoji.redDot} Số nhiệm vụ được nhận: ${body.questQuantity}\n\n${emoji.ruby}Nâng cấp độ để tăng được nhiều nhiệm vụ và giới hạn ticket được nhận hằng ngày\n` : ''} ─────────────────────────\n📖 Nhiệm vụ hôm nay\n${emoji.blank}${emoji.redDot}Làm mới sau ${body.endTime}\n\n` + renderQuest(body.quests) + `${body.questType !== 'week' ? `${emoji.ruby} <:leu_scroll38:1158500980242010122>Vé làm mới: x${body.resetQuantity}\n` : ''}` + '``⚠️  Lưu ý: Nên nhận thưởng trước thời gian làm mới.``')
      .setThumbnail(levelImage[body.level])
      .setColor(0xe59b9b)
      .setFooter({ 
        text: body.username,
        iconURL: `https://cdn.discordapp.com/avatars/${body.discordUserId}/${body.avatar}.png`
      })
      .setTimestamp();
      break;
    case userActionType.guide:
      embed = new EmbedBuilder()
      .setTitle('Hướng dẫn tính năng nhiệm vụ')
      .setDescription(`${emoji.redDot} Bảng nhiệm vụ là nơi để theo dõi nhiệm vụ đã nhận và tiến độ hoàn thành các nhiệm vụ hàng ngày và tuần  của bạn.\n\n${emoji.redDot} Mỗi ngày bạn được nhận số nhiệm vụ tùy theo cấp độ của bạn, hoàn thành chúng để nhận được các phần thưởng đi kèm vé xanh.\n\n${emoji.redDot} Mỗi đầu tuần nhiệm vụ tuần sẽ được làm mới. Bạn có thể nhận được một nhiệm vụ mỗi tuần. Hoàn thành chúng để nhận được các phần thưởng đi kèm như vé xanh, vé vàng, quà tặng, vé reset nhiệm vụ ngày.\n\n${emoji.redDot} Tổng nhiệm vụ đã hoàn thành sẽ hiển thị số lượng nhiệm vụ ngày bạn đã hoàn thành.\n\n${emoji.redDot} Ticket hàng ngày sẽ hiển thị số lượng vé mà bạn có thể nhận được hằng ngày.\n\n${emoji.redDot} Cấp độ nhiệm vụ sẽ hiển thị cấp độ hiện tại của bạn.\n\n${emoji.redDot} Nâng cấp sẽ giúp tăng thêm lượng vé có thể nhận được hằng ngày và số lượng nhiệm vụ mỗi ngày của bạn.` + '``Lưu ý: Sau khi nâng cấp độ thì nhiệm vụ của bạn sẽ không được làm mới và số lượng nhiệm vụ nhận được của cấp độ mới sẽ chưa được áp dụng cho ngày mà bạn nâng cấp. Nó sẽ được áp dụng cho ngày hôm sau.``\n\n' + `${emoji.redDot} Nhận thưởng: Bạn có thể nhận thưởng của bảng nhiệm vụ ngày và tuần.` + '``Lưu ý: Nhận thưởng trước thời gian reset của bảng nhiệm vụ để tránh mất phần thưởng``.\n\n' + `${emoji.redDot} Làm mới bảng nhiệm vụ: Bạn có thể làm mới bảng nhiệm vụ khi có vé làm mới. Vé có thể nhận được vé từ phần thưởng nhiệm vụ tuần hoặc mua ở shop vật phẩm nhiệm vụ.` + '``Lưu ý: Khi bạn đã nhận thưởng của bất kỳ nhiệm vụ nào thì bạn không thể làm mới bảng nhiệm vụ.``')
      .setThumbnail('https://cdn.discordapp.com/emojis/1083449029272281159.png')
      .setColor(0xe59b9b)
      .setFooter({ 
        text: body.username,
        iconURL: `https://cdn.discordapp.com/avatars/${body.discordUserId}/${body.avatar}.png`
      })
      .setTimestamp();
      break;
    case userActionType.bag:
      embed = new EmbedBuilder()
      .setAuthor({
        name: "Túi vật phẩm"
      })
      .setDescription(`<:leu_summer_admin:1159226093350440980>Role:\n\n ${renderRoleBag(body.roles)}─────────────────────────\n<:leu_Bouquet:1169290758772244550>Quà tặng:\n\n${renderGiftBag(body.gifts)}─────────────────────────\n<:leu_tag:1159222957793615943> Vật phẩm nhiệm vụ:\n\n${renderGiftBag(body.questItems)}`)
      .setColor(0xe59b9b)
      .setThumbnail(imageCommand.bag)
      .setFooter({ 
        text: body.username,
        iconURL: `https://cdn.discordapp.com/avatars/${body.discordUserId}/${body.avatar}.png`
      })
      .setTimestamp();
      break;
    case userActionType.giveTicketSuccess:
      embed = new EmbedBuilder()
      .setTitle(`${emoji.checked} Chuyển vé thành công`)
      .setDescription(`💸 | <@${body.sender}> đã chuyển ${body.amount} ${emoji.silverTicket} cho <@${body.receipt}>\n${emoji.redDot} Làng thu của bạn 10% thuế: ${body.tax} ${emoji.silverTicket} \n${emoji.redDot} Số vé còn lại: ${body.silverTicket} ${emoji.silverTicket}`)
      .setColor(0xe59b9b)
      .setThumbnail(`https://cdn.discordapp.com/avatars/${body.sender}/${body.avatar}.png`)
      .setFooter({ 
        text: `Bot Làng • discord.gg/langleuleuliuliu`,
        iconURL: `https://cdn.discordapp.com/avatars/1168802361481904188/3526d4d2d2283aec1df941b1b5aef6ee.png`
      })
      .setTimestamp();
      break;
    case userActionType.bxh:
      embed = new EmbedBuilder()
      .setTitle(`${emoji.royal} Bảng xếp hạng ${body.rankingType}`)
      .setDescription(body.isCouple ? rankingCouple(body.rankList) : ranking(body.rankList))
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

module.exports = { createUserMessage };