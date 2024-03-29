import Command from "../../utils/common.commands.config";
import { SearchResult, SearchResultType, Song } from "distube";
import {
  ChatInputCommandInteraction,
  GuildMember,
  TextChannel,
} from "discord.js";
import { distube } from "../../index";

export default class PlayTopCommand extends Command {
  constructor() {
    super("playtop", "Add song to the top of the queue");

    this.addStringOption((option) =>
      option.setName("song").setDescription("Song to add").setRequired(true)
    );
  }

  async action(interaction: ChatInputCommandInteraction): Promise<void> {
    await interaction.deferReply();
    // get query
    const query = interaction.options.getString("song", true);

    // assert query is not a playlist
    if (query.includes("https://youtube.com/playlist")) {
      interaction.editReply("`Use the play command for playlists`");
      return;
    }

    // get queue
    const queue = distube.getQueue(interaction);

    // if there is no queue play song regularly
    if (!queue?.songs?.length) {
      const voiceChannel = (interaction.member as GuildMember)?.voice
        .channel;

      if (!voiceChannel) {
        interaction.editReply("Join a voice channel.");
        return;
      }

      distube.play(voiceChannel, query, {
        member: interaction.member as GuildMember,
        textChannel: interaction.channel as TextChannel,
      });
      interaction.deleteReply();
      return;
    }

    // if there is a queue

    // generate a search result based on query
    let result: SearchResult;

    try {
      [result] = await distube.search(query, {
        safeSearch: true,
        limit: 1,
        type: SearchResultType.VIDEO,
      });
    } catch (error) {
      interaction.editReply("`Could not find that song`");
      console.error(error);
      return;
    }

    const song = new Song(result, {
      member: interaction.member as GuildMember,
    });

    // add song to the beginning of the queue
    queue.addToQueue(song, 1);

    // emit add song event
    distube.emit("addSong", queue, song);
    interaction.deleteReply();
  }
}
