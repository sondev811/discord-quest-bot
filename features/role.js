const { StringSelectMenuOptionBuilder, ActionRowBuilder, StringSelectMenuBuilder } = require("@discordjs/builders");
const messages = require("../constants/messages");
const { createNormalMessage } = require("../messages/normalMessage");
const { RewardEnum } = require("../models/quest.model");
const { RoleService } = require("../services/role.service");
const { ComponentType } = require("discord.js");

const handleRoleDescription = (buff, valueBuff) => {
  return `nhận thêm ${ buff === RewardEnum.SILVER_TICKET ? `${valueBuff}% vé xanh khi điểm danh hằng ngày` : `${valueBuff} số vé vàng khi điểm danh hằng ngày`}`
}

const addRole = {
  name: 'admin-add-role',
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

      const body = {
        name: role.name,
        roleId: role.id,
        description: handleRoleDescription(typeBuff, valueBuff),
        typeBuff,
        valueBuff,
      }

      const res = await RoleService.addRole(body);
      if (!res) {
        await interaction.followUp({
          embeds: [createNormalMessage(messages.addRoleError)]
        })
        return;
      }
      await interaction.followUp({
        embeds: [createNormalMessage(
          messages.addRoleSuccess(role.id, handleRoleDescription(typeBuff, valueBuff)))]
      })
    } catch (error) {
      console.log(error, '[admin-add-role]');
    }
  }
}

const renderRole = (roles) => {
  let data = '';
  roles.forEach(role => {
    data += `<@&${role.roleId}> » ${role.description}\n\n`
  })
  return data;
}

const removeRole = {
  name: 'admin-remove-role',
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
      const roles = await RoleService.getAllRole();

      const select = new StringSelectMenuBuilder()
        .setCustomId('roleDailyChoose')
        .setPlaceholder('Chọn role cần xóa')

      for (const item of roles) {
        select.addOptions(
          new StringSelectMenuOptionBuilder()
            .setLabel(item.name)
            .setDescription(item.description)
            .setValue(item.id + '')
        );
      }

      const row = new ActionRowBuilder().addComponents(select);

      const reply = await interaction.followUp({
        embeds: [createNormalMessage(renderRole(roles))],
        components: [row]
      });

      const collection = await reply.createMessageComponentCollector({
        componentType: ComponentType.StringSelect,
        filter: (i) => i.user.id === interaction.user.id && i.customId === 'roleDailyChoose',
        time: 300000
      })

      collection.on('collect', async (interaction) => {
        try {
          await interaction.deferUpdate();
          const [value] = interaction.values;
          const roleRemove = roles.find(item => item.id === parseInt(value));
          if (!roleRemove || !roleRemove.id) return;
          await RoleService.removeRole(roleRemove.id);
          await reply.edit({
            embeds: [createNormalMessage(`Đã xóa ${roleRemove.name}`)],
            components: []
          })
          
        } catch (error) {
          console.log(error, '[remove role]');
        }
      })

    } catch (error) {
      console.log(error, '[admin-add-role]');
    }
  }
}

module.exports = { addRole, removeRole };