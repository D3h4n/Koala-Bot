import { Message, MessageEmbed } from 'discord.js';
import Command from '../common.commands.config';
import config from '../../config';

export default class coinFlipCommand extends Command {
  constructor() {
    super('coinflip', [
      'Flip one or more coins',
      'Usage: $coinflip or $coinflip <number>',
    ]);
  }

  action(message: Message, args: string[]) {
    let times = 1;
    let flips: string[] = [];

    if (args.length > 1) {
      times = parseInt(args[1]);

      if (Number.isNaN(times))
        return message.channel.send('`Argument must be a number`');

      times = times > 20 ? 20 : times;
    }

    for (let i = 0; i < times; i++) {
      if (Math.round(Math.random())) {
        flips.push('Heads');
      } else {
        flips.push('Tails');
      }
    }

    if (times > 1) {
      let response = new MessageEmbed();

      response
        .setTitle('Coin Flips')
        .setAuthor(
          message.member?.displayName,
          message.author.displayAvatarURL()
        )
        .setDescription(['**Results:**', ...flips])
        .setColor(config.mainColor);

      return message.channel.send(response);
    }

    return message.channel.send(`\`${flips[0]}\``);
  }
}
