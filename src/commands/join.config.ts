import { Message } from "discord.js";
import { Command } from "./common.commands.config";

export class joinCommand extends Command {
  constructor(commandName: string) {
    super(commandName);
  }

  action(message: Message) {
    const { voice } = message.member!;

    if (!voice.channel?.join()) {
      message.channel.send("Join a voice channel first");
      return;
    }
  }

  help() {
    return ["Add bot to voice channel", "Usage: $join"];
  }
}
