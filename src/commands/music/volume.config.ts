import Command from "../../utils/common.commands.config";
import { ChatInputCommandInteraction } from "discord.js";
import { distube } from "../../index";

export default class volumeCommand extends Command {
  constructor() {
    super("volume", "Set the volume of the bot");

    this.addNumberOption((option) =>
      option.setName("volume").setDescription("The volume").setRequired(true)
    );
  }

  action(interaction: ChatInputCommandInteraction): void {
    // get volume value
    const volume = interaction.options.getNumber("volume", true);

    // set volume
    try {
      distube.setVolume(interaction, volume);
    } catch (error) {
      interaction.reply("`Error setting volume`");
      return;
    }

    // send response
    interaction.reply(`\`Volume set to ${volume}\``);
  }
}
