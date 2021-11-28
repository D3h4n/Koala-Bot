import Command from '../../common.commands.config';
import Song from 'distube/typings/Song';
import { Message } from 'discord.js';
import { distube } from '../../index';
import SearchResult from 'distube/typings/SearchResult';

export default class PlayTopCommand extends Command {
  constructor() {
    super(
      'Play Top',
      'playtop',
      ['Add song to the top of the queue', 'Usage: $playtop <song>'],
      ['pt']
    );
  }

  async action(message: Message, args: string[]) {
    // get query
    let query = args.slice(1).join(' ');

    // assert query exists
    if (!query) {
      return message.channel.send('`Add a song to play!!!!`');
    }

    // assert query is not a playlist
    if (query.includes('https://youtube.com/playlist')) {
      return message.channel.send('`Use the play command for playlists`');
    }

    // get queue
    let queue = distube.getQueue(message);

    // if there is no queue play song regularly
    if (!queue?.songs?.length) {
      return distube.play(message, query);
    }

    // if there is a queue

    // generate a search result based on query
    let result: SearchResult;

    try {
      [result] = await distube.search(query);
    } catch (error) {
      message.channel.send('`Could not find that song`');
      console.error(error);
      return;
    }

    // change result to song
    let song = this.createSong(message, result); // FIXME: This is botched way to do this until the contructor works
    // Better Way:
    // let song = new Song(result, message.author);

    // add song to the beginning of the queue
    queue.songs.splice(1, 0, song);

    // emit add song event
    distube.emit('addSong', message, queue, song);
  }

  /**
   * Takes a search result and makes it into a song
   *
   *
   * @param message message object
   * @param result search result object
   * @returns {Song} Song object
   */
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
