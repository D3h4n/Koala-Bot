import Command from '../../utils/common.commands.config';
import config from '../../utils/config';
import { CommandInteraction } from 'discord.js';
import { google } from 'googleapis';

export default class youtubeCommand extends Command {
   constructor() {
      super('youtube', 'Search youtube');

      this.addStringOption((option) =>
         option
            .setName('query')
            .setDescription('Thing to search')
            .setRequired(true)
      );
   }

   action(interaction: CommandInteraction): void {
      // get search query
      const search = interaction.options.data
         .map((a) => a.value)
         .join(' ')
         .trim();

      // assert search is valid
      if (!search.length) {
         interaction.reply("I can't search nothing");
         return;
      }

      // perform search
      google
         .youtube('v3')
         .search.list({
            key: config.youtubeApiKey,
            type: ['video', 'channel'],
            part: ['snippet'],
            q: search,
            maxResults: 1,
         })
         .then((res) => res.data.items?.[0]) // get first result
         .then((result) => {
            // get id
            const id = result?.id;

            if (id?.videoId) {
               // send video link if video
               interaction.reply(
                  `https://www.youtube.com/watch?v=${id.videoId}`
               );
            } else if (id?.channelId) {
               // send channel link if channel
               interaction.reply(
                  `https://www.youtube.com/channel/${id.channelId}`
               );
            } else {
               // send repsonse if no results are found
               interaction.reply(`No results found`);
            }
         })
         .catch(console.error);
   }
}
