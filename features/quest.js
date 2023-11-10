const { StringSelectMenuOptionBuilder, StringSelectMenuBuilder, ActionRowBuilder, ButtonBuilder, SelectMenuBuilder, ModalBuilder, TextInputBuilder } = require("@discordjs/builders");
const connectDB = require("../DB/connection");
const { errors, descriptionQuest, userActionType, questActionType } = require("../constants/general");
const messages = require("../constants/messages");
const { createNormalMessage } = require("../messages/normalMessage");
const { createUserMessage } = require("../messages/userMessage");
const { TaskTypeEnum, ActionEnum, RewardEnum } = require("../models/quest.model");
const { QuestService } = require("../services/quest.service");
const { UserService } = require("../services/user.service");
const { checkingLastAttended, getTimeToEndOfDay, isSameWeek, getTimeToEndOfWeek, randomBetweenTwoNumber, handleEmoji, getCurrentTime } = require("../utils");
const { ComponentType, ButtonStyle, TextInputStyle } = require("discord.js");
const { LevelService } = require("../services/level.service");
const { ShopService } = require("../services/shop.service");
const { ShopItemEnum } = require("../models/shopItem.model");
const { createQuestMessage } = require("../messages/questMessage");
connectDB();
process.env.TZ = 'Asia/Bangkok';

const combineReward = (gifts) => {
  const hashMap = {}
  const newGift = []
  gifts.forEach((item) => {
    if (hashMap[item.giftId] === undefined) {
        hashMap[item.giftId] = 1;
        newGift.push(item);
    } else {
        hashMap[item.giftId] += 1;
        const findIndex = newGift.findIndex(data => data.giftId === item.giftId);
        newGift[findIndex].quantity += 1; 
    }
  })
  return newGift;
}

const randomGiftReward = (gifts, quantity) => {
  const list = [];
  for (let i = 0; i < quantity; i++) {
    const random = Math.random() * 100;
    let accumulatedDropRate = 0;
    for (const item of gifts) {
      accumulatedDropRate += item.dropRate;
      if (random <= accumulatedDropRate) {
        list.push({
          giftId: item.id,
          name: item.name,
          description: item.description,
          rewardType: item.type,
          intimacyPoints: item.intimacyPoints,
          giftEmoji: item.giftEmoji,
          quantity: 1
        })
        break;
      }
    }
  }
  return combineReward(list);
}

const randomReward = (rewards, gifts, resetTicket) => {
  const data = []
  rewards.forEach(reward => {
    const randomReward = randomBetweenTwoNumber(reward.minQuantity, reward.maxQuantity);
    if (reward.type === RewardEnum.GIFT && gifts.length) {
      const result = randomGiftReward(gifts, randomReward);
      data.push(...result);
      return;
    }
    data.push({
      rewardType: reward.type,
      quantity: randomReward
    })
  });
  if (resetTicket) {
    data.push({
      giftId: resetTicket.id,
      name: resetTicket.name,
      description: resetTicket.description,
      rewardType: RewardEnum.QUEST_RESET,
      giftEmoji: resetTicket.giftEmoji,
      quantity: 1,
      valueBuff: resetTicket.valueBuff
    })
  }
  return data;
}

const checkExistResetQuest = (itemBag) => {
  const isHaveResetTicket = itemBag.findIndex(item => item.type === ShopItemEnum.QUEST && item.valueBuff === RewardEnum.QUEST_RESET);
  return isHaveResetTicket;
}

const handleDescription = (action, placeChannel, quantity) => {
  return descriptionQuest[action](quantity, placeChannel);
}

const filterQuest = (quests, type, gifts, resetTicket) => {
  const filtered = quests.filter(item => item.type === type);
  const data = [];
  filtered.forEach(item => {
    const completionCriteria = randomBetweenTwoNumber(item.minCompletionCriteria, item.maxCompletionCriteria)
    data.push({
      questId: item.id,
      completionCriteria,
      action: item.action,
      placeChannel: item.placeChannel,
      progress: 0,
      rewards: randomReward(item.rewards, gifts, resetTicket),
      description: handleDescription(item.action, item.placeChannel, completionCriteria),
      isReceivedReward: false,
    })
  })
  return data;
};

const messageQuests = (quests) => quests.filter(quest => quest.action === ActionEnum.MESSAGE);

const postQuests = (quests) => quests.filter(
  quest => [
    ActionEnum.POST_BLOG, 
    ActionEnum.POST_CONFESSION, 
    ActionEnum.REPLY_POST_BLOG, 
    ActionEnum.REPLY_CONFESSION, 
 
  ].includes(quest.action)
);

const otherQuests = (quests) => quests.filter(
  quest => [ActionEnum.GIFT, ActionEnum.BOOST_SERVER, ActionEnum.VOICE, ActionEnum.SUBMIT_ITEM].includes(quest.action)
);

