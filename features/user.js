const { ButtonBuilder, ActionRowBuilder, SelectMenuOptionBuilder, StringSelectMenuOptionBuilder, StringSelectMenuBuilder, ModalBuilder, TextInputBuilder } = require("@discordjs/builders");
const connectDB = require("../DB/connection");
const { userActionType, errors, emoji } = require("../constants/general");
const messages = require("../constants/messages");
const { createNormalMessage } = require("../messages/normalMessage");
const { createUserMessage } = require("../messages/userMessage");
const { UserService } = require("../services/user.service");
const { checkingLastAttended, checkStreak, findRoleBuff, randomBetweenTwoNumber, getCurrentTime, convertDateTime, handleEmoji } = require("../utils/index");
const { ButtonStyle, ComponentType, ChannelType, TextInputStyle } = require("discord.js");
const { RoleService } = require("../services/role.service");
const { RewardEnum } = require("../models/quest.model");
const { FriendService } = require("../services/friend.service");
const { BagItemType } = require("../models/user.model");
const { typeBuffSpecial } = require("../models/specialItem.model");
const { GiftService } = require("../services/gift.service");
const { SpecialItemService } = require("../services/specialItem.service");
connectDB();
process.env.TZ = 'Asia/Bangkok';

const info = {
  name: 'leuinfo',
  execute: async interaction => {
    try {
      if (!interaction) return;
      await interaction.deferReply();
      const discordId = interaction.member?.user?.id;
      const avatar = interaction.member?.user?.avatar;
      if (!discordId) {
        throw Error('Không tìm thấy discordId');
      };

      const user = await UserService.getUserById(discordId);
      if (!user || !user.discordUserId) {
        await interaction.followUp({ embeds: [createNormalMessage(messages.unreadyRegisterBot)] });
        return;
      }

      const { username, discordUserId, friends } = user;
      const modifierFriends = []
      for(const friend of friends) {
        const getRelationship = await FriendService.getRelationShip(discordUserId, friend.discordUserId);
        modifierFriends.push(
          {
            discordUserId: friend.discordUserId,
            relationship: getRelationship.relationship.name,
            intimacyPoints: getRelationship.intimacyPoints
          }
        );
      }
      const body = {
        username,
        discordUserId,
        displayName: interaction.member?.displayName,
        joinedServer: convertDateTime(interaction.member?.joinedTimestamp),
        boostTime: convertDateTime(interaction.member?.premiumSinceTimestamp),
        avatar: `https://cdn.discordapp.com/avatars/${discordUserId}/${avatar}.png`,
        friends: modifierFriends.sort((a, b) => a.intimacyPoints - b.intimacyPoints)
      }

      await interaction.followUp({
        embeds: [ createUserMessage(userActionType.getInfo, body) ]
      })
    } catch (error) {
      console.log(error, '[info]');
    }
  }
}

const tickets = {
  name: 'leutickets',
  execute: async interaction => {
    try {
      if (!interaction) return;
      await interaction.deferReply();
      const discordId = interaction.member?.user?.id;
      if (!discordId) {
        throw Error('Không tìm thấy discordId');
      };
      const user = await UserService.getUserById(discordId);
      if (!user || !user.discordUserId) {
        await interaction.followUp({ embeds: [createNormalMessage(messages.unreadyRegisterBot)] });
        return;
      }
      const { gold, silver } = user.tickets;
      await interaction.followUp({ embeds: [createNormalMessage(messages.checkTicket(interaction.member.displayName, silver, gold))] });
    } catch (error) {
      console.log(error, '[tickets]');
    }
  }
}

