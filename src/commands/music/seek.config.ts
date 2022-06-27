import { CommandInteraction } from 'discord.js';
import Command from '../../utils/common.commands.config';
import { distube } from '../../index';
import { parseTimeString } from '../../utils/helper_functions.config';

export default class SeekCommand extends Command {
   constructor() {
      super('seek', 'set the position of the current track');

      this.addStringOption((option) =>
         option
            .setName('time')
            .setDescription('The time to set for the current track (hh:mm:ss)')
            .setRequired(true)
      );
   }

   action(interaction: CommandInteraction): void {
      const time = parseTimeString(interaction.options.getString('time', true));

      if (!interaction.guildId) {
         interaction.reply('Error occurred performing this command');
         console.error('Error guild is falsy');
         return;
      }

      distube.seek(interaction, time);
      interaction.reply('YES');
   }
}