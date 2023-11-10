const { ActionRowBuilder, ButtonBuilder } = require("@discordjs/builders");
const connectDB = require("../DB/connection");
const messages = require("../constants/messages");
const { UserService } = require("../services/user.service");
const { ButtonStyle } = require("discord.js");
const { createRegisterMessages } = require("../messages/registerMessage");
const { createNormalMessage } = require("../messages/normalMessage");
const { LevelService } = require("../services/level.service");
const { errors } = require("../constants/general");
connectDB();
const register = {
  name: 'leudangky',
  execute: async interaction => {
    try {
      if (!interaction) return;
      await interaction.deferReply();
      const discordId = interaction.member?.user?.id;
      if (!discordId) {
        throw Error('Không tìm thấy discordId');
      };
      const user = await UserService.getUserById(discordId);
      if (user && user.discordUserId) {
        await interaction.followUp({ embeds: [createNormalMessage(messages.alreadyRegisterBot)] });
        return
      }
      const confirmPolicy = new ButtonBuilder()
          .setCustomId('confirmPolicyCreateAccount')
          .setLabel('Chấp nhận')
          .setStyle(ButtonStyle.Success);

        const actionRow = new ActionRowBuilder().addComponents([confirmPolicy]);
        
      const registerMessage = await interaction.followUp({
        embeds: [createRegisterMessages()],
        components: [actionRow]
      })
      setTimeout(async() => {
        await registerMessage.edit({
          embeds: [createNormalMessage(messages.expiredRegister)],
          components: []
        })
      }, 180000);
    } catch (error) {
      console.log(error, '[register]');
    }
  }
}

const confirmRegister = {
  name: 'confirmPolicyCreateAccount',
  execute: async (interaction) => {
    try {
      // await interaction.deferReply();
      const message = await interaction.channel?.messages.fetch(interaction.message.id);
      const { id, username } = interaction.member?.user;
      if (!id || !username) {
        throw Error('Không tìm thấy discordId hoặc username');
      };
      const isExistUser = await UserService.getUserById(id);
      
      // const oldEmbed = interaction.message.embeds[0];
      // message.edit({ 
      //   embeds: [oldEmbed],
      //   components: [],
      //   allowedMentions: { repliedUser: false }
      // });

      if (isExistUser && isExistUser.discordUserId) {
        await message.edit({ 
          embeds: [createNormalMessage(messages.alreadyRegisterBot)],
          components: [],
          allowedMentions: { repliedUser: false }
        });
        return;
      }

      const levels = await LevelService.getAllLevel();
      if (!levels || !levels.length) {
        await message.edit({ 
          embeds: [createNormalMessage(messages.registerFailed(process.env.SUPPORT_CHANNEL, process.env.DEVELOPER))],
          components: [],
          allowedMentions: { repliedUser: false }
        });
        return;
      }

      const [ basicLevel ] = levels;

      const user = await UserService.createUser({ username, discordUserId: id, level: basicLevel});
      if (!user || !user.discordUserId) {
        await message.edit({ 
          embeds: [createNormalMessage(messages.registerFailed(process.env.SUPPORT_CHANNEL, process.env.DEVELOPER))],
          components: [],
          allowedMentions: { repliedUser: false }
        });
        return;
      }
      await message.edit({ 
        embeds: [createNormalMessage(messages.registerSuccess)],
        components: [],
        allowedMentions: { repliedUser: false }
      });
    } catch (error) {
      console.log(error, '[register]');
      const message = await interaction.channel?.messages.fetch(interaction.message.id);
      if (error?.message === errors.GET_USER_ERROR) {
        await message.edit({ 
          embeds: [createNormalMessage(messages.getUserInfoError)],
          components: [],
          allowedMentions: { repliedUser: false }
        });
        return;
      }
      if (error?.message === errors.CREATE_USER_ERROR) {
        await message.edit({ 
          embeds: [createNormalMessage(messages.createUserError)],
          components: [],
          allowedMentions: { repliedUser: false }
        });
        return;
      }
      await message.edit({ 
        embeds: [createNormalMessage(messages.error)],
        components: [],
        allowedMentions: { repliedUser: false }
      });
    }
  }
}

module.exports = { register, confirmRegister};