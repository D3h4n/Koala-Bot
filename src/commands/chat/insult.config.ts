import { Message } from 'discord.js';
import Command from '../common.commands.config';

export default class insultCommand extends Command {
  insults: Array<string>;

  constructor() {
    super('insult', [
      'Insult someone or yourself',
      'Usage: $insult or $insult @friend',
    ]);
    this.insults = ['Yuh Bot 🤖 ', 'Yuh mudda '];
  }

  action(message: Message) {
    let user =
      message.mentions.users.first()?.toString() ?? message.author.toString();

    let insult =
      this.insults[Math.floor(Math.random() * this.insults.length)] + user;

    return message.channel.send(insult);
  }
}
