import { Queue, Song } from 'distube';
import config from '../../utils/config';
import Command from '../../utils/common.commands.config';
import {
   CommandInteraction,
   Message,
   MessageActionRow,
   MessageButton,
   MessageEmbed,
} from 'discord.js';
import { distube } from '../../index';

export default class queueCommand extends Command {
   constructor() {
      super('queue', 'Display the song queue');

      this.addNumberOption((option) =>
         option.setName('page').setDescription('The page you want to start on')
      );
   }

   async action(interaction: CommandInteraction): Promise<void> {
      await interaction.deferReply();
      const queue = distube.getQueue(interaction);

      if (!queue || !queue.songs?.length) {
         // check that the queue has songs
         interaction.editReply('`The queue is empty`');
         return;
      }

      try {
         const numPages = Math.ceil(
            queue.songs.length / config.queuePageLength
         );
         let pageNumber = interaction.options.getNumber('page') || 1; // set pageNumber

         pageNumber =
            pageNumber < 1 ? 1 : pageNumber > numPages ? numPages : pageNumber;

         let components: MessageActionRow[] | undefined = undefined;

         if (numPages > 1) {
            components = [
               new MessageActionRow().addComponents(
                  new MessageButton()
                     .setCustomId('left')
                     .setStyle('PRIMARY')
                     .setLabel('back')
                     .setEmoji('◀')
                     .setDisabled(pageNumber === 1),
                  new MessageButton()
                     .setCustomId('right')
                     .setStyle('PRIMARY')
                     .setLabel('next')
                     .setEmoji('▶')
                     .setDisabled(pageNumber === numPages)
               ),
            ];
         }

         // Reply with queue and add interactive buttons
         const sentMsg = (await interaction.editReply({
            embeds: [this.generateResponse(queue, pageNumber)],
            components,
         })) as Message;

         if (numPages <= 1) return;

         // add reaction collector for message
         const collector = sentMsg.createMessageComponentCollector({
            // filter reactions to ignore bot reactions and other reactions
            filter: (i) =>
               (i.customId === 'left' || i.customId === 'right') && !i.user.bot,
            // set the time limit
            time: config.queueTimeLimit,
         });

         collector
            .on('collect', async ({ customId }) => {
               // get the message action row
               const row = sentMsg.components[0];

               // enable all buttons
               row.components.forEach((comp) => comp.setDisabled(false));

               // run changePage function for every valid reaction
               switch (customId) {
                  case 'left':
                     // decrement pagenumber
                     pageNumber--;

                     // disable button if first page
                     if (pageNumber === 1) {
                        row.components[0].setDisabled(true);
                     }
                     break;

                  case 'right':
                     // increment page number
                     pageNumber++;

                     // disable button if last page
                     if (pageNumber === numPages) {
                        row.components[1].setDisabled(true);
                     }
                     break;

                  default:
                     process.stderr.write('Invalid button id');
                     process.exit(1);
               }

               // update queue and buttons
               sentMsg.edit({
                  embeds: [this.generateResponse(queue, pageNumber)],
                  components: [row],
               });
            })
            .on('end', () => {
               // remove buttons
               sentMsg.edit({
                  components: [],
               });
            });
      } catch (error) {
         console.error(error);
      }
   }

   generateResponse(queue: Queue, pageNumber: number): MessageEmbed {
      const songs = queue.songs; // list of songs
      const numPages = Math.ceil(songs.length / config.queuePageLength); // number of pages

      const nowPlaying = songs[0]; // get the currently playing song

      // set the display for the currently playing song
      let description =
         `__Now Playing:__\n` +
         `[${nowPlaying.name}](${nowPlaying.url}) - ${nowPlaying.formattedDuration} - \`${nowPlaying.member?.displayName}\`\n\n`;

      if (songs.length > 1) {
         let startIndex = (pageNumber - 1) * config.queuePageLength; // starting index of songs on page

         // set startIndex to 0 if page number is too large
         if (startIndex > songs.length) {
            startIndex = 0;
         }

         // last index of songs on page
         const endIndex = Math.min(
            startIndex + config.queuePageLength,
            songs.length
         );

         //  Add the display for all the songs on the page
         description += '__Up Next:__\n';
         songs
            // gets the up next songs on the page. If startIndex is 0 start at 1 instead
            .slice(startIndex || 1, endIndex)
            // generate display for each song
            .forEach((song, idx) => {
               description +=
                  `${(startIndex || 1) + idx}. ` +
                  this.generateSongDescription(song) +
                  '\n';
            });
      }

      // set up the embedded message
      const response = new MessageEmbed({
         title: 'Queue',
         description,
         footer: {
            text:
               `Page: ${pageNumber}/${numPages}` +
               '\u2800'.repeat(30) +
               `${songs.length} ${
                  songs.length === 1 ? 'song' : 'songs'
               } in Queue | Total Length: ${queue.formattedDuration}`,
         },
         color: config.mainColor,
      }).setThumbnail(nowPlaying.thumbnail ?? '');

      return response;
   }

   generateSongDescription(song: Song): string {
      return `[${song.name}](${song.url}) - ${song.formattedDuration} - \`${song.member?.displayName}\``;
   }
}
