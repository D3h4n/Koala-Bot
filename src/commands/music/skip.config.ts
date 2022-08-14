import Command from '../../utils/common.commands.config';
import { ChatInputCommandInteraction } from 'discord.js';
import { distube } from '../../index';

export default class skipCommand extends Command {
   constructor() {
      super('skip', 'Skip the current song');
   }

   action(interaction: ChatInputCommandInteraction): void {
      try {
         const queue = distube.getQueue(interaction);

         if (!queue) {
            interaction.reply('`No songs playing`');
            return;
         }

         if (queue.songs.length > 1) {
            queue.skip();
         } else {
            queue.stop();
         }

         interaction.reply('`Skipped song`');
      } catch (error) {
         interaction.reply('`Unable to skip song`');
      }
   }
}
