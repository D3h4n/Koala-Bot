import { Message } from 'discord.js';
import { distube } from '../../index';
import Command from '../common.commands.config';

export default class loopCommand extends Command {
  constructor() {
    super(
      'Loop',
      'loop',
      ['Loop the entire queue or stop looping', 'Usage: $loop'],
      ['lp']
    );
  }

  action(message: Message) {
    const queue = distube.getQueue(message);

    // check if queue is playing
    if (!queue?.playing) {
      return message.channel.send('`Error looping queue`');
    }

    // if queue is looping, stop looping queue
    if (queue.repeatMode === 2) {
      distube.setRepeatMode(message, 0);

      return message.channel.send(`\`Stopped looping queue\``);
    }

    // if queue is not looping, start looping queue
    distube.setRepeatMode(message, 2);

    return message.channel.send(`\`Started looping queue\``);
  }
}
