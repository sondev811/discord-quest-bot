const { ButtonBuilder, ActionRowBuilder } = require("@discordjs/builders");
const connectDB = require("../DB/connection");
const { userActionType, errors } = require("../constants/general");
const messages = require("../constants/messages");
const { createNormalMessage } = require("../messages/normalMessage");
const { createUserMessage } = require("../messages/userMessage");
const { ShopItemEnum } = require("../models/shopItem.model");
const { UserService } = require("../services/user.service");
const { convertTimestamp, checkingLastAttended, checkStreak, findRoleBuff, randomBetweenTwoNumber, getCurrentTime } = require("../utils/index");
const { ButtonStyle, ComponentType } = require("discord.js");
const { RoleService } = require("../services/role.service");
const { RewardEnum } = require("../models/quest.model");
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
      const body = {
        username,
        discordUserId,
        displayName: interaction.member?.displayName,
        joinedServer: convertTimestamp(interaction.member?.joinedTimestamp),
        boostTime: convertTimestamp(interaction.member?.premiumSinceTimestamp),
        avatar: `https://cdn.discordapp.com/avatars/${discordUserId}/${avatar}.png`,
        friends: friends.sort((a, b) => a.intimacyPoints - b.intimacyPoints)
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

      const { roles, gifts } = filterItem(itemBag);

      const allRole = [...combine, ...roles];

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
      .setStyle(ButtonStyle.Primary);

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
        } catch (error) {
          console.log(error);
        }
      });
    } catch (error) {
      console.log(error, '[giveTickets]');
    }
  }
}

const filterItem = (items) => {
  const gifts = items.filter(item => item.type === ShopItemEnum.GIFT);
  const roles = items.filter(item => item.type === ShopItemEnum.ROLE);
  const questItems = items.filter(item => item.type === ShopItemEnum.QUEST);
  return { gifts, roles, questItems };
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
      const { gifts, roles, questItems } = filterItem(user.itemBag);
      await interaction.followUp({
        embeds: [createUserMessage(userActionType.bag, { gifts, roles, questItems, avatar, discordUserId: discordId, username: user.username })]
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
      const silver = [];
      const golden = [];
      const gift = [];
      const users = await UserService.getAllUser();
      users.forEach(user => {
        silver.push({
          discordUserId: user.discordUserId,
          quantity: user.tickets.silver
        });
        golden.push({
          discordUserId: user.discordUserId,
          quantity: user.tickets.gold
        });
        gift.push({
          discordUserId: user.discordUserId,
          quantity: user.giftsGiven.length
        });
      });

      const topSilver = silver.sort((a, b) => b.quantity - a.quantity);
      const topGolden = golden.sort((a, b) => b.quantity - a.quantity);
      const topGift = gift.sort((a, b) => b.quantity - a.quantity);

      await interaction.followUp({
        embeds: [createUserMessage(userActionType.bxh, { topSilver, topGolden, topGift })]
      });
    } catch (error) {
      console.log(error, '[bxh]');
    }
  }
}

module.exports = { info, tickets, daily, giveTicket, bag, top };