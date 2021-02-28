import { Message } from "discord.js";

export abstract class Command {
  commandName: string;
  help: string[];

  constructor(commandName: string, help: string[]) {
    this.commandName = commandName;
    this.help = help;
  }

  checkForCommand(commandName: string) {
    return commandName === this.commandName;
  }

  abstract action(message: Message, args: string[]): void;
}
