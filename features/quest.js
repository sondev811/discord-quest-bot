const { StringSelectMenuOptionBuilder, StringSelectMenuBuilder, ActionRowBuilder, ButtonBuilder, SelectMenuBuilder, ModalBuilder, TextInputBuilder } = require("@discordjs/builders");
const connectDB = require("../DB/connection");
const { errors, descriptionQuest, userActionType, questActionType } = require("../constants/general");
const messages = require("../constants/messages");
const { createNormalMessage } = require("../messages/normalMessage");
const { createUserMessage } = require("../messages/userMessage");
const { TaskTypeEnum, ActionEnum, RewardEnum } = require("../models/quest.model");
const { QuestService } = require("../services/quest.service");
const { UserService } = require("../services/user.service");
const { checkingLastAttended, getTimeToEndOfDay, isSameWeek, getTimeToEndOfWeek, randomBetweenTwoNumber, handleEmoji, getCurrentTime, randomGiftReward, randomSeedReward, randomFarmItemReward } = require("../utils");
const { ComponentType, ButtonStyle, TextInputStyle } = require("discord.js");
const { LevelService } = require("../services/level.service");
const { ShopService } = require("../services/shop.service");
const { createQuestMessage } = require("../messages/questMessage");
const { BagItemType } = require("../models/user.model");
const { specialItemType } = require("../models/specialItem.model");
const { GiftService } = require("../services/gift.service");
const { SeedService } = require("../services/farmService");
const { seedType } = require("../models/seed.model");
const { farmShopType } = require("../models/farmShop.model");
connectDB();
process.env.TZ = 'Asia/Bangkok';

const randomReward = (rewards, gifts, resetTicket, seeds, farmItems) => {
  const data = []
  for(const reward of rewards) {
    const randomReward = randomBetweenTwoNumber(reward.minQuantity, reward.maxQuantity);
    if (reward.type === RewardEnum.GIFT && gifts.length) {
      const result = randomGiftReward(gifts, randomReward);
      data.push(...result);
      continue;
    }
  
    if (reward.type === RewardEnum.SEED) {
      const result = randomSeedReward(seeds, randomReward);
      data.push(...result);
      continue;
    }

    if (reward.type === RewardEnum.FARM_ITEM) {
      const result = randomFarmItemReward(farmItems, randomReward);
      data.push(...result);
      continue;
    }
  
    data.push({
      rewardType: reward.type,
      quantity: randomReward
    })

  }
  
  if (resetTicket) {
    data.push({
      _id: resetTicket.questItem._id,
      name: resetTicket.questItem.name,
      description: resetTicket.questItem.description,
      rewardType: RewardEnum.QUEST_RESET,
      giftEmoji: resetTicket.questItem.emoji,
      quantity: 1
    })
  }
  return data;
}

const checkExistResetQuest = (itemBag) => {
  const isHaveResetTicket = itemBag.findIndex(item => item.type === BagItemType.RESET_QUEST);
  return isHaveResetTicket;
}

const handleDescription = (action, placeChannel, quantity) => {
  return descriptionQuest[action](quantity, placeChannel);
}

const randomSeeds = async () => {
  try {
    const itemsShop = await ShopService.getFarmShop();
    const plantSeeds = itemsShop.filter(
      item => item.type === farmShopType.seed && item.seedInfo.type === seedType.plant && item.seedInfo.growthTime <= 12);
    const randomSeed = plantSeeds[Math.floor(Math.random() * plantSeeds.length)];
    return { emoji: randomSeed.seedInfo.adultEmoji, name: randomSeed.seedInfo.name};
  } catch (error) {
    console.log(error);
  }
}

const filterQuest = async (quests, type, gifts, resetTicket, seeds, farmItems) => {
  const filtered = quests.filter(item => item.type === type);
  const data = [];
  const { emoji, name } = await randomSeeds();
  filtered.forEach(item => {
    const completionCriteria = randomBetweenTwoNumber(item.minCompletionCriteria, item.maxCompletionCriteria);
    data.push({
      questId: item.id,
      completionCriteria,
      action: item.action,
      placeChannel: item.action === ActionEnum.FARM ? emoji : item.placeChannel,
      progress: 0,
      rewards: randomReward(item.rewards, gifts, resetTicket, seeds, farmItems),
      description: handleDescription(
        item.action, 
        item.action === ActionEnum.FARM ? `${emoji} ${name}` : item.placeChannel,
        completionCriteria
      ),
      isReceivedReward: false,
    })
  })
  return data;
};

