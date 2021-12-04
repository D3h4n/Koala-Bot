import Command from '../common.commands.config';
import { Message } from 'discord.js';
import { distube } from '../../index';

export default class playCommand extends Command {
  constructor() {
    super(
      'Play',
      'play',
      [
        'Add a song to the queue',
        'Usage: $play <song>',
        'OR',
        'Resume a song',
        'Usage: $play',
      ],
      ['p']
    );
  }

  async action(message: Message, args: string[]) {
    // generate query from args
    let query = args.slice(1).join(' ');

    // if no query resume queue
    if (!query) {
      try {
        // check if queue is paused
        if (distube.getQueue(message).pause) {
          // resume queue and send response
          distube.resume(message);
          message.channel.send('`Resuming song`');
        }
      } catch (err) {
        message.channel.send('`Error resuming song`');
      }

      return;
    }

    // if query then search for and play query
    distube
      .play(message, query)
      .catch(() => message.channel.send('`Could not find that song`'));
  }
}
