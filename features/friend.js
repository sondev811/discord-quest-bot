const { ButtonBuilder, ActionRowBuilder, SelectMenuBuilder, StringSelectMenuBuilder, StringSelectMenuOptionBuilder } = require("@discordjs/builders");
const { friendActionType } = require("../constants/general");
const messages = require("../constants/messages");
const { createFriendMessage } = require("../messages/friendMessage");
const { createNormalMessage } = require("../messages/normalMessage");
const { UserService } = require("../services/user.service");
const { ButtonStyle, ComponentType, Events } = require("discord.js");
const { FriendService } = require("../services/friend.service");
const { calcDate, convertTimestamp, handleEmoji } = require("../utils");
const { ShopItemEnum } = require("../models/shopItem.model");
const { ActionEnum } = require("../models/quest.model");

const addFriend = {
  name: 'leuthemban',
  execute: async (interaction) => {
    try {
      if (!interaction) return;
      await interaction.deferReply();
      const discordId = interaction.user.id;
      const target = interaction.options.getUser('target'); 
      const user = await UserService.getUserById(discordId);
      const userReceived = await UserService.getUserById(target.id);
     
      if (!user || !user.discordUserId) {
        await interaction.followUp({ embeds: [createNormalMessage(messages.unreadyRegisterBot)] });
        return;
      }
     
      if (discordId === target.id) {
        await interaction.followUp({ embeds: [createNormalMessage(messages.addFriendForMySelf)] });
        return;
      }

      if (!userReceived || !userReceived.discordUserId) {
        await interaction.followUp({ embeds: [createNormalMessage(messages.addFriendUnreadyRegister(target.id))] });
        return;
      }

      if (user.friends.length >= user.maxFriend) {
        await interaction.followUp({ embeds: [createNormalMessage(messages.friendFull(user.maxFriend))] });
        return;
      }

      if (userReceived.friends.length >= userReceived.maxFriend) {
        await interaction.followUp({ embeds: [createNormalMessage(messages.friendTargetFull(userReceived.discordUserId, userReceived.maxFriend))] });
        return;
      }

      const alreadyFriend = user.friends.findIndex(item => item.discordUserId === userReceived.discordUserId);
      
      if (alreadyFriend !== -1) {
        await interaction.followUp({ embeds: [createNormalMessage(messages.alreadyFriend(userReceived.discordUserId))] });
        return;
      }

      await interaction.followUp({ embeds: [createNormalMessage(messages.sentFriendRequest(target.id))] });

      const requestAddFriend = await interaction.guild?.members.fetch(target.id);
      const senderRequestAddFriend = await interaction.guild?.members.fetch(discordId);

      const acceptButton = new ButtonBuilder()
        .setCustomId('acceptAddFriend')
        .setLabel('Đồng ý')
        .setStyle(ButtonStyle.Success);

      const rejectButton = new ButtonBuilder()
        .setCustomId('rejectAddFriend')
        .setLabel('Không đồng ý')
        .setStyle(ButtonStyle.Danger);

      const row = new ActionRowBuilder().addComponents([acceptButton, rejectButton]);
        
      const requestAddFriendWait = await requestAddFriend?.send({
        embeds: [createFriendMessage(friendActionType.friendRequest, { username: user.username })],
        components: [row]
      });

      const requestAddCollect = requestAddFriendWait.createMessageComponentCollector({
        componentType: ComponentType.Button,
        filter: (i) => i.user.id === target.id && (i.customId === 'acceptAddFriend' || i.customId === 'rejectAddFriend'),
        time: 300000
      });

      requestAddCollect.on('collect', async interaction => {
        try {
          await interaction.deferUpdate();
          const customId = interaction.customId;
          if (customId === 'rejectAddFriend') {
            await requestAddFriendWait.edit({
              embeds: [createNormalMessage(messages.rejectAddFriend(user.username))],
              components: []
            });
            await senderRequestAddFriend.send({
              embeds: [createNormalMessage(messages.notifyRejectAddFriend(userReceived.username))]
            })
            return;
          }
          const body = {
            discordIdFirst: user.discordUserId,
            discordIdLast: userReceived.discordUserId,
          }
          const createRelationResult = await FriendService.createRelationship(body);
  
          const userFriend = {
            discordUserId: userReceived.discordUserId
          }
          const userReceivedFriend = {
            discordUserId: user.discordUserId
          }
          user.friends.push(userFriend);
          userReceived.friends.push(userReceivedFriend);
  
          await UserService.updateUser(user);
          await UserService.updateUser(userReceived);
  
          if (createRelationResult && 
            createRelationResult.discordIdFirst === user.discordUserId && 
            createRelationResult.discordIdLast === userReceived.discordUserId
          ) {
            await requestAddFriendWait.edit({
              embeds: [createNormalMessage(messages.acceptAddFriend(user.username))],
              components: []
            });
            await senderRequestAddFriend.send({
              embeds: [createNormalMessage(messages.notifyAcceptAddFriend(userReceived.username))]
            })
            return;
          }
  
          await requestAddFriendWait.edit({
            embeds: [createNormalMessage(messages.addFriendError)],
            components: []
          });
          await senderRequestAddFriend.send({
            embeds: [createNormalMessage(messages.addFriendError)]
          })
        } catch (error) {
          console.log(error);
        }
      })

    } catch (error) {
      console.log(error, '[leuthemban]');
    }
  }
}

