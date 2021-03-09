import { Message } from 'discord.js';
import { distube } from '../../index';
import Command from '../common.commands.config';

export default class repeatCommand extends Command {
  isRepeating: boolean;

  constructor() {
    super('repeat', [
      'Repeat the currently playing song or stop repeating',
      'Usage: $repeat',
    ]);

    this.isRepeating = false;
  }

  action(message: Message) {
    let nowPlaying = distube.getQueue(message)?.songs?.[0];

    if (!nowPlaying) {
      return message.channel.send('`Error repeating song`');
    }

    if (this.isRepeating) {
      distube.setRepeatMode(message, 0);

      this.isRepeating = false;
      return message.channel.send(`\`Stopped repeating ${nowPlaying.name}\``);
    }

    distube.setRepeatMode(message, 1);

    this.isRepeating = true;
    return message.channel.send(`\`Repeating ${nowPlaying.name}\``);
  }
}
