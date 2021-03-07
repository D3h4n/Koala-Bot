import Command from '../common.commands.config';
import { Message } from 'discord.js';
import { distube } from '../../index';

export default class playCommand extends Command {
  constructor() {
    super('play', ['Play music', '$play <song>']);
  }

  async action(message: Message, args: string[]) {
    let query = args.slice(1).join(' ');

    if (!query) {
      try {
        distube.resume(message);
      } catch (err) {
        message.channel.send('`Error resuming song`');
        return;
      }

      message.channel.send('`Resuming song`');
      return;
    }

    distube
      .play(message, query)
      .catch(() => message.channel.send('`Could not find that song`'));
  }
}