const messageQuests = (quests) => quests.filter(quest => quest.action === ActionEnum.MESSAGE || quest.action === ActionEnum.FARM);

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
    console.log(error, '[pick quest]');
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
    const { priceUpgrade, value, priceGoldUpgrade } = infoUpgradeLevel[0];
    const { silver, gold } = user.tickets;
  
    if (silver < priceUpgrade || gold < priceGoldUpgrade) {
      await reply.edit({
        embeds: [createNormalMessage(messages.upgradeLevelFail(value, priceUpgrade, priceGoldUpgrade))],
        components: [row]
      });
      return;
    }

    user.tickets.silver = user.tickets.silver - priceUpgrade;
    user.tickets.gold = user.tickets.gold - priceGoldUpgrade;
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
    console.log(error, '[upgradeQuestExecute]');
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

    const quest = await getQuest(userUpdate.quests.dailyQuestsReceived.quests);

    body.quests = quest;
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

      const isReceivedReward = rewardChecking(quest);
      
      if (body.resetQuantity > 0 && !isReceivedReward) {
          const rowResetAndSubmit = initResetAndSubmit('reset');
          components.push(rowResetAndSubmit);
      } 
    }

    await reply.edit({
      embeds: [createUserMessage(userActionType.getQuest, body)],
      components: [...components]
    });
  } catch (error) {
    console.log(error, '[backToBoardExecute]');
  }  
}

const resetQuestExecute = async (reply, backQuestBoard, discordId) => {
  try {
    const user = await UserService.getUserById(discordId);
    const quests = await QuestService.getAllQuest();
    const seeds = await SeedService.getAllSeed();
    const farmItems = await SeedService.getAllFarmItems();
    if (!quests || !quests.length) {
      throw new Error(errors.GET_ALL_QUEST_ERROR);
    }
    const dailyQuests = await filterQuest(quests, TaskTypeEnum.DAILY, [], null, seeds, farmItems);
  
    const getDailyQuestWithLevel = handleQuestLevel(user.level.value, dailyQuests);

    const collectQuest = []

      for(const quest of getDailyQuestWithLevel) {
        quest.questType = TaskTypeEnum.DAILY;
        const newQuest = await QuestService.addQuest(quest);
        collectQuest.push({
          _id: newQuest._id,
          action: newQuest.action
        })
      }
    
    user.quests.dailyQuestsReceived.timeReceivedQuest = new Date();
    user.quests.dailyQuestsReceived.quests = collectQuest;
    
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
    console.log(error, '[resetQuestExecute]');
  }
}

