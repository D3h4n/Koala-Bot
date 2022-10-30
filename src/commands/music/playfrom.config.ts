import {
  ChatInputCommandInteraction,
  GuildMember,
  TextChannel,
} from "discord.js";
import Command from "../../utils/common.commands.config";
import { distube } from "../../index";
import { parseTimeString } from "../../utils/helper_functions.config";

export default class PlayFromCommand extends Command {
  constructor() {
    super("playfrom", "Play a song from a certain time");

    this.addStringOption((option) =>
      option
        .setName("song")
        .setDescription("The song you want to play")
        .setRequired(true)
    );

    this.addStringOption((option) =>
      option
        .setName("time")
        .setDescription("The time to set for the current track (hh:mm:ss)")
        .setRequired(true)
    );
  }

  async action(interaction: ChatInputCommandInteraction): Promise<void> {
    await interaction.deferReply();

    const song = interaction.options.getString("song", true);
    const time = parseTimeString(interaction.options.getString("time", true));

    if (!interaction.guildId) {
      interaction.reply("Error occurred performing this command");
      console.error("Error guild is falsy");
      return;
    }

    const voiceChannel = (interaction.member as GuildMember)?.voice.channel;

    if (!voiceChannel) {
      interaction.editReply("Join a voice channel.");
      return;
    }

    await distube
      .play(voiceChannel, song, {
        member: interaction.member as GuildMember,
        textChannel: interaction.channel as TextChannel,
      })
      .catch(console.error);

    distube.seek(interaction, time);

    interaction.deleteReply();
  }
}
