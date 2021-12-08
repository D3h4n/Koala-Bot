import Command from '../../utils/common.commands.config';
import { CommandInteraction } from 'discord.js';
import { distube } from '../../index';
import { getVoiceConnection } from '@discordjs/voice';

export default class skipCommand extends Command {
   constructor() {
      super('skip', 'Skip the current song');
   }

   action(interaction: CommandInteraction) {
      try {
         let queue = distube.getQueue(interaction);

         if (queue)
            if (queue.songs.length > 1) {
               queue.skip();
            } else {
               queue?.stop();
            }
         else {
            getVoiceConnection(interaction.guildId)?.disconnect();
         }

         interaction.reply('`Skipped song`');
      } catch (error) {
         interaction.reply('`Unable to skip song`');
         return;
      }
   }
}
