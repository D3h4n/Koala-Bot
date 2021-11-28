import Command from '../../common.commands.config';
import config from '../../utils/config';
import { Message } from 'discord.js';
import { google } from 'googleapis';

export default class youtubeCommand extends Command {
  constructor() {
    super(
      'Youtube',
      'youtube',
      ['Search youtube', 'Usage: $youtube <query>'],
      ['yt']
    );
  }

  action(message: Message, args: string[]) {
    // get search query
    let search = args.slice(1).join(' ');

    // assert search is valid
    if (!search.length) {
      message.channel.send("I can't search nothing");
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
        let id = result?.id;

        if (id?.videoId) {
          // send video link if video
          message.channel.send(`https://www.youtube.com/watch?v=${id.videoId}`);
        } else if (id?.channelId) {
          // send channel link if channel
          message.channel.send(
            `https://www.youtube.com/channel/${id.channelId}`
          );
        } else {
          // send repsonse if no results are found
          message.channel.send(`No results found`);
        }
      })
      .catch(console.error);
  }
}