const rewardQuestDailyExecute = async (reply, backQuestBoard, discordId) => {
  try {
    const user = await UserService.getUserById(discordId);
    const quests = user.quests.dailyQuestsReceived.quests;
    let silverEarning = 0;
    let goldenEarning = 0;
    let countSuccessQuest = 0;
    const tempBag = [];

    const listQuest = await getQuest(quests);

    for(const quest of listQuest) {
      if (quest.progress >= quest.completionCriteria && !quest.isReceivedReward) {
        for(const reward of quest.rewards) {
          if (reward.rewardType === RewardEnum.SILVER_TICKET) {
            silverEarning += reward.quantity;
            continue;
          }
          if (reward.rewardType === RewardEnum.GOLD_TICKET) {
            goldenEarning += reward.quantity;
            continue
          }
          tempBag.push(reward);
        }
        countSuccessQuest++;
        await QuestService.updateReceiveRewardQuest(quest._id);
      }
    }

    const rowBack = new ActionRowBuilder()
    .addComponents([backQuestBoard]);
  
    if (silverEarning === 0) {
      reply.edit({
        embeds: [createNormalMessage('Chưa có nhiệm vụ nào được hoàn thành hoặc bạn đã nhận thưởng rồi.')],
        components: [rowBack]
      })
      return;
    }
 
    user.tickets.silver += silverEarning;
    user.tickets.gold += goldenEarning;
    user.totalTicketClaimDaily += silverEarning;
    user.totalQuestCompleted += countSuccessQuest;
  
    if (user.totalTicketClaimDaily >= user.level.limitTicketDaily) {
      const quantity = user.totalTicketClaimDaily - user.level.limitTicketDaily;
      user.tickets.silver = user.tickets.silver - quantity;
      user.totalTicketClaimDaily = user.totalTicketClaimDaily - quantity;
    }

    tempBag.forEach(bag => {
      const itemExistOnBag = user.itemBag.findIndex(item => item._id.equals(bag._id));
      if (itemExistOnBag === -1) {
        const itemToAdd = {
          _id: bag._id,
          name: bag.name,
          description: bag.description,
          type: bag.rewardType,
          seedInfo: bag.seedInfo,
          farmItemInfo: bag.farmItemInfo,
          quantity: bag.quantity,
        } 
        user.itemBag.push(itemToAdd);
      } else {
        user.itemBag[itemExistOnBag].quantity += bag.quantity;
      }
    })
  
    await UserService.updateUser(user);
    
    reply.edit({
      embeds: [createNormalMessage('Nhận thưởng thành công.')],
      components: [rowBack]
    })
  } catch (error) {
    console.log(error, '[rewardQuestDailyExecute]');
  }
}