const getRandomQuest = (questArray) => {
  return questArray[Math.floor(Math.random() * questArray.length)];
};

const handleQuestLevel = (level, quests) => {
  try {
    const pickQuest = [];
    const getMessageQuest = messageQuests(quests);
    const getPostQuests = postQuests(quests);
    const getOtherQuest = otherQuests(quests);
  
    const randomMessage = getRandomQuest(getMessageQuest);
  
    const randomFirstPost = getRandomQuest(getPostQuests);
    const randomSecondPost = getRandomQuest(getPostQuests.filter(item => item.action !== randomFirstPost.action));
    const randomThirdPost = getRandomQuest(getPostQuests.filter(
      item => item.action !== randomFirstPost.action && 
              item.action !== randomSecondPost.action
    ));
  
    const randomOther = getRandomQuest(getOtherQuest);
    // const randomSecondOther = getRandomQuest(getOtherQuest.filter(item => item.action !== randomOther.action));
  
    switch (level) {
      case 1:
      case 2:
        // receive 3 quest: 1 mess, 1 post, 1 other
        pickQuest.push(randomMessage, randomFirstPost, randomOther);
        break;
      case 3:
      case 4:
        // receive 4 quest: 2 mess, 1 post, 1 other
        pickQuest.push(...getMessageQuest, randomFirstPost, randomOther);
        break;
      case 5:
      case 6:
        // receive 5 quest: 2 mess, 2 post, 1 other
        pickQuest.push(...getMessageQuest, randomFirstPost, randomSecondPost, randomOther);
        break;
      case 7:
        // receive 6 quest: 2 mess, 3 post, 1 other
        pickQuest.push(...getMessageQuest, randomFirstPost, randomSecondPost, randomThirdPost, randomOther);
        break;
      default:
        break;
    }
    return pickQuest;
  } catch (error) {
    console.log(error);
  }
}

const upgradeQuestExecute = async (reply, backQuestBoard, discordId) => {
  try {
    const user = await UserService.getUserById(discordId);
    const level = user.level.value;
    const maxLevel = 7;
  
    const row = new ActionRowBuilder()
    .addComponents(backQuestBoard); 
  
    if (level === maxLevel) {
      await reply.edit({
        embeds: [createNormalMessage(messages.upgradedLevelMax(maxLevel))],
        components: [row]
      });
      return;
    }
  
    const infoUpgradeLevel = await LevelService.getLevelByValue(level + 1);
    const { priceUpgrade, value } = infoUpgradeLevel[0];
    const { silver } = user.tickets;
  
    if (silver < priceUpgrade) {
      await reply.edit({
        embeds: [createNormalMessage(messages.upgradeLevelFail(value, priceUpgrade))],
        components: [row]
      });
      return;
    }
    user.tickets.silver = user.tickets.silver - priceUpgrade;
    user.level = infoUpgradeLevel[0];
    const updateLeverUser = await UserService.updateUser(user);
  
    if (updateLeverUser.tickets.silver === user.tickets.silver && user.level.value === updateLeverUser.level.value) {
      await reply.edit({
        embeds: [createNormalMessage(messages.upgradeLevelSuccess(value))],
        components: [row]
      });
      return;
    }
    await reply.edit({
      embeds: [createNormalMessage(messages.upgradeLevelError())],
      components: [row]
    });
  } catch (error) {
    console.log(error);
  }
}

const submitItemChecking = (quests) => {
  let isShowSubmitItemBtn = false;

  for(let quest of quests) {
    if (quest.action === ActionEnum.SUBMIT_ITEM && quest.progress < quest.completionCriteria) {
      isShowSubmitItemBtn = true;
      break;
    }
  }
  return isShowSubmitItemBtn;
}