const daily = {
  name: 'leudaily',
  execute: async interaction => {
    try {
      if (!interaction) return;
      await interaction.deferReply();
      const maxReward = parseInt(process.env.MAX_REWARD_DAILY) || 50;
      const discordId = interaction.member?.user?.id;
      const avatar = interaction.member?.user?.avatar;

      if (!discordId) {
        throw Error('Không tìm thấy discordId');
      };
      const user = await UserService.getUserById(discordId);
      if (!user || !user.discordUserId) {
        await interaction.followUp({ embeds: [createNormalMessage(messages.unreadyRegisterBot)] });
        return;
      }

      const roleMember = interaction.member.roles.cache.map(role => ({
        roleId: role.id,
        name: role.name
      }));

      const allRoleBuff = await RoleService.getAllRole();
      const combine = findRoleBuff(allRoleBuff, roleMember);

      const { discordUserId, dailyAttendance, tickets, username, itemBag } = user;

      const isAttended = checkingLastAttended(user.dailyAttendance.lastLoginDate);
      if(isAttended) {
        await interaction.followUp({ embeds: [createNormalMessage(messages.attended)] });
        return;
      }

      const { specialItems } = filterItem(itemBag);

      const specialItemsBuff = specialItems.filter(item => item.typeBuff !== null);

      const allRole = [...combine, ...specialItemsBuff];

      const isStreak = checkStreak(user.dailyAttendance.lastLoginDate);
      let streak = 1;
      if (isStreak) {
        streak += dailyAttendance.streak;
      }
      let streakBonus = streak * maxReward;
      if (streak >= 5) {
        streakBonus = 5 * maxReward;
      }

      let totalSilver = maxReward + streakBonus;

      const newBonusRole = allRole.map(role => {
        let bonus = 0;
        if (role.typeBuff === RewardEnum.SILVER_TICKET) {
          bonus += Math.floor(((totalSilver * role.valueBuff) / 100));
        } else {
          const [min, max] = role.valueBuff.split('-');
          const goldReward = randomBetweenTwoNumber(min, max);
          bonus += goldReward;
        }
        return {
          roleId: role.roleId,
          typeBuff: role.typeBuff,
          valueBuff: role.valueBuff,
          name: role.name,
          emoji: role.giftEmoji,
          bonus
        }
      });

      let silverRoleBonus = 0;
      let goldRoleBonus = 0;

      newBonusRole.forEach(item => {
        if (item.typeBuff === RewardEnum.SILVER_TICKET) {
          silverRoleBonus += item.bonus;
        } else {
          goldRoleBonus += item.bonus;
        }
      });

      totalSilver += silverRoleBonus;

      const body = {
        discordUserId,
        dailyAttendance: {
          lastLoginDate: new Date(),
          streak
        },
        tickets: {
          ...tickets,
          silver: tickets.silver + totalSilver,
          gold: tickets.gold + goldRoleBonus
        }
      }

      const userUpdated = await UserService.updateUser(body);
      if (!userUpdated || 
        !userUpdated.discordUserId || 
        userUpdated.dailyAttendance.streak !== body.dailyAttendance.streak ||
        userUpdated.tickets.silver !== body.tickets.silver ||
        userUpdated.tickets.gold !== body.tickets.gold
      ) {
        await interaction.followUp({ embeds: [createNormalMessage(messages.attendedFailed(process.env.SUPPORT_CHANNEL, process.env.DEVELOPER))] });
        return;
      }
      await interaction.followUp({ 
        embeds: [
          createUserMessage(userActionType.attended, 
          { 
            streak,
            streakBonus, 
            totalSilver: totalSilver,
            totalGold: goldRoleBonus,
            username,
            discordUserId,
            avatar,
            roleBonus: newBonusRole
          })
      ]});
    } catch (error) {
      console.log(error, '[daily]');
    }
  }
}

