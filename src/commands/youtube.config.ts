import { Message } from "discord.js";
import { Command } from "./common.commands.config";
import { google } from "googleapis";
import config from "../config";

export class youtubeCommand extends Command {
  constructor(commandName: string) {
    super(commandName);
  }

  action(message: Message, args: string[]) {
    let search = args.slice(1).join(" ");

    if (!search.length) {
      message.channel.send("I can't search nothing");
      return;
    }

    google
      .youtube("v3")
      .search.list({
        key: config.youtubeApiKey,
        type: ["video", "channel"],
        part: ["snippet"],
        q: search,
        maxResults: 1,
      })
      .then((res) => {
        let result = res.data.items?.[0];

        if (result?.id?.videoId) {
          message.channel.send(
            `https://www.youtube.com/watch?v=${result.id.videoId}`
          );
        } else if (result?.id?.channelId) {
          message.channel.send(
            `https://www.youtube.com/channel/${result.id.channelId}`
          );
        } else {
          message.channel.send(`No results found`);
        }
      })
      .catch(console.error);
  }

  help() {
    return ["Search youtube", "Usage: $youtube <query>"];
  }
}
