import { Message } from "discord.js";
import { distube } from "../../index";
import { Command } from "../common.commands.config";

export class stopCommand extends Command {
  constructor(commandName: string) {
    super(commandName);
  }

  action(message: Message) {
    try {
      distube.stop(message);
    } catch (error) {
      message.channel.send("`Error stopping queue`");
      return;
    }

    message.channel.send("`Queue stopped`");
  }

  help() {
    return ["Stop the queue", "Usage: $stop"];
  }
}
