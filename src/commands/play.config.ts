import { Message } from "discord.js";
import { Command } from "./common.commands.config";
import { distube } from "../index";

export class playCommand extends Command {
  constructor(commandName: string) {
    super(commandName);
  }

  async action(message: Message, args: string[]) {
    let query = args.slice(1).join(" ");

    if (!query) {
      message.channel.send("Gimme something to play");
      return;
    }

    distube.play(message, query);
  }

  help() {
    return ["Play music", "$play <song>"];
  }
}
