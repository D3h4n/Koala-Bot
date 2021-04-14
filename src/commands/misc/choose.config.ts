import { Message } from 'discord.js';
import Command from '../common.commands.config';

export default class chooseCommand extends Command {
  constructor() {
    super('choose', ['Usage:', '$choose <option 1> <option2> ... <option n>']);
  }

  action(message: Message, args: string[]) {
    let result = args[Math.floor(Math.random() * (args.length - 1)) + 1];

    if (result.match(/<@!\d+>/)) return message.channel.send(result);

    return message.channel.send(`\`${result}\``);
  }
}
