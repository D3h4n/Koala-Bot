import { ChatInputCommandInteraction } from 'discord.js';
import { RepeatMode } from 'distube';
import { distube } from '../../index';
import Command from '../../utils/common.commands.config';

export default class loopCommand extends Command {
   constructor() {
      super('loop', 'Loop the entire queue or stop looping');
   }

   action(interaction: ChatInputCommandInteraction): void {
      const queue = distube.getQueue(interaction);

      // check if queue is playing
      if (!queue?.playing) {
         interaction.reply('`Error looping queue`');
         return;
      }

      // if queue is not looping, start looping queue
      const repeatMode = distube.setRepeatMode(interaction, RepeatMode.QUEUE);
      interaction.reply(
         repeatMode === RepeatMode.QUEUE
            ? `\`Started looping queue\``
            : `\`Stopped looping queue\``
      );
   }
}