const backToBoardExecute = async (reply, discordId, rowBtnUpgradeGuideRewardDaily, body) => {
  try {
    let selectedOption = 'dailyQuest';
    const { hoursRemaining, minutesRemaining, secondsRemaining } = getTimeToEndOfDay();
    const selectNew = new StringSelectMenuBuilder()
      .setCustomId('questType')
      .setPlaceholder('Chọn loại nhiệm vụ')
      .addOptions(
        new StringSelectMenuOptionBuilder()
          .setLabel('Nhiệm vụ ngày')
          .setDescription('Sổ nhiệm vụ ngày')
          .setValue('dailyQuest')
          .setDefault(selectedOption === 'dailyQuest')
      )
      .addOptions(
        new StringSelectMenuOptionBuilder()
          .setLabel('Nhiệm vụ tuần')
          .setDescription('Sổ nhiệm vụ tuần')
          .setValue('weekQuest').setDefault(selectedOption === 'weekQuest')
      );

    const userUpdate = await UserService.getUserById(discordId);

    body.quests = userUpdate.quests.dailyQuestsReceived.quests;
    body.endTime = `${hoursRemaining} giờ ${minutesRemaining} phút ${secondsRemaining} giây`;
    body.questType = 'daily';
    body.totalTicketClaimDaily = userUpdate.totalTicketClaimDaily;
    body.totalQuestCompleted = userUpdate.totalQuestCompleted;
    const rowNew = new ActionRowBuilder()
    .addComponents(selectNew);

    const components = [rowNew, rowBtnUpgradeGuideRewardDaily];
    
    if (selectedOption === 'dailyQuest') {

      const isHaveResetTicket = checkExistResetQuest(userUpdate.itemBag);
      if (isHaveResetTicket !== -1) {
        body.resetQuantity = userUpdate.itemBag[isHaveResetTicket].quantity;
      } else {
        body.resetQuantity = 0;
      }

      const isReceivedReward = rewardChecking(userUpdate.quests.dailyQuestsReceived.quests);
      const isShowSubmitItemBtn = submitItemChecking(userUpdate.quests.dailyQuestsReceived.quests);
      
      if (body.resetQuantity > 0 && !isReceivedReward) {
        // if (isShowSubmitItemBtn) {
        //   const rowResetAndSubmit = initResetAndSubmit('full');
        //   components.push(rowResetAndSubmit);
        // } else {
          const rowResetAndSubmit = initResetAndSubmit('reset');
          components.push(rowResetAndSubmit);
        // }
      } 
      // else {  
      //   if (isShowSubmitItemBtn) {
      //     const rowResetAndSubmit = initResetAndSubmit('submit');
      //     components.push(rowResetAndSubmit);
      //   }
      // }

    }

    await reply.edit({
      embeds: [createUserMessage(userActionType.getQuest, body)],
      components: [...components]
    });
  } catch (error) {
    console.log(error);
  }  
}

const resetQuestExecute = async (reply, backQuestBoard, discordId) => {
  try {
    const user = await UserService.getUserById(discordId);
    const quests = await QuestService.getAllQuest();
    if (!quests || !quests.length) {
      throw new Error(errors.GET_ALL_QUEST_ERROR);
    }
    const dailyQuests = filterQuest(quests, TaskTypeEnum.DAILY, [], null);
  
    const getDailyQuestWithLevel = handleQuestLevel(user.level.value, dailyQuests);
    
    user.quests.dailyQuestsReceived.timeReceivedQuest = new Date();
    user.quests.dailyQuestsReceived.quests = getDailyQuestWithLevel;
    
    const position = checkExistResetQuest(user.itemBag);
    if (user.itemBag[position].quantity === 1) {
      const newItemBag = user.itemBag.filter((item, index) => index !== position);
      user.itemBag = newItemBag;
    } else {
      user.itemBag[position].quantity -= 1;
    }
  
    await UserService.updateUser(user);
    const rowBack = new ActionRowBuilder()
    .addComponents([backQuestBoard]);
  
    await reply.edit({
      embeds: [createNormalMessage(`Làm mới nhiệm vụ thành công.`)],
      components: [rowBack]
    });
  } catch (error) {
    console.log(error);
  }
}

const rewardQuestDailyExecute = async (reply, backQuestBoard, discordId) => {
  try {
    const user = await UserService.getUserById(discordId);
    const quests = user.quests.dailyQuestsReceived.quests;
    let silverEarning = 0;
    let countSuccessQuest = 0;
    quests.forEach(quest => {
      if (quest.progress === quest.completionCriteria && !quest.isReceivedReward) {
        quest.rewards.forEach(reward => {
          if (reward.rewardType === RewardEnum.SILVER_TICKET) {
            silverEarning += reward.quantity;
          }
        });
        quest.isReceivedReward = true;
        countSuccessQuest++;
      }
    });
  
    const rowBack = new ActionRowBuilder()
    .addComponents([backQuestBoard]);
  
    if (silverEarning === 0) {
      reply.edit({
        embeds: [createNormalMessage('Chưa có nhiệm vụ nào được hoàn thành hoặc bạn đã nhận thưởng rồi.')],
        components: [rowBack]
      })
      return;
    }
    user.quests.dailyQuestsReceived.quests = quests;
    user.tickets.silver += silverEarning;
    user.totalTicketClaimDaily += silverEarning;
    user.totalQuestCompleted += countSuccessQuest;
  
    if (user.totalTicketClaimDaily >= user.level.limitTicketDaily) {
      const quantity = user.totalTicketClaimDaily - user.level.limitTicketDaily;
      user.tickets.silver = user.tickets.silver - quantity;
      user.totalTicketClaimDaily = user.totalTicketClaimDaily - quantity;
    }
  
    await UserService.updateUser(user);
    
    reply.edit({
      embeds: [createNormalMessage('Nhận thưởng thành công.')],
      components: [rowBack]
    })
  } catch (error) {
    console.log(error);
  }
}

