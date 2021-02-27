import { Message } from "discord.js";
import { Command } from "../common.commands.config";
import commands from "../index.commands.setup";

export class helpCommand extends Command {
  constructor(commandName: string) {
    super(commandName);
  }

  listCommands() {
    let response: string[] = [];

    commands().forEach((command) => {
      response.push(`**${command.commandName}**`);
      command.help().forEach((helpMsg) => response.push(helpMsg));
      response.push(" ");
    });

    return response;
  }

  action(message: Message, args: string[]) {
    if (args.length === 1) {
      message.channel.send(this.listCommands());
      return;
    }

    if (commands().has(args[1])) {
      message.channel.send(commands().get(args[1])!.help());
      return;
    }

    message.channel.send("That command was not found");
  }

  help() {
    return [
      "Get information about a command",
      "Usage: $help or $help <command>",
    ];
  }
}
