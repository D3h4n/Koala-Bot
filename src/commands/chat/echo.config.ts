import { Message } from "discord.js";
import { Command } from "../common.commands.config";

export class echoCommand extends Command {
  constructor(commandName: string, help: string[]) {
    super(commandName, help);
  }

  action(message: Message, args: string[]) {
    let response: string;

    args.shift();

    response = args?.join(" ");

    message.delete({ timeout: 100 });

    if (response) {
      message.channel.send(response);
      return;
    }

    message.channel.send("I have nothing to say.");
  }
}
