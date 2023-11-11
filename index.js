const { Client, GatewayIntentBits, ActivityType, Partials, Events } = require('discord.js');
const { SlashCommandBuilder } = require('@discordjs/builders');
const { REST }  = require('@discordjs/rest');
const { Routes } = require('discord-api-types/v9');

const dotenv = require('dotenv');
const { run } = require('./features/index');
const { UserService } = require('./services/user.service');
const { ActionEnum } = require('./models/quest.model');
dotenv.config();
process.env.TZ = 'Asia/Bangkok';

const client = new Client(
  { 
    intents: [
      GatewayIntentBits.Guilds,
      GatewayIntentBits.GuildMessages,
      GatewayIntentBits.GuildIntegrations,
      GatewayIntentBits.MessageContent,
      GatewayIntentBits.GuildMembers,
      GatewayIntentBits.GuildVoiceStates,
      GatewayIntentBits.DirectMessages,
      GatewayIntentBits.DirectMessageTyping,
      GatewayIntentBits.DirectMessageReactions
    ], 
    allowedMentions: { parse: ['roles'], repliedUser: false },
    partials: [Partials.Channel]
  }
);

const rest = new REST({ version: '10' }).setToken(process.env.TOKEN);

const commands = [
  new SlashCommandBuilder().setName('leudangky').setDescription('Lệnh để đăng ký sử dụng bot, cho người chưa sử dụng bot lần nào'),
  new SlashCommandBuilder().setName('leuinfo').setDescription('Lệnh để kiểm tra thông tin cá nhân của bạn'),
  new SlashCommandBuilder().setName('leutickets').setDescription('Lệnh kiểm tra số lượng Vé bạn đang có'),
  new SlashCommandBuilder().setName('leugive')
  .setDescription('Lệnh chuyển ticket cho ai đó')
  .addUserOption(
    option => option.setName('target')
    .setDescription('Nhập vào tên user muốn chuyển ticket')
    .setRequired(true)
  )
  .addNumberOption(
    option => option.setName('amount')
    .setDescription('Nhập vào số lương ticket')
    .setRequired(true)
  ),
  new SlashCommandBuilder().setName('leudaily').setDescription('Lệnh điểm danh hàng ngày, điểm danh để nhận vé xanh mỗi ngày'),
  new SlashCommandBuilder().setName('leuquest').setDescription('Lệnh hiện danh sách nhiệm vụ hằng ngày của bạn'),
  new SlashCommandBuilder().setName('leushop').setDescription('Hiển thị kênh shop của server, nơi bạn có thể mua các vật phẩm bằng số ticket cày được'),
  new SlashCommandBuilder().setName('leuthemban').setDescription('Thêm bạn').addUserOption(option => option.setName('target').setDescription('Chọn người bạn muốn kết bạn').setRequired(true)),
  new SlashCommandBuilder().setName('leuxoaban').setDescription('Xóa bạn').addUserOption(option => option.setName('target').setDescription('Chọn người bạn muốn xóa bạn').setRequired(true)),
  new SlashCommandBuilder().setName('leurela').setDescription(' Xem các tất cả mối quan hệ của bạn hoặc nhập vào một người để xem mối quan hệ với người đó').addUserOption(option => option.setName('target').setDescription('Chọn người bạn muốn xem mối quan hệ')),
  new SlashCommandBuilder().setName('leutangqua').setDescription('Tặng quà chon một người bạn')
  .addUserOption(
    option => option.setName('target')
    .setDescription('Chon nguời bạn muốn tặng')
    .setRequired(true)),
  // new SlashCommandBuilder().setName('setup-confession').setDescription('Setup confession. Chỉ có chủ server mới có quyền.'),
  new SlashCommandBuilder().setName('leuhelp').setDescription('Xem các chức năng hiện có của bot'),
  new SlashCommandBuilder().setName('leubag').setDescription('Xem các túi đồ của bạn'),
  new SlashCommandBuilder().setName('admin-add-role-shop').setDescription('Thêm role vào shop(Chỉ chủ server mới có quyền)')
    .addRoleOption(option => option.setName('role')
      .setDescription('Role')
      .setRequired(true)
    )
    .addStringOption(option => option.setName('buff').
      setDescription('Chọn loại buff').
      setRequired(true).
      setChoices(
        {
          name: 'Buff vé xanh',
          value: 'silver_ticket'
        },
        {
          name: 'Buff vé vàng',
          value: 'gold_ticket'
        }
      )
    )
    .addStringOption(option => option.setName('value').
      setDescription('Số lượng buff đối với vé xanh sẽ là % và vé vàng là 2 số(ví dụ: 5-10)').
      setRequired(true)
    ).addNumberOption(option => option.setName('price_silver').
      setDescription('Giá ticket xanh trên shop').
      setRequired(true)
    ).addNumberOption(option => option.setName('price_gold').
      setDescription('Giá ticket vàng trên shop(có thể không set trường này nếu item này không cho mua bằng vé vàng)')
    ),
  new SlashCommandBuilder().setName('admin-add-role').setDescription('Thêm role buff daily(Chỉ chủ server mới có quyền)')
    .addRoleOption(option => option.setName('role')
      .setDescription('Role')
      .setRequired(true)
    )
    .addStringOption(option => option.setName('buff').
      setDescription('Chọn loại buff').
      setRequired(true).
      setChoices(
        {
          name: 'Buff vé xanh',
          value: 'silver_ticket'
        },
        {
          name: 'Buff vé vàng',
          value: 'gold_ticket'
        }
      )
    )
    .addStringOption(option => option.setName('value').
      setDescription('Số lượng buff đối với vé xanh sẽ là % và vé vàng là 2 số(ví dụ: 5-10)').
      setRequired(true)
    ),
  new SlashCommandBuilder().setName('admin-add-gift-quest').setDescription('Thêm hoặc chỉnh sửa % rate quà nhiệm vụ tuần(Chỉ chủ server mới có quyền)'),
  new SlashCommandBuilder().setName('admin-add-quest-shop').setDescription('Thêm quest item vào shop(Chỉ chủ server mới có quyền)')
    .addStringOption(option => option.setName('item')
      .setDescription('Emoji(dạng <:leu_ticket:1168509616938815650>). Sử dụng \\\:tênEmoji: để lấy được định dạng trên')
      .setRequired(true)
    )
    .addStringOption(option => option.setName('name')
      .setDescription('Tên quà vật phẩm')
      .setRequired(true)
    )
    .addBooleanOption(option => option.setName('reset_ticket')
      .setDescription('Có phải là vé reset quest')
      .setRequired(true)
    )
    .addNumberOption(option => option.setName('price_silver').
      setDescription('Giá ticket xanh trên shop').
      setRequired(true)
    ).addNumberOption(option => option.setName('price_gold').
    setDescription('Giá ticket vàng trên shop(có thể không set trường này nếu item này không cho mua bằng vé vàng)'),
    ),
  new SlashCommandBuilder().setName('admin-add-gift-shop').setDescription('Thêm gift vào shop(Chỉ chủ server mới có quyền)')
    .addStringOption(option => option.setName('gift')
      .setDescription('Emoji(dạng <:leu_ticket:1168509616938815650>). Sử dụng \\\:tênEmoji: để lấy được định dạng trên')
      .setRequired(true)
    )
    .addStringOption(option => option.setName('name')
      .setDescription('Tên quà tặng')
      .setRequired(true)
    )
    .addNumberOption(option => option.setName('value').
      setDescription('Số điểm thân thiết khi sử dụng').
      setRequired(true)
    ).addNumberOption(option => option.setName('price_silver').
      setDescription('Giá ticket xanh trên shop').
      setRequired(true)
    ).addNumberOption(option => option.setName('price_gold').
      setDescription('Giá ticket vàng trên shop(có thể không set trường này nếu item này không cho mua bằng vé vàng)')
    ),
  new SlashCommandBuilder().setName('admin-remove-item-shop').setDescription('Xóa item trong shop(Chỉ chủ server mới có quyền)'),
  new SlashCommandBuilder().setName('admin-remove-role').setDescription('Xóa role buff daily(Chỉ chủ server mới có quyền)'),
  new SlashCommandBuilder().setName('leubxh').setDescription('Xem bảng xếp hạng phú hộ và tặng quà')

].map(command => command.toJSON());

