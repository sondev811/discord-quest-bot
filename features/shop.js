const { RewardEnum } = require("../models/quest.model");
const { ShopItemEnum } = require("../models/shopItem.model");
const { ShopService } = require("../services/shop.service");
const { UserService } = require("../services/user.service");
const { createNormalMessage } = require("../messages/normalMessage");
const messages = require("../constants/messages");
const connectDB = require("../DB/connection");
const { createShopMessage } = require("../messages/shopMessage");
const { shopActionType, purchaseQuantity, currency } = require("../constants/general");
const { StringSelectMenuBuilder, StringSelectMenuOptionBuilder, ButtonBuilder, ActionRowBuilder, SelectMenuBuilder } = require("@discordjs/builders");
const { ButtonStyle, ComponentType } = require("discord.js");
const { cloneDeep, handleEmoji } = require("../utils");
connectDB();

const filterItem = (items) => {
  const gifts = items.filter(item => item.type === ShopItemEnum.GIFT);
  const roles = items.filter(item => item.type === ShopItemEnum.ROLE);
  const questItem = items.filter(item => item.type === ShopItemEnum.QUEST);
  return { gifts, roles, questItem };
}

const purchaseGiftBtn = () => {
  const silverTicket = {
    id: '1168509616938815650',
    name: 'leu_ticket'
  };
  const goldTicket = {
    id: '1169279388370604062',
    name: 'leu_ticket_vang'
  };
  const buyOneSilver = new ButtonBuilder()
    .setCustomId('buyOne:silver')
    .setLabel('Mua x1')
    .setStyle(ButtonStyle.Primary).setEmoji(silverTicket);

  const buyFiveSilver = new ButtonBuilder()
    .setCustomId('buyFive:silver')
    .setLabel('Mua x5')
    .setStyle(ButtonStyle.Primary).setEmoji(silverTicket);

  const buyTenSilver = new ButtonBuilder()
    .setCustomId('buyTen:silver')
    .setLabel('Mua x10')
    .setStyle(ButtonStyle.Primary).setEmoji(silverTicket);

  const buyFiftySilver = new ButtonBuilder()
    .setCustomId('buyFifty:silver')
    .setLabel('Mua x50')
    .setStyle(ButtonStyle.Primary).setEmoji(silverTicket);

  const buyOneGold = new ButtonBuilder()
    .setCustomId('buyOne:gold')
    .setLabel('Mua x1')
    .setStyle(ButtonStyle.Primary).setEmoji(goldTicket);

  const buyFiveGold = new ButtonBuilder()
    .setCustomId('buyFive:gold')
    .setLabel('Mua x5')
    .setStyle(ButtonStyle.Primary).setEmoji(goldTicket);

  const buyTenGold = new ButtonBuilder()
    .setCustomId('buyTen:gold')
    .setLabel('Mua x10')
    .setStyle(ButtonStyle.Primary).setEmoji(goldTicket);

  const buyFiftyGold = new ButtonBuilder()
    .setCustomId('buyFifty:gold')
    .setLabel('Mua x50')
    .setStyle(ButtonStyle.Primary).setEmoji(goldTicket);

  const rowPurchaseSilver = new ActionRowBuilder().addComponents([buyOneSilver, buyFiveSilver, buyTenSilver, buyFiftySilver]);
  const rowPurchaseGold = new ActionRowBuilder().addComponents([buyOneGold, buyFiveGold, buyTenGold, buyFiftyGold]);
  
  return { rowPurchaseSilver, rowPurchaseGold };
}

const purchaseRoleBtn = (isPurchaseByGold = false) => {
  const silverTicket = {
    id: '1168509616938815650',
    name: 'leu_ticket'
  };
  const goldTicket = {
    id: '1169279388370604062',
    name: 'leu_ticket_vang'
  };
  const buyOneSilver = new ButtonBuilder()
    .setCustomId('buyRoleSilver')
    .setLabel('Mua')
    .setStyle(ButtonStyle.Primary).setEmoji(silverTicket);

  const buyOneGold = new ButtonBuilder()
    .setCustomId('buyRoleGold')
    .setLabel('Mua')
    .setStyle(ButtonStyle.Primary).setEmoji(goldTicket);

  const rowPurchase = new ActionRowBuilder().addComponents([buyOneSilver]);
  if (isPurchaseByGold) {
    rowPurchase.push(buyOneGold)
  }
  return { rowPurchase };
}