const rewardQuestWeekExecute = async (reply, backQuestBoard, discordId) => {
  try {
    const user = await UserService.getUserById(discordId);
    const quests = user.quests.weekQuestsReceived.quests;
    let silverEarning = 0;
    let goldEarning = 0;
    let countSuccessQuest = 0;
    const tempBag = [];
    quests.forEach(quest => {
      if (quest.progress === quest.completionCriteria && !quest.isReceivedReward) {
        quest.rewards.forEach(reward => {
          if (reward.rewardType === RewardEnum.SILVER_TICKET) {
            silverEarning += reward.quantity;
          }
          if (reward.rewardType === RewardEnum.GOLD_TICKET) {
            goldEarning += reward.quantity;
          }
          if (reward.rewardType === RewardEnum.GIFT || reward.rewardType === RewardEnum.QUEST_RESET) {
            tempBag.push(reward);
          }
        });
        quest.isReceivedReward = true;
        countSuccessQuest++;
      }
    });
  
    const rowBack = new ActionRowBuilder()
    .addComponents([backQuestBoard]);
  
    if (silverEarning === 0 && goldEarning === 0) {
      reply.edit({
        embeds: [createNormalMessage('Chưa hoàn thành nhiệm vụ tuần hoặc bạn đã nhận thưởng rồi.')],
        components: [rowBack]
      })
      return;
    }
    user.quests.weekQuestsReceived.quests = quests;
    user.tickets.silver += silverEarning;
    user.tickets.gold += goldEarning;
    user.totalTicketClaimDaily += silverEarning;
    user.totalQuestCompleted += countSuccessQuest;
    
    tempBag.forEach(bag => {
      const itemExistOnBag = user.itemBag.findIndex(item => item.id === parseInt(bag.giftId));
      if (itemExistOnBag === -1) {
        const itemToAdd = {
          id: bag.giftId,
          name: bag.name,
          description: bag.description,
          type: bag.rewardType === RewardEnum.QUEST_RESET ? ShopItemEnum.QUEST : bag.rewardType,
          intimacyPoints: bag.intimacyPoints,
          giftEmoji: bag.giftEmoji,
          quantity: bag.quantity,
          valueBuff: bag.valueBuff
        } 
        user.itemBag.push(itemToAdd);
      } else {
        user.itemBag[itemExistOnBag].quantity += bag.quantity;
      }
    })
  
    if (user.totalTicketClaimDaily >= user.level.limitTicketDaily) {
      const quantity = user.totalTicketClaimDaily - user.level.limitTicketDaily;
      user.tickets.silver = user.tickets.silver - quantity;
      user.totalTicketClaimDaily = user.totalTicketClaimDaily - quantity;
    }
  
    await UserService.updateUser(user);
    
    reply.edit({
      embeds: [createNormalMessage('Nhận thưởng tuần thành công.')],
      components: [rowBack]
    })
  } catch (error) {
    console.log(error);
  }
}

const initButtonAndSelect = () => {
  const select = new StringSelectMenuBuilder()
  .setCustomId('questType')
  .setPlaceholder('Chọn loại nhiệm vụ')
  .addOptions(
    new StringSelectMenuOptionBuilder()
      .setLabel('Nhiệm vụ ngày')
      .setDescription('Sổ nhiệm vụ ngày')
      .setValue('dailyQuest')
  )
  .addOptions(
    new StringSelectMenuOptionBuilder()
      .setLabel('Nhiệm vụ tuần')
      .setDescription('Sổ nhiệm vụ tuần')
      .setValue('weekQuest')
  );

  const upgradeQuestBtn = new ButtonBuilder()
  .setCustomId('upgradeQuest')
  .setLabel('Nâng cấp')
  .setStyle(ButtonStyle.Success);

  const guideQuestBtn = new ButtonBuilder()
  .setCustomId('guideQuest')
  .setLabel('Hướng dẫn')
  .setStyle(ButtonStyle.Success);

  const rowSelect = new ActionRowBuilder()
  .addComponents(select);

  const rewardQuestDaily = new ButtonBuilder()
  .setCustomId('rewardQuestDaily')
  .setLabel('Nhận thưởng ngày')
  .setStyle(ButtonStyle.Success);

  const rewardQuestWeek = new ButtonBuilder()
  .setCustomId('rewardQuestWeek')
  .setLabel('Nhận thưởng tuần')
  .setStyle(ButtonStyle.Success);

  const backQuestBoard = new ButtonBuilder()
  .setCustomId('backQuestBoard')
  .setLabel('Quay lại bảng nhiệm vụ')
  .setStyle(ButtonStyle.Success);

  const rowBtnUpgradeGuideRewardDaily = new ActionRowBuilder()
  .addComponents([upgradeQuestBtn, guideQuestBtn, rewardQuestDaily]); 

  const rowBtnUpgradeGuideRewardWeek = new ActionRowBuilder()
  .addComponents([upgradeQuestBtn, guideQuestBtn, rewardQuestWeek]); 

  return { 
    rowSelect, 
    rowBtnUpgradeGuideRewardDaily, 
    rowBtnUpgradeGuideRewardWeek, 
    backQuestBoard
  };
}