client.once(Events.ClientReady, async () => {
  try {
    await rest.put(Routes.applicationCommands(client.user.id), { body: commands });
    console.log('Successfully registered application commands.');
    client.user.setPresence({
      activities: [{ name: `sử dụng /leuhelp`, type: ActivityType.Playing }],
      status: 'online',
    });
  } catch (error) {
    console.error(error);
  }
});

client.login(process.env.TOKEN).then(() => {
  run(client);
});

client.on(Events.MessageCreate, async (message) => {
  try {
    if (process.env.MAINTENANCE === 'maintenance') return;
    const user = await UserService.getUserById(message.author.id);
    if (!user || !user.discordUserId) return;
    const quests = user.quests.dailyQuestsReceived.quests;
    const channel = message.channel.id;
    for(let quest of quests) {
      if (quest.action === ActionEnum.MESSAGE) {
        if (quest.placeChannel === '') {
          if (quest.progress < quest.completionCriteria) {
            quest.progress = quest.progress + 1;
          }
          continue;
        }
        if (quest.placeChannel === channel) {
          if (quest.progress < quest.completionCriteria) {
            quest.progress = quest.progress + 1;
          }
        }
        continue;
      }
      if (
        (quest.action === ActionEnum.REPLY_POST_BLOG ||
          quest.action === ActionEnum.REPLY_CONFESSION) &&
          message.channel.parentId === quest.placeChannel &&
          message.channel.isThread()
      ) {
        if (quest.progress < quest.completionCriteria) {
          quest.progress = quest.progress + 1;
        }
      }
    }
  
    const questsWeek = user.quests.weekQuestsReceived.quests;
    for(let quest of questsWeek) {
      if (quest.action === ActionEnum.MESSAGE) {
        if (quest.placeChannel === '') {
          if (quest.progress < quest.completionCriteria) {
            quest.progress = quest.progress + 1;
          }
          continue;
        }
        if (quest.placeChannel === channel) {
          if (quest.progress < quest.completionCriteria) {
            quest.progress = quest.progress + 1;
          }
        }
        continue;
      }
      if (
        (quest.action === ActionEnum.REPLY_POST_BLOG ||
          quest.action === ActionEnum.REPLY_CONFESSION) &&
          message.channel.parentId === quest.placeChannel &&
          message.channel.isThread()
      ) {
        if (quest.progress < quest.completionCriteria && message.channel.messages.cache.size > 1) {
          quest.progress = quest.progress + 1;
        }
      }
    }
  
    await UserService.updateUser(user);
  } catch (error) {
    console.log(error);    
  }
});

