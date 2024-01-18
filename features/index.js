const { InteractionType, Events } = require('discord.js');
const { help } = require('./help');
const { register, confirmRegister } = require('./register');
const { developing, maintenance } = require('./developing');
const { info, tickets, daily, giveTicket, bag, top, buffTicket, buffItem } = require('./user');
const { quest, giftQuest } = require('./quest');
const { addRoleShop, addGiftShop, shop, addQuestShop, removeItemShop, addRoleIntimacyShop } = require('./shop');
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
          case giftQuest.name:
            giftQuest.execute(interaction);
            break;
          case addRoleIntimacyShop.name:
            addRoleIntimacyShop.execute(interaction);
            break;
          case maintenance.name:
            maintenance.execute(interaction);
            break;
          case buffTicket.name:
            buffTicket.execute(interaction);
            break;
          case buffItem.name:
            buffItem.execute(interaction);
            break;
          default:
            developing.execute(interaction);
            break;
        }
      }
    } catch (error) {
      console.error(error, '[error handle]');
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
        switch (customId) {
          case confirmRegister.name:
            confirmRegister.execute(interaction);
            break;
          default:
            break;
        }
      }
    } catch (error) {
      console.error(error, '[error event button]');
    }
  });
  
}

module.exports = { run };