const rewardQuestWeekExecute = async (reply, backQuestBoard, discordId) => {
  try {
    const user = await UserService.getUserById(discordId);
    const quests = await getQuest(user.quests.weekQuestsReceived.quests);
    let silverEarning = 0;
    let goldEarning = 0;
    let countSuccessQuest = 0;
    const tempBag = [];
    
    for(const quest of quests) {
      if (quest.progress >= quest.completionCriteria && !quest.isReceivedReward) {
        for(const reward of quest.rewards) {
          if (reward.rewardType === RewardEnum.SILVER_TICKET) {
            silverEarning += reward.quantity;
            continue;
          }
          if (reward.rewardType === RewardEnum.GOLD_TICKET) {
            goldEarning += reward.quantity;
            continue
          }
          tempBag.push(reward);
        }
        countSuccessQuest++;
        await QuestService.updateReceiveRewardQuest(quest._id);
      }

    }

    const rowBack = new ActionRowBuilder()
    .addComponents([backQuestBoard]);
  
    if (silverEarning === 0 && goldEarning === 0) {
      reply.edit({
        embeds: [createNormalMessage('Chưa hoàn thành nhiệm vụ tuần hoặc bạn đã nhận thưởng rồi.')],
        components: [rowBack]
      })
      return;
    }
 
    user.tickets.silver += silverEarning;
    user.tickets.gold += goldEarning;
    user.totalTicketClaimDaily += silverEarning;
    user.totalQuestCompleted += countSuccessQuest;
    
    tempBag.forEach(bag => {
      const itemExistOnBag = user.itemBag.findIndex(item => item._id.equals(bag._id));
      if (itemExistOnBag === -1) {
        const itemToAdd = {
          _id: bag._id,
          name: bag.name,
          description: bag.description,
          type: bag.rewardType === RewardEnum.QUEST_RESET ? BagItemType.RESET_QUEST : bag.rewardType,
          intimacyPoints: bag.intimacyPoints,
          giftEmoji: bag.giftEmoji,
          quantity: bag.quantity,
          valueBuff: bag.valueBuff,
          seedInfo: bag.seedInfo,
          farmItemInfo: bag.farmItemInfo,
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
    console.log(error, '[rewardQuestWeekExecute]');
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
  .setStyle(ButtonStyle.Primary)
  .setEmoji({
    name: 'level_up',
    id: '1174300851020496926',
    animated: true
  });

  const guideQuestBtn = new ButtonBuilder()
  .setCustomId('guideQuest')
  .setLabel('Hướng dẫn')
  .setStyle(ButtonStyle.Primary).setEmoji({
    name: 'guide',
    id: '1174302703430676511',
    animated: true
  });

  const rowSelect = new ActionRowBuilder()
  .addComponents(select);

  const rewardQuestDaily = new ButtonBuilder()
  .setCustomId('rewardQuestDaily')
  .setLabel('Nhận thưởng ngày')
  .setStyle(ButtonStyle.Primary).setEmoji({
    name: 'gift_box',
    id: '1174301397886439484',
    animated: true
  });

  const rewardQuestWeek = new ButtonBuilder()
  .setCustomId('rewardQuestWeek')
  .setLabel('Nhận thưởng tuần')
  .setStyle(ButtonStyle.Primary).setEmoji({
    name: 'gift_box',
    id: '1174301397886439484',
    animated: true
  });

  const backQuestBoard = new ButtonBuilder()
  .setCustomId('backQuestBoard')
  .setLabel('Quay lại bảng nhiệm vụ')
  .setStyle(ButtonStyle.Primary).setEmoji({
    name: 'back_to_board',
    id: '1174295696522874890',
    animated: true
  });

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
  .setStyle(ButtonStyle.Primary)
  .setEmoji({
    name: 'reset',
    id: '1174302627765432402',
    animated: true
  });
 
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

const getQuest = async (data) => {
  const quests = [];
  for(const item of data) {
    const quest = await QuestService.getQuest(item._id);
    quests.push(quest);
  }
  return quests;
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

    const quests = await getQuest(user.quests.dailyQuestsReceived.quests);
    
    const body = { 
      totalQuestCompleted: user.totalQuestCompleted, 
      totalTicketClaimDaily: user.totalTicketClaimDaily,
      maxTicket: user.level.limitTicketDaily,
      endTime: `${hoursRemaining} giờ ${minutesRemaining} phút ${secondsRemaining} giây`,
      quests,
      username: user.username,
      discordUserId: user.discordUserId,
      avatar,
      questType: 'daily',
      level: user.level.value,
      questQuantity: user.level.limitQuestQuantity,
      resetQuantity: 0
    }
  
    const isReceivedReward = rewardChecking(quests);
  
    const componentInit = [rowSelect, rowBtnUpgradeGuideRewardDaily];
  
    const isHaveResetTicket = checkExistResetQuest(user.itemBag);
  
    if (isHaveResetTicket !== -1) {
      body.resetQuantity = user.itemBag[isHaveResetTicket].quantity;
    } else {
      body.resetQuantity = 0;
    }
  
    if (body.resetQuantity > 0 && !isReceivedReward) {
        const rowResetAndSubmit = initResetAndSubmit('reset');
        componentInit.push(rowResetAndSubmit);
    } 
  
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
        await interaction.deferUpdate();
        const [value] = interaction.values;
        let selectedOption = 'dailyQuest';
        
        if (value === 'weekQuest') {
          const { hoursRemaining, minutesRemaining, secondsRemaining } = getTimeToEndOfWeek();
          const userUpdate = await UserService.getUserById(discordId);
          const quests = await getQuest(userUpdate.quests.weekQuestsReceived.quests);
          body.quests = quests;
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
          const quests = await getQuest(userUpdate.quests.dailyQuestsReceived.quests);
          body.quests = quests;
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
  
          if (body.resetQuantity > 0 && !isReceivedReward) {
              const rowResetAndSubmit = initResetAndSubmit('reset');
              components.push(rowResetAndSubmit);
          } 
        }
  
        const message = await interaction.channel?.messages.fetch(interaction.message.id);
  
        await message.edit({ 
          embeds: [createUserMessage(userActionType.getQuest, body)],
          components,
        });
  
      } catch (error) {
        console.log(error, '[Choose quest]');      
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
        await interaction.deferUpdate();
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
          // submitItemQuest(interaction, reply, backQuestBoard, discordId);
          return;
        }
  
        const rowBack = new ActionRowBuilder()
        .addComponents([backQuestBoard]);
  
        await reply.edit({
          embeds: [createUserMessage(userActionType.guide, { username: user.username, discordUserId: discordId, avatar })],
          components: [rowBack]
        });
       
      } catch (error) {
        console.log(error, '[upgradeQuest]');      
      }
    })
  } catch (error) {
    console.log(error, '[reply quest]');
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
        const gifts = await GiftService.getAllGift();
        const seeds = await SeedService.getAllSeed();
        const farmItems = await SeedService.getAllFarmItems();
        if (!gifts.length) return;
        const itemQuest = await ShopService.getQuestShop();
        const resetTicket = itemQuest.find(item => item.questItem.type === specialItemType.RESET_QUEST);
        const weekQuests = await filterQuest(quests, TaskTypeEnum.WEEK, gifts, resetTicket, seeds, farmItems);
        const getWeekQuestWithLevel = getRandomQuest(weekQuests);
        
        getWeekQuestWithLevel.questType = TaskTypeEnum.WEEK;

        const newQuest = await QuestService.addQuest(getWeekQuestWithLevel);

        const collectQuest = [{
          _id: newQuest._id,
          action: newQuest.action
        }];

        user.quests.weekQuestsReceived.timeReceivedQuest = new Date();
        user.quests.weekQuestsReceived.quests = collectQuest;
        await UserService.updateUser(user);
      }

      const isReceivedQuest = checkingLastAttended(user.quests.dailyQuestsReceived.timeReceivedQuest) && user.quests.dailyQuestsReceived.quests.length; 
      if (isReceivedQuest) {
        reply(interaction, user, avatar, discordId);
        return user;
      }

      const seeds = await SeedService.getAllSeed();
      const farmItems = await SeedService.getAllFarmItems();

      const dailyQuests = await filterQuest(quests, TaskTypeEnum.DAILY, [], null, seeds, farmItems);
      
      const getDailyQuestWithLevel = handleQuestLevel(user.level.value, dailyQuests);

      const collectQuest = []

      for(const quest of getDailyQuestWithLevel) {
        quest.questType = TaskTypeEnum.DAILY;
        const newQuest = await QuestService.addQuest(quest);
        collectQuest.push({
          _id: newQuest._id,
          action: newQuest.action
        })
      }
      
      user.quests.dailyQuestsReceived.timeReceivedQuest = new Date();
      user.quests.dailyQuestsReceived.quests = collectQuest;
      user.totalTicketClaimDaily = 0;

      await UserService.updateUser(user);
      
      reply(interaction, user, avatar, discordId);
    } catch (error) {
      console.log(error, '[quest]');
    }
  }
}

