import { Message, MessageEmbed } from 'discord.js';
import Command from '../common.commands.config';
import config from '../../utils/config';

export default class coinFlipCommand extends Command {
  constructor() {
    super('coinflip', [
      'Flip one or more coins',
      'Usage:',
      '$coinflip',
      '$coinflip <number>',
    ]);
  }

  action(message: Message, args: string[]) {
    // set default values
    let flips: string[] = [];
    let times = 1;

    // check for 1 arg
    if (args.length > 1) {
      times = parseInt(args[1]);

      if (Number.isNaN(times))
        return message.channel.send('`Argument must be a number`');

      if (times < 1)
        return message.channel.send('`The number of flips is too small`');

      times = Math.min(times, config.maxRandomNumbers);
    }

    for (let i = 0; i < times; i++) {
      flips.push(Math.round(Math.random()) ? 'Heads' : 'Tails');
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
