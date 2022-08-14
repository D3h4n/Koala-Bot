import Command from '../../utils/common.commands.config';
import { ChatInputCommandInteraction } from 'discord.js';
import { distube } from '../../index';

export default class stopCommand extends Command {
   constructor() {
      super('stop', 'Stop the queue');
   }

   action(interaction: ChatInputCommandInteraction): void {
      try {
         distube.stop(interaction);
      } catch (error) {
         interaction.reply('`Error stopping queue`');
         return;
      }

      interaction.reply('`Queue stopped`');
   }
}
