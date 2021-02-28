import { Message } from "discord.js";
import { Command } from "../common.commands.config";

export class joinCommand extends Command {
  constructor(commandName: string, help: string[]) {
    super(commandName, help);
  }

  action(message: Message) {
    const { voice } = message.member!;

    if (!voice.channel?.join()) {
      message.channel.send("`Join a voice channel first`");
      return;
    }
  }
}
