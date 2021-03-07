import { Message } from 'discord.js';
import Command from '../common.commands.config';

export default class helloCommand extends Command {
  greetings: string[];

  constructor() {
    super('hello', ['Greet someone', 'Usage: $hello or $hello @friend']);

    this.greetings = [
      'Hi',
      'Hello',
      'Howdy',
      'Mudda',
      'Bonjour',
      'Salut',
      'Sup',
      'Greetings',
    ];
  }

  action(message: Message, _: string[]) {
    // get a random greeting from greetings array
    let greeting = this.greetings[
      Math.floor(Math.random() * this.greetings.length)
    ];

    // greet user that called command
    message.channel.send(`${greeting} ${message.author.toString()}`);
    return;
  }
}
