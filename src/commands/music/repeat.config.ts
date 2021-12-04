import { Message } from 'discord.js';
import { distube } from '../../index';
import Command from '../common.commands.config';

export default class repeatCommand extends Command {
  constructor() {
    super('Repeat', 'repeat', [
      'Repeat the currently playing song or stop repeating',
      'Usage: $repeat',
    ]);
  }

  action(message: Message) {
    // get playing song
    const queue = distube.getQueue(message);
    const nowPlaying = queue?.songs?.[0];

    // assert song exists
    if (!nowPlaying) {
      return message.channel.send('`Error repeating song`');
    }

    // if queue is already repeating, stop it
    if (queue.repeatMode === 1) {
      distube.setRepeatMode(message, 0);
      return message.channel.send(`\`Stopped repeating ${nowPlaying.name}\``);
    }

    // if queue isn't repeating stop it
    distube.setRepeatMode(message, 1);
    return message.channel.send(`\`Repeating ${nowPlaying.name}\``);
  }
}
