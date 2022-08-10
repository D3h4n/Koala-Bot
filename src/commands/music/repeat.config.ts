import { CommandInteraction } from 'discord.js';
import { RepeatMode } from 'distube';
import { distube } from '../../index';
import Command from '../../utils/common.commands.config';

export default class repeatCommand extends Command {
   constructor() {
      super('repeat', 'Repeat the currently playing song or stop repeating');
   }

   action(interaction: CommandInteraction): void {
      // get playing song
      const queue = distube.getQueue(interaction);
      const nowPlaying = queue?.songs?.[0];

      // assert song exists
      if (!nowPlaying) {
         interaction.reply('`Error repeating song`');
         return;
      }

      // if queue is already repeating, stop it
      if (queue.repeatMode === 1) {
         distube.setRepeatMode(interaction, RepeatMode.DISABLED);
         interaction.reply(`\`Stopped repeating ${nowPlaying.name}\``);
         return;
      }

      // if queue isn't repeating stop it
      distube.setRepeatMode(interaction, RepeatMode.SONG);
      interaction.reply(`\`Repeating ${nowPlaying.name}\``);
      return;
   }
}
