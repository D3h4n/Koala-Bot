import { Message, MessageEmbed } from 'discord.js';
import Command from '../common.commands.config';
import config from '../../config';

export default class coinFlipCommand extends Command {
  constructor() {
    super('coinflip', [
      'Flip one or more coins',
      'Usage:',
      '$coinflip',
      '$coinflip <number>',
      '$coinflip <success> <failure>',
      '$coinflip <success> <failure> <number>',
    ]);
  }

  action(message: Message, args: string[]) {
    // set default values
    let flips: string[] = [];
    let times = 1;
    let success = 'Heads';
    let failure = 'Tails';

    // check for 1 arg
    if (args.length === 2) {
      times = parseInt(args[1]);
    }

    // check for more than 1 arg
    else if (args.length > 2) {
      success = args[1];
      failure = args[2];
      times = Number(args[3]) || 1;
    }

    if (Number.isNaN(times))
      return message.channel.send('`Argument must be a number`');

    if (times < 1)
      return message.channel.send('`The number of flips is too small`');

    times = Math.min(times, config.maxRandomNumbers);

    for (let i = 0; i < times; i++) {
      if (Math.round(Math.random())) {
        flips.push(success);
      } else {
        flips.push(failure);
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

    if (flips[0].match(/<@!\d+>/)) return message.channel.send(flips[0]);

    return message.channel.send(`\`${flips[0]}\``);
  }
}
