import { Message } from "discord.js";
import { Command } from "../common.commands.config";
import { distube } from "../../index";

export class playCommand extends Command {
  constructor(commandName: string, help: string[]) {
    super(commandName, help);
  }

  async action(message: Message, args: string[]) {
    let query = args.slice(1).join(" ");

    if (!query) {
      try {
        distube.resume(message);
      } catch (err) {
        message.channel.send("Error resuming song");
        return;
      }

      message.channel.send("Resuming song");
      return;
    }

    distube.play(message, query);
  }
}
