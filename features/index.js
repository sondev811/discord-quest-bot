const { confession, createConfession, submitConfession, replyConfession, submitReplyConfession } = require('./confession/confession');
const { resolveCfs, rejectCfs, resolveReply, rejectReply } = require('./confession/reviewCfs');
const { InteractionType, Events } = require('discord.js');
const { help } = require('./help');
const { register, confirmRegister } = require('./register');
const { developing, maintenance } = require('./developing');
const { info, tickets, daily, giveTicket, bag, top } = require('./user');
const { quest, giftQuest } = require('./quest');
const { addRoleShop, addGiftShop, shop, addQuestShop, removeItemShop } = require('./shop');
const { addFriend, removeFriend, relationship, gift } = require('./friend');
const { addRole, removeRole } = require('./role');

const run = async (client) => {
  // Handle commands
  client.on(Events.InteractionCreate, async (interaction) => {
    try {
      if (!interaction) {
        return;
      }
      if (interaction.isCommand()) {
        let command = interaction.commandName;
        if (process.env.MAINTENANCE === 'maintenance') {
          command = 'maintenance'
        }
        if (interaction.member?.user?.id === process.env.DEVELOPER 
          || interaction.member?.user?.id === process.env.OWNER_ID
          || interaction.member?.user?.id === process.env.TESTER
        ) {
          command = interaction.commandName;
        }
        
        switch (command) {
          case confession.name:
            confession.execute(interaction);
            break;
          case help.name:
            help.execute(interaction);
            break;
          case daily.name:
            daily.execute(interaction);
            break;
          case register.name:
            register.execute(interaction);
            break;
          case info.name:
            info.execute(interaction);
            break;
          case tickets.name:
            tickets.execute(interaction);
            break;
          case daily.name:
            daily.execute(interaction);
            break;
          case giveTicket.name:
            giveTicket.execute(interaction);
            break
          case quest.name:
            quest.execute(interaction);
            break;
          case addRoleShop.name:
            addRoleShop.execute(interaction);
            break;
          case addGiftShop.name:
            addGiftShop.execute(interaction);
            break;
          case shop.name:
            shop.execute(interaction);
            break;
          case bag.name:
            bag.execute(interaction);
            break;
          case addFriend.name:
            addFriend.execute(interaction);
            break;
          case removeFriend.name:
            removeFriend.execute(interaction);
            break;
          case relationship.name:
            relationship.execute(interaction);
            break;
          case gift.name:
            gift.execute(interaction);
            break;
          case addRole.name:
            addRole.execute(interaction);
            break;
          case giftQuest.name:
            giftQuest.execute(interaction);
            break;
          case addQuestShop.name: 
            addQuestShop.execute(interaction);
            break;
          case removeItemShop.name: 
            removeItemShop.execute(interaction);
            break;
          case removeRole.name:
            removeRole.execute(interaction);
            break;
          case top.name:
            top.execute(interaction);
            break;
          case maintenance.name:
            maintenance.execute(interaction);
            break;
          default:
            developing.execute(interaction);
            break;
        }
      }
    } catch (error) {
      console.error('An error occurred during command handling:', error);
      interaction.followUp('Có lỗi xảy ra trong quá trình xử lý.');
    }
  });

  // Handle buttons
  client.on(Events.InteractionCreate, async (interaction) => {
    try {
      if (interaction.isButton()) {
        const [action, value] = interaction.customId.split(':');
        let customId = interaction.customId;
        if (action && value) {
          customId = action;
        }
        console.log(customId, value, 'buttonClicked');
        switch (customId) {
          case resolveCfs.name:
            resolveCfs.execute(interaction);
            break;
          case rejectCfs.name:
            rejectCfs.execute(interaction);
            break;
          case createConfession.name:
            createConfession.execute(interaction, value);
            break;
          case replyConfession.name:
            replyConfession.execute(interaction);
            break;
          case resolveReply.name:
            resolveReply.execute(interaction, value);
            break;
          case rejectReply.name:
            rejectReply.execute(interaction, value);
            break;
          case confirmRegister.name:
            confirmRegister.execute(interaction);
            break;
          default:
            break;
        }
      }
    } catch (error) {
      console.error('An error occurred during button handling:', error);
      interaction.followUp('Có lỗi xảy ra trong quá trình xử lý.');
    }
  });

  // Handle modals
  client.on(Events.InteractionCreate, async (interaction) => {
    try {
      if (interaction.type === InteractionType.ModalSubmit) {
        const [action, value] = interaction.customId.split(':');
        let customId = interaction.customId;
        if (action && value) {
          customId = action;
        }
        console.log(customId, value, 'modalSubmit');
        switch (customId) {
          case submitConfession.name:
            submitConfession.execute(interaction, value);
            break;
          case submitReplyConfession.name:
            submitReplyConfession.execute(interaction);
            break;
          default:
            break;
        }
      }
    } catch (error) {
      console.error('An error occurred during modal handling:', error);
      interaction.followUp('Có lỗi xảy ra trong quá trình xử lý.');
    }
  });

}

module.exports = { run };