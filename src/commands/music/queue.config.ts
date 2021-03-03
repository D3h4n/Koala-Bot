import {
  CollectorFilter,
  Message,
  MessageEmbed,
  MessageReaction,
  User,
} from "discord.js";
import Queue from "distube/typings/Queue";
import Song from "distube/typings/Song";
import config from "../../config";
import { client, distube } from "../../index";
import { Command } from "../common.commands.config";

export class queueCommand extends Command {
  timeLimit: number;

  constructor() {
    super("queue", [`Get's the song queue`, "Usage: $queue"]);

    this.timeLimit = config.queueTimeLimit;
  }

  async action(message: Message) {
    let queue = distube.getQueue(message);

    if (!queue?.songs.length) {
      message.channel.send("`The queue is empty`");
      return;
    }

    try {
      let pageNumber = 1;

      let sentMsg = await message.channel.send(
        this.generateResponse(queue, pageNumber)
      );

      sentMsg
        .react("◀")
        .then(() => sentMsg.react("▶"))
        .catch(console.error);

      let filter: CollectorFilter = (reaction: MessageReaction, user: User) =>
        ["◀", "▶"].includes(reaction.emoji.name) &&
        user.id !== client.user?.id &&
        !user.bot;

      let collector = sentMsg.createReactionCollector(filter, {
        time: this.timeLimit,
      });

      collector
        .on("collect", (reaction, user) => {
          pageNumber = this.changePage(
            sentMsg,
            reaction,
            user,
            queue,
            pageNumber
          );
        })
        .on("end", () => {
          sentMsg.reactions.removeAll();
        });
    } catch (error) {
      console.error(error);
    }
  }

  generateResponse(queue: Queue, pageNumber: number): MessageEmbed {
    let songs = queue.songs;
    let response = new MessageEmbed();

    let numPages = Math.ceil(songs.length / config.queuePageLength);

    let startIndex = (pageNumber - 1) * config.queuePageLength;

    if (startIndex > songs.length) {
      startIndex = 0;
    }

    let endIndex = Math.min(startIndex + config.queuePageLength, songs.length);

    let nowPlaying = songs[0];

    let description = [
      `__Now Playing:__`,
      `[${nowPlaying.name}](${nowPlaying.url}) - ${nowPlaying.formattedDuration} - \`${nowPlaying.user.tag}\`\n`,
    ];

    if (songs.length) {
      description.push("__Up Next:__");
      songs
        .slice(startIndex || 1, endIndex)
        .forEach((song, idx) =>
          description.push(
            this.generateSongDescription(song, (startIndex || 1) + idx)
          )
        );
    }

    response
      .setTitle("Queue")
      .setColor(config.mainColor)
      .setThumbnail(nowPlaying.thumbnail!)
      .setFooter(
        `Page: ${pageNumber}/${numPages}` +
          "\u2800".repeat(20) +
          `${songs.length} songs in Queue | Total Length: ${queue.formattedDuration}`
      )
      .setDescription(description);

    return response;
  }

  generateSongDescription = (song: Song, index: number) =>
    `${index}. [${song.name}](${song.url}) - ${song.formattedDuration} - \`${song.user.tag}\``;

  changePage(
    message: Message,
    reaction: MessageReaction,
    user: User,
    queue: Queue,
    pageNumber: number
  ) {
    if (reaction.emoji.name === "◀" && pageNumber > 1) {
      // if back arrow generate previous page if there is one
      message.edit(this.generateResponse(queue, --pageNumber));
    } else if (
      reaction.emoji.name === "▶" &&
      pageNumber < Math.ceil(queue.songs.length / config.queuePageLength)
    ) {
      // if forward arrow generate next page if there is one
      message.edit(this.generateResponse(queue, ++pageNumber));
    }

    // remove user reactions
    reaction.users.remove(user.id);

    // return new pageNumber
    return pageNumber;
  }
}
