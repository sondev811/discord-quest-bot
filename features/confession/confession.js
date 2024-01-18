const { ActionRowBuilder, ButtonBuilder, ModalBuilder, TextInputBuilder } = require("@discordjs/builders");
const { confessionType, confessionStatus } = require("../../constants/general");
const messages = require("../../constants/messages");
const { confessionMessages } = require("../../messages/confessionMessage");
const { createNormalMessage } = require("../../messages/normalMessage");
const { ButtonStyle, ForumChannel, ThreadAutoArchiveDuration, TextInputStyle, ChannelType } = require("discord.js");
const { ConfessionService } = require("../../services/confession.service");
const connectDB = require("../../DB/connection");

const confession = {
  name: 'setup-confession',
  execute: async (interaction) => {
    try {
      await interaction.deferReply({
        ephemeral: true 
      });
      if (interaction.member?.user.id !== process.env.OWNER_ID) {
        await interaction.followUp({ content: messages.notAccessSetupConfession });
        return;
      }
      const forumChannel = interaction.guild?.channels.cache.get(process.env.CONFESSION_CHANNEL || '');
      if (forumChannel instanceof ForumChannel) {
        const sendConfessionAnonymous = new ButtonBuilder()
          .setCustomId('createConfession:anonymous')
          .setLabel('Gửi confession ẩn danh')
          .setStyle(ButtonStyle.Success);
        const sendConfession = new ButtonBuilder()
          .setCustomId('createConfession')
          .setLabel('Gửi confession hiện nickname')
          .setStyle(ButtonStyle.Success); 
        const actionRow = new ActionRowBuilder().addComponents([sendConfessionAnonymous, sendConfession]);
        await forumChannel.threads
        .create({
          name: messages.confessionGuideTitle,
          autoArchiveDuration: ThreadAutoArchiveDuration.OneWeek,
          message: {
            content: messages.confessionGuideDM,
            components: [actionRow]
          },
        })
        await interaction.followUp({ content: messages.setupConfessionSuccess });
      }
    } catch (error) {
      console.log(error, 'confession');
      interaction.followUp({
        embeds: [
          createNormalMessage(messages.error)
        ]
      });
    }
  }
}

const createConfession = {
  name: 'createConfession',
  execute: async (interaction, anonymous) => {
    try {
      const modal = new ModalBuilder()
			.setCustomId(`submitConfession${anonymous ? ':anonymous' : ''}`)
			.setTitle('Tạo Confession');

      const confessionContentInput = new TextInputBuilder()
			.setCustomId(`confessionContent`)
			.setLabel(`Confession ${anonymous ? 'ẩn danh' : 'hiện nickname'}`)
      .setPlaceholder("Nhập nội dung confession tại đây...")
      .setMaxLength(4000)
			.setStyle(TextInputStyle.Paragraph);

      const firstActionRow = new ActionRowBuilder().addComponents(confessionContentInput);
  
      modal.addComponents(firstActionRow);
      await interaction.showModal(modal)
    } catch (error) {
      console.log(error, 'confession show modal');
    }
  }
}

const submitConfession = {
  name: 'submitConfession',
  execute: async (interaction, isAnonymous) => {
    try {
      interaction.deferUpdate();
      const content = interaction.fields.getTextInputValue('confessionContent');
      const userId = interaction.user.id;
      const resolveCfs = new ButtonBuilder()
        .setCustomId('resolveCfs')
        .setLabel('Duyệt')
        .setStyle(ButtonStyle.Success);
      
      const rejectCfs = new ButtonBuilder()
        .setCustomId('rejectCfs')
        .setLabel('Từ chối')
        .setStyle(ButtonStyle.Secondary);

      const actionRow = new ActionRowBuilder().addComponents([resolveCfs, rejectCfs]);
      const reviewChannel = interaction.guild?.channels.cache.get(process.env.REVIEW_CONFESSION_CHANNEL || '');
      if (reviewChannel?.type === ChannelType.GuildText) {
        await connectDB();

        //fetch confession from DB
        const confessions = await ConfessionService.getAllConfession();
        let cfsCount = confessions.length + 1;

        const embeds = confessionMessages(confessionType.confessionReview, { cfsCount, content, userId });
        const msg = await reviewChannel.send({ embeds: [embeds], components: [actionRow]});
        
        //save confession to DB
        const author = {
          id: interaction.user.id,
          username: interaction.user.username,
          avatar: interaction.user.avatar
        };

        const body = {
          id: cfsCount,
          author,
          content: content,
          reviewMessageID: msg.id,
          createdAt: new Date(),
          reviewedAt: null,
          reviewedBy: null,
          status: confessionStatus.pending,
          messageID: null,
          threadID: null,
          replies: [],
          isAnonymousConfession: isAnonymous === confessionType.anonymous
        }

        const result = await ConfessionService.saveOrUpdateConfession(body);
        if(!result || result.length === confessions.length) {
          await msg.delete();
          return;
        }
        await reviewChannel.send(`<@&${process.env.MANAGE_CONFESSION_ROLE}>`);
        const authorNotify = await interaction.guild?.members.fetch(interaction.user.id);
        await authorNotify?.send(messages.DMConfessionReviewed);
      }
    } catch (error) {
      console.log(error, 'confession submit');
    }
  }
}