const giveTicket = {
  name: 'leugive',
  execute: async interaction => {
    try {
      if (!interaction) return;
      await interaction.deferReply();
      const discordId = interaction.member?.user?.id;
      const avatar = interaction.member?.user?.avatar;
      if (!discordId) {
        throw Error('Không tìm thấy discordId');
      };
      const target = interaction.options.getUser('target');
      const amount = interaction.options.getNumber('amount')
      const amountAfterTax = Math.floor(amount + ((amount * 10) / 100));
      if (discordId === target.id) {
        await interaction.followUp({ embeds: [createNormalMessage(messages.preventGiveForMySelf)] });
        return;
      }
      const user = await UserService.getUserById(discordId);
      const userReceived = await UserService.getUserById(target.id);
      
      if (!user || !user.discordUserId) {
        await interaction.followUp({ embeds: [createNormalMessage(messages.unreadyRegisterBot)] });
        return;
      }
      if (!userReceived || !userReceived.discordUserId) {
        await interaction.followUp({ embeds: [createNormalMessage(messages.giveUnreadyRegister(target.username))] });
        return;
      }

      const totalTicketClaimDaily = userReceived.totalTicketClaimDaily;
      const levelClaimMax = userReceived.level.limitTicketDaily;

      if (amount > (levelClaimMax - totalTicketClaimDaily)) {
        await interaction.followUp({ embeds: [createNormalMessage(messages.receiptMaxDailyClaimed(target.id, userReceived.totalTicketClaimDaily, userReceived.level.limitTicketDaily))] });
        return;
      }

      const confirmButton = new ButtonBuilder()
      .setCustomId('confirmGiveTicket')
      .setLabel('Xác nhận chuyển')
      .setStyle(ButtonStyle.Success);

      const rejectButton = new ButtonBuilder()
      .setCustomId('rejectGiveTicket')
      .setLabel('Hủy')
      .setStyle(ButtonStyle.Danger);

      const row = new ActionRowBuilder().addComponents([confirmButton, rejectButton]);

      const reply = await interaction.followUp({
        embeds: [createNormalMessage(messages.confirmGiveTicket(userReceived.discordUserId, amount))],
        components: [row]
      })

      const btnCollection = reply.createMessageComponentCollector({
        componentType: ComponentType.Button,
        filter: (i) =>  i.user.id === interaction.user.id && (i.customId === 'confirmGiveTicket' || i.customId === 'rejectGiveTicket'),
        time: 300000
      });

      btnCollection.on('collect', async(interaction) => {
        try {
          const customId = interaction.customId;
          if (customId === 'rejectGiveTicket') {
            await reply.edit({ 
              embeds: [createNormalMessage(messages.rejectGiveTicket(userReceived.discordUserId, amount))],
              components: []
            });
            return;
          }
  
          if (amountAfterTax > user.tickets.silver) {
            await reply.edit({ 
              embeds: [createNormalMessage(messages.outOfTicket)],
              components: []
            });
            return;
          }
          user.tickets.silver = user.tickets.silver - amountAfterTax;
          userReceived.tickets.silver = Math.floor(userReceived.tickets.silver + amount);
          const userUpdated = await UserService.updateUser(user);
          const userReceivedUpdated = await UserService.updateUser(userReceived);
          if (
            !userUpdated || 
            !userReceivedUpdated || 
            userReceivedUpdated.tickets.silver !== userReceived.tickets.silver ||
            userUpdated.tickets.silver !== user.tickets.silver
          ) {
            await reply.edit({ 
              embeds: [createNormalMessage(messages.giveTicketFailed(process.env.SUPPORT_CHANNEL, process.env.DEVELOPER))],
              components: []
            });
            return;
          }
          await reply.edit({ 
            embeds: [createUserMessage(userActionType.giveTicketSuccess, {
              sender: user.discordUserId,
              amount,
              receipt: userReceived.discordUserId,
              tax: amountAfterTax - amount,
              silverTicket: userUpdated.tickets.silver,
              avatar
            })],
            components: []
          });
          const logChannel = interaction.guild?.channels.cache.get(process.env.LOG_CHANNEL || '');

          if (logChannel?.type === ChannelType.GuildText) {
            await logChannel.send(`[Transfer] <@${user.discordUserId}> chuyển <@${userReceived.discordUserId}> ${amount}${emoji.silverTicket} + tax: ${amountAfterTax - amount}${emoji.silverTicket}. <@${user.discordUserId}> còn ${userUpdated.tickets.silver}${emoji.silverTicket}. <@${userReceived.discordUserId}> tăng ${userReceivedUpdated.tickets.silver}${emoji.silverTicket}`);
          }
        } catch (error) {
          console.log(error, '[giveTickets confirm]');
        }
      });
    } catch (error) {
      console.log(error, '[giveTickets]');
    }
  }
}