const initResetAndSubmit = (type) => {
  const resetQuest = new ButtonBuilder()
  .setCustomId('resetQuest')
  .setLabel('Làm mới nhiệm vụ')
  .setStyle(ButtonStyle.Success);
 
  // const submitItem = new ButtonBuilder()
  // .setCustomId('submitItem')
  // .setLabel('Nộp vật phẩm')
  // .setStyle(ButtonStyle.Success);

  let rowBtnReset = null;

  if (type === 'full') {
    // rowBtnReset = new ActionRowBuilder()
    // .addComponents([resetQuest, submitItem]);
  } else if (type === 'reset') {
    rowBtnReset = new ActionRowBuilder()
    .addComponents([resetQuest]);
  } 
  // else {
  //   rowBtnReset = new ActionRowBuilder()
  //    .addComponents([submitItem]);
  // }

  return rowBtnReset;
}

const rewardChecking = (quests) => {
  let isReceivedReward = false;

  for(let quest of quests) {
    if (quest.isReceivedReward) {
      isReceivedReward = true;
      break;
    }
  }
  return isReceivedReward;
}

const submitItemQuest = async (interaction, reply, backQuestBoard, discordId) => {
  try {
    const rowBack = new ActionRowBuilder()
      .addComponents(backQuestBoard); 
  
    const user = await UserService.getUserById(discordId);
    const quests = user.quests.dailyQuestsReceived.quests;
    const submitItems = quests.filter(item => item.action === ActionEnum.SUBMIT_ITEM && item.progress < item.completionCriteria);
    const bag = user.itemBag;
    const questItems = bag.filter(item => item.type === ShopItemEnum.QUEST);
  
    const select = new StringSelectMenuBuilder().setCustomId('itemChoose').setPlaceholder('Chọn vật phẩm nhiệm vụ')
    
    for (const item of questItems) {
      select.addOptions(
        new StringSelectMenuOptionBuilder()
          .setLabel(item.name)
          .setDescription(item.description)
          .setValue(item.id + '')
          .setEmoji(handleEmoji(item.giftEmoji))
      );
    }
  
    const row = new ActionRowBuilder().addComponents(select);
  
    await reply.edit({
      embeds: [createQuestMessage(questActionType.submitItem, { quests: submitItems, bag: questItems})],
      components: [row, rowBack]
    });
  
    const collection = reply.createMessageComponentCollector({
      componentType: ComponentType.StringSelect,
      filter: (i) => i.user.id === interaction.user.id && i.customId === 'itemChoose',
      time: 300000
    });
  
    collection.on('collect', async interaction => {
      try {
        await interaction.deferUpdate();
        const [value] = interaction.values;
        const giftIndex = user.itemBag.findIndex(item => item.id === parseInt(value))
        const emoji = user.itemBag[giftIndex].giftEmoji;
        const questIndex = user.quests.dailyQuestsReceived.quests.findIndex(item => item.action === ActionEnum.SUBMIT_ITEM && item.placeChannel === emoji && item.progress < item.completionCriteria);
        const quest = user.quests.dailyQuestsReceived.quests[questIndex];
        if (!quest || quest.progress === quest.completionCriteria) {
          await reply.edit({
            embeds: [createNormalMessage(messages.itemSubmitted)],
            components: [rowBack]
          })
          return;
        }
        user.quests.dailyQuestsReceived.quests[questIndex].progress += 1;
        if (user.itemBag[giftIndex].quantity === 1) {
          const newBag = user.itemBag.filter((item, index) => index !== giftIndex);
          user.itemBag = newBag;
        } else {
          user.itemBag[giftIndex].quantity -= 1;
        }
        await UserService.updateUser(user);
        await reply.edit({
          embeds: [createNormalMessage(messages.itemSubmitSuccess(user.quests.dailyQuestsReceived.quests[questIndex].progress, quest.completionCriteria))],
          components: [rowBack]
        })
      } catch (error) {
        console.log(error);      
      }
    });
  } catch (error) {
    console.log(error);
  }
}

