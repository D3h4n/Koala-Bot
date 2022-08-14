import { ChatInputCommandInteraction } from 'discord.js';
import { PermissionFlagsBits } from 'discord-api-types/v10';
import guildServices from '../../services/guild.services';
import Command from '../../utils/common.commands.config';

export default class togglePostureCheckCommand extends Command {
   constructor() {
      super(
         'toggleposturecheck',
         'Toggle Posture checks',
         PermissionFlagsBits.Administrator,
         '310489953157120023'
      );

      this.addNumberOption((option) =>
         option
            .setName('frequency')
            .setDescription('How often to run posture checks')
      );

      this.addStringOption((option) =>
         option
            .setName('message')
            .setDescription('The message to send for each posture check')
      );
   }

   async action(interaction: ChatInputCommandInteraction): Promise<void> {
      // get the guild id
      const guildId = interaction.guild?.id;

      // assert guildId
      if (!guildId) {
         interaction.reply('`Error finding guild`');
         return;
      }

      // get guild record
      const guild = await guildServices.GetGuild(guildId);

      // if posture checks are running turn them off
      // and send message
      if (guild.runPostureCheck) {
         await guildServices.UpdateGuild({ guildId, runPostureCheck: false });
         interaction.reply('`Stopping posture checks`');
         return;
      }

      // calculate posture frequency
      const frequency = interaction.options.getNumber('frequency');

      // assert valid posture frequency
      if (!frequency) {
         interaction.reply(`\`Please specify a valid frequency\``);
         return;
      }

      const postureCheckFrequency = Math.round(frequency * 3.6e6);

      // update guild with new info
      guildServices.UpdateGuild({
         guildId,
         postureCheckChannelId: interaction?.channel?.id,
         runPostureCheck: true,
         postureCheckFrequency,
         postureCheckMessage: interaction.options.getString('message'),
      });

      // send message
      interaction.reply(
         `\`Running posture checks in this channel every ${frequency} hours\``
      );
   }
}
