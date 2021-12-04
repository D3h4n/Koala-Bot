import Command from '../common.commands.config';
import { Message } from 'discord.js';
import { distube } from '../../index';

export default class shuffleCommand extends Command {
  constructor() {
    super(
      'Shuffle',
      'shuffle',
      ['shuffle the queue', 'Usage: $shuffle'],
      ['shf']
    );
  }

  action(message: Message) {
    try {
      distube.shuffle(message);
    } catch (error) {
      console.error(error);
      return message.channel.send('`Error shuffling queue`');
    }

    return message.channel.send('`Shuffled Queue`');
  }
}
