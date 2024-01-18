const { Client, GatewayIntentBits, ActivityType, Partials, Events } = require('discord.js');
const { SlashCommandBuilder } = require('@discordjs/builders');
const { REST }  = require('@discordjs/rest');
const { Routes } = require('discord-api-types/v9');

const dotenv = require('dotenv');
const { run } = require('./features/index');
const { UserService } = require('./services/user.service');
const { ActionEnum } = require('./models/quest.model');
const { QuestService } = require('./services/quest.service');
const cron = require('node-cron');
const { FriendService } = require('./services/friend.service');
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
    allowedMentions: { parse: ['roles', 'users'], repliedUser: false },
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
    new SlashCommandBuilder()
    .setName('admin-add-role-intimacy-shop')
    .setDescription('Thêm role vào shop thân mật(Chỉ chủ server mới có quyền)')
    .addRoleOption(option => option.setName('role')
      .setDescription('Role')
      .setRequired(true)
    )
    .addStringOption(option => option.setName('buff')
      .setDescription('Chọn loại buff')
      .setRequired(true)
      .setChoices(
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
    .addStringOption(option => option.setName('value')
      .setDescription('Số lượng buff đối với vé xanh sẽ là % và vé vàng là 2 số(ví dụ: 5-10)')
      .setRequired(true)
    )
    .addNumberOption(option => option.setName('point')
      .setDescription('Số điểm thân mật bán trên shop')
      .setRequired(true)
    )
    .addNumberOption(option => option.setName('silver_price')
      .setDescription('Số vé xanh bán trên shop')
      .setRequired(true)
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
  new SlashCommandBuilder().setName('admin-edit-gift-drop-rate').setDescription('Chỉnh sửa % rate quà nhiệm vụ tuần(Chỉ chủ server mới có quyền)'),
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
  new SlashCommandBuilder().setName('leubxh').setDescription('Xem bảng xếp hạng phú hộ, cặp đôi và độ chăm chỉ'),
  new SlashCommandBuilder().setName('admin-buff-ticket')
  .setDescription('Buff ticket(Chỉ chủ server mới có quyền)')
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
  new SlashCommandBuilder().setName('admin-buff-item')
  .setDescription('Buff vật phẩm(Chỉ chủ server mới có quyền)')
  .addUserOption(
    option => option.setName('target')
    .setDescription('Nhập vào tên user muốn chuyển ticket')
    .setRequired(true)
  ),
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
    console.error(error, '[apply command]');
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
    
    for(const quest of quests) {
      if (quest.action === ActionEnum.MESSAGE) {
        const channel = message.channel.id;
        await QuestService.updateProgressQuest(quest._id, channel);
        continue;
      }
      if (
        (quest.action === ActionEnum.REPLY_POST_BLOG ||
          quest.action === ActionEnum.REPLY_CONFESSION) &&
          message.channel.isThread()
      ) {
        const channel = message.channel.parentId;
        await QuestService.updateProgressQuest(quest._id, channel);
      }
    }
  
    const questsWeek = user.quests.weekQuestsReceived.quests;
    for(let quest of questsWeek) {
      if (quest.action === ActionEnum.MESSAGE) {
        const channel = message.channel.id;
        await QuestService.updateProgressQuest(quest._id, channel);
        continue;
      }
      if (
        (quest.action === ActionEnum.REPLY_POST_BLOG ||
          quest.action === ActionEnum.REPLY_CONFESSION) &&
          message.channel.isThread()
      ) {
        const channel = message.channel.parentId;
        await QuestService.updateProgressQuest(quest._id, channel);
      }
    }
  } catch (error) {
    console.log(error, '[update message, reply quest]');   
  }
});

client.on(Events.ThreadCreate, async (thread) => {
  try {
    if (process.env.MAINTENANCE === 'maintenance') return;
    const user = await UserService.getUserById(thread.ownerId);
    if (!user || !user.discordUserId) return;

    const questToUpdate = user.quests.dailyQuestsReceived.quests.find(
      quest => quest.action === ActionEnum.POST_BLOG
    );

    if (questToUpdate) {
      await QuestService.updateProgressQuest(questToUpdate._id, thread.parentId)
    }

    const questToWeekUpdate = user.quests.weekQuestsReceived.quests.find(
      quest => quest.action === ActionEnum.POST_BLOG
    );

    if (questToWeekUpdate) {
      await QuestService.updateProgressQuest(questToWeekUpdate._id, thread.parentId)
    }
  } catch (error) {
    console.log(error, '[update post quest]');    
  }
});

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
      
      const findDailyVoiceQuest = user.quests.dailyQuestsReceived.quests.find(item => item.action === ActionEnum.VOICE);
      if (findDailyVoiceQuest) {
        if (!user.joinVoiceDate) return;
        const startTime = user.joinVoiceDate;
        const endTime = new Date();
        const durationInMilliseconds = endTime - startTime;
        const durationInHours = durationInMilliseconds / (1000 * 60 * 60);
        await QuestService.updateProgressVoiceQuest(findDailyVoiceQuest._id, durationInHours);
      };

      const findWeekVoiceQuest = user.quests.weekQuestsReceived.quests.find(item => item.action === ActionEnum.VOICE);
      if (findWeekVoiceQuest) {
        if (!user.joinVoiceDate) return;
        const startTime = user.joinVoiceDate;
        const endTime = new Date();
        const durationInMilliseconds = endTime - startTime;
        const durationInHours = durationInMilliseconds / (1000 * 60 * 60);
        await QuestService.updateProgressVoiceQuest(findWeekVoiceQuest._id, durationInHours);
      };

      user.joinVoiceDate = null;
     
      await UserService.updateUser(user);
    }
  } catch (error) {
    console.log(error, '[update voice quest]');   
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

      const quests = user.quests.dailyQuestsReceived.quests.find(item => item.action === ActionEnum.BOOST_SERVER);
      if (quests) {
        await QuestService.updateProgressQuest(quests._id, '');
      }
  
      const questsWeek = user.quests.weekQuestsReceived.quests.find(item => item.action === ActionEnum.BOOST_SERVER);
      if (questsWeek) {
        await QuestService.updateProgressQuest(quests._id, '');
      }
    }
  } catch (error) {
    console.log(error, '[update boost quest]');   
  }
});

