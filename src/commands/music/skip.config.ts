import { Message } from "discord.js";
import { distube } from "src";
import { Command } from "../common.commands.config";

export class skipCommand extends Command {
  constructor(commandName: string) {
    super(commandName);
  }

  action(message: Message) {
    try {
      distube.skip(message);
    } catch (error) {
      message.channel.send("Unable to skip song");
      return;
    }

    message.channel.send("Skipped song");
  }

  help() {
    return ["Skip the current song", "Usage: $skip"];
  }
}
