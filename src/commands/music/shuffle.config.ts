import { Message } from "discord.js";
import { distube } from "../../index";
import { Command } from "../common.commands.config";

export class shuffleCommand extends Command {
  constructor() {
    super("shuffle", ["shuffle the queue", "Usage: $shuffle"]);
  }

  action(message: Message) {
    try {
      distube.shuffle(message);
    } catch (error) {
      console.error(error);
      message.channel.send("`Error shuffling queue`");
    }

    message.channel.send("`Shuffled Queue`");
  }
}
