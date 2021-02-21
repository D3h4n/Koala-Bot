import { Message } from "discord.js";

export abstract class Command {
  commandName: string;

  constructor(commandName: string) {
    this.commandName = commandName;
  }

  checkForCommand(commandName: string) {
    return commandName === this.commandName;
  }

  abstract action(message: Message, args: string[]): void;

  abstract help(): string[];
}