const filterItem = (items) => {
  const gifts = items.filter(item => item.type === BagItemType.GIFT);
  const roles = items.filter(item => item.type === BagItemType.ROLE);
  const questItems = items.filter(item => item.type === BagItemType.RESET_QUEST);
  const specialItems = items.filter(item => (
    item.type === BagItemType.FRIEND_RING || 
    item.type === BagItemType.RING_PIECE || 
    item.type === BagItemType.WEEDING_RING
  ));
  return { gifts, roles, questItems, specialItems };
}

const bag = {
  name: 'leubag',
  execute: async interaction => {
    try {
      if (!interaction) return;
      await interaction.deferReply();
      const discordId = interaction.member?.user?.id;
      const avatar = interaction.member?.user?.avatar;
      if (!discordId) {
        throw Error('Không tìm thấy discordId');
      };

      const user = await UserService.getUserById(discordId);
      if (!user || !user.discordUserId) {
        await interaction.followUp({ embeds: [createNormalMessage(messages.unreadyRegisterBot)] });
        return;
      }
      const { gifts, roles, questItems, specialItems } = filterItem(user.itemBag);
      await interaction.followUp({
        embeds: [createUserMessage(userActionType.bag, { gifts, roles, questItems, specialItems, avatar, discordUserId: discordId, username: user.username })]
      });
    } catch (error) {
      console.log(error, '[bag]');
    }
  }
}