const updateTop = async () => {
  try {
    
    const guild = client.guilds.cache.get(process.env.GUILD_ID);
    if (!guild || !guild.id) return;

    const topFarmRoleId = process.env.TOP_FARM_ROLE;
    const topTicketRoleId = process.env.TOP_TICKET_ROLE;
    const topCoupleRoleId = process.env.TOP_COUPLE_ROLE;
    const topQuestRoleId = process.env.TOP_QUEST_ROLE;

    const topFarmRole = guild.roles.cache.get(topFarmRoleId);
    const topTicketRole = guild.roles.cache.get(topTicketRoleId);
    const topCoupleRole = guild.roles.cache.get(topCoupleRoleId);
    const topQuestRole = guild.roles.cache.get(topQuestRoleId);
    
    if (!topTicketRole || !topFarmRole || !topCoupleRole || !topQuestRole) return;

    await guild.members.fetch({ withRoles: [topTicketRole] });
    const ticketMembers = Array.from(topTicketRole.members.values());

    await guild.members.fetch({ withRoles: [topFarmRole] });
    const farmMembers = Array.from(topFarmRole.members.values());

    await guild.members.fetch({ withRoles: [topCoupleRole] });
    const coupleMembers = Array.from(topCoupleRole.members.values());

    await guild.members.fetch({ withRoles: [topQuestRole] });
    const questMembers = Array.from(topQuestRole.members.values());

    const friendsList = await FriendService.getAllFriends();
    const silver = [];
    const golden = [];
    const completeQuest = [];
    const farm = [];
    const users = await UserService.getAllUser();
  
    users.forEach(user => {
      silver.push({
        discordUserId: user.discordUserId,
        quantity: user.tickets.silver,
      });
      golden.push({
        discordUserId: user.discordUserId,
        quantity: user.tickets.gold,
      });
      completeQuest.push({
        discordUserId: user.discordUserId,
        quantity: user.totalQuestCompleted,
      })
      farm.push({
        discordUserId: user.discordUserId,
        quantity: user.farm.exp,
      })
    });
    
    const topSilver = silver.sort((a, b) => b.quantity - a.quantity)[0];
    const topGolden = golden.sort((a, b) => b.quantity - a.quantity)[0];
    const topCompleteQuest = completeQuest.sort((a, b) => b.quantity - a.quantity)[0];
    const topFriends = friendsList.sort((a, b) => b.intimacyPoints - a.intimacyPoints)[0];
    const topFarm = farm.sort((a, b) => b.quantity - a.quantity)[0];

    if (!farmMembers.length || topFarm.discordUserId !== farmMembers[0].user.id) {
      const removeRoleUser = await guild.members.fetch(farmMembers[0]?.user?.id);
      const addRoleUser = await guild.members.fetch(topFarm.discordUserId);
      removeRoleUser?.roles?.remove(topFarmRole);
      addRoleUser?.roles?.add(topFarmRole);
    }

    for(const member of ticketMembers) {
      const removeRoleUser = await guild.members.fetch(member?.user?.id);
      removeRoleUser?.roles?.remove(topTicketRole);
    }

    if (topSilver) {
      const addRoleUser = await guild.members.fetch(topSilver.discordUserId);
      addRoleUser?.roles?.add(topTicketRole);
    }

    if(topGolden) {
      const addRoleUser = await guild.members.fetch(topGolden.discordUserId);
      addRoleUser?.roles?.add(topTicketRole);
    }

    for(const member of coupleMembers) {
      const removeRoleUser = await guild.members.fetch(member?.user?.id);
      removeRoleUser?.roles?.remove(topCoupleRole);
    }

    if (topFriends) {
      const addRoleUserFirst = await guild.members.fetch(topFriends.discordIdFirst);
      addRoleUserFirst?.roles?.add(topCoupleRole);
      const addRoleUserLast = await guild.members.fetch(topFriends.discordIdLast);
      addRoleUserLast?.roles?.add(topCoupleRole);
    }

    if (!questMembers.length || topCompleteQuest.discordUserId !== questMembers[0].user.id) {
      const removeRoleUser = await guild.members.fetch(questMembers[0]?.user?.id);
      const addRoleUser = await guild.members.fetch(topCompleteQuest.discordUserId);
      removeRoleUser?.roles?.remove(topQuestRole);
      addRoleUser?.roles?.add(topQuestRole);
    }

    console.log('Updated all top role');

  } catch (error) {
    console.log(error);
  }  
}

cron.schedule('0 0 * * *', async () => {
  await updateTop();
});

