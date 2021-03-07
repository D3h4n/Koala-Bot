import Command from '../common.commands.config';
import { Message } from 'discord.js';
import { distube } from '../../index';

export default class playCommand extends Command {
  constructor() {
    super('play', [
      'Add a song to the queue',
      'Usage: $play <song>',
      'OR',
      'Resume a song',
      'Usage: $play',
    ]);
  }

  async action(message: Message, args: string[]) {
    let query = args.slice(1).join(' ');

    if (!query) {
      try {
        if (distube.getQueue(message).pause) {
          distube.resume(message);
          message.channel.send('`Resuming song`');
        }
      } catch (err) {
        message.channel.send('`Error resuming song`');
      }

      return;
    }

    distube
      .play(message, query)
      .catch(() => message.channel.send('`Could not find that song`'));
  }
}