const top = {
  name: 'leubxh',
  execute: async interaction => {
    try {
      if (!interaction) return;
      await interaction.deferReply();
      const discordId = interaction.member?.user?.id;
      if (!discordId) {
        throw Error('Không tìm thấy discordId');
      };

      const user = await UserService.getUserById(discordId);
      if (!user || !user.discordUserId) {
        await interaction.followUp({ embeds: [createNormalMessage(messages.unreadyRegisterBot)] });
        return;
      }
      const friendsList = await FriendService.getAllFriends();
      const silver = [];
      const golden = [];
      const completeQuest = [];
      const farm = [];
      const users = await UserService.getAllUser();
      users.forEach(user => {
        silver.push({
          discordUserId: user.discordUserId,
          quantity: user.tickets.silver,
          type: RewardEnum.SILVER_TICKET
        });
        golden.push({
          discordUserId: user.discordUserId,
          quantity: user.tickets.gold,
          type: RewardEnum.GOLD_TICKET
        });
        completeQuest.push({
          discordUserId: user.discordUserId,
          quantity: user.totalQuestCompleted,
          type: 'completedQuest'
        })
        farm.push({
          discordUserId: user.discordUserId,
          quantity: user.farm.exp,
          type: 'farm'
        })
      });
      
      const topSilver = silver.sort((a, b) => b.quantity - a.quantity);
      const topGolden = golden.sort((a, b) => b.quantity - a.quantity);
      const topCompleteQuest = completeQuest.sort((a, b) => b.quantity - a.quantity);
      const topFriends = friendsList.sort((a, b) => b.intimacyPoints - a.intimacyPoints);
      const topFarm = farm.sort((a, b) => b.quantity - a.quantity);
      const select = new StringSelectMenuBuilder()
        .setCustomId('ranking')
        .setPlaceholder('Chọn vật bảng xếp hạng')
        .addOptions(
          new StringSelectMenuOptionBuilder()
            .setLabel('Bảng xếp hạng vé xanh')
            .setDescription('Top 20 người nhiều vé xanh nhất')
            .setValue('silverTicket')
            .setDefault(true)
        )
        .addOptions(
          new StringSelectMenuOptionBuilder()
            .setLabel('Bảng xếp hạng vé vàng')
            .setDescription('Top 20 người nhiều vé vàng nhất')
            .setValue('goldTicket')
        )
        .addOptions(
          new StringSelectMenuOptionBuilder()
            .setLabel('Bảng xếp hạng cặp đôi')
            .setDescription('Top 20 cặp đôi nhiều điểm thân thiết')
            .setValue('point')
        )
        .addOptions(
          new StringSelectMenuOptionBuilder()
            .setLabel('Bảng xếp hạng hoàn thành nhiệm vụ')
            .setDescription('Top 20 người chăm chỉ')
            .setValue('completeQuest')
        )
        .addOptions(
          new StringSelectMenuOptionBuilder()
            .setLabel('Bảng xếp hạng thần nông')
            .setDescription('Top 20 thần nông')
            .setValue('farm')
        );
      
      const row = new ActionRowBuilder().addComponents(select);
      
      const reply = await interaction.followUp({
        embeds: [createUserMessage(userActionType.bxh, { rankList: topSilver, isCouple: false, rankingType: 'vé xanh' })],
        components: [row]
      });
      const selectCollection = reply.createMessageComponentCollector({
        componentType: ComponentType.StringSelect,
        filter: (i) => i.user.id === interaction.user.id && i.customId === 'ranking',
        time: 300000
      });

      selectCollection.on('collect', async interaction => {
        try {
          await interaction.deferUpdate();
          const [value] = interaction.values;
          let selectedOption = 'silverTicket';
          let rankList = null;
          let isCouple = false;
          let rankingType = 'vé xanh';

          if (value === 'silverTicket') {
            rankList = topSilver;
          } else if (value === 'goldTicket') {
            selectedOption = 'goldTicket';
            rankList = topGolden;
            rankingType = 'vé vàng';
          } else if (value === 'completeQuest') {
            selectedOption = 'completeQuest';
            rankList = topCompleteQuest;
            rankingType = 'hoàn thành nhiệm vụ';
          } else if (value === 'farm') {
            selectedOption = 'farm';
            rankList = topFarm;
            rankingType = 'thần nông';
          } else {
            selectedOption = 'point';
            rankList = topFriends;
            rankingType = 'điểm thân thiết';
            isCouple = true;
          }

          const selectNew = new StringSelectMenuBuilder()
            .setCustomId('ranking')
            .setPlaceholder('Chọn vật bảng xếp hạng')
            .addOptions(
              new StringSelectMenuOptionBuilder()
                .setLabel('Bảng xếp hạng vé xanh')
                .setDescription('Top 20 người nhiều vé xanh nhất')
                .setValue('silverTicket')
                .setDefault(selectedOption === 'silverTicket')
            )
            .addOptions(
              new StringSelectMenuOptionBuilder()
                .setLabel('Bảng xếp hạng vé vàng')
                .setDescription('Top 20 người nhiều vé vàng nhất')
                .setValue('goldTicket')
                .setDefault(selectedOption === 'goldTicket')
            )
            .addOptions(
              new StringSelectMenuOptionBuilder()
                .setLabel('Bảng xếp hạng cặp đôi')
                .setDescription('Top 20 cặp đôi nhiều điểm thân thiết')
                .setValue('point')
                .setDefault(selectedOption === 'point')
            )
            .addOptions(
              new StringSelectMenuOptionBuilder()
                .setLabel('Bảng xếp hạng hoàn thành nhiệm vụ')
                .setDescription('Top 20 người chăm chỉ')
                .setValue('completeQuest')
                .setDefault(selectedOption === 'completeQuest')
            )
            .addOptions(
              new StringSelectMenuOptionBuilder()
                .setLabel('Bảng xếp hạng thần nông')
                .setDescription('Top 20 thần nông')
                .setValue('farm')
            );;

          const rowNew = new ActionRowBuilder().addComponents(selectNew);
          await reply.edit({
            embeds: [createUserMessage(userActionType.bxh, { rankList, isCouple, rankingType })],
            components: [rowNew]
          });
        } catch (error) {
          console.log(error, '[choose Bxh]');
        }
      })
    } catch (error) {
      console.log(error, '[bxh]');
    }
  }
}

const buffTicket = {
  name: 'admin-buff-ticket',
  execute: async interaction => {
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

      const target = interaction.options.getUser('target');
      const amount = interaction.options.getNumber('amount');
      
      const userReceived = await UserService.getUserById(target.id);
      
      if (!userReceived || !userReceived.discordUserId) {
        await interaction.followUp({ embeds: [createNormalMessage(messages.giveUnreadyRegister(target.username))] });
        return;
      }

      userReceived.tickets.silver = Math.floor(userReceived.tickets.silver + amount);

      await UserService.updateUser(userReceived);

      await interaction.followUp({ 
        embeds: [createNormalMessage(`Đã chuyển ${amount}${emoji.silverTicket} cho ${target}`)]
      });
    } catch (error) {
      console.log(error, '[giveTickets]');
    }
  }
}

