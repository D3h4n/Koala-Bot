import { Message, MessageEmbed } from 'discord.js';
import config from '../../utils/config';
import Command from '../common.commands.config';

export default class rngCommand extends Command {
  constructor() {
    super('RNG', 'rng', [
      'Generate a random number',
      'Usage:',
      '$rng',
      '$rng <max>',
      '$rng <min> <max>',
      '$rng <min> <max> <count>',
    ]);
  }

  action(message: Message, args: string[]) {
    let max: number = 10;
    let min: number = 1;
    let count: number = 1;

    switch (args.length) {
      // no args: default values
      case 1:
        break;

      // one arg: max
      case 2:
        max = Number(args[1]);
        break;

      // two args: min and max
      case 3:
        min = Number(args[1]);
        max = Number(args[2]);
        break;

      // three or more args: min, max and count
      default:
        min = Number(args[1]);
        max = Number(args[2]);
        count = Number(args[3]);
        break;
    }

    // Error handling for input
    // assert min is valid
    if (Number.isNaN(min)) {
      return message.channel.send(`${args[1]} is not a number!!`);
    }

    // assert max is valid
    if (Number.isNaN(max)) {
      return message.channel.send(`${args[2]} is not a number!!`);
    }

    // assert count is valid
    if (Number.isNaN(count)) {
      return message.channel.send(`${args[3]} is not a number!!`);
    }

    // swap min and max if min is larger than max
    if (min > max) {
      let temp = min;
      min = max;
      max = temp;
    }

    // assert count is greater than 0
    if (count < 1) {
      return message.channel.send('`Count is too small`');
    }

    // assert count is less than maxRandomNumbers
    if (count > config.maxRandomNumbers) {
      return message.channel.send('`Count is too big`');
    }

    // generate array of random numbers
    let numbers: number[] = [];

    for (let i = 0; i < count; i++) {
      numbers.push(Math.floor(Math.random() * (max - min + 1)) + min);
    }

    if (count > 1) {
      // create embedded message response for more than 1 number
      let response = new MessageEmbed();

      response
        .setTitle('Random Numbers')
        .setAuthor(
          message.member?.displayName,
          message.author.displayAvatarURL()
        )
        .setDescription(['**Results:**', ...numbers])
        .setColor(config.mainColor);

      return message.channel.send(response);
    }

    return message.channel.send(`\`${numbers[0]}\``);
  }
}
