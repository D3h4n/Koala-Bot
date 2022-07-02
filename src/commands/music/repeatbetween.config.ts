import { CommandInteraction } from 'discord.js';
import Command from '../../utils/common.commands.config';
import { PermissionFlagsBits } from 'discord-api-types/v10';

export default class loopCommand extends Command {
   constructor() {
      super(
         'repeatbetween',
         'Repeat a song between two times',
         PermissionFlagsBits.Administrator // FIXME: update this later
      );

      this.addStringOption((option) =>
         option
            .setName('start')
            .setDescription('The start time of the loop (hh:mm:ss)')
            .setRequired(true)
      );

      this.addStringOption((option) =>
         option
            .setName('end')
            .setDescription('The end time of the loop (hh:mm:ss)')
      );
   }

   action(interaction: CommandInteraction): void {
      interaction.reply('Under construction');
   }
}