const purchaseQuestItemBtn = () => {
  const silverTicket = {
    id: '1168509616938815650',
    name: 'leu_ticket'
  };
  const goldTicket = {
    id: '1169279388370604062',
    name: 'leu_ticket_vang'
  };
  const buyOneSilver = new ButtonBuilder()
    .setCustomId('buyQuestItemSilver')
    .setLabel('Mua')
    .setStyle(ButtonStyle.Primary).setEmoji(silverTicket);

  const buyOneGold = new ButtonBuilder()
    .setCustomId('buyQuestItemGold')
    .setLabel('Mua')
    .setStyle(ButtonStyle.Primary).setEmoji(goldTicket);

  const rowPurchase = new ActionRowBuilder().addComponents([buyOneSilver, buyOneGold]);
  
  return { rowPurchase };
}

let shopChosen = null;

const giftShop = async (interaction, reply, gifts, beforeSelect, user) => {
  const select = new StringSelectMenuBuilder().setCustomId('shopGiftChoose').setPlaceholder('Chọn món quà')
  for (const item of gifts) {
    select.addOptions(
      new StringSelectMenuOptionBuilder()
        .setLabel(item.name)
        .setDescription(item.description)
        .setValue(item.id + '')
        .setEmoji(handleEmoji(item.giftEmoji))
    );
  }
  const embeds = createShopMessage(shopActionType.getGiftShop, { gifts, silver: user.tickets.silver, gold: user.tickets.gold });

  const rowBeforeSelect = new ActionRowBuilder().addComponents(beforeSelect)

  const rowSelect = new ActionRowBuilder().addComponents(select);

  await reply.edit({
    embeds: [embeds],
    components: [rowSelect, rowBeforeSelect]
  });

  const giftShopCollection = reply.createMessageComponentCollector({
    componentType: ComponentType.StringSelect,
    filter: (i) => i.user.id === interaction.user.id && i.customId === 'shopGiftChoose',
    time: 300000
  });

  giftShopCollection.on('collect', async (interaction) => {
    try {
      await interaction.deferUpdate();
      const [value] = interaction.values;
      const gift = gifts.find(item => item.id === parseInt(value));
      shopChosen = gift;
      const { rowPurchaseSilver, rowPurchaseGold } = purchaseGiftBtn();
      const { giftEmoji, name, priceSilver, priceGold, description } = gift;
      await reply.edit({
        embeds: [createShopMessage(shopActionType.getDetailGift, { giftEmoji, name, priceSilver, priceGold, description, silver: user.tickets.silver, gold: user.tickets.gold })],
        components: [rowPurchaseSilver, rowPurchaseGold, rowBeforeSelect]
      });
    } catch (error) {
      console.log(error);
    }
  });
}

const roleShop = async (interaction, reply, roles, beforeSelect, user) => {
  const select = new StringSelectMenuBuilder().setCustomId('shopRoleChoose').setPlaceholder('Chọn role muốn mua')
  for (const item of roles) {
    select.addOptions(
      new StringSelectMenuOptionBuilder()
        .setLabel(item.name)
        .setDescription(item.description)
        .setValue(item.id + '')
    );
  }

  const embeds = createShopMessage(shopActionType.getRoleShop, { roles, silver: user.tickets.silver, gold: user.tickets.gold });

  const rowBeforeSelect = new ActionRowBuilder().addComponents(beforeSelect)

  const rowSelect = new ActionRowBuilder().addComponents(select);

  await reply.edit({
    embeds: [embeds],
    components: [rowSelect, rowBeforeSelect]
  });

  const roleShopCollection = reply.createMessageComponentCollector({
    componentType: ComponentType.StringSelect,
    filter: (i) => i.user.id === interaction.user.id && i.customId === 'shopRoleChoose',
    time: 300000
  });

  roleShopCollection.on('collect', async (interaction) => {
    try {
      await interaction.deferUpdate();
      const [value] = interaction.values;
      const role = roles.find(item => item.id === parseInt(value));
      if (!role || !role.id) return;
      shopChosen = role;
      const { rowPurchase } = purchaseRoleBtn(role.priceGold !== null);
      const { roleId, priceSilver, priceGold, description } = role;
      await reply.edit({
        embeds: [createShopMessage(shopActionType.getDetailRole, { roleId, priceSilver, priceGold, description, silver: user.tickets.silver, gold: user.tickets.gold })],
        components: [rowPurchase, rowBeforeSelect]
      });
    } catch (error) {
      console.log(error);
    }
  });
}