const reply = async (interaction, user, avatar, discordId) => {
  try {
    const { hoursRemaining, minutesRemaining, secondsRemaining } = getTimeToEndOfDay();
    
    const { 
      rowSelect, 
      rowBtnUpgradeGuideRewardDaily, 
      rowBtnUpgradeGuideRewardWeek, 
      backQuestBoard
    } = initButtonAndSelect();
    
    const body = { 
      totalQuestCompleted: user.totalQuestCompleted, 
      totalTicketClaimDaily: user.totalTicketClaimDaily,
      maxTicket: user.level.limitTicketDaily,
      endTime: `${hoursRemaining} giờ ${minutesRemaining} phút ${secondsRemaining} giây`,
      quests: user.quests.dailyQuestsReceived.quests,
      username: user.username,
      discordUserId: user.discordUserId,
      avatar,
      questType: 'daily',
      level: user.level.value,
      questQuantity: user.level.limitQuestQuantity,
      resetQuantity: 0
    }
  
    const quests = user.quests.dailyQuestsReceived.quests;
  
    const isReceivedReward = rewardChecking(quests);
  
    const componentInit = [rowSelect, rowBtnUpgradeGuideRewardDaily];
  
    const isHaveResetTicket = checkExistResetQuest(user.itemBag);
  
    const isShowSubmitItemBtn = submitItemChecking(quests);
  
    if (isHaveResetTicket !== -1) {
      body.resetQuantity = user.itemBag[isHaveResetTicket].quantity;
    } else {
      body.resetQuantity = 0;
    }
  
    if (body.resetQuantity > 0 && !isReceivedReward) {
      // if (isShowSubmitItemBtn) {
      //   const rowResetAndSubmit = initResetAndSubmit('full');
      //   componentInit.push(rowResetAndSubmit);
      // } else {
        const rowResetAndSubmit = initResetAndSubmit('reset');
        componentInit.push(rowResetAndSubmit);
      // }
    } 
    // else {  
    //   if (isShowSubmitItemBtn) {
    //     const rowResetAndSubmit = initResetAndSubmit('submit');
    //     componentInit.push(rowResetAndSubmit);
    //   }
    // }
  
    const reply = await interaction.followUp({
      embeds: [createUserMessage(userActionType.getQuest, body)],
      components: componentInit
    });
  
    const collector = reply.createMessageComponentCollector({
      componentType: ComponentType.StringSelect,
      filter: (i) => i.user.id === interaction.user.id && i.customId === 'questType',
      time: 300000
    });
    
    collector.on('collect', async (interaction) => {
      try {
        interaction.deferUpdate();
        const [value] = interaction.values;
        let selectedOption = 'dailyQuest';
        
        if (value === 'weekQuest') {
          const { hoursRemaining, minutesRemaining, secondsRemaining } = getTimeToEndOfWeek();
          const userUpdate = await UserService.getUserById(discordId);
          body.quests = userUpdate.quests.weekQuestsReceived.quests
          body.endTime = `${hoursRemaining} giờ ${minutesRemaining} phút ${secondsRemaining} giây`;
          body.questType = 'week';
          selectedOption = 'weekQuest';
        } else {
          const { hoursRemaining, minutesRemaining, secondsRemaining } = getTimeToEndOfDay();
          const userUpdate = await UserService.getUserById(discordId);
          if (!userUpdate || !userUpdate.discordUserId) {
            await interaction.followUp({ embeds: [createNormalMessage(messages.unreadyRegisterBot)] });
            return;
          }
          body.quests = userUpdate.quests.dailyQuestsReceived.quests
          body.endTime = `${hoursRemaining} giờ ${minutesRemaining} phút ${secondsRemaining} giây`;
          body.questType = 'daily';
          selectedOption = 'dailyQuest';
  
          const isHaveResetTicket = checkExistResetQuest(userUpdate.itemBag);
          if (isHaveResetTicket !== -1) {
            body.resetQuantity = userUpdate.itemBag[isHaveResetTicket].quantity;
          } else {
            body.resetQuantity = 0;
          }
        }
  
        const selectNew = new StringSelectMenuBuilder()
          .setCustomId('questType')
          .setPlaceholder('Chọn loại nhiệm vụ')
          .addOptions(
            new StringSelectMenuOptionBuilder()
              .setLabel('Nhiệm vụ ngày')
              .setDescription('Sổ nhiệm vụ ngày')
              .setValue('dailyQuest')
              .setDefault(selectedOption === 'dailyQuest')
          )
          .addOptions(
            new StringSelectMenuOptionBuilder()
              .setLabel('Nhiệm vụ tuần')
              .setDescription('Sổ nhiệm vụ tuần')
              .setValue('weekQuest').setDefault(selectedOption === 'weekQuest')
          );
  
        const rowNew = new ActionRowBuilder()
        .addComponents(selectNew);
  
        const components = [rowNew, selectedOption === 'dailyQuest' ? rowBtnUpgradeGuideRewardDaily : rowBtnUpgradeGuideRewardWeek];
        
        if (selectedOption === 'dailyQuest') {
          const isReceivedReward = rewardChecking(body.quests);
          const isShowSubmitItemBtn = submitItemChecking(body.quests);
  
          if (body.resetQuantity > 0 && !isReceivedReward) {
            // if (isShowSubmitItemBtn) {
            //   const rowResetAndSubmit = initResetAndSubmit('full');
            //   components.push(rowResetAndSubmit);
            // } else {
              const rowResetAndSubmit = initResetAndSubmit('reset');
              components.push(rowResetAndSubmit);
            // }
          } 
          // else {  
          //   if (isShowSubmitItemBtn) {
          //     const rowResetAndSubmit = initResetAndSubmit('submit');
          //     components.push(rowResetAndSubmit);
          //   }
          // }
        }
  
        const message = await interaction.channel?.messages.fetch(interaction.message.id);
  
        await message.edit({ 
          embeds: [createUserMessage(userActionType.getQuest, body)],
          components,
        });
  
      } catch (error) {
        console.log(error);      
      }
    });
  
    const collectorButton = reply.createMessageComponentCollector({
      componentType: ComponentType.Button,
      filter: (i) => i.user.id === interaction.user.id && 
      (i.customId === 'upgradeQuest' || 
      i.customId === 'guideQuest' || 
      i.customId === 'resetQuest' || 
      i.customId === 'rewardQuestDaily' || 
      i.customId === 'rewardQuestWeek' || 
      i.customId === 'backQuestBoard' || i.customId === 'submitItem'),
      time: 300000
    });
  
    collectorButton.on('collect', async (interaction) => {
      try {
        interaction.deferUpdate();
        const type = interaction.customId;
        
        if (type === 'upgradeQuest') {
          upgradeQuestExecute(reply, backQuestBoard, discordId);
          return;
        } 
        if (type === 'resetQuest') {
          resetQuestExecute(reply, backQuestBoard, discordId);
          return;
        }
        if (type ==='backQuestBoard') {
          backToBoardExecute(
            reply, 
            discordId, 
            rowBtnUpgradeGuideRewardDaily, 
            body
          );
          return;
        }
  
        if (type === 'rewardQuestDaily') {
          rewardQuestDailyExecute(reply, backQuestBoard, discordId);
          return;
        }
  
        if (type === 'rewardQuestWeek') {
          rewardQuestWeekExecute(reply, backQuestBoard, discordId);
          return;
        }
  
        if (type === 'submitItem') {
          submitItemQuest(interaction, reply, backQuestBoard, discordId);
          return;
        }
  
        const rowBack = new ActionRowBuilder()
        .addComponents([backQuestBoard]);
  
        await reply.edit({
          embeds: [createUserMessage(userActionType.guide, { username: user.username, discordUserId: discordId, avatar })],
          components: [rowBack]
        });
       
      } catch (error) {
        console.log(error);      
      }
    })
  } catch (error) {
    console.log(error);
  }
}

