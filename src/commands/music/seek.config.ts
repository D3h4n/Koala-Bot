import { ChatInputCommandInteraction } from "discord.js";
import Command from "../../utils/common.commands.config";
import { distube } from "../../index";
import {
  parseTimeString,
  timeToString,
} from "../../utils/helper_functions.config";

export default class SeekCommand extends Command {
  constructor() {
    super("seek", "set the position of the current track");

    this.addStringOption((option) =>
      option
        .setName("time")
        .setDescription("The time to set for the current track (hh:mm:ss)")
        .setRequired(true)
    );
  }

  action(interaction: ChatInputCommandInteraction): void {
    const timeString = interaction.options.getString("time", true);
    const time = parseTimeString(timeString);

    if (!interaction.guildId) {
      interaction.reply("Error occurred performing this command");
      console.error("Error guild is falsy");
      return;
    }

    distube.seek(interaction, time);
    interaction.reply(`Playing from \`${timeToString(time)}\``);
  }
}