client.on(Events.ThreadCreate, async (thread) => {
  try {
    if (process.env.MAINTENANCE === 'maintenance') return;
    const user = await UserService.getUserById(thread.ownerId);
    if (!user || !user.discordUserId) return;

    const questToUpdate = user.quests.dailyQuestsReceived.quests.find(
      quest => (quest.action === ActionEnum.POST_CONFESSION ||
      quest.action === ActionEnum.POST_BLOG) && 
      thread.parentId === quest.placeChannel
    );

    if (questToUpdate && questToUpdate.progress < questToUpdate.completionCriteria) {
      let newProgress = questToUpdate.progress + 1;
      await UserService.updateDailyQuest(thread.ownerId, questToUpdate.questId, newProgress);
    }

    const questToWeekUpdate = user.quests.weekQuestsReceived.quests.find(
      quest => (quest.action === ActionEnum.POST_CONFESSION ||
      quest.action === ActionEnum.POST_BLOG) && 
      thread.parentId === quest.placeChannel
    );

    if (questToWeekUpdate && questToWeekUpdate.progress < questToWeekUpdate.completionCriteria) {
      let newProgress = questToWeekUpdate.progress + 1;
      await UserService.updateWeekQuest(thread.ownerId, questToWeekUpdate.questId, newProgress);
    }
  } catch (error) {
    console.log(error);    
  }
})

