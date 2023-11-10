const messages = require("../constants/messages");
const { createNormalMessage } = require("../messages/normalMessage");

const developing = {
  name: 'developing',
  execute: async interaction => {
    try {
      await interaction.deferReply();
      await interaction.followUp({
        embeds: [createNormalMessage('Bot đang bảo trì')]
      })
    } catch (error) {
      console.log(error);      
    }
  }
}
module.exports = { developing };