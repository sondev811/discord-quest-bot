const { RewardEnum } = require("../models/quest.model");
const { ShopService } = require("../services/shop.service");
const { UserService } = require("../services/user.service");
const { createNormalMessage } = require("../messages/normalMessage");
const messages = require("../constants/messages");
const connectDB = require("../DB/connection");
const { createShopMessage } = require("../messages/shopMessage");
const { shopActionType, purchaseQuantity, currency, emoji } = require("../constants/general");
const { StringSelectMenuBuilder, StringSelectMenuOptionBuilder, ButtonBuilder, ActionRowBuilder, SelectMenuBuilder } = require("@discordjs/builders");
const { ButtonStyle, ComponentType, ChannelType } = require("discord.js");
const { cloneDeep, handleEmoji, randomBetweenTwoNumber, randomGiftReward } = require("../utils");
const { RoleService } = require("../services/role.service");
const { GiftService } = require("../services/gift.service");
const { SpecialItemService } = require("../services/specialItem.service");
const { specialItemType, typeBuffSpecial } = require("../models/specialItem.model");
const { intimacyShopType } = require("../models/intimacyShop");
const { FriendService } = require("../services/friend.service");
const { TreasureItemType } = require("../models/treasureBox.model");
const { default: mongoose } = require("mongoose");
const { BagItemType } = require("../models/user.model");
connectDB();

const purchaseGiftBtn = () => {
  const silverTicket = {
    id: '1168509616938815650',
    name: 'leu_ticket'
  };
  const goldTicket = {
    id: '1169279388370604062',
    name: 'leu_ticket_vang'
  };
  const buyOneSilver = new ButtonBuilder()
    .setCustomId('buyOne:silver')
    .setLabel('Mua x1')
    .setStyle(ButtonStyle.Primary).setEmoji(silverTicket);

  const buyFiveSilver = new ButtonBuilder()
    .setCustomId('buyFive:silver')
    .setLabel('Mua x5')
    .setStyle(ButtonStyle.Primary).setEmoji(silverTicket);

  const buyTenSilver = new ButtonBuilder()
    .setCustomId('buyTen:silver')
    .setLabel('Mua x10')
    .setStyle(ButtonStyle.Primary).setEmoji(silverTicket);

  const buyFiftySilver = new ButtonBuilder()
    .setCustomId('buyFifty:silver')
    .setLabel('Mua x50')
    .setStyle(ButtonStyle.Primary).setEmoji(silverTicket);

  const buyOneGold = new ButtonBuilder()
    .setCustomId('buyOne:gold')
    .setLabel('Mua x1')
    .setStyle(ButtonStyle.Primary).setEmoji(goldTicket);

  const buyFiveGold = new ButtonBuilder()
    .setCustomId('buyFive:gold')
    .setLabel('Mua x5')
    .setStyle(ButtonStyle.Primary).setEmoji(goldTicket);

  const buyTenGold = new ButtonBuilder()
    .setCustomId('buyTen:gold')
    .setLabel('Mua x10')
    .setStyle(ButtonStyle.Primary).setEmoji(goldTicket);

  const buyFiftyGold = new ButtonBuilder()
    .setCustomId('buyFifty:gold')
    .setLabel('Mua x50')
    .setStyle(ButtonStyle.Primary).setEmoji(goldTicket);

  const rowPurchaseSilver = new ActionRowBuilder().addComponents([buyOneSilver, buyFiveSilver, buyTenSilver, buyFiftySilver]);
  const rowPurchaseGold = new ActionRowBuilder().addComponents([buyOneGold, buyFiveGold, buyTenGold, buyFiftyGold]);
  
  return { rowPurchaseSilver, rowPurchaseGold };
}

const purchaseRoleBtn = (isPurchaseByGold = false) => {
  const silverTicket = {
    id: '1168509616938815650',
    name: 'leu_ticket'
  };
  const goldTicket = {
    id: '1169279388370604062',
    name: 'leu_ticket_vang'
  };
  const buyOneSilver = new ButtonBuilder()
    .setCustomId('buyRoleSilver')
    .setLabel('Mua')
    .setStyle(ButtonStyle.Primary).setEmoji(silverTicket);

  const buyOneGold = new ButtonBuilder()
    .setCustomId('buyRoleGold')
    .setLabel('Mua')
    .setStyle(ButtonStyle.Primary).setEmoji(goldTicket);

  const components = [buyOneSilver];
  if (isPurchaseByGold) {
    components.push(buyOneGold)
  }
  const rowPurchase = new ActionRowBuilder().addComponents(components);
  return { rowPurchase };
}

const purchaseQuestItemBtn = () => {
  const silverTicket = {
    id: '1168509616938815650',
    name: 'leu_ticket'
  };
  const goldTicket = {
    id: '1169279388370604062',
    name: 'leu_ticket_vang'
  };
  const buyOneSilver = new ButtonBuilder()
    .setCustomId('buyQuestItemSilver')
    .setLabel('Mua')
    .setStyle(ButtonStyle.Primary).setEmoji(silverTicket);

  const buyOneGold = new ButtonBuilder()
    .setCustomId('buyQuestItemGold')
    .setLabel('Mua')
    .setStyle(ButtonStyle.Primary).setEmoji(goldTicket);

  const rowPurchase = new ActionRowBuilder().addComponents([buyOneSilver, buyOneGold]);
  
  return { rowPurchase };
}

const purchaseIntimacyBtn = () => {
  const purchase = new ButtonBuilder()
    .setCustomId('buyIntimacyItem')
    .setLabel('Mua')
    .setStyle(ButtonStyle.Primary)
    .setEmoji({
      name: 'Leu_blue_hearts',
      id: '1171862703384572024',
      animated: true
    });

  const rowPurchase = new ActionRowBuilder().addComponents([purchase]);
  return { rowPurchase };
}

let shopChosen = null;

const giftShop = async (interaction, reply, gifts, beforeSelect, user) => {
  const select = new StringSelectMenuBuilder().setCustomId('shopGiftChoose').setPlaceholder('Chọn món quà')
  for (const item of gifts) {
    select.addOptions(
      new StringSelectMenuOptionBuilder()
        .setLabel(item.giftInfo.name)
        .setDescription(item.giftInfo.description)
        .setValue(item.id + '')
        .setEmoji(handleEmoji(item.giftInfo.giftEmoji))
    );
  }
  const embeds = createShopMessage(shopActionType.getGiftShop, { gifts, silver: user.tickets.silver, gold: user.tickets.gold });

  const rowBeforeSelect = new ActionRowBuilder().addComponents(beforeSelect)

  const rowSelect = new ActionRowBuilder().addComponents(select);

  await reply.edit({
    embeds: [embeds],
    components: [rowSelect, rowBeforeSelect]
  });

  const giftShopCollection = reply.createMessageComponentCollector({
    componentType: ComponentType.StringSelect,
    filter: (i) => i.user.id === interaction.user.id && i.customId === 'shopGiftChoose',
    time: 300000
  });

  giftShopCollection.on('collect', async (interaction) => {
    try {
      await interaction.deferUpdate();
      const [value] = interaction.values;
      const gift = gifts.find(item => item.id === parseInt(value));
      shopChosen = gift;
      const { rowPurchaseSilver, rowPurchaseGold } = purchaseGiftBtn();
      const {  priceSilver, priceGold, giftInfo } = gift;
      const { giftEmoji, name, description } = giftInfo;
      await reply.edit({
        embeds: [createShopMessage(shopActionType.getDetailGift, { giftEmoji, name, priceSilver, priceGold, description, silver: user.tickets.silver, gold: user.tickets.gold })],
        components: [rowPurchaseSilver, rowPurchaseGold, rowBeforeSelect]
      });
    } catch (error) {
      console.log(error);
    }
  });
}

