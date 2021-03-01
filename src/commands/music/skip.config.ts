import { Message } from "discord.js";
import { distube } from "../../index";
import { Command } from "../common.commands.config";

export class skipCommand extends Command {
  constructor() {
    super("skip", ["Skip the current song", "Usage: $skip"]);
  }

  action(message: Message) {
    try {
      distube.skip(message);
    } catch (error) {
      message.channel.send("`Unable to skip song`");
      return;
    }

    message.channel.send("`Skipped song`");
  }
}
