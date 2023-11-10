const { createHelpMessage } = require("../messages/helpMessage")

const help = {
  name: 'leuhelp',
  execute: async interaction => {
    try {
      if (!interaction) return;
      await interaction.deferReply();
      await interaction.followUp({
        embeds: [createHelpMessage()]
      });
    } catch (error) {
      console.log(error, '[help]');
    }
  }
}
module.exports = { help };
