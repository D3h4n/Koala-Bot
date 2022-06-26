import { CommandInteraction } from 'discord.js';
import Command from '../../utils/common.commands.config';
import { distube } from '../../index';

export default class SeekCommand extends Command {
   constructor() {
      super('seek', 'set the position of the current track');

      this.addIntegerOption((option) =>
         option
            .setName('time')
            .setDescription('The time in minutes to set for the current track')
            .setRequired(true)
      );
   }

   action(interaction: CommandInteraction): void {
      const time = interaction.options.getInteger('time', true) * 60;

      if (!interaction.guildId) {
         interaction.reply('Error occurred performing this command');
         console.error('Error guild is falsy');
         return;
      }

      distube.seek(interaction, time);
      interaction.reply('YES');
   }
}
