import Command from '../../common.commands.config';
import { Message } from 'discord.js';
import { distube } from '../../index';

export default class stopCommand extends Command {
  constructor() {
    super('Stop', 'stop', ['Stop the queue', 'Usage: $stop']);
  }

  action(message: Message) {
    try {
      distube.stop(message);
    } catch (error) {
      message.channel.send('`Error stopping queue`');
      return;
    }

    message.channel.send('`Queue stopped`');
  }
}
