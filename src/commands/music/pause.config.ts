import Command from '../../utils/common.commands.config';
import { distube } from '../../index';
import { ChatInputCommandInteraction } from 'discord.js';

export default class pauseCommand extends Command {
   constructor() {
      super('pause', 'Pause song');
   }

   action(interaction: ChatInputCommandInteraction): void {
      try {
         // check if queue is playing
         if (distube.getQueue(interaction)?.playing) {
            // pause queue
            distube.pause(interaction);
            // send response
            interaction.reply('`Paused song`');
         }
      } catch (err) {
         // send and log error
         interaction.reply('`Error pausing song`');
         console.error(err);
      }
   }
}
