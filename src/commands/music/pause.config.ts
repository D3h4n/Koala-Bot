import Command from '../common.commands.config';
import { distube } from '../../index';
import { Message } from 'discord.js';

export default class pauseCommand extends Command {
  constructor() {
    super('pause', ['Pause song', 'Usage: $pause']);
  }

  action(message: Message) {
    try {
      if (distube.getQueue(message).playing) {
        distube.pause(message);
        message.channel.send('`Paused song`');
      }
    } catch (error) {
      message.channel.send('`Error pausing song`');
      return;
    }
  }
}
