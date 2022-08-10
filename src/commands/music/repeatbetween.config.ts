import { CommandInteraction } from 'discord.js';
import Command from '../../utils/common.commands.config';
import { PermissionFlagsBits } from 'discord-api-types/v10';
import {
   parseTimeString,
   timeToString,
} from '../../utils/helper_functions.config';
import { distube } from '../../index';
// import { Queue, RepeatMode, Song } from 'distube';
import { Queue, Song } from 'distube';

export default class loopCommand extends Command {
   timeouts: Map<string, { song: Song; interval: NodeJS.Timeout }>;

   constructor() {
      super(
         'repeatbetween',
         'Repeat a song between two times',
         PermissionFlagsBits.Administrator // FIXME: update this later
      );

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

   async action(interaction: CommandInteraction): Promise<void> {
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
      interaction: CommandInteraction
   ): void {
      const start = parseTimeString(
         interaction.options.getString('start', true)
      );

      const startString = timeToString(start);
      const currentSong = queue.songs[0];

      let timeDiff = currentSong.duration - start;

      console.log(timeDiff);

      const endString = interaction.options.getString('end');

      if (endString) {
         const end = parseTimeString(endString);
         timeDiff = end - start;
      }

      if (timeDiff < 10) {
         interaction.editReply(
            '`Time difference cannot be less than 10 seconds`'
         );
         return;
      }

      if (timeDiff >= currentSong.duration) {
         interaction.editReply("`Can't repeat after song is already finished`");
         return;
      }

      // queue.setRepeatMode(RepeatMode.SONG);
      queue.seek(start);

      const interval = setInterval(() => {
         if (!queue.playing || queue.songs[0] !== currentSong) {
            clearInterval(interval);
            console.log(`Cleared interval for ${currentSong.name}`);
            this.timeouts.delete(guildId);
         }

         queue.seek(start);
      }, timeDiff * 1000);

      if (this.timeouts.has(guildId)) {
         const record = this.timeouts.get(guildId)
         clearInterval(record?.interval)
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
      _queue: Queue,
      guildId: string,
      interaction: CommandInteraction
   ): void {
      const record = this.timeouts.get(guildId);

      if (!record) {
         interaction.editReply(
            "`Critical Error, for whatever reason the record doesn't exist`"
         );
         return;
      }

      clearInterval(record.interval);
      this.timeouts.delete(guildId);
      // queue.setRepeatMode(RepeatMode.DISABLED);
      interaction.editReply(`\`Stopped repeating ${record.song.name}\``);
      return;
   }
}
