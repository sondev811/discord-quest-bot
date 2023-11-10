const { ThreadAutoArchiveDuration, ForumChannel, ButtonStyle } = require("discord.js");
const { confessionType, confessionStatus } = require("../../constants/general");
const messages = require("../../constants/messages");
const { confessionMessages } = require("../../messages/confessionMessage");
const { createNormalMessage } = require("../../messages/normalMessage");
const { ConfessionService } = require("../../services/confession.service");
const connectDB = require("../../DB/connection");
const { ButtonBuilder, ActionRowBuilder } = require("@discordjs/builders");

const resolveCfs = {
  name: 'resolveCfs',
  execute: async (interaction) => {
    try {
      const message = await interaction.channel?.messages.fetch(interaction.message.id);
      await connectDB();
      // fetch confession from db
      const confession = await ConfessionService.getConfessionById(interaction.message.id);
      const confessions = await ConfessionService.getAllConfession();
      const filter = confessions.filter(item => item.status === confessionStatus.approved);
      const forumChannel = interaction.guild?.channels.cache.get(process.env.CONFESSION_CHANNEL || '');
      if (forumChannel instanceof ForumChannel) {
        const sendConfession = new ButtonBuilder()
          .setCustomId('replyConfession')
          .setLabel('Trả lời ẩn danh')
          .setStyle(ButtonStyle.Success);
        const actionRow = new ActionRowBuilder().addComponents([sendConfession]);

        const bodyEmbed = {
            userId: confession.isAnonymousConfession ? interaction.message.author.id : confession.author.id,
            avatar: confession.isAnonymousConfession ? interaction.message.author.avatar : confession.author.avatar,
            username: confession.isAnonymousConfession ? 'ẩn danh' : confession.author.username,
        }
        const createdThread = await forumChannel.threads
        .create({
          name: `Confession #${filter.length + 1}`,
          autoArchiveDuration: ThreadAutoArchiveDuration.OneWeek,
          message: {
            content: confession.content,
            components: [actionRow],
            embeds: [
              confessionMessages(
                confessionType.userInfoConfession, 
                bodyEmbed
              )
            ]
          },
        })
        const threadID = createdThread.id;
        // update confession on db
        const body = {
          reviewMessageID: confession.reviewMessageID,
          reviewedBy: interaction.user.id,
          reviewedAt: new Date(),
          status: confessionStatus.approved,
          threadID
        }
        await ConfessionService.saveOrUpdateConfession(body);
        if (message?.editable){
          message.edit({ 
            components: [], 
            embeds: [
              confessionMessages(
                confessionType.resolveAndRejectConfession, 
                { 
                  reviewer: interaction.user.id, 
                  title: messages.confessionReviewed,
                  userId: confession.author.id,
                  content: confession.content,
                  isResolve: true
                }
              )
            ],
            allowedMentions: { repliedUser: false }
          });
        }
        const author = await interaction.guild?.members.fetch(confession?.author?.id);
        await author?.send(`Confession của bạn đã được duyệt!`);
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

const rejectCfs = {
  name: 'rejectCfs',
  execute: async (interaction) => {
    try {
      const message = await interaction.channel?.messages.fetch(interaction.message.id);
      await connectDB();
      const confession = await ConfessionService.getConfessionById(interaction.message.id);
      console.log(confession);
      if (message?.editable){
        message.edit({ 
          components: [], 
          embeds: [
            confessionMessages(
              confessionType.resolveAndRejectConfession, 
              { 
                reviewer: interaction.user.id, 
                title: messages.confessionReviewedFailed,
                userId: confession.author.id,
                content: confession.content,
                isResolve: false
              }
            )
          ],
          allowedMentions: { repliedUser: false }
        });
      }
      const body = {
        id: confession.id,
        reviewMessageID: confession.reviewMessageID,
        reviewedBy: interaction.user.id,
        reviewedAt: new Date(),
        status: confessionStatus.rejected
      }
      await ConfessionService.saveOrUpdateConfession(body);
      const author = await interaction.guild?.members.fetch(confession.author.id);
      await author?.send(`Confession của bạn đã bị từ chối duyệt!`);
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

const resolveReply = {
  name: 'resolveReply',
  execute: async (interaction, threadId) => {
    try {
      const message = await interaction.channel?.messages.fetch(interaction.message.id);
      await connectDB();
      
      // fetch confession from db
      const confession = await ConfessionService.getConfessionByThreadId(threadId);
      const replies = confession.replies;
      const findItem = replies.find(item => item.reviewReplyID === interaction.message.id);
    
      const forumChannel = interaction.guild?.channels.cache.get(process.env.CONFESSION_CHANNEL || '');

      if (!forumChannel instanceof ForumChannel) {
        await interaction.reply({ content: 'Lỗi. Không thể duyệt reply', ephemeral: true });
        return;
      }
      const thread = forumChannel.threads.cache.get(threadId);
      if (!thread) {
        await interaction.reply({ content: 'Lỗi. Không thể duyệt reply', ephemeral: true });
        return
      } 
      const isOwner = findItem?.userIdReply === confession?.author?.id;
      await thread.send({
        embeds: [confessionMessages(confessionType.reply, {content: findItem.content, isOwner})]
      });
      if (!message?.editable) return;
      message.edit({ 
        components: [], 
        embeds: [
          confessionMessages(
            confessionType.resolveAndRejectReply, 
            {
              title: messages.replyResolve,
              userId: findItem.userIdReply,
              content: findItem.content,
              threadID: findItem.threadID,
              reviewer: interaction.user.id, 
              isResolve: true
            }
          )
        ],
        allowedMentions: { repliedUser: false }
      });
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

const rejectReply = {
  name: 'rejectReply',
  execute: async (interaction, threadId) => {
    try {
      const message = await interaction.channel?.messages.fetch(interaction.message.id);
      await connectDB();
      const confession = await ConfessionService.getConfessionByThreadId(threadId);
      const replies = confession.replies;
      const findItem = replies.find(item => item.reviewReplyID === interaction.message.id);
      if (!message?.editable) return;
      message.edit({ 
        components: [], 
        embeds: [
          confessionMessages(
            confessionType.resolveAndRejectReply, 
            {
              title: messages.reviewReject,
              userId: findItem.userIdReply,
              content: findItem.content,
              threadID: findItem.threadID,
              reviewer: interaction.user.id, 
              isResolve: false
            }
          )
        ],
        allowedMentions: { repliedUser: false }
      });
      const author = await interaction.guild?.members.fetch(findItem.userIdReply);
      if (!author) return;
      await author?.send(`Reply trên thread <#${findItem.threadID}> của bạn đã bị từ chối duyệt, có thể vì bạn đã phản hồi trái với quy tắc cộng đồng!!!!`);
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

module.exports = { resolveCfs, rejectCfs, resolveReply, rejectReply };