import { Message, MessageEmbed } from "discord.js";
import config from "../../config";
import { distube } from "../../index";
import { Command } from "../common.commands.config";

export class queueCommand extends Command {
  constructor() {
    super("queue", [`Get's the song queue`, "Usage: $queue"]);
  }

  action(message: Message) {
    let queue = distube.getQueue(message);

    if (!queue?.songs.length) {
      message.channel.send("`The queue is empty`");
      return;
    }

    let response = new MessageEmbed();

    let songs = [...queue.songs];

    let nowPlaying = songs.shift()!;

    let description = `Now playing:\n[${nowPlaying.name}](${nowPlaying.url}) - \`${nowPlaying.formattedDuration}\` - \`sent by ${nowPlaying.user.tag}\`\n\n`;

    if (songs.length) {
      description += "Up next:\n";

      let i = 1;
      for (let song of songs) {
        description += `\t${i++}.\t[${song.name}](${song.url}) - \`${
          song.formattedDuration
        }\` - \`sent by ${song.user.tag}\`\n`;
      }
    }

    response
      .setColor(config.mainColor)
      .setTitle("Queue")
      .setThumbnail(nowPlaying.thumbnail!)
      .setDescription(description)
      .setFooter(`Total duration: ${queue.formattedDuration}`);
    message.channel.send(response);
  }
}
