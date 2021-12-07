import { CommandInteraction, GuildMember, MessageEmbed } from 'discord.js';
import economyServices from '../../services/economy.services';
import Command from '../../utils/common.commands.config';

export default class balanceCommand extends Command {
  constructor() {
    super('balance', 'check your balance');
  }

  async action(interaction: CommandInteraction) {
    // get user or create new user if doesn't exist
    const user =
      (await economyServices.getUserByDiscord(interaction.user.id)) ??
      (await economyServices.createUser(
        interaction.user.id,
        interaction.user.username
      ));

    // create response with balance
    const response = new MessageEmbed();

    response
      .setAuthor(
        (interaction.member as GuildMember)?.displayName!,
        interaction.user.displayAvatarURL()
      )
      .setDescription(`**Balance:** $${user.balance}`);

    // send response
    interaction.reply({
      embeds: [response],
    });
  }
}
