import { CommandInteraction } from 'discord.js';
import { distube } from '../../index';
import Command from '../../utils/common.commands.config';

export default class removeCommand extends Command {
   constructor() {
      super('remove', 'Remove a song from the queue');

      this.addIntegerOption((option) =>
         option
            .setName('position')
            .setDescription('The position of the song to remove')
            .setRequired(true)
            .setMinValue(1)
      );
   }

   action(interaction: CommandInteraction): void {
      // get position
      const position = interaction.options.getInteger('position', true);

      const queue = distube.getQueue(interaction);

      if (!queue) {
         interaction.reply('`Error: No Queue`');
         return;
      }

      const songs = queue.songs;

      if (position >= songs?.length) {
         interaction.reply("`You don't have that many songs brother`");
         return;
      }

      const removedSong = songs.splice(position, 1)[0];
      interaction.reply(`Removed ${removedSong.name}`);
   }
}