const roleShop = async (interaction, reply, roles, beforeSelect, user) => {
  const select = new StringSelectMenuBuilder().setCustomId('shopRoleChoose').setPlaceholder('Chọn role muốn mua')
  for (const item of roles) {
    select.addOptions(
      new StringSelectMenuOptionBuilder()
        .setLabel(item.roleInfo.name)
        .setDescription(item.roleInfo.description)
        .setValue(item.id + '')
    );
  }

  const embeds = createShopMessage(shopActionType.getRoleShop, { roles, silver: user.tickets.silver, gold: user.tickets.gold });

  const rowBeforeSelect = new ActionRowBuilder().addComponents(beforeSelect)

  const rowSelect = new ActionRowBuilder().addComponents(select);

  await reply.edit({
    embeds: [embeds],
    components: [rowSelect, rowBeforeSelect]
  });

  const roleShopCollection = reply.createMessageComponentCollector({
    componentType: ComponentType.StringSelect,
    filter: (i) => i.user.id === interaction.user.id && i.customId === 'shopRoleChoose',
    time: 300000
  });

  roleShopCollection.on('collect', async (interaction) => {
    try {
      await interaction.deferUpdate();
      const [value] = interaction.values;
      const role = roles.find(item => item.id === parseInt(value));
      if (!role || !role.id) return;
      shopChosen = role;
      const { rowPurchase } = purchaseRoleBtn(role.priceGold !== null);
      const { priceSilver, priceGold, roleInfo } = role;
      const { roleId, description } = roleInfo;
      await reply.edit({
        embeds: [createShopMessage(shopActionType.getDetailRole, { roleId, priceSilver, priceGold, description, silver: user.tickets.silver, gold: user.tickets.gold })],
        components: [rowPurchase, rowBeforeSelect]
      });
    } catch (error) {
      console.log(error);
    }
  });
}

const questShop = async (interaction, reply, questItems, beforeSelect, user) => {
  const select = new StringSelectMenuBuilder().setCustomId('shopQuestChoose').setPlaceholder('Chọn vật phẩm muốn mua')
  for (const item of questItems) {
    select.addOptions(
      new StringSelectMenuOptionBuilder()
        .setLabel(item.questItem.name)
        .setDescription(item.questItem.description)
        .setValue(item.id + '')
        .setEmoji(handleEmoji(item.questItem.emoji))
    );
  }

  const embeds = createShopMessage(shopActionType.getQuestShop, { questItem: questItems, silver: user.tickets.silver, gold: user.tickets.gold });

  const rowBeforeSelect = new ActionRowBuilder().addComponents(beforeSelect)

  const rowSelect = new ActionRowBuilder().addComponents(select);

  await reply.edit({
    embeds: [embeds],
    components: [rowSelect, rowBeforeSelect]
  });

  const questShopCollection = reply.createMessageComponentCollector({
    componentType: ComponentType.StringSelect,
    filter: (i) => i.user.id === interaction.user.id && i.customId === 'shopQuestChoose',
    time: 300000
  });

  questShopCollection.on('collect', async (interaction) => {
    try {
      await interaction.deferUpdate();
      const [value] = interaction.values;
      const item = questItems.find(item => item.id === parseInt(value));
      shopChosen = item;
      const { rowPurchase } = purchaseQuestItemBtn();
      const {  priceSilver, priceGold, questItem } = shopChosen;
      const { emoji, name, description } = questItem;
      await reply.edit({
        embeds: [createShopMessage(shopActionType.getDetailGift, { giftEmoji: emoji, name, priceSilver, priceGold, description, silver: user.tickets.silver, gold: user.tickets.gold })],
        components: [rowPurchase, rowBeforeSelect]
      });
    } catch (error) {
      console.log(error);
    }
  });
}

const chooseFriend = async(interaction, reply, intimacyItem, beforeSelect, user) => {
  try {
    if(user.friends.length === 0) {
      await reply.edit({
        embeds: [createNormalMessage(messages.notExistFriend)]
      });
      return;
    }
    const newUserData = await UserService.getUserById(user.discordUserId);
    const select = new StringSelectMenuBuilder().setCustomId('friendChoose').setPlaceholder('Chọn bạn cùng mua')
    for (const item of newUserData.friends) {
      const member = await interaction.guild.members.fetch(item.discordUserId);
      select.addOptions(
        new StringSelectMenuOptionBuilder()
          .setLabel(member.user.username)
          .setDescription(`Điểm thân thiết: ${item.intimacyPoints}`)
          .setValue(item.discordUserId)
      );
    }
    const rowBeforeSelect = new ActionRowBuilder().addComponents(beforeSelect)

    const rowSelect = new ActionRowBuilder().addComponents(select);
  
    await reply.edit({
      embeds: [createNormalMessage(messages.chooseFriend)],
      components: [rowSelect, rowBeforeSelect]
    });

    const intimacyShopCollection = reply.createMessageComponentCollector({
      componentType: ComponentType.StringSelect,
      filter: (i) => i.user.id === interaction.user.id && i.customId === 'friendChoose',
      time: 300000
    });

    intimacyShopCollection.on('collect', async (interaction) => {
      try {
        await interaction.deferUpdate();
        const [value] = interaction.values;
        const friend = user.friends.find(item => item.discordUserId === value);
        if (!friend || !friend.discordUserId) return;
        intimacyPointsShop(interaction, reply, intimacyItem, beforeSelect, newUserData, friend);
      } catch (error) {
        console.log(error);
      }
    });

    
  } catch (error) {
    console.log(error);
  }
}