const progressGiftPurchase = async (quantity, user, shopReply, type, shopChosen) => {
  const value = purchaseQuantity[quantity];
  const priceUsing = type === currency.silver ? shopChosen.priceSilver : shopChosen.priceGold;
  const userPriceUsing = type === currency.silver ? user.tickets.silver : user.tickets.gold;
  
  let total = value * priceUsing;
  if (type === currency.silver) {
    total = total + ((total * 5) / 100);
  }

  if (userPriceUsing < total) {
    await shopReply.edit({
      embeds: [createNormalMessage(messages.insufficientBalance(
        shopChosen.giftEmoji, 
        value, 
        shopChosen.name, 
        total,
        type === currency.silver ? '<:leu_ticket:1168509616938815650>' : '<:leu_ticket_vang:1169279388370604062>',
        type
      ))]
    })
    return;
  }

  if (type === currency.silver) {
    user.tickets.silver -= total;
  } else {
    user.tickets.gold -= total;
  }

  const itemExistOnBag = user.itemBag.findIndex(item => item.id === shopChosen.id);

  if (itemExistOnBag === -1) {
    const itemToAdd = {
      id: shopChosen.id,
      name: shopChosen.name,
      description: shopChosen.description,
      type: shopChosen.type,
      intimacyPoints: shopChosen.intimacyPoints,
      giftEmoji: shopChosen.giftEmoji,
      quantity: value
    } 
    user.itemBag.push(itemToAdd);
  } else {
    user.itemBag[itemExistOnBag].quantity += value;
  }

  const updatedBalanceAndItem = await UserService.updateUser(user);
  if (!updatedBalanceAndItem) {
    await shopReply.edit({
      embeds: [createNormalMessage(messages.errorPurchase)]
    });
    return;
  }
  await shopReply.edit({
    embeds: [createShopMessage(shopActionType.purchaseSuccess, 
      {
        giftEmoji: shopChosen.giftEmoji,
        name: shopChosen.name,
        price: priceUsing,
        type,
        quantity: value,
        total,
        silver: updatedBalanceAndItem.tickets.silver,
        gold: updatedBalanceAndItem.tickets.gold
      }
    )],
    components: []
  });
}

const progressRolePurchase = async (interaction, user, shopReply, type, shopChosen) => {
  const priceUsing = type === 'buyRoleSilver' ? shopChosen.priceSilver : shopChosen.priceGold;
  const userPriceUsing = type === 'buyRoleSilver' ? user.tickets.silver : user.tickets.gold;

  let total = priceUsing;
  if (type === 'buyRoleSilver') {
    total = total + ((total * 5) / 100);
  }
  const bag = user.itemBag;
  const findIndex = bag.findIndex(item => item.id === shopChosen.id);
  if(findIndex !== -1) {
    await shopReply.edit({
      embeds: [createNormalMessage(messages.existRoleOnBag)],
      components: []
    })
    return;
  }

  if (userPriceUsing < total) {
    await shopReply.edit({
      embeds: [createNormalMessage(messages.insufficientBalanceRole(
        shopChosen.roleId, 
        total,
        type === 'buyRoleSilver' ? '<:leu_ticket:1168509616938815650>' : '<:leu_ticket_vang:1169279388370604062>',
        type
      ))]
    })
    return;
  }
  if (type === 'buyRoleSilver') {
    user.tickets.silver -= total;
  } else {
    user.tickets.gold -= total;
  }
  const itemToAdd = {
    id: shopChosen.id,
    name: shopChosen.name,
    description: shopChosen.description,
    type: shopChosen.type,
    quantity: 1,
    roleId: shopChosen.roleId,
    typeBuff: shopChosen.typeBuff,
    valueBuff: shopChosen.valueBuff
  };
  user.itemBag.push(itemToAdd);
  
  const member = interaction.guild.members.cache.get(interaction.user.id);
  const role = interaction.guild.roles.cache.get(shopChosen.roleId);

  if (role) {
    await member.roles.add(role);
  }

  const updatedBalanceAndItem = await UserService.updateUser(user);
  if (!updatedBalanceAndItem) {
    await shopReply.edit({
      embeds: [createNormalMessage(messages.errorPurchase)]
    });
    return;
  }
  await shopReply.edit({
    embeds: [createShopMessage(shopActionType.purchaseSuccess, 
      {
        giftEmoji: '',
        name: `<@&${shopChosen.roleId}>`,
        price: priceUsing,
        type,
        quantity: 1,
        total,
        silver: updatedBalanceAndItem.tickets.silver,
        gold: updatedBalanceAndItem.tickets.gold
      }
    )],
    components: []
  });
}