const replyConfession = {
  name: 'replyConfession',
  execute: async (interaction) => {
    try {
      const modal = new ModalBuilder()
			.setCustomId('submitReplyConfession')
			.setTitle('Trả lời confession');

      const confessionContentInput = new TextInputBuilder()
			.setCustomId('confessionReplyContent')
			.setLabel("Trả lời confession ẩn danh")
      .setPlaceholder("Nhập nội dung confession tại đây...")
      .setMaxLength(4000)
			.setStyle(TextInputStyle.Paragraph);

      const firstActionRow = new ActionRowBuilder().addComponents(confessionContentInput);
  
      modal.addComponents(firstActionRow);
      await interaction.showModal(modal)
    } catch (error) {
      console.log(error, 'confession');
      interaction.followUp({
        embeds: [
          createNormalMessage(messages.error)
        ]
      });
    }
  }
}

const submitReplyConfession = {
  name: 'submitReplyConfession',
  execute: async (interaction) => {
    try {
      interaction.deferUpdate();
      const content = interaction.fields.getTextInputValue('confessionReplyContent');
      const userId = interaction.user.id;
      const messageId = interaction.message.id;

      const reviewChannel = interaction.guild?.channels.cache.get(process.env.REVIEW_CONFESSION_CHANNEL || '');
      if (reviewChannel?.type === ChannelType.GuildText) {
        await connectDB();
        
        //fetch confession from DB
        const confession = await ConfessionService.getConfessionByThreadId(messageId);
        if(!confession || !confession.threadID) return;
        const threadID = confession.threadID;
        
        const resolveReply = new ButtonBuilder()
        .setCustomId(`resolveReply:${threadID}`)
        .setLabel('Duyệt')
        .setStyle(ButtonStyle.Success);
      
        const rejectReply = new ButtonBuilder()
        .setCustomId(`rejectReply:${threadID}`)
        .setLabel('Từ chối')
        .setStyle(ButtonStyle.Secondary);
        
        const actionRow = new ActionRowBuilder().addComponents([resolveReply, rejectReply]);
        
        const embeds = confessionMessages(confessionType.replyReview, { content, userId, threadID});
        const msg = await reviewChannel.send({ embeds: [embeds], components: [actionRow]});
        const replyMore = {
          reviewReplyID: msg.id,
          content,
          threadID,
          userIdReply: userId
        }
        const updatedReplies = [...confession.replies, replyMore];

        //save confession to DB
        const body = {
          reviewMessageID: confession.reviewMessageID,
          replies: updatedReplies
        }
        const result = await ConfessionService.saveOrUpdateConfession(body);
        if (!result || result.replies.length === confession.replies.length) {
          await msg.delete();
          return;
        }
        await reviewChannel.send(`<@&${process.env.MANAGE_CONFESSION_ROLE}>`);
      }
    
    } catch (error) {
      console.log(error, 'confession');
      interaction.followUp({
        embeds: [
          createNormalMessage(messages.error)
        ]
      });
    }
  }
}

module.exports = { confession, createConfession, submitConfession, replyConfession, submitReplyConfession };