const intimacyPointsShop = async (interaction, reply, intimacyItem, beforeSelect, user, friend) => {
  const select = new StringSelectMenuBuilder().setCustomId('intimacyPointsShopChoose').setPlaceholder('Chọn vật phẩm muốn mua')
  for (const item of intimacyItem) {
    const label = item.type === intimacyShopType.treasureBox ? item.treasureBoxInfo.name : item.specialInfo.name;
    const des = item.type === intimacyShopType.treasureBox ? item.treasureBoxInfo.description : item.specialInfo.description
    select.addOptions(
      new StringSelectMenuOptionBuilder()
        .setLabel(label)
        .setDescription(des)
        .setValue(item.id + '')
    );
  }

  const guide = new ButtonBuilder()
  .setCustomId('guideIntimacyShop')
  .setLabel('Hướng dẫn cửa hàng thân mật')
  .setStyle(ButtonStyle.Primary)
  .setEmoji({
    name: 'guide',
    id: '1174302703430676511',
    animated: true
  });

  const embeds = createShopMessage(shopActionType.getImShop, { intimacyItem, friend });

  const rowBeforeSelect = new ActionRowBuilder().addComponents(beforeSelect);

  const rowSelect = new ActionRowBuilder().addComponents(select);
  const rowBtn = new ActionRowBuilder().addComponents(guide);

  await reply.edit({
    embeds: [embeds],
    components: [rowSelect, rowBeforeSelect, rowBtn]
  });

  const intimacyShopCollection = reply.createMessageComponentCollector({
    componentType: ComponentType.StringSelect,
    filter: (i) => i.user.id === interaction.user.id && i.customId === 'intimacyPointsShopChoose',
    time: 300000
  });

  intimacyShopCollection.on('collect', async (interaction) => {
    try {
      await interaction.deferUpdate();
      const [value] = interaction.values;
      const item = intimacyItem.find(item => item.id === parseInt(value));
      shopChosen = item;
      const { rowPurchase } = purchaseIntimacyBtn();
      await reply.edit({
        embeds: [createShopMessage(shopActionType.getDetailIntimacy, { item, friend })],
        components: [rowPurchase, rowBeforeSelect]
      });
    } catch (error) {
      console.log(error);
    }
  });

  const purchaseCollection = reply.createMessageComponentCollector({
    componentType: ComponentType.Button,
    filter: (i) => i.user.id === interaction.user.id && i.customId === 'buyIntimacyItem',
    time: 300000
  });

  purchaseCollection.on('collect', async(interaction) => {
    try {
      await interaction.deferUpdate();
      progressIntimacyShop(interaction, reply, intimacyItem, beforeSelect, user, friend, shopChosen);
    } catch (error) {
      console.log(error);
    }
  })

  const guideShopIntimacy = reply.createMessageComponentCollector({
    componentType: ComponentType.Button,
    filter: (i) => i.user.id === interaction.user.id && i.customId === 'guideIntimacyShop',
    time: 300000
  });

  guideShopIntimacy.on('collect', async(interaction) => {
    try {
      await interaction.deferUpdate();
      await reply.edit({
        embeds: [createShopMessage( shopActionType.guideIntimacyShop)],
      })
    } catch (error) {
      console.log(error);
    }
  })
}