client.on(Events.VoiceStateUpdate, async (oldState, newState) => {
  try {
    if (process.env.MAINTENANCE === 'maintenance') return;
    const userId = newState.member.user.id;
    const user = await UserService.getUserById(userId);
    if (!user || !user.discordUserId) return;
  
    if (oldState.channelId === null && newState.channelId) {
      user.joinVoiceDate = new Date();
      await UserService.updateUser(user);

    } else if (oldState.channelId && newState.channelId === null) {
      const dailyQuests = user.quests.dailyQuestsReceived.quests;
      const findDailyVoiceQuest = dailyQuests.findIndex(item => item.action === ActionEnum.VOICE);
      
      if (findDailyVoiceQuest !== -1) {
        const quest = user.quests.dailyQuestsReceived.quests[findDailyVoiceQuest];
        if (!user.joinVoiceDate) return;
        if (quest.progress < quest.completionCriteria) {
          const startTime = user.joinVoiceDate;
          const endTime = new Date();
          const durationInMilliseconds = endTime - startTime;
          const durationInHours = durationInMilliseconds / (1000 * 60 * 60);
          user.quests.dailyQuestsReceived.quests[findDailyVoiceQuest].progress += durationInHours;
        }
      };

      const weekQuests = user.quests.weekQuestsReceived.quests;
      const findWeekVoiceQuest = weekQuests.findIndex(item => item.action === ActionEnum.VOICE);
      if (findWeekVoiceQuest !== -1) {
        const quest = user.quests.weekQuestsReceived.quests[findWeekVoiceQuest];
        if (quest.progress < quest.completionCriteria) {
          const startTime = user.joinVoiceDate;
          const endTime = new Date();
          const durationInMilliseconds = endTime - startTime;
          const durationInHours = durationInMilliseconds / (1000 * 60 * 60);
          user.quests.weekQuestsReceived.quests[findWeekVoiceQuest].progress += durationInHours;
        }
      };

      user.joinVoiceDate = null;
     
      await UserService.updateUser(user);
    }
  } catch (error) {
    console.log(error);
  }
});

client.on(Events.GuildMemberUpdate, async (oldMember, newMember) => {
  try {
    if (process.env.MAINTENANCE === 'maintenance') return;
    const newStatus = newMember.premiumSince;
    if (newStatus) {
      const memberId = newMember.user.id;
      const user = await UserService.getUserById(memberId);
      if (!user || !user.discordUserId) return;
      
      const quests = user.quests.dailyQuestsReceived.quests;
      for(let quest of quests) {
        if(quest.action !== ActionEnum.BOOST_SERVER) {
          continue;
        }
        if (quest.progress < quest.completionCriteria) {
          quest.progress = quest.progress + 1;
        }
      }
  
      const questsWeek = user.quests.weekQuestsReceived.quests;
      for(let quest of questsWeek) {
        if(quest.action !== ActionEnum.BOOST_SERVER) {
          continue;
        }
        if (quest.progress < quest.completionCriteria) {
          quest.progress = quest.progress + 1;
        }
      }
      
      await UserService.updateUser(user);
    }
  } catch (error) {
    console.log(error);    
  }
})

