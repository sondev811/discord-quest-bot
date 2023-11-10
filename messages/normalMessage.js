const { EmbedBuilder } = require("discord.js")

const createNormalMessage = messages => {
  return new EmbedBuilder()
    .setDescription(messages)
    .setFooter({ 
      text: `Bot Làng • discord.gg/langleuleuliuliu`,
      iconURL: `https://cdn.discordapp.com/avatars/1168802361481904188/3526d4d2d2283aec1df941b1b5aef6ee.png`
    })
    .setColor(0xe59b9b); 
}

module.exports = { createNormalMessage };