const progressIntimacyShop = async (interaction, reply, intimacyItem, beforeSelect, user, friend, shopChosen) => {
  try {
    const beforeSelectRow = new ActionRowBuilder().addComponents(beforeSelect);
    if (friend.intimacyPoints < shopChosen.intimacyPrice) {
      await reply.edit({
        embeds: [createNormalMessage(messages.insufficientPoint(shopChosen.intimacyPrice))],
        components: [beforeSelectRow]
      });
      return;
    }
  
    const userFriend = await UserService.getUserById(friend.discordUserId);
  
    if (shopChosen.silverTicket) {
      if (userFriend.tickets.silver < Math.floor(shopChosen.silverTicket / 2)) {
        await reply.edit({
          embeds: [createNormalMessage(messages.insufficientSilverIntimacyShop(userFriend.discordUserId, shopChosen.silverTicket))],
          components: [beforeSelectRow]
        });
        return;
      }
      if (user.tickets.silver < Math.floor(shopChosen.silverTicket / 2)) {
        await reply.edit({
          embeds: [createNormalMessage(messages.insufficientSilverIntimacyShop(user.discordUserId, shopChosen.silverTicket))],
          components: [beforeSelectRow]
        });
        return;
      }
    }
    
    const messageFriend = await interaction.guild?.members.fetch(userFriend.discordUserId);
    const messageUser = await interaction.guild?.members.fetch(user.discordUserId);
    
    const confirm = new ButtonBuilder()
    .setCustomId('confirmPurchaseIntimacyPurchase')
    .setLabel('Xác nhận mua')
    .setStyle(ButtonStyle.Success)
    .setEmoji({
      name: 'checked',
      id: '1174312599085650000',
      animated: true
    });
  
    const reject = new ButtonBuilder()
    .setCustomId('rejectPurchaseIntimacyPurchase')
    .setLabel('Không mua')
    .setStyle(ButtonStyle.Danger);
  
    const rowSelect = new ActionRowBuilder().addComponents([confirm, reject]);
  
    await reply.edit({
      embeds: [createNormalMessage(messages.sendIntimacyPurchaseConfirm(user.discordUserId, userFriend.discordUserId, shopChosen))],
      components: [rowSelect]
    });

    const currentChannel = interaction.channel;
    const mentionMessage = await currentChannel.send(`<@${userFriend.discordUserId}>`);
  
    const waitReply = await reply.createMessageComponentCollector({
      componentType: ComponentType.Button,
      filter: (i) => i.user.id === userFriend.discordUserId && 
      ( i.customId === 'confirmPurchaseIntimacyPurchase' || 
        i.customId === 'rejectPurchaseIntimacyPurchase'
      ),
      time: 300000
    })
  
    waitReply.on('collect', async(interaction) => {
      try {
        await interaction.deferUpdate();
        const customId = interaction.customId;
        // if(mentionMessage) {
        //   mentionMessage.delete();
        // }
        if (customId === 'rejectPurchaseIntimacyPurchase') {
          await reply.edit({
            embeds: [createNormalMessage(messages.sendRejectIntimacyPurchase(userFriend.discordUserId, shopChosen))],
            components: [beforeSelectRow]
          });
          return;
        }
        if (shopChosen.type === intimacyShopType.specialItem) {

          const silverPrice = Math.floor(shopChosen.silverTicket / 2);

          const findFriendIndexUser = user.friends.findIndex(item => item.discordUserId === userFriend.discordUserId);
          user.friends[findFriendIndexUser].intimacyPoints -= shopChosen.intimacyPrice;
    
          const findFriendIndex = userFriend.friends.findIndex(item => item.discordUserId === user.discordUserId);
  
          userFriend.friends[findFriendIndex].intimacyPoints -= shopChosen.intimacyPrice;
  
          const itemToAdd = {
            _id: shopChosen.specialInfo._id,
            name: shopChosen.specialInfo.name,
            description: shopChosen.specialInfo.description,
            type: shopChosen.specialInfo.type,
            quantity: 1
          };
  
          if (user.itemBag.length === 0) {
            user.itemBag.push(itemToAdd);
          } else {
            const findIndex = user.itemBag.findIndex(item => item._id.equals(shopChosen.specialInfo._id));
            if (findIndex === -1) {
              user.itemBag.push(itemToAdd);
            } else {
              user.itemBag[findIndex].quantity += 1;
            }
          }
  
          user.tickets.silver -= silverPrice;
          userFriend.tickets.silver -= silverPrice;
  
          await UserService.updateUser(user);
          await UserService.updateUser(userFriend);
          await FriendService.updateIntimacyPoints(user.discordUserId, userFriend.discordUserId, user.friends[findFriendIndexUser].intimacyPoints)
          
          await reply.edit({
            embeds: [createNormalMessage(messages.purchaseCertificateSuccess(user.discordUserId, userFriend.discordUserId, shopChosen, user.friends[findFriendIndexUser].intimacyPoints))],
            components: [beforeSelectRow]
          });
          
          const logChannel = interaction.guild?.channels.cache.get(process.env.LOG_CHANNEL || '');
  
          if (logChannel?.type === ChannelType.GuildText) {
            await logChannel.send(`[Purchase] ${user.username} và ${userFriend.username} đã mua x1 ${shopChosen.specialInfo.emoji} ${shopChosen.specialInfo.name} bằng ${shopChosen.intimacyPrice}${emoji.imPoint} và ${shopChosen.silverTicket}${emoji.silverTicket}.`);
          }
          return;
        }
        
        const giftReceived = [];
        let silverTicketReceived = 0;
        let goldenTicketReceived = 0;
        let roleData = '';
        let userCanReceived = null;
        let specialItemReceived = null;
  
        const treasureItems = shopChosen.treasureBoxInfo.items;
        const gifts = await GiftService.getAllGift();
        for(let item of treasureItems) {
          if (item.itemType === TreasureItemType.ticket) {
            user.tickets.silver += Math.floor(item.tickets.silver / 2);
            userFriend.tickets.silver += Math.floor(item.tickets.silver / 2);
            user.tickets.gold += Math.floor(item.tickets.gold / 2);
            userFriend.tickets.gold += Math.floor(item.tickets.gold / 2);
            silverTicketReceived = Math.floor(item.tickets.silver / 2);
            goldenTicketReceived = Math.floor(item.tickets.gold / 2);
            continue;
          }
  
          if (item.itemType === TreasureItemType.gift) {
            const newGift = randomGiftReward(gifts, item.giftQuantity);
            giftReceived.push(...newGift);
            for (const gift of newGift) {
              if (user.itemBag.length === 0) {
                user.itemBag.push(gift);
              } else {
                const itemExistOnBag = user.itemBag.findIndex(item => item._id.equals(gift._id));
                if (itemExistOnBag === -1) {
                  user.itemBag.push(gift);
                } else {
                  user.itemBag[itemExistOnBag].quantity += gift.quantity;
                }
              }

              if (userFriend.itemBag.length === 0) {
                userFriend.itemBag.push(gift);
                continue;
              }
  
              const itemExistOnBagFriend = userFriend.itemBag.findIndex(item => item._id.equals(gift._id));
              if (itemExistOnBagFriend === -1) {
                userFriend.itemBag.push(gift);
              } else {
                userFriend.itemBag[itemExistOnBagFriend].quantity += gift.quantity;
              }
            }
            continue;
          }

          if (item.itemType === TreasureItemType.role) {
            const randomValue = Math.random();
            if (randomValue < 0.5) continue;
            const itemToAdd = {
              _id: item.roleInfo._id,
              name: item.roleInfo.name,
              description: item.roleInfo.description,
              type: BagItemType.ROLE,
              roleId: item.roleInfo.roleId,
              typeBuff: item.roleInfo.typeBuff,
              valueBuff: item.roleInfo.valueBuff,
              quantity: 1
            };
    
            if (user.itemBag.length === 0) {
              user.itemBag.push(itemToAdd);
            } else {
              console.log(item.roleInfo._id);
              const findIndex = user.itemBag.findIndex(itemBag => itemBag._id.equals(item.roleInfo._id));
              if (findIndex === -1) {
                user.itemBag.push(itemToAdd);
              }
            }
    
            if (userFriend.itemBag.length === 0) {
              userFriend.itemBag.push(itemToAdd);
            } else {
              const findIndex = userFriend.itemBag.findIndex(itemBag => itemBag._id.equals(item.roleInfo._id));
              if (findIndex === -1) {
                userFriend.itemBag.push(itemToAdd);
              }
            }

            const role = await interaction.guild?.roles.cache.get(item.roleInfo.roleId);
            roleData = role;
            if (role) {
              await messageUser.roles.add(role);
              await messageFriend.roles.add(role);
            }
            continue;
          }
  
          if (item.itemType === TreasureItemType.specialItem) {
            let specialItem = item.specialItems[0];
            if (item.specialItems.length > 1) {
              const randomValue = Math.random();
              specialItem = randomValue < 0.5 ? item.specialItems[0] : item.specialItems[1] ;
            }
            specialItemReceived = specialItem;
            const itemToAdd = {
              _id: specialItem._id,
              name: specialItem.name,
              description: specialItem.description,
              type: specialItem.type,
              typeBuff: specialItem.typeBuff === typeBuffSpecial.DAILY_BUFF ? specialItem.buffInfo.typeBuff : null,
              giftEmoji: specialItem.emoji,
              valueBuff: specialItem.typeBuff === typeBuffSpecial.DAILY_BUFF ? specialItem.buffInfo.valueBuff : null,
              quantity: 1,
              specialValue: specialItem.type === specialItemType.RING_PIECE ? specialItem.weedingPiece.value : null
            }
  
            if (shopChosen.treasureBoxInfo.isRandomSpecialItem) {
              const random = Math.random();
              userCanReceived = random < 0.5 ? user : userFriend;
            } else {
              userCanReceived = user;
            }
  
            if (userCanReceived.itemBag.length === 0) {
              userCanReceived.itemBag.push(itemToAdd);
              continue;
            }
  
            const itemExistOnBag = userCanReceived.itemBag.findIndex(item => item._id.equals(specialItem._id));
            if (itemExistOnBag === -1) {
              userCanReceived.itemBag.push(itemToAdd);
            } else {
              userCanReceived.itemBag[itemExistOnBag].quantity += 1;
            }
  
          }
        }
  
        const findFriendIndexUser = user.friends.findIndex(item => item.discordUserId === userFriend.discordUserId);
        user.friends[findFriendIndexUser].intimacyPoints -= shopChosen.intimacyPrice;
        user.tickets.silver -= Math.floor(shopChosen.silverTicket / 2);
  
        const findFriendIndex = userFriend.friends.findIndex(item => item.discordUserId === user.discordUserId);
        userFriend.friends[findFriendIndex].intimacyPoints -= shopChosen.intimacyPrice;
        userFriend.tickets.silver -= Math.floor(shopChosen.silverTicket / 2);
  
        await UserService.updateUser(user);
        await UserService.updateUser(userFriend);
        await FriendService.updateIntimacyPoints(user.discordUserId, userFriend.discordUserId, user.friends[findFriendIndexUser].intimacyPoints);
        
        const userEmbed = createShopMessage(
          shopActionType.sendResultPurchaseIntimacyShop, 
          { 
            treasureName: shopChosen.treasureBoxInfo.name,
            username: user.discordUserId,
            friendUserName: userFriend.discordUserId,
            silver: silverTicketReceived,
            gold: goldenTicketReceived,
            point: user.friends[findFriendIndexUser].intimacyPoints,
            gifts: giftReceived,
            roleData,
            userSpecialItem: (userCanReceived.discordUserId === user.discordUserId) ? specialItemReceived : null,
            friendSpecialItem: (userCanReceived.discordUserId === userFriend.discordUserId) ? specialItemReceived : null
          }
        );
  
        await reply.edit({
          embeds: [userEmbed],
          components: [beforeSelectRow]
        });

        const logChannel = interaction.guild?.channels.cache.get(process.env.LOG_CHANNEL || '');
  
        if (logChannel?.type === ChannelType.GuildText) {
          await logChannel.send(`[Purchase] ${user.username} và ${userFriend.username} đã mua x1 ${shopChosen.treasureBoxInfo.emoji} ${shopChosen.treasureBoxInfo.name} bằng ${shopChosen.intimacyPrice}${emoji.imPoint} và ${shopChosen.silverTicket}${emoji.silverTicket}.`);
        }
      } catch (error) {
        console.log(error);
      }
    })
  } catch (error) {
    console.log(error);
  }
}

