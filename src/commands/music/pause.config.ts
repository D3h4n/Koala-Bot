import Command from '../common.commands.config';
import { distube } from '../../index';
import { Message } from 'discord.js';

export default class pauseCommand extends Command {
  constructor() {
    super('pause', ['Pause song', 'Usage: $pause']);
  }

  action(message: Message) {
    try {
      distube.pause(message);
    } catch (error) {
      message.channel.send('`Error pausing song`');
      return;
    }

    message.channel.send('`Paused song`');
  }
}