const removeFriend = {
  name: 'leuxoaban',
  execute: async (interaction) => {
    try {
      if (!interaction) return;
      await interaction.deferReply();
      const discordId = interaction.user.id;
      const target = interaction.options.getUser('target'); 
      const user = await UserService.getUserById(discordId);
      const userReceived = await UserService.getUserById(target.id);

      if (!user || !user.discordUserId) {
        await interaction.followUp({ embeds: [createNormalMessage(messages.unreadyRegisterBot)] });
        return;
      }

      if (discordId === target.id) {
        await interaction.followUp({ embeds: [createNormalMessage(messages.removeFriendForMySelf)] });
        return;
      }


      if (!userReceived || !userReceived.discordUserId) {
        await interaction.followUp({ embeds: [createNormalMessage(messages.addFriendUnreadyRegister(target.id))] });
        return;
      }

      const alreadyFriend = user.friends.findIndex(item => item.discordUserId === userReceived.discordUserId);
      
      if (alreadyFriend === -1) {
        await interaction.followUp({ embeds: [createNormalMessage(messages.removeNotFriend(userReceived.discordUserId))] });
        return;
      }

      const removeFriendNotify = await interaction.guild?.members.fetch(target.id);

      const acceptButton = new ButtonBuilder()
        .setCustomId('acceptRemoveFriend')
        .setLabel('Đồng ý')
        .setStyle(ButtonStyle.Success);

      const row = new ActionRowBuilder().addComponents([acceptButton]);
        
      const reply = await interaction.followUp({ 
        embeds: [createNormalMessage(messages.confirmRemoveFriend(target.id))],
        components: [row]
      });

      const requestRemoveCollect = reply.createMessageComponentCollector({
        componentType: ComponentType.Button,
        filter: (i) => i.user.id === interaction.user.id && i.customId === 'acceptRemoveFriend',
        time: 300000
      });

      requestRemoveCollect.on('collect', async interaction => {
        try {
          await interaction.deferUpdate();
          await reply.edit({
            embeds: [createNormalMessage(messages.acceptRemoveFriend(target.id))],
            components: []
          });
  
          const newUserList = user.friends.filter(item => item.discordUserId !== userReceived.discordUserId);
          user.friends = newUserList;
          const newUserReceivedList = userReceived.friends.filter(item => item.discordUserId !== user.discordUserId);
          userReceived.friends = newUserReceivedList;
  
          await UserService.updateUser(user);
          await UserService.updateUser(userReceived);
  
          await FriendService.removeRelationship(user.discordUserId, userReceived.discordUserId);
          
          await reply.edit({
            embeds: [createNormalMessage(messages.acceptRemoveFriend(userReceived.discordUserId))],
            components: []
          });
  
          await removeFriendNotify?.send({
            embeds: [createNormalMessage(messages.notifyRemoveFriend(user.username))],
            components: []
          });
        } catch (error) {
          console.log(error);          
        }
      });
    } catch (error) {
      console.log(error, '[leuxoaban]');
    }
  }
}

