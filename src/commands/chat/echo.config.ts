import { ChatInputCommandInteraction } from "discord.js";
import Command from "../../utils/common.commands.config";

export default class echoCommand extends Command {
  constructor() {
    super("echo", "I repeat whatever you want");

    this.addStringOption((option) =>
      option
        .setName("message")
        .setDescription("message to echo")
        .setRequired(true)
    );
  }

  action(interaction: ChatInputCommandInteraction): void {
    // get message content to send
    interaction.reply(
      interaction.options.getString("message") ?? "No message specified",
    );
  }
}
