import Command from '../common.commands.config';
import config from '../../utils/config';
import { Message } from 'discord.js';
import { google } from 'googleapis';

export default class youtubeCommand extends Command {
  constructor() {
    super('youtube', ['Search youtube', 'Usage: $youtube <query>']);
  }

  action(message: Message, args: string[]) {
    let search = args.slice(1).join(' ');

    if (!search.length) {
      message.channel.send("I can't search nothing");
      return;
    }

    google
      .youtube('v3')
      .search.list({
        key: config.youtubeApiKey,
        type: ['video', 'channel'],
        part: ['snippet'],
        q: search,
        maxResults: 1,
      })
      .then((res) => {
        let result = res.data.items?.[0];

        let id = result?.id;

        if (id?.videoId) {
          message.channel.send(`https://www.youtube.com/watch?v=${id.videoId}`);
        } else if (id?.channelId) {
          message.channel.send(
            `https://www.youtube.com/channel/${id.channelId}`
          );
        } else {
          message.channel.send(`No results found`);
        }
      })
      .catch(console.error);
  }
}
