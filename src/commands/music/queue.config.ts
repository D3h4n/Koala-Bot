import { Message } from "discord.js";
import { distube } from "../../index";
import { Command } from "../common.commands.config";

export class queueCommand extends Command {
  constructor(commandName: string) {
    super(commandName);
  }

  action(message: Message) {
    try {
      const queue = distube.getQueue(message);

      if (!queue.songs?.length) {
        message.channel.send("Queue is empty");
        return;
      }

      message.channel.send(
        "Queue:\n" +
          queue.songs.map(
            (song, idx) =>
              `${idx + 1}. ${song.name} - ${song.formattedDuration}\n`
          )
      );
    } catch (error) {
      message.channel.send("Error getting queue");
      return;
    }
  }

  help() {
    return [`Get's the song queue`, "Usage: $queue"];
  }
}
