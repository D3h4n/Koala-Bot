import { CommandInteraction } from 'discord.js';
import { RepeatMode } from 'distube';
import { distube } from '../../index';
import Command from '../../utils/common.commands.config';

export default class loopCommand extends Command {
   constructor() {
      super('loop', 'Loop the entire queue or stop looping');
   }

   action(interaction: CommandInteraction): void {
      const queue = distube.getQueue(interaction);

      // check if queue is playing
      if (!queue?.playing) {
         interaction.reply('`Error looping queue`');
         return;
      }

      // if queue is looping, stop looping queue
      if (queue.repeatMode === 2) {
         distube.setRepeatMode(interaction, RepeatMode.DISABLED);

         interaction.reply(`\`Stopped looping queue\``);
         return;
      }

      // if queue is not looping, start looping queue
      distube.setRepeatMode(interaction, RepeatMode.QUEUE);
      interaction.reply(`\`Started looping queue\``);
   }
}
