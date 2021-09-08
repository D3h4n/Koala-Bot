import Command from '../common.commands.config';
import { Message } from 'discord.js';
import { distube } from '../../index';

export default class volumeCommand extends Command {
  constructor() {
    super(
      'Volume',
      'volume',
      ['Set the volume of the bot', 'Usage: $volume <percent>'],
      ['vol']
    );
  }

  action(message: Message, args: string[]) {
    // get volume value
    let volume = Number(args[1]);

    // assert valid volume value
    if (Number.isNaN(volume) || volume < 0 || volume > 100) {
      return message.channel.send(
        '`Volume must be a number between 0 and 100`'
      );
    }

    // set volume
    try {
      distube.setVolume(message, volume);
    } catch (error) {
      return message.channel.send('`Error setting volume`');
    }

    // send response
    return message.channel.send(`\`Volume set to ${volume}\``);
  }
}