const relationship = {
  name: 'leurela',
  execute: async interaction => {
    try {
      if (!interaction) return;
      await interaction.deferReply();
      const discordId = interaction.user.id;
      const user = await UserService.getUserById(discordId);

      if (!user || !user.discordUserId) {
        await interaction.followUp({ embeds: [createNormalMessage(messages.unreadyRegisterBot)] });
        return;
      }

      const target = interaction.options.getUser('target');

      if (!target) {
        const purchase = new ButtonBuilder()
        .setCustomId('purchaseFriendSlot')
        .setLabel('Mua thêm slot bạn bè')
        .setStyle(ButtonStyle.Success);

        const guide = new ButtonBuilder()
          .setCustomId('guide')
          .setLabel('Hướng dẫn')
          .setStyle(ButtonStyle.Success);

        const row = new ActionRowBuilder().addComponents([purchase, guide]);
        
        const reply = await interaction.followUp({
          embeds: [createFriendMessage(friendActionType.getAllRelationship, 
            { 
              friends: user.friends,
              username: user.username,
              gifts: user.giftsGiven,
              discordUserId: user.discordUserId,
              avatar: interaction.user.avatar,
              maxFriend: user.maxFriend
            }
          )],
          components: [row]
        })
        const requestAddCollect = reply.createMessageComponentCollector({
          componentType: ComponentType.Button,
          filter: (i) => i.user.id === interaction.user.id && (i.customId === 'purchaseFriendSlot' || i.customId === 'guide'),
          time: 300000
        });

        requestAddCollect.on('collect', async interaction => {
          try {
            await interaction.deferUpdate();
            const slotFriendPrice = 1500;
            const customId = interaction.customId;
            if (customId === 'purchaseFriendSlot') {
              if (user.tickets.silver < slotFriendPrice) {
                reply.edit({
                  embeds: [createNormalMessage(messages.insufficientBalanceFriend(slotFriendPrice))],
                  components: []
                });
                return
              }
              user.tickets.silver -= slotFriendPrice;
              user.maxFriend += 1;
              await UserService.updateUser(user);
              reply.edit({
                embeds: [createNormalMessage(messages.purchaseFriendSlotSuccess(user.maxFriend))],
                components: []
              });
              return;
            }
            reply.edit({
              embeds: [createFriendMessage(friendActionType.guide)],
              components: []
            });
          } catch (error) {
            console.log(error);
          }
        })
        
        return;
      }

      if (discordId === target.id) {
        await interaction.followUp({ embeds: [createNormalMessage(messages.checkFriendForMySelf)] });
        return;
      }

      const userReceived = await UserService.getUserById(target.id);

      if (!userReceived || !userReceived.discordUserId) {
        await interaction.followUp({ embeds: [createNormalMessage(messages.addFriendUnreadyRegister(target.id))] });
        return;
      }

      const isFriend = user.friends.findIndex(item => item.discordUserId === userReceived.discordUserId);
      
      if (isFriend === -1) {
        await interaction.followUp({ embeds: [createNormalMessage(messages.isNotFriend(userReceived.discordUserId))] });
        return;
      }

      await interaction.followUp({ embeds: [createFriendMessage(friendActionType.getRelationship,
        {
          username: user.username,
          targetUsername: userReceived.username,
          targetId: userReceived.discordUserId,
          intimacyPoints: user.friends[isFriend].intimacyPoints,
          discordUserId: user.discordUserId,
          avatar: interaction.user.avatar,
          dateConverted: calcDate(user.friends[isFriend].friendDate),
          date: convertTimestamp(user.friends[isFriend].friendDate)
        }  
      )] });
      
    } catch (error) {
      console.log(error, '[leurela]');
    }
  }
}