const giftQuest = {
  name: 'admin-edit-gift-drop-rate',
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
      const gifts = await GiftService.getAllGift();

      const select = new StringSelectMenuBuilder().setCustomId('giftChooseEdit').setPlaceholder('Chọn quà muốn sửa rate')
      for (const item of gifts) {
        select.addOptions(
          new StringSelectMenuOptionBuilder()
            .setLabel(item.name)
            .setDescription(item.description)
            .setValue(String(item._id))
            .setEmoji(handleEmoji(item.giftEmoji))
        );
      }
      const row = new ActionRowBuilder().addComponents(select);

      const reply = await interaction.followUp({
        embeds: [createQuestMessage(questActionType.giftQuest, { gifts })],
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
          const gift = gifts.find(item => item._id.equals(value));
          giftChosen = gift;
          const modal = new ModalBuilder()
          .setCustomId('editGiftRate')
          .setTitle(`Chỉnh sửa rate ${gift.name}`);
  
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
            console.error(error, '[modal submit]')
            return null
          })
          if (submitted) {
            await submitted.deferUpdate();
            const dropRate = submitted.fields.getTextInputValue('rate');
            const findIndex = gifts.findIndex(item => item._id.equals(giftChosen._id));
            gifts[findIndex].dropRate = dropRate;
            await GiftService.editDropRateGift(gifts[findIndex]._id, dropRate);
            await reply.edit({
              embeds: [createQuestMessage(questActionType.giftQuest, { gifts })],
            })
          }
        } catch (error) {
          console.log(error, '[update rate]');          
        }
      })
    } catch (error) {
      console.log(error, '[admin-add-gift-quest]');
    }
  }
}

module.exports = { quest, giftQuest };