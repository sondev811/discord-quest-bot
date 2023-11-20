const { ButtonBuilder, ActionRowBuilder, SelectMenuBuilder, StringSelectMenuBuilder, StringSelectMenuOptionBuilder } = require("@discordjs/builders");
const { friendActionType, friendshipName } = require("../constants/general");
const messages = require("../constants/messages");
const { createFriendMessage } = require("../messages/friendMessage");
const { createNormalMessage } = require("../messages/normalMessage");
const { UserService } = require("../services/user.service");
const { ButtonStyle, ComponentType, Events } = require("discord.js");
const { FriendService } = require("../services/friend.service");
const { calcDate, handleEmoji, mergeImages, convertDateTime } = require("../utils");
const { ActionEnum } = require("../models/quest.model");
const { BagItemType } = require("../models/user.model");
const { relationshipType } = require("../models/relationship.model");
process.env.TZ = 'Asia/Bangkok';

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

          const basicLevel = await FriendService.getRelationshipByLevel(1);

          const body = {
            discordIdFirst: user.discordUserId,
            discordIdLast: userReceived.discordUserId,
            relationship: basicLevel
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
          
          const checkWeedingRingUser = user.itemBag.findIndex(item => item.type === BagItemType.WEEDING_RING);
          const checkWeedingRingFriend = userReceived.itemBag.findIndex(item => item.type === BagItemType.WEEDING_RING);
  
          if (checkWeedingRingUser !== -1) {
            const newBag = user.itemBag.filter(item => item.type !== BagItemType.WEEDING_RING);
            user.itemBag = newBag;
          }

          if (checkWeedingRingFriend !== -1) {
            const newBag = userReceived.itemBag.filter(item => item.type !== BagItemType.WEEDING_RING);
            userReceived.itemBag = newBag;
          }

          const checkCertificateUser = user.itemBag.findIndex(item => item.type === BagItemType.CERTIFICATE);
          const checkCertificateFriend = userReceived.itemBag.findIndex(item => item.type === BagItemType.CERTIFICATE);
          
          if (checkCertificateUser !== -1) {
            const newBag = user.itemBag.filter(item => item.type !== BagItemType.CERTIFICATE);
            user.itemBag = newBag;
          }

          if (checkCertificateFriend !== -1) {
            const newBag = userReceived.itemBag.filter(item => item.type !== BagItemType.CERTIFICATE);
            userReceived.itemBag = newBag;
          }

          const messageUser = await interaction.guild?.members.fetch(user.discordUserId);
          const messageFriend = await interaction.guild?.members.fetch(userReceived.discordUserId);
          const role = await interaction.guild?.roles.cache.get(process.env.WEDDING_ROLE);

          if (role) {
            await messageUser.roles.remove(role);
            await messageFriend.roles.remove(role);
          }

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

const marriedCheck = (relationships) => {
  let isMarried = false;
  for(let item of relationships) {
    if (item && item?.relationship?.name === relationshipType.married) {
      isMarried = true;
      break;
    }
  }
  return isMarried
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
        .setStyle(ButtonStyle.Primary)
        .setEmoji({
          name: 'checked',
          id: '1174312599085650000',
          animated: true
        });

        const guide = new ButtonBuilder()
          .setCustomId('guide')
          .setLabel('Hướng dẫn')
          .setStyle(ButtonStyle.Primary)
          .setEmoji({
            name: 'guide',
            id: '1174302703430676511',
            animated: true
          });

        const row = new ActionRowBuilder().addComponents([purchase, guide]);

        const friendList = [];

        for(let friend of user.friends) {
          const relationship = await FriendService.getRelationShip(user.discordUserId, friend.discordUserId);
          friendList.push(relationship);
        }
        
        const reply = await interaction.followUp({
          embeds: [createFriendMessage(friendActionType.getAllRelationship, 
            { 
              friends: friendList,
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

      const friendshipData = await FriendService.getRelationShip(user.discordUserId, userReceived.discordUserId);

      const upgradeRelationship = new ButtonBuilder()
      .setCustomId('upgradeRelationship')
      .setLabel('Tăng cấp độ thân thiết')
      .setStyle(ButtonStyle.Primary)
      .setEmoji({
        name: 'level_up',
        id: '1174300851020496926',
        animated: true
      });

      const marryBtn = new ButtonBuilder()
      .setCustomId('marry')
      .setLabel('Kết hôn')
      .setStyle(ButtonStyle.Primary)
      .setEmoji({
        name: 'marry',
        id: '1174313463368142929'
      });

      const guideMarried = new ButtonBuilder()
        .setCustomId('guideMarried')
        .setLabel('Hướng dẫn')
        .setStyle(ButtonStyle.Primary)
        .setEmoji({
          name: 'guide',
          id: '1174302703430676511',
          animated: true
        });

      const craft = new ButtonBuilder()
        .setCustomId('craft')
        .setLabel('Ghép nhẫn kết hôn')
        .setStyle(ButtonStyle.Primary)
        .setEmoji({
          name: 'craft_ring',
          id: '1175499482994061322'
        });

      const backBtn = new ButtonBuilder()
      .setCustomId('backRelationship')
      .setLabel('Quay lại')
      .setStyle(ButtonStyle.Primary)
      .setEmoji({
        name: 'back_to_board',
        id: '1174295696522874890',
        animated: true
      });

      const acceptMarry = new ButtonBuilder()
      .setCustomId('acceptMarry')
      .setLabel('Đồng ý')
      .setStyle(ButtonStyle.Success); 

      const rejectMarry = new ButtonBuilder()
      .setCustomId('rejectMarry')
      .setLabel('Từ chối')
      .setStyle(ButtonStyle.Danger); 

      const rowRequestMarry = new ActionRowBuilder().addComponents([acceptMarry, rejectMarry]);

      const messageUser = await interaction.guild?.members.fetch(user.discordUserId);
      const messageFriend = await interaction.guild?.members.fetch(userReceived.discordUserId);
    
      const components = [];

      const userRelationships = await FriendService.getAllRelationshipById(user.discordUserId);
      const friendRelationships = await FriendService.getAllRelationshipById(userReceived.discordUserId);

      const userMarriedCheck = marriedCheck(userRelationships);
      const friendMarriedCheck = marriedCheck(friendRelationships);

      if (friendshipData.relationship.name === relationshipType.friend || friendshipData.relationship.name === relationshipType.bestFriend) {
        components.push(upgradeRelationship);
      }

      if (friendshipData.relationship.name === relationshipType.soulmate && !userMarriedCheck && !friendMarriedCheck) {
        components.push(marryBtn);
      }

      if (!userMarriedCheck && !friendMarriedCheck) {
        components.push(craft);
      }

      components.push(guideMarried);

      const rowBack = new ActionRowBuilder().addComponents(backBtn);

      const row = new ActionRowBuilder().addComponents(components);

      const body = {
        username: user.username,
        targetUsername: userReceived.username,
        targetId: userReceived.discordUserId,
        intimacyPoints: user.friends[isFriend].intimacyPoints,
        discordUserId: user.discordUserId,
        avatar: interaction.user.avatar,
        dateConverted: calcDate(user.friends[isFriend].friendDate),
        date: convertDateTime(user.friends[isFriend].friendDate),
        friendship: friendshipData.relationship.name,
        isMarried: friendshipData.isMarried,
        marriedDate: convertDateTime(friendshipData.marriedDate),
        order: friendshipData.order === 1 ? `**đầu tiên**` : `thứ **${friendshipData.order}**`
      };

      const beforeEmbed = createFriendMessage(friendActionType.getRelationship, body);
      const reply = await interaction.followUp(
        { 
          embeds: [beforeEmbed],
          components: [row]
        }
      );

      const relationshipCollection = reply.createMessageComponentCollector({
        componentType: ComponentType.Button,
        filter: (i) => i.user.id === interaction.user.id && (
          i.customId === 'upgradeRelationship' || 
          i.customId === 'guideMarried' || 
          i.customId === 'craft' || 
          i.customId === 'backRelationship' || 
          i.customId === 'marry' ||
          i.customId === 'acceptMarry' ||
          i.customId === 'rejectMarry'
        ),
        time: 300000
      })

      relationshipCollection.on('collect', async interaction => {
        try {
          await interaction.deferUpdate();
          const customId = interaction.customId;
          if (customId === 'upgradeRelationship') {
            const newFriendshipData = await FriendService.getRelationShip(user.discordUserId, userReceived.discordUserId);
            const nextLevel = await FriendService.getRelationshipByLevel(newFriendshipData.relationship.level + 1);
            if (!nextLevel || nextLevel.level !== newFriendshipData.relationship.level + 1) return;

            if (newFriendshipData.intimacyPoints < nextLevel.intimacyPointUpgrade) {
              await reply.edit({
                embeds: [createNormalMessage(messages.upgradeLevelFriendFail(friendshipName[nextLevel.name], nextLevel.intimacyPointUpgrade))],
                components: [rowBack]
              });
              return;
            }
            await FriendService.updateFriendRelationship(user.discordUserId, userReceived.discordUserId, nextLevel);
            await reply.edit({
              embeds: [createNormalMessage(messages.upgradeLevelFriendSuccess(friendshipName[nextLevel.name]))],
              components: [rowBack]
            });
            return;
          }
          if (customId === 'marry') {
            const newUserData = await UserService.getUserById(discordId);
            const checkWeedingRing = newUserData.itemBag.findIndex(item => item.type === BagItemType.WEEDING_RING);
            const checkCertificate = newUserData.itemBag.findIndex(item => item.type === BagItemType.CERTIFICATE);
            
            if (checkWeedingRing === -1 || checkCertificate === -1) {
              await reply.edit({
                embeds: [createNormalMessage(messages.marryFail)],
                components: [rowBack]
              });
              return;
            }
            await reply.edit({
              embeds: [createNormalMessage(messages.sendRequestMarry(user.discordUserId, userReceived.discordUserId))],
              components: [rowRequestMarry]
            });

            const requestCollection = reply.createMessageComponentCollector({
              componentType: ComponentType.Button,
              filter: (i) => i.user.id === userReceived.discordUserId && (
                i.customId === 'acceptMarry' ||
                i.customId === 'rejectMarry'
              ),
              time: 300000
            });

            requestCollection.on('collect', async interaction => {
              try {
                await interaction.deferUpdate();
                const customId = interaction.customId;
                if (customId === 'acceptMarry') {
                  const newUserData = await UserService.getUserById(discordId);
                  const newUserFriend = await UserService.getUserById(userReceived.discordUserId);
                  
                  const weedingRing = newUserData.itemBag.find(item => item.type === BagItemType.WEEDING_RING);
                 
                  const ringAddToBag = {
                    _id: weedingRing._id,
                    name: weedingRing.name,
                    description: weedingRing.description,
                    type: weedingRing.type,
                    typeBuff: weedingRing.typeBuff,
                    giftEmoji: weedingRing.giftEmoji,
                    valueBuff: weedingRing.valueBuff,
                    quantity: 1
                  }

                  newUserFriend.itemBag.push(ringAddToBag);

                  const newFriendshipWedding = await FriendService.getRelationShip(user.discordUserId, userReceived.discordUserId);
                  
                  const nextLevel = await FriendService.getRelationshipByLevel(newFriendshipWedding.relationship.level + 1);
                  await FriendService.updateFriendRelationship(newUserData.discordUserId, newUserFriend.discordUserId, nextLevel);
                 
                  const role = await interaction.guild?.roles.cache.get(process.env.WEDDING_ROLE);
                  if (role) {
                    await messageUser.roles.add(role);
                    await messageFriend.roles.add(role);
                  }

                  await UserService.updateUser(newUserData);
                  await UserService.updateUser(newUserFriend);

                  const allRelationshipGotMarried = await FriendService.getOrderRelationship();

                  let order = null;

                  if (allRelationshipGotMarried.length === 0) {
                    order = '**đầu tiên**';
                  } else {
                    order = `thứ **${allRelationshipGotMarried.length + 1}**`
                  }
                  const currentDate = new Date();
                  const serverOwner = process.env.OWNER_ID;

                  await FriendService.updateFriendRelationshipDateAndOrder(newUserData.discordUserId, newUserFriend.discordUserId, currentDate, allRelationshipGotMarried.length + 1);
                  const marriedDate = `${currentDate.getDate()}/${currentDate.getMonth() + 1}/${currentDate.getFullYear()}`;
                  
                  if (messageUser.user.avatar && messageFriend.user.avatar) {
                    const avatarUserOne = `https://cdn.discordapp.com/avatars/${messageUser.user.id}/${messageUser.user.avatar}.png`;
                    const avatarUserTwo = `https://cdn.discordapp.com/avatars/${messageFriend.user.id}/${messageFriend.user.avatar}.png`;
                    const imageCombine = await mergeImages(avatarUserOne, avatarUserTwo);
                    await reply.edit({
                      embeds: [createFriendMessage(friendActionType.marrySuccess, 
                        { 
                          user: newUserData.discordUserId, 
                          friend: newUserFriend.discordUserId, 
                          role,
                          order,
                          serverOwner,
                          marriedDate
                        }
                      )],
                      components: [],
                      files: [{
                        attachment: imageCombine,
                        name: `${newUserData.discordUserId}${newUserFriend.discordUserId}.png`,
                      }],
                    });
                    return;
                  }

                  await reply.edit({
                    embeds: [createFriendMessage(friendActionType.marrySuccess, 
                      { 
                        user: newUserData.discordUserId, 
                        friend: newUserFriend.discordUserId, 
                        role,
                        order,
                        serverOwner,
                        marriedDate
                      }
                    )],
                    components: [],
                  });
      
                  return;
                }
      
                if (customId === 'rejectMarry') {
                  await reply.edit({
                    embeds: [createNormalMessage(messages.sendRejectMarry(user.discordUserId, userReceived.discordUserId))],
                    components: []
                  });
                  return;
                }
              } catch (error) {
                console.log(error);
              }
            })
            return;
          }
          if (customId === 'craft') {
            const newUserData = await UserService.getUserById(discordId);

            const bag = newUserData.itemBag;

            const checkMarried = bag.findIndex(item => item.type === BagItemType.WEEDING_RING);
            if (checkMarried !== -1) {
              await reply.edit({
                embeds: [createNormalMessage(messages.preventCraftWhenMarried)],
                components: [rowBack]
              });
              return;
            }
            const itemCraft = bag.filter(item => item.type === BagItemType.RING_PIECE);
            if (!itemCraft || itemCraft.length < 2) {
              await reply.edit({
                embeds: [createNormalMessage(messages.craftFail)],
                components: [rowBack]
              });
              return;
            }

            const newFriendData = await UserService.getUserById(userReceived.discordUserId);
            const newFriendshipData = await FriendService.getRelationShip(discordId, userReceived.discordUserId);

            const userSilver = newUserData.tickets.silver;
            const friendSilver = newFriendData.tickets.silver;

            if (userSilver < 5000) {
              await reply.edit({
                embeds: [createNormalMessage(messages.insufficientBalanceCraft(discordId))],
                components: [rowBack]
              });
              return;
            }

            if(friendSilver < 5000) {
              await reply.edit({
                embeds: [createNormalMessage(messages.insufficientBalanceCraft(userReceived.discordUserId))],
                components: [rowBack]
              });
              return;
            }

            if (newFriendshipData.intimacyPoints < 50) {
              await reply.edit({
                embeds: [createNormalMessage(messages.insufficientBalanceCraft(insufficientPointCraft))],
                components: [rowBack]
              });
            }

            const findFriendIndexUser = newUserData.friends.findIndex(item => item.discordUserId === newFriendData.discordUserId);
            newUserData.friends[findFriendIndexUser].intimacyPoints -= 300;
            newUserData.tickets.silver -= 5000;
      
            const findFriendIndex = newFriendData.friends.findIndex(item => item.discordUserId === newUserData.discordUserId);
            newFriendData.friends[findFriendIndex].intimacyPoints -= 300;
            newFriendData.tickets.silver -= 5000;

            const filterBag = bag.filter(item => item.type !== BagItemType.RING_PIECE);
            const weedingRing = await FriendService.getWeedingRing();

            const ringAddToBag = {
              _id: weedingRing._id,
              name: weedingRing.name,
              description: weedingRing.description,
              type: weedingRing.type,
              typeBuff: weedingRing.buffInfo.typeBuff,
              giftEmoji: weedingRing.emoji,
              valueBuff: weedingRing.buffInfo.valueBuff,
              quantity: 1
            }

            filterBag.push(ringAddToBag);

            newUserData.itemBag = filterBag;

            await UserService.updateUser(newUserData);
            await UserService.updateUser(newFriendData);
            await FriendService.updateIntimacyPoints(newUserData.discordUserId, newFriendData.discordUserId, newUserData.friends[findFriendIndexUser].intimacyPoints);

            await reply.edit({
              embeds: [createNormalMessage(messages.craftSuccess(weedingRing))],
              components: [rowBack]
            });
            return;
          }

          if (customId === 'backRelationship') {
            const friendshipDataNew = await FriendService.getRelationShip(user.discordUserId, userReceived.discordUserId);
            body.friendship = friendshipDataNew.relationship.name;

            const components = [];

            const newUserRelationships = await FriendService.getAllRelationshipById(user.discordUserId);
            const newFriendRelationships = await FriendService.getAllRelationshipById(userReceived.discordUserId);
      
            const newUserMarriedCheck = marriedCheck(newUserRelationships);
            const newFriendMarriedCheck = marriedCheck(newFriendRelationships);
      
            if (friendshipDataNew.relationship.name === relationshipType.friend || friendshipDataNew.relationship.name === relationshipType.bestFriend) {
              components.push(upgradeRelationship);
            }
      
            if (friendshipDataNew.relationship.name === relationshipType.soulmate && !newUserMarriedCheck && !newFriendMarriedCheck) {
              components.push(marryBtn);
            }
      
            if (!newUserMarriedCheck && !newFriendMarriedCheck) {
              components.push(craft);
            }
      
            components.push(guideMarried);
      
            const newRow = new ActionRowBuilder().addComponents(components);

            await reply.edit({
              embeds: [createFriendMessage(friendActionType.getRelationship, body)],
              components: [newRow]
            });
            return;
          }

          if (customId === 'guideMarried') {
            await reply.edit({
              embeds: [createFriendMessage(friendActionType.guideCraft)],
              components: [rowBack]
            });
          }

        } catch (error) {
          console.log(error);
        }
      });


      
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

      const gifts = user.itemBag.filter(item => item.type === BagItemType.GIFT);
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
            .setValue(String(item._id))
            .setEmoji(handleEmoji(item.giftEmoji))
        );
      }

      const row = new ActionRowBuilder().addComponents(select);

      const embeds = createFriendMessage(friendActionType.gift, { gifts, targetUsername: userReceived.username})

      const reply = await interaction.followUp({
        embeds: [embeds],
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
          const giftIndex = user.itemBag.findIndex(item => item._id.equals(value));
          const gift = gifts.find(item => item._id.equals(value));
          if (gift.quantity === 1) {
            const newItemBag = user.itemBag.filter(item => !item._id.equals(value));
            user.itemBag = newItemBag;
          } else {
            user.itemBag[giftIndex].quantity -= 1;
          }
          const intimacyPointsUpdate = user.friends[isFriend].intimacyPoints + gift.intimacyPoints;
  
          user.friends[isFriend].intimacyPoints += gift.intimacyPoints;
  
          const findFriendIndex = userReceived.friends.findIndex(item => item.discordUserId === user.discordUserId);
          userReceived.friends[findFriendIndex].intimacyPoints += gift.intimacyPoints;
  
          const findItemOnGifted = user.giftsGiven.findIndex(item => item._id.equals(gift._id));
          if (findItemOnGifted === -1) {
            const addData = {
              _id: gift._id,
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