import { Command } from "../common.commands.config";
import { distube } from "../../index";
import { Message } from "discord.js";

export class pauseCommand extends Command {
  constructor(commandName: string, help: string[]) {
    super(commandName, help);
  }

  action(message: Message) {
    try {
      distube.pause(message);
    } catch (error) {
      message.channel.send("Error pausing song");
      return;
    }

    message.channel.send("Paused song");
  }
}
