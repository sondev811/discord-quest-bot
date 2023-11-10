const messages = require("../constants/messages")
const { schema } = require("../schemas")
const { EmbedBuilder } = require("discord.js")

const createHelpMessage = () => {
  const embedMessage = new EmbedBuilder({
    title: messages.help,
    fields: schema.map((item, index) => ({
      name: `${index + 1}. /${item.name}`,
      value: `${item.description}`
    }))
  })
  embedMessage.setColor(0xe59b9b); 
  return embedMessage
}
module.exports = { createHelpMessage };