import { ChatInputCommandInteraction } from 'discord.js';
import Command from '../../utils/common.commands.config';
import { parseTimeString } from '../../utils/helper_functions.config';
import { distube } from '../../index';
import { Queue, RepeatMode, Song } from 'distube';

export default class loopCommand extends Command {
   timeouts: Map<string, { song: Song; interval: NodeJS.Timeout }>;

   constructor() {
      super('repeatbetween', 'Repeat a song between two times');

      this.addSubcommand((command) =>
         command
            .setName('start')
            .setDescription('Start repeating a song between times')
            .addStringOption((option) =>
               option
                  .setName('start')
                  .setDescription('The start time of the loop (hh:mm:ss)')
                  .setRequired(true)
            )
            .addStringOption((option) =>
               option
                  .setName('end')
                  .setDescription('The end time of the loop (hh:mm:ss)')
            )
      );

      this.addSubcommand((command) =>
         command.setName('stop').setDescription('Stop repeating')
      );

      this.timeouts = new Map();
   }

   async action(interaction: ChatInputCommandInteraction): Promise<void> {
      const guildId = interaction.guildId;

      if (!guildId) {
         interaction.reply('`This feature is only available in servers`');
         return;
      }

      const queue = distube.getQueue(interaction);

      if (!queue) {
         interaction.reply('`No song is playing`');
         return;
      }

      const subCommand = interaction.options.getSubcommand(true);

      await interaction.deferReply();

      switch (subCommand) {
         case 'start':
            this.startRepeating(queue, guildId, interaction);
            break;

         case 'stop':
            this.stopRepeating(queue, guildId, interaction);
            break;

         default:
            interaction.editReply('`Unknown command`');
      }
   }

   startRepeating(
      queue: Queue,
      guildId: string,
      interaction: ChatInputCommandInteraction
   ): void {
      const startString = interaction.options.getString('start', true);
      const endString = interaction.options.getString('end');
      const currentSong = queue.songs[0];

      const start = parseTimeString(startString);
      const end = Math.min(
         endString ? parseTimeString(endString) : Number.MAX_SAFE_INTEGER,
         currentSong.duration
      );

      if (start > end) {
         interaction.editReply('`Start is after end`');
         return;
      }

      queue.setRepeatMode(RepeatMode.SONG);
      queue.seek(start);

      // poll every second for restarting the song
      const interval = setInterval(() => {
         if (!queue.playing || queue.songs[0] !== currentSong) {
            clearInterval(interval);
            console.log(`Cleared interval for ${currentSong.name}`);
            this.timeouts.delete(guildId);
         }

         if (queue.currentTime >= end) {
            queue.seek(start);
         }
      }, 1000);

      if (this.timeouts.has(guildId)) {
         const record = this.timeouts.get(guildId);
         clearInterval(record?.interval);
      }

      this.timeouts.set(guildId, {
         song: currentSong,
         interval,
      });

      interaction.editReply(
         `\`Repeating song between ${startString} and ${
            endString ?? currentSong.formattedDuration
         }\``
      );
   }

   stopRepeating(
      queue: Queue,
      guildId: string,
      interaction: ChatInputCommandInteraction
   ): void {
      const record = this.timeouts.get(guildId);

      if (!record) {
         interaction.editReply('`Not repeating`');
         return;
      }

      clearInterval(record.interval);
      interaction.editReply(`\`Stopped repeating ${record.song.name}\``);
      queue.setRepeatMode(RepeatMode.DISABLED);
      this.timeouts.delete(guildId);
   }
}
