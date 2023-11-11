const { emoji } = require("../constants/general");
const messages = require("../constants/messages");
const { createNormalMessage } = require("../messages/normalMessage");

const maintenance = {
  name: 'maintenance',
  execute: async interaction => {
    try {
      await interaction.deferReply();
      await interaction.followUp({
        embeds: [createNormalMessage(`Bot đang trong thời gian bảo trì ${emoji.fix}`)]
      })
    } catch (error) {
      console.log(error);      
    }
  }
}

const developing = {
  name: 'developing',
  execute: async interaction => {
    try {
      await interaction.deferReply();
      await interaction.followUp({
        embeds: [createNormalMessage(`Chức năng đang phát triển hoặc bot không hỗ trợ chức năng này`)]
      })
    } catch (error) {
      console.log(error);      
    }
  }
}
module.exports = { developing, maintenance };