const progressQuestItemPurchase = async (user, shopReply, type, shopChosen) => {
  const priceUsing = type === 'buyQuestItemSilver' ? shopChosen.priceSilver : shopChosen.priceGold;
  const userPriceUsing = type === 'buyQuestItemSilver' ? user.tickets.silver : user.tickets.gold;

  let total = priceUsing;
  if (type === 'buyQuestItemSilver') {
    total = total + ((total * 5) / 100);
  }
 
  if (userPriceUsing < total) {
    await shopReply.edit({
      embeds: [createNormalMessage(messages.insufficientBalance(
        shopChosen.giftEmoji, 
        1,
        shopChosen.name,
        total,
        type === 'buyQuestItemSilver' ? '<:leu_ticket:1168509616938815650>' : '<:leu_ticket_vang:1169279388370604062>',
        type === 'buyQuestItemSilver' ? 'silver' : 'gold'
      ))]
    })
    return;
  }

  if (type === 'buyQuestItemSilver') {
    user.tickets.silver -= total;
  } else {
    user.tickets.gold -= total;
  }

  const itemExistOnBag = user.itemBag.findIndex(item => item.id === shopChosen.id);

  if (itemExistOnBag === -1) {
    const itemToAdd = {
      id: shopChosen.id,
      name: shopChosen.name,
      description: shopChosen.description,
      type: shopChosen.type,
      intimacyPoints: shopChosen.intimacyPoints,
      giftEmoji: shopChosen.giftEmoji,
      quantity: 1,
      valueBuff: shopChosen.valueBuff ? shopChosen.valueBuff : ''
    } 
    user.itemBag.push(itemToAdd);
  } else {
    user.itemBag[itemExistOnBag].quantity += 1;
  }

  const updatedBalanceAndItem = await UserService.updateUser(user);
  if (!updatedBalanceAndItem) {
    await shopReply.edit({
      embeds: [createNormalMessage(messages.errorPurchase)]
    });
    return;
  }
  await shopReply.edit({
    embeds: [createShopMessage(shopActionType.purchaseSuccess, 
      {
        giftEmoji: shopChosen.giftEmoji,
        name: shopChosen.name,
        price: priceUsing,
        type,
        quantity: 1,
        total,
        silver: updatedBalanceAndItem.tickets.silver,
        gold: updatedBalanceAndItem.tickets.gold
      }
    )],
    components: []
  });
}

const questShop = async (interaction, reply, questItem, beforeSelect, user) => {
  const select = new StringSelectMenuBuilder().setCustomId('shopQuestChoose').setPlaceholder('Chọn vật phẩm muốn mua')
  for (const item of questItem) {
    select.addOptions(
      new StringSelectMenuOptionBuilder()
        .setLabel(item.name)
        .setDescription(item.description)
        .setValue(item.id + '')
        .setEmoji(handleEmoji(item.giftEmoji))
    );
  }

  const embeds = createShopMessage(shopActionType.getQuestShop, { questItem, silver: user.tickets.silver, gold: user.tickets.gold });

  const rowBeforeSelect = new ActionRowBuilder().addComponents(beforeSelect)

  const rowSelect = new ActionRowBuilder().addComponents(select);

  await reply.edit({
    embeds: [embeds],
    components: [rowSelect, rowBeforeSelect]
  });

  const questShopCollection = reply.createMessageComponentCollector({
    componentType: ComponentType.StringSelect,
    filter: (i) => i.user.id === interaction.user.id && i.customId === 'shopQuestChoose',
    time: 300000
  });

  questShopCollection.on('collect', async (interaction) => {
    try {
      await interaction.deferUpdate();
      const [value] = interaction.values;
      const item = questItem.find(item => item.id === parseInt(value));
      shopChosen = item;
      const { rowPurchase } = purchaseQuestItemBtn();
      const { giftEmoji, name, priceSilver, priceGold, description } = item;
      await reply.edit({
        embeds: [createShopMessage(shopActionType.getDetailGift, { giftEmoji, name, priceSilver, priceGold, description, silver: user.tickets.silver, gold: user.tickets.gold })],
        components: [rowPurchase, rowBeforeSelect]
      });
    } catch (error) {
      console.log(error);
    }
  });
}

