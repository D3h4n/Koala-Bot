import { Message } from 'discord.js';
import Command from '../../common.commands.config';

export default class echoCommand extends Command {
  constructor() {
    super('Echo', 'echo', [
      'I repeat whatever you want',
      'Usage: $echo <text>',
    ]);
  }

  action(message: Message, args: string[]) {
    // get message content to send
    let response = args.slice(1).join(' ');

    // delete commmand message
    message.delete({ timeout: 100 });

    // send message content
    message.channel.send(response || 'I have nothing to say.');
  }
}
