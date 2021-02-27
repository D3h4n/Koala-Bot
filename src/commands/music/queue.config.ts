import { Message, MessageEmbed } from "discord.js";
import { distube } from "../../index";
import { Command } from "../common.commands.config";

export class queueCommand extends Command {
  constructor(commandName: string, help: string[]) {
    super(commandName, help);
  }

  action(message: Message) {
    try {
      const queue = distube.getQueue(message);

      let response = new MessageEmbed({
        title: "Queue",
        description:
          queue.songs
            .map(
              (song, idx) =>
                `${idx + 1}. ${song.name}  ${song.formattedDuration}`
            )
            .reduce((res, song) => res + "\n" + song) + "\n",
      });

      message.channel.send(response);
    } catch (error) {
      message.channel.send("`The queue is empty`");
      return;
    }
  }
}
