import Command from '../common.commands.config';
import { Message } from 'discord.js';
import { distube } from '../../index';

export default class playSkipCommand extends Command {
  constructor() {
    super(
      'Play Skip',
      'playskip',
      ['Immediately play a song', '$playskip <song>'],
      ['ps']
    );
  }

  async action(message: Message, args: string[]) {
    // get query
    let query = args.slice(1).join(' ');

    // assert query exists
    if (!query) {
      message.channel.send('`Add a song to find!!!!`');
      return;
    }

    // playskip query
    distube
      .playSkip(message, query)
      .catch(() => message.channel.send('`Could not find that song`'));
  }
}
