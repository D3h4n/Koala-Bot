import { Message } from 'discord.js';
import Command from '../common.commands.config';

export default class coinFlipCommand extends Command {
  constructor() {
    super('coinflip', [
      'Flip one or more coins',
      'Usage: $coinflip or $coinflip <number>',
    ]);
  }

  action(message: Message, args: string[]) {
    let times = 1;
    let response: string[] = [];

    if (args.length > 1) {
      times = parseInt(args[1]);

      if (isNaN(times))
        return message.channel.send('`Argument must be a number`');

      times = times > 20 ? 20 : times;
    }

    for (let i = 0; i < times; i++) {
      if (Math.round(Math.random())) {
        response.push('`Heads`');
      } else {
        response.push('`Tails`');
      }
    }

    message.channel.send(response);
    return;
  }
}