const progressGiftPurchase = async (interaction, quantity, user, shopReply, type, shopChosen) => {
  try {
    const value = purchaseQuantity[quantity];
    const priceUsing = type === currency.silver ? shopChosen.priceSilver : shopChosen.priceGold;
    const userPriceUsing = type === currency.silver ? user.tickets.silver : user.tickets.gold;
    
    let total = value * priceUsing;
    if (type === currency.silver) {
      total = Math.floor(total + ((total * 5) / 100));
    }
  
    if (userPriceUsing < total) {
      await shopReply.edit({
        embeds: [createNormalMessage(messages.insufficientBalance(
          shopChosen.giftInfo.giftEmoji, 
          value, 
          shopChosen.giftInfo.name, 
          total,
          type === currency.silver ? '<:leu_ticket:1168509616938815650>' : '<:leu_ticket_vang:1169279388370604062>',
          type
        ))]
      })
      return;
    }
  
    if (type === currency.silver) {
      user.tickets.silver -= total;
    } else {
      user.tickets.gold -= total;
    }
  
    const itemToAdd = {
      _id: shopChosen.giftInfo._id,
      name: shopChosen.giftInfo.name,
      description: shopChosen.giftInfo.description,
      type: shopChosen.giftInfo.type,
      intimacyPoints: shopChosen.giftInfo.intimacyPoints,
      giftEmoji: shopChosen.giftInfo.giftEmoji,
      quantity: value
    } 
  
    if (user.itemBag.length === 0) {
      user.itemBag.push(itemToAdd);
    } else {
      const itemExistOnBag = user.itemBag.findIndex(item => item._id.equals(shopChosen.giftInfo._id));
    
      if (itemExistOnBag === -1) {
        user.itemBag.push(itemToAdd);
      } else {
        user.itemBag[itemExistOnBag].quantity += value;
      }
    }
  
  
    const updatedBalanceAndItem = await UserService.updateUser(user);
    if (!updatedBalanceAndItem) {
      await shopReply.edit({
        embeds: [createNormalMessage(messages.errorPurchase)]
      });
      return;
    }
    await shopReply.edit({
      embeds: [createShopMessage(shopActionType.purchaseSuccess, 
        {
          giftEmoji: shopChosen.giftInfo.giftEmoji,
          name: shopChosen.giftInfo.name,
          price: priceUsing,
          type,
          quantity: value,
          total,
          silver: updatedBalanceAndItem.tickets.silver,
          gold: updatedBalanceAndItem.tickets.gold
        }
      )],
      components: []
    });
  
    const logChannel = interaction.guild?.channels.cache.get(process.env.LOG_CHANNEL || '');
  
    if (logChannel?.type === ChannelType.GuildText) {
      await logChannel.send(`[Purchase] ${user.username} đã mua x${value} ${shopChosen.giftInfo.giftEmoji} ${shopChosen.giftInfo.name} bằng ${total}${type === currency.silver ? emoji.silverTicket : emoji.goldenTicket}.`);
    }
  } catch (error) {
    console.log(error);    
  }
}

const progressRolePurchase = async (interaction, user, shopReply, type, shopChosen) => {
  try {
    const priceUsing = type === 'buyRoleSilver' ? shopChosen.priceSilver : shopChosen.priceGold;
    const userPriceUsing = type === 'buyRoleSilver' ? user.tickets.silver : user.tickets.gold;
  
    let total = priceUsing;
    if (type === 'buyRoleSilver') {
      total = Math.floor(total + ((total * 5) / 100));
    }
    const bag = user.itemBag;
    const findIndex = bag.findIndex(item => item._id.equals(shopChosen.roleInfo._id));
    if(findIndex !== -1) {
      await shopReply.edit({
        embeds: [createNormalMessage(messages.existRoleOnBag)],
        components: []
      })
      return;
    }
  
    if (userPriceUsing < total) {
      await shopReply.edit({
        embeds: [createNormalMessage(messages.insufficientBalanceRole(
          shopChosen.roleInfo.roleId, 
          total,
          type === 'buyRoleSilver' ? '<:leu_ticket:1168509616938815650>' : '<:leu_ticket_vang:1169279388370604062>',
          type
        ))]
      })
      return;
    }
    if (type === 'buyRoleSilver') {
      user.tickets.silver -= total;
    } else {
      user.tickets.gold -= total;
    }
    const itemToAdd = {
      _id: shopChosen.roleInfo._id,
      name: shopChosen.roleInfo.name,
      description: shopChosen.roleInfo.description,
      type: BagItemType.ROLE,
      roleId: shopChosen.roleInfo.roleId,
      typeBuff: shopChosen.roleInfo.typeBuff,
      valueBuff: shopChosen.roleInfo.valueBuff,
      quantity: 1
    };
    user.itemBag.push(itemToAdd);
    
    const member = interaction.guild.members.cache.get(interaction.user.id);
    const role = interaction.guild.roles.cache.get(shopChosen.roleInfo.roleId);
  
    if (role) {
      await member.roles.add(role);
    }
  
    const updatedBalanceAndItem = await UserService.updateUser(user);
    if (!updatedBalanceAndItem) {
      await shopReply.edit({
        embeds: [createNormalMessage(messages.errorPurchase)]
      });
      return;
    }
    await shopReply.edit({
      embeds: [createShopMessage(shopActionType.purchaseSuccess, 
        {
          giftEmoji: '',
          name: `<@&${shopChosen.roleInfo.roleId}>`,
          price: priceUsing,
          type,
          quantity: 1,
          total,
          silver: updatedBalanceAndItem.tickets.silver,
          gold: updatedBalanceAndItem.tickets.gold
        }
      )],
      components: []
    });
    const logChannel = interaction.guild?.channels.cache.get(process.env.LOG_CHANNEL || '');
  
    if (logChannel?.type === ChannelType.GuildText) {
      await logChannel.send(`[Purchase] ${user.username} đã mua role ${shopChosen.roleInfo.roleId} bằng ${total}${type === 'buyRoleSilver' ? emoji.silverTicket : emoji.goldenTicket}.`);
    }
  } catch (error) {
    console.log(error);    
  }
}