const reply = async (interaction) => {
  const userId = interaction.user.id;
  const user = await UserService.getUserById(userId);
  if (!user || !user.discordUserId) {
    await interaction.followUp({ embeds: [createNormalMessage(messages.unreadyRegisterBot)] });
    return;
  }
  const items = await ShopService.getAllShop();
  const { gifts, roles, questItem } = filterItem(items);

  const select = new StringSelectMenuBuilder()
    .setCustomId('shopType')
    .setPlaceholder('Chọn loại cửa hàng')
    .addOptions(
      new StringSelectMenuOptionBuilder()
        .setLabel('Cửa hàng quà tặng')
        .setDescription('Bán các món quà tặng bạn bè')
        .setValue('giftsShop')
    )
    .addOptions(
      new StringSelectMenuOptionBuilder()
        .setLabel('Cửa hàng role')
        .setDescription('Bán các loại role')
        .setValue('rolesShop')
    ).addOptions(
      new StringSelectMenuOptionBuilder()
        .setLabel('Cửa hàng nhiệm vụ')
        .setDescription('Bán các vật phẩm làm nhiệm vụ và vé làm mới nhiệm vụ')
        .setValue('questShop')
    );

  const rowSelect = new ActionRowBuilder()
    .addComponents(select);

  const shopReply = await interaction.followUp({
    embeds: [createShopMessage(shopActionType.getShop, user.tickets)],
    components: [rowSelect]
  });

  const selectCollector = shopReply.createMessageComponentCollector({
    componentType: ComponentType.StringSelect,
    filter: (i) => i.user.id === interaction.user.id && i.customId === 'shopType',
    time: 300000
  });

  selectCollector.on('collect', async (interaction) => {
    try {
      await interaction.deferUpdate();
      const [value] = interaction.values;
      if (value === 'giftsShop') {
        giftShop(interaction, shopReply, gifts, select, user);
        return;
      } 
      if (value === 'rolesShop') {
        roleShop(interaction, shopReply, roles, select, user);
        return;
      } 

      questShop(interaction, shopReply, questItem, select, user)
      
    } catch (error) {
      console.log(error);
    }
  });

  const btnCollection = shopReply.createMessageComponentCollector({
    componentType: ComponentType.Button,
    filter: (i) => 
        i.user.id === interaction.user.id && (
          i.customId === 'buyOne:silver' || i.customId === 'buyFive:silver' ||
          i.customId === 'buyTen:silver' || i.customId === 'buyFifty:silver' || 
          i.customId === 'buyOne:gold' || i.customId === 'buyFive:gold' ||
          i.customId === 'buyTen:gold' || i.customId === 'buyFifty:gold' ||
          i.customId === 'buyRoleSilver' || i.customId === 'buyRoleGold' ||
          i.customId === 'buyQuestItemSilver' || i.customId === 'buyQuestItemGold'
        ),
        time: 300000
  });

  btnCollection.on('collect', async (interaction) => {
    try {
      await interaction.deferUpdate();
      const customId = interaction.customId;
      const [quantity, type] = customId.split(':');
      if(type) {
        progressGiftPurchase(quantity, user, shopReply, type, shopChosen);
        return;
      }
      if (quantity === 'buyQuestItemSilver' || quantity === 'buyQuestItemGold') {
        progressQuestItemPurchase(user, shopReply, quantity, shopChosen);
        return;
      }
      progressRolePurchase(interaction, user, shopReply, quantity, shopChosen);
    } catch (error) {
      console.log(error);      
    }
  })
}

const shop = {
  name: 'leushop',
  execute: async (interaction) => {
    try {
      if (!interaction) {
        return;
      }
      await interaction.deferReply();
      reply(interaction);
    } catch (error) {
      console.log(error, '[shop]');      
    }
  }
}

