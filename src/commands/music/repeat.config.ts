import { ChatInputCommandInteraction } from 'discord.js';
import { RepeatMode } from 'distube';
import { distube } from '../../index';
import Command from '../../utils/common.commands.config';

export default class repeatCommand extends Command {
   constructor() {
      super('repeat', 'Repeat the currently playing song or stop repeating');
   }

   action(interaction: ChatInputCommandInteraction): void {
      // get playing song
      const queue = distube.getQueue(interaction);
      const nowPlaying = queue?.songs?.[0];

      // assert song exists
      if (!nowPlaying) {
         interaction.reply('`Error repeating song`');
         return;
      }

      // Set repeat mode
      const repeatMode = distube.setRepeatMode(interaction, RepeatMode.SONG);
      interaction.reply(
         repeatMode === RepeatMode.SONG
            ? `\`Repeating ${nowPlaying.name}\``
            : `\`Stopped repeating ${nowPlaying.name}\``
      );
      return;
   }
}
