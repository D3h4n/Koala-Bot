import { Message } from 'discord.js';
import Command from '../common.commands.config';

export default class chooseCommand extends Command {
  constructor() {
    super('choose', ['Usage:', '$choose <option 1> <option2> ...']);
  }

  action(message: Message, args: string[]) {
    args.shift();

    let index = Math.floor(Math.random() * args.length);

    let result = args[index];

    if (result.match(/<@!\d+>/)) return message.channel.send(result);

    return message.channel.send(`\`${result}\``);
  }
}
