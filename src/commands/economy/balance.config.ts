import { Message, MessageEmbed } from 'discord.js';
import userRecord from '../../models/user.model';
import Command from '../common.commands.config';

export default class balanceCommand extends Command {
  constructor() {
    super('balance', ['check your balance', 'usage: $balance']);
  }

  async action({ author, member, channel }: Message) {
    const userId = author.id;

    let user = await userRecord.findOne({ id: userId }); // get user record

    // if the user doesn't exist
    if (!user) {
      user = new userRecord({ id: userId, balance: 0 });
      user.save();
    }

    const response = new MessageEmbed();

    response
      .setAuthor(member?.displayName, author.displayAvatarURL())
      .setDescription(`Balance: $${user.balance}`);

    channel.send(response);
  }
}