const progressQuestItemPurchase = async (interaction, user, shopReply, type, shopChosen) => {
  try {
    const priceUsing = type === 'buyQuestItemSilver' ? shopChosen.priceSilver : shopChosen.priceGold;
    const userPriceUsing = type === 'buyQuestItemSilver' ? user.tickets.silver : user.tickets.gold;
  
    let total = priceUsing;
    if (type === 'buyQuestItemSilver') {
      total = Math.floor(total + ((total * 5) / 100));
    }
   
    if (userPriceUsing < total) {
      await shopReply.edit({
        embeds: [createNormalMessage(messages.insufficientBalance(
          shopChosen.questItem.giftEmoji, 
          1,
          shopChosen.questItem.name,
          total,
          type === 'buyQuestItemSilver' ? '<:leu_ticket:1168509616938815650>' : '<:leu_ticket_vang:1169279388370604062>',
          type === 'buyQuestItemSilver' ? 'silver' : 'gold'
        ))]
      })
      return;
    }
  
    if (type === 'buyQuestItemSilver') {
      user.tickets.silver -= total;
    } else {
      user.tickets.gold -= total;
    }
  
    const itemToAdd = {
      _id: shopChosen.questItem._id,
      name: shopChosen.questItem.name,
      description: shopChosen.questItem.description,
      type: shopChosen.questItem.type,
      intimacyPoints: shopChosen.questItem.intimacyPoints,
      giftEmoji: shopChosen.questItem.emoji,
      quantity: 1,
      valueBuff: shopChosen.questItem.valueBuff ? shopChosen.questItem.valueBuff : ''
    } 
  
    if (user.itemBag.length === 0) {
      user.itemBag.push(itemToAdd);
    } else {
      const itemExistOnBag = user.itemBag.findIndex(item => item._id.equals(shopChosen.questItem._id));
    
      if (itemExistOnBag === -1) {
        user.itemBag.push(itemToAdd);
      } else {
        user.itemBag[itemExistOnBag].quantity += 1;
      }
    }
   
  
    const updatedBalanceAndItem = await UserService.updateUser(user);
    if (!updatedBalanceAndItem) {
      await shopReply.edit({
        embeds: [createNormalMessage(messages.errorPurchase)]
      });
      return;
    }
    await shopReply.edit({
      embeds: [createShopMessage(shopActionType.purchaseSuccess, 
        {
          giftEmoji: shopChosen.questItem.emoji,
          name: shopChosen.questItem.name,
          price: priceUsing,
          type,
          quantity: 1,
          total,
          silver: updatedBalanceAndItem.tickets.silver,
          gold: updatedBalanceAndItem.tickets.gold
        }
      )],
      components: []
    });
  
    const logChannel = interaction.guild?.channels.cache.get(process.env.LOG_CHANNEL || '');
  
    if (logChannel?.type === ChannelType.GuildText) {
      await logChannel.send(`[Purchase] ${user.username} đã mua ${shopChosen.questItem.emoji}${shopChosen.questItem.name} bằng ${total}${type === 'buyQuestItemSilver' ? emoji.silverTicket : emoji.goldenTicket}.`);
    }
  } catch (error) {
    console.log(error);
  }
}

const reply = async (interaction) => {
  try {
    const userId = interaction.user.id;
    const user = await UserService.getUserById(userId);
    if (!user || !user.discordUserId) {
      await interaction.followUp({ embeds: [createNormalMessage(messages.unreadyRegisterBot)] });
      return;
    }
    const gifts = await ShopService.getGiftShop();
    const roles = await ShopService.getRoleShop();
    const questItem = await ShopService.getQuestShop();
    const intimacyItem = await ShopService.getIntimacyShop();
  
    const select = new StringSelectMenuBuilder()
      .setCustomId('shopType')
      .setPlaceholder('Chọn loại cửa hàng')
      .addOptions(
        new StringSelectMenuOptionBuilder()
          .setLabel('Cửa hàng quà tặng')
          .setDescription('Bán các món quà tặng bạn bè')
          .setValue('giftsShop')
      )
      .addOptions(
        new StringSelectMenuOptionBuilder()
          .setLabel('Cửa hàng role')
          .setDescription('Bán các loại role')
          .setValue('rolesShop')
      ).addOptions(
        new StringSelectMenuOptionBuilder()
          .setLabel('Cửa hàng nhiệm vụ')
          .setDescription('Bán các vật phẩm làm nhiệm vụ và vé làm mới nhiệm vụ')
          .setValue('questShop')
      ).addOptions(
        new StringSelectMenuOptionBuilder()
          .setLabel('Cửa hàng điểm thân mật')
          .setDescription('Bán các loại role, rương bằng điểm thân mật')
          .setValue('intimacyPointsShop')
      );
  
    const rowSelect = new ActionRowBuilder()
      .addComponents(select);
  
    const shopReply = await interaction.followUp({
      embeds: [createShopMessage(shopActionType.getShop, user.tickets)],
      components: [rowSelect]
    });
  
    const selectCollector = shopReply.createMessageComponentCollector({
      componentType: ComponentType.StringSelect,
      filter: (i) => i.user.id === interaction.user.id && i.customId === 'shopType',
      time: 300000
    });
  
    selectCollector.on('collect', async (interaction) => {
      try {
        await interaction.deferUpdate();
        const [value] = interaction.values;
        if (value === 'giftsShop') {
          giftShop(interaction, shopReply, gifts, select, user);
          return;
        } 
        if (value === 'rolesShop') {
          roleShop(interaction, shopReply, roles, select, user);
          return;
        }
        if (value === 'intimacyPointsShop') {
          chooseFriend(interaction, shopReply, intimacyItem, select, user);
          return;
        }
  
        questShop(interaction, shopReply, questItem, select, user)
        
      } catch (error) {
        console.log(error);
      }
    });
  
    const btnCollection = shopReply.createMessageComponentCollector({
      componentType: ComponentType.Button,
      filter: (i) => 
          i.user.id === interaction.user.id && (
            i.customId === 'buyOne:silver' || i.customId === 'buyFive:silver' ||
            i.customId === 'buyTen:silver' || i.customId === 'buyFifty:silver' || 
            i.customId === 'buyOne:gold' || i.customId === 'buyFive:gold' ||
            i.customId === 'buyTen:gold' || i.customId === 'buyFifty:gold' ||
            i.customId === 'buyRoleSilver' || i.customId === 'buyRoleGold' ||
            i.customId === 'buyQuestItemSilver' || i.customId === 'buyQuestItemGold'
          ),
          time: 300000
    });
  
    btnCollection.on('collect', async (interaction) => {
      try {
        await interaction.deferUpdate();
        const customId = interaction.customId;
        const [quantity, type] = customId.split(':');
        if(type) {
          progressGiftPurchase(interaction, quantity, user, shopReply, type, shopChosen);
          return;
        }
        if (quantity === 'buyQuestItemSilver' || quantity === 'buyQuestItemGold') {
          progressQuestItemPurchase(interaction, user, shopReply, quantity, shopChosen);
          return;
        }
        progressRolePurchase(interaction, user, shopReply, quantity, shopChosen);
      } catch (error) {
        console.log(error);      
      }
    })
  } catch (error) {
    console.log(error);
  }
}