const handleRoleDescription = (buff, valueBuff) => {
  return `nhận thêm ${ buff === RewardEnum.SILVER_TICKET ? `${valueBuff}% vé xanh khi điểm danh hằng ngày` : `${valueBuff} số vé vàng khi điểm danh hằng ngày`}`
}

const handleGiftDescription = (name, intimacyPoints) => {
  return `Tặng ${name} sẽ nhận được ${intimacyPoints} điểm thân thiết.`
}

const handleQuestDescription = (name, isResetTicket) => {
  return `${name} sử dụng để ${isResetTicket ? `làm mới nhiệm vụ ngày.`:`trả nhiệm vụ.`}`;
}

const addRoleShop = {
  name: 'admin-add-role-shop',
  execute: async (interaction) => {
    try {
      if (!interaction) return;
      await interaction.deferReply();
      if(interaction.user.id !== process.env.OWNER_ID && 
        interaction.user.id !== process.env.DEVELOPER) {
          await interaction.followUp({
            embeds: [createNormalMessage(messages.notPermission)]
          });
          return;
      }
      const role = interaction.options.getRole('role');
      const typeBuff = interaction.options.getString('buff');
      const valueBuff = interaction.options.getString('value');
      const priceSilver = interaction.options.getNumber('price_silver');
      const priceGold = interaction.options.getNumber('price_gold');
      const body = {
        name: role.name,
        roleId: role.id,
        priceSilver,
        priceGold,
        type: ShopItemEnum.ROLE,
        description: handleRoleDescription(typeBuff, valueBuff),
        typeBuff,
        valueBuff,
      }
      const res = await ShopService.addItemToShop(body);
      if (!res) {
        await interaction.followUp({
          embeds: [createNormalMessage(messages.addRoleToShopError)]
        })
        return;
      }
      await interaction.followUp({
        embeds: [createNormalMessage(
          messages.addRoleToShopSuccess(role.id, handleRoleDescription(typeBuff, valueBuff), priceSilver, priceGold))]
      })
    } catch (error) {
      console.log(error, '[admin-add-role-shop]');
    }
  }
}

const addGiftShop = {
  name: 'admin-add-gift-shop',
  execute: async (interaction) => {
    try {
      if (!interaction) return;
      await interaction.deferReply();
      if(interaction.user.id !== process.env.OWNER_ID && 
        interaction.user.id !== process.env.DEVELOPER) {
          await interaction.followUp({
            embeds: [createNormalMessage(messages.notPermission)]
          });
          return;
      }
      const giftEmoji = interaction.options.getString('gift');
      const name = interaction.options.getString('name');
      const intimacyPoints = interaction.options.getNumber('value');
      const priceSilver = interaction.options.getNumber('price_silver');
      const priceGold = interaction.options.getNumber('price_gold');
      const body = {
        name,
        priceSilver,
        priceGold,
        type: ShopItemEnum.GIFT,
        intimacyPoints,
        giftEmoji,
        description: handleGiftDescription(name, intimacyPoints)
      }
      const res = await ShopService.addItemToShop(body);
      if (!res) {
        await interaction.followUp({
          embeds: [createNormalMessage(messages.addGiftToShopError)]
        })
        return;
      }
      await interaction.followUp({
        embeds: [createNormalMessage(
          messages.addGiftToShopSuccess(giftEmoji, intimacyPoints, priceSilver, priceGold))]
      })
    } catch (error) {
      console.log(error, '[admin-add-gift-shop]');
    }
  }
}

const addQuestShop = {
  name: 'admin-add-quest-shop',
  execute: async (interaction) => {
    try {
      if (!interaction) return;
      await interaction.deferReply();
      if(interaction.user.id !== process.env.OWNER_ID &&
        interaction.user.id !== process.env.DEVELOPER) {
          await interaction.followUp({
            embeds: [createNormalMessage(messages.notPermission)]
          });
          return;
      }
      const giftEmoji = interaction.options.getString('item');
      const name = interaction.options.getString('name');
      const priceSilver = interaction.options.getNumber('price_silver');
      const priceGold = interaction.options.getNumber('price_gold');
      const isResetTicket = interaction.options.getBoolean('reset_ticket');
      const body = {
        name,
        priceSilver,
        priceGold,
        type: ShopItemEnum.QUEST,
        giftEmoji,
        description: handleQuestDescription(name, isResetTicket),
        valueBuff: isResetTicket ? RewardEnum.QUEST_RESET : ''
      }
      const res = await ShopService.addItemToShop(body);
      if (!res) {
        await interaction.followUp({
          embeds: [createNormalMessage(messages.addQuestItemToShopError)]
        })
        return;
      }
      await interaction.followUp({
        embeds: [createNormalMessage(
          messages.addQuestItemToShopSuccess(giftEmoji, priceSilver, priceGold))]
      })
    } catch (error) {
      console.log(error, '[admin-add-quest-shop]');
    }
  }
}