const quest = {
  name: 'leuquest',
  execute: async interaction => {
    try {
      if (!interaction) return;
      await interaction.deferReply();
      const avatar = interaction.member?.user?.avatar;
      const discordId = interaction.member?.user?.id;
      if (!discordId) {
        throw Error('Không tìm thấy discordId');
      };
      const user = await UserService.getUserById(discordId);
      if (!user || !user.discordUserId) {
        await interaction.followUp({ embeds: [createNormalMessage(messages.unreadyRegisterBot)] });
        return;
      }

      const quests = await QuestService.getAllQuest();
      if (!quests || !quests.length) {
        throw new Error(errors.GET_ALL_QUEST_ERROR);
      }

      const isNotReceiveWeekQuest = !isSameWeek(user.quests.weekQuestsReceived.timeReceivedQuest, new Date()) || !user.quests.weekQuestsReceived.quests.length; 
      if (isNotReceiveWeekQuest) {
        const giftQuest = await QuestService.getGiftQuest();
        if (!giftQuest.length) return;
        const gifts = giftQuest.filter(item => item.type === ShopItemEnum.GIFT);
        const itemQuest = await ShopService.getAllShop();
        const resetTicket = itemQuest.find(item => item.type === ShopItemEnum.QUEST && item.valueBuff === RewardEnum.QUEST_RESET);
        const weekQuests = filterQuest(quests, TaskTypeEnum.WEEK, gifts, resetTicket);
        const getWeekQuestWithLevel = getRandomQuest(weekQuests);
        user.quests.weekQuestsReceived.timeReceivedQuest = new Date();
        user.quests.weekQuestsReceived.quests = getWeekQuestWithLevel;
        await UserService.updateUser(user);
      }

      const isReceivedQuest = checkingLastAttended(user.quests.dailyQuestsReceived.timeReceivedQuest) && user.quests.dailyQuestsReceived.quests.length; 
      if (isReceivedQuest) {
        reply(interaction, user, avatar, discordId);
        return user;
      }

      const dailyQuests = filterQuest(quests, TaskTypeEnum.DAILY, []);
      
      const getDailyQuestWithLevel = handleQuestLevel(user.level.value, dailyQuests);
      
      user.quests.dailyQuestsReceived.timeReceivedQuest = new Date();;
      user.quests.dailyQuestsReceived.quests = getDailyQuestWithLevel;
      user.totalTicketClaimDaily = 0;

      await UserService.updateUser(user);
      
      reply(interaction, user, avatar, discordId);
    } catch (error) {
      console.log(error, '[quest]');
    }
  }
}