const shop = {
  name: 'leushop',
  execute: async (interaction) => {
    try {
      if (!interaction) {
        return;
      }
      await interaction.deferReply();
      reply(interaction);
    } catch (error) {
      console.log(error, '[shop]');      
    }
  }
}

const handleRoleDescription = (buff, valueBuff) => {
  return `nhận thêm ${ buff === RewardEnum.SILVER_TICKET ? `${valueBuff}% vé xanh khi điểm danh hằng ngày` : `${valueBuff} số vé vàng khi điểm danh hằng ngày`}`
}

const handleGiftDescription = (name, intimacyPoints) => {
  return `Tặng ${name} sẽ nhận được ${intimacyPoints} điểm thân thiết.`
}

const handleQuestDescription = (name, isResetTicket) => {
  return `${name} sử dụng để ${isResetTicket ? `làm mới nhiệm vụ ngày.`:`trả nhiệm vụ.`}`;
}

const addRoleShop = {
  name: 'admin-add-role-shop',
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
      const role = interaction.options.getRole('role');
      const typeBuff = interaction.options.getString('buff');
      const valueBuff = interaction.options.getString('value');
      const priceSilver = interaction.options.getNumber('price_silver');
      const priceGold = interaction.options.getNumber('price_gold');
      const newRole = await RoleService.addRole({
        name: role.name,
        roleId: role.id,
        description: handleRoleDescription(typeBuff, valueBuff),
        typeBuff,
        valueBuff,
      });
      const body = {
        priceSilver,
        priceGold,
        roleInfo: newRole
      }
      const res = await ShopService.addRoleToShop(body);
      if (!res) {
        await interaction.followUp({
          embeds: [createNormalMessage(messages.addRoleToShopError)]
        })
        return;
      }
      await interaction.followUp({
        embeds: [createNormalMessage(
          messages.addRoleToShopSuccess(role.id, handleRoleDescription(typeBuff, valueBuff), priceSilver, priceGold))]
      })
    } catch (error) {
      console.log(error, '[admin-add-role-shop]');
    }
  }
}

const addGiftShop = {
  name: 'admin-add-gift-shop',
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
      const giftEmoji = interaction.options.getString('gift');
      const name = interaction.options.getString('name');
      const intimacyPoints = interaction.options.getNumber('value');
      const priceSilver = interaction.options.getNumber('price_silver');
      const priceGold = interaction.options.getNumber('price_gold');
      const newGift = await GiftService.addGift({
        name,
        type: BagItemType.GIFT,
        intimacyPoints,
        giftEmoji,
        description: handleGiftDescription(name, intimacyPoints)
      });

      const body = {
        priceSilver,
        priceGold,
        giftInfo: newGift
      }

      const res = await ShopService.addGiftToShop(body);
      if (!res) {
        await interaction.followUp({
          embeds: [createNormalMessage(messages.addGiftToShopError)]
        })
        return;
      }
      await interaction.followUp({
        embeds: [createNormalMessage(
          messages.addGiftToShopSuccess(giftEmoji, intimacyPoints, priceSilver, priceGold))]
      })
    } catch (error) {
      console.log(error, '[admin-add-gift-shop]');
    }
  }
}

const addQuestShop = {
  name: 'admin-add-quest-shop',
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
      const emoji = interaction.options.getString('item');
      const name = interaction.options.getString('name');
      const priceSilver = interaction.options.getNumber('price_silver');
      const priceGold = interaction.options.getNumber('price_gold');
      const isResetTicket = interaction.options.getBoolean('reset_ticket');
      const questItem = await SpecialItemService.addItem({
        name,
        description: handleQuestDescription(name, isResetTicket),
        emoji,
        type: isResetTicket ? specialItemType.RESET_QUEST : null,
      })
      const body = {
        priceSilver,
        priceGold,
        questItem
      }
      const res = await ShopService.addItemToQuestShop(body);
      if (!res) {
        await interaction.followUp({
          embeds: [createNormalMessage(messages.addQuestItemToShopError)]
        })
        return;
      }
      await interaction.followUp({
        embeds: [createNormalMessage(
          messages.addQuestItemToShopSuccess(emoji, priceSilver, priceGold))]
      })
    } catch (error) {
      console.log(error, '[admin-add-quest-shop]');
    }
  }
}

const addRoleIntimacyShop = {
  name: 'admin-add-role-intimacy-shop',
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
      const role = interaction.options.getRole('role');
      const typeBuff = interaction.options.getString('buff');
      const valueBuff = interaction.options.getString('value');
      const intimacyPrice = interaction.options.getNumber('point');
      const silverTicket = interaction.options.getNumber('silver_price');
      const newRole = await RoleService.addRole({
        name: role.name,
        roleId: role.id,
        description: handleRoleDescription(typeBuff, valueBuff),
        typeBuff,
        valueBuff,
      });
      const body = {
        type: intimacyShopType.role,
        intimacyPrice,
        silverTicket,
        roleInfo: newRole
      }
      const res = await ShopService.addIntimacyShop(body);
      if (!res) {
        await interaction.followUp({
          embeds: [createNormalMessage(messages.addRoleToShopError)]
        })
        return;
      }
      await interaction.followUp({
        embeds: [createNormalMessage(
          messages.addRoleToIntimacyShopSuccess(role.id, handleRoleDescription(typeBuff, valueBuff), intimacyPrice))]
      })
    } catch (error) {
      console.log(error, '[admin-add-role-intimacy-shop]');
    }
  }
}

const removeGiftItem = async (interaction, reply, gifts, beforeSelect) => {
  try {
    const select = new StringSelectMenuBuilder()
        .setCustomId('giftRmItemChoose')
        .setPlaceholder('Chọn vật phẩm cần xóa')

    for (const item of gifts) {
      select.addOptions(
        new StringSelectMenuOptionBuilder()
          .setLabel(item.giftInfo.name)
          .setDescription(item.giftInfo.description)
          .setValue(item.id + '')
          .setEmoji(handleEmoji(item.giftInfo.giftEmoji))
      );
    }

    const row = new ActionRowBuilder().addComponents([select]);
    const rowBefore = new ActionRowBuilder().addComponents([beforeSelect]);
       
    await reply.edit({
      embeds: [createShopMessage(shopActionType.removeGift, { gifts })],
      components: [row, rowBefore]
    })
  } catch (error) {
    console.log(error);
  }
}