const removeGiftItem = async (interaction, reply, gifts, beforeSelect) => {
  try {
    const select = new StringSelectMenuBuilder()
        .setCustomId('giftRmItemChoose')
        .setPlaceholder('Chọn vật phẩm cần xóa')

    for (const item of gifts) {
      select.addOptions(
        new StringSelectMenuOptionBuilder()
          .setLabel(item.name)
          .setDescription(item.description)
          .setValue(item.id + '')
          .setEmoji(handleEmoji(item.giftEmoji))
      );
    }

    const row = new ActionRowBuilder().addComponents([select]);
    const rowBefore = new ActionRowBuilder().addComponents([beforeSelect]);
       
    await reply.edit({
      embeds: [createShopMessage(shopActionType.removeGift, { gifts })],
      components: [row, rowBefore]
    })
  } catch (error) {
    console.log(error);
  }
}

const removeRoleItem = async (interaction, reply, roles, beforeSelect) => {
  try {
    const select = new StringSelectMenuBuilder()
        .setCustomId('roleRmItemChoose')
        .setPlaceholder('Chọn role cần xóa')

    for (const item of roles) {
      select.addOptions(
        new StringSelectMenuOptionBuilder()
          .setLabel(item.name)
          .setDescription(item.description)
          .setValue(item.id + '')
      );
    }

    const row = new ActionRowBuilder().addComponents([select]);
    const rowBefore = new ActionRowBuilder().addComponents([beforeSelect]);
       
    await reply.edit({
      embeds: [createShopMessage(shopActionType.removeRole, { roles })],
      components: [row, rowBefore]
    })
  } catch (error) {
    console.log(error);
  }
}

const removeQuestItem = async (interaction, reply, quests, beforeSelect) => {
  try {
    const select = new StringSelectMenuBuilder()
        .setCustomId('questRmItemChoose')
        .setPlaceholder('Chọn item quest cần xóa')

    for (const item of quests) {
      select.addOptions(
        new StringSelectMenuOptionBuilder()
          .setLabel(item.name)
          .setDescription(item.description)
          .setValue(item.id + '')
          .setEmoji(handleEmoji(item.giftEmoji))
      );
    }

    const row = new ActionRowBuilder().addComponents([select]);
    const rowBefore = new ActionRowBuilder().addComponents([beforeSelect]);
       
    await reply.edit({
      embeds: [createShopMessage(shopActionType.removeQuest, { quests })],
      components: [row, rowBefore]
    })
  } catch (error) {
    console.log(error);
  }
}

