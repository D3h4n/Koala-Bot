import { Message } from "discord.js";
import { Command } from "../common.commands.config";

export class insultCommand extends Command {
  insults: Array<(user: string) => string>;

  constructor(commandName: string, help: string[]) {
    super(commandName, help);
    this.insults = [this.yuhMudda, this.yuhBot];
  }

  yuhBot(user: string) {
    return `Yuh Bot 🤖 ${user}`;
  }

  yuhMudda(user: string): string {
    return `Yuh mudda ${user}`;
  }

  action(message: Message) {
    let user =
      message.mentions.users.first()?.toString() ?? message.author.toString();

    let insult = this.insults[Math.floor(Math.random() * this.insults.length)](
      user
    );

    return message.channel.send(insult);
  }
}
