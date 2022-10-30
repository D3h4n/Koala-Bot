import {
  ChatInputCommandInteraction,
  EmbedBuilder,
  GuildMember,
} from "discord.js";
import config from "../../utils/config";
import economyServices from "../../services/economy.services";
import Command from "../../utils/common.commands.config";

export default class balanceCommand extends Command {
  constructor() {
    super("balance", "check your balance");
  }

  async action(interaction: ChatInputCommandInteraction): Promise<void> {
    // get user or create new user if doesn't exist
    const user =
      (await economyServices.getUserByDiscord(interaction.user.id)) ??
        (await economyServices.createUser(
          interaction.user.id,
          interaction.user.username,
        ));

    // create response with balance
    const response = new EmbedBuilder()
      .setAuthor({
        name: (interaction.member as GuildMember)?.displayName ??
          "No Display Name",
        iconURL: interaction.user.displayAvatarURL(),
      })
      .setColor(config.mainColor)
      .setDescription(`**Balance:** $${user.balance}`);

    // send response
    interaction.reply({
      embeds: [response],
    });
  }
}