const removeItemShop = {
  name: 'admin-remove-item-shop',
  execute: async (interaction) => {
    try {
      if (!interaction) return;
      await interaction.deferReply();
      if(interaction.user.id !== process.env.OWNER_ID && 
        interaction.user.id !== process.env.DEVELOPER) {
          await interaction.followUp({
            embeds: [createNormalMessage(messages.notPermission)]
          });
          return;
      }
      const select = new StringSelectMenuBuilder()
        .setCustomId('rmItemChoose')
        .setPlaceholder('Chọn shop cần xóa vật phẩm')
        .addOptions(
          new StringSelectMenuOptionBuilder()
            .setLabel('Shop quà')
            .setDescription('Shop quà')
            .setValue('giftShop')
        )
        .addOptions(
          new StringSelectMenuOptionBuilder()
            .setLabel('Shop role')
            .setDescription('Shop role')
            .setValue('roleShop')
        )
        .addOptions(
          new StringSelectMenuOptionBuilder()
            .setLabel('Shop quest')
            .setDescription('Shop quest')
            .setValue('questShop')
        );
      
        const row = new ActionRowBuilder().addComponents(select);

        const reply = await interaction.followUp({
          embeds: [createNormalMessage('Xóa vật phẩm trong shop')],
          components: [row]
        });

        const collection = await reply.createMessageComponentCollector({
          componentType: ComponentType.StringSelect,
          filter: (i) => i.user.id === interaction.user.id && i.customId === 'rmItemChoose',
          time: 300000
        })

        collection.on('collect', async (interaction) => {
          try {
            await interaction.deferUpdate();
            const [value] = interaction.values;
            const shopItems = await ShopService.getAllShop();

            console.log(value);
            if (value === 'giftShop') {
              const gifts = shopItems.filter(item => item.type === ShopItemEnum.GIFT);
              removeGiftItem(interaction, reply, gifts, select);
              return;
            }
            if (value === 'roleShop') {
              const roles = shopItems.filter(item => item.type === ShopItemEnum.ROLE);
              removeRoleItem(interaction, reply, roles, select);
              return;
            }
            const quests = shopItems.filter(item => item.type === ShopItemEnum.QUEST);
            removeQuestItem(interaction, reply, quests, select);
          } catch (error) {
            
          }
        })
        
        const giftShopCollection = await reply.createMessageComponentCollector({
          componentType: ComponentType.StringSelect,
          filter: (i) => i.user.id === interaction.user.id && i.customId === 'giftRmItemChoose',
          time: 300000
        })

        giftShopCollection.on('collect', async (interaction) => {
          try {
            await interaction.deferUpdate();
            const [value] = interaction.values;
            const shopItems = await ShopService.getAllShop();
            const giftRemove = shopItems.find(item => item.id === parseInt(value));
            if (!giftRemove || !giftRemove.id) {
              await reply.edit({
                embeds: [createNormalMessage(`Xóa vật phẩm không thành công.`)],
                components: [row]
              })
              return;
            };
            await ShopService.removeShopItem(giftRemove.id);
            await reply.edit({
              embeds: [createNormalMessage(`Đã xóa ${giftRemove.giftEmoji} ${giftRemove.name}`)],
              components: [row]
            })
          } catch (error) {
            console.log(error);
          }
        });

        const roleShopCollection = await reply.createMessageComponentCollector({
          componentType: ComponentType.StringSelect,
          filter: (i) => i.user.id === interaction.user.id && i.customId === 'roleRmItemChoose',
          time: 300000
        })

        roleShopCollection.on('collect', async (interaction) => {
          try {
            await interaction.deferUpdate();
            const [value] = interaction.values;
            const shopItems = await ShopService.getAllShop();
            const roleRemove = shopItems.find(item => item.id === parseInt(value));
            if (!roleRemove || !roleRemove.id) {
              await reply.edit({
                embeds: [createNormalMessage(`Xóa role không thành công.`)],
                components: [row]
              })
              return;
            };
            await ShopService.removeShopItem(roleRemove.id);
            await reply.edit({
              embeds: [createNormalMessage(`Đã xóa ${roleRemove.name}`)],
              components: [row]
            })
          } catch (error) {
            console.log(error);
          }
        });

        const questShopCollection = await reply.createMessageComponentCollector({
          componentType: ComponentType.StringSelect,
          filter: (i) => i.user.id === interaction.user.id && i.customId === 'questRmItemChoose',
          time: 300000
        })

        questShopCollection.on('collect', async (interaction) => {
          try {
            await interaction.deferUpdate();
            const [value] = interaction.values;
            const shopItems = await ShopService.getAllShop();
            const roleRemove = shopItems.find(item => item.id === parseInt(value));
            if (!roleRemove || !roleRemove.id) {
              await reply.edit({
                embeds: [createNormalMessage(`Xóa vật phẩm nhiệm vụ không thành công.`)],
                components: [row]
              })
              return;
            };
            await ShopService.removeShopItem(roleRemove.id);
            await reply.edit({
              embeds: [createNormalMessage(`Đã xóa ${roleRemove.giftEmoji} ${roleRemove.name}`)],
              components: [row]
            })
          } catch (error) {
            console.log(error);
          }
        });
    } catch (error) {
      console.log(error);
    }
  }
}

module.exports = { shop, addRoleShop, addGiftShop, addQuestShop, removeItemShop };