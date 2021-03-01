import { Message } from "discord.js";

export abstract class Command {
  commandName: string;
  help: string[];

  constructor(commandName: string, help: string[]) {
    this.commandName = commandName;
    this.help = help;
  }

  abstract action(message: Message, args: string[]): void;
}
