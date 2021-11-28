import Command from '../../common.commands.config';
import { distube } from '../../index';
import { Message } from 'discord.js';

export default class pauseCommand extends Command {
  constructor() {
    super('Pause', 'pause', ['Pause song', 'Usage: $pause'], ['pa']);
  }

  action(message: Message) {
    try {
      // check if queue is playing
      if (distube.getQueue(message).playing) {
        // pause queue
        distube.pause(message);
        // send response
        message.channel.send('`Paused song`');
      }
    } catch (err) {
      // send and log error
      message.channel.send('`Error pausing song`');
      console.error(err);
    }
  }
}