const gift = {
  name: 'leutangqua',
  execute: async interaction => {
    try {
      if (!interaction) return;
      await interaction.deferReply();
      const discordId = interaction.user.id;
      const user = await UserService.getUserById(discordId);

      if (!user || !user.discordUserId) {
        await interaction.followUp({ embeds: [createNormalMessage(messages.unreadyRegisterBot)] });
        return;
      }

      const target = interaction.options.getUser('target');

      if (discordId === target.id) {
        await interaction.followUp({ embeds: [createNormalMessage(messages.sendGiftForMySelf)] });
        return;
      }

      const userReceived = await UserService.getUserById(target.id);

      if (!userReceived || !userReceived.discordUserId) {
        await interaction.followUp({ embeds: [createNormalMessage(messages.addFriendUnreadyRegister(target.id))] });
        return;
      }

      const isFriend = user.friends.findIndex(item => item.discordUserId === userReceived.discordUserId);
      
      if (isFriend === -1) {
        await interaction.followUp({ embeds: [createNormalMessage(messages.isNotFriendGift(userReceived.discordUserId))] });
        return;
      }

      const gifts = user.itemBag.filter(item => item.type === ShopItemEnum.GIFT);
      if(!gifts.length) {
        await interaction.followUp({
          embeds: [createFriendMessage(friendActionType.gift, { gifts, targetUsername: userReceived.username})]
        });
        return;
      }

      const select = new StringSelectMenuBuilder().setCustomId('giftChoose').setPlaceholder('Chọn món quà')
      for (const item of gifts) {
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
        embeds: [createFriendMessage(friendActionType.gift, { gifts, targetUsername: userReceived.username})],
        components: [row]
      })

      const collection = reply.createMessageComponentCollector({
        componentType: ComponentType.StringSelect,
        filter: (i) => i.user.id === interaction.user.id && i.customId === 'giftChoose',
        time: 300000
      });

      collection.on('collect', async interaction => {
        try {
          await interaction.deferUpdate();
          const [value] = interaction.values;
          const giftIndex = user.itemBag.findIndex(item => item.id === parseInt(value));
          const gift = gifts.find(item => item.id === parseInt(value));
          if (gift.quantity === 1) {
            const newItemBag = user.itemBag.filter(item => item.id !== parseInt(value));
            user.itemBag = newItemBag;
          } else {
            user.itemBag[giftIndex].quantity -= 1;
          }
          const intimacyPointsUpdate = user.friends[isFriend].intimacyPoints + gift.intimacyPoints;
  
          user.friends[isFriend].intimacyPoints += gift.intimacyPoints;
  
          const findFriendIndex = userReceived.friends.findIndex(item => item.discordUserId === user.discordUserId);
          userReceived.friends[findFriendIndex].intimacyPoints += gift.intimacyPoints;
  
          const findItemOnGifted = user.giftsGiven.findIndex(item => item.id === gift.id);
          if (findItemOnGifted === -1) {
            const addData = {
              id: gift.id,
              giftEmoji: gift.giftEmoji,
              name: gift.name,
              quantity: 1
            }
            user.giftsGiven.push(addData);
          } else {
            user.giftsGiven[findItemOnGifted].quantity += 1;
          }
  
          const questToUpdateIndex = user.quests.dailyQuestsReceived.quests.findIndex(quest => quest.action === ActionEnum.GIFT);
      
          if (questToUpdateIndex !== -1 && 
            user.quests.dailyQuestsReceived.quests[questToUpdateIndex].progress < user.quests.dailyQuestsReceived.quests[questToUpdateIndex].completionCriteria) {
            user.quests.dailyQuestsReceived.quests[questToUpdateIndex].progress += 1;
          }
      
          const questToWeekUpdateIndex = user.quests.weekQuestsReceived.quests.findIndex(quest => quest.action === ActionEnum.GIFT);
      
          if (questToWeekUpdateIndex !== -1 && 
            user.quests.weekQuestsReceived.quests[questToWeekUpdateIndex].progress < user.quests.weekQuestsReceived.quests[questToWeekUpdateIndex].completionCriteria) {
            user.quests.weekQuestsReceived.quests[questToWeekUpdateIndex].progress += 1;
          }
  
          await UserService.updateUser(user);
          await UserService.updateUser(userReceived);
  
          await FriendService.updateIntimacyPoints(user.discordUserId, userReceived.discordUserId, intimacyPointsUpdate)
          await interaction.channel.send(`<@${userReceived.discordUserId}>`);
          await reply.edit({
            embeds: [createFriendMessage(friendActionType.giftSuccess, {
              userId: user.discordUserId,
              targetId: userReceived.discordUserId,
              giftEmoji: gift.giftEmoji,
              giftName: gift.name,
              intimacyPoints: gift.intimacyPoints
            })],
            components: []
          })
        } catch (error) {
          console.log(error);
        }
      })

    } catch (error) {
      console.log(error, '[gift]');
    }
  }
}

module.exports = { addFriend, removeFriend, relationship, gift }