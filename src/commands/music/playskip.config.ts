import Command from "../../utils/common.commands.config";
import {
  ChatInputCommandInteraction,
  GuildMember,
  TextChannel,
} from "discord.js";
import { distube } from "../../index";
import { SearchResult, SearchResultType, Song } from "distube";

export default class playSkipCommand extends Command {
  constructor() {
    super("playskip", "Immediately play a song");

    this.addStringOption((option) =>
      option
        .setName("song")
        .setDescription("That song you want to play")
        .setRequired(true)
    );
  }

  async action(interaction: ChatInputCommandInteraction): Promise<void> {
    await interaction.deferReply();
    // get query
    const query = interaction.options.getString("song", true);

    // playskip query
    const queue = distube.getQueue(interaction);

    // check if there is a queue
    if (!queue) {
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

    // generate a search result based on query
    let result: SearchResult;

    try {
      [result] = await distube.search(query, {
        safeSearch: true,
        limit: 1,
        type: SearchResultType.VIDEO,
      });
    } catch (error) {
      interaction.reply("`Could not find that song`");
      console.error(error);
      return;
    }

    const song = new Song(result, {
      member: interaction.member as GuildMember,
    });

    queue.addToQueue(song, 1).skip();
    interaction.deleteReply();
  }
}
