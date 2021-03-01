import { Message } from "discord.js";
import { distube } from "../../index";
import { Command } from "../common.commands.config";

export class volumeCommand extends Command {
  constructor() {
    super("volume", ["Set the volume of the bot", "Usage: $volume <percent>"]);
  }

  action(message: Message, args: string[]) {
    let volume = parseInt(args[1]);

    if (isNaN(volume)) {
      message.channel.send("`Volume must be a number between 0 and 100`");
      return;
    }

    if (volume < 0) volume = 0;

    if (volume > 100) volume = 100;

    try {
      distube.setVolume(message, volume);
    } catch (error) {
      message.channel.send("`Error setting volume`");
      return;
    }

    message.channel.send(`\`Volume set to ${volume}\``);
  }
}
