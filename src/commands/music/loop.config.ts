import { Message } from 'discord.js';
import { distube } from '../../index';
import Command from '../common.commands.config';

export default class loopCommand extends Command {
  isLooping: boolean;

  constructor() {
    super('loop', ['Loop the entire queue or stop looping', 'Usage: $loop']);

    this.isLooping = false;
  }

  action(message: Message) {
    if (!distube.getQueue(message)?.playing) {
      return message.channel.send('`Error looping queue`');
    }

    if (this.isLooping) {
      distube.setRepeatMode(message, 0);

      this.isLooping = false;
      return message.channel.send(`\`Stopped looping queue\``);
    }

    distube.setRepeatMode(message, 2);

    this.isLooping = true;
    return message.channel.send(`\`Started looping queue\``);
  }
}
