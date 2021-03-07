import Command from '../common.commands.config';
import Song from 'distube/typings/Song';
import { Message } from 'discord.js';
import { distube } from '../../index';
import SearchResult from 'distube/typings/SearchResult';

export default class PlayTopCommand extends Command {
  constructor() {
    super('playtop', [
      'Add song to the top of the queue',
      'Usage: $playtop <song>',
    ]);
  }

  async action(message: Message, args: string[]) {
    let query = args.slice(1).join(' ');

    if (!query) {
      message.channel.send('`Add a song to play!!!!`');
      return;
    }

    let results: SearchResult[];

    try {
      results = await distube.search(query);
    } catch (error) {
      message.channel.send('`Could not find that song`');
      return;
    }

    let queue = distube.getQueue(message);

    if (queue?.songs?.length) {
      // FIXME: This is botched way to do this until the contructor works
      let song: Song = {
        ...results[0],
        user: message.author,
        youtube: true,
        info: null,
        streamURL: null,
        related: null,
        plays: NaN,
        likes: NaN,
        dislikes: NaN,
        reposts: NaN,
      };
      // Better Way:
      // let song = new Song(results[0], message.author);

      queue.songs.splice(1, 0, song);
      distube.emit('addSong', message, queue, song);
    } else {
      distube.play(message, results[0]);
    }
  }
}