const giftQuest = {
  name: 'admin-add-gift-quest',
  execute: async (interaction) => {
    try {
      if (!interaction) return;
      await interaction.deferReply();
      if(interaction.user.id !== process.env.OWNER_ID && 
        interaction.user.id !== process.env.DEVELOPER) {
          await interaction.followUp({
            embeds: [createNormalMessage(messages.notPermission)]
          });
          return;
      }
      const itemShop = await ShopService.getAllShop();
      const giftsShop = itemShop.filter(item => item.type === ShopItemEnum.GIFT);
      const giftsQuest = await QuestService.getGiftQuest();

      const select = new StringSelectMenuBuilder().setCustomId('giftChooseEdit').setPlaceholder('Chọn quà thêm hoặc sửa rate')
      for (const item of giftsShop) {
        select.addOptions(
          new StringSelectMenuOptionBuilder()
            .setLabel(item.name)
            .setDescription(item.description)
            .setValue(item.id + '')
            .setEmoji(handleEmoji(item.giftEmoji))
        );
      }
      const row = new ActionRowBuilder().addComponents(select);

      const reply = await interaction.followUp({
        embeds: [createQuestMessage(questActionType.giftQuest, { gifts: giftsQuest})],
        components: [row]
      })
      
      const selectCollect = reply.createMessageComponentCollector({
        componentType: ComponentType.StringSelect,
        filter: (i) => i.user.id === interaction.user.id && i.customId === 'giftChooseEdit',
        time: 300000
      });

      let giftChosen = null;

      selectCollect.on('collect', async interaction => {
        try {
          const [value] = interaction.values;
          const gift = giftsShop.find(item => item.id === parseInt(value));
          giftChosen = gift;
          const modal = new ModalBuilder()
          .setCustomId('editGiftRate')
          .setTitle(`Chỉnh sửa rate hoặc thêm ${gift.name}`);
  
          const input = new TextInputBuilder()
          .setCustomId(`rate`)
          .setLabel(`Rate`)
          .setPlaceholder("Số % drop")
          .setMaxLength(3)
          .setStyle(TextInputStyle.Short);
  
          const firstActionRow = new ActionRowBuilder().addComponents(input);
      
          modal.addComponents(firstActionRow);
          await interaction.showModal(modal);
          
          const submitted = await interaction.awaitModalSubmit({
            time: 60000,
            filter: i => i.user.id === interaction.user.id,
          }).catch(error => {
            console.error(error)
            return null
          })
          if (submitted) {
            await submitted.deferUpdate();
            const dropRate = submitted.fields.getTextInputValue('rate');
            const giftsQuestNew = await QuestService.getGiftQuest();
            const findIndex = giftsQuestNew.findIndex(item => item.id === giftChosen.id);
            if (findIndex === -1) {
              const questToAdd = {
                id: giftChosen.id,
                name: giftChosen.name,
                type: giftChosen.type,
                description: giftChosen.description,
                giftEmoji: giftChosen.giftEmoji,
                intimacyPoints: giftChosen.intimacyPoints,
                dropRate
              }
              await QuestService.addGiftQuest(questToAdd);
              const giftsQuestRender = await QuestService.getGiftQuest();
              await reply.edit({
                embeds: [createQuestMessage(questActionType.giftQuest, { gifts: giftsQuestRender})],
              })
              return;
            }
            const id = giftsQuestNew[findIndex].id;
            await QuestService.updateGiftQuest(id, dropRate);
            giftsQuestNew[findIndex].dropRate = dropRate;
            await reply.edit({
              embeds: [createQuestMessage(questActionType.giftQuest, { gifts: giftsQuestNew})],
            })
          }
        } catch (error) {
          console.log(error);          
        }
      })
    } catch (error) {
      console.log(error, '[admin-add-gift-quest]');
    }
  }
}


module.exports = { quest, giftQuest };