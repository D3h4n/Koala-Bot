import { Message } from 'discord.js';
import Command from '../common.commands.config';

export default class chooseCommand extends Command {
  constructor() {
    super(
      'Choose',
      'choose',
      ['Usage:', '$choose <option 1> <option2> ... <option n>'],
      ['ch']
    );
  }

  action(message: Message, args: string[]) {
    // check if there are any args
    if (args.length === 1) {
      return message.channel.send('`There is nothing to choose!`');
    }

    // generate random result
    let result = args[Math.floor(Math.random() * (args.length - 1)) + 1];

    // return if result is a mention
    if (result.match(/<@!\d+>/)) return message.channel.send(result);

    // return result
    return message.channel.send(`\`${result}\``);
  }
}
