import { Message } from 'discord.js';

export default abstract class Command {
  commandTitle: string;
  commandName: string;
  help: string[];
  aliases: string[] | undefined;

  constructor(
    commandTitle: string,
    commandName: string,
    help: string[],
    aliases?: string[]
  ) {
    this.commandTitle = commandTitle;
    this.commandName = commandName;
    this.help = help;
    this.aliases = aliases;
  }

  abstract action(message: Message, args: string[]): void;
}
