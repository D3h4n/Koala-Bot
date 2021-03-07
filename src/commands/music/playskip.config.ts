import Command from '../common.commands.config';
import { Message } from 'discord.js';
import { distube } from '../../index';

export default class playSkipCommand extends Command {
  constructor() {
    super('playskip', ['Immediately play a song', '$playskip <song>']);
  }

  async action(message: Message, args: string[]) {
    let query = args.slice(1).join(' ');

    if (!query) {
      message.channel.send('`Add a song to find!!!!`');
      return;
    }

    distube
      .playSkip(message, query)
      .catch(() => message.channel.send('`Could not find that song`'));
  }
}