const removeRoleItem = async (interaction, reply, roles, beforeSelect) => {
  try {
    const select = new StringSelectMenuBuilder()
        .setCustomId('roleRmItemChoose')
        .setPlaceholder('Chọn role cần xóa')

    for (const item of roles) {
      select.addOptions(
        new StringSelectMenuOptionBuilder()
          .setLabel(item.roleInfo.name)
          .setDescription(item.roleInfo.description)
          .setValue(item.id + '')
      );
    }

    const row = new ActionRowBuilder().addComponents([select]);
    const rowBefore = new ActionRowBuilder().addComponents([beforeSelect]);
       
    await reply.edit({
      embeds: [createShopMessage(shopActionType.removeRole, { roles })],
      components: [row, rowBefore]
    })
  } catch (error) {
    console.log(error);
  }
}

const removeQuestItem = async (interaction, reply, quests, beforeSelect) => {
  try {
    const select = new StringSelectMenuBuilder()
        .setCustomId('questRmItemChoose')
        .setPlaceholder('Chọn item quest cần xóa')

    for (const item of quests) {
      select.addOptions(
        new StringSelectMenuOptionBuilder()
          .setLabel(item.questItem.name)
          .setDescription(item.questItem.description)
          .setValue(item.id + '')
          .setEmoji(handleEmoji(item.questItem.emoji))
      );
    }

    const row = new ActionRowBuilder().addComponents([select]);
    const rowBefore = new ActionRowBuilder().addComponents([beforeSelect]);
       
    await reply.edit({
      embeds: [createShopMessage(shopActionType.removeQuest, { quests })],
      components: [row, rowBefore]
    })
  } catch (error) {
    console.log(error);
  }
}

const removeItemShop = {
  name: 'admin-remove-item-shop',
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
      const select = new StringSelectMenuBuilder()
        .setCustomId('rmItemChoose')
        .setPlaceholder('Chọn shop cần xóa vật phẩm')
        .addOptions(
          new StringSelectMenuOptionBuilder()
            .setLabel('Shop quà')
            .setDescription('Shop quà')
            .setValue('giftShop')
        )
        .addOptions(
          new StringSelectMenuOptionBuilder()
            .setLabel('Shop role')
            .setDescription('Shop role')
            .setValue('roleShop')
        )
        .addOptions(
          new StringSelectMenuOptionBuilder()
            .setLabel('Shop quest')
            .setDescription('Shop quest')
            .setValue('questShop')
        );
      
        const row = new ActionRowBuilder().addComponents(select);

        const reply = await interaction.followUp({
          embeds: [createNormalMessage('Xóa vật phẩm trong shop')],
          components: [row]
        });

        const collection = await reply.createMessageComponentCollector({
          componentType: ComponentType.StringSelect,
          filter: (i) => i.user.id === interaction.user.id && i.customId === 'rmItemChoose',
          time: 300000
        })

        collection.on('collect', async (interaction) => {
          try {
            await interaction.deferUpdate();
            const [value] = interaction.values;

            if (value === 'giftShop') {
              const gifts = await ShopService.getGiftShop();
              removeGiftItem(interaction, reply, gifts, select);
              return;
            }
            if (value === 'roleShop') {
              const roles = await ShopService.getRoleShop();
              removeRoleItem(interaction, reply, roles, select);
              return;
            }
            const quests = await ShopService.getQuestShop();
            removeQuestItem(interaction, reply, quests, select);
          } catch (error) {
            
          }
        })
        
        const giftShopCollection = await reply.createMessageComponentCollector({
          componentType: ComponentType.StringSelect,
          filter: (i) => i.user.id === interaction.user.id && i.customId === 'giftRmItemChoose',
          time: 300000
        })

        giftShopCollection.on('collect', async (interaction) => {
          try {
            await interaction.deferUpdate();
            const [value] = interaction.values;
            const shopItems = await ShopService.getGiftShop();
            const giftRemove = shopItems.find(item => item.id === parseInt(value));
            if (!giftRemove || !giftRemove.id) {
              await reply.edit({
                embeds: [createNormalMessage(`Xóa vật phẩm không thành công.`)],
                components: [row]
              })
              return;
            };
            await ShopService.removeGiftShopItem(giftRemove.id);
            await reply.edit({
              embeds: [createNormalMessage(`Đã xóa ${giftRemove.giftInfo.giftEmoji} ${giftRemove.giftInfo.name}`)],
              components: [row]
            })
          } catch (error) {
            console.log(error);
          }
        });

        const roleShopCollection = await reply.createMessageComponentCollector({
          componentType: ComponentType.StringSelect,
          filter: (i) => i.user.id === interaction.user.id && i.customId === 'roleRmItemChoose',
          time: 300000
        })

        roleShopCollection.on('collect', async (interaction) => {
          try {
            await interaction.deferUpdate();
            const [value] = interaction.values;
            const shopItems = await ShopService.getRoleShop();
            const roleRemove = shopItems.find(item => item.id === parseInt(value));
            if (!roleRemove || !roleRemove.id) {
              await reply.edit({
                embeds: [createNormalMessage(`Xóa role không thành công.`)],
                components: [row]
              })
              return;
            };
            await ShopService.removeRoleShopItem(roleRemove.id);
            await reply.edit({
              embeds: [createNormalMessage(`Đã xóa ${roleRemove.roleInfo.name}`)],
              components: [row]
            })
          } catch (error) {
            console.log(error);
          }
        });

        const questShopCollection = await reply.createMessageComponentCollector({
          componentType: ComponentType.StringSelect,
          filter: (i) => i.user.id === interaction.user.id && i.customId === 'questRmItemChoose',
          time: 300000
        })

        questShopCollection.on('collect', async (interaction) => {
          try {
            await interaction.deferUpdate();
            const [value] = interaction.values;
            const shopItems = await ShopService.getAllShop();
            const roleRemove = shopItems.find(item => item.id === parseInt(value));
            if (!roleRemove || !roleRemove.id) {
              await reply.edit({
                embeds: [createNormalMessage(`Xóa vật phẩm nhiệm vụ không thành công.`)],
                components: [row]
              })
              return;
            };
            await ShopService.removeQuestShopItem(roleRemove.id);
            await reply.edit({
              embeds: [createNormalMessage(`Đã xóa ${roleRemove.questItem.emoji} ${roleRemove.questItem.name}`)],
              components: [row]
            })
          } catch (error) {
            console.log(error);
          }
        });
    } catch (error) {
      console.log(error);
    }
  }
}

// const addGiftToShop = 

module.exports = { shop, addRoleShop, addGiftShop, addQuestShop, removeItemShop, addRoleIntimacyShop };