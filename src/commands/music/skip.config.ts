import Command from '../../common.commands.config';
import { Message } from 'discord.js';
import { distube } from '../../index';

export default class skipCommand extends Command {
  constructor() {
    super('Skip', 'skip', ['Skip the current song', 'Usage: $skip'], ['fs']);
  }

  action(message: Message) {
    try {
      distube.skip(message);
    } catch (error) {
      message.channel.send('`Unable to skip song`');
      return;
    }

    message.channel.send('`Skipped song`');
  }
}
