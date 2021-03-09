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
      return message.channel.send('`Add a song to play!!!!`');
    }

    if (query.includes('https://youtube.com/playlist')) {
      return message.channel.send('`Use the play command for playlists`');
    }

    let queue = distube.getQueue(message);

    if (!queue?.songs?.length) {
      return distube.play(message, query);
    }

    let result: SearchResult;

    try {
      [result] = await distube.search(query);
    } catch (error) {
      message.channel.send('`Could not find that song`');
      console.error(error);
      return;
    }

    // FIXME: This is botched way to do this until the contructor works
    let song = this.createSong(message, result);
    // Better Way:
    // let song = new Song(result, message.author);

    queue.songs.splice(1, 0, song);
    distube.emit('addSong', message, queue, song);
  }

  createSong(message: Message, result: SearchResult): Song {
    return {
      ...result,
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
  }
}
