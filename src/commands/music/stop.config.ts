import Command from '../../utils/common.commands.config';
import { CommandInteraction } from 'discord.js';
import { distube } from '../../index';

export default class stopCommand extends Command {
   constructor() {
      super('stop', 'Stop the queue');
   }

   action(interaction: CommandInteraction): void {
      try {
         distube.stop(interaction);
      } catch (error) {
         interaction.reply('`Error stopping queue`');
         return;
      }

      interaction.reply('`Queue stopped`');
   }
}
