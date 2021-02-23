import { Message } from "discord.js";
import { Command } from "./common.commands.config";
import commands from "./index.commands.setup";

export class helpCommand extends Command {
  constructor(commandName: string) {
    super(commandName);
  }

  action(message: Message, args: string[]) {
    if (args.length === 1) {
      commands().get("commands")!.action(message, args);
      return;
    }

    if (commands().has(args[1])) {
      let helpMsg = commands().get(args[1])!.help();
      message.channel.send(helpMsg);
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
