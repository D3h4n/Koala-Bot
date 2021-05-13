import { Message, MessageEmbed } from 'discord.js';
import economyServices from './economy.services';
import Command from '../common.commands.config';

export default class balanceCommand extends Command {
  constructor() {
    super('balance', ['check your balance', 'usage: $balance']);
  }

  async action({ author, member, channel }: Message) {
    const userId = author.id;

    // get user or create new user if doesn't exist
    const user = await economyServices.getUser(userId);
    const response = new MessageEmbed();

    response
      .setAuthor(member?.displayName, author.displayAvatarURL())
      .setDescription(`**Balance:** $${user.balance}`);

    channel.send(response);
  }
}
