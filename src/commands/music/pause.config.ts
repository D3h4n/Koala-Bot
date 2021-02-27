import { Command } from "../common.commands.config";
import { distube } from "../../index";
import { Message } from "discord.js";

export class pauseCommand extends Command {
  constructor(commandName: string) {
    super(commandName);
  }

  action(message: Message) {
    distube.pause(message);

    message.channel.send("Paused song");
  }

  help() {
    return ["Pause song", "Usage: $pause"];
  }
}
