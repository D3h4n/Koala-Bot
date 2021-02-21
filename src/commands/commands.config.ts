import { Message } from "discord.js";
import { Command } from "./common.commands.config";
import commands from "./index.commands.setup";

export class commandsCommand extends Command {
  constructor(commandName: string) {
    super(commandName);
  }

  action(message: Message, _: string[]) {
    let response: string[] = [];

    commands().forEach((command) => {
      response.push(`**${command.commandName}**`);
      command.help().forEach((helpMsg) => response.push(helpMsg));
      response.push(" ");
    });

    message.channel.send(response);
  }

  help() {
    return ["Gets the list of commands", "Usage: $commands"];
  }
}