const buffItem = {
  name: 'admin-buff-item',
  execute: async interaction => {
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
      
      const target = interaction.options.getUser('target');
      
      const userReceived = await UserService.getUserById(target.id);
      
      if (!userReceived || !userReceived.discordUserId) {
        await interaction.followUp({ embeds: [createNormalMessage(messages.giveUnreadyRegister(target.username))] });
        return;
      }

      const gifts = await GiftService.getAllGift();
      const specialItems = await SpecialItemService.getAllItem();

      const items = [...gifts, ...specialItems];

      const select = new StringSelectMenuBuilder().setCustomId('chooseItem').setPlaceholder('Chọn quà muốn chuyển')
      for (const item of items) {
        select.addOptions(
          new StringSelectMenuOptionBuilder()
            .setLabel(item.name)
            .setDescription(item.description)
            .setValue(String(item._id))
            .setEmoji(handleEmoji(item.giftEmoji || item.emoji))
        );
      }
      const row = new ActionRowBuilder().addComponents(select);

      const reply = await interaction.followUp({
        embeds: [createNormalMessage(`Chọn vật phẩm muốn buff cho ${target}`)],
        components: [row]
      })

      const selectCollect = reply.createMessageComponentCollector({
        componentType: ComponentType.StringSelect,
        filter: (i) => i.user.id === interaction.user.id && i.customId === 'chooseItem',
        time: 300000
      });

      selectCollect.on('collect', async interaction => {
        try {
          const [value] = interaction.values;

          const item = items.find(item => item._id.equals(value));

          const modal = new ModalBuilder()
          .setCustomId('addQuantity')
          .setTitle(`Nhập số lượng ${item.name}`);
  
          const input = new TextInputBuilder()
          .setCustomId(`quantity`)
          .setLabel(`Số lượng`)
          .setPlaceholder("Nhập số lượng")
          .setMaxLength(10)
          .setStyle(TextInputStyle.Short);
  
          const firstActionRow = new ActionRowBuilder().addComponents(input);
      
          modal.addComponents(firstActionRow);
          await interaction.showModal(modal);
          
          const submitted = await interaction.awaitModalSubmit({
            time: 60000,
            filter: i => i.user.id === interaction.user.id,
          });

          if (submitted) {
            try {
              await submitted.deferUpdate();
              const quantity = submitted.fields.getTextInputValue('quantity');
              const userBag = userReceived.itemBag;
              const existItem = userBag.findIndex(data => data._id.equals(item._id))
              if (existItem !== -1) {
                userBag[existItem].quantity += Number(quantity);
              } else {
                const itemToAdd = {
                  _id: item._id,
                  name: item.name,
                  description: item.description,
                  type: item.type,
                  intimacyPoints: item.intimacyPoints,
                  quantity: Number(quantity),
                  giftEmoji: item.giftEmoji || item.emoji,
                } 
                if (item.type === BagItemType.RING_PIECE) {
                  itemToAdd.specialValue = item.weedingPiece.value;
                }
                if (item.type === BagItemType.FRIEND_RING || item.type === BagItemType.WEEDING_RING) {
                  itemToAdd.typeBuff = item.buffInfo.typeBuff;
                  itemToAdd.valueBuff = item.buffInfo.valueBuff;
                }
                userBag.push(itemToAdd);
              }

              await UserService.updateUser(userReceived);
              await reply.edit({
                embeds: [createNormalMessage(`Đã chuyển x${quantity} ${item.giftEmoji || item.emoji} ${item.name} cho ${target}`)]
              })
              
            } catch (error) {
              console.log(error, '[quantity submit]');          
            }
          }
        } catch (error) {
          console.log(error, '[quantity choose]');          
        }
      })

      await UserService.updateUser(userReceived);

    } catch (error) {
      console.log(error, '[giveTickets]');
    }
  }
}

module.exports = { info, tickets, daily, giveTicket, bag, top, buffTicket, buffItem };