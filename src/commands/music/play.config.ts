import Command from "../../utils/common.commands.config";
import {
  ChatInputCommandInteraction,
  GuildMember,
  TextChannel,
} from "discord.js";
import { distube } from "../../index";

export default class playCommand extends Command {
  constructor() {
    super("play", "Add a song to the queue");

    this.addStringOption((option) =>
      option
        .setName("song")
        .setDescription("The song you want to play")
        .setRequired(true)
    );
  }

  async action(interaction: ChatInputCommandInteraction): Promise<void> {
    await interaction.deferReply();
    // generate query from args
    const query = interaction.options.getString("song", true);

    const voiceChannel = (interaction.member as GuildMember)?.voice.channel;

    if (!voiceChannel) {
      interaction.editReply("Join a voice channel.");
      return;
    }

    distube
      .play(voiceChannel, query, {
        member: interaction.member as GuildMember,
        textChannel: interaction.channel as TextChannel,
      })
      .catch(console.error);

    interaction.deleteReply();
  }
}
